import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Typography,
} from "@mui/material";
import {
    ArrowBackRounded,
    GroupsRounded,
    PersonRounded,
    AutoAwesomeRounded,
    CheckRounded,
    ChevronLeftRounded,
    ChevronRightRounded,
    ContentCopyRounded,
    DeleteSweepRounded,
    RefreshRounded,
    ReplyRounded,
    SaveOutlined,
    SendRounded,
    WeekendRounded,
} from "@mui/icons-material";

import ActingUserSelect from "../../components/ActingUserSelect/ActingUserSelect";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import StatusChip from "../../components/StatusChip/StatusChip";
import { useTeamView } from "../../components/TeamViewSelect/TeamViewSelect";

import DayPlanDialog from "./components/DayPlanDialog";
import MonthGrid from "./components/MonthGrid";
import PlanActionDialog from "./components/PlanActionDialog";
import PlanStatusPanel from "./components/PlanStatusPanel";
import PlanSummary from "./components/PlanSummary";
import PlanHistoryPanel from "./components/PlanHistoryPanel";
import TeamPlansView from "./components/TeamPlansView";
import useTourPlan from "./useTourPlan";
import {
    PLAN_STATUS,
    addMonths,
    formatMonthLabel,
    getTeamTourPlans,
    monthStartOf,
    todayKey,
} from "./index";

const SAME_PLAN_FIELDS = ["dayType", "territory", "area", "remarks"];

// Prefill for the day dialog: the existing plan when every selected day shares it.
const sharedPlan = (plans, dates) => {
    const first = plans[dates[0]];

    if (!first) return null;

    const allSame = dates.every((date) =>
        SAME_PLAN_FIELDS.every((field) => plans[date]?.[field] === first[field])
    );

    return allSame ? first : null;
};

