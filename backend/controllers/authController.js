//backend/controllers/authController.js
// User registration (sign up), login, logout, and current user retrieval

const User = require('../models/user');
const { validateSignUpData } = require('../validators/authValidator.js');
const { sendSignupOTP, sendLoginOTP } = require('../emailService');
const asyncHandler = require('../utils/asyncHandler');

// Helper function to throw consistent client errors
const throwClientError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

// ==================== REGISTER (SIGNUP) - PHASE 1 ====================
// Register user and send OTP
exports.signup = asyncHandler(async (req, res) => {
  // Validate input - wrap in try-catch to handle validation errors
  try {
    validateSignUpData(req.body);
  } catch (validationError) {
    throwClientError(validationError.message, 400);
  }
  
  const { firstName, lastName, emailId, password } = req.body;
  
  // Check if user already exists
  const existing = await User.findOne({ emailId });
  if (existing) {
    // If user exists but not verified, allow re-sending OTP
    if (!existing.isVerified) {
      const otpCode = existing.generateOTP('signup');
      await existing.save();
      
      await sendSignupOTP(emailId, firstName, otpCode);
      
      return res.status(200).json({
        message: 'Account exists but not verified. New verification code sent to your email.',
        requiresVerification: true,
        email: emailId
      });
    }
    
    throwClientError('User already exists and is verified. Please log in.', 400);
  }
  
  // Create new user (not verified yet)
  const user = new User({ 
    firstName, lastName, emailId, password, isVerified: false 
  });
  
  const otpCode = user.generateOTP('signup');
  await user.save();
  
  await sendSignupOTP(emailId, firstName, otpCode);
  
  res.status(201).json({
    message: 'Registration initiated. Please check your email for the verification code.',
    requiresVerification: true,
    email: emailId
  });
});

// ==================== VERIFY REGISTRATION (SIGNUP) - PHASE 2 ====================
exports.verifySignup = asyncHandler(async (req, res) => {
  const { emailId, otpCode } = req.body;
  
  if (!emailId || !otpCode) {
    throwClientError('Email and verification code are required');
  }
  
  const user = await User.findOne({ emailId });
  if (!user) {
    throwClientError('User not found', 404);
  }
  
  if (user.isVerified) {
    throwClientError('Account already verified. Please log in.', 400);
  }
  
  // Verify OTP
  try {
    user.verifyOTP(otpCode, 'signup');
    user.isVerified = true; 
    await user.save();
  } catch (otpError) {
    throwClientError(otpError.message, 400);
  }
  
  const token = user.getJWT();
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 
  });
  
  const safeUser = {
    _id: user._id, firstName: user.firstName, lastName: user.lastName, 
    emailId: user.emailId, isVerified: user.isVerified
  };
  
  res.status(200).json({
    message: 'Account verified successfully! You are now logged in.',
    data: safeUser
  });
});

// ==================== LOGIN - PHASE 1 ====================
exports.login = asyncHandler(async (req, res) => {
  const { emailId, password } = req.body;
  
  if (!emailId || !password) {
    throwClientError('Email and password are required');
  }
  
  const user = await User.findOne({ emailId });
  if (!user) {
    throwClientError('Invalid credentials', 401);
  }
  
  if (!user.isVerified) {
    return res.status(403).json({ 
      message: 'Account not verified. Please verify your account first.',
      requiresVerification: true,
      email: emailId
    });
  }
  
  const isValid = await user.validatePassword(password);
  if (!isValid) {
    throwClientError('Invalid credentials', 401);
  }
  
  const otpCode = user.generateOTP('login');
  await user.save();
  
  await sendLoginOTP(emailId, user.firstName, otpCode);
  
  res.json({
    message: 'Password verified. Please check your email for the login verification code.',
    requiresVerification: true,
    email: emailId
  });
});

// ==================== VERIFY LOGIN - PHASE 2 ====================
exports.verifyLogin = asyncHandler(async (req, res) => {
  const { emailId, otpCode } = req.body;
  
  if (!emailId || !otpCode) {
    throwClientError('Email and verification code are required');
  }
  
  const user = await User.findOne({ emailId });
  if (!user) {
    throwClientError('User not found', 404);
  }
  
  // Verify OTP
  try {
    user.verifyOTP(otpCode, 'login');
    await user.save();
  } catch (otpError) {
    throwClientError(otpError.message, 400);
  }
  
  const token = user.getJWT();
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 
  });
  
  const safeUser = {
    _id: user._id, firstName: user.firstName, lastName: user.lastName, emailId: user.emailId
  };
  
  res.json({
    message: 'Logged in successfully',
    data: safeUser
  });
});

// ==================== RESEND OTP ====================
exports.resendOtp = asyncHandler(async (req, res) => {
  const { emailId, purpose } = req.body; 
  
  if (!emailId || !purpose) {
    throwClientError('Email and purpose are required');
  }
  
  if (!['signup', 'login'].includes(purpose)) {
    throwClientError('Invalid purpose');
  }
  
  const user = await User.findOne({ emailId });
  if (!user) {
    throwClientError('User not found', 404);
  }
  
  if (purpose === 'signup' && user.isVerified) {
    throwClientError('Account already verified');
  }
  
  if (purpose === 'login' && !user.isVerified) {
    throwClientError('Account not verified yet', 403);
  }
  
  const otpCode = user.generateOTP(purpose);
  await user.save();
  
  if (purpose === 'signup') {
    await sendSignupOTP(emailId, user.firstName, otpCode);
  } else {
    await sendLoginOTP(emailId, user.firstName, otpCode);
  }
  
  res.json({
    message: 'New verification code sent to your email'
  });
});

// Logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

// Get current user
exports.getCurrentUser = (req, res) => {
  const safeUser = {
    _id: req.user._id, firstName: req.user.firstName, lastName: req.user.lastName, 
    emailId: req.user.emailId, isVerified: req.user.isVerified
  };
  res.json({ data: safeUser });
};