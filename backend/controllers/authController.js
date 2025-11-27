// User registration (sign up), login, logout, and current user retrieval


const User = require('../models/user');
const { validateSignUpData } = require('../validators/authValidator.js');
const { sendSignupOTP, sendLoginOTP } = require('../emailService');

// ==================== REGISTER (SIGNUP) - PHASE 1 ====================
// Register user and send OTP
exports.signup = async (req, res, next) => {
  try {
    // Validate input
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;
    
    // Check if user already exists
    const existing = await User.findOne({ emailId });
    if (existing) {
      // If user exists but not verified, allow re-sending OTP
      if (!existing.isVerified) {
        // Generate new OTP
        const otpCode = existing.generateOTP('signup');
        await existing.save();
        
        // Send OTP email
        await sendSignupOTP(emailId, firstName, otpCode);
        
        return res.status(200).json({
          message: 'Account exists but not verified. New verification code sent to your email.',
          requiresVerification: true,
          email: emailId
        });
      }
      
      return res.status(400).json({ message: 'User already exists and is verified. Please log in.' });
    }
    
    // Create new user (not verified yet)
    const user = new User({ 
      firstName, 
      lastName, 
      emailId, 
      password,
      isVerified: false 
    });
    
    // Generate OTP
    const otpCode = user.generateOTP('signup');
    await user.save();
    
    // Send OTP email
    await sendSignupOTP(emailId, firstName, otpCode);
    
    res.status(201).json({
      message: 'Registration initiated. Please check your email for the verification code.',
      requiresVerification: true,
      email: emailId
    });
  } catch (err) {
    // Handle validation errors
    if (err.message.includes('required') || err.message.includes('email') || err.message.includes('Password')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// ==================== VERIFY REGISTRATION (SIGNUP) - PHASE 2 ====================
// Verify OTP and complete registration
exports.verifySignup = async (req, res, next) => {
  try {
    const { emailId, otpCode } = req.body;
    
    if (!emailId || !otpCode) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }
    
    // Find user
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified. Please log in.' });
    }
    
    // Verify OTP
    try {
      user.verifyOTP(otpCode, 'signup');
      user.isVerified = true; // Mark account as verified
      await user.save();
    } catch (otpError) {
      return res.status(400).json({ message: otpError.message });
    }
    
    // Generate JWT token
    const token = user.getJWT();
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });
    
    // Return safe user data
    const safeUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      isVerified: user.isVerified
    };
    
    res.status(200).json({
      message: 'Account verified successfully! You are now logged in.',
      data: safeUser
    });
  } catch (err) {
    next(err);
  }
};

// ==================== LOGIN - PHASE 1 ====================
// Validate credentials and send OTP
exports.login = async (req, res, next) => {
  try {
    const { emailId, password } = req.body;
    
    // Validate input
    if (!emailId || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if account is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Account not verified. Please verify your account first.',
        requiresVerification: true,
        email: emailId
      });
    }
    
    // Validate password
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate OTP for login
    const otpCode = user.generateOTP('login');
    await user.save();
    
    // Send OTP email
    await sendLoginOTP(emailId, user.firstName, otpCode);
    
    res.json({
      message: 'Password verified. Please check your email for the login verification code.',
      requiresVerification: true,
      email: emailId
    });
  } catch (err) {
    next(err);
  }
};

// ==================== VERIFY LOGIN - PHASE 2 ====================
// Verify OTP and create session
exports.verifyLogin = async (req, res, next) => {
  try {
    const { emailId, otpCode } = req.body;
    
    if (!emailId || !otpCode) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }
    
    // Find user
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify OTP
    try {
      user.verifyOTP(otpCode, 'login');
      await user.save();
    } catch (otpError) {
      return res.status(400).json({ message: otpError.message });
    }
    
    // Generate JWT token
    const token = user.getJWT();
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });
    
    // Return safe user data
    const safeUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId
    };
    
    res.json({
      message: 'Logged in successfully',
      data: safeUser
    });
  } catch (err) {
    next(err);
  }
};

// ==================== RESEND OTP ====================
exports.resendOtp = async (req, res, next) => {
  try {
    const { emailId, purpose } = req.body; // purpose: 'signup' or 'login'
    
    if (!emailId || !purpose) {
      return res.status(400).json({ message: 'Email and purpose are required' });
    }
    
    if (!['signup', 'login'].includes(purpose)) {
      return res.status(400).json({ message: 'Invalid purpose' });
    }
    
    // Find user
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check purpose-specific conditions
    if (purpose === 'signup' && user.isVerified) {
      return res.status(400).json({ message: 'Account already verified' });
    }
    
    if (purpose === 'login' && !user.isVerified) {
      return res.status(403).json({ message: 'Account not verified yet' });
    }
    
    // Generate new OTP
    const otpCode = user.generateOTP(purpose);
    await user.save();
    
    // Send appropriate email
    if (purpose === 'signup') {
      await sendSignupOTP(emailId, user.firstName, otpCode);
    } else {
      await sendLoginOTP(emailId, user.firstName, otpCode);
    }
    
    res.json({
      message: 'New verification code sent to your email'
    });
  } catch (err) {
    next(err);
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

// Get current user
exports.getCurrentUser = (req, res) => {
  // req.user is set by auth middleware
  const safeUser = {
    _id: req.user._id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    emailId: req.user.emailId,
    isVerified: req.user.isVerified
  };
  res.json({ data: safeUser });
};