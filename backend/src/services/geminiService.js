const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const { executeCode, verifyFact } = require('../utils/tools');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── System Instruction ───────────────────────────────────────────────────────
// Persistent AI persona injected at the model level — not repeated in prompts.
// This is cheaper (fewer tokens per call) and produces more consistent behavior.
const SYSTEM_INSTRUCTION = `Your name is Alex. You are a senior technical recruiter and interview coach with 15+ years of experience at top-tier tech companies including Google, Amazon, and Microsoft. You are professional, specific, and constructive. Your evaluations are data-driven, your feedback is always actionable, and you never give vague or generic responses. When introducing yourself, always use the name Alex — never use placeholders like [Your Name]. You help candidates understand exactly where they stand and what to do next.`;

// ── Chat Model (plain text, no JSON schema) ──────────────────────────────────
// Used exclusively for the conversational interview mode.
// Does NOT use responseMimeType: 'application/json' — responses are natural
// language (questions, follow-ups, feedback prose), not structured data.
// thinkingBudget:0 is still required for gemini-2.5-flash.
const chatModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: SYSTEM_INSTRUCTION,
  generationConfig: {
    thinkingConfig: { thinkingBudget: 0 },
  },
});

const chatModelTools = [
  {
    functionDeclarations: [
      {
        name: "execute_code",
        description: "Executes a snippet of code provided by the candidate in a specific language (e.g., javascript, python) and returns the standard output or compiler errors. Use this autonomously to verify if the candidate's code actually works.",
        parameters: {
          type: "OBJECT",
          properties: {
            language: { type: "STRING", description: "The programming language (e.g., javascript, python)" },
            code: { type: "STRING", description: "The source code to execute" }
          },
          required: ["language", "code"]
        }
      },
      {
        name: "verify_technical_fact",
        description: "Searches Wikipedia to verify a technical fact, concept, or term mentioned by the candidate.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "STRING", description: "The technical term or concept to search for" }
          },
          required: ["query"]
        }
      }
    ]
  }
];

const agenticChatModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: SYSTEM_INSTRUCTION,
  tools: chatModelTools,
  generationConfig: {
    thinkingConfig: { thinkingBudget: 0 },
  },
});

// ── JSON Response Schemas ────────────────────────────────────────────────────
// Structured output schemas enforce the exact JSON shape at the API level.
// This replaces the fragile parseGeminiJSON() regex approach — the model
// is now contractually required to return valid, schema-conformant JSON.

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    matchScore: { type: 'number', description: 'Overall match percentage between 0 and 100' },
    summary:    { type: 'string', description: 'Brief 2-3 sentence summary of candidate fit' },
    verdict:    { type: 'string', enum: ['Strong Match', 'Good Match', 'Partial Match', 'Weak Match'] },
    strengths:  { type: 'array', items: { type: 'string' } },
    gaps:       { type: 'array', items: { type: 'string' } },
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type:     { type: 'string', description: 'Category of the suggestion (e.g. Skills, Experience, Format)' },
          original: { type: 'string', description: 'Current resume text that should be improved' },
          improved: { type: 'string', description: 'Suggested replacement text' },
        },
        required: ['type', 'original', 'improved'],
      },
    },
    keywords: {
      type: 'object',
      properties: {
        matched: { type: 'array', items: { type: 'string' } },
        missing: { type: 'array', items: { type: 'string' } },
      },
      required: ['matched', 'missing'],
    },
  },
  required: ['matchScore', 'summary', 'verdict', 'strengths', 'gaps', 'suggestions', 'keywords'],
};

const QUESTIONS_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id:               { type: 'string' },
          question:         { type: 'string' },
          type:             { type: 'string', enum: ['Technical', 'Behavioral', 'Situational', 'HR'] },
          difficulty:       { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
          category:         { type: 'string', description: 'Specific topic area (e.g. React Hooks, System Design, Conflict Resolution)' },
          hints:            { type: 'array', items: { type: 'string' } },
          idealAnswerPoints: { type: 'array', items: { type: 'string' } },
        },
        required: ['id', 'question', 'type', 'difficulty', 'category', 'hints', 'idealAnswerPoints'],
      },
    },
  },
  required: ['questions'],
};

