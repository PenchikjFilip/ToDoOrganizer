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

  // if (!validator.isEmail(emailId)) {
  //   throw new Error('Invalid email format');
  // }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailId)) {
    throw new Error('Invalid email format');
  }

  if (!password) {
    throw new Error('Password is required');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  if (!validator.isStrongPassword(password, { minLength: 8, minNumbers: 1, minUppercase: 1 })) {
    throw new Error('Password must include at least one uppercase letter and number');
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