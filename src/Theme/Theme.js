import { createTheme } from '@mui/material/styles';

const PharmalyxTheme = createTheme({
  palette: {
    
    // MAIN APPLICATION BRAND
  

    primary: {
      main: '#0B7285',
      dark: '#075766',
      light: '#22A6B3',
      contrastText: '#FFFFFF',
    },

    
    // DEEP OCEAN
    // Used for dark application surfaces
    

    secondary: {
      main: '#081F2A',
      dark: '#061820',
      light: '#103746',
      contrastText: '#FFFFFF',
    },

    
    // SIDEBAR
    // Sidebar-specific design tokens
  

    sidebar: {
      background: '#061820',
      surface: '#103746',
      active: '#0B7285',
      text: '#D9E2EC',
      mutedText: '#9FB3C8',
      border: 'rgba(217, 226, 236, 0.10)',
      hover: 'rgba(217, 226, 236, 0.06)',
      scrollbar: 'rgba(217, 226, 236, 0.18)',
    },

   
    // APPLICATION BACKGROUND
  

    background: {
      default: '#F4F7F9',
      paper: '#FFFFFF',
    },

    
    // TEXT
    

    text: {
      primary: '#102A43',
      secondary: '#627D98',
      disabled: '#9FB3C8',
    },

    divider: '#D9E2EC',

    
    // STATUS COLORS
    

    success: {
      main: '#16A34A',
      dark: '#15803D',
      light: '#22C55E',
      contrastText: '#FFFFFF',
    },

    warning: {
      main: '#D97706',
      contrastText: '#FFFFFF',
    },

    error: {
      main: '#DC2626',
      contrastText: '#FFFFFF',
    },

    info: {
      main: '#0891B2',
      contrastText: '#FFFFFF',
    },
  },

  
  // GLOBAL SHAPE
  

  shape: {
    borderRadius: 8,
  },

  
  // TYPOGRAPHY
  
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',

    h1: {
      fontSize: '32px',
      fontWeight: 600,
    },

    h2: {
      fontSize: '28px',
      fontWeight: 600,
    },

    h3: {
      fontSize: '24px',
      fontWeight: 600,
    },

    h4: {
      fontSize: '20px',
      fontWeight: 600,
    },

    h5: {
      fontSize: '18px',
      fontWeight: 600,
    },

    h6: {
      fontSize: '16px',
      fontWeight: 600,
    },

    body1: {
      fontSize: '14px',
      fontWeight: 400,
    },

    body2: {
      fontSize: '13px',
      fontWeight: 400,
    },
  },
});

export default PharmalyxTheme;