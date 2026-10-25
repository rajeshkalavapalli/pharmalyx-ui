import { alpha, createTheme } from "@mui/material/styles";

// =========================================================
// PHARMALYX DESIGN SYSTEM · "INK & JADE · VIVID"
//
// Everything visual in the app comes from this file. Change a value in BRAND
// below and every screen follows: colours, fonts, corner radius, spacing,
// shadows and motion. Components never hard-code these values.
// =========================================================

// ---------------------------------------------------------
// 1. BRAND: the only raw values in the app
// ---------------------------------------------------------
const BRAND = {
    color: {
        ink: "#0A1628", // text, navigation, dark surfaces
        inkSoft: "#1C2B42",
        inkMuted: "#4B5768",
        inkFaint: "#97A1AE",

        jade: "#0F766E", // primary actions
        jadeDark: "#0B5C56",
        jadeDeep: "#084A45",
        jadeLight: "#5FB8AE",
        jadeBright: "#0D9488", // middle of the brand gradient
        jadeLively: "#14B8A6", // light end of the brand gradient
        jadeGlow: "#2DD4BF", // highlights, active states, live indicators
        jadeMist: "#E7F4F2",
        jadeWash: "#F2F9F8",
        jadeLine: "#D5EBE8", // table header underline

        gold: "#E9C77B", // rare: top rank, premium marks
        goldDark: "#B98F33",
        goldMist: "#FBF4E4",

        bg: "#F3F6F9",
        paper: "#FFFFFF",
        line: "#E2E8F0",
        lineSoft: "#EDF1F5",
        lineStrong: "#CBD5E1",
        mute: "#EEF2F6",

        // Status colours: clear and saturated; text on tints uses the Dark shade.
        success: "#16A34A",
        successDark: "#15803D",
        successLight: "#86EFAC",
        successBright: "#4ADE80",
        warning: "#D97706",
        warningDark: "#B45309",
        warningLight: "#FCD34D",
        warningBright: "#FBBF24",
        error: "#DC2626",
        errorDark: "#B91C1C",
        errorLight: "#FCA5A5",
        errorBright: "#F87171",
        info: "#2563EB",
        infoDark: "#1D4ED8",
        infoLight: "#93C5FD",
        infoBright: "#60A5FA",
        violet: "#7C3AED", // second chart series, "AI" and leave marks
        violetDark: "#6D28D9",
        violetBright: "#A78BFA",
        indigo: "#6366F1",
        slate: "#475569",
        slateBright: "#94A3B8",

        white: "#FFFFFF",
    },

    font: {
        body: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
        display: "'Fraunces', 'Iowan Old Style', Georgia, serif",
    },

    // Font sizes (px) and weights used everywhere.
    size: { micro: 11, caption: 12, small: 13, body: 14, lead: 15, title: 16, h5: 18, h4: 20, h3: 28, h2: 32, h1: 38, metric: 28 },
    weight: { regular: 400, medium: 500, semibold: 600, bold: 700, heavy: 800 },

    // Corner radius in px. `shape.borderRadius` is the base unit (sx multiples).
    radius: { base: 8, xs: 6, sm: 8, md: 10, lg: 14, xl: 18, pill: 999 },

    // Spacing base (px). theme.spacing(n) = n x 8.
    spacing: 8,

    // Control heights (px).
    control: { height: 40, field: 44, compact: 38, small: 32 },

    shadow: {
        ink: "10, 22, 40", // rgb of ink, for layered shadows
        jade: "15, 118, 110",
        jadeBright: "13, 148, 136",
        indigo: "79, 70, 229",
    },

    motion: { fast: "140ms ease", base: "180ms ease", slow: "240ms ease" },
};

const C = BRAND.color;
const ink = (a) => `rgba(${BRAND.shadow.ink}, ${a})`;
const jadeA = (a) => `rgba(${BRAND.shadow.jade}, ${a})`;
const px = (n) => `${n}px`;

const brightA = (a) => `rgba(${BRAND.shadow.jadeBright}, ${a})`;
const indigoA = (a) => `rgba(${BRAND.shadow.indigo}, ${a})`;

// Cards lift off the page: a crisp contact shadow plus a soft, wide one.
const SHADOW = {
    xs: `0 1px 2px ${ink(0.06)}`,
    sm: `0 1px 2px ${ink(0.06)}, 0 8px 24px ${ink(0.07)}`,
    md: `0 1px 2px ${ink(0.06)}, 0 14px 34px ${ink(0.09)}`,
    lg: `0 20px 50px ${ink(0.16)}`,
    xl: `0 28px 80px ${ink(0.22)}`,
    focus: `0 0 0 4px ${jadeA(0.18)}`,
    glow: `0 8px 20px ${brightA(0.3)}, inset 0 1px 0 rgba(255, 255, 255, 0.22)`,
    glowSoft: `0 6px 18px ${brightA(0.35)}`,
};

// Soft brand glow behind every page (jade top-left, indigo top-right).
const WORKSPACE_GLOW = `radial-gradient(1200px 420px at 0% 0%, ${brightA(0.1)}, transparent 60%), radial-gradient(900px 380px at 100% 0%, ${indigoA(0.07)}, transparent 60%)`;

