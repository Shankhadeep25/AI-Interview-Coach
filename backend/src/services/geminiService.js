const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── System Instruction ───────────────────────────────────────────────────────
// Persistent AI persona injected at the model level — not repeated in prompts.
// This is cheaper (fewer tokens per call) and produces more consistent behavior.
const SYSTEM_INSTRUCTION = `You are a senior technical recruiter and interview coach with 15+ years of experience at top-tier tech companies. You are professional, specific, and constructive. Your evaluations are data-driven, your feedback is always actionable, and you never give vague or generic responses. You help candidates understand exactly where they stand and what to do next.`;

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

module.exports = {
  analyzeResumeAndJD,
  generateInterviewQuestions,
  evaluateAnswer,
  generateCoverLetter,
};
