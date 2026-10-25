import { useEffect, useState } from "react";

import { Alert, Box, Button, Divider, Drawer, IconButton, Link, Stack, TextField, Typography } from "@mui/material";
import { CloseRounded, MapRounded, OpenInNewRounded } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

import {
    DetailFact,
    DetailGrid,
    DetailSection,
} from "../../../components/DetailSection/DetailSection";
import Tag from "../../../components/Tag/Tag";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import { EXPLANATION_STATUS, explainVisit, formatClock, formatDwell, validityOf } from "../../WorkDay/index";
import DoctorAvatar from "../../MyDoctors/components/DoctorAvatar";
import {
    FEEDBACK,
    LOCATION_STATUS,
    PLAN_STATUS,
    formatDateTime,
    formatDayHeading,
    formatDueLabel,
    formatDuration,
    formatShortDate,
    formatTimeRange,
    geofenceTag,
    getVisit,
    mapsUrl,
    minutesBetween,
} from "../index";

const DEVIATION_LABEL = {
    PENDING: { label: "Deviation pending review", color: "warning" },
    APPROVED: { label: "Deviation approved", color: "success" },
    REJECTED: { label: "Deviation rejected", color: "error" },
};

// Samples & gifts handed over: from the device for unsynced visits, else from the server.
function useVisitItems(visit) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!visit) return undefined;

        if (visit.pending) {
            setItems(visit.Items || []);
            return undefined;
        }

        let active = true;
        setItems([]);

        getVisit(visit.VisitId)
            .then((response) => {
                if (active) setItems(response?.visit?.Items || response?.Items || []);
            })
            .catch(() => {
                if (active) setItems([]);
            });

        return () => {
            active = false;
        };
    }, [visit]);

    return items;
}

