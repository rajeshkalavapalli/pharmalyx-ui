import { useEffect, useState } from "react";

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from "@mui/material";
import { CheckCircleRounded, CloseRounded, UndoRounded } from "@mui/icons-material";

import StatusChip from "../../../components/StatusChip/StatusChip";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { VERIFY_METHOD, VERIFY_STATUS, deadlineLabel, decideVerification, errorMessage, formatDate, getVerification } from "../index";
import { EvidencePhoto } from "./DuplicateMatches";

const MIN_REMARKS = 10;

const CHECK_TIP = {
    REGISTRATION_NO: "Check the number on the medical council's register before accepting.",
    PHONE: "Call the number and confirm you are speaking to the doctor before accepting.",
    DOCUMENT: "Check the name and clinic on the photo match this doctor.",
};

// Manager reviews one proof: accept (doctor becomes verified) or reject with a reason.
function VerificationReviewDialog({ verificationId, onClose, onChanged }) {
    const { showSnackbar } = useSnackbar();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [remarks, setRemarks] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        getVerification(verificationId)
            .then(setData)
            .catch((err) => setError(errorMessage(err, "Couldn't load the proof")));
    }, [verificationId]);

    const act = async (accept) => {
        setBusy(true);
        try {
            const response = await decideVerification(verificationId, accept, remarks.trim());
            showSnackbar(response?.message || "Saved", accept ? "success" : "info");
            onChanged();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed"), "error");
        } finally {
            setBusy(false);
        }
    };

    const v = data?.verification;
    const deadline = data ? deadlineLabel(data.daysLeft) : null;

    return (
        <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2, alignItems: "flex-start" })}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        Doctor verification
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {v ? `Dr. ${String(v.DoctorName).replace(/^dr\.?\s*/i, "")}` : "Loading…"}
                    </Typography>
                    {v && (
                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            {[v.Speciality, v.AreaName, `sent by ${v.SubmittedByName} on ${formatDate(v.SubmittedOn)}`].filter(Boolean).join(" · ")}
                        </Typography>
                    )}
                </Box>
                {v && <StatusChip label={VERIFY_STATUS[v.Status].label} color={VERIFY_STATUS[v.Status].color} />}
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
                    v && (
                        <Stack spacing={2}>
                            <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap" }}>
                                <Tag label={VERIFY_METHOD[v.Method].label} color={VERIFY_METHOD[v.Method].color} />
                                {v.Status === "PENDING" && deadline && <Tag label={deadline.label} color={deadline.color} />}
                            </Stack>

                            {v.Method === "DOCUMENT" ? (
                                <EvidencePhoto evidenceId={v.EvidenceId} alt={v.Value} height={300} />
                            ) : (
                                <Box sx={(theme) => ({ p: 2, borderRadius: theme.calendar.cell.radius, backgroundColor: theme.palette.surface.muted })}>
                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {VERIFY_METHOD[v.Method].label}
                                    </Typography>
                                    <Typography variant="h5" component="p" sx={{ fontVariantNumeric: "tabular-nums" }}>
                                        {v.Value}
                                    </Typography>
                                </Box>
                            )}

                            {data.clash && (
                                <Alert severity="error" variant="outlined">
                                    This number already belongs to Dr. {data.clash.DoctorName}
                                    {data.clash.AreaName ? ` (${data.clash.AreaName})` : ""}. This may be a duplicate doctor; it can&apos;t be accepted.
                                </Alert>
                            )}

                            {v.Status === "PENDING" && data.canReview && (
                                <>
                                    <Alert severity="info" variant="outlined">
                                        {CHECK_TIP[v.Method]}
                                    </Alert>
                                    <TextField multiline minRows={2} label="Remarks (required to reject)" value={remarks} onChange={(event) => setRemarks(event.target.value.slice(0, 500))} />
                                </>
                            )}

                            {v.Status !== "PENDING" && (
                                <Alert severity={v.Status === "ACCEPTED" ? "success" : "warning"} variant="outlined">
                                    {VERIFY_STATUS[v.Status].label}
                                    {v.ReviewedByName ? ` by ${v.ReviewedByName}` : ""}
                                    {v.ReviewedOn ? ` on ${formatDate(v.ReviewedOn)}` : ""}
                                    {v.ReviewRemarks ? `: ${v.ReviewRemarks}` : ""}
                                </Alert>
                            )}
                        </Stack>
                    )
                )}
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={busy}>
                    Close
                </Button>
                {data?.canReview && (
                    <>
                        <Button variant="outlined" color="error" startIcon={<UndoRounded />} onClick={() => act(false)} disabled={busy || remarks.trim().length < MIN_REMARKS}>
                            Reject
                        </Button>
                        <Button variant="contained" color="success" startIcon={<CheckCircleRounded />} onClick={() => act(true)} disabled={busy || Boolean(data.clash)}>
                            Accept
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default VerificationReviewDialog;
