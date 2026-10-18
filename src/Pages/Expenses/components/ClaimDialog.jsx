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
    TextField,
    Typography,
} from "@mui/material";
import { CheckCircleRounded, CloseRounded, CurrencyRupeeRounded, UndoRounded, VerifiedRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import { DetailSection } from "../../../components/DetailSection/DetailSection";
import StatusChip from "../../../components/StatusChip/StatusChip";
import Timeline from "../../../components/Timeline/Timeline";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import {
    CLAIM_STATUS,
    STATIONS,
    TRAVEL_LABEL,
    claimSteps,
    errorMessage,
    finalApprove,
    formatAmount,
    formatDate,
    formatMonthLabel,
    getClaim,
    managerApprove,
    markPaid,
    returnClaim,
} from "../index";

const stationLabel = (value) => STATIONS.find((station) => station.value === value)?.label || value;
const isAmount = (value, max) => value !== "" && /^\d+(\.\d{1,2})?$/.test(String(value)) && Number(value) <= max;
const approvedOf = (approved, claimed) => (approved == null ? claimed : approved);

function AmountInput({ value, max, onChange, label }) {
    return (
        <TextField
            size="small"
            type="number"
            value={value}
            error={!isAmount(value, max)}
            onChange={(event) => onChange(event.target.value)}
            slotProps={{ htmlInput: { min: 0, max, step: 0.5, "aria-label": label } }}
            sx={(theme) => ({ width: theme.engagement.quantityColumn, "& input": { textAlign: "right" } })}
        />
    );
}

function Total({ label, value }) {
    return (
        <Box>
            <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                {label}
            </Typography>
            <Typography variant="subtitle1">{value}</Typography>
        </Box>
    );
}

// One claim in full. The manager can reduce amounts and approve or return; finance approves, returns or marks paid.
function ClaimDialog({ claimId, onClose, onDone }) {
    const { showSnackbar } = useSnackbar();

    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [itemEdits, setItemEdits] = useState({});
    const [action, setAction] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getClaim(claimId)
            .then((response) => {
                setData(response);
                setItemEdits(Object.fromEntries(response.items.map((item) => [item.ItemId, String(item.Amount)])));
            })
            .catch((err) => setError(errorMessage(err, "Couldn't load the claim")));
    }, [claimId]);

    const reviewing = Boolean(data?.actions?.managerReview);
    const claim = data?.claim;
    const status = claim ? CLAIM_STATUS[claim.Status] : null;

    // TA / DA are calculated from verified work: managers approve them as they are; other expenses can be reduced.
    const invalid = reviewing && data.items.some((item) => !isAmount(itemEdits[item.ItemId], item.Amount));

    const approvedTotal = reviewing
        ? (data.days.reduce((sum, day) => sum + Math.round(Number(day.DaAmount || 0) * 100) + Math.round(Number(day.TaAmount || 0) * 100), 0) +
              data.items.reduce((sum, item) => sum + Math.round(Number(itemEdits[item.ItemId] || 0) * 100), 0)) /
          100
        : claim?.ApprovedAmount;

    const reduced = reviewing && claim && Math.round(approvedTotal * 100) < Math.round(claim.ClaimedAmount * 100);

    const run = async (remarks) => {
        setSaving(true);

        try {
            let response;

            if (action === "approve") {
                response = await managerApprove(claimId, {
                    Remarks: remarks || null,
                    Items: data.items.map((item) => ({ ItemId: item.ItemId, ApprovedAmount: Number(itemEdits[item.ItemId]) })),
                });
            } else if (action === "return") {
                response = await returnClaim(claimId, remarks);
            } else if (action === "final") {
                response = await finalApprove(claimId, remarks);
            } else {
                response = await markPaid(claimId, remarks);
            }

            showSnackbar(response?.message || "Claim updated", "success");
            onDone();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to update the claim"), "error");
            setAction(null);
        } finally {
            setSaving(false);
        }
    };

    const confirm = {
        approve: {
            icon: CheckCircleRounded,
            color: "success",
            title: reduced ? "Approve with reduced amounts?" : "Approve this claim?",
            label: "Approve",
            remarks: reduced ? "required" : "optional",
            remarksLabel: reduced ? "Why amounts were reduced" : "Comment (optional)",
        },
        return: { icon: UndoRounded, color: "error", title: "Return for correction?", label: "Return", remarks: "required", remarksLabel: "What needs to be corrected" },
        final: { icon: VerifiedRounded, color: "primary", title: "Approve for payment?", label: "Approve", remarks: "optional", remarksLabel: "Comment (optional)" },
        paid: { icon: CurrencyRupeeRounded, color: "success", title: "Mark as paid?", label: "Mark paid", remarks: "required", remarksLabel: "Payment reference (UTR / cheque / transaction id)" },
    }[action];

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
                        Expense claim · {claim ? formatMonthLabel(claim.ClaimMonth) : "Loading…"}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {claim ? `${claim.UserName}${claim.DesignationName ? ` · ${claim.DesignationName}` : ""}` : "Claim"}
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
                        <Stack sx={(theme) => ({ gap: theme.drawer.sectionGap })}>
                            <Stack direction="row" sx={(theme) => ({ gap: theme.stat.gap, flexWrap: "wrap" })}>
                                <Total label="DA" value={formatAmount(claim.DaTotal)} />
                                <Total label="TA" value={formatAmount(claim.TaTotal)} />
                                <Total label="Other" value={formatAmount(claim.OtherTotal)} />
                                <Total label="Claimed" value={formatAmount(claim.ClaimedAmount)} />
                                {approvedTotal != null && <Total label={reviewing ? "Approving" : "Approved"} value={formatAmount(approvedTotal)} />}
                            </Stack>

                            {reviewing && (
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    You can reduce any amount before approving (not increase it). A reduction needs a reason.
                                </Typography>
                            )}

                            <DetailSection title={`Daily allowance & travel · ${data.days.length} day(s)`}>
                                {data.days.length ? (
                                    <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Station</TableCell>
                                                    <TableCell>Travel</TableCell>
                                                    <TableCell align="right">DA</TableCell>
                                                    <TableCell align="right">TA</TableCell>
                                                    {!reviewing && claim.ApprovedAmount != null && <TableCell align="right">Approved</TableCell>}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.days.map((day) => (
                                                    <TableRow key={day.DayId} hover>
                                                        <TableCell>
                                                            {formatDate(day.ExpenseDate)}
                                                            {day.Remarks && (
                                                                <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                    {day.Remarks}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{stationLabel(day.StationType)}</TableCell>
                                                        <TableCell>
                                                            {TRAVEL_LABEL[day.TravelMode] || day.TravelMode} · {day.DistanceKm} km
                                                            {day.ValidVisits != null && (
                                                                <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                    GPS distance · {day.ValidVisits} valid visit(s){day.DaEligible === false ? " · no DA" : ""}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatAmount(day.DaAmount)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatAmount(day.TaAmount)}
                                                        </TableCell>
                                                        {!reviewing && claim.ApprovedAmount != null && (
                                                            <TableCell align="right">{formatAmount(approvedOf(day.ApprovedDa, day.DaAmount) + approvedOf(day.ApprovedTa, day.TaAmount))}</TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        No DCR days in this claim.
                                    </Typography>
                                )}
                            </DetailSection>

                            <DetailSection title={`Other expenses · ${data.items.length}`}>
                                {data.items.length ? (
                                    <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Expense</TableCell>
                                                    <TableCell>Bill</TableCell>
                                                    <TableCell align="right">Amount</TableCell>
                                                    {!reviewing && claim.ApprovedAmount != null && <TableCell align="right">Approved</TableCell>}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.items.map((item) => (
                                                    <TableRow key={item.ItemId} hover>
                                                        <TableCell>{formatDate(item.ExpenseDate)}</TableCell>
                                                        <TableCell>
                                                            <Typography variant="subtitle2">{item.TypeLabel}</Typography>
                                                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                {item.Description}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>{[item.BillNumber, item.Vendor].filter(Boolean).join(" · ") || "—"}</TableCell>
                                                        <TableCell align="right">
                                                            {reviewing ? (
                                                                <AmountInput
                                                                    value={itemEdits[item.ItemId] ?? ""}
                                                                    max={item.Amount}
                                                                    label={`${item.Description} approved amount`}
                                                                    onChange={(value) => setItemEdits((current) => ({ ...current, [item.ItemId]: value }))}
                                                                />
                                                            ) : (
                                                                formatAmount(item.Amount)
                                                            )}
                                                        </TableCell>
                                                        {!reviewing && claim.ApprovedAmount != null && <TableCell align="right">{formatAmount(approvedOf(item.ApprovedAmount, item.Amount))}</TableCell>}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        No other expenses.
                                    </Typography>
                                )}
                            </DetailSection>

                            {claimSteps(claim).length > 0 && (
                                <DetailSection title="Progress">
                                    <Timeline steps={claimSteps(claim)} />
                                </DetailSection>
                            )}
                        </Stack>
                    )
                )}
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Close
                </Button>
                {(data?.actions?.managerReview || data?.actions?.finalApprove) && (
                    <Button variant="outlined" color="error" startIcon={<UndoRounded />} onClick={() => setAction("return")}>
                        Return
                    </Button>
                )}
                {data?.actions?.managerReview && (
                    <Button variant="contained" color="success" startIcon={<CheckCircleRounded />} disabled={invalid} onClick={() => setAction("approve")}>
                        Approve {formatAmount(approvedTotal)}
                    </Button>
                )}
                {data?.actions?.finalApprove && (
                    <Button variant="contained" startIcon={<VerifiedRounded />} onClick={() => setAction("final")}>
                        Approve for payment
                    </Button>
                )}
                {data?.actions?.markPaid && (
                    <Button variant="contained" color="success" startIcon={<CurrencyRupeeRounded />} onClick={() => setAction("paid")}>
                        Mark paid
                    </Button>
                )}
            </DialogActions>

            {confirm && (
                <ConfirmActionDialog
                    icon={confirm.icon}
                    color={confirm.color}
                    title={confirm.title}
                    message={`${claim.UserName} · ${formatMonthLabel(claim.ClaimMonth)} · ${formatAmount(action === "approve" ? approvedTotal : claim.ApprovedAmount ?? claim.ClaimedAmount)}`}
                    confirmLabel={confirm.label}
                    remarks={confirm.remarks}
                    remarksLabel={confirm.remarksLabel}
                    remarksLimit={action === "paid" ? 100 : 500}
                    busy={saving}
                    onClose={() => setAction(null)}
                    onConfirm={run}
                />
            )}
        </Dialog>
    );
}

export default ClaimDialog;
