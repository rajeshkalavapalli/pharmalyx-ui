import { useState } from "react";

import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Divider,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    AssignmentTurnedInRounded,
    CheckCircleRounded,
    CheckRounded,
    CloseRounded,
    EventNoteRounded,
    HourglassTopRounded,
    ReplyRounded,
    SendRounded,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import {
    DetailFact,
    DetailGrid,
    DetailSection,
} from "../../../components/DetailSection/DetailSection";
import Panel from "../../../components/Panel/Panel";
import StatusChip from "../../../components/StatusChip/StatusChip";
import Tag from "../../../components/Tag/Tag";
import Timeline from "../../../components/Timeline/Timeline";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import {
    DAY_STATUS,
    FEEDBACK,
    MAX_DISTANCE_KM,
    REMARKS_LIMIT,
    TRAVEL_MODES,
    VISIT_PLAN_STATUS,
    formatDateTime,
    formatDayHeading,
    formatDeadline,
    formatDuration,
    formatTimeRange,
    minutesBetween,
    shiftTime,
} from "../index";

const ACTIONS = {
    submit: {
        icon: SendRounded,
        color: "primary",
        title: "Send DCR for review?",
        message: "Your manager will review it. Visits for this day will be locked unless it is returned.",
        confirmLabel: "Send for review",
        remarks: "none",
    },
    approve: {
        icon: CheckCircleRounded,
        color: "success",
        title: "Approve this DCR?",
        message: "The day's report and visits are accepted.",
        confirmLabel: "Approve",
        remarks: "optional",
    },
    return: {
        icon: ReplyRounded,
        color: "error",
        title: "Return this DCR?",
        message: "Tell the representative what to correct. They can fix and resend it.",
        confirmLabel: "Return DCR",
        remarks: "required",
    },
};

const travelLabel = (value) => TRAVEL_MODES.find((mode) => mode.value === value)?.label || value;

// Sensible defaults: 30 minutes before the first call to 30 minutes after the last.
const initialForm = (data) => {
    if (data.dcr) {
        return {
            WorkStartTime: data.dcr.WorkStartTime,
            WorkEndTime: data.dcr.WorkEndTime,
            TravelMode: data.dcr.TravelMode,
            DistanceKm: String(data.dcr.DistanceKm),
            Remarks: data.dcr.Remarks || "",
        };
    }

    const starts = data.visits.map((visit) => visit.StartTime).filter(Boolean).sort();
    const ends = data.visits.map((visit) => visit.EndTime).filter(Boolean).sort();

    return {
        WorkStartTime: starts.length ? shiftTime(starts[0], -30) : "09:00",
        WorkEndTime: ends.length ? shiftTime(ends[ends.length - 1], 30) : "18:00",
        TravelMode: "BIKE",
        DistanceKm: "",
        Remarks: "",
    };
};

