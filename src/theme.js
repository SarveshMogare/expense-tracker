import { createTheme } from '@mui/material/styles';

// Custom color palette inspired by travel and adventure
const palette = {
  primary: {
    light: '#6FDFDF', // Soft turquoise
    main: '#00A3A3',  // Vibrant teal
    dark: '#006D6D',  // Deep teal
    contrastText: '#FFFFFF'
  },
  secondary: {
    light: '#FFB74D', // Soft orange
    main: '#FF9800',  // Vibrant orange
    dark: '#F57C00',  // Deep orange
    contrastText: '#FFFFFF'
  },
  success: {
    light: '#81C784', // Soft green
    main: '#4CAF50',  // Vibrant green
    dark: '#388E3C',  // Deep green
    contrastText: '#FFFFFF'
  },
  warning: {
    light: '#FFD54F', // Soft yellow
    main: '#FFC107',  // Vibrant yellow
    dark: '#FFA000',  // Deep yellow
    contrastText: '#000000'
  },
  error: {
    light: '#E57373', // Soft red
    main: '#F44336',  // Vibrant red
    dark: '#D32F2F',  // Deep red
    contrastText: '#FFFFFF'
  },
  background: {
    default: '#F5F5F5', // Light gray background
    paper: '#FFFFFF'    // White paper background
  },
  text: {
    primary: '#333333',   // Dark gray for primary text
    secondary: '#666666', // Lighter gray for secondary text
    disabled: '#999999'   // Disabled text color
  }
};

const theme = createTheme({
  palette: palette,
  typography: {
    fontFamily: [
      'Inter', 
      '-apple-system', 
      'BlinkMacSystemFont', 
      '"Segoe UI"', 
      'Roboto', 
      '"Helvetica Neue"', 
      'Arial', 
      'sans-serif'
    ].join(','),
    h1: {
      fontWeight: 600,
      color: palette.primary.dark
    },
    h2: {
      fontWeight: 600,
      color: palette.primary.dark
    },
    h6: {
      fontWeight: 500,
      color: palette.primary.main
    },
    body1: {
      color: palette.text.primary
    },
    body2: {
      color: palette.text.secondary
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          height: 10
        }
      }
    }
  }
});

export default theme;
