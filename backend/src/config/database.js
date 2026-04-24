require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interview-coach';

const connectDB = async () => {
    await mongoose.connect(MONGODB_URI);
}

module.exports = connectDB;
