const express = require('express');
const router = express.Router();
const { generateQuestions, evaluate, completeSession, startChat, chatMessage, endChatSession } = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { generateSchema, evaluateSchema, completeSchema, chatStartSchema, chatMessageSchema } = require('../validators/interviewValidator');

// All routes protected
router.use(authMiddleware);

// ── Existing: structured Q&A interview ───────────────────────────────────────
router.post('/generate',  validate(generateSchema),  generateQuestions);
router.post('/evaluate',  validate(evaluateSchema),  evaluate);
router.post('/complete',  validate(completeSchema),  completeSession);

// ── Phase 1: conversational multi-turn interview ─────────────────────────────
router.post('/chat/start',   validate(chatStartSchema),   startChat);
router.post('/chat/message', validate(chatMessageSchema), chatMessage);
router.post('/chat/end', endChatSession);

module.exports = router;

