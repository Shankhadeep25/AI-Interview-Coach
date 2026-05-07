const { z } = require('zod');

const verifyPaymentSchema = z.object({
  razorpay_order_id: z
    .string({ required_error: 'razorpay_order_id is required' })
    .min(1, 'razorpay_order_id is required'),
  razorpay_payment_id: z
    .string({ required_error: 'razorpay_payment_id is required' })
    .min(1, 'razorpay_payment_id is required'),
  razorpay_signature: z
    .string({ required_error: 'razorpay_signature is required' })
    .min(1, 'razorpay_signature is required'),
});

module.exports = { verifyPaymentSchema };
