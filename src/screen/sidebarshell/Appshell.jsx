import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';

function AppShell() {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        backgroundColor: 'background.default',
      }}
    >
      <Sidebar />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
        }}
      >
        <Header />

        <Box
          component="main"
          sx={{
            flex: 1,

            p: {
              xs: 2,
              md: 3,
            },

            minHeight: 0,
            minWidth: 0,

            overflowY: 'auto',

            backgroundColor: 'background.default',

            // Very subtle workspace separation
            borderTop: '1px solid',
            borderColor: 'rgba(16, 24, 40, 0.025)',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AppShell;