// Icon tiles and accent bars: each colour as a gradient from its main to its bright shade.
const ACCENT = {
    primary: [C.jade, C.jadeLively],
    info: [C.info, C.infoBright],
    submitted: [C.info, C.infoBright],
    success: [C.success, C.successBright],
    warning: [C.warning, C.warningBright],
    error: [C.error, C.errorBright],
    secondary: [C.slate, C.slateBright],
    gold: [C.goldDark, C.gold],
};
const accentGradient = Object.fromEntries(Object.entries(ACCENT).map(([key, [from, to]]) => [key, `linear-gradient(135deg, ${from} 0%, ${to} 100%)`]));

// ---------------------------------------------------------
// 2. THEME
// ---------------------------------------------------------
const PharmalyxTheme = createTheme({
    brand: BRAND,
    radius: BRAND.radius,
    fontWeight: BRAND.weight,
    fontSize: BRAND.size,
    control: BRAND.control,
    motion: BRAND.motion,
    shadows3: SHADOW,

    spacing: BRAND.spacing,

    palette: {
        mode: "light",

        primary: { main: C.jade, dark: C.jadeDark, light: C.jadeLight, contrastText: C.white },
        secondary: { main: C.inkMuted, dark: C.inkSoft, light: C.inkFaint, contrastText: C.white },

        // Rare accent: ranks, premium marks.
        gold: { main: C.gold, dark: C.goldDark, light: C.goldMist, contrastText: C.ink },

        brand: {
            ink: C.ink,
            jade: C.jade,
            jadeGlow: C.jadeGlow,
            gold: C.gold,

            gradient: `linear-gradient(135deg, ${C.jade} 0%, ${C.jadeBright} 55%, ${C.jadeLively} 100%)`,
            gradientGlow: `linear-gradient(135deg, ${C.jade} 0%, ${C.jadeLively} 100%)`,
            workspaceGlow: WORKSPACE_GLOW,
            gradientSoft: `linear-gradient(135deg, ${C.jadeWash} 0%, ${C.paper} 100%)`,
            gradientInk: `linear-gradient(160deg, ${C.inkSoft} 0%, ${C.ink} 60%)`,
            glow: SHADOW.glow,
            glowSoft: SHADOW.glowSoft, // logo on white surfaces

            glass: C.paper,
            glassStrong: C.paper,
            white: C.white,

            // Logo: the mark's top sheen and its strokes.
            markSheen: `linear-gradient(180deg, ${alpha(C.white, 0.22)} 0%, ${alpha(C.white, 0)} 55%)`,
            markStroke: C.white,
            markPulse: C.jadeGlow,

            // Older names used by existing components, mapped to Ink & Jade.
            blue: C.jade,
            cyan: C.jadeGlow,
            teal: C.jadeGlow,
            navy: C.ink,
            indigo: C.indigo,
            violet: C.violet,
            terracotta: C.jade,
            terracottaDark: C.jadeDark,
            terracottaLight: C.jadeLight,
            terracottaSoft: C.jadeMist,
            terracottaMuted: C.jadeWash,
            graphite: C.ink,
            charcoal: C.inkSoft,
            slate: C.inkMuted,
            sage: C.jadeGlow,
            sageDark: C.jadeDark,
            sageLight: C.jadeLight,
            sageSoft: C.jadeMist,
            ivory: C.bg,
            ivoryDark: C.mute,
        },

        chart: {
            primary: C.jade,
            secondary: C.indigo, // a second series that is not another teal
            violet: C.violet,
            success: C.success,
            warning: C.warning,
            error: C.error,
            neutral: C.inkFaint,
            accent: C.gold,
            ours: C.jade,
            competitor: C.lineStrong,
        },

        command: { background: C.bg, surface: C.paper, elevated: C.paper, border: C.line, text: C.ink, mutedText: C.inkMuted },
        intelligence: { background: C.bg, surface: C.paper, elevated: C.paper, primary: C.jade, accent: C.jadeGlow, border: C.line, text: C.ink, mutedText: C.inkMuted },

        // Navigation rail: light surface, ink pill for the current page, jade accents.
        sidebar: {
            tone: "light", // logo colours: "light" (on white) or "dark" (on ink)
            background: C.paper,
            backgroundImage: "none",
            surface: C.mute,

            active: C.jade, // current section icon, guide-line marker, focus ring
            activeLight: C.ink, // the pill behind the current page
            activeText: C.white, // text inside the pill
            pillIcon: C.jadeGlow, // icon inside the pill
            sectionText: C.ink, // open section holding the current page
            activeGlow: `0 6px 16px ${ink(0.18)}`,

            text: C.inkSoft,
            mutedText: C.inkMuted,
            groupLabel: C.inkFaint,
            hoverText: C.ink,
            hover: C.mute,

            border: C.line,
            guide: C.line,
            scrollbar: C.lineStrong,

            badgeBackground: C.mute,
            badgeText: C.inkMuted,

            searchBackground: C.bg,
            searchBorder: C.line,
            searchFocusBorder: C.jade,
            keyBackground: C.paper,

            countBackground: C.goldMist, // numeric badge (e.g. pending items)
            countText: C.goldDark,
            aiBackground: C.jadeMist, // "AI" badge
            aiText: C.jade,
        },

        // Dark ink surfaces (login brand panel): the original ink styling.
        night: {
            background: C.ink,
            backgroundImage: `linear-gradient(180deg, ${C.inkSoft} 0%, ${C.ink} 42%, ${C.ink} 100%)`,
            surface: C.inkSoft,
            active: C.jadeGlow,
            activeText: C.white,
            text: alpha(C.white, 0.78),
            mutedText: alpha(C.white, 0.5),
            hover: alpha(C.white, 0.1), // progress track
            activeLight: alpha(C.jadeGlow, 0.14), // feature icon tile
            border: alpha(C.white, 0.08),
            card: alpha(C.white, 0.06),
        },

        // Light brand panel on the login page (white fading into jade glows).
        loginPanel: {
            background: C.paper,
            backgroundImage: "none",
            surface: C.paper, // "This month" preview card
            border: C.line,
            activeText: C.ink, // headline, card title and values
            heading: C.inkSoft, // brand-panel headline
            text: C.inkSoft,
            mutedText: C.inkMuted,
            hover: ink(0.08), // progress track
            active: C.jadeGlow, // feature icon
            activeLight: C.ink, // feature icon tile
            // Brand-panel glows: jade only, so the panel stays on brand.
            glowPrimary: jadeA(0.3),
            glowSecondary: alpha(C.jadeGlow, 0.22),
            // Form side: a light jade tint at the top so both halves feel like one surface.
            formBackground: C.bg,
            formImage: `radial-gradient(900px 520px at 50% -10%, ${brightA(0.09)}, transparent 70%)`,
        },

        background: { default: C.bg, paper: C.paper },

        surface: { workspace: C.bg, default: C.paper, subtle: C.jadeWash, muted: C.mute, elevated: C.paper },

        // Gradient per palette key for icon tiles and accent bars (StatCard, KPI cards).
        accentGradient,

        // Table headers: a clean jade-tinted band with dark text, not grey on grey.
        tableHead: { background: C.jadeWash, text: C.inkSoft, border: C.jadeLine },

        border: { subtle: C.lineSoft, default: C.line, strong: C.lineStrong },

        text: { primary: C.ink, secondary: C.inkMuted, disabled: C.inkFaint },

        divider: C.line,

        plan: { working: C.jade, workingSoft: C.jadeMist, workingBorder: C.jadeLight, off: C.inkMuted, offSoft: C.mute, offHatch: C.line, empty: C.lineStrong },

        success: { main: C.success, dark: C.successDark, light: C.successLight, contrastText: C.white },
        warning: { main: C.warning, dark: C.warningDark, light: C.warningLight, contrastText: C.white },
        error: { main: C.error, dark: C.errorDark, light: C.errorLight, contrastText: C.white },
        info: { main: C.info, dark: C.infoDark, light: C.infoLight, contrastText: C.white },
        violet: { main: C.violet, dark: C.violetDark, light: C.violetBright, contrastText: C.white },
        submitted: { main: C.info, dark: C.infoDark, light: C.infoLight, contrastText: C.white },
    },

    // =========================================================
    // LAYOUT AND SHARED TOKENS (spacing units unless marked px)
    // =========================================================

    layout: {
        page: { maxWidth: 900, paddingX: { xs: 2, sm: 3, md: 4 }, paddingY: 3.5 },
        section: { marginBottom: 3, titleGap: 2.5, fieldGap: 2.25 },
        header: { paddingX: { xs: 2, sm: 3, md: 4 }, paddingY: 3, indicatorWidth: 4, indicatorHeight: 42, sectionIndicatorWidth: 3, sectionIndicatorHeight: 28 },
        actionBar: { paddingX: { xs: 2, sm: 3, md: 4 }, paddingY: 2, gap: 1.5 },
    },

    card: { radius: 2, borderWidth: 1, shadow: SHADOW.sm },

    elevation: { sm: SHADOW.xs, md: SHADOW.md, lg: SHADOW.lg, focus: SHADOW.focus },

    configuration: { labelColumnWidth: 280, sectionPaddingY: 3, rowMinHeight: 56, rowPaddingX: 2, rowPaddingY: 1.25, iconSize: 32, iconFontSize: 18, countMinWidth: 96 },

    field: {
        minHeight: BRAND.control.field,
        compactHeight: BRAND.control.height,
        radius: 1.25,
        label: { fontSize: BRAND.size.small },
        input: { fontSize: BRAND.size.body },
        helperText: { fontSize: BRAND.size.micro, marginLeft: 0.5, marginTop: 0.5 },
        transition: `border-color ${BRAND.motion.base}, box-shadow ${BRAND.motion.base}, background-color ${BRAND.motion.base}`,
    },

    status: { controlHeight: BRAND.control.compact, optionMinWidth: 70, optionPaddingX: 1.75, optionRadius: 0, dotSize: 7 },

    // badge: tag / chip background strength (stronger so status colours read at a glance).
    tint: { hover: 0.04, selected: 0.08, soft: 0.1, badge: 0.14, border: 0.22, strong: 0.32, tileShadow: 0.32 },

    pageHeader: { marginBottom: 3, gap: 2, eyebrowMarginBottom: 0.75, subtitleMarginTop: 0.75, actionsGap: 1.25 },

    panel: { radius: 2, padding: { xs: 2, md: 2.5 }, headerPaddingY: 2, gap: 2 },

    stat: { padding: { xs: 2, md: 2.25 }, gap: 2, iconSize: 42, iconFontSize: 22, iconRadius: 1.5, valueMarginTop: 0.5, progressMarginTop: 1.5, progressHeight: 6 },

    statusChip: { height: 28, paddingX: 1.25, gap: 0.75, radius: BRAND.radius.pill, dotSize: 7 },

    timeline: { dotSize: 28, iconSize: 16, connectorWidth: 2, stepGap: 2.25 },

    calendar: {
        weekdayPaddingY: 1.25,
        gridGap: { xs: 0.5, sm: 0.75 },
        cell: { minHeight: { xs: 64, sm: 92, lg: 108 }, padding: { xs: 0.5, sm: 1 }, radius: 1.25, markerWidth: 3 },
        dateBadge: { size: 26 },
        hatchSize: 6,
        legendSwatch: 12,
        loadingOpacity: 0.55,
        transition: `background-color ${BRAND.motion.fast}, border-color ${BRAND.motion.fast}, box-shadow ${BRAND.motion.fast}, transform ${BRAND.motion.fast}`,
    },

    dialog: { width: 520, paddingX: { xs: 2, sm: 3 }, paddingY: { xs: 2, sm: 2.5 }, phoneMargin: 2 },

    toggle: { medium: { width: 36, height: 20, thumb: 16, gap: 2 }, small: { width: 28, height: 16, thumb: 12, gap: 2 } },

    permissionMatrix: { featureColumnMinWidth: 260, actionColumnWidth: 96, minWidth: 820, cellHeight: 60, changedDotSize: 6 },

    engagement: { dateColumn: 160, quantityColumn: 100, groupedBarWidth: "28%", percentColumn: 36, swatchRadius: 0.5 },

    dashboard: {
        heroPadding: { xs: 2.5, md: 3.5 },
        chartHeight: 180,
        barGap: 2,
        barRadius: 4,
        gridLines: 4,
        barWidth: "62%",
        barMinWidth: 4,
        tooltipOffset: 8,
        sideColumnWidth: 44,
        skeleton: { hero: 180, stat: 120, chart: 280 },
        donutSize: 156,
        donutStroke: 14,
        scheduleTimeWidth: 52,
        scheduleDotSize: 10,
        scheduleMaxHeight: 300,
        quickActionMinHeight: 92,
        dateChipHeight: BRAND.control.height,
        lineChartHeight: 180,
        markerSize: 8,
        donutGap: 4,
        hero: {
            quoteMaxWidth: 460,
            padding: { xs: 2.5, md: 3 },
            accentWidth: 4,
            statusDot: 8,
            accentGradient: (theme) => `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.brand.jadeGlow} 100%)`,
        },
        kpi: { sparkWidth: 76, sparkHeight: 34, ringSize: 50, ringStroke: 6, barWidth: 6, barGap: 3, barHeight: 34 },
        quickTileMinHeight: 96,
        quickTileWidth: 88,
        groupedBarGap: 0.18,
    },

    doctorRequests: { cameraMaxHeight: 320, photoHeight: 160 },
    insights: { pickerWidth: 240, thresholdWidth: 170 },
    reports: { tableMaxHeight: 560 },

    // Data Import Center (Administration > Data import).
    dataImport: {
        stepBadgeSize: 32, // numbered circle on each import type
        dropZonePaddingY: 4,
        dropZoneBorder: "2px dashed",
        dropIconSize: 34,
        fieldColumnWidth: 240, // "Pharmalyx field" column when matching columns
        selectWidth: 260,
        sampleMaxWidth: 320,
        valueChooserWidth: 300,
        issuesMaxHeight: 520,
        messageMaxWidth: 520,
        actionSelectWidth: 150,
        defaultInputWidth: 200, // "value for every row" box
        placeChooserWidth: 260,
    },

    login: { formMaxWidth: 400, brandPaddingX: { md: 6, lg: 8 }, brandPaddingY: 6, glowSize: 520, previewWidth: 360, fieldHeight: 48, brandMarkSize: 40, headlineMaxWidth: 500, spinnerSize: 18, sectionGap: 4, featuresMarginTop: 4, featureGap: 1.5,
        // Laptop screens with little height: tighter panel so it fits without scrolling.
        shortScreen: "@media (max-height: 760px)",
        compact: { paddingY: 4, sectionGap: 2.5, featuresMarginTop: 2.5, featureGap: 1 },
        // Brand-panel headline: lighter and smaller than h1 so the sign-in form leads.
        headline: { fontSize: 34, fontWeight: BRAND.weight.medium, lineHeight: 1.15, letterSpacing: "-0.025em" } },

    appShell: { contentPadding: { xs: 2, sm: 2.5, md: 3, lg: 3.5 }, headerHeight: 68, headerPaddingX: { xs: 1.5, sm: 2, md: 3 }, drawerMaxWidth: "85vw" },

    table: { loadingOpacity: 0.55, textMaxWidth: 260, emptyPaddingY: 7, emptyIconSize: 44, emptyMessageMaxWidth: 420 },

    entityCard: { minWidth: 280, padding: 2, gap: 1.5, badgeSize: 26, hoverLift: "translateY(-2px)" },

    search: { minWidth: { xs: "100%", sm: 240 } },

    dcr: { calendarWidth: 56, cellMinHeight: { xs: 48, sm: 64 }, dotSize: 6 },

    visitList: { timeColumnWidth: 104, sidePanelWidth: 40, sideListMaxHeight: 360 },

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
        radius: 1.25,
        childIndent: 2.25,
        guideOffset: 2.5,
        indicatorWidth: 3,
        flyoutMinWidth: 220,
        searchHeight: 38,
        groupGap: 2,
        badgeHeight: 18,
        scrollbarWidth: 5,
        transition: `width ${BRAND.motion.base}`,
        itemTransition: `background-color ${BRAND.motion.fast}, color ${BRAND.motion.fast}`,
        chevronTransition: `transform ${BRAND.motion.base}`,
    },

    drawer: { width: { xs: "100%", sm: 560 }, paddingX: { xs: 2, sm: 3 }, paddingY: 2.5, sectionGap: 3 },

    avatar: { size: 44, sizeSmall: 32 },

    segmented: { padding: 0.5, gap: 0.5, radius: 1.5, itemRadius: 1.25, itemHeight: BRAND.control.compact, itemPaddingX: 1.75, itemGap: 1, iconSize: 18, selectedShadow: SHADOW.sm },

    // Legacy master and mapping pages (Users, Areas, Doctors, Pharmacies, Stockists, mappings).
    master: {
        listMaxHeight: 420,
        searchWidth: 280,
        selectWidth: 260,
        formMaxWidth: 1200,
        iconBox: 40,
        smallIconBox: 32,
        chipHeight: 24,
        avatar: 36,
    },

    shape: { borderRadius: BRAND.radius.base },

    // =========================================================
    // TYPOGRAPHY
    // =========================================================

    typography: {
        fontFamily: BRAND.font.body,
        displayFontFamily: BRAND.font.display,
        fontWeightLight: BRAND.weight.regular,
        fontWeightRegular: BRAND.weight.regular,
        fontWeightMedium: BRAND.weight.medium,
        fontWeightSemibold: BRAND.weight.semibold,
        fontWeightBold: BRAND.weight.bold,
        fontWeightHeavy: BRAND.weight.heavy,

        // Named text sizes: components use them as sx `fontSize: "textSm"` (also for icons).
        textXxs: px(10),
        textXs: px(BRAND.size.micro),
        textSm: px(BRAND.size.caption),
        textMd: px(BRAND.size.small),
        textBase: px(BRAND.size.body),
        textLg: px(BRAND.size.lead),
        textXl: px(BRAND.size.title),
        text2xl: px(BRAND.size.h5),
        text3xl: px(BRAND.size.h4),
        text4xl: px(22),

        // Big headings: Fraunces.
        h1: { fontFamily: BRAND.font.display, fontSize: px(BRAND.size.h1), lineHeight: 1.12, fontWeight: BRAND.weight.semibold, letterSpacing: "-0.02em" },
        h2: { fontFamily: BRAND.font.display, fontSize: px(BRAND.size.h2), lineHeight: 1.18, fontWeight: BRAND.weight.semibold, letterSpacing: "-0.015em" },
        h3: { fontFamily: BRAND.font.display, fontSize: px(BRAND.size.h3), lineHeight: 1.22, fontWeight: BRAND.weight.semibold, letterSpacing: "-0.01em" },

        // Section and card headings: Plus Jakarta Sans.
        h4: { fontFamily: BRAND.font.body, fontSize: px(BRAND.size.h4), lineHeight: 1.35, fontWeight: BRAND.weight.bold, letterSpacing: "-0.01em" },
        h5: { fontFamily: BRAND.font.body, fontSize: px(BRAND.size.h5), lineHeight: 1.4, fontWeight: BRAND.weight.bold, letterSpacing: "-0.005em" },
        h6: { fontFamily: BRAND.font.body, fontSize: px(BRAND.size.title), lineHeight: 1.45, fontWeight: BRAND.weight.bold },

        body1: { fontSize: px(BRAND.size.lead), lineHeight: 1.6, fontWeight: BRAND.weight.regular },
        body2: { fontSize: px(BRAND.size.body), lineHeight: 1.55, fontWeight: BRAND.weight.regular },
        subtitle1: { fontSize: px(BRAND.size.lead), lineHeight: 1.45, fontWeight: BRAND.weight.semibold },
        subtitle2: { fontSize: px(BRAND.size.small), lineHeight: 1.4, fontWeight: BRAND.weight.semibold },
        caption: { fontSize: px(BRAND.size.caption), lineHeight: 1.45, fontWeight: BRAND.weight.regular },
        overline: { fontSize: px(BRAND.size.micro), lineHeight: 1.4, fontWeight: BRAND.weight.bold, letterSpacing: "0.14em", textTransform: "uppercase" },

        // Large numbers on stat cards: Jakarta, tabular so columns line up.
        metric: { fontFamily: BRAND.font.body, fontSize: px(BRAND.size.metric), lineHeight: 1.15, fontWeight: BRAND.weight.heavy, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" },

        micro: { fontSize: px(BRAND.size.micro), lineHeight: 1.3, fontWeight: BRAND.weight.medium },

        // The "Pharmalyx" wordmark next to the logo.
        wordmark: { fontFamily: BRAND.font.display, fontSize: px(BRAND.size.h4), lineHeight: 1.05, fontWeight: BRAND.weight.semibold, letterSpacing: "-0.02em" },
        tagline: { fontFamily: BRAND.font.body, fontSize: px(BRAND.size.micro - 1), lineHeight: 1.3, fontWeight: BRAND.weight.semibold, letterSpacing: "0.14em", textTransform: "uppercase" },

        button: { fontSize: px(BRAND.size.body), fontWeight: BRAND.weight.semibold, textTransform: "none", letterSpacing: "0" },
    },

    // =========================================================
    // COMPONENTS
    // =========================================================

    components: {
        MuiCssBaseline: {
            styleOverrides: (theme) => ({
                html: { backgroundColor: theme.palette.background.default },
                body: {
                    margin: 0,
                    padding: 0,
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    fontFeatureSettings: "'ss01' on, 'cv11' on",
                },
                "::selection": { backgroundColor: alpha(theme.palette.brand.jadeGlow, 0.3) },
                // Browser autofill keeps the field white with normal text instead of its own blue.
                "input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus": {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                    WebkitTextFillColor: theme.palette.text.primary,
                    caretColor: theme.palette.text.primary,
                    transition: "background-color 9999s ease-out",
                },
                "*": { scrollbarWidth: "thin", scrollbarColor: `${theme.palette.border.strong} transparent` },
                "*::-webkit-scrollbar": { width: px(7), height: px(7) },
                "*::-webkit-scrollbar-track": { background: "transparent" },
                "*::-webkit-scrollbar-thumb": { background: theme.palette.border.strong, borderRadius: px(theme.radius.md) },
                "*::-webkit-scrollbar-thumb:hover": { background: theme.palette.text.disabled },
            }),
        },

        MuiPaper: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundImage: "none",
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows3.sm,
                }),
                rounded: ({ theme }) => ({ borderRadius: px(theme.radius.lg) }),
            },
        },

        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: ({ theme }) => ({
                    minHeight: theme.control.height,
                    borderRadius: px(theme.radius.md),
                    paddingLeft: theme.spacing(2),
                    paddingRight: theme.spacing(2),
                    fontWeight: theme.fontWeight.semibold,
                    transition: `background-color ${theme.motion.base}, border-color ${theme.motion.base}, box-shadow ${theme.motion.base}, transform ${theme.motion.base}`,
                    "&:hover": { transform: "translateY(-1px)" },
                    "&:active": { transform: "translateY(0)" },
                }),
                sizeSmall: ({ theme }) => ({ minHeight: theme.control.small, paddingLeft: theme.spacing(1.25), paddingRight: theme.spacing(1.25), borderRadius: px(theme.radius.sm) }),
                sizeLarge: ({ theme }) => ({ minHeight: theme.control.field, paddingLeft: theme.spacing(2.5), paddingRight: theme.spacing(2.5) }),
                containedPrimary: ({ theme }) => ({
                    backgroundColor: theme.palette.primary.main,
                    backgroundImage: theme.palette.brand.gradient,
                    color: theme.palette.primary.contrastText,
                    boxShadow: `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.14)}`,
                    "&:hover": { backgroundColor: theme.palette.primary.dark, boxShadow: theme.palette.brand.glow },
                }),
                containedSecondary: ({ theme }) => ({
                    backgroundColor: theme.palette.brand.ink,
                    color: theme.palette.secondary.contrastText,
                    "&:hover": { backgroundColor: theme.palette.secondary.dark, boxShadow: theme.shadows3.md },
                }),
                outlined: ({ theme }) => ({
                    borderColor: theme.palette.border.default,
                    color: theme.palette.text.primary,
                    backgroundColor: theme.palette.background.paper,
                    "&:hover": { borderColor: theme.palette.primary.main, backgroundColor: alpha(theme.palette.primary.main, theme.tint.hover), color: theme.palette.primary.dark },
                    "&.MuiButton-colorError": {
                        color: theme.palette.error.main,
                        borderColor: alpha(theme.palette.error.main, theme.tint.strong),
                        "&:hover": { borderColor: theme.palette.error.main, backgroundColor: alpha(theme.palette.error.main, theme.tint.hover) },
                    },
                    "&.MuiButton-colorSuccess": { color: theme.palette.success.main, borderColor: alpha(theme.palette.success.main, theme.tint.strong) },
                    "&.MuiButton-colorWarning": { color: theme.palette.warning.dark, borderColor: alpha(theme.palette.warning.main, theme.tint.strong) },
                }),
                text: ({ theme }) => ({ "&:hover": { backgroundColor: alpha(theme.palette.primary.main, theme.tint.selected) } }),
            },
        },

        MuiIconButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: px(theme.radius.md),
                    transition: `background-color ${theme.motion.fast}, color ${theme.motion.fast}`,
                    "&:hover": { backgroundColor: alpha(theme.palette.primary.main, theme.tint.selected) },
                }),
            },
        },

        MuiToggleButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    textTransform: "none",
                    fontWeight: theme.fontWeight.semibold,
                    borderColor: theme.palette.border.default,
                    "&.Mui-selected": { color: theme.palette.primary.dark, backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft) },
                }),
            },
        },

        MuiTabs: {
            styleOverrides: {
                root: ({ theme }) => ({ minHeight: theme.control.field }),
                indicator: ({ theme }) => ({ height: 2, borderRadius: px(theme.radius.xs), backgroundColor: theme.palette.primary.main }),
            },
        },

        MuiTab: {
            styleOverrides: {
                root: ({ theme }) => ({
                    minHeight: theme.control.field,
                    paddingLeft: theme.spacing(2),
                    paddingRight: theme.spacing(2),
                    color: theme.palette.text.secondary,
                    fontSize: px(theme.fontSize.body),
                    fontWeight: theme.fontWeight.semibold,
                    textTransform: "none",
                    "&.Mui-selected": { color: theme.palette.primary.main },
                    "&:hover": { color: theme.palette.primary.dark },
                }),
            },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }) => ({
                    minHeight: theme.field.minHeight,
                    borderRadius: px(theme.radius.md),
                    backgroundColor: theme.palette.background.paper,
                    transition: theme.field.transition,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.border.default },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.light },
                    "&.Mui-focused": { boxShadow: theme.shadows3.focus },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main, borderWidth: 1 },
                    "&.Mui-disabled": { backgroundColor: theme.palette.surface.muted },
                    "&.MuiInputBase-sizeSmall": { minHeight: theme.control.compact },
                }),
                input: ({ theme }) => ({ fontSize: px(theme.field.input.fontSize), color: theme.palette.text.primary }),
            },
        },

        MuiInputLabel: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.text.secondary,
                    fontSize: px(theme.field.label.fontSize),
                    fontWeight: theme.fontWeight.medium,
                    "&.Mui-focused": { color: theme.palette.primary.main },
                }),
            },
        },

        MuiSelect: { styleOverrides: { select: ({ theme }) => ({ fontSize: px(theme.field.input.fontSize) }) } },

        MuiFormHelperText: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.text.secondary,
                    fontSize: px(theme.field.helperText.fontSize),
                    marginLeft: theme.spacing(theme.field.helperText.marginLeft),
                    marginTop: theme.spacing(theme.field.helperText.marginTop),
                }),
            },
        },

        MuiTableContainer: { styleOverrides: { root: ({ theme }) => ({ borderRadius: px(theme.radius.lg), backgroundColor: theme.palette.background.paper }) } },

        MuiTableHead: { styleOverrides: { root: ({ theme }) => ({ backgroundColor: theme.palette.tableHead.background }) } },

        MuiTableCell: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderBottom: `1px solid ${theme.palette.border.subtle}`,
                    color: theme.palette.text.primary,
                    fontSize: px(theme.fontSize.body),
                    padding: theme.spacing(1.75, 2),
                }),
                head: ({ theme }) => ({
                    color: theme.palette.tableHead.text,
                    fontSize: px(theme.fontSize.caption),
                    fontWeight: theme.fontWeight.bold,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    backgroundColor: theme.palette.tableHead.background,
                    borderBottom: `1px solid ${theme.palette.tableHead.border}`,
                    whiteSpace: "nowrap",
                }),
            },
        },

        MuiTableRow: {
            styleOverrides: {
                root: ({ theme }) => ({
                    transition: `background-color ${theme.motion.fast}`,
                    "&:hover": { backgroundColor: theme.palette.surface.subtle },
                    "&:last-child td": { borderBottom: 0 },
                }),
            },
        },

        MuiChip: {
            styleOverrides: {
                root: ({ theme }) => ({ borderRadius: px(theme.radius.pill), fontWeight: theme.fontWeight.semibold, fontSize: px(theme.fontSize.caption) }),
                colorPrimary: ({ theme }) => ({ backgroundColor: alpha(theme.palette.primary.main, theme.tint.badge), color: theme.palette.primary.dark }),
                colorSuccess: ({ theme }) => ({ backgroundColor: alpha(theme.palette.success.main, theme.tint.badge), color: theme.palette.success.dark }),
                colorWarning: ({ theme }) => ({ backgroundColor: alpha(theme.palette.warning.main, theme.tint.badge), color: theme.palette.warning.dark }),
                colorError: ({ theme }) => ({ backgroundColor: alpha(theme.palette.error.main, theme.tint.badge), color: theme.palette.error.dark }),
                colorInfo: ({ theme }) => ({ backgroundColor: alpha(theme.palette.info.main, theme.tint.badge), color: theme.palette.info.dark }),
            },
        },

        MuiDialog: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    borderRadius: px(theme.radius.xl),
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows3.xl,
                    backgroundImage: "none",
                    backgroundColor: theme.palette.background.paper,
                    [theme.breakpoints.down("sm")]: {
                        margin: theme.spacing(theme.dialog.phoneMargin),
                        width: `calc(100% - ${theme.spacing(theme.dialog.phoneMargin * 2)})`,
                        maxHeight: `calc(100% - ${theme.spacing(theme.dialog.phoneMargin * 2)})`,
                    },
                }),
            },
        },

        MuiDialogTitle: {
            styleOverrides: {
                root: ({ theme }) => ({ ...theme.typography.h5, paddingTop: theme.spacing(2.5) }),
            },
        },

        MuiMenu: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    borderRadius: px(theme.radius.lg),
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows3.lg,
                    marginTop: theme.spacing(0.5),
                }),
            },
        },

        MuiMenuItem: {
            styleOverrides: {
                root: ({ theme }) => ({
                    minHeight: theme.control.height,
                    borderRadius: px(theme.radius.sm),
                    margin: theme.spacing(0.25, 0.75),
                    fontSize: px(theme.fontSize.body),
                    "&:hover": { backgroundColor: alpha(theme.palette.primary.main, theme.tint.selected) },
                    "&.Mui-selected": {
                        backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft),
                        color: theme.palette.primary.dark,
                        "&:hover": { backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft * 1.4) },
                    },
                }),
            },
        },

        MuiTooltip: {
            styleOverrides: {
                tooltip: ({ theme }) => ({
                    backgroundColor: theme.palette.brand.ink,
                    color: theme.palette.common.white,
                    fontSize: px(theme.fontSize.caption),
                    fontWeight: theme.fontWeight.medium,
                    borderRadius: px(theme.radius.sm),
                    padding: theme.spacing(0.875, 1.25),
                    boxShadow: theme.shadows3.lg,
                }),
                arrow: ({ theme }) => ({ color: theme.palette.brand.ink }),
            },
        },

        MuiDivider: { styleOverrides: { root: ({ theme }) => ({ borderColor: theme.palette.border.subtle }) } },

        MuiAutocomplete: {
            styleOverrides: {
                paper: ({ theme }) => ({ borderRadius: px(theme.radius.lg), boxShadow: theme.shadows3.lg }),
            },
        },

        MuiAlert: {
            styleOverrides: {
                root: ({ theme }) => ({ borderRadius: px(theme.radius.lg), alignItems: "flex-start" }),
            },
        },

        MuiSnackbar: {
            styleOverrides: {
                root: ({ theme }) => ({ "& .MuiSnackbarContent-root, & .MuiAlert-root": { borderRadius: px(theme.radius.lg), boxShadow: theme.shadows3.lg } }),
            },
        },

        MuiFormControlLabel: { styleOverrides: { root: ({ theme }) => ({ marginRight: theme.spacing(1) }) } },

        MuiAvatar: {
            styleOverrides: {
                root: ({ theme }) => ({ backgroundColor: theme.palette.surface.subtle, color: theme.palette.primary.dark, fontWeight: theme.fontWeight.bold }),
            },
        },

        MuiLinearProgress: {
            styleOverrides: {
                root: ({ theme }) => ({ height: theme.stat.progressHeight, borderRadius: px(theme.radius.pill), backgroundColor: theme.palette.surface.muted }),
                bar: ({ theme }) => ({ borderRadius: px(theme.radius.pill) }),
                barColorPrimary: ({ theme }) => ({ backgroundImage: theme.palette.brand.gradientGlow }),
            },
        },

        MuiCircularProgress: { styleOverrides: { root: ({ theme }) => ({ color: theme.palette.primary.main }) } },

        MuiAccordion: {
            styleOverrides: {
                root: ({ theme }) => ({ borderRadius: px(theme.radius.lg), boxShadow: theme.shadows3.sm, "&.Mui-expanded": { margin: theme.spacing(1.5, 0) } }),
            },
        },

        MuiBreadcrumbs: { styleOverrides: { root: ({ theme }) => ({ color: theme.palette.text.secondary }) } },

        MuiStepper: { styleOverrides: { root: { background: "transparent" } } },

        MuiStepIcon: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.surface.muted,
                    "&.Mui-active": { color: theme.palette.primary.main },
                    "&.Mui-completed": { color: theme.palette.success.main },
                }),
            },
        },

        MuiPagination: {
            styleOverrides: {
                root: ({ theme }) => ({
                    "& .MuiPaginationItem-root": {
                        borderRadius: px(theme.radius.sm),
                        "&.Mui-selected": { backgroundImage: theme.palette.brand.gradient, color: theme.palette.primary.contrastText },
                    },
                }),
            },
        },

        MuiListItemButton: {
            styleOverrides: {
                root: ({ theme }) => ({ borderRadius: px(theme.radius.md), "&:hover": { backgroundColor: alpha(theme.palette.primary.main, theme.tint.hover) } }),
            },
        },

        MuiListItemIcon: { styleOverrides: { root: ({ theme }) => ({ minWidth: theme.control.height, color: theme.palette.text.secondary }) } },

        MuiListItemText: {
            styleOverrides: {
                primary: ({ theme }) => ({ color: theme.palette.text.primary }),
                secondary: ({ theme }) => ({ color: theme.palette.text.secondary }),
            },
        },

        // Pill toggle: white thumb centred inside a filled track.
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
                            transitionDuration: theme.motion.base.split(" ")[0],
                            "&:hover": { backgroundColor: "transparent" },
                            "&.Mui-checked": {
                                transform: `translateX(${travel}px)`,
                                color: theme.palette.common.white,
                                "& + .MuiSwitch-track": { opacity: 1, backgroundColor: theme.palette.primary.main, backgroundImage: theme.palette.brand.gradient },
                            },
                            "&.Mui-disabled": { color: theme.palette.common.white },
                            "&.Mui-disabled + .MuiSwitch-track": { opacity: 0.45 },
                            "&.Mui-focusVisible + .MuiSwitch-track": { boxShadow: theme.elevation.focus },
                        },
                        "& .MuiSwitch-thumb": { width: t.thumb, height: t.thumb, boxShadow: theme.elevation.sm },
                        "& .MuiSwitch-track": { opacity: 1, borderRadius: t.height / 2, backgroundColor: theme.palette.border.strong, transition: theme.field.transition },
                    };
                },
            },
        },

        MuiCheckbox: {
            styleOverrides: {
                root: ({ theme }) => ({ color: theme.palette.border.strong, "&.Mui-checked": { color: theme.palette.primary.main } }),
            },
        },

        MuiRadio: {
            styleOverrides: {
                root: ({ theme }) => ({ color: theme.palette.border.strong, "&.Mui-checked": { color: theme.palette.primary.main } }),
            },
        },

        MuiBackdrop: {
            styleOverrides: {
                root: ({ theme, ownerState }) => (ownerState?.invisible ? {} : { backgroundColor: alpha(theme.palette.brand.ink, 0.42), backdropFilter: "blur(3px)" }),
            },
        },

        MuiSkeleton: {
            styleOverrides: { root: ({ theme }) => ({ backgroundColor: theme.palette.surface.muted }), rounded: ({ theme }) => ({ borderRadius: px(theme.radius.lg) }) },
        },

        MuiTypography: {
            defaultProps: { variantMapping: { metric: "p", micro: "span", wordmark: "span", tagline: "span" } },
            styleOverrides: { root: ({ theme }) => ({ color: theme.palette.text.primary }) },
        },
    },
});

export default PharmalyxTheme;
