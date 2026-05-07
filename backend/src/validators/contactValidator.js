const { z } = require('zod');
const xss = require('xss');

/**
 * Custom Zod transform that strips dangerous HTML/script tags from a string.
 * Prevents XSS attacks when user input is rendered in HTML emails.
 */
const sanitizedString = (fieldName, minLen, maxLen) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .trim()
    .min(minLen, `${fieldName} must be at least ${minLen} characters`)
    .max(maxLen, `${fieldName} must be at most ${maxLen} characters`)
    .transform((val) => xss(val));

const contactSchema = z.object({
  fullName: sanitizedString('Full name', 2, 100),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email format'),
  subject: sanitizedString('Subject', 2, 200),
  message: sanitizedString('Message', 10, 5000),
});

module.exports = { contactSchema };
