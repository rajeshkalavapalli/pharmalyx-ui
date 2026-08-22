import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Badge,
  Avatar,
} from '@mui/material';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

function Header() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          minHeight: '72px !important',
          px: {
            xs: 2,
            md: 3,
          },
        }}
      >
        {/* ================= LEFT SIDE ================= */}

        <Box
          sx={{
            flex: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 600,
              color: 'text.primary',
              letterSpacing: '-0.2px',
            }}
          >
            Dashboard
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: 'text.secondary',
              mt: 0.2,
            }}
          >
            Welcome to Pharmalyx
          </Typography>
        </Box>

        {/* ================= RIGHT SIDE ================= */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {/* ================= NOTIFICATIONS ================= */}

          <IconButton
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              color: 'text.secondary',

              '&:hover': {
                backgroundColor: 'sidebar.hover',
                color: 'primary.main',
              },
            }}
          >
            <Badge
              badgeContent={3}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: 9,
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                },
              }}
            >
              <NotificationsNoneIcon
                sx={{
                  fontSize: 22,
                }}
              />
            </Badge>
          </IconButton>

          {/* ================= USER ================= */}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              ml: 1,
              px: 1,
              py: 0.75,
              borderRadius: 2,
              cursor: 'pointer',

              '&:hover': {
                backgroundColor: 'sidebar.hover',
              },
            }}
          >
            {/* Avatar */}

            <Avatar
              sx={{
                width: 36,
                height: 36,

                backgroundColor: 'primary.main',
                color: 'primary.contrastText',

                fontSize: 14,
                fontWeight: 600,

                boxShadow: '0 3px 10px rgba(11, 114, 133, 0.20)',
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
                minWidth: 80,
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'text.primary',
                  lineHeight: 1.3,
                }}
              >
                Manager
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  color: 'text.secondary',
                  lineHeight: 1.3,
                  mt: 0.2,
                }}
              >
                Manager
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;