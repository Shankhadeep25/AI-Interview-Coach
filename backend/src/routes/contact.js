const express = require('express');
const router = express.Router();
const { contact } = require('../controllers/contactController');
const validate = require('../middleware/validate');
const { contactSchema } = require('../validators/contactValidator');

router.post('/contact', validate(contactSchema), contact);

module.exports = router;