const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    resumeText: {
      type: String,
      required: true,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    analysisResult: {
      type: mongoose.Schema.Types.Mixed,
    },
    questions: {
      type: mongoose.Schema.Types.Mixed,
    },
    results: [
      {
        questionId: String,
        question: String,
        type: String,
        userAnswer: String,
        score: { type: Number, min: 0, max: 10 },
        feedback: String,
        betterAnswer: String,
      },
    ],
    averageScore: {
      type: Number,
    },
    coverLetter: {
      type: String,
    },
    status: {
      type: String,
      enum: ['analyzed', 'in_progress', 'completed'],
      default: 'analyzed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
