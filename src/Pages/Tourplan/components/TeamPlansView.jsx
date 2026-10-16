import { useCallback, useEffect, useState } from "react";

import {
    Avatar,
    Box,
    Button,
    LinearProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    CheckCircleRounded,
    EditNoteRounded,
    GroupsRounded,
    HourglassTopRounded,
    ReplyRounded,
    VisibilityRounded,
} from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import MonthSwitcher from "../../../components/MonthSwitcher/MonthSwitcher";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../../components/StatCard/StatCard";
import StatusChip from "../../../components/StatusChip/StatusChip";
import { PLAN_STATUS, formatDateTime, getTeamTourPlans } from "../index";

const initials = (name) =>
    String(name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "?";

const FILTERS = [
    { value: "review", label: "Awaiting review" },
    { value: "all", label: "All team plans" },
];

// Manager's list of direct reports' plans for a month. Opening one shows it
// read-only in the common calendar with Approve / Return.
function TeamPlansView({ month, onMonthChange, onOpen, onSummary }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("review");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getTeamTourPlans(month);
            setData(response);
            onSummary?.(response.summary);

            // Nothing to review: show everyone instead of an empty list.
            if (!response.summary.awaitingReview) setFilter("all");
        } catch (err) {
            setData(null);
            setError(err.response?.data?.message || err.message || "Failed to load team plans");
        } finally {
            setLoading(false);
        }
        // onSummary is a setter from the parent; it doesn't need to re-trigger loads.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [month]);

    useEffect(() => {
        load();
    }, [load]);

    const s = data?.summary;
    const rows = (data?.plans || []).filter((plan) => filter === "all" || plan.Status === "SUBMITTED");

    return (
        <Box>
            <Box
                sx={(theme) => ({
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                    gap: theme.stat.gap,
                    mb: theme.pageHeader.marginBottom,
                })}
            >
                <StatCard icon={HourglassTopRounded} label="Awaiting your review" value={s?.awaitingReview ?? "—"} caption="Sent for approval" color="submitted" />
                <StatCard icon={CheckCircleRounded} label="Approved" value={s?.approved ?? "—"} caption={`of ${s?.reports ?? 0} team member(s)`} color="success" />
                <StatCard icon={ReplyRounded} label="Returned" value={s?.returned ?? "—"} caption="Waiting for changes" color="error" />
                <StatCard icon={EditNoteRounded} label="Not sent yet" value={s?.inProgress ?? "—"} caption="Draft or not started" color="secondary" />
            </Box>

            {error ? (
                <LoadError title="Couldn't load team plans" message={error} onRetry={load} />
            ) : (
                <Panel
                    disablePadding
                    actions={
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            sx={{ width: "100%", gap: 1.5, alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between" }}
                        >
                            <MonthSwitcher month={month.slice(0, 7)} onChange={(next) => onMonthChange(`${next}-01`)} allowFuture />
                            <SegmentedControl value={filter} options={FILTERS} onChange={setFilter} />
                        </Stack>
                    }
                >
                    {!data?.plans?.length ? (
                        <EmptyState
                            icon={GroupsRounded}
                            title={loading ? "Loading…" : "No team members report to you"}
                            message={loading ? "" : "Tour plans from your direct reports appear here for review."}
                        />
                    ) : rows.length === 0 ? (
                        <EmptyState icon={CheckCircleRounded} title="Nothing waiting for review" message="Switch to “All team plans” to see everyone's status." />
                    ) : (
                        <Box sx={(theme) => ({ overflowX: "auto", opacity: loading ? theme.table.loadingOpacity : 1 })}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Team member</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Days planned</TableCell>
                                        <TableCell>Sent</TableCell>
                                        <TableCell align="right" />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((plan) => {
                                        const status = PLAN_STATUS[plan.Status] || PLAN_STATUS.DRAFT;
                                        const progress = plan.TotalDays ? (plan.DaysPlanned / plan.TotalDays) * 100 : 0;

                                        return (
                                            <TableRow key={plan.UserId} hover>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                                                        <Avatar
                                                            sx={(theme) => ({
                                                                width: theme.avatar.sizeSmall,
                                                                height: theme.avatar.sizeSmall,
                                                                ...theme.typography.caption,
                                                                fontWeight: theme.typography.subtitle2.fontWeight,
                                                                color: theme.palette.primary.dark,
                                                                backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft),
                                                            })}
                                                        >
                                                            {initials(plan.Name)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2">{plan.Name}</Typography>
                                                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                {plan.DesignationName || "—"}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusChip label={status.label} color={status.color} />
                                                </TableCell>
                                                <TableCell sx={(theme) => ({ minWidth: theme.spacing(20) })}>
                                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                        {plan.DaysPlanned} / {plan.TotalDays} · {plan.WorkingDays} working
                                                    </Typography>
                                                    <LinearProgress variant="determinate" value={progress} sx={(theme) => ({ mt: 0.5, height: theme.stat.progressHeight })} />
                                                </TableCell>
                                                <TableCell sx={{ whiteSpace: "nowrap" }}>{plan.SubmittedOn ? formatDateTime(plan.SubmittedOn) : "—"}</TableCell>
                                                <TableCell align="right">
                                                    {plan.canApprove ? (
                                                        <Button size="small" variant="contained" onClick={() => onOpen(plan.UserId)}>
                                                            Review
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="small"
                                                            startIcon={<VisibilityRounded />}
                                                            disabled={!plan.TourPlanId}
                                                            onClick={() => onOpen(plan.UserId)}
                                                        >
                                                            View
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </Panel>
            )}
        </Box>
    );
}

export default TeamPlansView;
