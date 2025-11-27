const nodemailer = require('nodemailer');

/**
 * Email service for sending OTP codes
 * Place this file in: backend/emailService.js
 */

// Create email transporter
const createTransporter = () => {
  // OPTION 1: Gmail configuration (for development)
  // return nodemailer.createTransporter({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USER, // Your Gmail address
  //     pass: process.env.EMAIL_PASSWORD // Your Gmail App Password
  //   }
  // });
  
  // OPTION 2: Mailtrap (for testing - doesn't send real emails)
  // Uncomment below and comment out Gmail config above
  
  return nodemailer.createTransporter({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASSWORD
    }
  });

};

/**
 * Send OTP email for signup verification
 */
const sendSignupOTP = async (email, firstName, otpCode) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@todoapp.com',
    to: email,
    subject: '📝 Todo App - Verify Your Registration',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to Todo App, ${firstName}! 👋</h2>
        <p>Thank you for registering. To complete your registration, please use the verification code below:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #4f46e5; font-size: 32px; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
        </div>
        
        <p style="color: #64748b;">This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #64748b;">If you didn't request this code, please ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 12px;">Todo App - Get Things Done</p>
      </div>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Signup OTP email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending signup OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send OTP email for login verification
 */
const sendLoginOTP = async (email, firstName, otpCode) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@todoapp.com',
    to: email,
    subject: '🔐 Todo App - Login Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Login Verification Required 🔐</h2>
        <p>Hello ${firstName},</p>
        <p>Someone is trying to log into your Todo App account. Please use the verification code below to continue:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #4f46e5; font-size: 32px; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
        </div>
        
        <p style="color: #64748b;">This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #ef4444; font-weight: bold;">⚠️ If you didn't try to log in, please ignore this email and consider changing your password.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 12px;">Todo App - Get Things Done</p>
      </div>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Login OTP email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending login OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Test email configuration
 */
const testEmailConfig = async () => {
  const transporter = createTransporter();
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
};

module.exports = {
  sendSignupOTP,
  sendLoginOTP,
  testEmailConfig
};
