const User = require('../models/user');
const { validateSignUpData } = require('../validators/authValidator.js');

// Signup
exports.signup = async (req, res, next) => {
  try {
    // Validate input
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ emailId });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ firstName, lastName, emailId, password });
    await user.save();

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

    res.status(201).json({
      message: 'User created successfully',
      data: safeUser
    });
  } catch (err) {
    // Handle validation errors
    if (err.message.includes('required') || err.message.includes('email') || err.message.includes('Password')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// Login
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

    // Validate password
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
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
    emailId: req.user.emailId
  };

  res.json({ data: safeUser });
};