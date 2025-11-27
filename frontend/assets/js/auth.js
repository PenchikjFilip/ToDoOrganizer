// Authentication UI Component with 2FA

class AuthComponent {
  constructor() {
    this.currentUser = null;
    this.isLoginMode = true;
    this.pendingEmail = null; // Store email for OTP verification
    this.pendingPurpose = null; // 'signup' or 'login'
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    // Form elements
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.firstNameInput = document.getElementById('firstName');
    this.lastNameInput = document.getElementById('lastName');
    this.otpInput = document.getElementById('otpCode');
    
    // Buttons
    this.showSignupBtn = document.getElementById('showSignup');
    this.showLoginBtn = document.getElementById('showLogin');
    this.authActionBtn = document.getElementById('authAction');
    this.verifyOtpBtn = document.getElementById('verifyOtpBtn');
    this.resendOtpBtn = document.getElementById('resendOtp');
    this.backBtn = document.getElementById('backBtn');
    this.logoutBtn = document.getElementById('logoutBtn');
    
    // Containers
    this.authContainer = document.getElementById('authContainer');
    this.appContainer = document.getElementById('appContainer');
    this.credentialsForm = document.getElementById('credentialsForm');
    this.otpForm = document.getElementById('otpForm');
    this.userInfoEl = document.getElementById('userInfo');
    this.errorEl = document.getElementById('authError');
    this.otpErrorEl = document.getElementById('otpError');
    this.otpMessageEl = document.getElementById('otpMessage');
  }

