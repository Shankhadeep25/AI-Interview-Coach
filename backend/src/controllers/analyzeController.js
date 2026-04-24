const Session = require('../models/Session');
const User = require('../models/User');
const geminiService = require('../services/geminiService');

/**
 * POST /api/analyze
 */
const analyze = async (req, res) => {
  try {
    const { jobTitle, companyName, jobDescription, resumeText } = req.body;

    if (!jobTitle || !companyName || !jobDescription || !resumeText) {
      return res.status(400).json({ error: 'All fields are required: jobTitle, companyName, jobDescription, resumeText.' });
    }

    // Free plan limit check
    const user = await User.findById(req.user._id);
    if (user.plan === 'free' && user.sessionsUsed >= 5) {
      return res.status(403).json({ error: 'Free plan limit reached. Upgrade to Pro for unlimited sessions.' });
    }

    // Call Gemini for analysis
    const analysisResult = await geminiService.analyzeResumeAndJD(resumeText, jobDescription);

    // Create session
    const session = new Session({
      userId: req.user._id,
      jobTitle,
      companyName,
      jobDescription,
      resumeText,
      matchScore: analysisResult.matchScore,
      analysisResult,
      status: 'analyzed',
    });
    await session.save();

    // Increment sessions used
    user.sessionsUsed += 1;
    await user.save();

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed: ' + error.message });
  }
};

/**
 * POST /api/analyze/cover-letter
 */
const coverLetter = async (req, res) => {
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

    const result = await geminiService.generateCoverLetter(
      session.resumeText,
      session.jobDescription,
      session.companyName,
      session.jobTitle
    );

    session.coverLetter = result.coverLetter;
    await session.save();

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Cover letter generation failed: ' + error.message });
  }
};

/**
 * GET /api/analyze/sessions
 */
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .select('jobTitle companyName matchScore status averageScore createdAt')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions: ' + error.message });
  }
};

/**
 * GET /api/analyze/sessions/:id
 */
const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. This session does not belong to you.' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session: ' + error.message });
  }
};

module.exports = { analyze, coverLetter, getSessions, getSession };
