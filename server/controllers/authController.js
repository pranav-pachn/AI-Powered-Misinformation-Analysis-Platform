import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { getCollection } from '../config/db.js';

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

function serializeUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
  };
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

    const users = await getCollection('users');
    const existingUser = await users.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const error = new Error('Email or username already registered.');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const token = jwt.sign(
      { userId: result.insertedId.toString(), username, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: { id: result.insertedId.toString(), username, email },
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

    const users = await getCollection('users');
    const user = await users.findOne({ email });

    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');

    if (!isPasswordValid) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: serializeUser(user),
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
      return res.status(503).json({
        message: 'Google login is not configured on the server.',
      });
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

    const users = await getCollection('users');
    let user = await users.findOne({ email });

    if (!user) {
      let username = name;
      if (username.length < 3) {
        username = email.split('@')[0];
      }
      if (username.length > 50) {
        username = username.slice(0, 50);
      }

      const passwordHash = await bcrypt.hash(googleId + JWT_SECRET, 10);

      const result = await users.insertOne({
        username,
        email,
        password: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      user = {
        _id: result.insertedId,
        username,
        email,
      };
    }

    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login with Google successful.',
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
}
