import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Divider,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import {
    AddRounded,
    ArrowForwardRounded,
    GroupsRounded,
    PersonRounded,
    CurrencyRupeeRounded,
    AssignmentTurnedInRounded,
    ChevronRightRounded,
    EventNoteRounded,
    EventRepeatRounded,
    LocationOnRounded,
    MedicationRounded,
    MapRounded,
    RefreshRounded,
    RouteRounded,
    TrackChangesRounded,
    VerifiedRounded,
} from "@mui/icons-material";

import useActingUser from "../../components/ActingUserSelect/useActingUser";
import ActingUserSelect from "../../components/ActingUserSelect/ActingUserSelect";
import Panel from "../../components/Panel/Panel";
import EmptyState from "../../components/EmptyState/EmptyState";
import Tag from "../../components/Tag/Tag";
import api from "../../configurations/api-config";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import { EngagementRow, MonthlyChart, WeekdayChart } from "./DashboardInsights";
import {
    ApprovalsPanel,
    CoverageDonut,
    DashboardHeader,
    QuickActions,
    RecentVisitsPanel,
    SchedulePanel,
    TerritoryCoveragePanel,
    TopTerritoriesPanel,
} from "./DashboardWidgets";
import { GroupedBars, KpiCard } from "./ModuleCharts";
import ModuleSection from "./ModuleSection";
import { chartSeries, findStat, useModuleData } from "./moduleData";
import SalesSection from "./SalesSection";
import WorkSection from "./WorkSection";
import { TeamHighlights, TeamPerformancePanel, TeamTodayPanel } from "./TeamWidgets";

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

// Dashboard areas (tab bar under the greeting).
// Same order as the sidebar; one tab per built module.
const SECTIONS = [
    { value: "field", label: "Field Operations" },
    { value: "work", label: "Verified Work" },
    { value: "engagement", label: "Doctor Engagement" },
    { value: "sales", label: "Sales & Distribution" },
    { value: "planning", label: "Planning" },
    { value: "expenses", label: "Expenses" },
    { value: "hr", label: "HR / Employee" },
    { value: "reports", label: "Reports & Analytics" },
    { value: "insights", label: "Insights" },
    { value: "admin", label: "Administration" },
];
const SECTION_KEYS = new Set(SECTIONS.map((item) => item.value));

const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
};

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

const dayLabel = (key) => new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

// Planned vs completed per day as paired bars. With nothing planned or done, a message instead of an empty grid.
function VisitTrend({ data }) {
    const theme = useTheme();
    if (!data.some((row) => row.planned || row.visits)) {
        return (
            <EmptyState
                icon={EventNoteRounded}
                title="No visits in these days yet"
                message="Planned calls and completed visits from your team will show here day by day."
            />
        );
    }
    return (
        <GroupedBars
            rows={data.map((row) => ({ key: row.date, label: dayLabel(row.date), values: [row.planned, row.visits] }))}
            series={[
                { label: "Planned", color: theme.palette.chart.competitor },
                { label: "Completed", color: theme.palette.chart.ours },
            ]}
        />
    );
}

// =========================================================
// SIDE CARDS
// =========================================================

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
        <Panel title="Call quality" subtitle="This month" sx={{ height: "100%" }}>
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
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Average call
                    </Typography>
                    <Typography variant="subtitle2">{formatMinutes(month.avgCallMinutes)}</Typography>
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

// =========================================================
// PAGE
// =========================================================

