//backend/models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
    // Note: The ideal place to throw is in server.js before Mongoose connects,
    // but throwing here forces the issue if the model is loaded.
    console.error("FATAL ERROR: JWT_SECRET environment variable is not defined.");
    // Exit the process so the application cannot start in an insecure state
    process.exit(1); 
}

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [1, 'First name must be at least 1 character'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  emailId: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  // ========== 2FA FIELDS ==========
  isVerified: {
    type: Boolean,
    default: false // Account not verified until OTP is confirmed
  },
  otpCode: {
    type: String,
    default: null // Stores the current OTP
  },
  otpExpires: {
    type: Date,
    default: null // When the OTP expires
  },
  otpPurpose: {
    type: String,
    enum: ['signup', 'login', null],
    default: null // What the OTP is for
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to validate password
userSchema.methods.validatePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT
userSchema.methods.getJWT = function() {
  const payload = {
    _id: this._id,
    email: this.emailId,
    firstName: this.firstName
  };
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(payload, secret, { expiresIn });
};

// ========== 2FA METHODS ==========

// Method to generate OTP code
userSchema.methods.generateOTP = function(purpose = 'signup') {
  // Generate 6-digit code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP with 10 minute expiration
  this.otpCode = otp;
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.otpPurpose = purpose;
  
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(code, purpose) {
  // Check if OTP exists
  if (!this.otpCode) {
    throw new Error('No OTP found. Please request a new one.');
  }
  
  // Check if OTP matches the purpose
  if (this.otpPurpose !== purpose) {
    throw new Error('Invalid OTP purpose');
  }
  
  // Check if OTP has expired
  if (this.otpExpires < new Date()) {
    this.otpCode = null;
    this.otpExpires = null;
    this.otpPurpose = null;
    throw new Error('OTP has expired. Please request a new one.');
  }
  
  // Check if code matches
  if (this.otpCode !== code) {
    throw new Error('Invalid OTP code');
  }
  
  // Clear OTP after successful verification
  this.otpCode = null;
  this.otpExpires = null;
  this.otpPurpose = null;
  
  return true;
};

// Don't return password and OTP in JSON responses
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otpCode;
  delete obj.otpExpires;
  delete obj.otpPurpose;
  return obj;
};

module.exports = mongoose.model('User', userSchema);