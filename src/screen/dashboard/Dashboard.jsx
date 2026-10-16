import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
    Alert,
    AlertTitle,
    Box,
    Button,
    ButtonBase,
    Divider,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AddRounded,
    GroupsRounded,
    MedicationRounded,
    PersonRounded,
    CurrencyRupeeRounded,
    AssignmentTurnedInRounded,
    ChevronRightRounded,
    EventRepeatRounded,
    LocationOnRounded,
    MapRounded,
    PlaceRounded,
    RefreshRounded,
    RouteRounded,
    TimerRounded,
    TrackChangesRounded,
} from "@mui/icons-material";

import useActingUser from "../../components/ActingUserSelect/useActingUser";
import ActingUserSelect from "../../components/ActingUserSelect/ActingUserSelect";
import Panel from "../../components/Panel/Panel";
import StatCard from "../../components/StatCard/StatCard";
import Tag from "../../components/Tag/Tag";
import api from "../../configurations/api-config";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import VisitTrendChart from "./VisitTrendChart";
import { CoverageByCategory, EngagementRow, MonthlyChart, WeekdayChart } from "./DashboardInsights";

const getDashboard = async () => {
    const userId = localStorage.getItem("userId");
    const response = await api.get("/app/dashboard", {
        headers: userId ? { "x-user-id": userId } : {},
    });
    return response.data;
};

const PLAN_STATUS = {
    DRAFT: { label: "Tour plan in draft", color: "secondary" },
    SUBMITTED: { label: "Tour plan awaiting approval", color: "submitted" },
    APPROVED: { label: "Tour plan approved", color: "success" },
    REJECTED: { label: "Tour plan returned", color: "error" },
};

const DCR_STATUS = {
    SUBMITTED: { label: "DCR sent", color: "submitted" },
    APPROVED: { label: "DCR approved", color: "success" },
    RETURNED: { label: "DCR returned", color: "error" },
};

const FEEDBACK = {
    POSITIVE: { label: "Positive", color: "success" },
    NEUTRAL: { label: "Neutral", color: "info" },
    NEGATIVE: { label: "Negative", color: "error" },
};

const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
};

const longDate = (key) =>
    new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

const shortDate = (key) =>
    new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const daysUntil = (key) =>
    Math.round((new Date(`${key}T00:00:00`) - new Date(new Date().toDateString())) / 86400000);

const dueLabel = (key) => {
    const days = daysUntil(key);
    if (days < 0) return `Overdue by ${-days}d`;
    if (days === 0) return "Due today";
    return `Due in ${days}d`;
};

const formatMinutes = (minutes) => {
    if (!minutes) return "—";
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
};

const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

// =========================================================
// HERO
// =========================================================

// Status pill readable on the dark hero (light text on a tinted fill).
function HeroPill({ label, color }) {
    return (
        <Box
            component="span"
            sx={(theme) => ({
                ...theme.typography.caption,
                fontWeight: theme.typography.subtitle2.fontWeight,
                px: 1.25,
                py: 0.5,
                borderRadius: theme.statusChip.radius,
                color: theme.palette[color].light,
                backgroundColor: alpha(theme.palette[color].main, theme.tint.border),
                border: "1px solid",
                borderColor: alpha(theme.palette[color].light, theme.tint.border),
            })}
        >
            {label}
        </Box>
    );
}

const heroSx = (theme) => ({
    position: "relative",
    overflow: "hidden",
    p: theme.dashboard.heroPadding,
    mb: theme.pageHeader.marginBottom,
    borderRadius: theme.panel.radius,
    color: theme.palette.sidebar.activeText,
    backgroundColor: theme.palette.sidebar.background,
    backgroundImage: `radial-gradient(circle at 85% -20%, ${alpha(
        theme.palette.brand.violet,
        0.55
    )} 0%, transparent 45%), radial-gradient(circle at 10% 120%, ${alpha(
        theme.palette.brand.indigo,
        0.5
    )} 0%, transparent 50%), ${theme.palette.sidebar.backgroundImage}`,
    boxShadow: theme.elevation.lg,
});

