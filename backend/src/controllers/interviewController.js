const Session = require('../models/Session');
const geminiService = require('../services/geminiService');

/**
 * POST /api/interview/generate
 */
const generateQuestions = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required.' });
    }

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

    if (!sessionId || !questionId || !question || !userAnswer) {
      return res.status(400).json({ error: 'sessionId, questionId, question, and userAnswer are required.' });
    }

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

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required.' });
    }

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

module.exports = { generateQuestions, evaluate, completeSession };
