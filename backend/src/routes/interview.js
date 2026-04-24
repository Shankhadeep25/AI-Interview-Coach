const express = require('express');
const router = express.Router();
const { generateQuestions, evaluate, completeSession } = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes protected
router.use(authMiddleware);

router.post('/generate', generateQuestions);
router.post('/evaluate', evaluate);
router.post('/complete', completeSession);

module.exports = router;
