const express = require('express');
const router = express.Router();
const { generateQuestions, evaluate, completeSession } = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { generateSchema, evaluateSchema, completeSchema } = require('../validators/interviewValidator');

// All routes protected
router.use(authMiddleware);

router.post('/generate', validate(generateSchema), generateQuestions);
router.post('/evaluate', validate(evaluateSchema), evaluate);
router.post('/complete', validate(completeSchema), completeSession);

module.exports = router;
