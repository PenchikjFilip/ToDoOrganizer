const validator = require('validator');

exports.validateSignUpData = (req) => {
  const { firstName, emailId, password } = req.body;

  if (!firstName || firstName.trim().length === 0) {
    throw new Error('First name is required');
  }

  if (firstName.length > 50) {
    throw new Error('First name cannot exceed 50 characters');
  }

  if (!emailId) {
    throw new Error('Email is required');
  }

  if (!validator.isEmail(emailId)) {
    throw new Error('Invalid email format');
  }

  if (!password) {
    throw new Error('Password is required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  if (password.length > 100) {
    throw new Error('Password cannot exceed 100 characters');
  }
};

exports.validateLoginData = (req) => {
  const { emailId, password } = req.body;

  if (!emailId || !password) {
    throw new Error('Email and password are required');
  }

  if (!validator.isEmail(emailId)) {
    throw new Error('Invalid email format');
  }
};