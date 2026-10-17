import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

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
} from "@mui/icons-material";

import useActingUser from "../../components/ActingUserSelect/useActingUser";
import ActingUserSelect from "../../components/ActingUserSelect/ActingUserSelect";
import Panel from "../../components/Panel/Panel";
import StatCard from "../../components/StatCard/StatCard";
import Tag from "../../components/Tag/Tag";
import api from "../../configurations/api-config";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import { EngagementRow, MonthlyChart, WeekdayChart } from "./DashboardInsights";
import {
    CoverageDonut,
    DashboardHeader,
    QuickActions,
    RecentVisitsPanel,
    SchedulePanel,
    TerritoryCoveragePanel,
    TopTerritoriesPanel,
} from "./DashboardWidgets";
import PlannedVsCompletedChart from "./PlannedVsCompletedChart";
import { ManagerActions, TeamHighlights, TeamPerformancePanel, TeamTodayPanel } from "./TeamWidgets";

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

    const statGrid = (theme) => ({
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
        gap: theme.stat.gap,
        mb: theme.stat.gap,
    });

    const fill = { height: "100%" };

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
                <>
                    <DashboardHeader
                        title={`${greeting()}, ${firstName}`}
                        subtitle={`${teamSummary.repsActiveToday} of ${teamSummary.reps} representative${teamSummary.reps === 1 ? " is" : "s are"} in the field today${
                            pendingReviews ? ` · ${pendingReviews} item${pendingReviews === 1 ? "" : "s"} waiting for your review` : " · nothing waiting for review"
                        }.`}
                        date={today.date}
                        actions={
                            <>
                                {viewSwitch}
                                <Button variant="contained" startIcon={<AssignmentTurnedInRounded />} component={RouterLink} to="/field-operation/dcr">
                                    Review DCRs
                                </Button>
                            </>
                        }
                    />

                    <Box sx={statGrid}>
                        <StatCard
                            icon={LocationOnRounded}
                            label="Team visits today"
                            value={teamSummary.plannedToday ? `${teamSummary.visitsToday}/${teamSummary.plannedToday}` : teamSummary.visitsToday}
                            caption={
                                teamSummary.plannedToday
                                    ? `${percent(Math.min(teamSummary.visitsToday, teamSummary.plannedToday), teamSummary.plannedToday)}% of planned calls`
                                    : `${teamVisits} this month`
                            }
                            color="primary"
                            progress={teamSummary.plannedToday ? percent(Math.min(teamSummary.visitsToday, teamSummary.plannedToday), teamSummary.plannedToday) : undefined}
                        />
                        <StatCard
                            icon={GroupsRounded}
                            label="Reps in the field"
                            value={`${teamSummary.repsActiveToday}/${teamSummary.reps}`}
                            caption={`${percent(teamSummary.repsActiveToday, teamSummary.reps)}% active today`}
                            color="success"
                            progress={percent(teamSummary.repsActiveToday, teamSummary.reps)}
                        />
                        <StatCard
                            icon={MapRounded}
                            label="Territories covered"
                            value={teamTerritories.total ? `${teamTerritories.covered}/${teamTerritories.total}` : "—"}
                            caption={teamTerritories.total ? `${percent(teamTerritories.covered, teamTerritories.total)}% · ${teamTerritories.pending} pending` : "No team territories yet"}
                            color="info"
                            progress={teamTerritories.total ? percent(teamTerritories.covered, teamTerritories.total) : undefined}
                        />
                        <StatCard
                            icon={AssignmentTurnedInRounded}
                            label="Pending approvals"
                            value={pendingReviews}
                            caption={`${approvals.tourPlans} tour plan · ${approvals.dcrs} DCR · ${approvals.deviations} deviation`}
                            color={pendingReviews ? "error" : "warning"}
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
                                <PlannedVsCompletedChart data={teamSummary.trend} />
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
                            <ManagerActions approvals={approvals} sx={fill} />
                        </Box>
                    </Box>

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
                    <DashboardHeader
                        title={`${greeting()}, ${firstName}`}
                        subtitle="Here's your field performance overview for today."
                        date={today.date}
                        actions={
                            <>
                                {viewSwitch}
                                <Button variant="outlined" startIcon={<AddRounded />} component={RouterLink} to="/field-operation/visits">
                                    Log visit
                                </Button>
                                <Button variant="contained" startIcon={<EventNoteRounded />} component={RouterLink} to="/field-operation/pre-call">
                                    Plan my day
                                </Button>
                            </>
                        }
                    />

                    <Box sx={statGrid}>
                        <StatCard
                            icon={LocationOnRounded}
                            label="Today's visits"
                            value={planned ? `${today.visits}/${planned}` : today.visits}
                            caption={planned ? `${percent(Math.min(today.visits, planned), planned)}% of planned calls` : planText}
                            color="primary"
                            progress={planned ? percent(Math.min(today.visits, planned), planned) : undefined}
                        />
                        <StatCard
                            icon={TrackChangesRounded}
                            label="Doctors covered"
                            value={`${month.doctorsVisited}/${month.doctorsMapped}`}
                            caption={`${percent(month.doctorsVisited, month.doctorsMapped)}% of your doctors this month`}
                            color="success"
                            progress={percent(month.doctorsVisited, month.doctorsMapped)}
                        />
                        <StatCard
                            icon={MapRounded}
                            label="Territories covered"
                            value={territories.total ? `${territories.covered}/${territories.total}` : "—"}
                            caption={territories.total ? `${percent(territories.covered, territories.total)}% · ${territories.pending} pending` : "No territories yet"}
                            color="info"
                            progress={territories.total ? percent(territories.covered, territories.total) : undefined}
                        />
                        <StatCard
                            icon={EventRepeatRounded}
                            label="Follow-ups due"
                            value={followUps.due}
                            caption={followUps.overdue ? `${followUps.overdue} overdue` : month.dcrMissed ? `${month.dcrMissed} DCR(s) missed` : "Next 7 days"}
                            color={followUps.overdue || month.dcrMissed ? "error" : "warning"}
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
                                <PlannedVsCompletedChart data={trend} />
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
                            <QuickActions sx={fill} />
                        </Box>
                    </Box>

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

                    <Box sx={row}>
                        <Box sx={span(6)}>
                            <WeekdayChart rows={charts.visitsByWeekday} weeks={charts.weekdayWeeks} sx={fill} />
                        </Box>
                        <Box sx={span(6)}>
                            <MonthlyChart rows={charts.monthlyVisits} sx={fill} />
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
}

export default Dashboard;