function HeroMetric({ value, label }) {
    return (
        <Box>
            <Typography variant="metric" sx={{ color: "inherit" }}>
                {value}
            </Typography>
            <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.sidebar.mutedText })}>
                {label}
            </Typography>
        </Box>
    );
}

// Manager's banner: who is in the field today and what needs review.
function TeamHero({ data }) {
    const { teamSummary: t, approvals, user, today } = data;
    const pending = approvals.tourPlans + approvals.dcrs + approvals.deviations;

    return (
        <Box sx={heroSx}>
            <Stack
                direction={{ xs: "column", md: "row" }}
                sx={{ gap: 3, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "flex-end" } }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.sidebar.active })}>
                        {longDate(today.date)} · Team view
                    </Typography>
                    <Typography variant="h2" component="h1" sx={{ color: "inherit", mt: 0.5 }}>
                        {greeting()}, {user.Name.split(" ")[0]}
                    </Typography>
                    <Typography variant="body1" sx={(theme) => ({ mt: 1, color: theme.palette.sidebar.text })}>
                        {t.repsActiveToday} of {t.reps} representative{t.reps === 1 ? " is" : "s are"} in the field today
                        {pending ? ` · ${pending} item${pending === 1 ? "" : "s"} waiting for your review` : " · nothing waiting for review"}.
                    </Typography>
                </Box>

                <Stack direction="row" sx={{ gap: 4, alignItems: "flex-end" }}>
                    <HeroMetric value={t.visitsToday} label="Team visits today" />
                    <HeroMetric value={pending} label="To review" />
                </Stack>
            </Stack>
        </Box>
    );
}

function Hero({ data }) {
    const { today, month, user } = data;
    const plan = today.plan;
    const planText =
        plan?.DayType === "non-working"
            ? "Planned as an off day"
            : plan
              ? [plan.TerritoryName, plan.AreaName].filter(Boolean).join(" · ") || "Working day"
              : "No tour plan for today";
    const planStatus = PLAN_STATUS[month.planStatus];
    const dcr = DCR_STATUS[today.dcrStatus];

    return (
        <Box sx={heroSx}>
            <Stack
                direction={{ xs: "column", md: "row" }}
                sx={{ gap: 3, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "flex-end" } }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="overline"
                        component="p"
                        sx={(theme) => ({ color: theme.palette.sidebar.active })}
                    >
                        {longDate(today.date)}
                    </Typography>
                    <Typography variant="h2" component="h1" sx={{ color: "inherit", mt: 0.5 }}>
                        {greeting()}, {user.Name.split(" ")[0]}
                    </Typography>

                    <Stack direction="row" sx={{ mt: 2, gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                        <Box
                            sx={(theme) => ({
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.75,
                                px: 1.5,
                                py: 0.75,
                                borderRadius: theme.statusChip.radius,
                                backgroundColor: theme.palette.sidebar.hover,
                                border: "1px solid",
                                borderColor: theme.palette.sidebar.border,
                            })}
                        >
                            <PlaceRounded fontSize="small" sx={(theme) => ({ color: theme.palette.sidebar.active })} />
                            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.sidebar.text })}>
                                Today: {planText}
                            </Typography>
                        </Box>
                        {planStatus && <HeroPill label={planStatus.label} color={planStatus.color} />}
                        {dcr && <HeroPill label={dcr.label} color={dcr.color} />}
                    </Stack>
                </Box>

                <Stack direction="row" sx={{ gap: 4, alignItems: "flex-end" }}>
                    <Box>
                        <Typography variant="metric" sx={{ color: "inherit" }}>
                            {today.visits}
                        </Typography>
                        <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.sidebar.mutedText })}>
                            Visits today
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddRounded />}
                            component={RouterLink}
                            to="/field-operation/visits"
                        >
                            Log visit
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/field-operation/dcr"
                            sx={(theme) => ({
                                color: theme.palette.sidebar.activeText,
                                border: "1px solid",
                                borderColor: theme.palette.sidebar.border,
                                backgroundColor: theme.palette.sidebar.hover,
                                "&:hover": { backgroundColor: theme.palette.sidebar.activeLight },
                            })}
                        >
                            Today's DCR
                        </Button>
                    </Stack>
                </Stack>
            </Stack>
        </Box>
    );
}

