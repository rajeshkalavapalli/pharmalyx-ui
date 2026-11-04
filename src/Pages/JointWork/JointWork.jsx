import { useCallback, useEffect, useState } from "react";

import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Rating,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { GroupsRounded, HourglassTopRounded, RateReviewRounded, SendRounded } from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import LoadError from "../../components/LoadError/LoadError";
import MonthSwitcher from "../../components/MonthSwitcher/MonthSwitcher";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import StatCard from "../../components/StatCard/StatCard";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { errorMessage, formatDate, monthKey, todayKey } from "../Engagement/index";
import { STATUS, answerJointWork, askJointWork, cancelJointWork, getJointWork, getPeople, saveJointFeedback } from "./index";

const person = (name, designation) => [name, designation].filter(Boolean).join(" · ");

// Joint work: ask managers / colleagues to work a day together; answer requests; give coaching feedback.
function JointWork() {
    const { showSnackbar } = useSnackbar();
    const [month, setMonth] = useState(monthKey());
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [colleagues, setColleagues] = useState([]);
    const [workDate, setWorkDate] = useState(todayKey());
    const [chosen, setChosen] = useState([]);
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState(null); // { row, rating, notes }

    const load = useCallback(async () => {
        setError("");
        try {
            setData(await getJointWork(month));
        } catch (err) {
            setError(errorMessage(err, "Unable to load joint work"));
        }
    }, [month]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        getPeople()
            .then((people) => setColleagues(people?.colleagues || []))
            .catch(() => setColleagues([]));
    }, []);

    const act = async (work, after) => {
        setBusy(true);
        try {
            const result = await work();
            showSnackbar(result?.message || "Done", "success");
            after?.();
            await load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Joint work action failed"), "error");
        } finally {
            setBusy(false);
        }
    };

    const s = data?.summary;

    return (
        <Box>
            <PageHeader
                eyebrow="Field operation"
                title="Joint Work"
                subtitle="Work a day with your manager or team. Colleagues confirm the day, visits are marked as joint calls, and the senior colleague gives coaching feedback."
                actions={<MonthSwitcher month={month} onChange={setMonth} />}
            />

            <Panel title="Ask for joint work" sx={(theme) => ({ mb: theme.pageHeader.marginBottom })}>
                <Stack direction={{ xs: "column", md: "row" }} sx={{ gap: 2, alignItems: { md: "center" } }}>
                    <TextField type="date" label="Date" size="small" value={workDate} onChange={(e) => setWorkDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                    <Autocomplete
                        multiple
                        size="small"
                        options={colleagues}
                        value={colleagues.filter((c) => chosen.includes(c.id))}
                        onChange={(_, value) => setChosen(value.slice(0, 5).map((c) => c.id))}
                        getOptionLabel={(c) => person(c.name, c.designation)}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => <TextField {...params} label="Colleagues" placeholder="Manager, team or territory colleagues" />}
                        sx={{ flex: 1, minWidth: 260 }}
                    />
                    <Button variant="contained" startIcon={<SendRounded />} disabled={busy || !chosen.length || !workDate} onClick={() => act(() => askJointWork(workDate, chosen), () => setChosen([]))}>
                        Send request
                    </Button>
                </Stack>
            </Panel>

            {error ? (
                <LoadError title="Couldn't load joint work" message={error} onRetry={load} />
            ) : (
                <>
                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                            gap: theme.stat.gap,
                            mb: theme.pageHeader.marginBottom,
                        })}
                    >
                        <StatCard icon={GroupsRounded} label="Days with my team" value={s?.jointDays ?? "—"} caption="Confirmed field days this month" color="primary" />
                        <StatCard icon={GroupsRounded} label="Joint calls" value={s?.jointCalls ?? "—"} caption="Visits made together" color="info" />
                        <StatCard icon={HourglassTopRounded} label="Waiting for me" value={s?.pending ?? "—"} caption="Requests to confirm" color="warning" />
                        <StatCard icon={RateReviewRounded} label="Feedback due" value={s?.feedbackDue ?? "—"} caption="Coaching notes to write" color="success" />
                    </Box>

                    <Panel title="Asked to join" subtitle="Confirm the day, then give coaching feedback" disablePadding sx={(theme) => ({ mb: theme.pageHeader.marginBottom })}>
                        {data?.withMe?.length ? (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Colleague</TableCell>
                                        <TableCell align="right">Joint calls</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Feedback</TableCell>
                                        <TableCell align="right" />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.withMe.map((row) => (
                                        <TableRow key={row.JointWorkId} hover>
                                            <TableCell>{formatDate(row.WorkDate)}</TableCell>
                                            <TableCell>{person(row.UserName, row.UserDesignation)}</TableCell>
                                            <TableCell align="right">{row.JointCalls}</TableCell>
                                            <TableCell>
                                                <Tag label={STATUS[row.Status]?.label || row.Status} color={STATUS[row.Status]?.color || "secondary"} />
                                            </TableCell>
                                            <TableCell>{row.Rating ? <Rating value={row.Rating} readOnly size="small" /> : "—"}</TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                                                    {row.Status === "PENDING" && row.canRespond && (
                                                        <>
                                                            <Button size="small" disabled={busy} onClick={() => act(() => answerJointWork(row.JointWorkId, false))}>
                                                                Decline
                                                            </Button>
                                                            <Button size="small" variant="contained" disabled={busy} onClick={() => act(() => answerJointWork(row.JointWorkId, true))}>
                                                                Confirm
                                                            </Button>
                                                        </>
                                                    )}
                                                    {row.canGiveFeedback && (
                                                        <Button size="small" variant="outlined" disabled={busy} onClick={() => setFeedback({ row, rating: row.Rating || 4, notes: row.CoachingNotes || "" })}>
                                                            {row.FeedbackOn ? "Edit feedback" : "Give feedback"}
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState icon={GroupsRounded} title={data ? "No requests this month" : "Loading…"} message="" />
                        )}
                    </Panel>

                    <Panel title="My joint work" subtitle="Days I asked colleagues to join, with their coaching feedback" disablePadding>
                        {data?.asked?.length ? (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Colleague</TableCell>
                                        <TableCell align="right">Joint calls</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Coaching</TableCell>
                                        <TableCell align="right" />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.asked.map((row) => (
                                        <TableRow key={row.JointWorkId} hover>
                                            <TableCell>{formatDate(row.WorkDate)}</TableCell>
                                            <TableCell>{person(row.ColleagueName, row.ColleagueDesignation)}</TableCell>
                                            <TableCell align="right">{row.JointCalls}</TableCell>
                                            <TableCell>
                                                <Tag label={STATUS[row.Status]?.label || row.Status} color={STATUS[row.Status]?.color || "secondary"} />
                                            </TableCell>
                                            <TableCell>
                                                {row.Rating ? (
                                                    <Stack spacing={0.5}>
                                                        <Rating value={row.Rating} readOnly size="small" />
                                                        {row.CoachingNotes && (
                                                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                “{row.CoachingNotes}”
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                ) : (
                                                    "—"
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                {row.canCancel && (
                                                    <Button size="small" disabled={busy} onClick={() => act(() => cancelJointWork(row.JointWorkId))}>
                                                        Cancel
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState icon={GroupsRounded} title={data ? "No joint work asked this month" : "Loading…"} message={data ? "Ask your manager above to plan a day together." : ""} />
                        )}
                    </Panel>
                </>
            )}

            <Dialog open={Boolean(feedback)} onClose={() => !busy && setFeedback(null)} fullWidth maxWidth="sm">
                <DialogTitle>Coaching for {feedback?.row.UserName}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary, mb: 2 })}>
                        {feedback && `${formatDate(feedback.row.WorkDate)} · ${feedback.row.JointCalls} joint calls. They will see this feedback.`}
                    </Typography>
                    <Typography variant="subtitle2">Overall rating</Typography>
                    <Rating value={feedback?.rating || 0} onChange={(_, value) => setFeedback((f) => ({ ...f, rating: value || 1 }))} sx={{ mb: 2 }} />
                    <TextField
                        label="Coaching notes"
                        placeholder="Detailing, product knowledge, doctor rapport, what to improve"
                        multiline
                        minRows={3}
                        fullWidth
                        value={feedback?.notes || ""}
                        onChange={(e) => setFeedback((f) => ({ ...f, notes: e.target.value.slice(0, 1000) }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFeedback(null)} disabled={busy}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={busy}
                        onClick={() => act(() => saveJointFeedback(feedback.row.JointWorkId, feedback.rating, feedback.notes), () => setFeedback(null))}
                    >
                        Save feedback
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default JointWork;
