const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractText } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();
// 5MB limit
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// All routes protected
router.use(authMiddleware);

router.post('/extract-text', upload.single('file'), extractText);

module.exports = router;
