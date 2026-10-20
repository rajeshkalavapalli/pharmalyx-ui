import { useCallback, useEffect, useState } from "react";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, TextField, Typography } from "@mui/material";
import { GroupsRounded, VerifiedRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { VERIFY_METHOD, VERIFY_STATUS, confirmJointVisit, deadlineLabel, errorMessage, extendDeadline, formatDate, getVerificationOverview } from "../index";
import VerificationReviewDialog from "./VerificationReviewDialog";
import VerifyDialog from "./VerifyDialog";

function ExtendDialog({ doctor, onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();
    const [days, setDays] = useState("15");
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);

    const save = async () => {
        setBusy(true);
        try {
            const response = await extendDeadline(doctor.DoctorId, Number(days), reason.trim());
            showSnackbar(response?.message || "Deadline extended", "success");
            onSaved();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to extend"), "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
            <DialogTitle>Extend deadline · Dr. {doctor.DoctorName}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <TextField type="number" label="Extra days (1–30)" value={days} onChange={(event) => setDays(event.target.value)} slotProps={{ htmlInput: { min: 1, max: 30 } }} />
                    <TextField multiline minRows={2} required label="Reason (saved in the audit log)" value={reason} onChange={(event) => setReason(event.target.value.slice(0, 500))} />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button variant="outlined" onClick={onClose} disabled={busy}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={save} disabled={busy || reason.trim().length < 10 || !(Number(days) >= 1 && Number(days) <= 30)}>
                    Extend
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// Provisional doctors with their deadline, and the proofs waiting for (or sent to) a manager.
// initialView "proofs" opens the proofs waiting for review (link from the Approvals inbox).
function VerificationTab({ permissions, onCounts, initialView = "doctors" }) {
    const { showSnackbar } = useSnackbar();
    const [view, setView] = useState(initialView === "proofs" ? "proofs" : "doctors");
    const [status, setStatus] = useState("PENDING");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [verifying, setVerifying] = useState(null);
    const [reviewing, setReviewing] = useState(null);
    const [jointVisit, setJointVisit] = useState(null);
    const [extending, setExtending] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getVerificationOverview(status === "ALL" ? null : status);
            setData(response);
            onCounts?.(response.summary);
        } catch (err) {
            setError(errorMessage(err, "Failed to load verification"));
        } finally {
            setLoading(false);
        }
    }, [status, onCounts]);

    useEffect(() => {
        load();
    }, [load]);

    const confirm = async (remarks) => {
        setBusy(true);
        try {
            const response = await confirmJointVisit(jointVisit.DoctorId, remarks);
            showSnackbar(response?.message || "Verified", "success");
            setJointVisit(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to verify"), "error");
        } finally {
            setBusy(false);
        }
    };

    const isManager = permissions.has("doctorrequests.approve");
    const doctors = data?.doctors || [];
    const proofs = data?.verifications || [];

    if (error) return <LoadError title="Couldn't load verification" message={error} onRetry={load} />;

    return (
        <Box sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}>
            <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                <SegmentedControl
                    value={view}
                    onChange={setView}
                    options={[
                        { value: "doctors", label: `Provisional doctors · ${doctors.length}` },
                        { value: "proofs", label: `Proofs${data?.summary.toReview ? ` · ${data.summary.toReview} to review` : ""}` },
                    ]}
                />
                {view === "proofs" && (
                    <SegmentedControl
                        value={status}
                        onChange={setStatus}
                        options={[
                            { value: "PENDING", label: "Pending" },
                            { value: "ALL", label: "All" },
                        ]}
                    />
                )}
            </Stack>

            {view === "doctors" ? (
                doctors.length ? (
                    <Stack divider={<Divider />}>
                        {doctors.map((doctor) => {
                            const deadline = deadlineLabel(doctor.DaysLeft);
                            return (
                                <Stack key={doctor.DoctorId} direction={{ xs: "column", md: "row" }} sx={{ py: 1.5, gap: 1.5, alignItems: { md: "center" } }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                                            <Typography variant="subtitle2">Dr. {String(doctor.DoctorName).replace(/^dr\.?\s*/i, "")}</Typography>
                                            <Tag label={deadline.label} color={deadline.color} />
                                            {doctor.PendingMethod && <Tag label={`${VERIFY_METHOD[doctor.PendingMethod].label} sent`} color="info" />}
                                        </Stack>
                                        <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {[doctor.Speciality, doctor.AreaName, doctor.AssignedTo ? `assigned to ${doctor.AssignedTo}` : "not assigned", `verify by ${formatDate(doctor.VerificationDueOn)}`].filter(Boolean).join(" · ")}
                                        </Typography>
                                        {doctor.LastRejection && !doctor.PendingMethod && (
                                            <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.error.main })}>
                                                Last proof rejected: {doctor.LastRejection}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Stack direction="row" sx={{ gap: 1, flexShrink: 0 }}>
                                        {data.canExtend && (
                                            <Button size="small" onClick={() => setExtending(doctor)}>
                                                Extend
                                            </Button>
                                        )}
                                        {isManager && !doctor.IsMine && (
                                            <Button size="small" variant="outlined" startIcon={<GroupsRounded />} onClick={() => setJointVisit(doctor)}>
                                                Verified on joint visit
                                            </Button>
                                        )}
                                        {doctor.IsMine && !doctor.PendingMethod && (
                                            <Button size="small" variant="contained" startIcon={<VerifiedRounded />} onClick={() => setVerifying(doctor)}>
                                                Verify
                                            </Button>
                                        )}
                                    </Stack>
                                </Stack>
                            );
                        })}
                    </Stack>
                ) : (
                    <EmptyState icon={VerifiedRounded} title={loading ? "Loading…" : "All doctors verified"} message={loading ? "" : "No provisional doctors in your team."} />
                )
            ) : proofs.length ? (
                <Stack divider={<Divider />}>
                    {proofs.map((proof) => (
                        <Stack key={proof.VerificationId} direction={{ xs: "column", md: "row" }} sx={{ py: 1.5, gap: 1.5, alignItems: { md: "center" } }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                                    <Typography variant="subtitle2">Dr. {String(proof.DoctorName).replace(/^dr\.?\s*/i, "")}</Typography>
                                    <Tag label={VERIFY_METHOD[proof.Method].label} color={VERIFY_METHOD[proof.Method].color} />
                                    <Tag label={VERIFY_STATUS[proof.Status].label} color={VERIFY_STATUS[proof.Status].color} />
                                </Stack>
                                <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    {[proof.Value, `by ${proof.SubmittedByName}`, formatDate(proof.SubmittedOn), proof.ApproverName ? `manager ${proof.ApproverName}` : "manager: admin"].filter(Boolean).join(" · ")}
                                </Typography>
                            </Box>
                            <Button size="small" variant={proof.canReview ? "contained" : "outlined"} onClick={() => setReviewing(proof.VerificationId)} sx={{ flexShrink: 0 }}>
                                {proof.canReview ? "Review" : "Open"}
                            </Button>
                        </Stack>
                    ))}
                </Stack>
            ) : (
                <EmptyState icon={VerifiedRounded} title={loading ? "Loading…" : "No proofs"} message={loading ? "" : "Proofs sent by your team appear here."} />
            )}

            {verifying && (
                <VerifyDialog
                    doctor={verifying}
                    onClose={() => setVerifying(null)}
                    onSaved={() => {
                        setVerifying(null);
                        load();
                    }}
                />
            )}
            {reviewing && (
                <VerificationReviewDialog
                    verificationId={reviewing}
                    onClose={() => setReviewing(null)}
                    onChanged={() => {
                        setReviewing(null);
                        load();
                    }}
                />
            )}
            {extending && (
                <ExtendDialog
                    doctor={extending}
                    onClose={() => setExtending(null)}
                    onSaved={() => {
                        setExtending(null);
                        load();
                    }}
                />
            )}
            {jointVisit && (
                <ConfirmActionDialog
                    icon={GroupsRounded}
                    color="success"
                    title={`Verify Dr. ${jointVisit.DoctorName} from your visit?`}
                    message="Allowed only if you visited this doctor yourself, or as joint work, in the last 30 days. The visit is linked to the verification."
                    confirmLabel="Mark verified"
                    remarks="optional"
                    remarksLabel="What did you confirm? (optional)"
                    remarksLimit={500}
                    busy={busy}
                    onClose={() => setJointVisit(null)}
                    onConfirm={confirm}
                />
            )}
        </Box>
    );
}

export default VerificationTab;