  attachEventListeners() {
    this.showSignupBtn.addEventListener('click', () => this.switchToSignup());
    this.showLoginBtn.addEventListener('click', () => this.switchToLogin());
    this.authActionBtn.addEventListener('click', () => this.handleAuthAction());
    this.verifyOtpBtn.addEventListener('click', () => this.handleVerifyOtp());
    this.resendOtpBtn.addEventListener('click', () => this.handleResendOtp());
    this.backBtn.addEventListener('click', () => this.showCredentialsForm());
    this.logoutBtn.addEventListener('click', () => this.handleLogout());
    
    // Allow Enter key to submit
    [this.emailInput, this.passwordInput, this.firstNameInput, this.lastNameInput].forEach(input => {
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.handleAuthAction();
        });
      }
    });
    
    // OTP input Enter key
    if (this.otpInput) {
      this.otpInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleVerifyOtp();
      });
      
      // Auto-format OTP input (only numbers, max 6 digits)
      this.otpInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
      });
    }
  }

  switchToSignup() {
    this.isLoginMode = false;
    this.firstNameInput.style.display = 'block';
    this.lastNameInput.style.display = 'block';
    this.showSignupBtn.style.display = 'none';
    this.showLoginBtn.style.display = 'inline-block';
    this.authActionBtn.textContent = 'Sign Up';
    this.clearError();
  }

  switchToLogin() {
    this.isLoginMode = true;
    this.firstNameInput.style.display = 'none';
    this.lastNameInput.style.display = 'none';
    this.showSignupBtn.style.display = 'inline-block';
    this.showLoginBtn.style.display = 'none';
    this.authActionBtn.textContent = 'Login';
    this.clearError();
  }

  async handleAuthAction() {
    this.clearError();
    
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value;

    if (!email || !password) {
      this.showError('Email and password are required');
      return;
    }

    try {
      if (this.isLoginMode) {
        await this.login(email, password);
      } else {
        const firstName = this.firstNameInput.value.trim();
        const lastName = this.lastNameInput.value.trim();
        
        if (!firstName) {
          this.showError('First name is required');
          return;
        }
        
        await this.signup(firstName, lastName, email, password);
      }
    } catch (err) {
      this.showError(err.message);
    }
  }

  async signup(firstName, lastName, email, password) {
    this.authActionBtn.disabled = true;
    this.authActionBtn.textContent = 'Sending...';
    
    try {
      const result = await window.ApiService.auth.signup(firstName, lastName, email, password);
      
      if (result.requiresVerification) {
        // Show OTP form
        this.pendingEmail = email;
        this.pendingPurpose = 'signup';
        this.showOtpForm('signup');
      }
    } finally {
      this.authActionBtn.disabled = false;
      this.authActionBtn.textContent = 'Sign Up';
    }
  }

  async login(email, password) {
    this.authActionBtn.disabled = true;
    this.authActionBtn.textContent = 'Verifying...';
    
    try {
      const result = await window.ApiService.auth.login(email, password);
      
      if (result.requiresVerification) {
        // Show OTP form
        this.pendingEmail = email;
        this.pendingPurpose = 'login';
        this.showOtpForm('login');
      }
    } finally {
      this.authActionBtn.disabled = false;
      this.authActionBtn.textContent = 'Login';
    }
  }

  showOtpForm(purpose) {
    // Hide credentials form
    this.credentialsForm.style.display = 'none';
    
    // Show OTP form
    this.otpForm.style.display = 'block';
    
    // Update message
    const message = purpose === 'signup' 
      ? `A 6-digit verification code has been sent to ${this.pendingEmail}. Please enter it below to complete your registration.`
      : `A 6-digit verification code has been sent to ${this.pendingEmail}. Please enter it below to log in.`;
    
    this.otpMessageEl.textContent = message;
    
    // Clear OTP input
    this.otpInput.value = '';
    this.clearOtpError();
    
    // Focus on OTP input
    this.otpInput.focus();
  }

  showCredentialsForm() {
    // Show credentials form
    this.credentialsForm.style.display = 'block';
    
    // Hide OTP form
    this.otpForm.style.display = 'none';
    
    // Clear pending state
    this.pendingEmail = null;
    this.pendingPurpose = null;
    
    this.clearError();
    this.clearOtpError();
  }

  async handleVerifyOtp() {
    this.clearOtpError();
    
    const otpCode = this.otpInput.value.trim();
    
    if (!otpCode || otpCode.length !== 6) {
      this.showOtpError('Please enter a 6-digit code');
      return;
    }

    this.verifyOtpBtn.disabled = true;
    this.verifyOtpBtn.textContent = 'Verifying...';

    try {
      let result;
      
      if (this.pendingPurpose === 'signup') {
        result = await window.ApiService.auth.verifySignup(this.pendingEmail, otpCode);
      } else {
        result = await window.ApiService.auth.verifyLogin(this.pendingEmail, otpCode);
      }
      
      // Success! User is now authenticated
      this.currentUser = result.data;
      this.onAuthSuccess();
    } catch (err) {
      this.showOtpError(err.message);
    } finally {
      this.verifyOtpBtn.disabled = false;
      this.verifyOtpBtn.textContent = 'Verify Code';
    }
  }

  async handleResendOtp() {
    this.clearOtpError();
    
    this.resendOtpBtn.disabled = true;
    this.resendOtpBtn.textContent = 'Sending...';

    try {
      await window.ApiService.auth.resendOtp(this.pendingEmail, this.pendingPurpose);
      this.showOtpSuccess('New verification code sent to your email!');
      
      // Clear OTP input
      this.otpInput.value = '';
      this.otpInput.focus();
    } catch (err) {
      this.showOtpError(err.message);
    } finally {
      this.resendOtpBtn.disabled = false;
      this.resendOtpBtn.textContent = 'Resend Code';
    }
  }

  async handleLogout() {
    try {
      await window.ApiService.auth.logout();
      this.currentUser = null;
      this.onLogoutSuccess();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  async checkAuth() {
    try {
      const result = await window.ApiService.auth.getCurrentUser();
      this.currentUser = result.data;
      this.onAuthSuccess();
      return true;
    } catch (err) {
      this.onLogoutSuccess();
      return false;
    }
  }

  onAuthSuccess() {
    // Hide auth form, show app
    this.authContainer.style.display = 'none';
    this.appContainer.style.display = 'block';
    
    // Update user info
    if (this.userInfoEl && this.currentUser) {
      this.userInfoEl.textContent = `Welcome, ${this.currentUser.firstName}!`;
    }
    
    // Clear forms
    this.emailInput.value = '';
    this.passwordInput.value = '';
    this.firstNameInput.value = '';
    this.lastNameInput.value = '';
    this.otpInput.value = '';
    
    // Reset to credentials form
    this.showCredentialsForm();
    
    // Notify todo component
    if (window.todoComponent) {
      window.todoComponent.onUserLoggedIn();
    }
  }

  onLogoutSuccess() {
    // Show auth form, hide app
    this.authContainer.style.display = 'block';
    this.appContainer.style.display = 'none';
    
    // Switch back to login mode
    this.switchToLogin();
    
    // Reset to credentials form
    this.showCredentialsForm();
    
    // Notify todo component
    if (window.todoComponent) {
      window.todoComponent.onUserLoggedOut();
    }
  }

  showError(message) {
    if (this.errorEl) {
      this.errorEl.textContent = message;
      this.errorEl.style.display = 'block';
    }
  }

  clearError() {
    if (this.errorEl) {
      this.errorEl.textContent = '';
      this.errorEl.style.display = 'none';
    }
  }

  showOtpError(message) {
    if (this.otpErrorEl) {
      this.otpErrorEl.textContent = message;
      this.otpErrorEl.style.display = 'block';
      this.otpErrorEl.className = 'error-message';
    }
  }

  showOtpSuccess(message) {
    if (this.otpErrorEl) {
      this.otpErrorEl.textContent = message;
      this.otpErrorEl.style.display = 'block';
      this.otpErrorEl.className = 'success-message';
    }
  }

  clearOtpError() {
    if (this.otpErrorEl) {
      this.otpErrorEl.textContent = '';
      this.otpErrorEl.style.display = 'none';
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

// Initialize auth component when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.authComponent = new AuthComponent();
  });
} else {
  window.authComponent = new AuthComponent();
}