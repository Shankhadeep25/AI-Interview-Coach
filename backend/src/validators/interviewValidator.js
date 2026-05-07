const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const generateSchema = z.object({
  sessionId: z
    .string({ required_error: 'sessionId is required' })
    .regex(objectIdRegex, 'Invalid session ID format'),
});

const evaluateSchema = z.object({
  sessionId: z
    .string({ required_error: 'sessionId is required' })
    .regex(objectIdRegex, 'Invalid session ID format'),
  questionId: z
    .string({ required_error: 'questionId is required' })
    .min(1, 'questionId is required'),
  question: z
    .string({ required_error: 'question is required' })
    .min(1, 'question is required')
    .max(2000, 'question must be at most 2000 characters'),
  userAnswer: z
    .string({ required_error: 'userAnswer is required' })
    .min(1, 'userAnswer is required')
    .max(10000, 'userAnswer must be at most 10,000 characters'),
  type: z
    .string()
    .optional(),
  idealAnswerPoints: z
    .array(z.string())
    .optional()
    .default([]),
});

const completeSchema = z.object({
  sessionId: z
    .string({ required_error: 'sessionId is required' })
    .regex(objectIdRegex, 'Invalid session ID format'),
});

module.exports = { generateSchema, evaluateSchema, completeSchema };
