const express = require('express');
const router = express.Router();
const { analyze, coverLetter, getSessions, getSession } = require('../controllers/analyzeController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes protected
router.use(authMiddleware);

router.post('/', analyze);
router.post('/cover-letter', coverLetter);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSession);

module.exports = router;
