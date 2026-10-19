import { useCallback, useEffect, useState } from "react";

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { BlockRounded, CloseRounded, CreditScoreRounded, DoneAllRounded, ImageRounded, PaymentsRounded, RemoveCircleOutlineRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../components/ConfirmActionDialog/ConfirmActionDialog";
import { DetailSection } from "../../components/DetailSection/DetailSection";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { BUCKETS, LEDGER_LABEL, PAYMENT_MODES, adjustDues, confirmDeposit, dayLabel, deliveryReceiptUrl, errorMessage, getChemistLedger, paymentReceiptUrl, rupees, setCreditLimit, voidDelivery, voidLedgerEntry } from "./index";

const muted = (theme) => ({ color: theme.palette.text.secondary });
const modeLabel = (mode) => PAYMENT_MODES.find((m) => m.value === mode)?.label || mode;

function Bucket({ label, value, color }) {
    return (
        <Box sx={(theme) => ({ p: 1.25, borderRadius: theme.calendar.cell.radius, backgroundColor: theme.palette.surface.subtle, minWidth: 0 })}>
            <Typography variant="caption" component="p" sx={muted}>
                {label}
            </Typography>
            <Typography variant="subtitle1" component="p" sx={(theme) => ({ color: value > 0 ? theme.palette[color].main : theme.palette.text.primary })}>
                {rupees(value)}
            </Typography>
        </Box>
    );
}

function ReceiptDialog({ url, onClose }) {
    return (
        <Dialog open={Boolean(url)} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Receipt photo</DialogTitle>
            <DialogContent dividers>{url && <Box component="img" src={url} alt="Receipt" sx={(theme) => ({ width: "100%", borderRadius: theme.calendar.cell.radius })} />}</DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

// Head office: credit limit, or close dues (write-off / adjustment).
function AmountDialog({ kind, onClose, onSave, busy }) {
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("WRITE_OFF");
    const [reason, setReason] = useState("");
    const isLimit = kind === "limit";
    const ready = amount !== "" && Number(amount) >= 0 && (isLimit || (Number(amount) !== 0 && reason.trim().length >= 10));
    return (
        <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
            <DialogTitle>{isLimit ? "Set credit limit" : "Close or correct dues"}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    {!isLimit && (
                        <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
                            <MenuItem value="WRITE_OFF">Write-off (reduces dues)</MenuItem>
                            <MenuItem value="ADJUSTMENT">Adjustment (+ adds, − reduces)</MenuItem>
                        </TextField>
                    )}
                    <TextField type="number" label={isLimit ? "Credit limit (Rs)" : "Amount (Rs)"} value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <TextField label={isLimit ? "Reason (optional)" : "Reason (audit log, at least 10 characters)"} value={reason} onChange={(e) => setReason(e.target.value.slice(0, 300))} multiline minRows={2} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>
                    Cancel
                </Button>
                <Button variant="contained" disabled={!ready || busy} onClick={() => onSave({ amount: Number(amount), type, reason })}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// One chemist's ledger in the company's name: deliveries, payments, balance, age of dues.
function ChemistLedgerDrawer({ pharmacyId, onClose, onChanged, onCollect, canCollect }) {
    const { showSnackbar } = useSnackbar();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [dialog, setDialog] = useState(null);
    const [voiding, setVoiding] = useState(null);
    const [receipt, setReceipt] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        if (!pharmacyId) return;
        setError("");
        getChemistLedger(pharmacyId)
            .then(setData)
            .catch((err) => setError(errorMessage(err, "Couldn't load the ledger")));
    }, [pharmacyId]);

    useEffect(() => {
        setData(null);
        load();
    }, [load]);

    const act = async (work) => {
        setBusy(true);
        try {
            showSnackbar((await work()).message, "success");
            setDialog(null);
            setVoiding(null);
            load();
            onChanged();
        } catch (err) {
            showSnackbar(errorMessage(err, "That didn't work"), "error");
        } finally {
            setBusy(false);
        }
    };

    const showReceipt = async (loader) => {
        try {
            setReceipt(await loader());
        } catch (err) {
            showSnackbar(errorMessage(err, "Couldn't load the photo"), "error");
        }
    };

    const ho = data?.headOffice;

    return (
        <Drawer anchor="right" open={Boolean(pharmacyId)} onClose={onClose} slotProps={{ paper: { sx: (theme) => ({ width: theme.drawer.width, backgroundColor: theme.palette.background.paper }) } }}>
            <Stack direction="row" sx={(theme) => ({ gap: 2, px: theme.drawer.paddingX, py: theme.drawer.paddingY, alignItems: "flex-start" })}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        Chemist ledger
                    </Typography>
                    <Typography variant="h4" component="h2">
                        {data?.pharmacy.PharmacyName || (error ? "Unavailable" : "Loading…")}
                    </Typography>
                    {data && (
                        <Typography variant="body2" sx={muted}>
                            Owes {rupees(data.balance)} · {data.limit != null ? `credit limit ${rupees(data.limit)}` : "no credit limit set"}
                        </Typography>
                    )}
                </Box>
                <IconButton aria-label="Close" onClick={onClose}>
                    <CloseRounded />
                </IconButton>
            </Stack>
            <Divider />

            <Stack sx={(theme) => ({ px: theme.drawer.paddingX, py: theme.drawer.paddingY, gap: theme.drawer.sectionGap, overflowY: "auto" })}>
                {error && <Alert severity="error">{error}</Alert>}
                {data && (
                    <>
                        {data.blocked && (
                            <Alert severity="error" variant="outlined">
                                New deliveries and POBs are on hold: {data.reasons.join("; ")}.
                            </Alert>
                        )}

                        <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: theme.spacing(1) })}>
                            {BUCKETS.map((b) => (
                                <Bucket key={b.key} label={b.label} value={data.buckets[b.key]} color={b.color} />
                            ))}
                        </Box>

                        <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                            {canCollect && data.balance > 0 && (
                                <Button variant="contained" startIcon={<PaymentsRounded />} onClick={() => onCollect(pharmacyId)}>
                                    Record payment
                                </Button>
                            )}
                            {ho && (
                                <>
                                    <Button variant="outlined" startIcon={<CreditScoreRounded />} onClick={() => setDialog("limit")}>
                                        Credit limit
                                    </Button>
                                    <Button variant="outlined" color="warning" startIcon={<RemoveCircleOutlineRounded />} onClick={() => setDialog("adjust")}>
                                        Close / correct dues
                                    </Button>
                                </>
                            )}
                        </Stack>

                        <DetailSection title="Ledger">
                            <Typography variant="caption" component="p" sx={(theme) => ({ ...muted(theme), mb: 1 })}>
                                Deliveries add to the dues; payments and write-offs reduce them. The oldest dues are paid first.
                            </Typography>
                            {data.entries.length ? (
                                <Stack divider={<Divider />}>
                                    {data.entries.map((e) => {
                                        const kind = LEDGER_LABEL[e.EntryType] || { label: e.EntryType, color: "secondary" };
                                        const pay = e.EntryType === "PAYMENT";
                                        return (
                                            <Stack key={e.EntryId} sx={{ py: 1, gap: 0.5 }}>
                                                <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
                                                    <Tag label={kind.label} color={kind.color} />
                                                    <Typography variant="subtitle2" sx={(theme) => ({ flex: 1, textDecoration: e.VoidedOn ? "line-through" : "none", color: e.VoidedOn ? theme.palette.text.disabled : theme.palette.text.primary })}>
                                                        {Number(e.Amount) > 0 ? "+" : "−"}
                                                        {rupees(Math.abs(e.Amount))}
                                                    </Typography>
                                                    {pay && !e.VoidedOn && <Tag label={e.DepositStatus === "DEPOSITED" ? "Received by company" : e.PaymentMode === "CASH" || e.PaymentMode === "CHEQUE" ? "With MR" : "Awaiting confirmation"} color={e.DepositStatus === "DEPOSITED" ? "success" : "warning"} />}
                                                    {e.VoidedOn && <Tag label="Voided" color="secondary" title={e.VoidReason} />}
                                                </Stack>
                                                <Typography variant="caption" sx={muted}>
                                                    {dayLabel(e.EntryDate)}
                                                    {e.DeliveryNumber ? ` · ${e.DeliveryNumber}` : ""}
                                                    {pay ? ` · ${modeLabel(e.PaymentMode)}${e.PaymentRef ? ` ${e.PaymentRef}` : ""}` : ""}
                                                    {e.UserName ? ` · ${e.UserName}` : " · head office"}
                                                    {e.Remarks ? ` · ${e.Remarks}` : ""}
                                                </Typography>
                                                <Stack direction="row" sx={{ gap: 0.5, flexWrap: "wrap" }}>
                                                    {e.HasReceipt === 1 && (
                                                        <Button size="small" startIcon={<ImageRounded />} onClick={() => showReceipt(() => paymentReceiptUrl(e.EntryId))}>
                                                            Receipt
                                                        </Button>
                                                    )}
                                                    {e.DeliveryId && (
                                                        <Button size="small" startIcon={<ImageRounded />} onClick={() => showReceipt(() => deliveryReceiptUrl(e.DeliveryId))}>
                                                            Stamped receipt
                                                        </Button>
                                                    )}
                                                    {ho && pay && !e.VoidedOn && e.DepositStatus === "WITH_MR" && (
                                                        <Button size="small" color="success" startIcon={<DoneAllRounded />} disabled={busy} onClick={() => act(() => confirmDeposit(e.EntryId))}>
                                                            Mark received
                                                        </Button>
                                                    )}
                                                    {ho && !e.VoidedOn && (
                                                        <Button size="small" color="error" startIcon={<BlockRounded />} onClick={() => setVoiding(e)}>
                                                            {e.DeliveryId ? "Void delivery" : "Void"}
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        );
                                    })}
                                </Stack>
                            ) : (
                                <Typography variant="body2" sx={muted}>
                                    Nothing recorded for this chemist yet.
                                </Typography>
                            )}
                        </DetailSection>
                    </>
                )}
            </Stack>

            {dialog && (
                <AmountDialog
                    kind={dialog}
                    busy={busy}
                    onClose={() => setDialog(null)}
                    onSave={({ amount, type, reason }) =>
                        act(() => (dialog === "limit" ? setCreditLimit(pharmacyId, amount, reason) : adjustDues(pharmacyId, { Type: type, Amount: amount, Reason: reason })))
                    }
                />
            )}
            {voiding && (
                <ConfirmActionDialog
                    icon={BlockRounded}
                    color="error"
                    title={voiding.DeliveryId ? `Void delivery ${voiding.DeliveryNumber}?` : "Void this entry?"}
                    message={voiding.DeliveryId ? "The stock goes back to the MR's balance and the due is removed. It stays on record." : `${rupees(Math.abs(voiding.Amount))} stays on record but no longer counts.`}
                    confirmLabel="Void"
                    remarks="required"
                    remarksLabel="Why? (saved in the audit log)"
                    remarksLimit={300}
                    busy={busy}
                    onClose={() => setVoiding(null)}
                    onConfirm={(reason) => act(() => (voiding.DeliveryId ? voidDelivery(voiding.DeliveryId, reason) : voidLedgerEntry(voiding.EntryId, reason)))}
                />
            )}
            <ReceiptDialog
                url={receipt}
                onClose={() => {
                    URL.revokeObjectURL(receipt);
                    setReceipt(null);
                }}
            />
        </Drawer>
    );
}

export default ChemistLedgerDrawer;