const EVALUATION_SCHEMA = {
  type: 'object',
  properties: {
    score:        { type: 'number', description: 'Score from 0 to 10' },
    feedback:     { type: 'string', description: 'Detailed paragraph referencing the candidate\'s actual words' },
    strengths:    { type: 'array', items: { type: 'string' } },
    improvements: { type: 'array', items: { type: 'string' } },
    betterAnswer: { type: 'string', description: 'A model answer that would score 10/10' },
  },
  required: ['score', 'feedback', 'strengths', 'improvements', 'betterAnswer'],
};

const COVER_LETTER_SCHEMA = {
  type: 'object',
  properties: {
    subject:     { type: 'string', description: 'Compelling email subject line' },
    coverLetter: { type: 'string', description: 'Full professional cover letter, 3-4 paragraphs' },
  },
  required: ['subject', 'coverLetter'],
};

// ── Model Factory ────────────────────────────────────────────────────────────
// Creates a model instance configured for a specific output schema.
// Every model gets: system instruction + JSON mode + the relevant schema.
// thinkingBudget:0 is preserved — required for gemini-2.5-flash to avoid
// "thinking-only" responses where .text() would throw.
function getModel(schema) {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
}

// ── Safety & Response Guard ──────────────────────────────────────────────────
// Checks for blocked/empty responses before calling .text().
// Kept from the original implementation — this is the right pattern.
function extractText(result) {
  const candidate = result.response.candidates?.[0];
  const finishReason = candidate?.finishReason;

  if (!candidate || finishReason === 'SAFETY' || finishReason === 'OTHER') {
    console.error('[Gemini] Response blocked. finishReason:', finishReason);
    console.error('[Gemini] Safety ratings:', JSON.stringify(candidate?.safetyRatings));
    throw new Error(`Gemini blocked the response (finishReason: ${finishReason || 'NO_CANDIDATE'})`);
  }

  return result.response.text();
}

// ── 1. Analyze Resume Against Job Description ────────────────────────────────
async function analyzeResumeAndJD(resumeText, jobDescription) {
  try {
    const model = getModel(ANALYSIS_SCHEMA);

    const prompt = `Analyze the following resume against the job description and provide a thorough assessment.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide:
- A precise match score (0–100) based on skills, experience, and keyword overlap
- A concise summary of the candidate's overall fit
- A verdict label
- 3–5 specific strengths with evidence from the resume
- 3–5 skill or experience gaps relative to the JD
- Concrete resume improvement suggestions (reference actual resume text, give improved rewrites)
- Keyword analysis: which JD keywords appear in the resume and which are missing`;

    const result = await model.generateContent(prompt);
    return JSON.parse(extractText(result));
  } catch (error) {
    throw new Error(`Resume analysis failed: ${error.message}`);
  }
}

// ── 2. Generate Interview Questions ─────────────────────────────────────────
async function generateInterviewQuestions(resumeText, jobDescription, numQuestions = 10) {
  try {
    const model = getModel(QUESTIONS_SCHEMA);
    const ids = Array.from({ length: numQuestions }, () => uuidv4());

    const prompt = `Based on the resume and job description below, generate exactly ${numQuestions} diverse, role-specific interview questions.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Requirements:
- Mix question types: Technical, Behavioral, Situational, and HR
- Mix difficulty levels: Easy, Medium, Hard
- Questions must be specific to the candidate's background and the JD — no generic questions
- Each question needs 2–3 hints and 3–4 ideal answer key points
- Assign IDs in this exact order: ${ids.join(', ')}`;

    const result = await model.generateContent(prompt);
    return JSON.parse(extractText(result));
  } catch (error) {
    throw new Error(`Question generation failed: ${error.message}`);
  }
}

