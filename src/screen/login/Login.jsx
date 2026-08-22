import {
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';

import PharmalyxLogo from '../../assets/PharmalyxLogo.png';
import PharmalyxLoginillustrationLight from '../../assets/PharmalyxLoginillustrationLight.png'
import PharmalyxLoginillustration from '../../assets/PharmalyxLoginillustration.png';

function Login() {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        minHeight: '100dvh',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',

        backgroundImage: `
          linear-gradient(
            90deg,
            rgba(247, 249, 252, 0.08) 0%,
            rgba(247, 249, 252, 0.03) 45%,
            rgba(247, 249, 252, 0.35) 100%
          ),
          url(${PharmalyxLoginillustrationLight})
        `,

        backgroundSize: 'cover',

        backgroundPosition: {
          xs: '30% center',
          md: 'center center',
        },

        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Background overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(247,249,252,0.08) 0%, rgba(247,249,252,0.03) 45%, rgba(247,249,252,0.35) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Pharmalyx Logo */}
      <Box
        sx={{
          position: 'absolute',
          top: {
            xs: 20,
            sm: 28,
            md: 32,
          },
          left: {
            xs: 20,
            sm: 32,
            md: 40,
          },
          zIndex: 2,
        }}
      >
        <Box
          component="img"
          src={PharmalyxLogo}
          alt="Pharmalyx"
          sx={{
            width: {
              xs: 140,
              sm: 170,
              md: 190,
            },
            height: 'auto',
          }}
        />
      </Box>

      {/* Login Area */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,

          width: '100%',
          height: '100%',
          boxSizing: 'border-box',

          display: 'flex',
          alignItems: 'center',

          justifyContent: {
            xs: 'center',
            md: 'flex-end',
          },

          px: {
            xs: 2,
            sm: 4,
            md: 7,
            lg: 10,
          },

          py: {
            xs: 4,
            md: 3,
          },
        }}
      >
        {/* Login Card */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 410,

            backgroundColor: 'rgba(255, 255, 255, 0.97)',

            borderRadius: 3,

            boxShadow:
              '0 18px 50px rgba(23, 43, 77, 0.18)',

            border: '1px solid rgba(255, 255, 255, 0.9)',

            backdropFilter: 'blur(10px)',

            boxSizing: 'border-box',

            px: {
              xs: 3,
              sm: 4,
            },

            py: {
              xs: 3,
              sm: 3.5,
            },
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Box
              component="img"
              src={PharmalyxLogo}
              alt="Pharmalyx"
              sx={{
                width: {
                  xs: 150,
                  sm: 170,
                },
                height: 'auto',
              }}
            />
          </Box>

          {/* Welcome */}
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              color: 'text.primary',
              fontWeight: 600,
              fontSize: {
                xs: '24px',
                sm: '27px',
              },
              mb: 0.5,
            }}
          >
            Welcome back
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              mb: 3,
            }}
          >
            Sign in to your Pharmalyx account
          </Typography>

          {/* Email */}
          <TextField
            fullWidth
            label="Email or Mobile Number"
            variant="outlined"
            sx={{
              mb: 1.8,

              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#FFFFFF',
              },
            }}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            sx={{
              mb: 1,

              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#FFFFFF',
              },
            }}
          />

          {/* Forgot Password */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 2.5,
            }}
          >
            <Typography
              color="primary"
              sx={{
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',

                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot Password?
            </Typography>
          </Box>

          {/* Sign In */}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{
              height: 48,
              borderRadius: 2,
              fontSize: '15px',
              fontWeight: 600,
              textTransform: 'none',

              boxShadow:
                '0 7px 18px rgba(23, 105, 170, 0.22)',

              '&:hover': {
                boxShadow:
                  '0 9px 22px rgba(23, 105, 170, 0.30)',
              },
            }}
          >
            Sign In
          </Button>

          {/* Security */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 2.5,
            }}
          >
            Secure access to Pharmalyx
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;