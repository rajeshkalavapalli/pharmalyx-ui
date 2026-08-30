import {
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';

import {
  BarChartOutlined,
  GpsFixedOutlined,
  GroupsOutlined,
  ShieldOutlined,
} from '@mui/icons-material';

import PharmalyxLogo from '../../assets/PharmalyxLogo.png';
import PharmalyxLoginillustrationLight from '../../assets/PharmalyxLoginillustrationLight.png';
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
            rgba(244, 247, 251, 0.06) 0%,
            rgba(244, 247, 251, 0.02) 45%,
            rgba(244, 247, 251, 0.42) 100%
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

      {/* ================================================= */}
      {/* BACKGROUND OVERLAY */}
      {/* ================================================= */}

      <Box
        sx={{
          position: 'absolute',
          inset: 0,

          background:
            'linear-gradient(90deg, rgba(244,247,251,0.04) 0%, rgba(244,247,251,0.02) 45%, rgba(244,247,251,0.36) 100%)',

          pointerEvents: 'none',
        }}
      />


      {/* ================================================= */}
      {/* BRAND LOGO */}
      {/* ================================================= */}

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


      {/* ================================================= */}
      {/* LEFT SIDE PROMOTIONAL CONTENT */}
      {/* ================================================= */}

      <Box
        sx={{
          position: 'absolute',

          zIndex: 2,

          left: {
            xs: 20,
            sm: 32,
            md: 64,
            lg: 78,
          },

          top: {
            md: '56%',
            lg: '57%',
          },

          transform: 'translateY(-50%)',

          width: {
            md: 430,
            lg: 470,
          },

          display: {
            xs: 'none',
            md: 'block',
          },
        }}
      >

        {/* ================================================= */}
        {/* HEADLINE */}
        {/* ================================================= */}

        <Typography
          sx={{
            fontSize: {
              md: 36,
              lg: 42,
            },

            lineHeight: 1.08,

            fontWeight: 700,

            letterSpacing: '-0.035em',

            color: 'common.white',

            maxWidth: 440,

            textShadow:
              '0 2px 10px rgba(0, 0, 0, 0.18)',
          }}
        >
          Intelligence that
          <br />
          drives better
          <br />

          <Box
            component="span"
            sx={{
              background: (theme) =>
                `linear-gradient(
                  90deg,
                  ${theme.palette.brand.azure} 0%,
                  ${theme.palette.brand.lumen} 100%
                )`,

              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',

              backgroundClip: 'text',
            }}
          >
            health outcomes.
          </Box>
        </Typography>


        {/* ================================================= */}
        {/* DESCRIPTION */}
        {/* ================================================= */}

        <Typography
          sx={{
            mt: 2,

            maxWidth: 390,

            fontSize: {
              md: 12,
              lg: 13,
            },

            lineHeight: 1.6,

            color: 'common.white',

            opacity: 0.72,

            textShadow:
              '0 1px 5px rgba(0, 0, 0, 0.18)',
          }}
        >
          Pharmalyx empowers field teams with real-time
          <br />
          insights, smarter decisions, and measurable impact
          <br />
          across every touchpoint.
        </Typography>


        {/* ================================================= */}
        {/* FOUR FEATURES */}
        {/* ================================================= */}

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: 'repeat(4, 1fr)',

            gap: {
              md: 1.2,
              lg: 1.8,
            },

            mt: 7,

            width: '100%',

            maxWidth: 450,
          }}
        >

          {/* ================================================= */}
          {/* REAL-TIME INTELLIGENCE */}
          {/* ================================================= */}

          <Box
            sx={{
              display: 'flex',

              flexDirection: 'column',

              alignItems: 'center',

              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,

                display: 'flex',

                alignItems: 'center',
                justifyContent: 'center',

                border: '1px solid',

                borderColor: 'brand.azure',

                borderRadius: '50%',

                color: 'brand.azure',

                backgroundColor: 'rgba(0, 0, 0, 0.10)',

                backdropFilter: 'blur(3px)',

                mb: 1,
              }}
            >
              <BarChartOutlined
                sx={{
                  fontSize: 20,
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: {
                  md: 9,
                  lg: 9.5,
                },

                lineHeight: 1.25,

                fontWeight: 500,

                color: 'common.white',

                textShadow:
                  '0 1px 5px rgba(0, 0, 0, 0.35)',
              }}
            >
              Real-time
              <br />
              Intelligence
            </Typography>
          </Box>


          {/* ================================================= */}
          {/* SMARTER DECISIONS */}
          {/* ================================================= */}

          <Box
            sx={{
              display: 'flex',

              flexDirection: 'column',

              alignItems: 'center',

              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,

                display: 'flex',

                alignItems: 'center',
                justifyContent: 'center',

                border: '1px solid',

                borderColor: 'brand.azure',

                borderRadius: '50%',

                color: 'brand.azure',

                backgroundColor: 'rgba(0, 0, 0, 0.10)',

                backdropFilter: 'blur(3px)',

                mb: 1,
              }}
            >
              <GpsFixedOutlined
                sx={{
                  fontSize: 20,
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: {
                  md: 9,
                  lg: 9.5,
                },

                lineHeight: 1.25,

                fontWeight: 500,

                color: 'common.white',

                textShadow:
                  '0 1px 5px rgba(0, 0, 0, 0.35)',
              }}
            >
              Smarter
              <br />
              Decisions
            </Typography>
          </Box>


          {/* ================================================= */}
          {/* FIELD TEAM EMPOWERMENT */}
          {/* ================================================= */}

          <Box
            sx={{
              display: 'flex',

              flexDirection: 'column',

              alignItems: 'center',

              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,

                display: 'flex',

                alignItems: 'center',
                justifyContent: 'center',

                border: '1px solid',

                borderColor: 'brand.azure',

                borderRadius: '50%',

                color: 'brand.azure',

                backgroundColor: 'rgba(0, 0, 0, 0.10)',

                backdropFilter: 'blur(3px)',

                mb: 1,
              }}
            >
              <GroupsOutlined
                sx={{
                  fontSize: 20,
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: {
                  md: 9,
                  lg: 9.5,
                },

                lineHeight: 1.25,

                fontWeight: 500,

                color: 'common.white',

                textShadow:
                  '0 1px 5px rgba(0, 0, 0, 0.35)',
              }}
            >
              Field Team
              <br />
              Empowerment
            </Typography>
          </Box>


          {/* ================================================= */}
          {/* TRUSTED COMPLIANCE */}
          {/* ================================================= */}

          <Box
            sx={{
              display: 'flex',

              flexDirection: 'column',

              alignItems: 'center',

              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,

                display: 'flex',

                alignItems: 'center',
                justifyContent: 'center',

                border: '1px solid',

                borderColor: 'brand.azure',

                borderRadius: '50%',

                color: 'brand.azure',

                backgroundColor: 'rgba(0, 0, 0, 0.10)',

                backdropFilter: 'blur(3px)',

                mb: 1,
              }}
            >
              <ShieldOutlined
                sx={{
                  fontSize: 20,
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: {
                  md: 9,
                  lg: 9.5,
                },

                lineHeight: 1.25,

                fontWeight: 500,

                color: 'common.white',

                textShadow:
                  '0 1px 5px rgba(0, 0, 0, 0.35)',
              }}
            >
              Trusted
              <br />
              Compliance
            </Typography>
          </Box>

        </Box>

      </Box>


      {/* ================================================= */}
      {/* LOGIN AREA */}
      {/* ================================================= */}

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

        {/* ================================================= */}
        {/* LOGIN CARD */}
        {/* ================================================= */}

        <Box
          sx={{
            width: '100%',
            maxWidth: 420,

            position: 'relative',

            backgroundColor: 'rgba(255, 255, 255, 0.96)',

            borderRadius: 3,

            border: '1px solid rgba(255, 255, 255, 0.95)',

            boxShadow:
              '0 24px 70px rgba(16, 24, 40, 0.14)',

            backdropFilter: 'blur(14px)',

            boxSizing: 'border-box',

            px: {
              xs: 3,
              sm: 4,
            },

            py: {
              xs: 3,
              sm: 4,
            },

            overflow: 'hidden',

            // Pharmalyx signature accent
            '&::before': {
              content: '""',

              position: 'absolute',

              top: 0,
              left: 0,
              right: 0,

              height: 3,

              background:
                'linear-gradient(90deg, #536DFF 0%, #7C5CFF 55%, #2DD4BF 100%)',
            },
          }}
        >

          {/* ================================================= */}
          {/* LOGO */}
          {/* ================================================= */}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',

              mb: 2.5,
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


          {/* ================================================= */}
          {/* WELCOME */}
          {/* ================================================= */}

          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',

              color: 'text.primary',

              fontWeight: 700,

              fontSize: {
                xs: '24px',
                sm: '27px',
              },

              letterSpacing: '-0.025em',

              mb: 0.6,
            }}
          >
            Welcome back
          </Typography>


          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: 'center',

              mb: 3.5,

              lineHeight: 1.5,
            }}
          >
            Sign in to your Pharmalyx account
          </Typography>


          {/* ================================================= */}
          {/* EMAIL / MOBILE */}
          {/* ================================================= */}

          <TextField
            fullWidth
            label="Email or Mobile Number"
            variant="outlined"
            sx={{
              mb: 2,
            }}
          />


          {/* ================================================= */}
          {/* PASSWORD */}
          {/* ================================================= */}

          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            sx={{
              mb: 1,
            }}
          />


          {/* ================================================= */}
          {/* FORGOT PASSWORD */}
          {/* ================================================= */}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',

              mb: 2.75,
            }}
          >
            <Typography
              color="primary"
              sx={{
                fontSize: '13px',

                fontWeight: 600,

                cursor: 'pointer',

                transition: 'color 160ms ease',

                '&:hover': {
                  color: 'primary.dark',
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot Password?
            </Typography>
          </Box>


          {/* ================================================= */}
          {/* SIGN IN */}
          {/* ================================================= */}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{
              height: 48,

              borderRadius: 1.5,

              fontSize: '14px',

              fontWeight: 650,

              boxShadow:
                '0 8px 22px rgba(83, 109, 255, 0.20)',
            }}
          >
            Sign In
          </Button>


          {/* ================================================= */}
          {/* SECURITY */}
          {/* ================================================= */}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',

              textAlign: 'center',

              mt: 2.5,

              fontSize: 11.5,
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