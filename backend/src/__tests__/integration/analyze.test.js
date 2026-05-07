/**
 * Integration tests for /api/analyze routes.
 * Mocks geminiService to avoid real AI calls.
 */
const request = require('supertest');
const app = require('../../app');

require('../setup');

// Mock geminiService — avoid real Gemini API calls during tests
jest.mock('../../services/geminiService', () => ({
  analyzeResumeAndJD: jest.fn().mockResolvedValue({
    matchScore: 72,
    summary: 'Good candidate match',
    verdict: 'Good Match',
    strengths: ['Strong JavaScript'],
    gaps: ['No cloud experience'],
    suggestions: [],
    keywords: { matched: ['JavaScript', 'React'], missing: ['AWS'] },
  }),
  generateCoverLetter: jest.fn().mockResolvedValue({
    subject: 'Application for SDE at Google',
    coverLetter: 'Dear Hiring Manager, I am writing to express...',
  }),
  generateInterviewQuestions: jest.fn().mockResolvedValue({ questions: [] }),
  evaluateAnswer: jest.fn().mockResolvedValue({ score: 7, feedback: 'Good' }),
}));

/**
 * Helper — registers a user and returns the cookie for authenticated requests.
 */
async function registerAndGetCookie(overrides = {}) {
  const payload = {
    name: 'Test User',
    email: 'analyze@test.com',
    password: 'password123',
    ...overrides,
  };

  const res = await request(app).post('/api/auth/register').send(payload);
  return res.headers['set-cookie'];
}

describe('Analyze Routes', () => {
  let cookie;

  beforeEach(async () => {
    cookie = await registerAndGetCookie();
  });

  // ─── POST /api/analyze ────────────────────────────────────────────────
  describe('POST /api/analyze', () => {
    const validPayload = {
      jobTitle: 'Full Stack Developer',
      companyName: 'Google',
      jobDescription: 'We are looking for a skilled developer with React and Node.js experience.',
      resumeText: 'Experienced full-stack developer with 3 years of React and Node.js experience.',
    };

    it('should analyze resume and return session', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .set('Cookie', cookie)
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.matchScore).toBe(72);
      expect(res.body.analysisResult.verdict).toBe('Good Match');
      expect(res.body.jobTitle).toBe('Full Stack Developer');
      expect(res.body._id).toBeDefined();
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send(validPayload);

      expect(res.status).toBe(401);
    });

    it('should reject missing fields (Zod validation)', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .set('Cookie', cookie)
        .send({ jobTitle: 'SDE' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should reject too-short job description', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .set('Cookie', cookie)
        .send({ ...validPayload, jobDescription: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'jobDescription' }),
        ])
      );
    });
  });

  // ─── GET /api/analyze/sessions ────────────────────────────────────────
  describe('GET /api/analyze/sessions', () => {
    it('should return empty array for new user', async () => {
      const res = await request(app)
        .get('/api/analyze/sessions')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return sessions after analysis', async () => {
      // Create a session first
      await request(app)
        .post('/api/analyze')
        .set('Cookie', cookie)
        .send({
          jobTitle: 'SDE',
          companyName: 'Google',
          jobDescription: 'Looking for a skilled developer with experience',
          resumeText: 'Experienced developer with multiple projects completed',
        });

      const res = await request(app)
        .get('/api/analyze/sessions')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].jobTitle).toBe('SDE');
      expect(res.body[0].matchScore).toBe(72);
    });
  });

  // ─── GET /api/analyze/sessions/:id ────────────────────────────────────
  describe('GET /api/analyze/sessions/:id', () => {
    it('should return session details for the owner', async () => {
      const createRes = await request(app)
        .post('/api/analyze')
        .set('Cookie', cookie)
        .send({
          jobTitle: 'SDE',
          companyName: 'Meta',
          jobDescription: 'Looking for a React developer with frontend skills',
          resumeText: 'Frontend developer with 2 years of experience in React',
        });

      const sessionId = createRes.body._id;

      const res = await request(app)
        .get(`/api/analyze/sessions/${sessionId}`)
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.companyName).toBe('Meta');
      expect(res.body.analysisResult).toBeDefined();
    });

    it('should reject access by different user', async () => {
      // Create session as user 1
      const createRes = await request(app)
        .post('/api/analyze')
        .set('Cookie', cookie)
        .send({
          jobTitle: 'SDE',
          companyName: 'Meta',
          jobDescription: 'Looking for a React developer with frontend skills',
          resumeText: 'Frontend developer with 2 years of experience in React',
        });

      const sessionId = createRes.body._id;

      // Register a different user
      const otherCookie = await registerAndGetCookie({ email: 'other@test.com', name: 'Other' });

      const res = await request(app)
        .get(`/api/analyze/sessions/${sessionId}`)
        .set('Cookie', otherCookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Access denied');
    });

    it('should return 404 for non-existent session', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await request(app)
        .get(`/api/analyze/sessions/${fakeId}`)
        .set('Cookie', cookie);

      expect(res.status).toBe(404);
    });
  });
});
