//backend/validators/authValidator.js
const validator = require('validator');

exports.validateSignUpData = (data) => {
  const { firstName, emailId, password } = data;

  console.log('🔍 Validating signup data:', { firstName, emailId, passwordLength: password?.length });

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

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  // More explicit validation
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  console.log('🔍 Password validation check:', {
    length: password.length,
    hasUppercase,
    hasLowercase,
    hasNumber
  });

  if (!hasUppercase) {
    throw new Error('Password must include at least one uppercase letter');
  }

  if (!hasLowercase) {
    throw new Error('Password must include at least one lowercase letter');
  }

  if (!hasNumber) {
    throw new Error('Password must include at least one number');
  }

  if (password.length > 100) {
    throw new Error('Password cannot exceed 100 characters');
  }
};

exports.validateLoginData = (data) => {
  const { emailId, password } = data;

  if (!emailId || !password) {
    throw new Error('Email and password are required');
  }

  if (!validator.isEmail(emailId)) {
    throw new Error('Invalid email format');
  }
};