import { createTheme } from '@mui/material/styles';

const PharmalyxTheme = createTheme({
  // =========================================================
  // PHARMALYX DESIGN SYSTEM
  // Lumen Precision
  // =========================================================

  palette: {

    // =======================================================
    // PRIMARY BRAND
    // Azure is used for primary actions and key interaction
    // =======================================================

    primary: {
      main: '#536DFF',
      dark: '#3D54D9',
      light: '#8295FF',
      contrastText: '#FFFFFF',
    },

    // =======================================================
    // COMMAND LAYER
    // Deep surfaces used by application navigation/shell
    // =======================================================

    secondary: {
      main: '#0D1A29',
      dark: '#050B13',
      light: '#17283B',
      contrastText: '#FFFFFF',
    },

    // =======================================================
    // PHARMALYX BRAND TOKENS
    // These are intentionally different from generic MUI
    // primary/secondary colors.
    // =======================================================

    brand: {
      azure: '#536DFF',
      azureDark: '#3D54D9',
      azureLight: '#8295FF',

      lumen: '#2DD4BF',
      lumenDark: '#159F90',
      lumenLight: '#5EEAD4',

      indigo: '#7C5CFF',
      indigoDark: '#6040D8',
      indigoLight: '#A18AFF',
    },

    // =======================================================
    // COMMAND SURFACES
    // Used by the dark application shell
    // =======================================================

    command: {
      background: '#050B13',
      surface: '#0B1725',
      elevated: '#102235',
      border: 'rgba(226, 232, 240, 0.08)',

      text: '#F1F5F9',
      mutedText: '#94A3B8',
    },

    // =======================================================
    // INTELLIGENCE LAYER
    // Reserved for Insights, Analytics and future intelligence
    // experiences.
    // =======================================================

    intelligence: {
      background: '#090B18',
      surface: '#11152A',
      elevated: '#171D38',

      primary: '#7C5CFF',
      accent: '#2DD4BF',

      border: 'rgba(161, 138, 255, 0.16)',
      text: '#F5F7FF',
      mutedText: '#9BA4C4',
    },

    // =======================================================
    // SIDEBAR
    // =======================================================

    sidebar: {
      background: '#050B13',
      surface: '#102235',

      // Lumen line used by the existing sidebar
      active: '#2DD4BF',

      text: '#E8EEF7',
      mutedText: '#91A1B5',

      border: 'rgba(232, 238, 247, 0.08)',

      hover: 'rgba(83, 109, 255, 0.09)',

      scrollbar: 'rgba(145, 161, 181, 0.20)',
    },

    // =======================================================
    // WORKSPACE
    // =======================================================

    background: {
      default: '#F4F7FB',
      paper: '#FFFFFF',
    },

    // =======================================================
    // TEXT SYSTEM
    // =======================================================

    text: {
      primary: '#101828',
      secondary: '#667085',
      disabled: '#98A2B3',
    },

    // =======================================================
    // DIVIDER
    // =======================================================

    divider: '#E4E9F1',

    // =======================================================
    // STATUS COLORS
    // Status colors remain semantic.
    // They are NOT used as decoration.
    // =======================================================

    success: {
      main: '#16A36A',
      dark: '#118357',
      light: '#4CC38A',
      contrastText: '#FFFFFF',
    },

    warning: {
      main: '#E29A3B',
      dark: '#B9751F',
      light: '#F2BB68',
      contrastText: '#FFFFFF',
    },

    error: {
      main: '#D94F5C',
      dark: '#B73542',
      light: '#EE7A84',
      contrastText: '#FFFFFF',
    },

    info: {
      main: '#22B8D6',
      dark: '#168BA3',
      light: '#5ED3E7',
      contrastText: '#FFFFFF',
    },
  },

  // =========================================================
  // GLOBAL SHAPE
  // =========================================================

  shape: {
    borderRadius: 10,
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
          backgroundColor: '#F4F7FB',
        },

        body: {
          margin: 0,
          padding: 0,
          backgroundColor: '#F4F7FB',
          color: '#101828',
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
    // The foundation for cards, panels and data surfaces
    // =======================================================

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #E4E9F1',
          boxShadow: '0 4px 18px rgba(16, 24, 40, 0.035)',
        },

        rounded: {
          borderRadius: 10,
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
          borderRadius: 9,
          paddingLeft: 16,
          paddingRight: 16,
          fontWeight: 600,
          transition:
            'background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        },

        containedPrimary: {
          backgroundColor: '#536DFF',

          '&:hover': {
            backgroundColor: '#3D54D9',
            boxShadow: '0 6px 16px rgba(83, 109, 255, 0.20)',
          },

          '&:active': {
            transform: 'translateY(1px)',
          },
        },

        outlined: {
          borderColor: '#D7DEE8',
          color: '#344054',
          backgroundColor: '#FFFFFF',

          '&:hover': {
            borderColor: '#536DFF',
            backgroundColor: 'rgba(83, 109, 255, 0.035)',
          },

          // Error outlined buttons
          '&.MuiButton-colorError': {
            color: '#D94F5C',
            borderColor: '#D94F5C',

            '&:hover': {
              borderColor: '#B73542',
              backgroundColor: 'rgba(217, 79, 92, 0.04)',
            },
          },
        },

        text: {
          '&:hover': {
            backgroundColor: 'rgba(83, 109, 255, 0.06)',
          },
        },
      },
    },

    // =======================================================
    // ICON BUTTON
    // =======================================================

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition:
            'background-color 160ms ease, color 160ms ease',

          '&:hover': {
            backgroundColor: 'rgba(83, 109, 255, 0.07)',
          },
        },
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

        indicator: {
          height: 2,
          borderRadius: 2,
          backgroundColor: '#536DFF',
        },
      },
    },

    // =======================================================
    // TAB
    // =======================================================

    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 48,
          paddingLeft: 18,
          paddingRight: 18,
          color: '#667085',
          fontSize: '14px',
          fontWeight: 600,
          textTransform: 'none',

          '&.Mui-selected': {
            color: '#536DFF',
          },

          '&:hover': {
            color: '#3D54D9',
          },
        },
      },
    },

    // =======================================================
    // OUTLINED INPUT
    // =======================================================

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          backgroundColor: '#FFFFFF',

          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D7DEE8',
          },

          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#B9C4D3',
          },

          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#536DFF',
            borderWidth: 1,
            boxShadow: '0 0 0 3px rgba(83, 109, 255, 0.10)',
          },
        },

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
        root: {
          color: '#667085',
          fontSize: '14px',

          '&.Mui-focused': {
            color: '#536DFF',
          },
        },
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
    // TABLE
    // =======================================================

    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
        },
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
        root: {
          borderBottom: '1px solid #EDF1F5',
          color: '#344054',
          fontSize: '14px',
          padding: '14px 16px',
        },

        head: {
          color: '#475467',
          fontSize: '13px',
          fontWeight: 650,
          backgroundColor: '#F8FAFC',
          whiteSpace: 'nowrap',
        },
      },
    },

    // =======================================================
    // TABLE ROW
    // =======================================================

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 140ms ease',

          '&:hover': {
            backgroundColor: '#F8FAFF',
          },

          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },

    // =======================================================
    // CHIP
    // =======================================================

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          fontWeight: 600,
          fontSize: '12px',
        },

        colorPrimary: {
          backgroundColor: 'rgba(83, 109, 255, 0.10)',
          color: '#3D54D9',
        },

        colorSuccess: {
          backgroundColor: 'rgba(22, 163, 106, 0.10)',
          color: '#118357',
        },

        colorWarning: {
          backgroundColor: 'rgba(226, 154, 59, 0.12)',
          color: '#A66318',
        },

        colorError: {
          backgroundColor: 'rgba(217, 79, 92, 0.10)',
          color: '#B73542',
        },
      },
    },

    // =======================================================
    // DIALOG
    // =======================================================

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          border: '1px solid #E4E9F1',
          boxShadow: '0 24px 70px rgba(16, 24, 40, 0.16)',
          backgroundImage: 'none',
        },
      },
    },

    // =======================================================
    // MENU
    // =======================================================

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          border: '1px solid #E4E9F1',
          boxShadow: '0 12px 32px rgba(16, 24, 40, 0.12)',
          marginTop: 4,
        },
      },
    },

    // =======================================================
    // MENU ITEM
    // =======================================================

    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 7,
          margin: '2px 5px',
          fontSize: '14px',

          '&:hover': {
            backgroundColor: 'rgba(83, 109, 255, 0.06)',
          },

          '&.Mui-selected': {
            backgroundColor: 'rgba(83, 109, 255, 0.09)',

            '&:hover': {
              backgroundColor: 'rgba(83, 109, 255, 0.12)',
            },
          },
        },
      },
    },

    // =======================================================
    // TOOLTIP
    // =======================================================

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#101828',
          color: '#FFFFFF',
          fontSize: '12px',
          borderRadius: 6,
          padding: '7px 10px',
          boxShadow: '0 6px 18px rgba(16, 24, 40, 0.16)',
        },

        arrow: {
          color: '#101828',
        },
      },
    },

    // =======================================================
    // DIVIDER
    // =======================================================

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E8EDF3',
        },
      },
    },
  },
});

export default PharmalyxTheme;