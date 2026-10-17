import { alpha, createTheme } from "@mui/material/styles";

const PharmalyxTheme = createTheme({
    // =========================================================
    // PHARMALYX DESIGN SYSTEM
    // HORIZON PRO • NAVY NAVIGATION + BLUE PRIMARY + TEAL PERFORMANCE + SLATE SURFACES
    // =========================================================

    palette: {
        mode: "light",

        // Horizon Pro: blue primary actions, navy navigation, teal performance.
        primary: {
            main: "#2563EB",
            dark: "#1D4ED8",
            light: "#93C5FD",
            contrastText: "#FFFFFF",
        },

        // Neutral slate for drafts, "soon" badges and quiet actions.
        secondary: {
            main: "#64748B",
            dark: "#334155",
            light: "#94A3B8",
            contrastText: "#FFFFFF",
        },

        brand: {
            blue: "#2563EB",
            cyan: "#0EA5E9",
            teal: "#10B981",
            navy: "#102B50",

            gradient: "linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)",
            gradientSoft: "linear-gradient(135deg, #EFF6FF 0%, #ECFEFF 100%)",
            glow: "0 8px 24px rgba(37, 99, 235, 0.30)",

            glass: "rgba(255, 255, 255, 0.94)",
            glassStrong: "rgba(255, 255, 255, 0.98)",
            white: "#FFFFFF",

            // Names used by existing components, mapped to Horizon Pro.
            indigo: "#2563EB",
            violet: "#0EA5E9",
            ink: "#0B1E3A",
            terracotta: "#2563EB",
            terracottaDark: "#1D4ED8",
            terracottaLight: "#93C5FD",
            terracottaSoft: "#EFF6FF",
            terracottaMuted: "#F5F9FF",
            graphite: "#0F172A",
            charcoal: "#1E293B",
            slate: "#64748B",
            sage: "#0EA5E9",
            sageDark: "#0369A1",
            sageLight: "#7DD3FC",
            sageSoft: "#ECFEFF",
            ivory: "#F8FAFC",
            ivoryDark: "#F1F5F9",
        },

        chart: {
            primary: "#2563EB",
            secondary: "#0EA5E9",
            success: "#10B981",
            warning: "#F59E0B",
            error: "#EF4444",
            neutral: "#94A3B8",
            accent: "#0EA5E9",
            // Two-series comparison (validated pair): our brand vs competitors / expected.
            ours: "#2563EB",
            competitor: "#10B981",
        },

        command: {
            background: "#F8FAFC",
            surface: "#FFFFFF",
            elevated: "#FFFFFF",
            border: "#E2E8F0",
            text: "#0F172A",
            mutedText: "#64748B",
        },

        intelligence: {
            background: "#F8FAFC",
            surface: "#FFFFFF",
            elevated: "#FFFFFF",
            primary: "#2563EB",
            accent: "#10B981",
            border: "#E2E8F0",
            text: "#0F172A",
            mutedText: "#64748B",
        },

        // Navy navigation rail.
        sidebar: {
            background: "#102B50",
            backgroundImage: "linear-gradient(180deg, #13335E 0%, #102B50 50%, #0C2242 100%)",
            surface: "#173B6A",

            active: "#60A5FA",
            activeLight: "rgba(37, 99, 235, 0.32)",
            activeText: "#FFFFFF",
            activeGlow: "0 0 0 1px rgba(96, 165, 250, 0.30), 0 6px 18px rgba(37, 99, 235, 0.40)",

            text: "#CBD5E1",
            mutedText: "#8DA3C2",
            hoverText: "#FFFFFF",
            hover: "rgba(255, 255, 255, 0.07)",

            border: "rgba(255, 255, 255, 0.09)",
            guide: "rgba(255, 255, 255, 0.12)",
            scrollbar: "rgba(255, 255, 255, 0.18)",

            badgeBackground: "rgba(255, 255, 255, 0.09)",
            badgeText: "#A9BBD3",
        },

        background: {
            default: "#F8FAFC",
            paper: "#FFFFFF",
        },

        surface: {
            workspace: "#F8FAFC",
            default: "#FFFFFF",
            subtle: "#F8FAFC",
            muted: "#F1F5F9",
            elevated: "#FFFFFF",
        },

        border: {
            subtle: "#EDF2F7",
            default: "#E2E8F0",
            strong: "#CBD5E1",
        },

        text: {
            primary: "#0F172A",
            secondary: "#64748B",
            disabled: "#94A3B8",
        },

        divider: "#E2E8F0",

        // Day states on planning calendars (tour plan, leave, attendance).
        plan: {
            working: "#2563EB",
            workingSoft: "#EFF6FF",
            workingBorder: "#BFDBFE",

            off: "#64748B",
            offSoft: "#F1F5F9",
            offHatch: "#E2E8F0",

            empty: "#CBD5E1",
        },

        success: {
            main: "#10B981",
            dark: "#047857",
            light: "#6EE7B7",
            contrastText: "#FFFFFF",
        },

        warning: {
            main: "#F59E0B",
            dark: "#B45309",
            light: "#FCD34D",
            contrastText: "#FFFFFF",
        },

        error: {
            main: "#EF4444",
            dark: "#B91C1C",
            light: "#FCA5A5",
            contrastText: "#FFFFFF",
        },

        // Secondary cyan: highlights and informational states.
        info: {
            main: "#0EA5E9",
            dark: "#0369A1",
            light: "#7DD3FC",
            contrastText: "#FFFFFF",
        },

        // Workflow state "Submitted" (sent for approval).
        submitted: {
            main: "#3B82F6",
            dark: "#1D4ED8",
            light: "#93C5FD",
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
        shadow: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
    },

    // Layered shadows (ink-tinted) for surfaces that float.
    elevation: {
        sm: "0 1px 2px rgba(15, 23, 42, 0.05)",
        md: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
        lg: "0 12px 40px rgba(15, 23, 42, 0.12)",
        focus: "0 0 0 4px rgba(37, 99, 235, 0.16)",
    },

    // =========================================================
    // CONFIGURATION MODULE DESIGN TOKENS
    // =========================================================

    // Settings-style layout: section label column + compact item list.
    configuration: {
        labelColumnWidth: 280,
        sectionPaddingY: 3,
        rowMinHeight: 56,
        rowPaddingX: 2,
        rowPaddingY: 1.25,
        iconSize: 32,
        iconFontSize: 18,
        countMinWidth: 96,
    },

    field: {
        minHeight: 46,
        // Inputs placed in toolbars next to buttons.
        compactHeight: 40,
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
    // SHARED PAGE BUILDING BLOCKS
    // =========================================================

    // Alpha levels for tinting a palette color (hover, selected, chips...).
    tint: {
        hover: 0.04,
        selected: 0.08,
        soft: 0.1,
        border: 0.22,
        strong: 0.32,
    },

    pageHeader: {
        marginBottom: 3,
        gap: 2,
        eyebrowMarginBottom: 0.75,
        subtitleMarginTop: 0.5,
        actionsGap: 1.25,
    },

    // Radii are multiples of shape.borderRadius (9px) when used in sx.
    panel: {
        radius: 1.5,
        padding: { xs: 2, md: 2.5 },
        headerPaddingY: 2,
        gap: 2,
    },

    stat: {
        padding: { xs: 2, md: 2.25 },
        gap: 2,
        iconSize: 42,
        iconFontSize: 22,
        iconRadius: 1.25,
        valueMarginTop: 0.5,
        progressMarginTop: 1.5,
        progressHeight: 6,
    },

    statusChip: {
        height: 30,
        paddingX: 1.5,
        gap: 1,
        radius: 999,
        dotSize: 8,
    },

    timeline: {
        dotSize: 28,
        iconSize: 16,
        connectorWidth: 2,
        stepGap: 2.25,
    },

    calendar: {
        weekdayPaddingY: 1.25,
        gridGap: { xs: 0.5, sm: 0.75 },
        cell: {
            minHeight: { xs: 64, sm: 92, lg: 108 },
            padding: { xs: 0.5, sm: 1 },
            radius: 1,
            markerWidth: 3,
        },
        dateBadge: {
            size: 26,
        },
        hatchSize: 6,
        legendSwatch: 12,
        loadingOpacity: 0.55,
        transition:
            "background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease",
    },

    dialog: {
        width: 520,
        paddingX: { xs: 2, sm: 3 },
        paddingY: { xs: 2, sm: 2.5 },
        phoneMargin: 2,
    },

    // Pill toggle (MuiSwitch): thumb sits inside the track.
    toggle: {
        medium: { width: 34, height: 20, thumb: 16, gap: 2 },
        small: { width: 28, height: 16, thumb: 12, gap: 2 },
    },

    // Roles & permissions matrix.
    permissionMatrix: {
        featureColumnMinWidth: 260,
        actionColumnWidth: 96,
        minWidth: 820,
        cellHeight: 60,
        changedDotSize: 6,
    },

    // Doctor engagement pages (RCPA lines, business charts, legends).
    engagement: {
        dateColumn: 160,
        quantityColumn: 100,
        groupedBarWidth: "28%",
        percentColumn: 36,
        swatchRadius: 0.5,
    },

    // Dashboard: hero banner and the visit trend chart.
    dashboard: {
        heroPadding: { xs: 2.5, md: 3.5 },
        chartHeight: 180,
        barGap: 2,
        barRadius: 4,
        gridLines: 4,
        barWidth: "62%",
        barMinWidth: 4,
        tooltipOffset: 8,
        sideColumnWidth: 44, // spacing units
        skeleton: { hero: 180, stat: 120, chart: 280 },
        donutSize: 156,
        donutStroke: 14,
        scheduleTimeWidth: 52,
        scheduleDotSize: 10,
        scheduleMaxHeight: 300,
        quickActionMinHeight: 92,
        dateChipHeight: 40,
        lineChartHeight: 180,
        markerSize: 8,
        donutGap: 4,
    },

    // Insights pages.
    insights: {
        pickerWidth: 240,
        thresholdWidth: 170,
    },

    // Report pages.
    reports: {
        tableMaxHeight: 560,
    },

    // Sign-in screen.
    login: {
        formMaxWidth: 400,
        brandPaddingX: { md: 6, lg: 8 },
        brandPaddingY: 6,
        glowSize: 520,
        previewWidth: 360,
        fieldHeight: 48,
        brandMarkSize: 40,
        headlineMaxWidth: 520,
        spinnerSize: 18,
    },

    // Page frame: content padding, header and the phone menu drawer.
    appShell: {
        contentPadding: { xs: 2, sm: 2.5, md: 3, lg: 3.5 },
        headerHeight: 68,
        headerPaddingX: { xs: 1.5, sm: 2, md: 3 },
        drawerMaxWidth: "85vw",
    },

    table: {
        loadingOpacity: 0.55,
        textMaxWidth: 260,
        emptyPaddingY: 7,
        emptyIconSize: 44,
        emptyMessageMaxWidth: 420,
    },

    // Grid cards for people/entities (doctors, chemists, stockists).
    entityCard: {
        minWidth: 280,
        padding: 2,
        gap: 1.5,
        badgeSize: 26,
        hoverLift: "translateY(-2px)",
    },

    search: {
        minWidth: { xs: "100%", sm: 240 },
    },

    dcr: {
        calendarWidth: 56, // spacing units
        cellMinHeight: { xs: 48, sm: 64 },
        dotSize: 6,
    },

    visitList: {
        timeColumnWidth: 104,
        sidePanelWidth: 40, // spacing units
        sideListMaxHeight: 360,
    },

    // App navigation rail. Colors live in palette.sidebar.
    sidebarLayout: {
        width: 264,
        collapsedWidth: 76,
        headerHeight: 72,
        paddingX: 1.5,
        logoWidth: 148,
        markSize: 36,
        itemHeight: 40,
        childItemHeight: 36,
        railItemSize: 44,
        iconSize: 20,
        radius: 1,
        childIndent: 2.25,
        guideOffset: 2.5,
        indicatorWidth: 3,
        flyoutMinWidth: 220,
        scrollbarWidth: 5,
        transition: "width 200ms ease",
        itemTransition: "background-color 140ms ease, color 140ms ease",
        chevronTransition: "transform 160ms ease",
    },

    // Right-side detail / review panels.
    drawer: {
        width: { xs: "100%", sm: 560 },
        paddingX: { xs: 2, sm: 3 },
        paddingY: 2.5,
        sectionGap: 3,
    },

    avatar: {
        size: 44,
        sizeSmall: 32,
    },

    segmented: {
        padding: 0.5,
        gap: 0.5,
        radius: 1.25,
        itemRadius: 1,
        itemHeight: 38,
        itemPaddingX: 1.75,
        itemGap: 1,
        iconSize: 18,
        selectedShadow: "0 1px 3px rgba(15, 23, 42, 0.12)",
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
        fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
        displayFontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",

        h1: {
            fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: "34px",
            lineHeight: 1.15,
            fontWeight: 800,
            letterSpacing: "-0.03em",
        },

        h2: {
            fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: "28px",
            lineHeight: 1.22,
            fontWeight: 700,
            letterSpacing: "-0.02em",
        },

        h3: {
            fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: "24px",
            lineHeight: 1.28,
            fontWeight: 700,
            letterSpacing: "-0.015em",
        },

        h4: {
            fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: "20px",
            lineHeight: 1.35,
            fontWeight: 650,
            letterSpacing: "-0.01em",
        },

        h5: {
            fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: "18px",
            lineHeight: 1.4,
            fontWeight: 650,
        },

        h6: {
            fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
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

        subtitle1: {
            fontSize: "15px",
            lineHeight: 1.45,
            fontWeight: 650,
        },

        subtitle2: {
            fontSize: "13px",
            lineHeight: 1.4,
            fontWeight: 650,
        },

        caption: {
            fontSize: "12px",
            lineHeight: 1.4,
            fontWeight: 400,
        },

        // Eyebrow labels above page and section titles.
        overline: {
            fontSize: "11px",
            lineHeight: 1.4,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
        },

        // Large numbers on stat cards.
        metric: {
            fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: "26px",
            lineHeight: 1.15,
            fontWeight: 750,
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
        },

        // Tiny labels inside dense UI (calendar cells, badges).
        micro: {
            fontSize: "11px",
            lineHeight: 1.3,
            fontWeight: 500,
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
            styleOverrides: (theme) => ({
                html: {
                    backgroundColor: theme.palette.background.default,
                },

                body: {
                    margin: 0,
                    padding: 0,
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                },

                "::selection": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.18),
                },

                "*": {
                    scrollbarWidth: "thin",
                    scrollbarColor: `${theme.palette.border.strong} transparent`,
                },

                "*::-webkit-scrollbar": {
                    width: "7px",
                    height: "7px",
                },

                "*::-webkit-scrollbar-track": {
                    background: "transparent",
                },

                "*::-webkit-scrollbar-thumb": {
                    background: theme.palette.border.strong,
                    borderRadius: "10px",
                },

                "*::-webkit-scrollbar-thumb:hover": {
                    background: theme.palette.text.disabled,
                },
            }),
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
                        "0 4px 18px rgba(15, 23, 42, 0.035)",
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

                    "&:hover .MuiOutlinedInput-notchedInput": {
                        borderColor:
                            theme.palette.primary.light,
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
                        "0 24px 70px rgba(15, 23, 42, 0.16)",

                    backgroundImage: "none",

                    background:
                        theme.palette.brand.glass,

                    backdropFilter: "blur(12px)",

                    // Phones: small, even margins instead of MUI's 32px.
                    [theme.breakpoints.down("sm")]: {
                        margin: theme.spacing(theme.dialog.phoneMargin),
                        width: `calc(100% - ${theme.spacing(theme.dialog.phoneMargin * 2)})`,
                        maxHeight: `calc(100% - ${theme.spacing(theme.dialog.phoneMargin * 2)})`,
                    },
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
                        "0 12px 32px rgba(15, 23, 42, 0.12)",

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
                        "0 6px 18px rgba(15, 23, 42, 0.16)",
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
                        "0 12px 32px rgba(15, 23, 42, 0.08)",
                }),
            },
        },

        MuiSnackbar: {
            styleOverrides: {
                root: {
                    "& .MuiSnackbarContent-root": {
                        borderRadius: 8,

                        boxShadow:
                            "0 8px 20px rgba(15,23,42,0.08)",
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
                        "0 8px 24px rgba(15,23,42,0.06)",

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

        // Pill toggle: white thumb centred inside a filled track.
        // Everything is set from the root with descendant selectors so MUI's built-in
        // size variants (which also target the root) can't override the geometry.
        MuiSwitch: {
            styleOverrides: {
                root: ({ theme, ownerState }) => {
                    const t = theme.toggle[ownerState.size === "small" ? "small" : "medium"];
                    const travel = t.width - t.thumb - t.gap * 2;

                    return {
                        width: t.width,
                        height: t.height,
                        padding: 0,
                        overflow: "visible",

                        "& .MuiSwitch-switchBase": {
                            padding: t.gap,
                            color: theme.palette.common.white,
                            transitionDuration: "180ms",

                            "&:hover": { backgroundColor: "transparent" },

                            "&.Mui-checked": {
                                transform: `translateX(${travel}px)`,
                                color: theme.palette.common.white,

                                "& + .MuiSwitch-track": {
                                    opacity: 1,
                                    backgroundColor: theme.palette.primary.main,
                                    backgroundImage: theme.palette.brand.gradient,
                                },
                            },

                            "&.Mui-disabled": { color: theme.palette.common.white },
                            "&.Mui-disabled + .MuiSwitch-track": { opacity: 0.45 },
                            "&.Mui-focusVisible + .MuiSwitch-track": { boxShadow: theme.elevation.focus },
                        },

                        "& .MuiSwitch-thumb": {
                            width: t.thumb,
                            height: t.thumb,
                            boxShadow: theme.elevation.sm,
                        },

                        "& .MuiSwitch-track": {
                            opacity: 1,
                            borderRadius: t.height / 2,
                            backgroundColor: theme.palette.border.strong,
                            transition: theme.field.transition,
                        },
                    };
                },
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
            defaultProps: {
                variantMapping: {
                    metric: "p",
                    micro: "span",
                },
            },

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