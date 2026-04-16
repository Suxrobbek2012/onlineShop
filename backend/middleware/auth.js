const jwt = require('jsonwebtoken');
const User = require('../models/User');

const loadUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  if (user.isBanned) {
    const error = new Error('Account is banned');
    error.statusCode = 403;
    throw error;
  }

  return user;
};

// Verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    req.user = await loadUserFromToken(token);
    next();
  } catch (err) {
    return res.status(err.statusCode || 401).json({
      success: false,
      message: err.message || 'Token invalid or expired'
    });
  }
};

exports.optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  try {
    req.user = await loadUserFromToken(header.split(' ')[1]);
  } catch (_) {}

  next();
};

// Admin only
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();

  console.warn(`Unauthorized admin access attempt: ${req.user?.username || 'unknown'} -> ${req.method} ${req.originalUrl}`);
  return res.status(403).json({ success: false, message: 'Admin access required' });
};
