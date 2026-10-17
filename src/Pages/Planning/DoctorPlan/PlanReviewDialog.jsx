import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { CheckCircleRounded, CloseRounded, UndoRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import StatusChip from "../../../components/StatusChip/StatusChip";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import { PLAN_STATUS, errorMessage, formatMonthLabel, formatUnits, getDoctorPlanById, reviewDoctorPlan } from "../index";

// A team member's submitted doctor plan, for the reporting manager to approve or return.
function PlanReviewDialog({ planId, onClose, onReviewed }) {
    const { showSnackbar } = useSnackbar();

    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [outcome, setOutcome] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getDoctorPlanById(planId)
            .then(setData)
            .catch((err) => setError(errorMessage(err, "Couldn't load the plan")));
    }, [planId]);

    const handleReview = async (remarks) => {
        setSaving(true);

        try {
            const response = await reviewDoctorPlan(planId, outcome, remarks);
            showSnackbar(response?.message || "Plan reviewed", "success");
            onReviewed();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to review the plan"), "error");
            setOutcome(null);
        } finally {
            setSaving(false);
        }
    };

    const plan = data?.plan;
    const status = plan ? PLAN_STATUS[plan.Status] : null;

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
                        Review · {plan ? formatMonthLabel(plan.PlanMonth) : "Loading…"}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {plan ? `${plan.UserName}'s doctor plan` : "Doctor plan"}
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
                            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                {data.summary.planned} doctor(s) · {formatUnits(data.summary.plannedVisits)} visits · {formatUnits(data.summary.plannedUnits)} Rx units planned
                            </Typography>
                            <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Doctor</TableCell>
                                            <TableCell align="right">Visits</TableCell>
                                            <TableCell>Rx units planned</TableCell>
                                            <TableCell>Support</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.doctors.map((doctor) => (
                                            <TableRow key={doctor.DoctorId} hover>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                        <Typography variant="subtitle2">Dr. {doctor.DoctorName}</Typography>
                                                        <CategoryBadge category={doctor.Category} />
                                                    </Stack>
                                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                        {doctor.Speciality || "—"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {doctor.plannedVisits}
                                                    {doctor.VisitsPerMonth ? (
                                                        <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                            norm {doctor.VisitsPerMonth}
                                                        </Typography>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" sx={{ gap: 0.5, flexWrap: "wrap" }}>
                                                        {doctor.products.filter((item) => item.plannedUnits > 0).map((item) => (
                                                            <Tag key={item.ProductId} label={`${item.ProductName} ${formatUnits(item.plannedUnits)}`} color="primary" />
                                                        ))}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary, maxWidth: theme.table.textMaxWidth })}>
                                                        {doctor.support || "—"}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
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
                    title={outcome === "APPROVED" ? "Approve this plan?" : "Return for changes?"}
                    message={`${plan.UserName} · ${formatMonthLabel(plan.PlanMonth)}`}
                    confirmLabel={outcome === "APPROVED" ? "Approve" : "Return"}
                    remarks={outcome === "APPROVED" ? "optional" : "required"}
                    remarksLabel={outcome === "APPROVED" ? "Comment (optional)" : "What needs to change"}
                    remarksLimit={500}
                    busy={saving}
                    onClose={() => setOutcome(null)}
                    onConfirm={handleReview}
                />
            )}
        </Dialog>
    );
}

export default PlanReviewDialog;
