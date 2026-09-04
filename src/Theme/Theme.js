import { alpha, createTheme } from '@mui/material/styles';

const PharmalyxTheme = createTheme({
  // =========================================================
  // PHARMALYX DESIGN SYSTEM
  // ARCTIC BLUE — PREMIUM LIGHT INTELLIGENCE
  //
  // Personality:
  // Precise • Intelligent • Calm • Premium • Enterprise
  // =========================================================

  palette: {
    mode: 'light',

    // =======================================================
    // PRIMARY BRAND
    // ARCTIC BLUE
    //
    // Main product interaction color
    // =======================================================

    primary: {
      main: '#2F5F8F',
      dark: '#1E466D',
      light: '#5F8FBD',
      contrastText: '#FFFFFF',
    },

    // =======================================================
    // SECONDARY / DEEP ARCTIC
    //
    // Reserved for strong emphasis and navigation
    // =======================================================

    secondary: {
      main: '#183B5B',
      dark: '#102B44',
      light: '#315B7D',
      contrastText: '#FFFFFF',
    },

    // =======================================================
    // PHARMALYX BRAND TOKENS
    //
    // Keep custom colors centralized here.
    // Do not hardcode these colors inside components.
    // =======================================================

    brand: {
      arctic: '#2F5F8F',
      arcticDark: '#1E466D',
      arcticLight: '#5F8FBD',

      deepArctic: '#183B5B',
      deepArcticDark: '#102B44',
      deepArcticLight: '#315B7D',

      ice: '#EAF3FA',
      iceLight: '#F4F8FC',

      slate: '#64748B',
      graphite: '#1F2933',
    },

    // =======================================================
    // COMMAND / NAVIGATION LAYER
    //
    // Light premium enterprise shell
    // =======================================================

    command: {
      background: '#F4F7FA',
      surface: '#FFFFFF',
      elevated: '#FFFFFF',

      border: '#E2E8F0',

      text: '#1F2933',
      mutedText: '#6B7785',
    },

    // =======================================================
    // INTELLIGENCE LAYER
    //
    // Used for analytics / insights / intelligence modules
    // =======================================================

    intelligence: {
      background: '#F7FAFC',
      surface: '#FFFFFF',
      elevated: '#FFFFFF',

      primary: '#2F5F8F',
      accent: '#5F8FBD',

      border: '#DCE6EF',

      text: '#1F2933',
      mutedText: '#6B7785',
    },

    // =======================================================
    // SIDEBAR
    //
    // Minimal Modular Enterprise Navigation
    // =======================================================

    sidebar: {
  background: '#F4F7FA',
  surface: '#FFFFFF',

  active: '#183B5B',
  activeLight: '#EAF3FA',
  activeText: '#FFFFFF',

  text: '#2D3742',
  mutedText: '#6B7785',

  border: '#E2E8F0',

  hover: '#EAF3FA',

  scrollbar: '#CBD5E1',
},

    // =======================================================
    // WORKSPACE
    //
    // Premium neutral Arctic workspace
    // =======================================================

    background: {
      default: '#F7FAFC',
      paper: '#FFFFFF',
    },

    // =======================================================
    // TEXT SYSTEM
    // =======================================================

    text: {
      primary: '#1F2933',
      secondary: '#6B7785',
      disabled: '#9AA5B1',
    },

    // =======================================================
    // DIVIDER
    // =======================================================

    divider: '#E2E8F0',

    // =======================================================
    // STATUS COLORS
    //
    // Semantic colors only.
    // Do not use as general decoration.
    // =======================================================

    success: {
      main: '#2E7D5B',
      dark: '#216044',
      light: '#5BA982',
      contrastText: '#FFFFFF',
    },

    warning: {
      main: '#C58A1A',
      dark: '#96670F',
      light: '#E0B34D',
      contrastText: '#FFFFFF',
    },

    error: {
      main: '#C94F5C',
      dark: '#A83B47',
      light: '#E77A84',
      contrastText: '#FFFFFF',
    },

    info: {
      main: '#3F7FB8',
      dark: '#2F6390',
      light: '#72A8D8',
      contrastText: '#FFFFFF',
    },
  },

  // =========================================================
  // GLOBAL SHAPE
  //
  // Enterprise minimal:
  // Controlled radius, not overly rounded
  // =========================================================

  shape: {
    borderRadius: 8,
  },

  // =========================================================
  // TYPOGRAPHY
  // =========================================================

  typography: {
    fontFamily: 'Inter, Arial, Helvetica, sans-serif',

    h1: {
      fontSize: '32px',
      lineHeight: 1.2,
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },

    h2: {
      fontSize: '28px',
      lineHeight: 1.25,
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },

    h3: {
      fontSize: '24px',
      lineHeight: 1.3,
      fontWeight: 700,
      letterSpacing: '-0.015em',
    },

    h4: {
      fontSize: '20px',
      lineHeight: 1.35,
      fontWeight: 650,
      letterSpacing: '-0.01em',
    },

    h5: {
      fontSize: '18px',
      lineHeight: 1.4,
      fontWeight: 650,
    },

    h6: {
      fontSize: '16px',
      lineHeight: 1.45,
      fontWeight: 650,
    },

    body1: {
      fontSize: '14px',
      lineHeight: 1.6,
      fontWeight: 400,
    },

    body2: {
      fontSize: '13px',
      lineHeight: 1.55,
      fontWeight: 400,
    },

    button: {
      fontSize: '14px',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0',
    },
  },

  // =========================================================
  // COMPONENT DESIGN SYSTEM
  // =========================================================

  components: {
    // =======================================================
    // GLOBAL CSS BASELINE
    // =======================================================

    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor: '#F7FAFC',
        },

        body: {
          margin: 0,
          padding: 0,
          backgroundColor: '#F7FAFC',
          color: '#1F2933',
          fontFamily: 'Inter, Arial, Helvetica, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },

        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E1 transparent',
        },

        '*::-webkit-scrollbar': {
          width: '7px',
          height: '7px',
        },

        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },

        '*::-webkit-scrollbar-thumb': {
          background: '#CBD5E1',
          borderRadius: '10px',
        },

        '*::-webkit-scrollbar-thumb:hover': {
          background: '#94A3B8',
        },
      },
    },

    // =======================================================
    // PAPER
    //
    // Cards, panels and data surfaces
    // =======================================================

    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 4px 18px rgba(16, 24, 40, 0.035)',
        }),

        rounded: {
          borderRadius: 8,
        },
      },
    },

    // =======================================================
    // BUTTON
    // =======================================================

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 7,
          paddingLeft: 16,
          paddingRight: 16,
          fontWeight: 600,

          transition:
            'background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        },

        // ===================================================
        // PRIMARY BUTTON
        // ===================================================

        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,

          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
            boxShadow: `0 6px 16px ${alpha(
              theme.palette.primary.main,
              0.18
            )}`,
          },

          '&:active': {
            transform: 'translateY(1px)',
          },
        }),

        // ===================================================
        // OUTLINED BUTTON
        // ===================================================

        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,

          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },

          '&.MuiButton-colorError': {
            color: theme.palette.error.main,
            borderColor: theme.palette.error.main,

            '&:hover': {
              borderColor: theme.palette.error.dark,
              backgroundColor: alpha(theme.palette.error.main, 0.04),
            },
          },
        }),

        // ===================================================
        // TEXT BUTTON
        // ===================================================

        text: ({ theme }) => ({
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
          },
        }),
      },
    },

    // =======================================================
    // ICON BUTTON
    // =======================================================

    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 7,

          transition:
            'background-color 160ms ease, color 160ms ease',

          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.07),
          },
        }),
      },
    },

    // =======================================================
    // TABS
    // =======================================================

    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },

        indicator: ({ theme }) => ({
          height: 2,
          borderRadius: 2,
          backgroundColor: theme.palette.primary.main,
        }),
      },
    },

    // =======================================================
    // TAB
    // =======================================================

    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 48,

          paddingLeft: 18,
          paddingRight: 18,

          color: theme.palette.text.secondary,

          fontSize: '14px',
          fontWeight: 600,

          textTransform: 'none',

          '&.Mui-selected': {
            color: theme.palette.primary.main,
          },

          '&:hover': {
            color: theme.palette.primary.dark,
          },
        }),
      },
    },

    // =======================================================
    // OUTLINED INPUT
    // =======================================================

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 7,

          backgroundColor: theme.palette.background.paper,

          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.divider,
          },

          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#B8C6D3',
          },

          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,

            borderWidth: 1,

            boxShadow: `0 0 0 3px ${alpha(
              theme.palette.primary.main,
              0.1
            )}`,
          },
        }),

        input: {
          fontSize: '14px',
        },
      },
    },

    // =======================================================
    // INPUT LABEL
    // =======================================================

    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,

          fontSize: '14px',

          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
        }),
      },
    },

    // =======================================================
    // SELECT
    // =======================================================

    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: '14px',
        },
      },
    },

    // =======================================================
    // TABLE CONTAINER
    // =======================================================

    MuiTableContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },

    // =======================================================
    // TABLE HEAD
    // =======================================================

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F8FAFC',
        },
      },
    },

    // =======================================================
    // TABLE CELL
    // =======================================================

    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,

          color: theme.palette.text.primary,

          fontSize: '14px',

          padding: '14px 16px',
        }),

        head: ({ theme }) => ({
          color: theme.palette.text.secondary,

          fontSize: '13px',

          fontWeight: 650,

          backgroundColor: '#F8FAFC',

          whiteSpace: 'nowrap',
        }),
      },
    },

    // =======================================================
    // TABLE ROW
    // =======================================================

    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition:
            'background-color 140ms ease',

          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.025),
          },

          '&:last-child td': {
            borderBottom: 0,
          },
        }),
      },
    },

    // =======================================================
    // CHIP
    // =======================================================

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,

          fontWeight: 600,

          fontSize: '12px',
        },

        // ===================================================
        // PRIMARY CHIP
        // ===================================================

        colorPrimary: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.1),

          color: theme.palette.primary.dark,
        }),

        // ===================================================
        // SUCCESS CHIP
        // ===================================================

        colorSuccess: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.success.main, 0.1),

          color: theme.palette.success.dark,
        }),

        // ===================================================
        // WARNING CHIP
        // ===================================================

        colorWarning: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.warning.main, 0.12),

          color: theme.palette.warning.dark,
        }),

        // ===================================================
        // ERROR CHIP
        // ===================================================

        colorError: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.error.main, 0.1),

          color: theme.palette.error.dark,
        }),
      },
    },

    // =======================================================
    // DIALOG
    // =======================================================

    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 12,

          border: `1px solid ${theme.palette.divider}`,

          boxShadow:
            '0 24px 70px rgba(16, 24, 40, 0.16)',

          backgroundImage: 'none',
        }),
      },
    },

    // =======================================================
    // MENU
    // =======================================================

    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 8,

          border: `1px solid ${theme.palette.divider}`,

          boxShadow:
            '0 12px 32px rgba(16, 24, 40, 0.12)',

          marginTop: 4,
        }),
      },
    },

    // =======================================================
    // MENU ITEM
    // =======================================================

    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 40,

          borderRadius: 6,

          margin: '2px 5px',

          fontSize: '14px',

          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
          },

          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.09),

            '&:hover': {
              backgroundColor: alpha(
                theme.palette.primary.main,
                0.12
              ),
            },
          },
        }),
      },
    },

    // =======================================================
    // TOOLTIP
    // =======================================================

    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main,

          color: theme.palette.secondary.contrastText,

          fontSize: '12px',

          borderRadius: 6,

          padding: '7px 10px',

          boxShadow:
            '0 6px 18px rgba(16, 24, 40, 0.16)',
        }),

        arrow: ({ theme }) => ({
          color: theme.palette.secondary.main,
        }),
      },
    },

    // =======================================================
    // DIVIDER
    // =======================================================

    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },
  },
});

export default PharmalyxTheme;