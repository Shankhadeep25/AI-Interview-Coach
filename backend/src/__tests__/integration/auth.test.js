/**
 * Integration tests for /api/auth routes.
 * Uses Supertest to fire real HTTP requests against the Express app
 * backed by an in-memory MongoDB.
 */
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

require('../setup');

describe('Auth Routes', () => {
  // ─── POST /api/auth/register ──────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('should register a new user and set httpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'John Doe', email: 'john@test.com', password: 'secret123' });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('saved successfully');

      // Should set an httpOnly cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/aic_token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);
    });

    it('should reject duplicate email', async () => {
      await User.create({ name: 'Existing', email: 'dup@test.com', password: 'password123' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'New', email: 'dup@test.com', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('already exists');
    });

    it('should reject invalid email format (Zod validation)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'not-an-email', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
        ])
      );
    });

    it('should reject short password (Zod validation)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: '12' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'password' }),
        ])
      );
    });

    it('should reject missing fields (Zod validation)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Only Name' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  // ─── POST /api/auth/login ────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Login User', email: 'login@test.com', password: 'password123' });
    });

    it('should login with correct credentials and set cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('login@test.com');
      expect(res.body.user.plan).toBe('free');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/aic_token=/);
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid credentials');
    });
  });

  // ─── GET /api/auth/me ─────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('should return user data with valid cookie', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Me User', email: 'me@test.com', password: 'password123' });

      const cookie = registerRes.headers['set-cookie'];

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Me User');
      expect(res.body.email).toBe('me@test.com');
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });

  // ─── POST /api/auth/logout ────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('should clear the auth cookie', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Logout User', email: 'logout@test.com', password: 'password123' });

      const cookie = registerRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Logged out');

      // Cookie should be cleared
      const setCookies = res.headers['set-cookie'];
      expect(setCookies).toBeDefined();
      // Cleared cookies have empty value or past expiry
      expect(setCookies[0]).toMatch(/aic_token=/);
    });
  });
});
