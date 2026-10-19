import { useState } from "react";

import { Alert, Box, Button, Checkbox, Divider, Drawer, FormControlLabel, IconButton, LinearProgress, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { AttachFileRounded, CloseRounded, DescriptionRounded, GavelRounded, PaymentsRounded, ThumbDownAltRounded, ThumbUpAltRounded } from "@mui/icons-material";

import { DetailFact, DetailSection } from "../../components/DetailSection/DetailSection";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { METHOD_LABEL, OUTCOME, STATUS, dayLabel, decide, disburse, documentUrl, errorMessage, recommend, rupees, scoreText, todayKey, uploadDocument } from "./index";

const muted = (theme) => ({ color: theme.palette.text.secondary });

function RecommendForm({ request, onDone }) {
    const { showSnackbar } = useSnackbar();
    const [choice, setChoice] = useState("RECOMMEND");
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);
    return (
        <Stack spacing={1.5}>
            <ToggleButtonGroup exclusive value={choice} onChange={(_, v) => v && setChoice(v)} size="small">
                <ToggleButton value="RECOMMEND">
                    <ThumbUpAltRounded fontSize="small" sx={{ mr: 0.75 }} /> Recommend
                </ToggleButton>
                <ToggleButton value="DO_NOT_RECOMMEND">
                    <ThumbDownAltRounded fontSize="small" sx={{ mr: 0.75 }} /> Do not recommend
                </ToggleButton>
            </ToggleButtonGroup>
            <TextField label="Your note for head office" value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} multiline minRows={2} />
            <Box>
                <Button
                    variant="contained"
                    disabled={note.trim().length < 10 || busy}
                    onClick={async () => {
                        setBusy(true);
                        try {
                            onDone((await recommend(request.RequestId, { Recommendation: choice, Note: note })).message);
                        } catch (err) {
                            showSnackbar(errorMessage(err, "Could not save"), "error");
                        } finally {
                            setBusy(false);
                        }
                    }}
                >
                    Send to head office
                </Button>
            </Box>
            <Typography variant="caption" sx={muted}>
                Managers recommend only; head office decides.
            </Typography>
        </Stack>
    );
}

function DecideForm({ request, onDone }) {
    const { showSnackbar } = useSnackbar();
    const [compliance, setCompliance] = useState(false);
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(null);
    const send = async (decision) => {
        setBusy(decision);
        try {
            onDone((await decide(request.RequestId, { Decision: decision, ComplianceConfirmed: compliance, Note: note })).message);
        } catch (err) {
            showSnackbar(errorMessage(err, "Could not save"), "error");
        } finally {
            setBusy(null);
        }
    };
    return (
        <Stack spacing={1.5}>
            <FormControlLabel
                control={<Checkbox checked={compliance} onChange={(e) => setCompliance(e.target.checked)} />}
                label="Compliance check: this activity is an allowed type, permitted under company policy and UCPMP 2024, and will be documented."
            />
            <TextField label="Note (compliance note or reason for rejecting)" value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} multiline minRows={2} />
            <Stack direction="row" sx={{ gap: 1 }}>
                <Button variant="contained" color="success" startIcon={<GavelRounded />} disabled={!compliance || note.trim().length < 10 || Boolean(busy)} onClick={() => send("APPROVED")}>
                    Approve
                </Button>
                <Button variant="outlined" color="error" disabled={note.trim().length < 10 || Boolean(busy)} onClick={() => send("REJECTED")}>
                    Reject
                </Button>
            </Stack>
        </Stack>
    );
}

