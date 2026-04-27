// ─── Payment Model ───────────────────────────────────────────────────────────
// Persists every successful payment for audit trail, refund lookups, and
// reconciliation with the Razorpay dashboard. We store both the order_id
// and payment_id so we can trace the full lifecycle.
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    razorpay_order_id: {
      type: String,
      required: true,
      unique: true,
    },
    razorpay_payment_id: {
      type: String,
      required: true,
      unique: true,
    },
    razorpay_signature: {
      type: String,
      required: true,
    },
    amount: {
      type: Number, // stored in paise (49900 = ₹499)
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded'],
      default: 'created',
    },
    plan: {
      type: String,
      enum: ['pro'],
      default: 'pro',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
