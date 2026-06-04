const Session = require('../models/Session');
const geminiService = require('../services/geminiService');

/**
 * POST /api/interview/generate
 */
const generateQuestions = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. This session does not belong to you.' });
    }

    // Don't re-generate if questions already exist
    if (session.questions && session.questions.length > 0) {
      return res.json({ sessionId: session._id, questions: session.questions });
    }

    const result = await geminiService.generateInterviewQuestions(
      session.resumeText,
      session.jobDescription
    );

    session.questions = result.questions;
    session.status = 'in_progress';
    await session.save();

    res.json({ sessionId: session._id, questions: result.questions });
  } catch (error) {
    res.status(500).json({ error: 'Question generation failed: ' + error.message });
  }
};

/**
 * POST /api/interview/evaluate
 */
const evaluate = async (req, res) => {
  try {
    const { sessionId, questionId, question, type, userAnswer, idealAnswerPoints } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const evaluation = await geminiService.evaluateAnswer(
      question,
      userAnswer,
      idealAnswerPoints || []
    );

    // Push result into session
    session.results.push({
      questionId,
      question,
      type,
      userAnswer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      betterAnswer: evaluation.betterAnswer,
    });
    await session.save();

    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ error: 'Evaluation failed: ' + error.message });
  }
};

/**
 * POST /api/interview/complete
 */
const completeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Calculate average score
    const totalScore = session.results.reduce((sum, r) => sum + (r.score || 0), 0);
    const averageScore = session.results.length > 0
      ? Math.round((totalScore / session.results.length) * 10) / 10
      : 0;

    session.averageScore = averageScore;
    session.status = 'completed';
    await session.save();

    res.json({
      averageScore,
      totalQuestions: session.questions ? session.questions.length : 0,
      resultsCount: session.results.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Session completion failed: ' + error.message });
  }
};

/**
 * POST /api/interview/chat/start
 *
 * Initialises a new conversational (multi-turn) interview for a session.
 * Can only be called once per session — if chatHistory already exists the
 * stored history is returned along with the last AI message so the frontend
 * can resume seamlessly after a page refresh.
 */
const startChat = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Resume: if chat already started, return the last AI message from history
    if (session.chatHistory && session.chatHistory.length > 0) {
      const history = session.chatHistory;
      // Find the last model turn to re-display on resume
      const lastModelTurn = [...history].reverse().find((m) => m.role === 'model');
      return res.json({
        reply: lastModelTurn?.parts?.[0]?.text || '',
        isResumed: true,
        isComplete: session.status === 'completed',
      });
    }

    // Fresh start
    const { reply, history } = await geminiService.startInterviewSession(
      session.resumeText,
      session.jobDescription,
      session.jobTitle,
      session.companyName
    );

    session.chatHistory = history;
    session.status = 'chat_in_progress';
    await session.save();

    res.json({ reply, isResumed: false, isComplete: false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start chat interview: ' + error.message });
  }
};

/**
 * POST /api/interview/chat/message
 *
 * Sends a candidate's answer and receives the AI interviewer's next response.
 * The full chat history is rehydrated from MongoDB on every call (HTTP is
 * stateless — the Gemini chat object only lives in memory per request).
 */

// Hard cap on the number of questions the AI can ask.
// Acts as a safety net in case the AI ignores the 5–7 question instruction
// or the [INTERVIEW_COMPLETE] signal fails to trigger normally.
const MAX_QUESTIONS = 10;

const chatMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (!session.chatHistory || session.chatHistory.length === 0) {
      return res.status(400).json({ error: 'Chat not started. Call /chat/start first.' });
    }
    if (session.status === 'completed') {
      return res.status(400).json({ error: 'This interview session is already completed.' });
    }

    // Count how many real answers the candidate has given.
    // chatHistory[0] is always the priming context message (resume + JD),
    // so we skip index 0 when counting user turns.
    const userAnswerCount = session.chatHistory.filter(
      (m, i) => m.role === 'user' && i > 0
    ).length;

    // If the candidate has already answered MAX_QUESTIONS questions,
    // override what we send to Gemini to force an immediate conclusion.
    // We still include the candidate's actual answer so Alex can reference
    // it in the final assessment — we just add a system directive after it.
    const messageToSend = userAnswerCount >= MAX_QUESTIONS
      ? `${message}\n\n[SYSTEM DIRECTIVE: The candidate has now answered the maximum number of questions (${MAX_QUESTIONS}). You must conclude the interview immediately. Provide your final overall assessment and composite score now, then append [INTERVIEW_COMPLETE] on the last line. Do not ask any more questions.]`
      : message;

    const { reply, history, isComplete } = await geminiService.sendChatMessage(
      session.chatHistory,
      messageToSend
    );

    // Persist updated history so next message has full context
    session.chatHistory = history;
    if (isComplete) session.status = 'completed';
    await session.save();

    // Also expose the current question count so the frontend can show progress
    res.json({ reply, isComplete, questionCount: userAnswerCount + 1, maxQuestions: MAX_QUESTIONS });
  } catch (error) {
    res.status(500).json({ error: 'Chat message failed: ' + error.message });
  }
};


module.exports = { generateQuestions, evaluate, completeSession, startChat, chatMessage };
