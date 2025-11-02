const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// POST /auth/signup - Register a new user
router.post('/signup', authController.signup);

// POST /auth/login - Login user
router.post('/login', authController.login);

// POST /auth/logout - Logout user
router.post('/logout', authController.logout);

// GET /auth/me - Get current user (requires authentication)
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;