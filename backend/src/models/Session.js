const mongoose = require('mongoose');

/**
 * Explicit subdocument schema for interview results.
 * Using full { type: ... } syntax (not shorthand) to avoid a Mongoose 8.x
 * bug where inline shorthand arrays like [{ field: String }] are miscast
 * as [String], causing a CastError on session.results.push({...}).
 */
const resultSchema = new mongoose.Schema(
  {
    questionId:  { type: String },
    question:    { type: String },
    type:        { type: String },
    userAnswer:  { type: String },
    score:       { type: Number, min: 0, max: 10 },
    feedback:    { type: String },
    betterAnswer:{ type: String },
  },
  { _id: false }   // no extra _id per result entry
);

/**
 * Subdocument schema for a single turn in a Gemini multi-turn chat.
 * role: 'user' | 'model' — mirrors the Gemini SDK's history format exactly,
 * so we can reload history directly into model.startChat({ history }).
 */
const chatMessageSchema = new mongoose.Schema(
  {
    role:  { type: String, enum: ['user', 'model'], required: true },
    parts: [
      {
        text: { type: String, required: true },
        _id:  false,
      },
    ],
  },
  { _id: false }
);

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
    results: [resultSchema],   // ← explicit subdocument schema, not inline
    averageScore: {
      type: Number,
    },
    coverLetter: {
      type: String,
    },
    /**
     * chatHistory persists the full Gemini conversation for this session.
     * On each /chat request we reload this array into startChat({ history })
     * so the AI remembers everything said earlier in the interview.
     */
    chatHistory: [chatMessageSchema],
    status: {
      type: String,
      enum: ['analyzed', 'in_progress', 'chat_in_progress', 'completed'],
      default: 'analyzed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);

