const { z } = require('zod');

// MongoDB ObjectId format: 24 hex characters
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const analyzeSchema = z.object({
  jobTitle: z
    .string({ required_error: 'Job title is required' })
    .trim()
    .min(2, 'Job title must be at least 2 characters')
    .max(200, 'Job title must be at most 200 characters'),
  companyName: z
    .string({ required_error: 'Company name is required' })
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must be at most 200 characters'),
  jobDescription: z
    .string({ required_error: 'Job description is required' })
    .min(10, 'Job description must be at least 10 characters')
    .max(50000, 'Job description must be at most 50,000 characters'),
  resumeText: z
    .string({ required_error: 'Resume text is required' })
    .min(10, 'Resume text must be at least 10 characters')
    .max(50000, 'Resume text must be at most 50,000 characters'),
});

const coverLetterSchema = z.object({
  sessionId: z
    .string({ required_error: 'sessionId is required' })
    .regex(objectIdRegex, 'Invalid session ID format'),
});

module.exports = { analyzeSchema, coverLetterSchema };
