/**
 * Unit tests for authMiddleware.
 * Tests JWT verification and user lookup from cookies.
 */
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../models/User');
const authMiddleware = require('../../middleware/authMiddleware');

// Requires setup.js to have run (MongoMemoryServer + JWT_SECRET)
require('../setup');

describe('authMiddleware', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Test User',
      email: 'middleware@test.com',
      password: 'password123',
    });
  });

  function createMockReqRes(token) {
    const req = {
      cookies: { aic_token: token },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    return { req, res, next };
  }

  it('should reject request with no token', async () => {
    const { req, res, next } = createMockReqRes(undefined);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('No token') })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with invalid token', async () => {
    const { req, res, next } = createMockReqRes('invalid.jwt.token');

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with expired token', async () => {
    const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const { req, res, next } = createMockReqRes(token);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('expired') })
    );
  });

  it('should reject if user no longer exists', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: fakeId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { req, res, next } = createMockReqRes(token);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('not found') })
    );
  });

  it('should attach user to req and call next() with valid token', async () => {
    const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { req, res, next } = createMockReqRes(token);

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe('middleware@test.com');
    // Password should not be included
    expect(req.user.password).toBeUndefined();
  });
});