function TourPlan() {
    const tourPlan = useTourPlan();
    const { meta, plans, summary, month, isDirty, busy, owner } = tourPlan;

    // Which workflow is on screen: my own plan, the team list, or reviewing one member.
    const [searchParams, setSearchParams] = useSearchParams();
    const showTeamList = searchParams.get("view") === "team" && !tourPlan.viewUserId;
    const reviewing = Boolean(tourPlan.viewUserId);

    const { reports } = useTeamView(tourPlan.actingUserId);
    const isManager = reports.length > 0;
    const [awaitingReview, setAwaitingReview] = useState(0);
    const [pendingNav, setPendingNav] = useState(null);

    // Review badge for the view switch.
    useEffect(() => {
        if (!isManager) return;

        getTeamTourPlans(monthStartOf(todayKey()))
            .then((response) => setAwaitingReview(response?.summary?.awaitingReview || 0))
            .catch(() => setAwaitingReview(0));
    }, [isManager]);

    const teamMonth = /^\d{4}-\d{2}$/.test(searchParams.get("month") || "")
        ? `${searchParams.get("month")}-01`
        : monthStartOf(todayKey());

    const editable = meta.canEdit;
    const status = PLAN_STATUS[meta.status] || PLAN_STATUS.DRAFT;

    const [selection, setSelection] = useState(null); // { dates, key }
    const [action, setAction] = useState(null);
    const [pendingMonth, setPendingMonth] = useState(null);
    const [quickFillAnchor, setQuickFillAnchor] = useState(null);

    // =========================================================
    // NAVIGATION
    // =========================================================

    // Leaving the current plan with unsaved edits asks first.
    const navigate = (params) => {
        const go = () => setSearchParams(params);

        if (isDirty && !showTeamList) {
            setPendingNav(() => go);
            setAction("discard");
            return;
        }

        go();
    };

    const showMine = () => navigate({});
    const showTeam = (targetMonth = teamMonth) => navigate({ view: "team", month: targetMonth.slice(0, 7) });
    const openReview = (userId) => navigate({ userId, month: teamMonth.slice(0, 7) });

    const goToMonth = (target) => {
        if (target === month) return;

        if (isDirty) {
            setPendingMonth(target);
            setAction("discard");
            return;
        }

        tourPlan.setMonth(target);
    };

    // =========================================================
    // DAY SELECTION
    // =========================================================

    const handleSelectDates = (dates) => {
        if (dates.length === 0) return;

        if (!editable && !plans[dates[0]]) return;

        setSelection({ dates, key: `${dates.join("|")}-${Date.now()}` });
    };

    const closeSelection = () => setSelection(null);

    // =========================================================
    // CONFIRMED ACTIONS
    // =========================================================

    const handleConfirm = async (remarks) => {
        let done = true;

        switch (action) {
            case "submit":
                done = await tourPlan.submit();
                break;
            case "approve":
                done = await tourPlan.approve(remarks);
                if (done) showTeam();
                break;
            case "reject":
                done = await tourPlan.reject(remarks);
                if (done) showTeam();
                break;
            case "clearMonth":
                tourPlan.clearMonth();
                break;
            case "discard":
                if (pendingNav) {
                    pendingNav();
                    setPendingNav(null);
                } else {
                    tourPlan.setMonth(pendingMonth);
                    setPendingMonth(null);
                }
                break;
            default:
                break;
        }

        if (done) {
            setAction(null);
        }
    };

    const runQuickFill = (handler) => () => {
        setQuickFillAnchor(null);
        handler();
    };

    // =========================================================
    // HEADER
    // =========================================================

    const viewingOther = Boolean(tourPlan.viewUserId);

    const noApprover = owner?.isSelf && !owner?.ManagerId;

    const viewSwitch = isManager && !reviewing && (
        <SegmentedControl
            value={showTeamList ? "team" : "mine"}
            onChange={(next) => (next === "team" ? showTeam() : showMine())}
            options={[
                { value: "mine", label: "My tour plan", icon: PersonRounded },
                {
                    value: "team",
                    label: awaitingReview ? `Team reviews · ${awaitingReview}` : "Team reviews",
                    icon: GroupsRounded,
                },
            ]}
        />
    );

    const headerActions = (
        <>
            <ActingUserSelect
                users={tourPlan.users}
                value={tourPlan.actingUserId}
                onChange={tourPlan.setActingUserId}
            />

            {reviewing && (
                <Button variant="outlined" startIcon={<ArrowBackRounded />} onClick={() => showTeam()}>
                    Team reviews
                </Button>
            )}

            {editable && (
                <>
                    <Button
                        variant="outlined"
                        startIcon={<SaveOutlined />}
                        disabled={busy || !isDirty}
                        onClick={tourPlan.saveDraft}
                    >
                        Save draft
                    </Button>

                    {/* Appears once every day of the month is planned. */}
                    {summary.isComplete && (
                        <Button
                            variant="contained"
                            startIcon={<SendRounded />}
                            disabled={busy || noApprover}
                            title={noApprover ? "No reporting manager is assigned" : undefined}
                            onClick={() => setAction("submit")}
                        >
                            {meta.status === "REJECTED" ? "Resend for approval" : "Send for approval"}
                        </Button>
                    )}
                </>
            )}

            {meta.canApprove && (
                <>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<ReplyRounded />}
                        disabled={busy}
                        onClick={() => setAction("reject")}
                    >
                        Return
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckRounded />}
                        disabled={busy}
                        onClick={() => setAction("approve")}
                    >
                        Approve
                    </Button>
                </>
            )}
        </>
    );

    // =========================================================
    // CALENDAR TOOLBAR
    // =========================================================

    const isCurrentMonth = month === monthStartOf(todayKey());

    const calendarToolbar = (
        <Stack
            direction="row"
            sx={{
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1.5,
            }}
        >
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                <IconButton
                    aria-label="Previous month"
                    onClick={() => goToMonth(addMonths(month, -1))}
                >
                    <ChevronLeftRounded />
                </IconButton>

                <Typography variant="h5" component="h2" sx={(theme) => ({ minWidth: theme.spacing(20), textAlign: "center" })}>
                    {formatMonthLabel(month)}
                </Typography>

                <IconButton
                    aria-label="Next month"
                    onClick={() => goToMonth(addMonths(month, 1))}
                >
                    <ChevronRightRounded />
                </IconButton>

                {!isCurrentMonth && (
                    <Button size="small" onClick={() => goToMonth(monthStartOf(todayKey()))}>
                        Today
                    </Button>
                )}
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                {isDirty && (
                    <Typography
                        variant="caption"
                        sx={(theme) => ({
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            color: theme.palette.warning.dark,
                            fontWeight: theme.typography.subtitle2.fontWeight,

                            "&::before": {
                                content: '""',
                                width: theme.statusChip.dotSize,
                                height: theme.statusChip.dotSize,
                                borderRadius: "50%",
                                backgroundColor: theme.palette.warning.main,
                            },
                        })}
                    >
                        Unsaved changes
                    </Typography>
                )}

                {editable && (
                    <Button
                        variant="outlined"
                        startIcon={<AutoAwesomeRounded />}
                        disabled={busy}
                        onClick={(event) => setQuickFillAnchor(event.currentTarget)}
                    >
                        Quick fill
                    </Button>
                )}
            </Stack>
        </Stack>
    );

    // =========================================================
    // RENDER
    // =========================================================

    const selectedPlan = selection ? sharedPlan(plans, selection.dates) : null;

    return (
        <Box>
            {viewSwitch && <Stack direction="row" sx={{ justifyContent: "flex-end", mb: 2 }}>{viewSwitch}</Stack>}

            <PageHeader
                eyebrow={showTeamList || viewingOther ? "Team reviews · Tour plan" : "Field operations · Tour plan"}
                title={
                    showTeamList
                        ? "Team tour plans"
                        : viewingOther && tourPlan.ownerName
                          ? `${tourPlan.ownerName}'s tour plan`
                          : "My tour plan"
                }
                status={
                    tourPlan.actingUserId && !showTeamList && (
                        <StatusChip label={status.label} color={status.color} />
                    )
                }
                subtitle={
                    showTeamList
                        ? "Plans sent by the people who report to you. Open one to approve it or return it with a reason."
                        : viewingOther
                          ? `${owner?.DesignationName ? `${owner.DesignationName} · ` : ""}Read-only. Approve the month or return it with what to change.`
                          : owner?.ManagerName
                            ? `Plan each day, then send the month to ${owner.ManagerName} for approval.`
                            : "Plan where you will work each day, then send the month to your manager for approval."
                }
                actions={showTeamList ? (
                    <ActingUserSelect users={tourPlan.users} value={tourPlan.actingUserId} onChange={tourPlan.setActingUserId} />
                ) : headerActions}
            />

            {!tourPlan.actingUserId ? (
                <Panel>
                    <Box sx={{ py: 6, textAlign: "center" }}>
                        <Typography variant="h5" component="p">
                            Choose a user to continue
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={(theme) => ({ mt: 1, color: theme.palette.text.secondary })}
                        >
                            Sign-in is not connected yet. Pick who you are acting as from the
                            header to load their tour plan.
                        </Typography>
                    </Box>
                </Panel>
            ) : showTeamList ? (
                <TeamPlansView
                    month={teamMonth}
                    onMonthChange={(next) => showTeam(next)}
                    onOpen={openReview}
                    onSummary={(teamSummary) =>
                        teamMonth === monthStartOf(todayKey()) && setAwaitingReview(teamSummary.awaitingReview)
                    }
                />
            ) : (
                <>
                    {noApprover && editable && (
                        <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
                            No reporting manager is assigned to you, so this plan can be saved as a draft but not sent
                            for approval. Ask your administrator to set your manager in Users.
                        </Alert>
                    )}

                    <PlanSummary summary={summary} />

                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "minmax(0, 1fr)",
                                lg: `minmax(0, 1fr) ${theme.spacing(40)}`,
                            },
                            gap: theme.stat.gap,
                            alignItems: "start",
                        })}
                    >
                        <Stack spacing={2} sx={{ minWidth: 0 }}>
                            {meta.status === "REJECTED" && meta.reviewRemarks && (
                                <Alert severity="error" variant="outlined">
                                    <AlertTitle>
                                        Returned for changes
                                        {meta.reviewedByName ? ` by ${meta.reviewedByName}` : ""}
                                    </AlertTitle>
                                    {meta.reviewRemarks}
                                </Alert>
                            )}

                            <Panel actions={calendarToolbar}>
                                {tourPlan.loadError ? (
                                    <Alert
                                        severity="error"
                                        variant="outlined"
                                        action={
                                            <Button
                                                color="error"
                                                size="small"
                                                startIcon={<RefreshRounded />}
                                                onClick={tourPlan.reload}
                                            >
                                                Retry
                                            </Button>
                                        }
                                    >
                                        <AlertTitle>Couldn't load the tour plan</AlertTitle>
                                        {tourPlan.loadError}
                                    </Alert>
                                ) : (
                                    <MonthGrid
                                        month={month}
                                        monthDays={tourPlan.monthDays}
                                        plans={plans}
                                        editable={editable && !busy}
                                        loading={tourPlan.loading}
                                        onSelectDates={handleSelectDates}
                                    />
                                )}
                            </Panel>
                        </Stack>

                        <Stack spacing={2}>
                            <PlanStatusPanel meta={meta} editable={editable} />
                            {!viewingOther && (
                                <PlanHistoryPanel
                                    history={tourPlan.history}
                                    currentMonth={month}
                                    onSelect={goToMonth}
                                />
                            )}
                        </Stack>
                    </Box>
                </>
            )}

            {/* QUICK FILL MENU */}

            <Menu
                anchorEl={quickFillAnchor}
                open={Boolean(quickFillAnchor)}
                onClose={() => setQuickFillAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MenuItem onClick={runQuickFill(() => tourPlan.markWeekdaysOff([6], "Sundays"))}>
                    <ListItemIcon>
                        <WeekendRounded fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Mark Sundays as off" />
                </MenuItem>

                <MenuItem
                    onClick={runQuickFill(() =>
                        tourPlan.markWeekdaysOff([5, 6], "weekend days")
                    )}
                >
                    <ListItemIcon>
                        <WeekendRounded fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Mark weekends as off" />
                </MenuItem>

                <MenuItem onClick={runQuickFill(tourPlan.copyPreviousMonth)}>
                    <ListItemIcon>
                        <ContentCopyRounded fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Copy last month"
                        secondary="Matches weekdays, fills empty days only"
                    />
                </MenuItem>

                <Divider />

                <MenuItem onClick={runQuickFill(() => setAction("clearMonth"))}>
                    <ListItemIcon>
                        <DeleteSweepRounded fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Clear month"
                        slotProps={{ primary: { color: "error" } }}
                    />
                </MenuItem>
            </Menu>

            {/* DIALOGS */}

            {selection && (
                <DayPlanDialog
                    key={selection.key}
                    open
                    dates={selection.dates}
                    initialPlan={selectedPlan}
                    hasExistingPlan={selection.dates.some((date) => plans[date])}
                    territories={tourPlan.territories}
                    readOnly={!editable}
                    onClose={closeSelection}
                    onApply={(plan) => {
                        tourPlan.applyToDays(selection.dates, plan);
                        closeSelection();
                    }}
                    onClear={() => {
                        tourPlan.clearDays(selection.dates);
                        closeSelection();
                    }}
                />
            )}

            {action && (
                <PlanActionDialog
                    key={action}
                    action={action}
                    busy={busy}
                    onClose={() => {
                        setAction(null);
                        setPendingMonth(null);
                        setPendingNav(null);
                    }}
                    onConfirm={handleConfirm}
                />
            )}
        </Box>
    );
}

// Remount when switching between my plan, the team list and a member's plan,
// so each workflow starts from its own data (and its own month from the URL).
function TourPlanPage() {
    const [searchParams] = useSearchParams();
    return <TourPlan key={searchParams.get("userId") || searchParams.get("view") || "mine"} />;
}

export default TourPlanPage;
