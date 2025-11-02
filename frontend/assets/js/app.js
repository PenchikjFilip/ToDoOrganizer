// Main application initialization

(function() {
  'use strict';

  // Wait for all modules to be ready
  function initializeApp() {
    console.log('🚀 Todo App initializing...');

    // Check if user is already authenticated
    if (window.authManager) {
      window.authManager.checkAuth().then(isAuthenticated => {
        console.log('Authentication check:', isAuthenticated ? '✅ Logged in' : '❌ Not logged in');
      });
    }

    // Add any global event listeners or app-wide functionality here
    setupGlobalErrorHandler();
    
    console.log('✅ Todo App ready!');
  }

  // Global error handler for unhandled promise rejections
  function setupGlobalErrorHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Show user-friendly error if possible
      const errorMsg = event.reason?.message || 'An unexpected error occurred';
      
      // Try to show error in todo manager if available
      if (window.todoManager) {
        window.todoManager.showError(errorMsg);
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
})();