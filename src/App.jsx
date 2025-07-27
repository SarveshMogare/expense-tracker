import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Snackbar, Alert } from '@mui/material';
import Bot from './components/Bot';

import theme from './theme';
import AppRoutes from './routes';
import { useSnackbarState } from './utils/snackbar';

function App() {
  const { 
    snackbarState, 
    hideSnackbar 
  } = useSnackbarState();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <AppRoutes />
          {/* <Bot /> */}
          {/* Custom Snackbar */}
          <Snackbar
            open={snackbarState.open}
            autoHideDuration={3000}
            onClose={hideSnackbar}
            anchorOrigin={{ 
              vertical: 'bottom', 
              horizontal: 'right' 
            }}
          >
            <Alert 
              onClose={hideSnackbar}
              severity={snackbarState.variant}
              sx={{ width: '100%' }}
            >
              {snackbarState.message}
            </Alert>
          </Snackbar>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
