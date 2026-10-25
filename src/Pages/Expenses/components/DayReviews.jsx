import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Button, Checkbox, Divider, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import { DescriptionRounded, FactCheckRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { adminDecideDay, errorMessage, formatAmount, grantDaLater, managerDecideDay } from "../index";

const dayLabel = (key) => new Date(`${key}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const when = (value) => (value ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

// One held day: what the system noticed, the employee's reason, the manager's comment, and the decision.
function ReviewCard({ review, role, onDone }) {
    const { showSnackbar } = useSnackbar();
    const [comment, setComment] = useState("");
    const [busy, setBusy] = useState(false);
    const [grantDa, setGrantDa] = useState(false); // head office: pay DA although the day is short of the DA rule
    const commentNeeded = role === "manager" || grantDa ? 10 : 0; // manager: always; head office: to refuse or to grant DA

    const decide = async (approve) => {
        if (comment.trim().length < (approve ? commentNeeded : 10)) {
            showSnackbar(approve ? (grantDa ? "Give your reason for granting DA (at least 10 characters)." : "Add a comment (at least 10 characters).") : "Give a reason (at least 10 characters); the employee sees it.", "warning");
            return;
        }
        setBusy(true);
        try {
            const response = role === "manager" ? await managerDecideDay(review.ReviewId, approve, comment.trim()) : await adminDecideDay(review.ReviewId, approve, comment.trim(), approve && grantDa);
            showSnackbar(response?.message || "Saved", "success");
            onDone();
        } catch (err) {
            showSnackbar(errorMessage(err, "Couldn't save the decision"), "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack spacing={1} sx={{ py: 2 }}>
            <Stack direction="row" sx={{ gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="subtitle1">{review.UserName}</Typography>
                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {review.DesignationName ? `${review.DesignationName} · ` : ""}
                    {dayLabel(review.WorkDate)}
                </Typography>
                <Tag label={`${formatAmount(review.Amount)} on hold`} color="warning" />
            </Stack>

            <Box>
                <Typography variant="overline" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    What the system recorded
                </Typography>
                {review.Findings.map((finding) => (
                    <Typography key={finding.code} variant="body2">
                        • {finding.text}
                    </Typography>
                ))}
            </Box>

            <Box>
                <Typography variant="overline" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    Employee's reason
                </Typography>
                <Typography variant="body2">
                    {review.EmployeeReason ? `"${review.EmployeeReason}" (${when(review.EmployeeAt)})` : review.AutoNote || "No reason given."}
                </Typography>
            </Box>

            {role === "admin" && (
                <Box>
                    <Typography variant="overline" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Manager's review
                    </Typography>
                    <Typography variant="body2">
                        {review.ManagerDecision ? `${review.ManagerName}: approved, "${review.ManagerComment}" (${when(review.ManagerAt)})` : review.AutoNote || "—"}
                    </Typography>
                </Box>
            )}

            <TextField
                size="small"
                multiline
                minRows={2}
                label={role === "manager" ? "Your comment (required)" : grantDa ? "Your reason for granting DA (required)" : "Your reason (required to refuse or grant DA)"}
                value={comment}
                onChange={(event) => setComment(event.target.value.slice(0, 500))}
            />
            {role === "admin" && (
                <FormControlLabel
                    control={<Checkbox checked={grantDa} onChange={(event) => setGrantDa(event.target.checked)} />}
                    label="Also grant DA for this day, even with fewer counted visits than the DA rule"
                />
            )}
            <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                <Button variant="contained" color="success" disabled={busy} onClick={() => decide(true)}>
                    {role === "manager" ? "Approve (goes to head office)" : grantDa ? "Payable with DA" : "Payable"}
                </Button>
                <Button variant="outlined" color="error" disabled={busy} onClick={() => decide(false)}>
                    {role === "manager" ? "Reject (not payable)" : "Not payable"}
                </Button>
                {role === "admin" && (
                    <Button startIcon={<DescriptionRounded />} component={RouterLink} to={`/expenses/day-report/${review.ReviewId}`}>
                        Day report
                    </Button>
                )}
            </Stack>
        </Stack>
    );
}

// An approved day without DA: head office can still grant DA, with a reason.
function GrantLaterRow({ review, onDone }) {
    const { showSnackbar } = useSnackbar();
    const [open, setOpen] = useState(false);
    const [comment, setComment] = useState("");
    const [busy, setBusy] = useState(false);

    const grant = async () => {
        setBusy(true);
        try {
            const response = await grantDaLater(review.ReviewId, comment.trim());
            showSnackbar(response?.message || "DA granted", "success");
            onDone();
        } catch (err) {
            showSnackbar(errorMessage(err, "Couldn't grant DA"), "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack spacing={1} sx={{ py: 1.5 }}>
            <Stack direction={{ xs: "column", md: "row" }} sx={{ gap: 1, justifyContent: "space-between", alignItems: { md: "center" } }}>
                <Box>
                    <Typography variant="subtitle2">
                        {review.UserName} · {dayLabel(review.WorkDate)} · no DA (TA {formatAmount(review.TaAmount)})
                    </Typography>
                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Approved by {review.AdminName || "head office"} {review.AdminComment ? `: "${review.AdminComment}"` : ""}
                    </Typography>
                </Box>
                {!open && (
                    <Button size="small" variant="outlined" onClick={() => setOpen(true)} sx={{ whiteSpace: "nowrap", flexShrink: 0, alignSelf: { xs: "flex-start", md: "center" } }}>
                        Grant DA
                    </Button>
                )}
            </Stack>
            {open && (
                <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 1, alignItems: { sm: "center" } }}>
                    <TextField size="small" fullWidth autoFocus placeholder="Reason for granting DA (at least 10 characters)" value={comment} onChange={(event) => setComment(event.target.value.slice(0, 500))} />
                    <Stack direction="row" sx={{ gap: 0.5, flexShrink: 0 }}>
                        <Button size="small" variant="contained" disabled={busy || comment.trim().length < 10} onClick={grant} sx={{ whiteSpace: "nowrap" }}>
                            {busy ? "Saving…" : "Grant DA"}
                        </Button>
                        <Button size="small" disabled={busy} onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            )}
        </Stack>
    );
}

// Manager: days of their team waiting for review. Head office: days approved by a manager, plus
// (read only) recent manager rejections, for awareness.
function DayReviews({ managerQueue, adminQueue, rejections, approvedWithoutDa, onChanged }) {
    const reload = useCallback(() => onChanged?.(), [onChanged]);
    const [showRejections, setShowRejections] = useState(false);

    useEffect(() => setShowRejections(false), [rejections]);

    return (
        <Stack spacing={2}>
            {Array.isArray(managerQueue) && (
                <Panel title="Your team's days on hold" subtitle="Reject = not payable (final). Approve = goes to head office for the final decision. A comment is always needed.">
                    {managerQueue.length ? (
                        <Stack divider={<Divider />}>
                            {managerQueue.map((review) => (
                                <ReviewCard key={review.ReviewId} review={review} role="manager" onDone={reload} />
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState icon={FactCheckRounded} title="Nothing to review" message="Days your team members send for review appear here." />
                    )}
                </Panel>
            )}

            {Array.isArray(adminQueue) && (
                <Panel title="Final decision" subtitle="Approved by the manager. Payable adds it to the claim; not payable needs a reason the employee and manager will see.">
                    {adminQueue.length ? (
                        <Stack divider={<Divider />}>
                            {adminQueue.map((review) => (
                                <ReviewCard key={review.ReviewId} review={review} role="admin" onDone={reload} />
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState icon={FactCheckRounded} title="Nothing waiting" message="Days approved by managers appear here for the final decision." />
                    )}
                </Panel>
            )}

            {Array.isArray(approvedWithoutDa) && approvedWithoutDa.length > 0 && (
                <Panel title="Approved without DA" subtitle="Special case: payable days short of the DA rule (too few counted visits). Grant DA only when the day deserves it; the reason is recorded.">
                    <Stack divider={<Divider />}>
                        {approvedWithoutDa.map((review) => (
                            <GrantLaterRow key={review.ReviewId} review={review} onDone={reload} />
                        ))}
                    </Stack>
                </Panel>
            )}

            {Array.isArray(rejections) && (
                <Panel
                    title="Manager rejections (last 90 days)"
                    subtitle="For awareness only: no action needed."
                    actions={
                        <Button size="small" onClick={() => setShowRejections((value) => !value)}>
                            {showRejections ? "Hide" : `Show ${rejections.length}`}
                        </Button>
                    }
                >
                    {showRejections &&
                        (rejections.length ? (
                            <Stack divider={<Divider />}>
                                {rejections.map((review) => (
                                    <Stack key={review.ReviewId} direction={{ xs: "column", md: "row" }} sx={{ py: 1.25, gap: 1, justifyContent: "space-between" }}>
                                        <Box>
                                            <Typography variant="subtitle2">
                                                {review.UserName} · {dayLabel(review.WorkDate)} · {formatAmount(review.Amount)}
                                            </Typography>
                                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                {review.ManagerName}: "{review.ManagerComment}"
                                            </Typography>
                                        </Box>
                                        <Button size="small" startIcon={<DescriptionRounded />} component={RouterLink} to={`/expenses/day-report/${review.ReviewId}`}>
                                            Day report
                                        </Button>
                                    </Stack>
                                ))}
                            </Stack>
                        ) : (
                            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                No manager rejections.
                            </Typography>
                        ))}
                </Panel>
            )}
        </Stack>
    );
}

export default DayReviews;
