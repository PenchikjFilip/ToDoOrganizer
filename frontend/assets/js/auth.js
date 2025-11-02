// Authentication UI logic

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isLoginMode = true;
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    // Form elements
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.firstNameInput = document.getElementById('firstName');
    this.lastNameInput = document.getElementById('lastName');
    
    // Buttons
    this.showSignupBtn = document.getElementById('showSignup');
    this.showLoginBtn = document.getElementById('showLogin');
    this.authActionBtn = document.getElementById('authAction');
    this.logoutBtn = document.getElementById('logoutBtn');
    
    // Containers
    this.authContainer = document.getElementById('authContainer');
    this.appContainer = document.getElementById('appContainer');
    this.userInfoEl = document.getElementById('userInfo');
    this.errorEl = document.getElementById('authError');
  }

  attachEventListeners() {
    this.showSignupBtn.addEventListener('click', () => this.switchToSignup());
    this.showLoginBtn.addEventListener('click', () => this.switchToLogin());
    this.authActionBtn.addEventListener('click', () => this.handleAuthAction());
    this.logoutBtn.addEventListener('click', () => this.handleLogout());
    
    // Allow Enter key to submit
    [this.emailInput, this.passwordInput, this.firstNameInput, this.lastNameInput].forEach(input => {
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.handleAuthAction();
        });
      }
    });
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

  async login(email, password) {
    const result = await window.API.auth.login(email, password);
    this.currentUser = result.data;
    this.onAuthSuccess();
  }

  async signup(firstName, lastName, email, password) {
    const result = await window.API.auth.signup(firstName, lastName, email, password);
    this.currentUser = result.data;
    this.onAuthSuccess();
  }

  async handleLogout() {
    try {
      await window.API.auth.logout();
      this.currentUser = null;
      this.onLogoutSuccess();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  async checkAuth() {
    try {
      const result = await window.API.auth.getCurrentUser();
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
    
    // Clear form
    this.emailInput.value = '';
    this.passwordInput.value = '';
    this.firstNameInput.value = '';
    this.lastNameInput.value = '';
    
    // Notify todo manager
    if (window.todoManager) {
      window.todoManager.onUserLoggedIn();
    }
  }

  onLogoutSuccess() {
    // Show auth form, hide app
    this.authContainer.style.display = 'block';
    this.appContainer.style.display = 'none';
    
    // Switch back to login mode
    this.switchToLogin();
    
    // Notify todo manager
    if (window.todoManager) {
      window.todoManager.onUserLoggedOut();
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

  getCurrentUser() {
    return this.currentUser;
  }
}

// Initialize auth manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
  });
} else {
  window.authManager = new AuthManager();
}