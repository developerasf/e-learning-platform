import jwt from 'jsonwebtoken';
import User from '../_models/User.js';

// protect() sets req.user from the JWT payload — no DB hit for basic auth.
// If a route needs full user data (e.g. enrolledCourses), it should call
// User.findById(req.user._id) itself — only paying that cost when needed.
export const protect = async (req, res) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const decoded = jwt.verify(token, jwtSecret);

    // Build req.user from JWT payload only — zero DB round trip.
    // The JWT is signed at login and contains id, role, name, email.
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email,
    };

    return null;
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// protectFull() fetches the full User document. Use only in routes that truly
// need fields beyond what the JWT contains (e.g. enrolledCourses array).
export const protectFull = async (req, res) => {
  const basicError = await protect(req, res);
  if (basicError) return basicError;

  try {
    req.user = await User.findById(req.user._id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    return null;
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, user fetch failed' });
  }
};

export const admin = (req, res) => {
  if (req.user && req.user.role === 'admin') {
    return null;
  } else {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
};
