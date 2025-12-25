const nodemailer = require('nodemailer');

const createTransport = () => {
  // Check which email service to use based on environment variables
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    // GMAIL Configuration
    console.log('📧 Using Gmail for email service');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASSWORD) {
    // MAILTRAP Configuration
    console.log('📧 Using Mailtrap for email service');
    return nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD
      }
    });
  } else {
    throw new Error('Email service not configured. Please set EMAIL_USER/EMAIL_PASSWORD or MAILTRAP_USER/MAILTRAP_PASSWORD in .env');
  }
};

/**
 * CORE UTILITY: Handles transporter creation and the sendMail try/catch logic.
 * @param {string} email - Recipient email address.
 * @param {string} subject - Email subject line.
 * @param {string} htmlContent - The full HTML body of the email.
 * @param {string} purpose - 'Signup' or 'Login' for logging clarity.
 */
const sendEmail = async (email, subject, htmlContent, purpose) => {
  const transporter = createTransport();
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@todoapp.com',
    to: email,
    subject: subject,
    html: htmlContent
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ ${purpose} OTP email sent:`, info.messageId);
    return true;
  } catch (error) {
    console.error(`❌ Error sending ${purpose} OTP email:`, error);
    throw new Error('Failed to send verification email. Please try again later.');
  }
};

// ==================== EMAIL TEMPLATES ===========================

const getSignupTemplate = (firstName, otpCode) => `
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
`;

const getLoginTemplate = (firstName, otpCode) => `
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
`;

// ==================== FEATURE-SPECIFIC SENDERS ===========================

// Send OTP email for signup verification
const sendSignupOTP = async (email, firstName, otpCode) => {
  const subject = '🔐 Todo App - Verify Your Registration';
  const htmlContent = getSignupTemplate(firstName, otpCode);
  
  return sendEmail(email, subject, htmlContent, 'Signup');
};

// Send OTP email for login verification
const sendLoginOTP = async (email, firstName, otpCode) => {
  const subject = '🔐 Todo App - Login Verification Code';
  const htmlContent = getLoginTemplate(firstName, otpCode);
  
  return sendEmail(email, subject, htmlContent, 'Login');
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransport();
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error.message);
    console.error('💡 Make sure you have set EMAIL_USER and EMAIL_PASSWORD in your .env file');
    console.error('💡 For Gmail, you need to use an App Password, not your regular password');
    console.error('💡 See: https://support.google.com/accounts/answer/185833');
    return false;
  }
};

module.exports = {
  sendSignupOTP,
  sendLoginOTP,
  testEmailConfig
};