// The employee explains a visit that needs a look / is not counted; their manager decides.
function ExplainBox({ visit, onExplained }) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [sent, setSent] = useState(null);

    const explanation = sent || visit.Explanation;
    if (explanation) {
        const status = EXPLANATION_STATUS[explanation.Status] || EXPLANATION_STATUS.PENDING;
        return (
            <Stack spacing={0.5} sx={{ alignItems: "flex-start" }}>
                <Tag label={status.label} color={status.color} />
                <Typography variant="body2">Your explanation: "{explanation.Reason}"</Typography>
                {explanation.ReviewNote && (
                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {explanation.ReviewedByName ? `${explanation.ReviewedByName}: ` : ""}
                        {explanation.ReviewNote}
                    </Typography>
                )}
            </Stack>
        );
    }
    if (!visit.CanExplain) return null;

    const send = async () => {
        setBusy(true);
        setError("");
        try {
            await explainVisit(visit.VisitId, text.trim());
            setSent({ Status: "PENDING", Reason: text.trim() });
            onExplained?.();
        } catch (err) {
            setError(err.response?.data?.message || "Couldn't send. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    return open ? (
        <Stack spacing={1} sx={{ width: "100%" }}>
            {error && <Alert severity="error" variant="outlined">{error}</Alert>}
            <TextField
                multiline
                minRows={2}
                autoFocus
                label="What happened?"
                placeholder="For example: the doctor was in surgery, I waited in the hospital lobby where GPS is weak."
                value={text}
                onChange={(event) => setText(event.target.value.slice(0, 500))}
                helperText={`${text.trim().length < 10 ? "At least 10 characters. " : ""}Your manager decides; if accepted, the visit counts.`}
            />
            <Stack direction="row" spacing={1}>
                <Button variant="contained" size="small" disabled={busy || text.trim().length < 10} onClick={send}>
                    {busy ? "Sending…" : "Send to my manager"}
                </Button>
                <Button size="small" disabled={busy} onClick={() => setOpen(false)}>
                    Cancel
                </Button>
            </Stack>
        </Stack>
    ) : (
        <Button variant="outlined" size="small" onClick={() => setOpen(true)}>
            Explain this visit
        </Button>
    );
}

function VisitDetailsDrawer({ visit, onClose, onDiscard, onRetry, onExplained }) {
    const items = useVisitItems(visit);

    const duration = visit ? minutesBetween(visit.StartTime, visit.EndTime) : null;
    const feedback = visit ? FEEDBACK[visit.Feedback] : null;
    const plan = visit ? PLAN_STATUS[visit.PlanStatus] : null;
    const location = visit ? LOCATION_STATUS[visit.LocationStatus] || LOCATION_STATUS.NOT_CAPTURED : null;
    const deviation = visit ? DEVIATION_LABEL[visit.DeviationStatus] : null;

    return (
        <Drawer
            anchor="right"
            open={Boolean(visit)}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: (theme) => ({
                        width: theme.drawer.width,
                        backgroundColor: theme.palette.background.paper,
                        display: "flex",
                        flexDirection: "column",
                    }),
                },
            }}
        >
            {visit && (
                <>
                    {/* HEADER */}

                    <Stack
                        direction="row"
                        sx={(theme) => ({
                            alignItems: "flex-start",
                            gap: 2,
                            px: theme.drawer.paddingX,
                            py: theme.drawer.paddingY,
                        })}
                    >
                        <DoctorAvatar doctor={visit} />

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="overline"
                                component="p"
                                sx={(theme) => ({ color: theme.palette.primary.main })}
                            >
                                Visit · {formatDayHeading(visit.VisitDate)}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <Typography variant="h4" component="h2" sx={{ overflowWrap: "anywhere" }}>
                                    {visit.DoctorName}
                                </Typography>
                                <CategoryBadge category={visit.Category} />
                            </Stack>
                            <Typography
                                variant="body2"
                                sx={(theme) => ({ color: theme.palette.text.secondary })}
                            >
                                {[visit.Speciality, visit.HospitalName].filter(Boolean).join(" · ")}
                            </Typography>
                        </Box>

                        <IconButton aria-label="Close" onClick={onClose}>
                            <CloseRounded />
                        </IconButton>
                    </Stack>

                    <Divider />

                    {/* BODY */}

                    <Box
                        sx={(theme) => ({
                            flex: 1,
                            overflowY: "auto",
                            px: theme.drawer.paddingX,
                            py: theme.drawer.paddingY,
                        })}
                    >
                        <Stack sx={(theme) => ({ gap: theme.drawer.sectionGap })}>
                            {visit.pending && (
                                <Alert
                                    severity={visit.syncError ? "error" : "warning"}
                                    variant="outlined"
                                    action={
                                        <Stack direction="row" spacing={1}>
                                            {visit.syncError && (
                                                <Button color="inherit" size="small" onClick={() => onRetry(visit.VisitId)}>
                                                    Retry
                                                </Button>
                                            )}
                                            <Button color="inherit" size="small" onClick={() => onDiscard(visit.VisitId)}>
                                                Discard
                                            </Button>
                                        </Stack>
                                    }
                                >
                                    {visit.syncError
                                        ? `Not saved: ${visit.syncError}`
                                        : "Saved on this device. It will sync automatically when you're online."}
                                </Alert>
                            )}

                            <DetailSection title="Call">
                                <DetailGrid>
                                    <DetailFact label="Time">
                                        {formatTimeRange(visit.StartTime, visit.EndTime)}
                                    </DetailFact>
                                    <DetailFact label="Duration">
                                        {duration ? formatDuration(duration) : "Not recorded"}
                                    </DetailFact>
                                    <DetailFact label="Joint work">
                                        {visit.JointWorkUserName ? `With ${visit.JointWorkUserName}` : "No"}
                                    </DetailFact>
                                    <DetailFact label="Location">
                                        {[visit.TerritoryName, visit.AreaName].filter(Boolean).join(" · ") || "—"}
                                    </DetailFact>
                                </DetailGrid>
                            </DetailSection>

                            <DetailSection title="Outcome">
                                <Stack spacing={2}>
                                    <DetailGrid>
                                        <DetailFact label="Doctor's response">
                                            {feedback ? (
                                                <Tag label={feedback.label} color={feedback.color} />
                                            ) : (
                                                "Not recorded"
                                            )}
                                        </DetailFact>
                                        <DetailFact label="Follow-up">
                                            {visit.FollowUpDate
                                                ? `${formatShortDate(visit.FollowUpDate)} · ${formatDueLabel(visit.FollowUpDate)}`
                                                : "None"}
                                        </DetailFact>
                                    </DetailGrid>

                                    <DetailFact label="Notes">
                                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                                            {visit.Notes || "No notes"}
                                        </Typography>
                                    </DetailFact>
                                </Stack>
                            </DetailSection>

                            {items.length > 0 && (
                                <DetailSection title="Samples & gifts given">
                                    <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap" }}>
                                        {items.map((item) => (
                                            <Tag
                                                key={`${item.ItemType}:${item.ItemId}`}
                                                label={`${item.ItemName} × ${item.Quantity}`}
                                                color={item.ItemType === "GIFT" ? "secondary" : "primary"}
                                            />
                                        ))}
                                    </Stack>
                                </DetailSection>
                            )}

                            <DetailSection title="Counts as work?">
                                <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
                                    <Tag label={validityOf(visit).label} color={validityOf(visit).color} />
                                    {visit.CheckInAt && (
                                        <Typography variant="body2">
                                            Checked in {formatClock(visit.CheckInAt)} · out {formatClock(visit.CheckOutAt)} · stayed {formatDwell(visit.DwellSeconds)}
                                            {visit.MotionActivity ? ` · phone: ${String(visit.MotionActivity).toLowerCase().replace("_", " ")}` : ""}
                                        </Typography>
                                    )}
                                    {/* Hard reasons (red) stop a visit counting; soft ones (amber) only need a look. */}
                                    {(visit.reasons || []).map((reason) => (
                                        <Typography key={reason.code} variant="body2" sx={(theme) => ({ color: reason.hard ? theme.palette.error.main : theme.palette.warning.dark })}>
                                            • {reason.text}
                                        </Typography>
                                    ))}
                                    {(visit.notes || []).map((note) => (
                                        <Typography key={note.code} variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            Note: {note.text}
                                        </Typography>
                                    ))}
                                    {visit.ValidityOverride && (
                                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            Changed after review: {visit.OverrideReason}
                                        </Typography>
                                    )}
                                    <ExplainBox key={visit.VisitId} visit={visit} onExplained={onExplained} />
                                    {!visit.FinalValidity && (
                                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            Logged before verified work started.
                                        </Typography>
                                    )}
                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {visit.FinalValidity === "REVIEW"
                                            ? "This visit counts. Your manager or head office may look at it; you can explain it within 2 days."
                                            : visit.FinalValidity === "INVALID"
                                              ? "Decided by the system. If it was a genuine visit, explain it within 2 days and your manager decides."
                                              : "Decided by the system."}
                                    </Typography>
                                </Stack>
                            </DetailSection>

                            <DetailSection title="GPS check-in">
                                <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
                                    <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap" }}>
                                        <Tag icon={MapRounded} label={location.label} color={location.color} />
                                        {geofenceTag(visit) && <Tag label={geofenceTag(visit).label} color={geofenceTag(visit).color} />}
                                        {visit.IsMockLocation && <Tag label="Mock GPS reported" color="error" />}
                                    </Stack>
                                    {visit.GeofenceReason && (
                                        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            Reason given: {visit.GeofenceReason}
                                        </Typography>
                                    )}

                                    {visit.LocationStatus === "CAPTURED" && (
                                        <>
                                            <Typography variant="body2">
                                                {Number(visit.Latitude).toFixed(5)}, {Number(visit.Longitude).toFixed(5)}
                                                {visit.LocationAccuracy != null ? ` · ±${visit.LocationAccuracy} m` : ""}
                                            </Typography>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                endIcon={<OpenInNewRounded />}
                                                href={mapsUrl(visit.Latitude, visit.Longitude)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Open in Maps
                                            </Button>
                                        </>
                                    )}
                                </Stack>
                            </DetailSection>

                            {!visit.pending && plan && (
                                <DetailSection title="Tour plan check">
                                    <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
                                        <Tag label={plan.label} color={plan.color} />

                                        {(visit.PlannedTerritoryName || visit.PlannedAreaName) && (
                                            <Typography variant="body2">
                                                Planned:{" "}
                                                {[visit.PlannedTerritoryName, visit.PlannedAreaName]
                                                    .filter(Boolean)
                                                    .join(" · ")}
                                            </Typography>
                                        )}

                                        {deviation && (
                                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                <Tag label={deviation.label} color={deviation.color} />
                                                <Link
                                                    component={RouterLink}
                                                    to="/field-operation/plan-deviation"
                                                    variant="body2"
                                                >
                                                    View deviations
                                                </Link>
                                            </Stack>
                                        )}
                                    </Stack>
                                </DetailSection>
                            )}

                            {!visit.pending && (
                                <DetailSection title="Record">
                                    <DetailGrid>
                                        <DetailFact label="Recorded">
                                            {`${formatDateTime(visit.RecordedAt)}${visit.RecordedOffline ? " (offline)" : ""}`}
                                        </DetailFact>
                                        <DetailFact label="Received by server">
                                            {formatDateTime(visit.CreatedOn)}
                                        </DetailFact>
                                    </DetailGrid>
                                </DetailSection>
                            )}
                        </Stack>
                    </Box>
                </>
            )}
        </Drawer>
    );
}

export default VisitDetailsDrawer;
