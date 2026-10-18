import { Link as RouterLink } from "react-router-dom";

import { Box, Button, ButtonBase, Divider, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
    AddLocationAltRounded,
    AssignmentTurnedInRounded,
    BarChartRounded,
    CalendarMonthRounded,
    ChevronRightRounded,
    EventNoteRounded,
    FactCheckRounded,
    FlagRounded,
    FormatQuoteRounded,
    MapRounded,
    ReceiptLongRounded,
    RefreshRounded,
    RouteRounded,
    ShoppingCartRounded,
} from "@mui/icons-material";

import Panel from "../../components/Panel/Panel";
import Tag from "../../components/Tag/Tag";
import CategoryBadge from "../../Pages/MyDoctors/components/CategoryBadge";

const CATEGORY_LABEL = { A: "Class A", B: "Class B", C: "Class C", U: "Unrated" };

const FEEDBACK = {
    POSITIVE: { label: "Positive", color: "success" },
    NEUTRAL: { label: "Neutral", color: "info" },
    NEGATIVE: { label: "Negative", color: "error" },
};

const shortDate = (key) => new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const initials = (name) =>
    String(name || "?")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

// =========================================================
// HEADER
// =========================================================

// A short line for the banner; changes each day.
const QUOTES = [
    "More meaningful doctor engagements for a healthier tomorrow.",
    "Every visit counts. Every doctor matters.",
    "Consistent calls build lasting doctor trust.",
    "Plan the day, own the territory.",
    "Small daily wins make a strong month.",
];

