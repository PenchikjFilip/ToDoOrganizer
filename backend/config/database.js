// Defines and exports a connectDB function that handles connection to MongoDB using Mongoose


const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/todoapp';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`✅ MongoDB connected: ${mongoUri}`);
  } catch (err) { 
    console.error('❌ MongoDB connection error:', err.message); 
    process.exit(1); // Exit process with failure. Ensures the app doesn’t continue running without a database connection.
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

module.exports = connectDB;