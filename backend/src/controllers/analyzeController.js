const Session = require('../models/Session');
const User = require('../models/User');
const geminiService = require('../services/geminiService');

/**
 * POST /api/analyze
 */
const analyze = async (req, res) => {
  try {
    const { jobTitle, companyName, jobDescription, resumeText } = req.body;

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

/**
 * GET /api/analyze/analytics
 */
const getAnalytics = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id, status: 'completed' })
      .sort({ createdAt: 1 }); // Oldest first for chronological progress

    const progress = sessions.map(s => ({
      date: new Date(s.createdAt).toLocaleDateString(),
      score: s.matchScore || 0,
      jobTitle: s.jobTitle
    }));

    // Aggregate keywords
    const matchedCounts = {};
    const missingCounts = {};

    sessions.forEach(s => {
      if (s.analysisResult?.keywords) {
        const { matched, missing } = s.analysisResult.keywords;
        if (Array.isArray(matched)) {
          matched.forEach(k => {
            const lower = k.toLowerCase();
            matchedCounts[lower] = (matchedCounts[lower] || 0) + 1;
          });
        }
        if (Array.isArray(missing)) {
          missing.forEach(k => {
            const lower = k.toLowerCase();
            missingCounts[lower] = (missingCounts[lower] || 0) + 1;
          });
        }
      }
    });

    // Sort and take top 6
    const topStrengths = Object.entries(matchedCounts)
      .map(([subject, count]) => ({ subject, count, fullMark: sessions.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topImprovements = Object.entries(missingCounts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    res.json({
      progress,
      strengths: topStrengths,
      improvements: topImprovements
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics: ' + error.message });
  }
};

module.exports = { analyze, coverLetter, getSessions, getSession, getAnalytics };
