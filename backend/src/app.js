const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const contactRoute = require('./routes/contact');
const authRoutes = require('./routes/auth');
const analyzeRoutes = require('./routes/analyze');
const interviewRoutes = require('./routes/interview');
const paymentRoutes = require('./routes/payment');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// ─── Cookie Parser ───────────────────────────────────────────────────────────
// Cookie-based tokens are generally safer because JavaScript can't read them
// if you add httpOnly: true
app.use(cookieParser());

// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ─── Rate Limiting (disabled in test environment) ────────────────────────────
const isTest = process.env.NODE_ENV === 'test';

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 0 : 100, // 0 = disabled
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
if (!isTest) app.use(globalLimiter);

// ─── AI Rate Limiter: 10 req / 1 min ────────────────────────────────────────
const aiLimiter = isTest
  ? (_req, _res, next) => next() // no-op in tests
  : rateLimit({
      windowMs: 60 * 1000,
      max: 10,
      message: { error: 'AI rate limit reached. Please wait a moment and try again.' },
      standardHeaders: true,
      legacyHeaders: false,
    });

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/analyze', aiLimiter, analyzeRoutes);
app.use('/api/interview', aiLimiter, interviewRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', contactRoute);

// ─── Global Error Handler (must be registered LAST) ─────────────────────────
app.use(errorHandler);

module.exports = app;