// ── 3. Evaluate a Single Answer ──────────────────────────────────────────────
async function evaluateAnswer(question, userAnswer, idealPoints) {
  try {
    const model = getModel(EVALUATION_SCHEMA);

    console.log('[geminiService] Calling Gemini for evaluation...');

    const prompt = `Evaluate the candidate's answer to the following interview question.

QUESTION: ${question}

IDEAL ANSWER POINTS:
${idealPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

CANDIDATE'S ANSWER:
${userAnswer}

Scoring guide:
- 9–10: Covers all ideal points with depth and clarity
- 7–8: Covers most points, minor gaps
- 5–6: Covers some points, noticeable gaps
- 3–4: Partially relevant, significant gaps
- 0–2: Mostly irrelevant or incorrect

Reference the candidate's actual words in your feedback. Improvements must be specific and actionable. The betterAnswer should be a complete, exemplary response.`;

    const result = await model.generateContent(prompt);
    console.log('[geminiService] Evaluation complete.');
    return JSON.parse(extractText(result));
  } catch (error) {
    console.error('[geminiService] ❌ evaluateAnswer failed:', error.message);
    throw error; // re-throw original — preserves full message for controller log
  }
}

// ── 4. Generate a Cover Letter ───────────────────────────────────────────────
async function generateCoverLetter(resumeText, jobDescription, companyName, jobTitle) {
  try {
    const model = getModel(COVER_LETTER_SCHEMA);

    const prompt = `Write a professional, highly tailored cover letter for this job application.

CANDIDATE'S RESUME:
${resumeText}

JOB TITLE: ${jobTitle}
COMPANY: ${companyName}

JOB DESCRIPTION:
${jobDescription}

Structure:
1. Opening paragraph: Hook with a specific, genuine reason for interest in ${companyName} and the ${jobTitle} role
2. Body paragraph 1: Map the candidate's strongest, most relevant achievement to the JD's top requirement
3. Body paragraph 2: Address another key requirement with a concrete example from the resume
4. Closing paragraph: Reinforce fit, express enthusiasm, clear call to action

Also generate a compelling, personalized email subject line.`;

    const result = await model.generateContent(prompt);
    return JSON.parse(extractText(result));
  } catch (error) {
    throw new Error(`Cover letter generation failed: ${error.message}`);
  }
}

// ── 5. Start a Conversational Interview Session ─────────────────────────────
/**
 * Called once when the user clicks "Start AI Interview".
 * Primes the chat with the candidate's resume + JD so the AI has full context,
 * then asks the AI to open the interview. Returns the AI's opening message
 * and the initial chatHistory to persist in MongoDB.
 *
 * @param {string} resumeText
 * @param {string} jobDescription
 * @param {string} jobTitle
 * @param {string} companyName
 * @returns {{ reply: string, history: Array }}
 */
async function startInterviewSession(resumeText, jobDescription, jobTitle, companyName) {
  try {
    // The first user message primes the AI with all context.
    // All future messages can be short (just the candidate's answers).
    const contextMessage = `I am about to interview for the role of ${jobTitle} at ${companyName}.

Here is my resume:
${resumeText}

Here is the job description:
${jobDescription}

Please begin the interview. Introduce yourself briefly as Alex, then ask your first question. Rules you must follow:
- Ask exactly one question at a time
- After each of my answers, give brief feedback and a score out of 10, then ask the next question
- Ask between 5 and 7 questions total based on the role complexity
- After your final question has been answered, give an overall assessment with a final composite score
- IMPORTANT: At the very end of your concluding message — after the full assessment — append exactly this tag on its own line: [INTERVIEW_COMPLETE]
- Do NOT append [INTERVIEW_COMPLETE] at any other point, only in your final concluding message`;

    const chat = chatModel.startChat({ history: [] });
    const result = await chat.sendMessage(contextMessage);

    const candidate = result.response.candidates?.[0];
    if (!candidate || candidate.finishReason === 'SAFETY') {
      throw new Error(`Chat blocked (finishReason: ${candidate?.finishReason || 'NO_CANDIDATE'})`);
    }

    const reply = result.response.text();

    // Capture the full history (includes the priming user message + AI reply)
    // This is what we store in MongoDB and reload on the next request.
    const history = await chat.getHistory();

    return { reply, history };
  } catch (error) {
    throw new Error(`Failed to start interview chat: ${error.message}`);
  }
}

