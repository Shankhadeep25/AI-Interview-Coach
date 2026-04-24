const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Cookie-based tokens are generally safer because JavaScript can't read them
// if you add httpOnly: true
const COOKIE_NAME = process.env.COOKIE_NAME || 'aic_token';
const isProduction = process.env.NODE_ENV === 'production';

function getCookieOptions() {
  return {
    httpOnly: true,                        // JS cannot access this cookie
    secure: isProduction,                  // HTTPS only in production
    sameSite: isProduction ? 'Strict' : 'Lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 days in ms
    path: '/',
  };
}

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const user = new User({ name, email, password });
    const savedUser = await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Set JWT in httpOnly cookie — not in response body
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.status(201).json({
      message: "User saved successfully",
      data: savedUser
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Set JWT in httpOnly cookie — not in response body
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        sessionsUsed: user.sessionsUsed,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      plan: req.user.plan,
      sessionsUsed: req.user.sessionsUsed,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user: ' + error.message });
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (_req, res) => {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'Strict' : 'Lax',
      path: '/',
    });
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed: ' + error.message });
  }
};

module.exports = { register, login, getMe, logout };
