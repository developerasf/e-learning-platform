import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/db.js';
import { admin, protect } from '../middleware/auth.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  message: { message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  message: { message: 'Too many OTP requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const checkOtpLimit = (req, res) => {
  return otpLimiter(req, res, () => {});
};

const generateToken = (id) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d'
  });
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().substring(0, 500);
  }
  return input;
};

const sendEmail = async (to, subject, html) => {
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || process.env.GMAIL_USER,
      pass: process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER || process.env.GMAIL_USER,
    to,
    subject,
    html
  });
};

const getPath = (url) => {
  if (!url) return '/';
  let path = url.split('?')[0];
  // For /api/auth/* routes, strip both /api and /auth
  if (path.startsWith('/api/auth')) {
    path = path.substring(9); // Remove '/api/auth'
  } else if (path.startsWith('/api')) {
    path = path.substring(4); // Remove '/api'
  }
  return path || '/';
};

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    return res.status(500).json({ message: 'Database connection failed: ' + error.message });
  }

  const { method } = req;
  const path = getPath(req.url);

  try {
    if (method === 'POST' && (path === '/' || path === '' || path === '/register')) {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const sanitizedName = sanitizeInput(name);
      const sanitizedEmail = sanitizeInput(email).toLowerCase();

      if (sanitizedName.length < 2 || sanitizedName.length > 100) {
        return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
      }

      if (!validateEmail(sanitizedEmail)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      const userExists = await User.findOne({ email: sanitizedEmail });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await User.create({
        name: sanitizedName,
        email: sanitizedEmail,
        password: password,
        role: 'student'
      });

      if (user) {
        return res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        });
      }
    }

    if (method === 'POST' && path === '/login') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const sanitizedEmail = sanitizeInput(email).toLowerCase();

      const user = await User.findOne({ email: sanitizedEmail });

      if (user && (await user.matchPassword(password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          enrolledCourses: user.enrolledCourses,
          isVerified: user.isVerified,
          token: generateToken(user._id)
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    if (method === 'POST' && path === '/send-verification-otp') {
      const rateLimitError = checkOtpLimit(req, res);
      if (rateLimitError) return rateLimitError;

      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({ message: 'User not found with this email' });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: 'Account is already verified' });
      }

      const otp = user.generateVerificationOTP();
      await user.save();

      try {
        await sendEmail(
          email,
          'Your Verification Code',
          `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Bipul's Classroom </h2>
            <p>Your verification code is:</p>
            <h1 style="color: #4F46E5; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>`
        );
        return res.json({ message: 'Verification code sent to your email' });
      } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ message: 'Failed to send verification email' });
      }
    }

    if (method === 'POST' && path === '/verify-otp') {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isVerified) {
        return res.json({ message: 'Account is already verified', isVerified: true });
      }

      const isValid = user.verifyOTP(otp, 'verification');

      if (!isValid) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }

      user.isVerified = true;
      user.verificationOTP = undefined;
      await user.save();

      return res.json({ message: 'Account verified successfully', isVerified: true });
    }

    if (method === 'POST' && path === '/register-with-otp') {
      const rateLimitError = checkOtpLimit(req, res);
      if (rateLimitError) return rateLimitError;

      const { name, email, password, role, otp } = req.body;

      if (!name || !email || !password || !otp) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser && existingUser.isVerified) {
        return res.status(400).json({ message: 'User already exists' });
      }

      let user;
      if (existingUser && !existingUser.isVerified) {
        const isValid = existingUser.verifyOTP(otp, 'verification');
        if (!isValid) {
          return res.status(400).json({ message: 'Invalid or expired verification code' });
        }
        existingUser.isVerified = true;
        existingUser.verificationOTP = undefined;
        await existingUser.save();
        user = existingUser;
      } else {
        const tempUser = new User({ name, email: email.toLowerCase(), password, role: role || 'student' });
        const isValid = tempUser.verifyOTP(otp, 'verification');

        if (!isValid) {
          return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        user = await User.create({
          name,
          email: email.toLowerCase(),
          password,
          role: role || 'student',
          isVerified: true
        });
      }

      if (user) {
        return res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: true,
          token: generateToken(user._id)
        });
      }
    }

    if (method === 'POST' && path === '/send-register-otp') {
      const rateLimitError = checkOtpLimit(req, res);
      if (rateLimitError) return rateLimitError;

      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
      }

      if (!email.toLowerCase().endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Please use a valid Gmail address' });
      }

      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const tempUser = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'student',
        isVerified: false
      });

      const otp = tempUser.generateVerificationOTP();
      await tempUser.save();

      try {
        await sendEmail(
          email.toLowerCase(),
          'Your Verification Code - Bipul\'s Classroom',
          `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Bipul's Classroom </h2>
            <p>Your verification code is:</p>
            <h1 style="color: #4F46E5; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>`
        );
        return res.json({ message: 'Verification code sent to your Gmail', email: email.toLowerCase() });
      } catch (error) {
        console.error('Email error:', error);
        await tempUser.deleteOne();
        return res.status(500).json({ message: 'Failed to send verification email' });
      }
    }

    if (method === 'POST' && path === '/forgot-password') {
      const rateLimitError = checkOtpLimit(req, res);
      if (rateLimitError) return rateLimitError;

      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({ message: 'No account found with this email' });
      }

      const otp = user.generatePasswordResetOTP();
      await user.save();

      try {
        await sendEmail(
          email.toLowerCase(),
          'Password Reset Code - Bipul\'s Classroom',
          `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Bipul's Classroom Password Reset</h2>
            <p>Your password reset code is:</p>
            <h1 style="color: #4F46E5; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email and keep your password secure.</p>
          </div>`
        );
        return res.json({ message: 'Password reset code sent to your email', email: email.toLowerCase() });
      } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ message: 'Failed to send reset email' });
      }
    }

    if (method === 'POST' && path === '/reset-password') {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: 'Email, OTP and new password are required' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isValid = user.verifyOTP(otp, 'passwordReset');

      if (!isValid) {
        return res.status(400).json({ message: 'Invalid or expired reset code' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      user.passwordResetOTP = undefined;
      await user.save();

      return res.json({ message: 'Password reset successfully' });
    }

    if (method === 'POST' && path === '/change-password') {
      const authError = await protect(req, res);
      if (authError) return authError;

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return res.json({ message: 'Password changed successfully' });
    }

    if (method === 'POST' && path === '/google-auth') {
      const { googleId, name, email, avatar } = req.body;

      if (!googleId || !email) {
        return res.status(400).json({ message: 'Google ID and email are required' });
      }

      let user = await User.findOne({ googleId });

      if (!user) {
        user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
          user.googleId = googleId;
          user.isVerified = true;
          if (avatar) {
            user.avatar = avatar;
          }
          await user.save();
        } else {
          user = await User.create({
            name: name || email.split('@')[0],
            email: email.toLowerCase(),
            password: Math.random().toString(36).slice(-8),
            googleId,
            isVerified: true,
            role: 'student'
          });
        }
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token: generateToken(user._id)
      });
    }

    if (method === 'GET' && path === '/me') {
      const authError = await protect(req, res);
      if (authError) return authError;

      const user = await User.findById(req.user._id).select('-password');
      return res.json(user);
    }

    if (method === 'GET' && path === '/users') {
      const authError = await protect(req, res);
      if (authError) return authError;

      const adminError = admin(req, res);
      if (adminError) return adminError;

      const users = await User.find().select('-password').sort('-createdAt');
      return res.json(users);
    }

    if (method === 'POST' && path === '/users') {
      const authError = await protect(req, res);
      if (authError) return authError;

      const adminError = admin(req, res);
      if (adminError) return adminError;

      const { name, email, password, role } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'student'
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    }

    const deleteUserMatch = path && path.match(/^\/users\/([^/]+)$/);
    if (method === 'DELETE' && deleteUserMatch) {
      const userId = deleteUserMatch[1];

      const authError = await protect(req, res);
      if (authError) return authError;

      const adminError = admin(req, res);
      if (adminError) return adminError;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot delete yourself' });
      }
      await user.deleteOne();
      return res.json({ message: 'User deleted' });
    }

    return res.status(404).json({ message: 'Endpoint not found: ' + path });
  } catch (error) {
    console.error('Auth API Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
