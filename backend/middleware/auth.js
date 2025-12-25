// backend/middleware/auth.js
// JWT-based authentication middleware using cookies

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');

const authMiddleware = asyncHandler(async (req, res, next) => {
  // Get token from cookie (not Authorization header)
  const token = req.cookies.token;
  
  if (!token) {
    const err = new Error('Authentication required. Please log in.');
    err.statusCode = 401;
    return next(err);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user object (excluding password)
    const user = await User.findById(decoded._id).select('-password -otpCode -otpExpires -otpPurpose');
    
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 401;
      return next(err);
    }
    
    if (!user.isVerified) {
      const err = new Error('Account not verified');
      err.statusCode = 403;
      return next(err);
    }
    
    req.user = user;
    next();
  } catch (error) {
    error.statusCode = 401;
    error.message = 'Invalid or expired token';
    return next(error);
  }
});

module.exports = authMiddleware;