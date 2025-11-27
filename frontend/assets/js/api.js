// Centralized API module for all backend communication with 2FA
const API_BASE = '/api';

// Helper function to handle API responses
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  
  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return null;
  }
  
  // Parse JSON responses
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }
  
  // Non-JSON responses
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return null;
}

// ==================== AUTH API ====================
const authAPI = {
  // Signup - Phase 1 (sends OTP)
  async signup(firstName, lastName, emailId, password) {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, emailId, password })
    });
    return handleResponse(response);
  },
  
  // Verify Signup - Phase 2 (verifies OTP)
  async verifySignup(emailId, otpCode) {
    const response = await fetch(`${API_BASE}/auth/verify-signup`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId, otpCode })
    });
    return handleResponse(response);
  },
  
  // Login - Phase 1 (validates password, sends OTP)
  async login(emailId, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId, password })
    });
    return handleResponse(response);
  },
  
  // Verify Login - Phase 2 (verifies OTP)
  async verifyLogin(emailId, otpCode) {
    const response = await fetch(`${API_BASE}/auth/verify-login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId, otpCode })
    });
    return handleResponse(response);
  },
  
  // Resend OTP
  async resendOtp(emailId, purpose) {
    const response = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId, purpose })
    });
    return handleResponse(response);
  },
  
  // Logout user
  async logout() {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  // Get current user
  async getCurrentUser() {
    const response = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// ==================== TODO API ====================
const todoAPI = {
  // Get all todos
  async getAll() {
    const response = await fetch(`${API_BASE}/todos`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  // Get a single todo
  async getById(id) {
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  // Create a new todo
  async create(title) {
    const response = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    return handleResponse(response);
  },
  
  // Update a todo
  async update(id, updates) {
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse(response);
  },
  
  // Delete a todo
  async delete(id) {
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  // Delete all completed todos
  async deleteCompleted() {
    const response = await fetch(`${API_BASE}/todos/completed/all`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Export APIs
window.API = {
  auth: authAPI,
  todo: todoAPI
};