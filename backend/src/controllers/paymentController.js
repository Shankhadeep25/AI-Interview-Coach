const razorpay = require('../config/razorpay');
const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils');
const Payment = require('../models/Payment');
const User = require('../models/User');

// ─── STEP 1: Create Order ────────────────────────────────────────────────────
// Creates a Razorpay order server-side. The order_id is what locks the amount
// on Razorpay's end — the frontend can't tamper with it. We attach userId and
// plan in the notes field for traceability in the Razorpay dashboard.
const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;

    // Guard: don't let a Pro user pay again
    if (user.plan === 'pro') {
      return res.status(400).json({ error: 'You are already on the Pro plan.' });
    }

    // Amount is ALWAYS in paise. ₹499 × 100 = 49900 paise.
    // Hardcode server-side — never accept amount from the client.
    const amount = 49900;

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${userId.toString().slice(-8)}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        plan: 'pro',
        userName: user.name,
        userEmail: user.email,
      },
    });

    // Return the full order to the frontend — it needs order.id to open the modal
    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // public key — safe to send
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ error: 'Failed to create payment order. Please try again.' });
  }
};

// ─── STEP 3 + 4: Verify Payment ─────────────────────────────────────────────
// Two-phase verification:
//   Phase 1 (Step 3): Cryptographic signature check — proves the response
//                     actually came from Razorpay, not a forged request.
//   Phase 2 (Step 4): Fetch payment from Razorpay API and confirm status
//                     is 'captured' — money actually moved.
// Only after BOTH pass do we upgrade the user's plan.
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id;

    // ── Phase 1: Signature Verification (Step 3) ────────────────────────
    // Razorpay signs: order_id + "|" + payment_id with your key_secret.
    // validatePaymentVerification reconstructs this and compares HMACs.
    const isSignatureValid = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isSignatureValid) {
      console.warn(`Payment signature mismatch for order ${razorpay_order_id}`);
      return res.status(400).json({ error: 'Payment verification failed. Signature mismatch.' });
    }

    // ── Phase 2: Payment Status Check (Step 4) ──────────────────────────
    // Even with a valid signature, the payment might not be captured
    // (e.g., auto-capture off, or failed at bank). Always confirm.
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured') {
      console.warn(`Payment ${razorpay_payment_id} status is '${payment.status}', not 'captured'`);
      return res.status(402).json({
        error: 'Payment was not captured. Please contact support if money was deducted.',
      });
    }

    // ── Persist Payment Record ──────────────────────────────────────────
    // Idempotency: check if we already processed this order (handles retries)
    const existingPayment = await Payment.findOne({ razorpay_order_id });
    if (existingPayment) {
      // Already processed — return success (idempotent)
      return res.status(200).json({
        success: true,
        message: 'Payment already verified.',
        plan: 'pro',
      });
    }

    await Payment.create({
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: payment.amount,
      currency: payment.currency,
      status: 'captured',
      plan: 'pro',
    });

    // ── Upgrade User ────────────────────────────────────────────────────
    await User.findByIdAndUpdate(userId, { plan: 'pro' });

    res.status(200).json({
      success: true,
      message: 'Payment verified. You are now on the Pro plan!',
      plan: 'pro',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed. Please contact support.' });
  }
};

module.exports = { createOrder, verifyPayment };
