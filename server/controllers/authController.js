import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

export async function register(req, res, next) {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      const error = new Error('All fields are required.');
      error.statusCode = 400;
      throw error;
    }

    if (username.length < 3 || username.length > 50) {
      const error = new Error('Username must be between 3 and 50 characters.');
      error.statusCode = 400;
      throw error;
    }

    if (!validateEmail(email)) {
      const error = new Error('Invalid email format.');
      error.statusCode = 400;
      throw error;
    }

    if (!validatePassword(password)) {
      const error = new Error('Password must be at least 6 characters.');
      error.statusCode = 400;
      throw error;
    }

    if (password !== confirmPassword) {
      const error = new Error('Passwords do not match.');
      error.statusCode = 400;
      throw error;
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      const error = new Error('Email or username already registered.');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Create JWT
    const token = jwt.sign(
      { userId: result.insertId, username, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: { id: result.insertId, username, email },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      const error = new Error('Email and password are required.');
      error.statusCode = 400;
      throw error;
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT id, username, email, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      const error = new Error('No token provided.');
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    const err = new Error('Invalid or expired token.');
    err.statusCode = 401;
    next(err);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { credential } = req.body;

    if (!credential) {
      const error = new Error('Google credential is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!googleClient || !GOOGLE_CLIENT_ID) {
      const error = new Error('Google login is not configured on the server.');
      error.statusCode = 500;
      throw error;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const googleId = payload?.sub;
    const name = payload?.name || (email ? email.split('@')[0] : 'Google User');

    if (!email || !googleId) {
      const error = new Error('Invalid Google token.');
      error.statusCode = 400;
      throw error;
    }

    // Find or create user
    const [users] = await pool.execute(
      'SELECT id, username, email FROM users WHERE email = ?',
      [email]
    );

    let user;

    if (users.length === 0) {
      let username = name;
      if (username.length < 3) {
        username = email.split('@')[0];
      }
      if (username.length > 50) {
        username = username.slice(0, 50);
      }

      const passwordHash = await bcrypt.hash(googleId + JWT_SECRET, 10);

      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, passwordHash]
      );

      user = { id: result.insertId, username, email };
    } else {
      user = users[0];
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login with Google successful.',
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    next(error);
  }
}
