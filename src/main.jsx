import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import './index.css';
import App from './App.jsx';
import PharmalyxTheme from './Theme/Theme.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={PharmalyxTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);