// Main application initialization

(function() {
  'use strict';

  function initializeApp() {
    console.log('🚀 Todo App initializing...');

    // Check authentication status
    if (window.authComponent) {
      window.authComponent.checkAuth().then(isAuthenticated => {
        console.log('Authentication check:', isAuthenticated ? '✅ Logged in' : '❌ Not logged in');
      });
    }

    setupGlobalErrorHandler();
    console.log('✅ Todo App ready!');
  }

  function setupGlobalErrorHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const errorMsg = event.reason?.message || 'An unexpected error occurred';
      
      if (window.todoComponent) {
        window.todoComponent.showError(errorMsg);
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