function DisburseForm({ request, methods, onDone }) {
    const { showSnackbar } = useSnackbar();
    const [form, setForm] = useState({ Amount: String(request.Amount), DisbursedDate: todayKey(), Method: "BANK", Reference: "" });
    const [file, setFile] = useState(null);
    const [busy, setBusy] = useState(false);
    const set = (patch) => setForm((current) => ({ ...current, ...patch }));
    const amount = Number(form.Amount);
    const ready = amount > 0 && amount <= request.Amount && form.DisbursedDate && file;
    return (
        <Stack spacing={1.5}>
            <Stack direction="row" sx={{ gap: 1.5 }}>
                <TextField type="number" label="Amount paid (Rs)" value={form.Amount} onChange={(e) => set({ Amount: e.target.value })} error={amount > request.Amount} helperText={`Approved ${rupees(request.Amount)}`} sx={{ flex: 1 }} />
                <TextField type="date" label="Paid on" value={form.DisbursedDate} onChange={(e) => set({ DisbursedDate: e.target.value })} slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: todayKey() } }} sx={{ flex: 1 }} />
            </Stack>
            <Stack direction="row" sx={{ gap: 1.5 }}>
                <TextField select label="Paid by" value={form.Method} onChange={(e) => set({ Method: e.target.value })} sx={{ flex: 1 }}>
                    {methods.map((m) => (
                        <MenuItem key={m} value={m}>
                            {METHOD_LABEL[m] || m}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField label="Reference (UTR / cheque)" value={form.Reference} onChange={(e) => set({ Reference: e.target.value.slice(0, 100) })} sx={{ flex: 1 }} />
            </Stack>
            <Button component="label" variant="outlined" startIcon={<AttachFileRounded />}>
                {file ? file.name : "Attach supporting document (PDF or photo) *"}
                <input hidden type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Button>
            <Box>
                <Button
                    variant="contained"
                    startIcon={<PaymentsRounded />}
                    disabled={!ready || busy}
                    onClick={async () => {
                        setBusy(true);
                        try {
                            const { docId } = await uploadDocument(file);
                            onDone((await disburse(request.RequestId, { ...form, Amount: amount, DocumentId: docId })).message);
                        } catch (err) {
                            showSnackbar(errorMessage(err, "Could not record the payment"), "error");
                        } finally {
                            setBusy(false);
                        }
                    }}
                >
                    Record payment
                </Button>
            </Box>
        </Stack>
    );
}

// One request: what was asked and promised, who recommended and approved, what was paid, and the outcome.
function RequestDrawer({ request, methods, onClose, onChanged }) {
    const { showSnackbar } = useSnackbar();
    if (!request) return null;
    const status = STATUS[request.Status] || { label: request.Status, color: "secondary" };
    const outcome = request.outcome;
    const done = (message) => {
        showSnackbar(message, "success");
        onChanged();
    };

    return (
        <Drawer anchor="right" open onClose={onClose} slotProps={{ paper: { sx: (theme) => ({ width: theme.drawer.width, backgroundColor: theme.palette.background.paper }) } }}>
            <Stack direction="row" sx={(theme) => ({ gap: 2, px: theme.drawer.paddingX, py: theme.drawer.paddingY, alignItems: "flex-start" })}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        {request.RequestNumber} · {request.TypeName}
                    </Typography>
                    <Typography variant="h4" component="h2">
                        Dr. {request.DoctorName}
                    </Typography>
                    <Stack direction="row" sx={{ gap: 0.75, mt: 0.5, flexWrap: "wrap" }}>
                        <Tag label={status.label} color={status.color} />
                        {outcome && <Tag label={`${OUTCOME[outcome.status].label}${outcome.final ? "" : " so far"}`} color={OUTCOME[outcome.status].color} />}
                    </Stack>
                </Box>
                <IconButton aria-label="Close" onClick={onClose}>
                    <CloseRounded />
                </IconButton>
            </Stack>
            <Divider />

            <Stack sx={(theme) => ({ px: theme.drawer.paddingX, py: theme.drawer.paddingY, gap: theme.drawer.sectionGap, overflowY: "auto" })}>
                {request.priorFailed.length > 0 && (
                    <Alert severity="error" variant="outlined">
                        An earlier claim for this doctor failed ({request.priorFailed.join(", ")}). Flagged for head office.
                    </Alert>
                )}

                <DetailSection title="Request">
                    <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: theme.spacing(1.5) })}>
                        <DetailFact label="Amount asked">{rupees(request.Amount)}</DetailFact>
                        <DetailFact label={`Business expected in ${request.PeriodMonths} months`}>{rupees(request.ExpectedBusiness)}</DetailFact>
                        <DetailFact label="MR">{request.UserName}</DetailFact>
                        <DetailFact label="Territory">{request.TerritoryName}</DetailFact>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1.5 }}>
                        {request.Purpose}
                    </Typography>
                </DetailSection>

                <DetailSection title="Track record">
                    <Stack spacing={0.5}>
                        <Typography variant="body2">
                            <b>{request.UserName}</b> (MR): {scoreText(request.requesterScore)}
                        </Typography>
                        {request.ManagerName && (
                            <Typography variant="body2">
                                <b>{request.ManagerName}</b> (manager): {scoreText(request.managerScore)}
                            </Typography>
                        )}
                        <Typography variant="caption" sx={muted}>
                            Share of their finished claims where the territory reached the promised business.
                        </Typography>
                    </Stack>
                </DetailSection>

                {(request.ManagerRecommendation || request.Decision || request.DisbursedOn) && (
                    <DetailSection title="Decisions">
                        <Stack spacing={1}>
                            {request.ManagerRecommendation && (
                                <Typography variant="body2">
                                    Manager {request.ManagerRecommendation === "RECOMMEND" ? "recommended" : "did not recommend"}: {request.ManagerNote}
                                </Typography>
                            )}
                            {request.Decision && (
                                <Typography variant="body2">
                                    Head office {request.Decision === "APPROVED" ? "approved" : "rejected"} ({request.DecidedByName}, {dayLabel(request.DecidedOn)}){request.ComplianceConfirmed ? " · compliance confirmed" : ""}: {request.DecisionNote}
                                </Typography>
                            )}
                            {request.DisbursedAmount != null && (
                                <Stack direction="row" sx={{ gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                                    <Typography variant="body2">
                                        Paid {rupees(request.DisbursedAmount)} on {dayLabel(request.DisbursedDate)} by {METHOD_LABEL[request.DisbursementMethod] || request.DisbursementMethod}
                                        {request.DisbursementRef ? ` (${request.DisbursementRef})` : ""}
                                    </Typography>
                                    {request.HasDocument === 1 && (
                                        <Button
                                            size="small"
                                            startIcon={<DescriptionRounded />}
                                            onClick={async () => {
                                                try {
                                                    window.open(await documentUrl(request.RequestId), "_blank", "noopener");
                                                } catch (err) {
                                                    showSnackbar(errorMessage(err, "Couldn't open the document"), "error");
                                                }
                                            }}
                                        >
                                            Document
                                        </Button>
                                    )}
                                </Stack>
                            )}
                        </Stack>
                    </DetailSection>
                )}

                {outcome && (
                    <DetailSection title={outcome.final ? "Outcome" : "Outcome so far"}>
                        <Stack spacing={1}>
                            <Typography variant="body2">
                                Territory net sales {dayLabel(outcome.from)} – {dayLabel(outcome.to)}: <b>{rupees(outcome.actual)}</b> against {rupees(outcome.final ? request.ExpectedBusiness : outcome.target)} {outcome.final ? "promised" : `expected by now (${outcome.elapsedPct}% of the period)`}.
                            </Typography>
                            <LinearProgress variant="determinate" value={Math.min(100, outcome.pct || 0)} color={OUTCOME[outcome.status].color === "secondary" ? "primary" : OUTCOME[outcome.status].color} />
                            {outcome.nearbyChemists != null && (
                                <Typography variant="caption" sx={muted}>
                                    Chemists in the doctor's area in the same period: {rupees(outcome.nearbyChemists)} (supplied POB + direct supply).
                                </Typography>
                            )}
                        </Stack>
                    </DetailSection>
                )}

                {request.can.recommend && (
                    <DetailSection title="Your recommendation">
                        <RecommendForm request={request} onDone={done} />
                    </DetailSection>
                )}
                {request.can.decide && (
                    <DetailSection title="Head office decision">
                        <DecideForm request={request} onDone={done} />
                    </DetailSection>
                )}
                {request.can.disburse && (
                    <DetailSection title="Record the payment">
                        <DisburseForm request={request} methods={methods} onDone={done} />
                    </DetailSection>
                )}
            </Stack>
        </Drawer>
    );
}

export default RequestDrawer;