// Greeting banner: accent bar, greeting with the name, a status line and a daily quote on the left;
// date and view switch, the main action and when the data was loaded on the right.
// status: palette key for the dot in front of the subtitle (null hides it).
export function DashboardHeader({ greeting, name, subtitle, status, date, actions, primary, secondary, updatedAt, onRefresh }) {
    const theme = useTheme();
    const day = Number(String(date).slice(8, 10)) || 0;
    const hero = theme.dashboard.hero;
    const dot = status ? theme.palette[status]?.main || theme.palette.text.disabled : null;

    const divider = <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", lg: "block" } }} />;

    return (
        <Box
            sx={{
                mb: theme.stat.gap,
                p: hero.padding,
                display: "flex",
                flexDirection: { xs: "column", lg: "row" },
                gap: { xs: 2.5, lg: 3.5 },
                alignItems: { lg: "center" },
                borderRadius: theme.card.radius,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.card.shadow,
            }}
        >
            {/* Left: who and how things stand */}
            <Stack direction="row" sx={{ flex: 1, minWidth: 0, gap: 2.5 }}>
                <Box sx={{ width: hero.accentWidth, flexShrink: 0, alignSelf: "stretch", borderRadius: hero.accentWidth, backgroundImage: hero.accentGradient(theme) }} />
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="overline" sx={{ display: "block", lineHeight: 1.6, letterSpacing: "0.12em", color: theme.palette.text.secondary }}>
                        Welcome back
                    </Typography>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
                        {greeting},{" "}
                        <Box component="span" sx={{ color: theme.palette.primary.main }}>
                            {name}
                        </Box>
                    </Typography>
                    <Stack direction="row" sx={{ mt: 1, gap: 1.25, alignItems: "baseline" }}>
                        {dot && (
                            <Box
                                sx={{
                                    width: hero.statusDot,
                                    height: hero.statusDot,
                                    flexShrink: 0,
                                    borderRadius: "50%",
                                    alignSelf: "center",
                                    backgroundColor: dot,
                                    boxShadow: `0 0 0 4px ${alpha(dot, theme.tint.border)}`,
                                }}
                            />
                        )}
                        <Typography variant="body1" component="div" sx={{ color: theme.palette.text.secondary, "& b": { color: theme.palette.primary.main, fontWeight: 700 } }}>
                            {subtitle}
                        </Typography>
                    </Stack>
                    <Stack
                        direction="row"
                        sx={{
                            mt: 1.75,
                            px: 1.5,
                            py: 0.75,
                            gap: 1,
                            width: "fit-content",
                            maxWidth: hero.quoteMaxWidth,
                            alignItems: "center",
                            borderRadius: theme.calendar.cell.radius,
                            borderLeft: `3px solid ${theme.palette.primary.main}`,
                            backgroundColor: alpha(theme.palette.primary.main, theme.tint.selected),
                            display: { xs: "none", sm: "flex" },
                        }}
                    >
                        <FormatQuoteRounded fontSize="small" sx={{ color: theme.palette.primary.main, transform: "scaleX(-1)" }} />
                        <Typography variant="body2" sx={{ fontStyle: "italic", fontWeight: 700, color: theme.palette.primary.dark }}>
                            {QUOTES[day % QUOTES.length]}
                        </Typography>
                    </Stack>
                </Box>
            </Stack>

            {divider}

            {/* Right: date and view, then the main action and freshness */}
            <Stack sx={{ gap: 1.5, alignItems: { xs: "stretch", sm: "flex-start" }, flexShrink: 0 }}>
                <Stack direction="row" sx={{ gap: 1.25, flexWrap: "wrap", alignItems: "center" }}>
                    <Box
                        sx={{
                            height: theme.dashboard.dateChipHeight,
                            px: 1.75,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            borderRadius: theme.calendar.cell.radius,
                            border: "1px solid",
                            borderColor: theme.palette.border.default,
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: theme.elevation.sm,
                        }}
                    >
                        <CalendarMonthRounded fontSize="small" sx={{ color: theme.palette.primary.main }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        </Typography>
                    </Box>
                    {actions}
                </Stack>

                <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                    {primary}
                    {secondary}
                    {updatedAt && (
                        <>
                            {divider}
                            <Stack direction="row" sx={{ gap: 0.75, alignItems: "center" }}>
                                <Box sx={{ width: hero.statusDot, height: hero.statusDot, borderRadius: "50%", backgroundColor: theme.palette.success.main }} />
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                    Updated {updatedAt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                                </Typography>
                                {onRefresh && (
                                    <Tooltip title="Refresh">
                                        <IconButton size="small" onClick={onRefresh} aria-label="Refresh the dashboard">
                                            <RefreshRounded fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Stack>
                        </>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
}

// =========================================================
// TODAY'S SCHEDULE
// =========================================================

const scheduleStatus = (item) => (item.Status === "VISITED" ? { label: "Completed", color: "success" } : { label: "Upcoming", color: "warning" });

export function SchedulePanel({ schedule, subtitle, actions, sx }) {
    const done = schedule.filter((item) => item.Status === "VISITED").length;

    return (
        <Panel
            title="Today's schedule"
            subtitle={subtitle || (schedule.length ? `${done} of ${schedule.length} calls done` : "Nothing planned yet")}
            actions={actions}
            sx={sx}
        >
            {schedule.length ? (
                <Box sx={(theme) => ({ maxHeight: theme.dashboard.scheduleMaxHeight, overflowY: "auto", mr: -1, pr: 1 })}>
                    {schedule.map((item, index) => {
                        const status = scheduleStatus(item);
                        const last = index === schedule.length - 1;

                        return (
                            <Stack key={`${item.DoctorName}-${index}`} direction="row" sx={{ gap: 1.5, alignItems: "stretch" }}>
                                <Typography
                                    variant="caption"
                                    sx={(theme) => ({
                                        width: theme.dashboard.scheduleTimeWidth,
                                        flexShrink: 0,
                                        pt: 0.25,
                                        color: theme.palette.text.secondary,
                                        fontVariantNumeric: "tabular-nums",
                                    })}
                                >
                                    {item.VisitTime || (item.CallOrder ? `Call ${item.CallOrder}` : "—")}
                                </Typography>

                                <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Box
                                        sx={(theme) => ({
                                            mt: 0.5,
                                            width: theme.dashboard.scheduleDotSize,
                                            height: theme.dashboard.scheduleDotSize,
                                            borderRadius: "50%",
                                            flexShrink: 0,
                                            backgroundColor: theme.palette[status.color].main,
                                            boxShadow: `0 0 0 3px ${alpha(theme.palette[status.color].main, theme.tint.border)}`,
                                        })}
                                    />
                                    {!last && <Box sx={(theme) => ({ flex: 1, width: "1px", my: 0.5, backgroundColor: theme.palette.border.default })} />}
                                </Box>

                                <Stack direction="row" sx={{ flex: 1, minWidth: 0, gap: 1, pb: last ? 0 : 2, alignItems: "flex-start" }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="subtitle2" noWrap>
                                            Dr. {item.DoctorName}
                                        </Typography>
                                        <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {[item.HospitalName, item.planned ? null : "Unplanned"].filter(Boolean).join(" · ") || "—"}
                                        </Typography>
                                    </Box>
                                    <Tag label={status.label} color={status.color} />
                                </Stack>
                            </Stack>
                        );
                    })}
                </Box>
            ) : (
                <Stack sx={{ py: 3, alignItems: "center", textAlign: "center", gap: 1.5 }}>
                    <EventNoteRounded sx={(theme) => ({ color: theme.palette.text.disabled, fontSize: theme.table.emptyIconSize })} />
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        No calls planned for today.
                    </Typography>
                    <Button size="small" variant="outlined" component={RouterLink} to="/field-operation/pre-call">
                        Plan my day
                    </Button>
                </Stack>
            )}
        </Panel>
    );
}

// =========================================================
// COVERAGE DONUT
// =========================================================

// Single-series ring: share of assigned doctors visited, with the per-category breakdown beside it.
export function CoverageDonut({ visited, mapped, rows, sx }) {
    const theme = useTheme();
    const size = theme.dashboard.donutSize;
    const stroke = theme.dashboard.donutStroke;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = mapped ? Math.round((visited / mapped) * 100) : 0;

    return (
        <Panel title="Doctor coverage" subtitle="Assigned doctors visited this month" sx={sx}>
            <Stack sx={{ alignItems: "center", gap: 2.5 }}>
                <Box sx={{ position: "relative", width: size, height: size }} role="img" aria-label={`${pct}% coverage: ${visited} of ${mapped} doctors visited`}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={theme.palette.surface.muted} strokeWidth={stroke} />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={theme.palette.chart.ours}
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        />
                    </svg>
                    <Stack sx={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
                        <Typography variant="metric">{pct}%</Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {visited} of {mapped}
                        </Typography>
                    </Stack>
                </Box>

                <Stack sx={{ width: "100%" }} divider={<Divider />}>
                    {rows.length ? (
                        rows.map((row) => (
                            <Stack key={row.category} direction="row" spacing={1} sx={{ py: 0.75, alignItems: "center" }}>
                                {row.category === "U" ? null : <CategoryBadge category={row.category} />}
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                    {CATEGORY_LABEL[row.category]}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontVariantNumeric: "tabular-nums" }}>
                                    {row.visited}/{row.mapped}
                                </Typography>
                            </Stack>
                        ))
                    ) : (
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: "center" }}>
                            No doctors assigned yet.
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </Panel>
    );
}

// =========================================================
// RECENT VISITS
// =========================================================

export function RecentVisitsPanel({ visits, sx }) {
    return (
        <Panel
            title="Recent visits"
            subtitle="Your latest doctor calls"
            actions={
                <Button size="small" endIcon={<ChevronRightRounded />} component={RouterLink} to="/field-operation/visits">
                    View all
                </Button>
            }
            sx={sx}
        >
            {visits.length ? (
                <Box
                    component="table"
                    sx={(theme) => ({
                        width: "100%",
                        borderCollapse: "collapse",
                        "& th, & td": { textAlign: "left", py: 1, px: 0.75, borderBottom: "1px solid", borderColor: theme.palette.border.subtle },
                        "& th": { ...theme.typography.caption, color: theme.palette.text.secondary, fontWeight: theme.typography.subtitle2.fontWeight },
                        "& tr:last-of-type td": { borderBottom: 0 },
                        "& th:last-of-type, & td:last-of-type": { textAlign: "right" },
                    })}
                >
                    <thead>
                        <tr>
                            <th>Doctor</th>
                            <th>When</th>
                            <th>Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visits.map((visit) => {
                            const feedback = FEEDBACK[visit.Feedback];

                            return (
                                <tr key={visit.VisitId}>
                                    <td>
                                        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0 }}>
                                            <Box
                                                sx={(theme) => ({
                                                    width: theme.avatar.sizeSmall,
                                                    height: theme.avatar.sizeSmall,
                                                    flexShrink: 0,
                                                    display: "grid",
                                                    placeItems: "center",
                                                    borderRadius: "50%",
                                                    ...theme.typography.caption,
                                                    fontWeight: theme.typography.subtitle2.fontWeight,
                                                    color: theme.palette.primary.main,
                                                    backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft),
                                                })}
                                            >
                                                {initials(visit.DoctorName)}
                                            </Box>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="subtitle2" noWrap>
                                                    Dr. {visit.DoctorName}
                                                </Typography>
                                                <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                    {visit.HospitalName || visit.AreaName || "—"}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </td>
                                    <td>
                                        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                                            {shortDate(visit.VisitDate)}
                                        </Typography>
                                        {visit.StartTime && (
                                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                {visit.StartTime}
                                            </Typography>
                                        )}
                                    </td>
                                    <td>{feedback ? <Tag label={feedback.label} color={feedback.color} /> : <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.disabled })}>—</Typography>}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Box>
            ) : (
                <Typography variant="body2" sx={(theme) => ({ py: 2, color: theme.palette.text.secondary })}>
                    No visits in the last 30 days.
                </Typography>
            )}
        </Panel>
    );
}

// =========================================================
// QUICK ACTIONS
// =========================================================

const QUICK_ACTIONS = [
    { label: "Log visit", to: "/field-operation/visits", icon: AddLocationAltRounded, color: "primary" },
    { label: "Plan my day", to: "/field-operation/pre-call", icon: EventNoteRounded, color: "info" },
    { label: "Tour plan", to: "/field-operation/tour-plan", icon: MapRounded, color: "success" },
    { label: "Today's DCR", to: "/field-operation/dcr", icon: AssignmentTurnedInRounded, color: "warning" },
    { label: "RCPA", to: "/doctor-engagement/rcpa", icon: FactCheckRounded, color: "secondary" },
    { label: "Book order", to: "/sales/orders", icon: ShoppingCartRounded, color: "error" },
    { label: "View reports", to: "/reports/mis", icon: BarChartRounded, color: "primary" },
];

const TEAM_ACTIONS = [
    { label: "Tour plans", to: "/field-operation/tour-plan", icon: MapRounded, color: "primary", countKey: "tourPlans" },
    { label: "DCR reviews", to: "/field-operation/dcr", icon: AssignmentTurnedInRounded, color: "info", countKey: "dcrs" },
    { label: "Deviations", to: "/field-operation/plan-deviation", icon: RouteRounded, color: "warning", countKey: "deviations" },
    { label: "Expense claims", to: "/expenses/claims", icon: ReceiptLongRounded, color: "success" },
    { label: "Team targets", to: "/planning/sales-plan", icon: FlagRounded, color: "secondary" },
    { label: "Team orders", to: "/sales/orders", icon: ShoppingCartRounded, color: "error" },
    { label: "View reports", to: "/reports/mis", icon: BarChartRounded, color: "primary" },
];

function QuickTile({ label, to, icon: Icon, color, count }) {
    return (
        <ButtonBase
            component={RouterLink}
            to={to}
            sx={(theme) => ({
                position: "relative",
                minHeight: theme.dashboard.quickTileMinHeight,
                p: 1.25,
                gap: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                borderRadius: theme.calendar.cell.radius,
                border: "1px solid",
                borderColor: alpha(theme.palette[color].main, theme.tint.selected),
                backgroundColor: alpha(theme.palette[color].main, theme.tint.hover),
                transition: theme.calendar.transition,
                "&:hover": {
                    borderColor: alpha(theme.palette[color].main, theme.tint.strong),
                    backgroundColor: alpha(theme.palette[color].main, theme.tint.selected),
                    transform: theme.entityCard.hoverLift,
                },
            })}
        >
            {count > 0 && (
                <Box
                    sx={(theme) => ({
                        position: "absolute",
                        top: theme.spacing(0.75),
                        right: theme.spacing(0.75),
                        minWidth: theme.spacing(2.5),
                        height: theme.spacing(2.5),
                        px: 0.5,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: theme.statusChip.radius,
                        ...theme.typography.micro,
                        fontWeight: 700,
                        color: theme.palette.error.contrastText,
                        backgroundColor: theme.palette.error.main,
                    })}
                >
                    {count}
                </Box>
            )}
            <Icon sx={(theme) => ({ fontSize: theme.stat.iconFontSize + 6, color: theme.palette[color].main })} />
            <Typography variant="caption" sx={(theme) => ({ fontWeight: theme.typography.subtitle2.fontWeight, color: theme.palette.text.primary })}>
                {label}
            </Typography>
        </ButtonBase>
    );
}

// Full-width strip at the bottom of the dashboard: shortcuts as coloured tiles.
// `approvals` (managers) shows team review shortcuts with their waiting counts.
export function QuickActions({ approvals }) {
    const theme = useTheme();
    const items = approvals ? TEAM_ACTIONS.map((a) => ({ ...a, count: a.countKey ? approvals[a.countKey] : 0 })) : QUICK_ACTIONS;

    return (
        <Box
            sx={{
                p: 2,
                display: "flex",
                flexDirection: { xs: "column", lg: "row" },
                gap: 2,
                alignItems: { lg: "stretch" },
                borderRadius: theme.card.radius,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.card.shadow,
            }}
        >
            <Box sx={{ alignSelf: { lg: "center" }, flexShrink: 0 }}>
                <Typography variant="h6" component="h2">
                    Quick actions
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {approvals ? "Reviews and team tools" : "Jump straight in"}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: `repeat(auto-fill, minmax(${theme.dashboard.quickTileWidth}px, 1fr))`, lg: `repeat(${items.length}, minmax(0, 1fr))` },
                    gap: 1.25,
                    flex: 1,
                    minWidth: 0,
                }}
            >
                {items.map((item) => (
                    <QuickTile key={item.label} {...item} />
                ))}
            </Box>
        </Box>
    );
}

// Manager review queues as a list: icon tile, name and a pending chip.
export function ApprovalsPanel({ approvals, sx }) {
    const rows = [
        { label: "Tour plans", to: "/field-operation/tour-plan", icon: MapRounded, color: "primary", count: approvals.tourPlans },
        { label: "DCRs", to: "/field-operation/dcr", icon: AssignmentTurnedInRounded, color: "info", count: approvals.dcrs },
        { label: "Plan deviations", to: "/field-operation/plan-deviation", icon: RouteRounded, color: "warning", count: approvals.deviations },
        { label: "Expense claims", to: "/expenses/claims", icon: ReceiptLongRounded, color: "success" },
        { label: "All approvals", to: "/admin/approvals", icon: FactCheckRounded, color: "secondary" },
    ];

    return (
        <Panel
            title="Approvals & requests"
            subtitle="Waiting for your review"
            actions={
                <Button size="small" endIcon={<ChevronRightRounded />} component={RouterLink} to="/admin/approvals">
                    View all
                </Button>
            }
            sx={sx}
        >
            <Stack sx={{ gap: 0.5 }}>
                {rows.map(({ label, to, icon: Icon, color, count }) => (
                    <ButtonBase
                        key={label}
                        component={RouterLink}
                        to={to}
                        sx={(theme) => ({
                            px: 1,
                            py: 1,
                            gap: 1.5,
                            display: "flex",
                            justifyContent: "flex-start",
                            borderRadius: theme.calendar.cell.radius,
                            "&:hover": { backgroundColor: alpha(theme.palette[color].main, theme.tint.hover) },
                        })}
                    >
                        <Box
                            sx={(theme) => ({
                                width: theme.avatar.sizeSmall,
                                height: theme.avatar.sizeSmall,
                                flexShrink: 0,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: theme.sidebarLayout.radius,
                                color: theme.palette[color].main,
                                backgroundColor: alpha(theme.palette[color].main, theme.tint.soft),
                            })}
                        >
                            <Icon fontSize="small" />
                        </Box>
                        <Typography variant="body2" sx={{ flex: 1, textAlign: "left", fontWeight: 600 }}>
                            {label}
                        </Typography>
                        {count != null ? <Tag label={`${count} pending`} color={count ? "warning" : "success"} /> : <ChevronRightRounded fontSize="small" sx={(theme) => ({ color: theme.palette.text.disabled })} />}
                    </ButtonBase>
                ))}
            </Stack>
        </Panel>
    );
}

// =========================================================
// TERRITORIES
// =========================================================

const TERRITORY_SEGMENTS = [
    { key: "covered", label: "Covered", color: (theme) => theme.palette.success.main },
    { key: "pending", label: "Pending", color: (theme) => theme.palette.warning.main },
    { key: "notPlanned", label: "Not planned", color: (theme) => theme.palette.chart.neutral },
];

// Ring split into covered / pending (still on the tour plan) / not planned territories.
export function TerritoryCoveragePanel({ coverage, subtitle = "Your territories this month", sx }) {
    const theme = useTheme();
    const size = theme.dashboard.donutSize;
    const stroke = theme.dashboard.donutStroke;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = coverage?.total || 0;
    const pct = total ? Math.round((coverage.covered / total) * 100) : 0;

    const filled = TERRITORY_SEGMENTS.filter((segment) => (coverage?.[segment.key] || 0) > 0);
    const gap = filled.length > 1 ? theme.dashboard.donutGap : 0;

    let offset = 0;
    const arcs = filled.map((segment) => {
        const length = (coverage[segment.key] / total) * circumference;
        const arc = { ...segment, dash: Math.max(0, length - gap), offset };
        offset += length;
        return arc;
    });

    return (
        <Panel title="Territory coverage" subtitle={subtitle} sx={sx}>
            {total ? (
                <Stack sx={{ alignItems: "center", gap: 2.5 }}>
                    <Box
                        sx={{ position: "relative", width: size, height: size }}
                        role="img"
                        aria-label={`${coverage.covered} covered, ${coverage.pending} pending, ${coverage.notPlanned} not planned of ${total} territories`}
                    >
                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={theme.palette.surface.muted} strokeWidth={stroke} />
                            {arcs.map((arc) => (
                                <circle
                                    key={arc.key}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    fill="none"
                                    stroke={arc.color(theme)}
                                    strokeWidth={stroke}
                                    strokeDasharray={`${arc.dash} ${circumference}`}
                                    strokeDashoffset={-arc.offset}
                                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                                />
                            ))}
                        </svg>
                        <Stack sx={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
                            <Typography variant="metric">{pct}%</Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                Covered
                            </Typography>
                        </Stack>
                    </Box>

                    <Stack sx={{ width: "100%" }} spacing={1}>
                        {TERRITORY_SEGMENTS.map((segment) => (
                            <Stack key={segment.key} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <Box sx={{ width: theme.calendar.legendSwatch, height: theme.calendar.legendSwatch, borderRadius: "50%", backgroundColor: segment.color(theme) }} />
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                    {segment.label}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontVariantNumeric: "tabular-nums" }}>
                                    {coverage[segment.key]}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            ) : (
                <Stack sx={{ py: 4, alignItems: "center", textAlign: "center", gap: 1 }}>
                    <MapRounded sx={(theme) => ({ fontSize: theme.table.emptyIconSize, color: theme.palette.text.disabled })} />
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        No territories yet. They come from assigned doctors.
                    </Typography>
                </Stack>
            )}
        </Panel>
    );
}

// Territories ranked by share of their doctors visited this month.
export function TopTerritoriesPanel({ coverage, sx }) {
    const rows = coverage?.top || [];

    return (
        <Panel title="Top performing territories" subtitle="By doctors visited this month" sx={sx}>
            {rows.length ? (
                <Stack spacing={1.75}>
                    {rows.map((row, index) => (
                        <Stack key={row.TerritoryId} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                            <Box
                                sx={(theme) => ({
                                    width: theme.entityCard.badgeSize,
                                    height: theme.entityCard.badgeSize,
                                    flexShrink: 0,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: "50%",
                                    ...theme.typography.caption,
                                    fontWeight: theme.typography.subtitle2.fontWeight,
                                    color: index === 0 ? theme.palette.primary.contrastText : theme.palette.primary.main,
                                    backgroundColor: index === 0 ? theme.palette.primary.main : alpha(theme.palette.primary.main, theme.tint.soft),
                                })}
                            >
                                {index + 1}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                                    <Typography variant="subtitle2" noWrap>
                                        {row.TerritoryName}
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ fontVariantNumeric: "tabular-nums" }}>
                                        {row.coverage}%
                                    </Typography>
                                </Stack>
                                <Box
                                    sx={(theme) => ({
                                        height: theme.stat.progressHeight,
                                        borderRadius: theme.stat.progressHeight,
                                        backgroundColor: theme.palette.surface.muted,
                                        overflow: "hidden",
                                    })}
                                >
                                    <Box sx={(theme) => ({ width: `${row.coverage}%`, height: "100%", borderRadius: "inherit", backgroundImage: theme.palette.brand.gradient })} />
                                </Box>
                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    {row.doctorsVisited}/{row.doctors} doctors · {row.visits} visit(s)
                                </Typography>
                            </Box>
                        </Stack>
                    ))}
                </Stack>
            ) : (
                <Stack sx={{ py: 4, alignItems: "center", textAlign: "center", gap: 1 }}>
                    <MapRounded sx={(theme) => ({ fontSize: theme.table.emptyIconSize, color: theme.palette.text.disabled })} />
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        No territory activity yet this month.
                    </Typography>
                </Stack>
            )}
        </Panel>
    );
}