function Dashboard() {
    const { actingUserId, setActingUserId, users } = useActingUser();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadedAt, setLoadedAt] = useState(null);
    const [error, setError] = useState("");
    const [view, setView] = useState("team");
    const [section, setSection] = useState(() => {
        try {
            const saved = localStorage.getItem("dashboardSection");
            return SECTION_KEYS.has(saved) ? saved : "field";
        } catch {
            return "field";
        }
    });

    const chooseSection = (next) => {
        setSection(next);
        try {
            localStorage.setItem("dashboardSection", next);
        } catch {
            // remembering the tab is only a convenience
        }
    };

    const load = useCallback(async () => {
        if (!actingUserId) return;

        setLoading(true);
        setError("");

        try {
            setData(await getDashboard());
            setLoadedAt(new Date());
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

    // Team or own view decides which numbers the field module returns.
    const teamView = Boolean(data && data.team.length > 0 && data.teamSummary) && view === "team";
    const field = useModuleData(data ? "field" : null, teamView);

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

    const { today, month, trend, followUps, recentVisits, approvals, team, engagement, charts, teamSummary, user } = data;
    const isManager = team.length > 0 && Boolean(teamSummary);
    const showTeam = isManager && view === "team";
    const firstName = user.Name.split(" ")[0];

    const schedule = today.schedule || [];
    const territories = data.territoryCoverage || { total: 0, covered: 0, pending: 0, notPlanned: 0, top: [] };
    const planned = schedule.filter((item) => item.planned).length;
    const plan = today.plan;
    const planText =
        plan?.DayType === "non-working" ? "Off day" : plan ? [plan.TerritoryName, plan.AreaName].filter(Boolean).join(" · ") || "Working day" : "No tour plan for today";
    const planStatus = PLAN_STATUS[month.planStatus];
    const dcr = DCR_STATUS[today.dcrStatus];

    const teamVisits = team.reduce((sum, member) => sum + member.visits, 0);
    const teamVisited = team.reduce((sum, member) => sum + member.doctorsVisited, 0);
    const teamMapped = team.reduce((sum, member) => sum + member.doctorsMapped, 0);
    const teamDcrs = team.reduce((sum, member) => sum + member.dcrSent, 0);
    const pendingReviews = approvals.tourPlans + approvals.dcrs + approvals.deviations;
    const teamTerritories = teamSummary?.territoryCoverage || { total: 0, covered: 0, pending: 0, notPlanned: 0, top: [] };
    const namesById = new Map(team.map((member) => [String(member.UserId).toLowerCase(), member.Name]));
    const membersToday = (teamSummary?.membersToday || []).map((member) => ({ ...member, Name: namesById.get(String(member.UserId).toLowerCase()) || "—" }));

    // Rows of equal-height cards (grid items stretch), on a 12-column grid from lg up.
    const row = (theme) => ({
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))", lg: "repeat(12, minmax(0, 1fr))" },
        gap: theme.stat.gap,
        mb: theme.stat.gap,
    });
    const span = (lg, md = 1) => ({ gridColumn: { xs: "auto", md: `span ${md}`, lg: `span ${lg}` }, minWidth: 0 });

    const fill = { height: "100%" };

    const kpiGrid = (theme) => ({
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))", lg: "repeat(6, minmax(0, 1fr))" },
        gap: theme.stat.gap,
        mb: theme.stat.gap,
    });

    const visitsStat = findStat(field.data, "visits");
    const validStat = findStat(field.data, "valid");
    const momentum =
        visitsStat?.trend ? (
            <>
                {" "}
                Visits are <b>{Math.abs(visitsStat.trend)}% {visitsStat.trend > 0 ? "ahead of" : "behind"}</b> last month.
            </>
        ) : null;

    const viewSwitch = isManager && (
        <SegmentedControl
            value={view}
            onChange={setView}
            options={[
                { value: "team", label: "My team", icon: GroupsRounded },
                { value: "me", label: "My work", icon: PersonRounded },
            ]}
        />
    );

    return (
        <Box sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1, transition: theme.calendar.transition })}>
            {showTeam ? (
                <DashboardHeader
                    greeting={greeting()}
                    name={firstName}
                    status={teamSummary.repsActiveToday ? "success" : "warning"}
                    updatedAt={loadedAt}
                    onRefresh={load}
                    subtitle={
                        <>
                            <b>
                                {teamSummary.repsActiveToday} of {teamSummary.reps}
                            </b>{" "}
                            representative{teamSummary.reps === 1 ? " is" : "s are"} in the field today
                            {pendingReviews ? (
                                <>
                                    {" "}
                                    · <b>{pendingReviews} item{pendingReviews === 1 ? "" : "s"}</b> waiting for your review.
                                </>
                            ) : (
                                " · nothing waiting for review."
                            )}
                            {momentum}
                        </>
                    }
                    date={today.date}
                    actions={viewSwitch}
                    primary={
                        <Button variant="contained" size="large" startIcon={<AssignmentTurnedInRounded />} endIcon={<ArrowForwardRounded />} component={RouterLink} to="/field-operation/dcr">
                            Review DCRs
                        </Button>
                    }
                />
            ) : (
                <DashboardHeader
                    greeting={greeting()}
                    name={firstName}
                    status={today.visits ? "success" : "warning"}
                    updatedAt={loadedAt}
                    onRefresh={load}
                    subtitle={
                        <>
                            <b>
                                {today.visits} visit{today.visits === 1 ? "" : "s"}
                            </b>{" "}
                            today{planned ? ` of ${planned} planned` : ""} · {planText}.{momentum}
                        </>
                    }
                    date={today.date}
                    actions={viewSwitch || null}
                    primary={
                        <Button variant="contained" size="large" startIcon={<EventNoteRounded />} endIcon={<ArrowForwardRounded />} component={RouterLink} to="/field-operation/pre-call">
                            Plan my day
                        </Button>
                    }
                    secondary={
                        <Button variant="outlined" size="large" startIcon={<AddRounded />} component={RouterLink} to="/field-operation/visits">
                            Log visit
                        </Button>
                    }
                />
            )}

            {/* One area of the business at a time. */}
            <Box sx={(theme) => ({ mb: theme.stat.gap, overflowX: "auto" })}>
                <SegmentedControl value={section} onChange={chooseSection} options={SECTIONS} />
            </Box>

            {section === "field" &&
                (showTeam ? (
                    <>
                    <Box sx={kpiGrid}>
                        <KpiCard
                            icon={LocationOnRounded}
                            label="Visits this month"
                            value={visitsStat?.value ?? teamVisits}
                            caption={`${teamSummary.visitsToday} today${teamSummary.plannedToday ? ` of ${teamSummary.plannedToday} planned` : ""}`}
                            color="primary"
                            spark={visitsStat?.spark}
                            trend={visitsStat?.trend}
                        />
                        <KpiCard
                            icon={TrackChangesRounded}
                            label="Doctors covered"
                            value={teamVisited}
                            caption={`of ${teamMapped} assigned this month`}
                            color="info"
                            ring={percent(teamVisited, teamMapped)}
                        />
                        <KpiCard
                            icon={GroupsRounded}
                            label="Reps in the field"
                            value={`${teamSummary.repsActiveToday}/${teamSummary.reps}`}
                            caption="Active today"
                            color="warning"
                            progress={percent(teamSummary.repsActiveToday, teamSummary.reps)}
                        />
                        <KpiCard
                            icon={VerifiedRounded}
                            label="Valid visits"
                            value={validStat?.value ?? "—"}
                            caption={validStat?.caption || "Checked at the clinic"}
                            color="success"
                            bars={chartSeries(field.data, "valid")}
                            trend={validStat?.trend}
                        />
                        <KpiCard
                            icon={AssignmentTurnedInRounded}
                            label="Pending approvals"
                            value={pendingReviews}
                            caption={`${approvals.tourPlans} tour plan · ${approvals.dcrs} DCR · ${approvals.deviations} deviation`}
                            color={pendingReviews ? "error" : "success"}
                            bars={[approvals.tourPlans, approvals.dcrs, approvals.deviations]}
                        />
                        <KpiCard
                            icon={MapRounded}
                            label="Territories covered"
                            value={teamTerritories.total ? `${teamTerritories.covered}/${teamTerritories.total}` : "—"}
                            caption={teamTerritories.total ? `${teamTerritories.pending} pending` : "No team territories yet"}
                            color="primary"
                            ring={teamTerritories.total ? percent(teamTerritories.covered, teamTerritories.total) : undefined}
                        />
                    </Box>

                    <Box sx={row}>
                        <Box sx={span(5, 2)}>
                            <Panel
                                title="Team visit performance"
                                subtitle={`Planned vs completed · last ${teamSummary.trend.length} days`}
                                actions={
                                    <Button size="small" endIcon={<ChevronRightRounded />} component={RouterLink} to="/field-operation/visits">
                                        All visits
                                    </Button>
                                }
                                sx={fill}
                            >
                                <VisitTrend data={teamSummary.trend} />
                            </Panel>
                        </Box>
                        <Box sx={span(4)}>
                            <TeamTodayPanel members={membersToday} sx={fill} />
                        </Box>
                        <Box sx={span(3)}>
                            <TerritoryCoveragePanel coverage={teamTerritories} subtitle="Across your team this month" sx={fill} />
                        </Box>
                    </Box>

                    <Box sx={row}>
                        <Box sx={span(3)}>
                            <TopTerritoriesPanel coverage={teamTerritories} sx={fill} />
                        </Box>
                        <Box sx={span(5)}>
                            <TeamPerformancePanel team={team} sx={fill} />
                        </Box>
                        <Box sx={span(4, 2)}>
                            <ApprovalsPanel approvals={approvals} sx={fill} />
                        </Box>
                    </Box>
                    </>
                ) : (
                    <>
                    <Box sx={kpiGrid}>
                        <KpiCard
                            icon={LocationOnRounded}
                            label="Today's visits"
                            value={planned ? `${today.visits}/${planned}` : today.visits}
                            caption={planned ? "Of planned calls" : planText}
                            color="primary"
                            ring={planned ? percent(Math.min(today.visits, planned), planned) : undefined}
                        />
                        <KpiCard
                            icon={EventNoteRounded}
                            label="Visits this month"
                            value={visitsStat?.value ?? "—"}
                            caption={visitsStat?.caption || "This month"}
                            color="info"
                            spark={visitsStat?.spark}
                            trend={visitsStat?.trend}
                        />
                        <KpiCard
                            icon={VerifiedRounded}
                            label="Valid visits"
                            value={validStat?.value ?? "—"}
                            caption={validStat?.caption || "Checked at the clinic"}
                            color="success"
                            bars={chartSeries(field.data, "valid")}
                            trend={validStat?.trend}
                        />
                        <KpiCard
                            icon={TrackChangesRounded}
                            label="Doctors covered"
                            value={`${month.doctorsVisited}/${month.doctorsMapped}`}
                            caption="Your doctors this month"
                            color="warning"
                            progress={percent(month.doctorsVisited, month.doctorsMapped)}
                        />
                        <KpiCard
                            icon={MapRounded}
                            label="Territories covered"
                            value={territories.total ? `${territories.covered}/${territories.total}` : "—"}
                            caption={territories.total ? `${territories.pending} pending` : "No territories yet"}
                            color="primary"
                            ring={territories.total ? percent(territories.covered, territories.total) : undefined}
                        />
                        <KpiCard
                            icon={EventRepeatRounded}
                            label="Follow-ups due"
                            value={followUps.due}
                            caption={followUps.overdue ? `${followUps.overdue} overdue` : month.dcrMissed ? `${month.dcrMissed} DCR(s) missed` : "Next 7 days"}
                            color={followUps.overdue || month.dcrMissed ? "error" : "secondary"}
                        />
                    </Box>

                    <Box sx={row}>
                        <Box sx={span(5, 2)}>
                            <Panel
                                title="Visit performance"
                                subtitle={`Planned vs completed · last ${trend.length} days`}
                                actions={
                                    <Button size="small" endIcon={<ChevronRightRounded />} component={RouterLink} to="/field-operation/visits">
                                        All visits
                                    </Button>
                                }
                                sx={fill}
                            >
                                <VisitTrend data={trend} />
                            </Panel>
                        </Box>
                        <Box sx={span(4)}>
                            <SchedulePanel
                                schedule={schedule}
                                subtitle={[planText, planStatus?.label].filter(Boolean).join(" · ")}
                                actions={dcr && <Tag label={dcr.label} color={dcr.color} />}
                                sx={fill}
                            />
                        </Box>
                        <Box sx={span(3)}>
                            <TerritoryCoveragePanel coverage={territories} sx={fill} />
                        </Box>
                    </Box>

                    <Box sx={row}>
                        <Box sx={span(3)}>
                            <TopTerritoriesPanel coverage={territories} sx={fill} />
                        </Box>
                        <Box sx={span(5)}>
                            <RecentVisitsPanel visits={recentVisits} sx={fill} />
                        </Box>
                        <Box sx={span(4, 2)}>
                            <CoverageDonut visited={month.doctorsVisited} mapped={month.doctorsMapped} rows={charts.coverageByCategory} sx={fill} />
                        </Box>
                    </Box>
                    <Box sx={row}>
                        <Box sx={span(6)}>
                            <WeekdayChart rows={charts.visitsByWeekday} weeks={charts.weekdayWeeks} sx={fill} />
                        </Box>
                        <Box sx={span(6)}>
                            <MonthlyChart rows={charts.monthlyVisits} sx={fill} />
                        </Box>
                    </Box>
                    </>
                ))}

            {section === "engagement" &&
                (showTeam ? (
                    <>
                    <TeamHighlights
                        items={[
                            {
                                label: "Doctor coverage",
                                value: `${percent(teamVisited, teamMapped)}%`,
                                caption: `${teamVisited} of ${teamMapped} assignments visited`,
                                progress: percent(teamVisited, teamMapped),
                                icon: TrackChangesRounded,
                                color: "success",
                            },
                            {
                                label: "Business achieved",
                                value: teamSummary.businessAchievement == null ? "—" : `${teamSummary.businessAchievement}%`,
                                caption: teamSummary.businessExpected ? "Actual vs expected" : "No targets set yet",
                                progress: teamSummary.businessAchievement == null ? undefined : Math.min(100, teamSummary.businessAchievement),
                                icon: CurrencyRupeeRounded,
                                color: "warning",
                            },
                            { label: "Visits this month", value: teamVisits, caption: `${teamDcrs} DCR(s) sent`, icon: LocationOnRounded, color: "primary" },
                            { label: "Samples given", value: teamSummary.samplesGiven ?? "—", caption: "This month", icon: MedicationRounded, color: "info" },
                            { label: "Plan deviations", value: teamSummary.deviationsMonth, caption: "This month", icon: RouteRounded, color: "error" },
                        ]}
                    />
                    </>
                ) : (
                    <>
                    <Box sx={row}>
                        <Box sx={span(4)}>
                            <QualityPanel month={month} />
                        </Box>
                        <Box sx={span(4)}>
                            <CoverageDonut visited={month.doctorsVisited} mapped={month.doctorsMapped} rows={charts.coverageByCategory} sx={fill} />
                        </Box>
                        <Box sx={span(4, 2)}>
                            <Panel
                                title="Follow-ups"
                                subtitle={followUps.due ? `${followUps.due} due this week${followUps.overdue ? `, ${followUps.overdue} overdue` : ""}` : "Nothing due this week"}
                                sx={fill}
                            >
                                {followUps.items.length === 0 ? (
                                    <Stack sx={{ py: 4, alignItems: "center", textAlign: "center", gap: 1 }}>
                                        <EventRepeatRounded sx={(theme) => ({ fontSize: theme.table.emptyIconSize, color: theme.palette.text.disabled })} />
                                        <Typography variant="subtitle2">You're all caught up</Typography>
                                        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            No follow-ups due in the next 7 days.
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <Stack divider={<Divider />}>
                                        {followUps.items.map((item) => (
                                            <ListRow
                                                key={item.VisitId}
                                                title={`Dr. ${item.DoctorName}`}
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
                    </Box>

                    <Box sx={(theme) => ({ mb: theme.stat.gap })}>
                        <EngagementRow engagement={engagement} />
                    </Box>
                    </>
                ))}

            {section === "field" && <ModuleSection section="field" team={showTeam} stats={false} module={field} />}
            {section === "engagement" && <ModuleSection section="engagement" team={showTeam} stats={false} />}

            {section === "sales" && (
                <>
                    <SalesSection key={showTeam ? "team" : "me"} team={showTeam} />
                    <Box sx={(theme) => ({ mt: theme.stat.gap })}>
                        <ModuleSection section="sales" team={showTeam} stats={false} />
                    </Box>
                </>
            )}
            {["planning", "expenses", "hr", "reports", "insights", "admin"].includes(section) && <ModuleSection section={section} team={showTeam} />}
            {section === "work" && <WorkSection key={showTeam ? "team" : "me"} team={showTeam} userId={actingUserId} />}

            <Box sx={(theme) => ({ mt: section === "work" ? theme.stat.gap : 0 })}>
                <QuickActions approvals={showTeam ? approvals : null} />
            </Box>
        </Box>
    );
}

export default Dashboard;
