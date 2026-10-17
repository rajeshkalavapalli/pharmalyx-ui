import { useCallback, useEffect, useState } from "react";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    MenuItem,
    Rating,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { AddRounded, CloseRounded, EmojiEventsRounded, LockRounded, RateReviewRounded, StarRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import StatusChip from "../../../components/StatusChip/StatusChip";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import ReportTable from "../../Reports/components/ReportTable";
import { APPRAISAL_STATUS, closeCycle, createCycle, errorMessage, formatDate, getAppraisal, getCycle, getCycles, getMyPermissions, saveManagerReview, saveSelfReview } from "../index";

const pct = (value) => (value == null ? "—" : `${value}%`);

function RatingField({ value, onChange, readOnly }) {
    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Rating precision={0.5} value={value} onChange={(event, next) => onChange?.(next)} readOnly={readOnly} emptyIcon={<StarRounded fontSize="inherit" />} />
            <Typography variant="subtitle2">{value ? `${value} / 5` : "Not rated"}</Typography>
        </Stack>
    );
}

// One person's appraisal: KPI scorecard, self-review and manager review.
function AppraisalDialog({ cycleId, userId, onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [rating, setRating] = useState(null);
    const [comments, setComments] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getAppraisal(cycleId, userId)
            .then((response) => {
                setData(response);
                const own = response.canSelfReview;
                setRating(own ? response.appraisal?.SelfRating : response.appraisal?.ManagerRating);
                setComments((own ? response.appraisal?.SelfComments : response.appraisal?.ManagerComments) || "");
            })
            .catch((err) => setError(errorMessage(err, "Couldn't load the appraisal")));
    }, [cycleId, userId]);

    const editing = data?.canSelfReview || data?.canManagerReview;

    const submit = async () => {
        setSaving(true);

        try {
            const payload = { Rating: rating, Comments: comments.trim() };
            const response = data.canSelfReview ? await saveSelfReview(cycleId, payload) : await saveManagerReview(cycleId, data.appraisal.UserId, payload);
            showSnackbar(response?.message || "Saved", "success");
            onSaved();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to save"), "error");
        } finally {
            setSaving(false);
        }
    };

    const a = data?.appraisal;
    const k = data?.kpi;
    const status = a ? APPRAISAL_STATUS[a.Status] : null;

    return (
        <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="md" slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2, alignItems: "flex-start" })}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        {data ? `${data.cycle.Name} · ${formatDate(data.cycle.PeriodFrom)} – ${formatDate(data.cycle.PeriodTo)}` : "Appraisal"}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {a?.UserName || "Loading…"}
                    </Typography>
                    {a?.ManagerName && (
                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            Manager: {a.ManagerName}
                        </Typography>
                    )}
                </Box>
                {status && <StatusChip label={status.label} color={status.color} />}
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                {error ? (
                    <Typography color="error">{error}</Typography>
                ) : data && (
                    <Stack spacing={2.5}>
                        {/* KPI scorecard */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                KPI scorecard {a?.Status === "COMPLETED" ? "(at completion)" : "(live)"}
                            </Typography>
                            <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                                {[
                                    ["KPI score", a?.Status === "COMPLETED" ? (a.KpiScore ?? "—") : (k?.score ?? "—")],
                                    ["Coverage", pct(k?.coveragePercent)],
                                    ["GPS", pct(k?.gpsPercent)],
                                    ["Target", pct(k?.achievement)],
                                    ["Calls", k?.calls ?? "—"],
                                    ["Calls / day", k?.callAverage ?? "—"],
                                    ["In plan", pct(k?.inPlanPercent)],
                                    ["DCR approved", pct(k?.dcrPercent)],
                                ].map(([label, value]) => (
                                    <Box key={label} sx={(theme) => ({ p: 1.25, borderRadius: theme.calendar.cell.radius, border: "1px solid", borderColor: theme.palette.border.subtle })}>
                                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {label}
                                        </Typography>
                                        <Typography variant="subtitle1">{value}</Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                Final score = {data.cycle.KpiWeight}% KPI score + {100 - data.cycle.KpiWeight}% manager rating.
                            </Typography>
                        </Box>

                        <Divider />

                        {/* Self-review */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Self-review
                            </Typography>
                            {data.canSelfReview ? (
                                <Stack spacing={1.5}>
                                    <RatingField value={rating} onChange={setRating} />
                                    <TextField multiline minRows={4} label="Achievements, challenges and goals" value={comments} onChange={(event) => setComments(event.target.value.slice(0, 2000))} helperText={`${comments.length}/2000`} />
                                </Stack>
                            ) : a?.SelfSubmittedOn ? (
                                <Stack spacing={1}>
                                    <RatingField value={a.SelfRating} readOnly />
                                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                        {a.SelfComments}
                                    </Typography>
                                </Stack>
                            ) : (
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    Not submitted yet.
                                </Typography>
                            )}
                        </Box>

                        <Divider />

                        {/* Manager review */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Manager review
                            </Typography>
                            {data.canManagerReview ? (
                                <Stack spacing={1.5}>
                                    <RatingField value={rating} onChange={setRating} />
                                    <TextField multiline minRows={4} label="Feedback for the employee" value={comments} onChange={(event) => setComments(event.target.value.slice(0, 2000))} helperText={`${comments.length}/2000`} />
                                </Stack>
                            ) : a?.ManagerSubmittedOn ? (
                                <Stack spacing={1}>
                                    <RatingField value={a.ManagerRating} readOnly />
                                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                        {a.ManagerComments}
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                        <EmojiEventsRounded fontSize="small" sx={(theme) => ({ color: theme.palette.warning.main })} />
                                        <Typography variant="subtitle1">Final score {a.FinalScore} / 100</Typography>
                                    </Stack>
                                </Stack>
                            ) : (
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    {data.isManager ? "Available after the self-review, or once the period ends." : "Waiting for the manager."}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                )}
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Close
                </Button>
                {editing && (
                    <Button variant="contained" startIcon={<RateReviewRounded />} onClick={submit} disabled={saving || !rating || !comments.trim()}>
                        {data.canSelfReview ? "Submit self-review" : "Complete appraisal"}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

function CycleDialog({ onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();
    const year = new Date().getFullYear();
    const [form, setForm] = useState({ Name: `Apr–Sep ${year}`, PeriodFrom: `${year}-04-01`, PeriodTo: `${year}-09-30`, KpiWeight: "50" });
    const [saving, setSaving] = useState(false);
    const set = (patch) => setForm((current) => ({ ...current, ...patch }));

    const submit = async () => {
        setSaving(true);

        try {
            const response = await createCycle({ ...form, KpiWeight: Number(form.KpiWeight) });
            showSnackbar(response?.message || "Cycle opened", "success");
            onSaved();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to open the cycle"), "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
            <DialogTitle>New appraisal cycle</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <TextField label="Name" value={form.Name} onChange={(event) => set({ Name: event.target.value.slice(0, 80) })} />
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 2 }}>
                        <TextField type="date" label="From" value={form.PeriodFrom} onChange={(event) => set({ PeriodFrom: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                        <TextField type="date" label="To" value={form.PeriodTo} onChange={(event) => set({ PeriodTo: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                    </Box>
                    <TextField type="number" label="KPI weight %" value={form.KpiWeight} onChange={(event) => set({ KpiWeight: event.target.value })} helperText="Share of the final score from the KPI report; the rest is the manager rating." slotProps={{ htmlInput: { min: 0, max: 100 } }} />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={saving || !form.Name.trim() || !form.PeriodFrom || !form.PeriodTo}>
                    Open cycle
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function Appraisals() {
    const { showSnackbar } = useSnackbar();

    const [cycles, setCycles] = useState(null);
    const [cycleId, setCycleId] = useState("");
    const [cycle, setCycle] = useState(null);
    const [permissions, setPermissions] = useState(new Set());
    const [error, setError] = useState("");
    const [opening, setOpening] = useState(false);
    const [closing, setClosing] = useState(false);
    const [busy, setBusy] = useState(false);
    const [viewing, setViewing] = useState(null);

    const loadCycles = useCallback(async () => {
        setError("");
        try {
            const [list, perms] = await Promise.all([getCycles(), getMyPermissions()]);
            setCycles(list.cycles || []);
            setPermissions(perms);
            setCycleId((current) => current || list.cycles?.find((item) => item.Status === "OPEN")?.CycleId || list.cycles?.[0]?.CycleId || "");
        } catch (err) {
            setError(errorMessage(err, "Failed to load appraisals"));
        }
    }, []);

    const loadCycle = useCallback(async () => {
        if (!cycleId) return;
        try {
            setCycle(await getCycle(cycleId));
        } catch (err) {
            setError(errorMessage(err, "Failed to load the cycle"));
        }
    }, [cycleId]);

    useEffect(() => {
        loadCycles();
    }, [loadCycles]);

    useEffect(() => {
        loadCycle();
    }, [loadCycle]);

    const isAdmin = permissions.has("hrsettings.edit");
    const people = cycle?.people || [];
    const self = people.find((person) => person.isSelf);

    const handleClose = async () => {
        setBusy(true);
        try {
            const response = await closeCycle(cycleId);
            showSnackbar(response?.message || "Cycle closed", "success");
            setClosing(false);
            loadCycles();
            loadCycle();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to close"), "error");
        } finally {
            setBusy(false);
        }
    };

    const columns = [
        { key: "name", label: "Employee", csv: (row) => row.UserName, render: (row) => (
            <Box>
                <Typography variant="subtitle2">{row.isSelf ? `${row.UserName} (me)` : row.UserName}</Typography>
                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {[row.DesignationName, row.ManagerName ? `reports to ${row.ManagerName}` : null].filter(Boolean).join(" · ") || "—"}
                </Typography>
            </Box>
        ) },
        { key: "status", label: "Status", csv: (row) => row.Status, render: (row) => <Tag label={APPRAISAL_STATUS[row.Status].label} color={APPRAISAL_STATUS[row.Status].color} /> },
        { key: "self", label: "Self", align: "right", csv: (row) => row.SelfRating ?? "", render: (row) => (row.SelfRating == null ? "—" : `${Number(row.SelfRating)} / 5`) },
        { key: "manager", label: "Manager", align: "right", csv: (row) => row.ManagerRating ?? "", render: (row) => (row.ManagerRating == null ? "—" : `${Number(row.ManagerRating)} / 5`) },
        { key: "kpi", label: "KPI", align: "right", csv: (row) => row.KpiScore ?? "", render: (row) => row.KpiScore ?? "—" },
        { key: "final", label: "Final", align: "right", csv: (row) => row.FinalScore ?? "", render: (row) => (row.FinalScore == null ? "—" : <Tag label={`${row.FinalScore}`} color={row.FinalScore >= 80 ? "success" : row.FinalScore >= 60 ? "warning" : "error"} />) },
        { key: "open", label: "", csv: () => "", render: (row) => (
            <Button size="small" variant={row.isDirectReport && row.Status === "PENDING_MANAGER" ? "contained" : "text"} onClick={() => setViewing(row.UserId)}>
                {row.isDirectReport && row.Status === "PENDING_MANAGER" ? "Rate" : "Open"}
            </Button>
        ) },
    ];

    return (
        <Box>
            <PageHeader
                eyebrow="HR / Employee"
                title="Appraisals"
                subtitle="KPI scorecard, self-review and manager rating per cycle. The final score combines the KPI score and the manager's rating."
                actions={
                    <>
                        {cycles?.length > 0 && (
                            <TextField select size="small" label="Cycle" value={cycleId} onChange={(event) => setCycleId(event.target.value)} sx={(theme) => ({ minWidth: theme.insights.pickerWidth })}>
                                {cycles.map((item) => (
                                    <MenuItem key={item.CycleId} value={item.CycleId}>
                                        {item.Name}
                                        {item.Status === "CLOSED" ? " (closed)" : ""}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                        {isAdmin && cycle?.cycle?.Status === "OPEN" && (
                            <Button variant="outlined" startIcon={<LockRounded />} onClick={() => setClosing(true)}>
                                Close cycle
                            </Button>
                        )}
                        {isAdmin && (
                            <Button variant="contained" startIcon={<AddRounded />} onClick={() => setOpening(true)}>
                                New cycle
                            </Button>
                        )}
                    </>
                }
            />

            {error ? (
                <LoadError title="Couldn't load appraisals" message={error} onRetry={loadCycles} />
            ) : cycles && !cycles.length ? (
                <Panel>
                    <EmptyState icon={EmojiEventsRounded} title="No appraisal cycles yet" message={isAdmin ? "Open a cycle, e.g. Apr–Sep, to start appraisals." : "Your administrator hasn't opened an appraisal cycle yet."} />
                </Panel>
            ) : cycle && (
                <Stack spacing={2}>
                    {self && (
                        <Panel
                            title="My appraisal"
                            subtitle={`${cycle.cycle.Name} · ${formatDate(cycle.cycle.PeriodFrom)} – ${formatDate(cycle.cycle.PeriodTo)}${cycle.cycle.Status === "CLOSED" ? " · closed" : ""}`}
                            actions={
                                <Button variant={self.Status === "NOT_STARTED" || self.Status === "PENDING_SELF" ? "contained" : "outlined"} startIcon={<RateReviewRounded />} onClick={() => setViewing(self.UserId)}>
                                    {self.Status === "NOT_STARTED" || self.Status === "PENDING_SELF" ? "Write self-review" : "View"}
                                </Button>
                            }
                        >
                            <Stack direction="row" sx={{ gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                                <StatusChip label={APPRAISAL_STATUS[self.Status].label} color={APPRAISAL_STATUS[self.Status].color} />
                                <Typography variant="body2">Self {self.SelfRating == null ? "—" : `${Number(self.SelfRating)} / 5`}</Typography>
                                <Typography variant="body2">Manager {self.ManagerRating == null ? "—" : `${Number(self.ManagerRating)} / 5`}</Typography>
                                <Typography variant="subtitle1">Final {self.FinalScore ?? "—"}</Typography>
                            </Stack>
                        </Panel>
                    )}

                    {people.length > 1 && (
                        <Panel title="Team" subtitle={`${people.filter((row) => row.Status === "COMPLETED").length} of ${people.length} completed`} disablePadding>
                            <ReportTable columns={columns} rows={people} rowKey={(row) => row.UserId} />
                        </Panel>
                    )}
                </Stack>
            )}

            {viewing && cycleId && (
                <AppraisalDialog
                    cycleId={cycleId}
                    userId={viewing}
                    onClose={() => setViewing(null)}
                    onSaved={() => {
                        setViewing(null);
                        loadCycle();
                    }}
                />
            )}

            {opening && (
                <CycleDialog
                    onClose={() => setOpening(false)}
                    onSaved={() => {
                        setOpening(false);
                        setCycleId("");
                        loadCycles();
                    }}
                />
            )}

            {closing && (
                <ConfirmActionDialog
                    icon={LockRounded}
                    color="warning"
                    title="Close this cycle?"
                    message={`${cycle.cycle.Name} becomes read-only. Unfinished appraisals stay as they are.`}
                    confirmLabel="Close cycle"
                    busy={busy}
                    onClose={() => setClosing(false)}
                    onConfirm={handleClose}
                />
            )}
        </Box>
    );
}

export default Appraisals;
