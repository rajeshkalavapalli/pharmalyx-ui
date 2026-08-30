import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Badge,
  Avatar,
} from '@mui/material';

import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  const getPageDetails = () => {
    switch (location.pathname) {
      case '/dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Welcome to Pharmalyx',
        };

      case '/admin/Users':
        return {
          title: 'Users',
          subtitle: 'Manage users and their organizational access.',
        };

      default:
        return {
          title: '',
          subtitle: '',
        };
    }
  };

  const { title, subtitle } = getPageDetails();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',

        borderBottom: '1px solid',
        borderColor: 'divider',

        backgroundImage: 'none',
      }}
    >
      <Toolbar
        sx={{
          minHeight: '72px !important',

          px: {
            xs: 2,
            md: 3,
          },

          gap: 2,
        }}
      >

        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 650,
              color: 'text.primary',

              letterSpacing: '-0.025em',
              lineHeight: 1.3,

              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 400,
              color: 'text.secondary',

              mt: 0.35,

              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </Typography>
        </Box>


        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',

            gap: 0.75,
          }}
        >

          {/* =============================================== */}
          {/* NOTIFICATIONS */}
          {/* =============================================== */}

          <IconButton
            sx={{
              width: 42,
              height: 42,

              borderRadius: 1.5,

              color: 'text.secondary',

              border: '1px solid transparent',

              '&:hover': {
                backgroundColor: 'rgba(83, 109, 255, 0.06)',
                color: 'primary.main',
                borderColor: 'rgba(83, 109, 255, 0.08)',
              },
            }}
          >
            <Badge
              badgeContent={3}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: 9,
                  fontWeight: 700,

                  minWidth: 16,
                  height: 16,

                  padding: '0 4px',

                  border: '2px solid #FFFFFF',
                },
              }}
            >
              <NotificationsNoneRoundedIcon
                sx={{
                  fontSize: 21,
                }}
              />
            </Badge>
          </IconButton>


          {/* =============================================== */}
          {/* USER ACCOUNT */}
          {/* =============================================== */}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',

              gap: 1.1,

              ml: 0.5,

              px: 1,
              py: 0.6,

              borderRadius: 1.75,

              cursor: 'pointer',

              border: '1px solid transparent',

              transition:
                'background-color 160ms ease, border-color 160ms ease',

              '&:hover': {
                backgroundColor: '#F7F9FC',
                borderColor: '#E4E9F1',
              },
            }}
          >

            {/* Avatar */}

            <Avatar
              sx={{
                width: 36,
                height: 36,

                background:
                  'linear-gradient(135deg, #536DFF 0%, #7C5CFF 100%)',

                color: '#FFFFFF',

                fontSize: 13,
                fontWeight: 700,

                boxShadow:
                  '0 4px 12px rgba(83, 109, 255, 0.20)',
              }}
            >
              M
            </Avatar>


            {/* User information */}

            <Box
              sx={{
                display: {
                  xs: 'none',
                  sm: 'block',
                },

                minWidth: 78,
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,

                  fontWeight: 650,

                  color: 'text.primary',

                  lineHeight: 1.3,
                }}
              >
                Manager
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,

                  fontWeight: 400,

                  color: 'text.secondary',

                  lineHeight: 1.3,

                  mt: 0.2,
                }}
              >
                Manager
              </Typography>
            </Box>


            {/* Account dropdown indicator */}

            <KeyboardArrowDownRoundedIcon
              sx={{
                fontSize: 19,

                color: 'text.secondary',

                ml: 0.25,
              }}
            />

          </Box>

        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;