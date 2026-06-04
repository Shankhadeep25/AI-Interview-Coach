const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// gemini-2.5-flash requires thinkingBudget to be set when calling generateContent
// to avoid entering "thinking" mode where .text() throws on thought-only responses
const MODEL_NAME = 'gemini-2.5-flash';
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

/**
 * Wrapper around model.generateContent that always sets thinkingBudget:0
 * (required for gemini-2.5-flash) and checks for safety blocks before .text()
 */
async function callGemini(prompt) {
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
  });

  const candidate = result.response.candidates?.[0];
  const finishReason = candidate?.finishReason;

  if (!candidate || finishReason === 'SAFETY' || finishReason === 'OTHER') {
    console.error('[Gemini] Response blocked. finishReason:', finishReason);
    console.error('[Gemini] Safety ratings:', JSON.stringify(candidate?.safetyRatings));
    throw new Error(`Gemini blocked the response (finishReason: ${finishReason || 'NO_CANDIDATE'})`);
  }

  const text = result.response.text();
  return text;
}

/**
 * Robustly extract and parse JSON from a Gemini response.
 *
 * Handles all observed Gemini response patterns:
 *   1. Clean fenced:    ```json\n{...}\n```
 *   2. Preamble text:   "Here is the result:\n```json\n{...}\n```"
 *   3. Trailing text:   "```json\n{...}\n```\nHope this helps!"
 *   4. No fence at all: "{...}"
 */
function parseGeminiJSON(text) {
  // 1. Try to extract content inside a ```json ... ``` or ``` ... ``` block first
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (_) {
      // fall through to next strategy
    }
  }

  // 2. Fallback: find the outermost { ... } JSON object in the text
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch (_) {
      // fall through to final throw
    }
  }

  // 3. Last resort: try parsing the whole cleaned text as-is
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    console.error('❌ Gemini response could not be parsed as JSON:\n', text.substring(0, 500));
    throw new Error(`Failed to parse Gemini response as JSON: ${e.message}`);
  }
}

/**
 * 1. Analyze resume against job description
 */
async function analyzeResumeAndJD(resumeText, jobDescription) {
  try {
    const prompt = `You are a senior technical recruiter with 15+ years of experience. Analyze the following resume against the job description and provide a detailed assessment.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON (no markdown fences, no extra text) with this exact structure:
{
  "matchScore": <number 0-100>,
  "summary": "<brief summary of the candidate's fit>",
  "verdict": "<one of: Strong Match, Good Match, Partial Match, Weak Match>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "gaps": ["<gap 1>", "<gap 2>", ...],
  "suggestions": [
    { "type": "<category>", "original": "<current resume text>", "improved": "<suggested improvement>" }
  ],
  "keywords": {
    "matched": ["<keyword1>", "<keyword2>"],
    "missing": ["<keyword1>", "<keyword2>"]
  }
}`;

    const responseText = await callGemini(prompt);
    return parseGeminiJSON(responseText);
  } catch (error) {
    throw new Error(`Resume analysis failed: ${error.message}`);
  }
}

/**
 * 2. Generate interview questions
 */
async function generateInterviewQuestions(resumeText, jobDescription, numQuestions = 10) {
  try {
    const prompt = `You are an expert interview coach. Based on the resume and job description below, generate ${numQuestions} diverse interview questions.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON (no markdown fences, no extra text) with this exact structure:
{
  "questions": [
    {
      "id": "<unique uuid>",
      "question": "<the interview question>",
      "type": "<one of: Technical, Behavioral, Situational, HR>",
      "difficulty": "<one of: Easy, Medium, Hard>",
      "category": "<specific topic category>",
      "hints": ["<hint 1>", "<hint 2>"],
      "idealAnswerPoints": ["<key point 1>", "<key point 2>", "<key point 3>"]
    }
  ]
}

Generate exactly ${numQuestions} questions. Use these UUIDs for the id field: ${Array.from({ length: numQuestions }, () => uuidv4()).join(', ')}`;

    const responseText = await callGemini(prompt);
    return parseGeminiJSON(responseText);
  } catch (error) {
    throw new Error(`Question generation failed: ${error.message}`);
  }
}

/**
 * 3. Evaluate a single answer
 */
async function evaluateAnswer(question, userAnswer, idealPoints) {
  try {
    const prompt = `You are an expert interview evaluator. Evaluate the candidate's answer to the following interview question.

QUESTION: ${question}

IDEAL ANSWER POINTS:
${idealPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

CANDIDATE'S ANSWER:
${userAnswer}

Return ONLY valid JSON (no markdown fences, no extra text) with this exact structure:
{
  "score": <number 0-10>,
  "feedback": "<detailed feedback paragraph>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "betterAnswer": "<a model answer that would score 10/10>"
}`;

    console.log('[geminiService] Calling Gemini for evaluation...');
    const responseText = await callGemini(prompt);
    console.log('[geminiService] Raw evaluate response (first 300 chars):', responseText.substring(0, 300));
    return parseGeminiJSON(responseText);
  } catch (error) {
    console.error('[geminiService] ❌ evaluateAnswer failed:', error.message);
    throw error; // re-throw original — do NOT wrap, preserves full message for controller log
  }
}

/**
 * 4. Generate a cover letter
 */
async function generateCoverLetter(resumeText, jobDescription, companyName, jobTitle) {
  try {
    const prompt = `You are an expert career coach. Write a professional cover letter for the following job application.

CANDIDATE'S RESUME:
${resumeText}

JOB TITLE: ${jobTitle}
COMPANY: ${companyName}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON (no markdown fences, no extra text) with this exact structure:
{
  "subject": "<email subject line>",
  "coverLetter": "<full professional cover letter, 3-4 paragraphs>"
}`;

    const responseText = await callGemini(prompt);
    return parseGeminiJSON(responseText);
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