// =========================================================
// SIDE CARDS
// =========================================================

function ApprovalsPanel({ approvals }) {
    const items = [
        { label: "Tour plans", count: approvals.tourPlans, to: "/field-operation/tour-plan", icon: MapRounded },
        { label: "Daily call reports", count: approvals.dcrs, to: "/field-operation/dcr", icon: AssignmentTurnedInRounded },
        { label: "Plan deviations", count: approvals.deviations, to: "/field-operation/plan-deviation", icon: RouteRounded },
    ];
    const total = items.reduce((sum, item) => sum + item.count, 0);

    return (
        <Panel title="Waiting for you" subtitle={total ? `${total} item${total === 1 ? "" : "s"} to review` : "You're all caught up"}>
            <Stack spacing={1}>
                {items.map(({ label, count, to, icon: Icon }) => (
                    <ButtonBase
                        key={label}
                        component={RouterLink}
                        to={to}
                        sx={(theme) => ({
                            width: "100%",
                            justifyContent: "flex-start",
                            gap: 1.5,
                            p: 1.25,
                            borderRadius: theme.calendar.cell.radius,
                            textAlign: "left",
                            transition: theme.calendar.transition,
                            "&:hover": { backgroundColor: theme.palette.surface.muted },
                        })}
                    >
                        <Box
                            sx={(theme) => ({
                                width: theme.avatar.sizeSmall,
                                height: theme.avatar.sizeSmall,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: theme.sidebarLayout.radius,
                                color: count ? theme.palette.primary.main : theme.palette.text.disabled,
                                backgroundColor: count
                                    ? alpha(theme.palette.primary.main, theme.tint.soft)
                                    : theme.palette.surface.muted,
                            })}
                        >
                            <Icon fontSize="small" />
                        </Box>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                            {label}
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={(theme) => ({
                                fontVariantNumeric: "tabular-nums",
                                color: count ? theme.palette.text.primary : theme.palette.text.disabled,
                            })}
                        >
                            {count}
                        </Typography>
                        <ChevronRightRounded fontSize="small" sx={(theme) => ({ color: theme.palette.text.disabled })} />
                    </ButtonBase>
                ))}
            </Stack>
        </Panel>
    );
}

function QualityPanel({ month }) {
    const rows = [
        { label: "Calls with GPS check-in", value: month.gpsRate, color: "primary" },
        { label: "Calls as per tour plan", value: month.inPlanRate, color: "success" },
        {
            label: "DCRs approved",
            value: month.dcrSent ? percent(month.dcrApproved, month.dcrSent) : null,
            color: "warning",
        },
    ];

    return (
        <Panel title="Call quality" subtitle="This month">
            <Stack spacing={2}>
                {rows.map((row) => (
                    <Box key={row.label}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.75 }}>
                            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                {row.label}
                            </Typography>
                            <Typography variant="subtitle2">{row.value == null ? "—" : `${row.value}%`}</Typography>
                        </Stack>
                        <Box
                            sx={(theme) => ({
                                height: theme.stat.progressHeight,
                                borderRadius: theme.stat.progressHeight,
                                backgroundColor: theme.palette.surface.muted,
                                overflow: "hidden",
                            })}
                        >
                            <Box
                                sx={(theme) => ({
                                    width: `${row.value || 0}%`,
                                    height: "100%",
                                    borderRadius: "inherit",
                                    backgroundImage:
                                        row.color === "primary"
                                            ? theme.palette.brand.gradient
                                            : `linear-gradient(90deg, ${theme.palette[row.color].main}, ${theme.palette[row.color].light})`,
                                    transition: theme.calendar.transition,
                                })}
                            />
                        </Box>
                    </Box>
                ))}

                <Divider />

                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Distance travelled
                    </Typography>
                    <Typography variant="subtitle2">{Math.round(month.distanceKm)} km</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Plan deviations
                    </Typography>
                    <Typography variant="subtitle2">{month.deviations}</Typography>
                </Stack>
            </Stack>
        </Panel>
    );
}

