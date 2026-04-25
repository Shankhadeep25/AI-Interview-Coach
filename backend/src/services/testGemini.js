const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { analyzeResumeAndJD } = require('./geminiService');

const testResume = `
John Doe | React Developer
Skills: React, JavaScript, Node.js, MongoDB
Projects: Built a task manager with React and Express
`;

const testJD = `
We are looking for a React Developer with experience in:
- React, TypeScript, Node.js
- REST APIs and MongoDB
- Git and agile workflows
`;

async function test() {
    console.log('🧪 Testing Gemini connection...');
    try {
        const result = await analyzeResumeAndJD(testResume, testJD);
        console.log('✅ Gemini working!');
        console.log('Match Score:', result.matchScore);
        console.log('Verdict:', result.verdict);
        console.log('Strengths:', result.strengths);
    } catch (err) {
        console.error('❌ Gemini error:', err.message);
    }
}

test();