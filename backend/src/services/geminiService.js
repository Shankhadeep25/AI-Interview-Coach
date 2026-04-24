const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Strip markdown JSON fences from Gemini response and parse JSON.
 */
function parseGeminiJSON(text) {
  let cleaned = text.trim();
  // Remove ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  return JSON.parse(cleaned);
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return parseGeminiJSON(responseText);
  } catch (error) {
    throw new Error(`Answer evaluation failed: ${error.message}`);
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
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