// ── 6. Continue a Conversational Interview ───────────────────────────────────
/**
 * Called on every subsequent user message (candidate's answer to a question).
 * Rehydrates the chat from the stored history so the AI remembers all prior
 * context, sends the new message, and returns the updated history to save.
 *
 * @param {Array}  chatHistory  - The history array stored in Session.chatHistory
 * @param {string} userMessage  - The candidate's latest answer
 * @returns {{ reply: string, history: Array, isComplete: boolean }}
 */
async function sendChatMessage(chatHistory, userMessage) {
  try {
    // Rehydrate the chat from MongoDB-stored history.
    // The Gemini SDK accepts the same { role, parts: [{ text }] } format
    // that we defined in our Mongoose chatMessageSchema.
    const chat = chatModel.startChat({ history: chatHistory });
    const result = await chat.sendMessage(userMessage);

    const candidate = result.response.candidates?.[0];
    if (!candidate || candidate.finishReason === 'SAFETY') {
      throw new Error(`Chat blocked (finishReason: ${candidate?.finishReason || 'NO_CANDIDATE'})`);
    }

    const reply = result.response.text();
    const history = await chat.getHistory();

    // Detect interview completion via the structured end signal [INTERVIEW_COMPLETE].
    // The AI is explicitly instructed to append this tag — and only this tag — in its
    // final concluding message. This is deterministic: no false positives from mid-interview
    // phrases, no missed endings from unexpected AI wording.
    const END_SIGNAL = '[INTERVIEW_COMPLETE]';
    const isComplete = reply.includes(END_SIGNAL);

    // Strip the tag from the reply before sending to the frontend so the user
    // never sees the raw signal — they only see the clean assessment text.
    const cleanReply = reply.replace(END_SIGNAL, '').trim();

    return { reply: cleanReply, history, isComplete };
  } catch (error) {
    throw new Error(`Chat message failed: ${error.message}`);
  }
}

// ── 7. Continue a Conversational Interview (Streaming) ───────────────────────
/**
 * Same as sendChatMessage, but returns the stream iterable.
 * The caller is responsible for iterating over the chunks.
 *
 * @param {Array}  chatHistory  - The history array stored in Session.chatHistory
 * @param {string} userMessage  - The candidate's latest answer
 * @returns {Promise<{ stream: AsyncGenerator, chat: Object }>}
 */
async function sendChatMessageStream(chatHistory, userMessage) {
  try {
    // Rehydrate the chat from MongoDB-stored history, using the agentic model.
    const chat = agenticChatModel.startChat({ history: chatHistory });
    const result = await chat.sendMessageStream(userMessage);

    return { 
      stream: result.stream, 
      chat,
      handleFunctionCalls: async function* (initialStream) {
        let functionCall = null;

        // Iterate over the initial stream
        for await (const chunk of initialStream) {
          if (chunk.functionCalls && chunk.functionCalls.length > 0) {
            functionCall = chunk.functionCalls[0];
            break; // Stop yielding text, we need to handle the function
          }
          yield { text: chunk.text() };
        }

        if (functionCall) {
          // Yield a tool action so the frontend can display an indicator
          const toolActionText = functionCall.name === 'execute_code' 
            ? 'Running code...' 
            : `Fact-checking ${functionCall.args.query}...`;
            
          yield { toolAction: toolActionText };

          // Execute the tool locally
          let toolResult = {};
          if (functionCall.name === 'execute_code') {
            toolResult = await executeCode(functionCall.args.language, functionCall.args.code);
          } else if (functionCall.name === 'verify_technical_fact') {
            toolResult = await verifyFact(functionCall.args.query);
          }

          // Send the result back to the model to continue the conversation
          const functionResponseResult = await chat.sendMessageStream([{
            functionResponse: {
              name: functionCall.name,
              response: toolResult
            }
          }]);

          // Stream the resulting text
          for await (const chunk of functionResponseResult.stream) {
             if (chunk.text) {
                yield { text: chunk.text() };
             }
          }
        }
      }
    };
  } catch (error) {
    throw new Error(`Chat message stream failed: ${error.message}`);
  }
}

module.exports = {
  analyzeResumeAndJD,
  generateInterviewQuestions,
  evaluateAnswer,
  generateCoverLetter,
  startInterviewSession,
  sendChatMessage,
  sendChatMessageStream,
};