function VisitLine({ visit }) {
    const feedback = FEEDBACK[visit.Feedback];
    const outOfPlan = visit.PlanStatus === "OUT_OF_PLAN" || visit.PlanStatus === "OFF_DAY";
    const duration = minutesBetween(visit.StartTime, visit.EndTime);

    return (
        <Stack
            direction="row"
            spacing={1.5}
            sx={(theme) => ({
                alignItems: "center",
                p: 1.25,
                borderRadius: theme.calendar.cell.radius,
                backgroundColor: theme.palette.surface.subtle,
            })}
        >
            <Box sx={(theme) => ({ width: theme.visitList.timeColumnWidth, flexShrink: 0 })}>
                <Typography variant="subtitle2">{formatTimeRange(visit.StartTime, visit.EndTime)}</Typography>
                {duration && (
                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {formatDuration(duration)}
                    </Typography>
                )}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {visit.DoctorName}
                    </Typography>
                    <CategoryBadge category={visit.Category} />
                </Stack>
                <Typography
                    variant="caption"
                    component="p"
                    sx={(theme) => ({ color: theme.palette.text.secondary })}
                >
                    {[visit.HospitalName, visit.AreaName].filter(Boolean).join(" · ")}
                </Typography>
            </Box>

            <Stack direction="row" sx={{ gap: 0.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {feedback && <Tag label={feedback.label} color={feedback.color} />}
                {outOfPlan && (
                    <Tag
                        label={VISIT_PLAN_STATUS[visit.PlanStatus].label}
                        color={VISIT_PLAN_STATUS[visit.PlanStatus].color}
                    />
                )}
            </Stack>
        </Stack>
    );
}

const buildSteps = (dcr) => {
    const steps = [
        {
            key: "submitted",
            icon: SendRounded,
            title: "Sent for review",
            caption: formatDateTime(dcr.SubmittedOn),
            state: "done",
            color: "primary",
        },
    ];

    if (dcr.Status === "SUBMITTED") {
        steps.push({
            key: "review",
            icon: HourglassTopRounded,
            title: "Manager review",
            caption: "Waiting for a decision",
            state: "current",
            color: "warning",
        });
    } else {
        const approved = dcr.Status === "APPROVED";

        steps.push({
            key: "review",
            icon: approved ? CheckRounded : CloseRounded,
            title: approved ? "Approved" : "Returned for changes",
            caption: [dcr.ReviewedByName, formatDateTime(dcr.ReviewedOn)].filter(Boolean).join(" · "),
            note: dcr.ReviewRemarks,
            state: approved ? "done" : "current",
            color: approved ? "success" : "error",
        });
    }

    return steps;
};

// Mounted per day (via `key`), so the form starts from that day's data.
function DayReportPanel({ data, viewingSelf, pendingSyncCount, busy, onSubmit, onReview }) {
    const [form, setForm] = useState(() => initialForm(data));
    const [action, setAction] = useState(null);

    const status = DAY_STATUS[data.status];
    const { dcr, visits, plan } = data;
    const editing = data.canSubmit;

    const setField = (field) => (event) =>
        setForm((current) => ({ ...current, [field]: event.target.value }));

    const distance = Number(form.DistanceKm);
    const formError = (() => {
        if (form.WorkStartTime && form.WorkEndTime && form.WorkEndTime <= form.WorkStartTime) {
            return "Work end time must be after the start time.";
        }
        if (form.DistanceKm !== "" && (!Number.isFinite(distance) || distance < 0 || distance > MAX_DISTANCE_KM)) {
            return `Distance must be between 0 and ${MAX_DISTANCE_KM} km.`;
        }
        return "";
    })();

    const canSend =
        editing &&
        !pendingSyncCount &&
        !formError &&
        form.WorkStartTime &&
        form.WorkEndTime &&
        form.TravelMode &&
        form.DistanceKm !== "";

    const handleConfirm = async (remarks) => {
        const done =
            action === "submit"
                ? await onSubmit({
                      ReportDate: data.date,
                      ...form,
                      DistanceKm: distance,
                      Remarks: form.Remarks.trim(),
                  })
                : await onReview(action, dcr.DcrId, remarks);

        if (done) setAction(null);
    };

    const planText =
        plan?.DayType === "non-working"
            ? "Planned as an off day"
            : plan
              ? [plan.TerritoryName, plan.AreaName].filter(Boolean).join(" · ") || "Working day"
              : "No tour plan for this day";

    return (
        <Panel
            title={formatDayHeading(data.date)}
            subtitle={planText}
            actions={status && <StatusChip label={status.label} color={status.color} />}
        >
            <Stack sx={(theme) => ({ gap: theme.drawer.sectionGap })}>
                {/* NOTICES */}

                {data.status === "DUE" && viewingSelf && (
                    <Alert severity="info" variant="outlined">
                        Send this DCR by the end of {formatDeadline(data.deadline)}.
                    </Alert>
                )}

                {data.status === "MISSED" && (
                    <Alert severity="error" variant="outlined">
                        The deadline ({formatDeadline(data.deadline)}) passed without a DCR.
                    </Alert>
                )}

                {data.status === "RETURNED" && dcr?.ReviewRemarks && (
                    <Alert severity="error" variant="outlined">
                        <AlertTitle>
                            Returned{dcr.ReviewedByName ? ` by ${dcr.ReviewedByName}` : ""}
                        </AlertTitle>
                        {dcr.ReviewRemarks}
                    </Alert>
                )}

                {pendingSyncCount > 0 && viewingSelf && (
                    <Alert severity="warning" variant="outlined">
                        {pendingSyncCount} visit{pendingSyncCount === 1 ? " is" : "s are"} saved on this
                        device and not synced yet. Sync them from the Visits page before sending the DCR.
                    </Alert>
                )}

                {/* VISITS */}

                <DetailSection title={`Visits (${visits.length})`}>
                    {visits.length === 0 ? (
                        <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
                            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                No visits logged for this day.
                            </Typography>
                            {viewingSelf && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<EventNoteRounded />}
                                    component={RouterLink}
                                    to="/field-operation/visits"
                                >
                                    Go to Visits
                                </Button>
                            )}
                        </Stack>
                    ) : (
                        <Stack spacing={1}>
                            {visits.map((visit) => (
                                <VisitLine key={visit.VisitId} visit={visit} />
                            ))}
                        </Stack>
                    )}
                </DetailSection>

                {/* REPORT: form while editable, otherwise the sent values */}

                {editing ? (
                    <DetailSection title="Work & travel">
                        <Stack spacing={2}>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
                                    gap: 2,
                                }}
                            >
                                <TextField
                                    label="Started work"
                                    type="time"
                                    required
                                    value={form.WorkStartTime}
                                    onChange={setField("WorkStartTime")}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                                <TextField
                                    label="Finished work"
                                    type="time"
                                    required
                                    value={form.WorkEndTime}
                                    onChange={setField("WorkEndTime")}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    helperText={
                                        minutesBetween(form.WorkStartTime, form.WorkEndTime)
                                            ? `${formatDuration(minutesBetween(form.WorkStartTime, form.WorkEndTime))} working`
                                            : " "
                                    }
                                />
                                <TextField
                                    select
                                    label="Travel mode"
                                    required
                                    value={form.TravelMode}
                                    onChange={setField("TravelMode")}
                                >
                                    {TRAVEL_MODES.map((mode) => (
                                        <MenuItem key={mode.value} value={mode.value}>
                                            {mode.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Distance travelled (km)"
                                    type="number"
                                    required
                                    value={form.DistanceKm}
                                    onChange={setField("DistanceKm")}
                                    slotProps={{ htmlInput: { min: 0, max: MAX_DISTANCE_KM, step: 0.1 } }}
                                />
                            </Box>

                            <TextField
                                multiline
                                minRows={2}
                                label="Remarks (optional)"
                                placeholder="Anything your manager should know about the day"
                                value={form.Remarks}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        Remarks: event.target.value.slice(0, REMARKS_LIMIT),
                                    }))
                                }
                            />

                            {formError && (
                                <Alert severity="error" variant="outlined">
                                    {formError}
                                </Alert>
                            )}

                            <Box>
                                <Button
                                    variant="contained"
                                    startIcon={<SendRounded />}
                                    disabled={!canSend || busy}
                                    onClick={() => setAction("submit")}
                                >
                                    {data.status === "RETURNED" ? "Resend for review" : "Send for review"}
                                </Button>
                            </Box>
                        </Stack>
                    </DetailSection>
                ) : (
                    dcr && (
                        <DetailSection title="Work & travel">
                            <DetailGrid>
                                <DetailFact label="Working hours">
                                    {`${formatTimeRange(dcr.WorkStartTime, dcr.WorkEndTime)} · ${formatDuration(
                                        minutesBetween(dcr.WorkStartTime, dcr.WorkEndTime)
                                    )}`}
                                </DetailFact>
                                <DetailFact label="Travel">
                                    {`${travelLabel(dcr.TravelMode)} · ${dcr.DistanceKm} km`}
                                </DetailFact>
                                <DetailFact label="Remarks">{dcr.Remarks || "None"}</DetailFact>
                                <DetailFact label="Visits reported">{dcr.VisitCount}</DetailFact>
                            </DetailGrid>
                        </DetailSection>
                    )
                )}

                {!editing && !dcr && data.blockedReason && visits.length > 0 && viewingSelf && (
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {data.blockedReason}
                    </Typography>
                )}

                {/* HISTORY + REVIEW */}

                {dcr && (
                    <>
                        <Divider />

                        <DetailSection title="Review">
                            <Timeline steps={buildSteps(dcr)} />
                        </DetailSection>

                        {dcr.canReview && (
                            <Stack direction="row" spacing={1.25} sx={{ justifyContent: "flex-end" }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<ReplyRounded />}
                                    disabled={busy}
                                    onClick={() => setAction("return")}
                                >
                                    Return
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<AssignmentTurnedInRounded />}
                                    disabled={busy}
                                    onClick={() => setAction("approve")}
                                >
                                    Approve
                                </Button>
                            </Stack>
                        )}
                    </>
                )}
            </Stack>

            {action && (
                <ConfirmActionDialog
                    key={action}
                    {...ACTIONS[action]}
                    remarksLimit={REMARKS_LIMIT}
                    busy={busy}
                    onClose={() => setAction(null)}
                    onConfirm={handleConfirm}
                />
            )}
        </Panel>
    );
}

export default DayReportPanel;
