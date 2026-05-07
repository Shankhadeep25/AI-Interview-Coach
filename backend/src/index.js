require('dotenv').config();
const connectDB = require('./config/database');
const app = require('./app');

// ─── MongoDB Connection & Server Start ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
