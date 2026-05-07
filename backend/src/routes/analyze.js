const express = require('express');
const router = express.Router();
const { analyze, coverLetter, getSessions, getSession } = require('../controllers/analyzeController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { analyzeSchema, coverLetterSchema } = require('../validators/analyzeValidator');

// All routes protected
router.use(authMiddleware);

router.post('/', validate(analyzeSchema), analyze);
router.post('/cover-letter', validate(coverLetterSchema), coverLetter);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSession);

module.exports = router;
