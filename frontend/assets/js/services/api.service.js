// Centralized API service for all backend communication

(function() {
  'use strict';

  class ApiService {
    constructor() {
      this.baseURL = '/api';
    }

    async handleResponse(response) {
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
    auth = {
      signup: async (firstName, lastName, emailId, password) => {
        const response = await fetch(`${this.baseURL}/auth/signup`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, emailId, password })
        });
        return this.handleResponse(response);
      },
      
      verifySignup: async (emailId, otpCode) => {
        const response = await fetch(`${this.baseURL}/auth/verify-signup`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailId, otpCode })
        });
        return this.handleResponse(response);
      },
      
      login: async (emailId, password) => {
        const response = await fetch(`${this.baseURL}/auth/login`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailId, password })
        });
        return this.handleResponse(response);
      },
      
      verifyLogin: async (emailId, otpCode) => {
        const response = await fetch(`${this.baseURL}/auth/verify-login`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailId, otpCode })
        });
        return this.handleResponse(response);
      },
      
      resendOtp: async (emailId, purpose) => {
        const response = await fetch(`${this.baseURL}/auth/resend-otp`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailId, purpose })
        });
        return this.handleResponse(response);
      },
      
      logout: async () => {
        const response = await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
        return this.handleResponse(response);
      },
      
      getCurrentUser: async () => {
        const response = await fetch(`${this.baseURL}/auth/me`, {
          credentials: 'include'
        });
        return this.handleResponse(response);
      }
    };

    // ==================== TODO API ====================
    todo = {
      getAll: async () => {
        const response = await fetch(`${this.baseURL}/todos`, {
          credentials: 'include'
        });
        return this.handleResponse(response);
      },
      
      getById: async (id) => {
        const response = await fetch(`${this.baseURL}/todos/${id}`, {
          credentials: 'include'
        });
        return this.handleResponse(response);
      },
      
      create: async (title) => {
        const response = await fetch(`${this.baseURL}/todos`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
        });
        return this.handleResponse(response);
      },
      
      update: async (id, updates) => {
        const response = await fetch(`${this.baseURL}/todos/${id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        return this.handleResponse(response);
      },
      
      delete: async (id) => {
        const response = await fetch(`${this.baseURL}/todos/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        return this.handleResponse(response);
      },
      
      deleteCompleted: async () => {
        const response = await fetch(`${this.baseURL}/todos/completed/all`, {
          method: 'DELETE',
          credentials: 'include'
        });
        return this.handleResponse(response);
      }
    };
  }

  // Create singleton instance immediately
  window.ApiService = new ApiService();
  console.log('✅ ApiService initialized');

})();