import { useCallback, useEffect, useState } from "react";

import { Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AssignmentReturnRounded, Inventory2Rounded, MoveToInboxRounded, WarningAmberRounded } from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import Panel from "../../components/Panel/Panel";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { dayLabel, errorMessage, getBatches, getHoldings, getProducts, getStock, issueStock, returnStock, rupees, todayKey } from "./index";

const muted = (theme) => ({ color: theme.palette.text.secondary });

// Issue saleable stock to an MR, or record stock the MR handed back.
function MoveDialog({ mode, users, limit, onClose, onSaved }) {
    const isIssue = mode === "issue";
    const { showSnackbar } = useSnackbar();
    const [form, setForm] = useState({ UserId: "", ProductId: "", BatchId: "", Quantity: "", Value: "", EntryDate: todayKey(), Remarks: "" });
    const [products, setProducts] = useState([]);
    const [batches, setBatches] = useState([]);
    const [held, setHeld] = useState(null);
    const [busy, setBusy] = useState(false);
    const set = (patch) => setForm((current) => ({ ...current, ...patch }));

    useEffect(() => {
        if (isIssue) getProducts().then((r) => setProducts(r.products || [])).catch(() => {});
    }, [isIssue]);

    useEffect(() => {
        if (isIssue && form.ProductId) getBatches(form.ProductId).then((r) => setBatches(r.batches || [])).catch(() => setBatches([]));
    }, [isIssue, form.ProductId]);

    useEffect(() => {
        if (!form.UserId) return;
        getStock(form.UserId).then(setHeld).catch(() => setHeld(null));
    }, [form.UserId]);

    const inHand = held?.balances.filter((b) => b.Quantity > 0) || [];
    const after = (held?.totals.balanceValue || 0) + (Number(form.Value) || 0);
    const over = isIssue && held && after > limit;
    const ready = form.UserId && form.BatchId && Number(form.Quantity) > 0 && (!isIssue || (Number(form.Value) > 0 && !over));

    const save = async () => {
        setBusy(true);
        try {
            const payload = { ...form, Quantity: Number(form.Quantity), Value: Number(form.Value) || undefined };
            const result = isIssue ? await issueStock(payload) : await returnStock(payload);
            onSaved(result.message);
        } catch (err) {
            showSnackbar(errorMessage(err, "Could not save"), "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isIssue ? "Issue saleable stock to an MR" : "Stock returned to the company"}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField select label="MR" value={form.UserId} onChange={(e) => set({ UserId: e.target.value, BatchId: "" })}>
                        {users.map((u) => (
                            <MenuItem key={u.UserId} value={u.UserId}>
                                {u.Name}
                            </MenuItem>
                        ))}
                    </TextField>
                    {held && (
                        <Typography variant="caption" sx={muted}>
                            Holds {rupees(held.totals.balanceValue)} now · limit {rupees(limit)}
                        </Typography>
                    )}
                    {isIssue ? (
                        <>
                            <TextField select label="Product" value={form.ProductId} onChange={(e) => set({ ProductId: e.target.value, BatchId: "" })}>
                                {products.map((p) => (
                                    <MenuItem key={p.ProductId} value={p.ProductId}>
                                        {p.ProductName}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField select label="Batch" value={form.BatchId} onChange={(e) => set({ BatchId: e.target.value })} disabled={!form.ProductId} helperText={form.ProductId && !batches.length ? "Add the batch under Business data → Batches" : " "}>
                                {batches.map((b) => (
                                    <MenuItem key={b.BatchId} value={b.BatchId}>
                                        {b.BatchNumber} · exp {dayLabel(b.ExpiryDate)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </>
                    ) : (
                        <TextField select label="Batch in the MR's hands" value={form.BatchId} onChange={(e) => set({ BatchId: e.target.value })} disabled={!form.UserId}>
                            {inHand.map((b) => (
                                <MenuItem key={b.BatchId} value={b.BatchId}>
                                    {b.ProductName} · {b.BatchNumber} · {b.Quantity} in hand
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                    <Stack direction="row" sx={{ gap: 2 }}>
                        <TextField type="number" label="Quantity" value={form.Quantity} onChange={(e) => set({ Quantity: e.target.value })} sx={{ flex: 1 }} />
                        {isIssue && <TextField type="number" label="Value (Rs)" value={form.Value} onChange={(e) => set({ Value: e.target.value })} sx={{ flex: 1 }} />}
                        <TextField type="date" label="Date" value={form.EntryDate} onChange={(e) => set({ EntryDate: e.target.value })} slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: todayKey() } }} sx={{ flex: 1 }} />
                    </Stack>
                    {over && <Alert severity="error">This would take the MR to {rupees(after)}, over the limit of {rupees(limit)}.</Alert>}
                    <TextField label="Remarks (optional)" value={form.Remarks} onChange={(e) => set({ Remarks: e.target.value.slice(0, 300) })} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>
                    Cancel
                </Button>
                <Button variant="contained" disabled={!ready || busy} onClick={save}>
                    {isIssue ? "Issue stock" : "Record return"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// Head office: saleable stock with every MR, the limit, and stock held too long.
function HoldingsTab({ onChanged }) {
    const { showSnackbar } = useSnackbar();
    const [data, setData] = useState(null);
    const [mode, setMode] = useState(null);

    const load = useCallback(() => {
        getHoldings()
            .then(setData)
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load stock with MRs"), "error"));
    }, [showSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    if (!data) return <EmptyState icon={Inventory2Rounded} title="Loading…" />;

    return (
        <Stack spacing={2}>
            <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                <Button variant="contained" startIcon={<MoveToInboxRounded />} onClick={() => setMode("issue")}>
                    Issue stock to an MR
                </Button>
                <Button variant="outlined" startIcon={<AssignmentReturnRounded />} onClick={() => setMode("return")}>
                    Record stock returned
                </Button>
            </Stack>

            {data.heldLong.length > 0 && (
                <Alert severity="warning" variant="outlined" icon={<WarningAmberRounded />}>
                    <AlertTitle>Held longer than {data.holdDays} days (flagged for review)</AlertTitle>
                    {data.heldLong.slice(0, 10).map((lot) => (
                        <Typography key={`${lot.UserId}-${lot.BatchNumber}-${lot.date}`} variant="body2">
                            {lot.UserName}: {lot.quantity} of {lot.ProductName} ({lot.BatchNumber}) since {dayLabel(lot.date)}, {lot.ageDays} days
                        </Typography>
                    ))}
                </Alert>
            )}

            <Panel title="Stock with MRs" subtitle={`Each MR may hold up to ${rupees(data.limit)}; new issues above that are blocked.`}>
                {data.holdings.length ? (
                    <Stack divider={<Divider />}>
                        {data.holdings.map((h) => (
                            <Stack key={h.UserId} direction="row" sx={{ py: 1.25, gap: 1, alignItems: "center" }}>
                                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                                    {h.Name}
                                </Typography>
                                {h.overLimit && <Tag label="Over the limit" color="error" />}
                                <Typography variant="body2" sx={muted}>
                                    {h.Quantity} units
                                </Typography>
                                <Typography variant="subtitle2" sx={(theme) => ({ minWidth: theme.spacing(12), textAlign: "right", fontVariantNumeric: "tabular-nums" })}>
                                    {rupees(h.Value)}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={Inventory2Rounded} title="No MR holds company stock" />
                )}
            </Panel>

            {mode && (
                <MoveDialog
                    mode={mode}
                    users={data.users}
                    limit={data.limit}
                    onClose={() => setMode(null)}
                    onSaved={(message) => {
                        showSnackbar(message, "success");
                        setMode(null);
                        load();
                        onChanged?.();
                    }}
                />
            )}
        </Stack>
    );
}

export default HoldingsTab;
