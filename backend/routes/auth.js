const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// POST /auth/signup - Register and send OTP (Phase 1)
router.post('/signup', authController.signup);

// POST /auth/verify-signup - Verify OTP and complete registration (Phase 2)
router.post('/verify-signup', authController.verifySignup);

// POST /auth/login - Validate password and send OTP (Phase 1)
router.post('/login', authController.login);

// POST /auth/verify-login - Verify OTP and create session (Phase 2)
router.post('/verify-login', authController.verifyLogin);

// POST /auth/resend-otp - Resend OTP code
router.post('/resend-otp', authController.resendOtp);

// POST /auth/logout - Logout user
router.post('/logout', authController.logout);

// GET /auth/me - Get current user (requires authentication)
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;