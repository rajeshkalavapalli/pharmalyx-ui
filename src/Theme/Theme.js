import { alpha, createTheme } from "@mui/material/styles";

const PharmalyxTheme = createTheme({
    // =========================================================
    // PHARMALYX DESIGN SYSTEM
    // PREMIUM LIGHT MODE • TERRACOTTA + GRAPHITE + SAGE + IVORY
    // =========================================================

    palette: {
        mode: "light",

        primary: {
            main: "#C45D45",
            dark: "#9F4937",
            light: "#E29A88",
            contrastText: "#FFFFFF",
        },

        secondary: {
            main: "#303632",
            dark: "#202522",
            light: "#68716B",
            contrastText: "#FFFFFF",
        },

        brand: {
            terracotta: "#C45D45",
            terracottaDark: "#9F4937",
            terracottaLight: "#E29A88",

            graphite: "#202522",
            charcoal: "#303632",
            slate: "#68716B",

            sage: "#6F8175",
            sageDark: "#53665A",
            sageLight: "#A8B6AC",

            terracottaSoft: "#F9EEEB",
            terracottaMuted: "#FCF5F2",

            sageSoft: "#E9EFEB",

            ivory: "#F7F5F1",
            ivoryDark: "#F1EFEA",

            white: "#FFFFFF",

            gradient:
                "linear-gradient(135deg, #C45D45 0%, #6F8175 100%)",

            glass: "rgba(255, 255, 255, 0.72)",
            glassStrong: "rgba(255,255,255,0.85)",
        },

        chart: {
            primary: "#C45D45",
            secondary: "#6F8175",
            success: "#238B68",
            warning: "#C58A2A",
            error: "#C94B4B",
            neutral: "#98A19A",
            accent: "#E29A88",
        },

        command: {
            background: "#F7F5F1",
            surface: "#FFFFFF",
            elevated: "#FFFFFF",

            border: "#E4E1DB",

            text: "#202522",
            mutedText: "#68716B",
        },

        intelligence: {
            background: "#F8F7F4",
            surface: "#FFFFFF",
            elevated: "#FFFFFF",

            primary: "#C45D45",
            accent: "#6F8175",

            border: "#E4E1DB",

            text: "#202522",
            mutedText: "#68716B",
        },

        sidebar: {
            background: "#FFFFFF",
            surface: "#FFFFFF",

            active: "#C45D45",
            activeLight: "#F9EEEB",
            activeText: "#FFFFFF",

            text: "#303632",
            mutedText: "#68716B",

            border: "#E8E5DF",

            hover: "#F7F5F1",

            scrollbar: "#C9C6BF",
        },

        background: {
            default: "#F7F5F1",
            paper: "#FFFFFF",
        },

        surface: {
            workspace: "#F7F5F1",
            default: "#FFFFFF",
            subtle: "#FAF9F7",
            muted: "#F1EFEA",
            elevated: "#FFFFFF",
        },

        border: {
            subtle: "#EEECE7",
            default: "#E4E1DB",
            strong: "#CCC9C1",
        },

        text: {
            primary: "#202522",
            secondary: "#68716B",
            disabled: "#9AA19B",
        },

        divider: "#E4E1DB",

        success: {
            main: "#238B68",
            dark: "#176A50",
            light: "#67B99C",
            contrastText: "#FFFFFF",
        },

        warning: {
            main: "#C58A2A",
            dark: "#94671D",
            light: "#E0B15E",
            contrastText: "#FFFFFF",
        },

        error: {
            main: "#C94B4B",
            dark: "#A43737",
            light: "#E17D7D",
            contrastText: "#FFFFFF",
        },

        info: {
            main: "#68716B",
            dark: "#4D5650",
            light: "#98A19A",
            contrastText: "#FFFFFF",
        },
    },

    // =========================================================
    // CENTRALIZED DESIGN TOKENS
    // =========================================================

    layout: {
        page: {
            maxWidth: 900,
            paddingX: {
                xs: 2,
                sm: 3,
                md: 4,
            },
            paddingY: 3.5,
        },

        section: {
            marginBottom: 3,
            titleGap: 2.5,
            fieldGap: 2.25,
        },

        header: {
            paddingX: {
                xs: 2,
                sm: 3,
                md: 4,
            },
            paddingY: 3,
            indicatorWidth: 4,
            indicatorHeight: 42,
            sectionIndicatorWidth: 3,
            sectionIndicatorHeight: 28,
        },

        actionBar: {
            paddingX: {
                xs: 2,
                sm: 3,
                md: 4,
            },
            paddingY: 2,
            gap: 1.5,
        },
    },

    card: {
        radius: 2.5,
        borderWidth: 1,
        shadow: "0 8px 30px rgba(32, 37, 34, 0.055)",
    },

    field: {
        minHeight: 46,
        radius: 1.5,

        label: {
            fontSize: 13,
        },

        input: {
            fontSize: 13,
        },

        helperText: {
            fontSize: 11,
            marginLeft: 0.5,
            marginTop: 0.5,
        },

        transition:
            "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
    },

    status: {
        controlHeight: 38,
        optionMinWidth: 70,
        optionPaddingX: 1.75,
        optionRadius: 0,
        dotSize: 7,
    },

    // =========================================================
    // GLOBAL SHAPE
    // =========================================================

    shape: {
        borderRadius: 9,
    },

    // =========================================================
    // TYPOGRAPHY
    // =========================================================

    typography: {
        fontFamily: "Inter, Arial, Helvetica, sans-serif",

        h1: {
            fontSize: "34px",
            lineHeight: 1.15,
            fontWeight: 800,
            letterSpacing: "-0.03em",
        },

        h2: {
            fontSize: "28px",
            lineHeight: 1.22,
            fontWeight: 700,
            letterSpacing: "-0.02em",
        },

        h3: {
            fontSize: "24px",
            lineHeight: 1.28,
            fontWeight: 700,
            letterSpacing: "-0.015em",
        },

        h4: {
            fontSize: "20px",
            lineHeight: 1.35,
            fontWeight: 650,
            letterSpacing: "-0.01em",
        },

        h5: {
            fontSize: "18px",
            lineHeight: 1.4,
            fontWeight: 650,
        },

        h6: {
            fontSize: "16px",
            lineHeight: 1.45,
            fontWeight: 650,
        },

        body1: {
            fontSize: "15px",
            lineHeight: 1.6,
            fontWeight: 400,
        },

        body2: {
            fontSize: "14px",
            lineHeight: 1.55,
            fontWeight: 400,
        },

        button: {
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "none",
            letterSpacing: "0",
        },
    },

    // =========================================================
    // COMPONENT DESIGN SYSTEM
    // =========================================================

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: {
                    backgroundColor: "#F7F5F1",
                },

                body: {
                    margin: 0,
                    padding: 0,
                    backgroundColor: "#F7F5F1",
                    color: "#202522",
                    fontFamily: "Inter, Arial, Helvetica, sans-serif",
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                },

                "*": {
                    scrollbarWidth: "thin",
                    scrollbarColor: "#C9C6BF transparent",
                },

                "*::-webkit-scrollbar": {
                    width: "7px",
                    height: "7px",
                },

                "*::-webkit-scrollbar-track": {
                    background: "transparent",
                },

                "*::-webkit-scrollbar-thumb": {
                    background: "#C9C6BF",
                    borderRadius: "10px",
                },

                "*::-webkit-scrollbar-thumb:hover": {
                    background: "#AAA69E",
                },
            },
        },

        MuiPaper: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundImage: "none",
                    background: theme.palette.brand.glass,
                    backdropFilter: "blur(8px)",
                    border:
                        "1px solid " + theme.palette.divider,
                    boxShadow:
                        "0 4px 18px rgba(32, 37, 34, 0.035)",
                }),

                rounded: ({ theme }) => ({
                    borderRadius: theme.shape.borderRadius,
                }),
            },
        },

        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },

            styleOverrides: {
                root: ({ theme }) => ({
                    minHeight: 40,
                    borderRadius: 8,
                    paddingLeft: 16,
                    paddingRight: 16,
                    fontWeight: 600,

                    transition:
                        "background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",

                    "&:hover": {
                        transform: "translateY(-1px)",
                    },

                    "&:active": {
                        transform: "translateY(1px)",
                    },
                }),

                containedPrimary: ({ theme }) => ({
                    backgroundColor:
                        theme.palette.primary.main,
                    backgroundImage:
                        theme.palette.brand.gradient,
                    color:
                        theme.palette.primary.contrastText,

                    "&:hover": {
                        backgroundColor:
                            theme.palette.primary.dark,

                        boxShadow:
                            "0 6px 16px " +
                            alpha(
                                theme.palette.primary.main,
                                0.18
                            ),
                    },
                }),

                containedSecondary: ({ theme }) => ({
                    backgroundColor:
                        theme.palette.secondary.main,
                    color:
                        theme.palette.secondary.contrastText,

                    "&:hover": {
                        backgroundColor:
                            theme.palette.secondary.dark,

                        boxShadow:
                            "0 6px 16px " +
                            alpha(
                                theme.palette.secondary.main,
                                0.12
                            ),
                    },
                }),

                outlined: ({ theme }) => ({
                    borderColor:
                        theme.palette.divider,

                    color:
                        theme.palette.text.primary,

                    backgroundColor:
                        theme.palette.background.paper,

                    "&:hover": {
                        borderColor:
                            theme.palette.primary.main,

                        backgroundColor:
                            alpha(
                                theme.palette.primary.main,
                                0.04
                            ),
                    },

                    "&.MuiButton-colorError": {
                        color:
                            theme.palette.error.main,

                        borderColor:
                            theme.palette.error.main,

                        "&:hover": {
                            borderColor:
                                theme.palette.error.dark,

                            backgroundColor:
                                alpha(
                                    theme.palette.error.main,
                                    0.04
                                ),
                        },
                    },
                }),

                text: ({ theme }) => ({
                    "&:hover": {
                        backgroundColor:
                            alpha(
                                theme.palette.primary.main,
                                0.06
                            ),
                    },
                }),
            },
        },

        MuiIconButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: 8,

                    transition:
                        "background-color 160ms ease, color 160ms ease",

                    "&:hover": {
                        backgroundColor:
                            alpha(
                                theme.palette.primary.main,
                                0.07
                            ),
                    },
                }),
            },
        },

        MuiTabs: {
            styleOverrides: {
                root: {
                    minHeight: 48,
                },

                indicator: ({ theme }) => ({
                    height: 2,
                    borderRadius: 2,
                    backgroundColor:
                        theme.palette.primary.main,
                }),
            },
        },

        MuiTab: {
            styleOverrides: {
                root: ({ theme }) => ({
                    minHeight: 48,
                    paddingLeft: 18,
                    paddingRight: 18,

                    color:
                        theme.palette.text.secondary,

                    fontSize: "14px",
                    fontWeight: 600,
                    textTransform: "none",

                    "&.Mui-selected": {
                        color:
                            theme.palette.primary.main,
                    },

                    "&:hover": {
                        color:
                            theme.palette.primary.dark,
                    },
                }),
            },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }) => ({
                    minHeight:
                        theme.field?.minHeight || 46,

                    borderRadius:
                        theme.field?.radius || 1.5,

                    backgroundColor:
                        theme.palette.background.paper,

                    transition:
                        theme.field?.transition,

                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor:
                            theme.palette.divider,
                    },

                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor:
                            theme.palette.primary.light,
                    },

                    "&.Mui-focused": {
                        boxShadow:
                            "0 0 0 3px " +
                            alpha(
                                theme.palette.primary.main,
                                0.08
                            ),
                    },

                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor:
                            theme.palette.primary.main,

                        borderWidth: 1,
                    },

                    "&.Mui-disabled": {
                        backgroundColor:
                            theme.palette.action.hover,
                    },
                }),

                input: ({ theme }) => ({
                    fontSize:
                        theme.field?.input?.fontSize || 13,

                    color:
                        theme.palette.text.primary,
                }),
            },
        },

        MuiInputLabel: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color:
                        theme.palette.text.secondary,

                    fontSize:
                        theme.field?.label?.fontSize || 13,

                    "&.Mui-focused": {
                        color:
                            theme.palette.primary.main,
                    },
                }),
            },
        },

        MuiSelect: {
            styleOverrides: {
                select: ({ theme }) => ({
                    fontSize:
                        theme.field?.input?.fontSize || 13,
                }),
            },
        },

        MuiFormHelperText: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color:
                        theme.palette.text.secondary,

                    fontSize:
                        theme.field?.helperText?.fontSize ||
                        11,

                    marginLeft:
                        theme.field?.helperText?.marginLeft ||
                        0.5,

                    marginTop:
                        theme.field?.helperText?.marginTop ||
                        0.5,
                }),
            },
        },

        MuiTableContainer: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: 9,
                    backgroundColor:
                        theme.palette.background.paper,
                }),
            },
        },

        MuiTableHead: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor:
                        theme.palette.surface.muted,
                }),
            },
        },

        MuiTableCell: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderBottom:
                        "1px solid " +
                        theme.palette.divider,

                    color:
                        theme.palette.text.primary,

                    fontSize: "14px",
                    padding: "14px 16px",
                }),

                head: ({ theme }) => ({
                    color:
                        theme.palette.text.secondary,

                    fontSize: "13px",
                    fontWeight: 650,

                    backgroundColor:
                        theme.palette.surface.muted,

                    whiteSpace: "nowrap",
                }),
            },
        },

        MuiTableRow: {
            styleOverrides: {
                root: ({ theme }) => ({
                    transition:
                        "background-color 140ms ease",

                    "&:hover": {
                        backgroundColor:
                            alpha(
                                theme.palette.primary.main,
                                0.025
                            ),
                    },

                    "&:last-child td": {
                        borderBottom: 0,
                    },
                }),
            },
        },

        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 7,
                    fontWeight: 600,
                    fontSize: "12px",
                },

                colorPrimary: ({ theme }) => ({
                    backgroundColor:
                        alpha(
                            theme.palette.primary.main,
                            0.1
                        ),

                    color:
                        theme.palette.primary.dark,
                }),

                colorSuccess: ({ theme }) => ({
                    backgroundColor:
                        alpha(
                            theme.palette.success.main,
                            0.1
                        ),

                    color:
                        theme.palette.success.dark,
                }),

                colorWarning: ({ theme }) => ({
                    backgroundColor:
                        alpha(
                            theme.palette.warning.main,
                            0.12
                        ),

                    color:
                        theme.palette.warning.dark,
                }),

                colorError: ({ theme }) => ({
                    backgroundColor:
                        alpha(
                            theme.palette.error.main,
                            0.1
                        ),

                    color:
                        theme.palette.error.dark,
                }),
            },
        },

        MuiDialog: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    borderRadius: 13,

                    border:
                        "1px solid " +
                        theme.palette.divider,

                    boxShadow:
                        "0 24px 70px rgba(32, 37, 34, 0.16)",

                    backgroundImage: "none",

                    background:
                        theme.palette.brand.glass,

                    backdropFilter: "blur(12px)",
                }),
            },
        },

        MuiMenu: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    borderRadius: 9,

                    border:
                        "1px solid " +
                        theme.palette.divider,

                    boxShadow:
                        "0 12px 32px rgba(32, 37, 34, 0.12)",

                    marginTop: 4,
                }),
            },
        },

        MuiMenuItem: {
            styleOverrides: {
                root: ({ theme }) => ({
                    minHeight: 40,
                    borderRadius: 7,
                    margin: "2px 5px",
                    fontSize: "14px",

                    "&:hover": {
                        backgroundColor:
                            alpha(
                                theme.palette.primary.main,
                                0.06
                            ),
                    },

                    "&.Mui-selected": {
                        backgroundColor:
                            alpha(
                                theme.palette.primary.main,
                                0.09
                            ),

                        "&:hover": {
                            backgroundColor:
                                alpha(
                                    theme.palette.primary.main,
                                    0.12
                                ),
                        },
                    },
                }),
            },
        },

        MuiTooltip: {
            styleOverrides: {
                tooltip: ({ theme }) => ({
                    backgroundColor:
                        theme.palette.secondary.main,

                    color:
                        theme.palette.secondary.contrastText,

                    fontSize: "12px",
                    borderRadius: 7,
                    padding: "7px 10px",

                    boxShadow:
                        "0 6px 18px rgba(32, 37, 34, 0.16)",
                }),

                arrow: ({ theme }) => ({
                    color:
                        theme.palette.secondary.main,
                }),
            },
        },

        MuiDivider: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderColor:
                        theme.palette.divider,
                }),
            },
        },

        MuiAutocomplete: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    borderRadius: 9,

                    boxShadow:
                        "0 12px 32px rgba(32, 37, 34, 0.08)",
                }),
            },
        },

        MuiSnackbar: {
            styleOverrides: {
                root: {
                    "& .MuiSnackbarContent-root": {
                        borderRadius: 8,

                        boxShadow:
                            "0 8px 20px rgba(32,37,34,0.08)",
                    },
                },
            },
        },

        MuiFormControlLabel: {
            styleOverrides: {
                root: {
                    marginRight: 8,
                },
            },
        },

        MuiAvatar: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor:
                        theme.palette.surface.default,

                    color:
                        theme.palette.text.primary,
                }),
            },
        },

        MuiLinearProgress: {
            styleOverrides: {
                root: ({ theme }) => ({
                    height: 8,
                    borderRadius: 8,

                    backgroundColor:
                        theme.palette.surface.subtle,
                }),

                bar: ({ theme }) => ({
                    borderRadius: 8,

                    backgroundImage:
                        theme.palette.brand.gradient,
                }),
            },
        },

        MuiCircularProgress: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color:
                        theme.palette.primary.main,
                }),
            },
        },

        MuiAccordion: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: 10,

                    boxShadow:
                        "0 8px 24px rgba(32,37,34,0.06)",

                    "&.Mui-expanded": {
                        margin: "12px 0",
                    },
                }),
            },
        },

        MuiBreadcrumbs: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color:
                        theme.palette.text.secondary,
                }),
            },
        },

        MuiStepper: {
            styleOverrides: {
                root: {
                    background: "transparent",
                },
            },
        },

        MuiStepIcon: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color:
                        theme.palette.surface.muted,

                    "&.Mui-active": {
                        color:
                            theme.palette.primary.main,
                    },

                    "&.Mui-completed": {
                        color:
                            theme.palette.success.main,
                    },
                }),
            },
        },

        MuiPagination: {
            styleOverrides: {
                root: ({ theme }) => ({
                    "& .MuiPaginationItem-root": {
                        borderRadius: 8,

                        "&.Mui-selected": {
                            backgroundImage:
                                theme.palette.brand.gradient,

                            color:
                                theme.palette.primary
                                    .contrastText,
                        },
                    },
                }),
            },
        },

        MuiListItemButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: 8,

                    "&:hover": {
                        backgroundColor:
                            alpha(
                                theme.palette.primary.main,
                                0.04
                            ),
                    },
                }),
            },
        },

        MuiListItemIcon: {
            styleOverrides: {
                root: ({ theme }) => ({
                    minWidth: 40,

                    color:
                        theme.palette.text.secondary,
                }),
            },
        },

        MuiListItemText: {
            styleOverrides: {
                primary: ({ theme }) => ({
                    color:
                        theme.palette.text.primary,
                }),

                secondary: ({ theme }) => ({
                    color:
                        theme.palette.text.secondary,
                }),
            },
        },

        MuiSwitch: {
            styleOverrides: {
                switchBase: ({ theme }) => ({
                    "&.Mui-checked": {
                        color:
                            theme.palette.primary
                                .contrastText,

                        "& + .MuiSwitch-track": {
                            backgroundImage:
                                theme.palette.brand
                                    .gradient,
                        },
                    },
                }),
            },
        },

        MuiCheckbox: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color:
                        theme.palette.text.secondary,

                    "&.Mui-checked": {
                        color:
                            theme.palette.primary.main,
                    },
                }),
            },
        },

        MuiRadio: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color:
                        theme.palette.text.secondary,

                    "&.Mui-checked": {
                        color:
                            theme.palette.primary.main,
                    },
                }),
            },
        },

        MuiBackdrop: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor:
                        alpha(
                            theme.palette.secondary.main,
                            0.45
                        ),

                    backdropFilter: "blur(2px)",
                }),
            },
        },

        MuiTypography: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color:
                        theme.palette.text.primary,
                }),
            },
        },
    },
});

export default PharmalyxTheme;