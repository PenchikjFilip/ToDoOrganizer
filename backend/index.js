require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todo');
const errorHandler = require('./middleware/errorHandler');
const { testEmailConfig } = require('./emailService');

const app = express();

// CORS configuration - CRITICAL for frontend-backend communication
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true // Allow cookies
}));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Test email configuration on startup
(async () => {
  console.log('--- Testing Email Configuration ---');
  await testEmailConfig();
  console.log('-----------------------------------');
})();

// Routes - Note: no /api prefix here, nginx handles that
app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});