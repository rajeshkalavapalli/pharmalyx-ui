import { useEffect, useState } from "react";

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import { CheckCircleRounded, CloseRounded, UndoRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import StatusChip from "../../../components/StatusChip/StatusChip";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { STATEMENT_STATUS, errorMessage, formatAmount, formatMonthLabel, formatUnits, getStatementById, reviewStatement } from "../index";
import StatementTable from "./StatementTable";

// A team member's submitted statement, for the reporting manager to approve or return.
function ReviewDialog({ statementId, onClose, onReviewed }) {
    const { showSnackbar } = useSnackbar();

    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [outcome, setOutcome] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getStatementById(statementId)
            .then(setData)
            .catch((err) => setError(errorMessage(err, "Couldn't load the statement")));
    }, [statementId]);

    const handleReview = async (remarks) => {
        setSaving(true);

        try {
            const response = await reviewStatement(statementId, outcome, remarks);
            showSnackbar(response?.message || "Statement reviewed", "success");
            onReviewed();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to review the statement"), "error");
            setOutcome(null);
        } finally {
            setSaving(false);
        }
    };

    const statement = data?.statement;
    const status = statement ? STATEMENT_STATUS[statement.Status] : null;

    return (
        <Dialog
            open
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="lg"
            slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}
        >
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2, alignItems: "flex-start" })}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        Review · {statement ? `${statement.UserName} · ${formatMonthLabel(statement.StatementMonth)}` : "Loading…"}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {statement?.StockistName || "Stockist statement"}
                    </Typography>
                </Box>
                {status && <StatusChip label={status.label} color={status.color} />}
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
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
                        <Stack spacing={2}>
                            <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, auto))", gap: theme.stat.gap, justifyContent: "start" })}>
                                {[
                                    ["Units sold", formatUnits(statement.TotalSalesQty)],
                                    ["Sales value", formatAmount(statement.SalesValue)],
                                    ["Closing stock value", formatAmount(statement.ClosingValue)],
                                ].map(([label, value]) => (
                                    <Box key={label}>
                                        <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {label}
                                        </Typography>
                                        <Typography variant="subtitle1">{value}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            <StatementTable rows={data.lines} />

                            {statement.Remarks && (
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    MR's remarks: {statement.Remarks}
                                </Typography>
                            )}
                        </Stack>
                    )
                )}
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Close
                </Button>
                {data?.canReview && (
                    <>
                        <Button variant="outlined" color="error" startIcon={<UndoRounded />} onClick={() => setOutcome("RETURNED")}>
                            Return
                        </Button>
                        <Button variant="contained" color="success" startIcon={<CheckCircleRounded />} onClick={() => setOutcome("APPROVED")}>
                            Approve
                        </Button>
                    </>
                )}
            </DialogActions>

            {outcome && (
                <ConfirmActionDialog
                    icon={outcome === "APPROVED" ? CheckCircleRounded : UndoRounded}
                    color={outcome === "APPROVED" ? "success" : "error"}
                    title={outcome === "APPROVED" ? "Approve this statement?" : "Return for correction?"}
                    message={`${statement.StockistName} · ${formatMonthLabel(statement.StatementMonth)} · ${statement.UserName}`}
                    confirmLabel={outcome === "APPROVED" ? "Approve" : "Return"}
                    remarks={outcome === "APPROVED" ? "optional" : "required"}
                    remarksLabel={outcome === "APPROVED" ? "Comment (optional)" : "What needs to be corrected"}
                    remarksLimit={500}
                    busy={saving}
                    onClose={() => setOutcome(null)}
                    onConfirm={handleReview}
                />
            )}
        </Dialog>
    );
}

export default ReviewDialog;
