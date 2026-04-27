const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

// Both endpoints require authentication — we need req.user to:
// 1. Prevent unauthenticated order creation
// 2. Know which user to upgrade after payment
router.post('/create-order', authMiddleware, createOrder);
router.post('/verify-payment', authMiddleware, verifyPayment);

module.exports = router;
