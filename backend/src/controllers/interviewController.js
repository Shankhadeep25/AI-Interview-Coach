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

    console.log('\n--- [EVALUATE] Step 1: Request received ---');
    console.log('  sessionId:', sessionId);
    console.log('  questionId:', questionId);
    console.log('  question length:', question?.length);
    console.log('  userAnswer length:', userAnswer?.length);
    console.log('  idealAnswerPoints:', JSON.stringify(idealAnswerPoints));

    const session = await Session.findById(sessionId);
    console.log('[EVALUATE] Step 2: DB lookup result:', session ? 'FOUND' : 'NOT FOUND');

    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    console.log('[EVALUATE] Step 3: Calling Gemini evaluateAnswer...');
    const evaluation = await geminiService.evaluateAnswer(
      question,
      userAnswer,
      idealAnswerPoints || []
    );
    console.log('[EVALUATE] Step 4: Gemini response OK - score:', evaluation?.score);

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

    console.log('[EVALUATE] Step 5: Saving session...');
    await session.save();
    console.log('[EVALUATE] Step 6: Done ✅');

    res.json(evaluation);
  } catch (error) {
    console.error('\n❌ [EVALUATE] FAILED at step above. Error:', error.message);
    console.error('   Stack:', error.stack);
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

module.exports = { generateQuestions, evaluate, completeSession };
