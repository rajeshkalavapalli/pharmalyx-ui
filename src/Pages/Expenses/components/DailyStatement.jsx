import { useCallback, useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { CheckCircleRounded, HourglassTopRounded, HighlightOffRounded, WalletRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import Panel from "../../../components/Panel/Panel";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { DAY_STATUS, REVIEW_STEP, STATIONS, acceptPolicy, errorMessage, formatAmount, getStatement, sendDayReason } from "../index";

const stationLabel = (value) => STATIONS.find((s) => s.value === value)?.label || value || "—";
const dayLabel = (key) => new Date(`${key}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", weekday: "short" });

// The allowance policy: shown until the employee accepts the current version.
function PolicyBanner({ policy, onAccepted }) {
    const { showSnackbar } = useSnackbar();
    const [busy, setBusy] = useState(false);
    if (!policy || policy.accepted?.current) return null;

    const accept = async () => {
        setBusy(true);
        try {
            const response = await acceptPolicy();
            showSnackbar(response?.message || "Accepted", "success");
            onAccepted();
        } catch (err) {
            showSnackbar(errorMessage(err, "Couldn't record your acceptance"), "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Alert severity="info" variant="outlined" sx={{ mb: 2 }} action={<Button onClick={accept} disabled={busy}>{busy ? "Saving…" : "I accept"}</Button>}>
            <Typography variant="subtitle2">
                {policy.title} (version {policy.version}){policy.accepted ? " has been updated" : ""}
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {policy.points.map((point) => (
                    <li key={point}>
                        <Typography variant="body2">{point}</Typography>
                    </li>
                ))}
            </Box>
        </Alert>
    );
}

// The employee's own TA / DA, day by day: amounts, status, the reason for any hold, and running totals.
function DailyStatement({ month }) {
    const { showSnackbar } = useSnackbar();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [explaining, setExplaining] = useState(null);
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setError("");
        try {
            setData(await getStatement(month));
        } catch (err) {
            setError(errorMessage(err, "Couldn't load your daily statement"));
        }
    }, [month]);

    useEffect(() => {
        load();
    }, [load]);

    const send = async () => {
        setBusy(true);
        try {
            const response = await sendDayReason(explaining.review.ReviewId, reason.trim());
            showSnackbar(response?.message || "Sent", "success");
            setExplaining(null);
            setReason("");
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Couldn't send your reason"), "error");
        } finally {
            setBusy(false);
        }
    };

    if (error) return <LoadError title="Couldn't load the statement" message={error} onRetry={load} />;
    if (!data) return null;

    const t = data.totals;

    return (
        <Box>
            <PolicyBanner policy={data.policy} onAccepted={load} />

            <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                <StatCard icon={CheckCircleRounded} label="Earned so far" value={formatAmount(t.earned)} caption="Days that count this month" color="success" />
                <StatCard icon={HourglassTopRounded} label="On hold" value={formatAmount(t.onHold)} caption="Waiting for review" color="warning" />
                <StatCard icon={WalletRounded} label="If approved" value={formatAmount(t.ifApproved)} caption="Earned + on hold" color="primary" />
                <StatCard icon={HighlightOffRounded} label="Not payable" value={formatAmount(t.notPayable)} caption="Decided after review" color="error" />
            </Box>

            <Panel title="Daily TA / DA" subtitle={`DA needs ${data.daMinValidVisits} counted visits a day. A day on hold is not cut: you see why, and you can send your reason.`} disablePadding>
                {data.rows.length ? (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Visits</TableCell>
                                    <TableCell align="right">KM</TableCell>
                                    <TableCell>Station</TableCell>
                                    <TableCell align="right">DA</TableCell>
                                    <TableCell align="right">TA</TableCell>
                                    <TableCell align="right">Day total</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Earned so far</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.rows.map((row) => {
                                    const status = DAY_STATUS[row.status];
                                    const review = row.review;
                                    return (
                                        <TableRow key={row.date}>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>{dayLabel(row.date)}</TableCell>
                                            <TableCell align="right">{row.visits}</TableCell>
                                            <TableCell align="right">{row.km}</TableCell>
                                            <TableCell>{stationLabel(row.station)}</TableCell>
                                            <TableCell align="right">{formatAmount(row.da)}</TableCell>
                                            <TableCell align="right">{formatAmount(row.ta)}</TableCell>
                                            <TableCell align="right">
                                                <Typography variant="subtitle2">{formatAmount(row.total)}</Typography>
                                            </TableCell>
                                            <TableCell sx={(theme) => ({ minWidth: theme.spacing(36) })}>
                                                <Stack spacing={0.5} sx={{ alignItems: "flex-start" }}>
                                                    <Tag label={status.label} color={status.color} />
                                                    {review && (
                                                        <>
                                                            {review.Findings.map((finding) => (
                                                                <Typography key={finding.code} variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                    {finding.text}
                                                                </Typography>
                                                            ))}
                                                            <Typography variant="caption" sx={{ fontWeight: "fontWeightSemibold" }}>
                                                                {REVIEW_STEP[review.Status]}
                                                            </Typography>
                                                            {review.EmployeeReason && <Typography variant="caption">Your reason: "{review.EmployeeReason}"</Typography>}
                                                            {review.ManagerComment && (
                                                                <Typography variant="caption">
                                                                    {review.ManagerName || "Manager"}: "{review.ManagerComment}"
                                                                </Typography>
                                                            )}
                                                            {review.DaGranted && <Tag label="DA granted by head office" color="success" />}
                                                            {review.AdminComment && <Typography variant="caption">Head office: "{review.AdminComment}"</Typography>}
                                                            {review.AutoNote && (
                                                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                    {review.AutoNote}
                                                                </Typography>
                                                            )}
                                                            {row.canSendReason && (
                                                                <Button size="small" variant="outlined" onClick={() => setExplaining(row)}>
                                                                    Send reason to manager
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right">{formatAmount(row.earnedSoFar)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <EmptyState icon={WalletRounded} title="No work days yet this month" message="Days with counted visits appear here with their DA and TA." />
                )}
            </Panel>

            <Dialog open={Boolean(explaining)} onClose={busy ? undefined : () => setExplaining(null)} fullWidth maxWidth="sm">
                <DialogTitle>Your reason for {explaining ? dayLabel(explaining.date) : ""}</DialogTitle>
                <DialogContent>
                    {explaining?.review?.Findings.map((finding) => (
                        <Alert key={finding.code} severity="warning" variant="outlined" sx={{ mb: 1.5 }}>
                            {finding.text}
                        </Alert>
                    ))}
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        minRows={3}
                        label="What happened that day?"
                        value={reason}
                        onChange={(event) => setReason(event.target.value.slice(0, 500))}
                        helperText={`${reason.trim().length < 10 ? "At least 10 characters. " : ""}Your manager reviews it. If your manager approves, head office makes the final decision.`}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExplaining(null)} disabled={busy}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={send} disabled={busy || reason.trim().length < 10}>
                        {busy ? "Sending…" : "Send to manager"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default DailyStatement;
