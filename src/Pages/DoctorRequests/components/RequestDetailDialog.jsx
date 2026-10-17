import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    Link,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { CheckCircleRounded, CloseRounded, EditNoteRounded, OpenInNewRounded, UndoRounded } from "@mui/icons-material";

import StatusChip from "../../../components/StatusChip/StatusChip";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { FIELD_LABEL, REQUEST_STATUS, REQUEST_TYPE, WARNING_LABEL, cancelRequest, decideRequest, errorMessage, formatDate, getRequest, mapsUrl } from "../index";
import ChangeRequestDialog from "./ChangeRequestDialog";
import DuplicateMatches, { DoctorSummary } from "./DuplicateMatches";

const MIN_REMARKS = 10;

// One doctor request: what was asked, why, possible duplicates side by side, and the decision.
function RequestDetailDialog({ requestId, onClose, onChanged }) {
    const { showSnackbar } = useSnackbar();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [remarks, setRemarks] = useState("");
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [busy, setBusy] = useState(false);
    const [fixing, setFixing] = useState(false);

    useEffect(() => {
        getRequest(requestId)
            .then(setData)
            .catch((err) => setError(errorMessage(err, "Couldn't load the request")));
    }, [requestId]);

    const act = async (kind) => {
        setBusy(true);
        try {
            const response = kind === "cancel" ? await cancelRequest(requestId) : await decideRequest(requestId, kind === "approve", { Remarks: remarks.trim() || null, IsDuplicate: isDuplicate });
            showSnackbar(response?.message || "Done", kind === "approve" ? "success" : "info");
            onChanged();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed"), "error");
        } finally {
            setBusy(false);
        }
    };

    const request = data?.request;
    const doctor = data?.doctor;
    const remarksOk = remarks.trim().length >= MIN_REMARKS;
    // Edits list what they change; a new doctor sent again lists what changed since the rejection.
    const changedFields = !data?.proposed
        ? []
        : request.RequestType === "EDIT"
          ? Object.keys(data.proposed)
          : data.previous && data.current
            ? Object.keys(data.proposed).filter((field) => String(data.proposed[field] ?? "") !== String(data.current[field] ?? ""))
            : [];

    return (
        <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="md" slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2, alignItems: "flex-start" })}>
                <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        {request && <Tag label={REQUEST_TYPE[request.RequestType].label} color={REQUEST_TYPE[request.RequestType].color} />}
                        <Typography variant="overline" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            {request ? `${request.RequestedByName} · ${formatDate(request.CreatedOn)}` : ""}
                        </Typography>
                    </Stack>
                    <Typography variant="h5" component="h2">
                        {doctor ? `Dr. ${String(doctor.DoctorName).replace(/^dr\.?\s*/i, "")}` : "Loading…"}
                    </Typography>
                </Box>
                {request && <StatusChip label={REQUEST_STATUS[request.Status].label} color={REQUEST_STATUS[request.Status].color} />}
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={busy}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                {error ? (
                    <Alert severity="error" variant="outlined">
                        {error}
                    </Alert>
                ) : (
                    data && (
                        <Stack spacing={2.5}>
                            {data.previous && (
                                <Alert severity="warning" variant="outlined">
                                    <Typography variant="caption" component="p" sx={{ fontWeight: 600 }}>
                                        Sent again after it was rejected{data.previous.reviewedBy ? ` by ${data.previous.reviewedBy}` : ""}
                                        {data.previous.reviewedOn ? ` on ${formatDate(data.previous.reviewedOn)}` : ""}
                                    </Typography>
                                    {data.previous.remarks || "No reason was given."}
                                </Alert>
                            )}

                            {request.Comment && (
                                <Alert severity="info" variant="outlined" icon={false}>
                                    <Typography variant="caption" component="p" sx={{ fontWeight: 600 }}>
                                        {data.previous ? `What ${request.RequestedByName} fixed` : `${request.RequestedByName}'s reason`}
                                    </Typography>
                                    {request.Comment}
                                </Alert>
                            )}

                            {request.RequestType === "CREATE" && (
                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
                                    <DoctorSummary title="New doctor" doctor={doctor} photoId={doctor.SignboardId || null} />
                                    <Stack spacing={1}>
                                        {[
                                            ["Qualification", doctor.Qualification],
                                            ["Phone", doctor.MobileNumber],
                                            ["Registration no.", doctor.RegistrationNumber],
                                            ["Category", doctor.Category ? `Class ${doctor.Category}` : null],
                                            ["Verify by", doctor.VerificationDueOn ? formatDate(doctor.VerificationDueOn) : null],
                                        ].map(([label, value]) => (
                                            <Stack key={label} direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
                                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                    {label}
                                                </Typography>
                                                <Typography variant="subtitle2">{value || "—"}</Typography>
                                            </Stack>
                                        ))}
                                        {doctor.ClinicLatitude != null && (
                                            <Link href={mapsUrl(doctor.ClinicLatitude, doctor.ClinicLongitude)} target="_blank" rel="noopener noreferrer" variant="body2" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                                                Clinic pinned at {Number(doctor.ClinicLatitude).toFixed(5)}, {Number(doctor.ClinicLongitude).toFixed(5)}
                                                <OpenInNewRounded fontSize="inherit" />
                                            </Link>
                                        )}
                                    </Stack>
                                </Box>
                            )}

                            {(request.RequestType === "EDIT" || changedFields.length > 0) && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        {request.RequestType === "EDIT" ? "Requested changes" : "Changed since the rejection"}
                                    </Typography>
                                    <Stack divider={<Divider />}>
                                        {changedFields.map((field) => (
                                            <Box key={field} sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1.2fr)", gap: 1.5, py: 1 }}>
                                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                    {FIELD_LABEL[field] || field}
                                                </Typography>
                                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary, textDecoration: "line-through" })}>
                                                    {String(data.current?.[field] ?? "—")}
                                                </Typography>
                                                <Typography variant="subtitle2">{String(data.proposed[field] ?? "—")}</Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            {request.RequestType === "DELETE" && <DoctorSummary title="Doctor to remove" doctor={doctor} photoId={doctor.SignboardId || null} />}

                            {data.warnings.length > 0 && (
                                <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap" }}>
                                    {data.warnings.map((warning) => (
                                        <Tag key={warning.reason} label={`${WARNING_LABEL[warning.reason] || warning.reason}${warning.detail ? `: ${warning.detail}` : ""}`} color="warning" />
                                    ))}
                                </Stack>
                            )}

                            <DuplicateMatches matches={data.duplicates} subject={request.RequestType === "DELETE" ? null : { ...doctor, ...(data.proposed || {}) }} subjectPhotoId={doctor.SignboardId || null} subjectTitle={request.RequestType === "CREATE" ? "New doctor" : "After the change"} />

                            {request.Status !== "PENDING" && (
                                <Alert severity={request.Status === "APPROVED" ? "success" : "warning"} variant="outlined">
                                    {REQUEST_STATUS[request.Status].label}
                                    {request.ReviewedByName ? ` by ${request.ReviewedByName}` : ""}
                                    {request.ReviewedOn ? ` on ${formatDate(request.ReviewedOn)}` : ""}
                                    {request.ReviewRemarks ? `: ${request.ReviewRemarks}` : ""}
                                </Alert>
                            )}

                            {data.resubmittedAs && (
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    This request was fixed and sent again; see the newer request in the list.
                                </Typography>
                            )}

                            {data.approveBlocked && (
                                <Alert severity="info" variant="outlined">
                                    You are {request.RequestedByName}&apos;s manager, but your role can&apos;t approve doctor requests yet. Ask an admin to switch on
                                    &quot;Doctor requests · Approve&quot; for your role in Roles &amp; Permissions.
                                </Alert>
                            )}

                            {data.canReview && (
                                <Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        label={data.flagged ? "Your reason (required, saved in the audit log)" : "Remarks"}
                                        value={remarks}
                                        onChange={(event) => setRemarks(event.target.value.slice(0, 1000))}
                                        helperText={data.flagged ? "This request is flagged. Explain why you approve it, or why you reject it." : "Required when rejecting."}
                                    />
                                    {request.RequestType === "CREATE" && data.duplicates.length > 0 && (
                                        <FormControlLabel control={<Checkbox checked={isDuplicate} onChange={(event) => setIsDuplicate(event.target.checked)} />} label="It is a duplicate of an existing doctor (when rejecting)" />
                                    )}
                                </Box>
                            )}
                        </Stack>
                    )
                )}
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={busy}>
                    Close
                </Button>
                {data?.canResubmit && (
                    <Button variant="contained" startIcon={<EditNoteRounded />} onClick={() => setFixing(true)} disabled={busy}>
                        Fix and send again
                    </Button>
                )}
                {data?.canCancel && (
                    <Button color="warning" onClick={() => act("cancel")} disabled={busy}>
                        Cancel request
                    </Button>
                )}
                {data?.canReview && (
                    <>
                        <Button variant="outlined" color="error" startIcon={<UndoRounded />} onClick={() => act("reject")} disabled={busy || !remarksOk}>
                            Reject
                        </Button>
                        <Button variant="contained" color="success" startIcon={<CheckCircleRounded />} onClick={() => act("approve")} disabled={busy || (data.flagged && !remarksOk) || isDuplicate}>
                            Approve
                        </Button>
                    </>
                )}
            </DialogActions>

            {fixing && (
                <ChangeRequestDialog
                    doctor={doctor}
                    resubmit={{ requestId, type: request.RequestType, remarks: request.ReviewRemarks, reviewedBy: request.ReviewedByName, proposed: data.proposed }}
                    onClose={() => setFixing(false)}
                    onSaved={() => {
                        setFixing(false);
                        onChanged();
                    }}
                />
            )}
        </Dialog>
    );
}

export default RequestDetailDialog;
