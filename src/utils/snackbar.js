import { useState } from 'react';

// Global snackbar state management
export const useSnackbarState = () => {
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    variant: 'default'
  });

  const showSnackbar = (message, variant = 'default') => {
    setSnackbarState({
      open: true,
      message,
      variant
    });
  };

  const hideSnackbar = () => {
    setSnackbarState(prev => ({
      ...prev,
      open: false
    }));
  };

  const showSuccessSnackbar = (message) => showSnackbar(message, 'success');
  const showErrorSnackbar = (message) => showSnackbar(message, 'error');
  const showWarningSnackbar = (message) => showSnackbar(message, 'warning');

  return {
    snackbarState,
    showSnackbar,
    hideSnackbar,
    showSuccessSnackbar,
    showErrorSnackbar,
    showWarningSnackbar
  };
};

// Simple global notification function (fallback)
export const enqueueSnackbar = (message, options = {}) => {
  const variant = options.variant || 'default';
  console.log(`[${variant.toUpperCase()} Notification]`, message);
  
  // If using browser alerts as a last resort
  if (options.fallbackToAlert) {
    switch (variant) {
      case 'error':
        alert(`❌ ${message}`);
        break;
      case 'success':
        alert(`✅ ${message}`);
        break;
      case 'warning':
        alert(`⚠️ ${message}`);
        break;
      default:
        alert(message);
    }
  }
};