function ListRow({ title, caption, trailing }) {
    return (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", py: 1.25, minWidth: 0 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {title}
                </Typography>
                <Typography
                    variant="caption"
                    component="p"
                    sx={(theme) => ({
                        color: theme.palette.text.secondary,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    })}
                >
                    {caption}
                </Typography>
            </Box>
            {trailing}
        </Stack>
    );
}

function EmptyLine({ children }) {
    return (
        <Typography variant="body2" sx={(theme) => ({ py: 2, color: theme.palette.text.secondary })}>
            {children}
        </Typography>
    );
}

function TeamPanel({ team }) {
    return (
        <Panel title="Your team" subtitle="This month, by visits">
            <Box sx={{ overflowX: "auto" }}>
                <Box
                    component="table"
                    sx={(theme) => ({
                        width: "100%",
                        borderCollapse: "collapse",
                        "& th, & td": {
                            ...theme.typography.body2,
                            textAlign: "left",
                            py: 1.25,
                            px: 1,
                            borderBottom: "1px solid",
                            borderColor: theme.palette.border.subtle,
                            whiteSpace: "nowrap",
                        },
                        "& th": { ...theme.typography.caption, color: theme.palette.text.secondary, fontWeight: 600 },
                        "& tr:last-of-type td": { borderBottom: 0 },
                    })}
                >
                    <thead>
                        <tr>
                            <th>Representative</th>
                            <th>Visits</th>
                            <th>Coverage</th>
                            <th>DCRs sent</th>
                            <th>Last visit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team.map((member) => {
                            const coverage = percent(member.doctorsVisited, member.doctorsMapped);

                            return (
                                <tr key={member.UserId}>
                                    <td>
                                        <Typography variant="subtitle2">{member.Name}</Typography>
                                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {member.DesignationName || "—"}
                                        </Typography>
                                    </td>
                                    <td>{member.visits}</td>
                                    <td>
                                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                            <Box
                                                sx={(theme) => ({
                                                    width: theme.spacing(8),
                                                    height: theme.stat.progressHeight,
                                                    borderRadius: theme.stat.progressHeight,
                                                    backgroundColor: theme.palette.surface.muted,
                                                    overflow: "hidden",
                                                })}
                                            >
                                                <Box
                                                    sx={(theme) => ({
                                                        width: `${coverage}%`,
                                                        height: "100%",
                                                        backgroundImage: theme.palette.brand.gradient,
                                                    })}
                                                />
                                            </Box>
                                            <span>
                                                {member.doctorsVisited}/{member.doctorsMapped}
                                            </span>
                                        </Stack>
                                    </td>
                                    <td>{member.dcrSent}</td>
                                    <td>{member.lastVisitDate ? shortDate(member.lastVisitDate) : "No visits yet"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Box>
            </Box>
        </Panel>
    );
}

// =========================================================
// PAGE
// =========================================================

function Dashboard() {
    const { actingUserId, setActingUserId, users } = useActingUser();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [view, setView] = useState("team");

    const load = useCallback(async () => {
        if (!actingUserId) return;

        setLoading(true);
        setError("");

        try {
            setData(await getDashboard());
        } catch (err) {
            setData(null);
            setError(err.response?.data?.message || err.message || "Failed to load the dashboard");
        } finally {
            setLoading(false);
        }
    }, [actingUserId]);

    useEffect(() => {
        load();
    }, [load]);

    if (!actingUserId) {
        return (
            <Panel>
                <Stack spacing={2} sx={{ py: 6, alignItems: "center", textAlign: "center" }}>
                    <Typography variant="h4" component="h1">
                        Welcome to Pharmalyx
                    </Typography>
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Sign in, or pick a user below while testing, to see your dashboard.
                    </Typography>
                    <ActingUserSelect users={users} value={actingUserId} onChange={setActingUserId} />
                </Stack>
            </Panel>
        );
    }

    if (error) {
        return (
            <Alert
                severity="error"
                variant="outlined"
                action={
                    <Button color="error" size="small" startIcon={<RefreshRounded />} onClick={load}>
                        Retry
                    </Button>
                }
            >
                <AlertTitle>Couldn't load the dashboard</AlertTitle>
                {error}
            </Alert>
        );
    }

    if (!data) {
        return (
            <Stack spacing={2}>
                <Skeleton variant="rounded" sx={(theme) => ({ height: theme.dashboard.skeleton.hero })} />
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2 }}>
                    {[0, 1, 2, 3].map((key) => (
                        <Skeleton key={key} variant="rounded" sx={(theme) => ({ height: theme.dashboard.skeleton.stat })} />
                    ))}
                </Box>
                <Skeleton variant="rounded" sx={(theme) => ({ height: theme.dashboard.skeleton.chart })} />
            </Stack>
        );
    }

    const { month, trend, followUps, recentVisits, approvals, team, engagement, charts, teamSummary } = data;
    const delta = month.visits - month.visitsPrevMonthToDate;
    const isManager = team.length > 0 && Boolean(teamSummary);
    const showTeam = isManager && view === "team";

    const statGrid = (theme) => ({
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
        gap: theme.stat.gap,
        mb: theme.pageHeader.marginBottom,
    });

    const mainSideGrid = (theme) => ({
        display: "grid",
        gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            lg: `minmax(0, 1fr) ${theme.spacing(theme.dashboard.sideColumnWidth)}`,
        },
        gap: theme.stat.gap,
        alignItems: "start",
        mb: theme.pageHeader.marginBottom,
    });

    const teamVisits = team.reduce((sum, member) => sum + member.visits, 0);
    const teamVisited = team.reduce((sum, member) => sum + member.doctorsVisited, 0);
    const teamMapped = team.reduce((sum, member) => sum + member.doctorsMapped, 0);
    const teamDcrs = team.reduce((sum, member) => sum + member.dcrSent, 0);

    return (
        <Box sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1, transition: theme.calendar.transition })}>
            {isManager && (
                <Stack direction="row" sx={{ justifyContent: "flex-end", mb: 2 }}>
                    <SegmentedControl
                        value={view}
                        onChange={setView}
                        options={[
                            { value: "team", label: "My team", icon: GroupsRounded },
                            { value: "me", label: "My work", icon: PersonRounded },
                        ]}
                    />
                </Stack>
            )}

            {showTeam ? (
                <>
                    <TeamHero data={data} />

                    <Box sx={statGrid}>
                        <StatCard
                            icon={LocationOnRounded}
                            label="Team visits this month"
                            value={teamVisits}
                            caption={`${teamDcrs} DCR(s) sent`}
                            color="primary"
                        />
                        <StatCard
                            icon={TrackChangesRounded}
                            label="Team coverage"
                            value={`${percent(teamVisited, teamMapped)}%`}
                            caption={`${teamVisited} of ${teamMapped} doctor assignments visited`}
                            color="success"
                            progress={percent(teamVisited, teamMapped)}
                        />
                        <StatCard
                            icon={CurrencyRupeeRounded}
                            label="Team business"
                            value={teamSummary.businessAchievement == null ? "—" : `${teamSummary.businessAchievement}%`}
                            caption={teamSummary.businessExpected ? "Actual vs expected" : "No targets set yet"}
                            color="warning"
                            progress={Math.min(100, teamSummary.businessAchievement ?? 0)}
                        />
                        <StatCard
                            icon={MedicationRounded}
                            label="Samples given"
                            value={teamSummary.samplesGiven ?? "—"}
                            caption={`${teamSummary.deviationsMonth} plan deviation(s) this month`}
                            color="info"
                        />
                    </Box>

                    <Box sx={mainSideGrid}>
                        <Panel
                            title="Team visits per day"
                            subtitle={`Last ${teamSummary.trend.length} days · ${teamSummary.trend.reduce((sum, day) => sum + day.visits, 0)} visits`}
                        >
                            <VisitTrendChart data={teamSummary.trend} />
                        </Panel>

                        <ApprovalsPanel approvals={approvals} />
                    </Box>

                    <TeamPanel team={team} />
                </>
            ) : (
                <>
                    <Hero data={data} />

                    <Box sx={statGrid}>
                        <StatCard
                            icon={LocationOnRounded}
                            label="Visits this month"
                            value={month.visits}
                            caption={
                                month.visitsPrevMonthToDate || month.visits
                                    ? `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)} vs same day last month`
                                    : "No visits yet"
                            }
                            color="primary"
                        />
                        <StatCard
                            icon={TrackChangesRounded}
                            label="Doctor coverage"
                            value={`${percent(month.doctorsVisited, month.doctorsMapped)}%`}
                            caption={`${month.doctorsVisited} of ${month.doctorsMapped} doctors visited`}
                            color="success"
                            progress={percent(month.doctorsVisited, month.doctorsMapped)}
                        />
                        <StatCard
                            icon={TimerRounded}
                            label="Average call"
                            value={formatMinutes(month.avgCallMinutes)}
                            caption="Time spent per doctor"
                            color="info"
                        />
                        <StatCard
                            icon={AssignmentTurnedInRounded}
                            label="DCRs sent"
                            value={month.dcrSent}
                            caption={
                                month.dcrMissed
                                    ? `${month.dcrMissed} missed this month`
                                    : month.dcrReturned
                                      ? `${month.dcrReturned} returned to fix`
                                      : "None missed"
                            }
                            color={month.dcrMissed || month.dcrReturned ? "error" : "warning"}
                        />
                    </Box>

                    <Box sx={mainSideGrid}>
                        <Panel
                            title="Visits per day"
                            subtitle={`Last ${trend.length} days · ${trend.reduce((sum, day) => sum + day.visits, 0)} visits`}
                            actions={
                                <Button size="small" endIcon={<ChevronRightRounded />} component={RouterLink} to="/field-operation/visits">
                                    All visits
                                </Button>
                            }
                        >
                            <VisitTrendChart data={trend} />
                        </Panel>

                        <QualityPanel month={month} />
                    </Box>

                    <Box sx={(theme) => ({ mb: theme.pageHeader.marginBottom })}>
                        <EngagementRow engagement={engagement} />
                    </Box>

                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" },
                            gap: theme.stat.gap,
                            alignItems: "start",
                            mb: theme.pageHeader.marginBottom,
                        })}
                    >
                        <CoverageByCategory rows={charts.coverageByCategory} />
                        <WeekdayChart rows={charts.visitsByWeekday} weeks={charts.weekdayWeeks} />
                        <MonthlyChart rows={charts.monthlyVisits} />
                    </Box>

                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" },
                            gap: theme.stat.gap,
                        })}
                    >
                        <Panel title="Recent visits" subtitle="Your latest doctor calls">
                            {recentVisits.length === 0 ? (
                                <EmptyLine>No visits in the last 30 days.</EmptyLine>
                            ) : (
                                <Stack divider={<Divider />}>
                                    {recentVisits.map((visit) => {
                                        const feedback = FEEDBACK[visit.Feedback];

                                        return (
                                            <ListRow
                                                key={visit.VisitId}
                                                title={visit.DoctorName}
                                                caption={`${shortDate(visit.VisitDate)}${visit.StartTime ? ` · ${visit.StartTime}` : ""} · ${
                                                    visit.HospitalName || visit.AreaName || ""
                                                }`}
                                                trailing={feedback && <Tag label={feedback.label} color={feedback.color} />}
                                            />
                                        );
                                    })}
                                </Stack>
                            )}
                        </Panel>

                        <Panel
                            title="Follow-ups"
                            subtitle={
                                followUps.due
                                    ? `${followUps.due} due this week${followUps.overdue ? `, ${followUps.overdue} overdue` : ""}`
                                    : "Nothing due this week"
                            }
                        >
                            {followUps.items.length === 0 ? (
                                <EmptyLine>No follow-ups due in the next 7 days.</EmptyLine>
                            ) : (
                                <Stack divider={<Divider />}>
                                    {followUps.items.map((item) => (
                                        <ListRow
                                            key={item.VisitId}
                                            title={item.DoctorName}
                                            caption={item.HospitalName || ""}
                                            trailing={
                                                <Tag
                                                    icon={EventRepeatRounded}
                                                    label={dueLabel(item.FollowUpDate)}
                                                    color={daysUntil(item.FollowUpDate) < 0 ? "error" : "warning"}
                                                />
                                            }
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Panel>
                    </Box>
                </>
            )}
        </Box>
    );
}

export default Dashboard;
