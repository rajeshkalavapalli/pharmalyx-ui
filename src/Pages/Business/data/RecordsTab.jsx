import { useCallback, useEffect, useMemo, useState } from "react";

import { Box, Button, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AddRounded, BlockRounded, LocalShippingRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { RETURN_REASONS, createRecord, dayLabel, errorMessage, getBatches, getRecords, rupees, thisMonth, voidRecord } from "../index";

const today = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
const EMPTY = { StockistId: "", TerritoryId: "", ProductId: "", BatchId: "", Quantity: "", Value: "", Date: today(), Reason: "EXPIRED", Remarks: "" };

// Head office: company dispatch (primary sales) or returns / expiry to a stockist of a territory.
function RecordsTab({ kind, stockists, territories, products }) {
    const isReturn = kind === "returns";
    const { showSnackbar } = useSnackbar();
    const [month, setMonth] = useState(thisMonth());
    const [rows, setRows] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [batches, setBatches] = useState([]);
    const [busy, setBusy] = useState(false);
    const [voiding, setVoiding] = useState(null);

    const load = useCallback(() => {
        getRecords(kind, month)
            .then((result) => setRows(result[kind]))
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load"), "error"));
    }, [kind, month, showSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!form.ProductId) return;
        getBatches(form.ProductId)
            .then((result) => setBatches(result.batches))
            .catch(() => setBatches([]));
    }, [form.ProductId]);

    const set = (patch) => setForm((current) => ({ ...current, ...patch }));
    const stockist = stockists.find((s) => s.StockistId === form.StockistId);
    const stockistTerritories = useMemo(() => territories.filter((t) => stockist?.TerritoryIds.some((id) => id.toLowerCase() === String(t.TerritoryId).toLowerCase())), [stockist, territories]);

    const save = async () => {
        setBusy(true);
        try {
            const result = await createRecord(kind, { ...form, Quantity: Number(form.Quantity), Value: Number(form.Value) });
            showSnackbar(result.message, "success");
            setForm({ ...EMPTY, StockistId: form.StockistId, TerritoryId: form.TerritoryId, Date: form.Date });
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Could not save"), "error");
        } finally {
            setBusy(false);
        }
    };

    const ready = form.StockistId && form.TerritoryId && form.ProductId && form.BatchId && Number(form.Quantity) > 0 && Number(form.Value) > 0 && form.Date;

    return (
        <Stack spacing={2}>
            <Panel title={isReturn ? "Record a return" : "Record a dispatch"} subtitle={isReturn ? "Returns are deducted from that territory's net sales and from held incentives." : "Company dispatch (primary sales) to a stockist."}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
                    <TextField select label="Stockist" value={form.StockistId} onChange={(e) => set({ StockistId: e.target.value, TerritoryId: "" })}>
                        {stockists.map((s) => (
                            <MenuItem key={s.StockistId} value={s.StockistId}>
                                {s.StockistName}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField select label="Territory" value={form.TerritoryId} onChange={(e) => set({ TerritoryId: e.target.value })} disabled={!stockist} helperText={stockist && !stockistTerritories.length ? "Link a territory under Stockists" : " "}>
                        {stockistTerritories.map((t) => (
                            <MenuItem key={t.TerritoryId} value={t.TerritoryId}>
                                {t.TerritoryName}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField select label="Product" value={form.ProductId} onChange={(e) => set({ ProductId: e.target.value, BatchId: "" })}>
                        {products.map((p) => (
                            <MenuItem key={p.ProductId} value={p.ProductId}>
                                {p.ProductName}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField select label="Batch" value={form.BatchId} onChange={(e) => set({ BatchId: e.target.value })} disabled={!form.ProductId} helperText={form.ProductId && !batches.length ? "Add the batch under Batches" : " "}>
                        {batches.map((b) => (
                            <MenuItem key={b.BatchId} value={b.BatchId}>
                                {b.BatchNumber} · exp {dayLabel(b.ExpiryDate)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField type="number" label="Quantity" value={form.Quantity} onChange={(e) => set({ Quantity: e.target.value })} slotProps={{ htmlInput: { min: 1 } }} />
                    <TextField type="number" label="Value (Rs)" value={form.Value} onChange={(e) => set({ Value: e.target.value })} slotProps={{ htmlInput: { min: 0, step: "0.01" } }} />
                    <TextField type="date" label={isReturn ? "Return date" : "Dispatch date"} value={form.Date} onChange={(e) => set({ Date: e.target.value })} slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: today() } }} />
                    {isReturn ? (
                        <TextField select label="Reason" value={form.Reason} onChange={(e) => set({ Reason: e.target.value })}>
                            {RETURN_REASONS.map((r) => (
                                <MenuItem key={r.value} value={r.value}>
                                    {r.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    ) : (
                        <TextField label="Remarks (optional)" value={form.Remarks} onChange={(e) => set({ Remarks: e.target.value.slice(0, 300) })} />
                    )}
                </Box>
                <Button sx={{ mt: 2 }} variant="contained" startIcon={<AddRounded />} disabled={!ready || busy} onClick={save}>
                    {isReturn ? "Record return" : "Record dispatch"}
                </Button>
            </Panel>

            <Panel
                title={isReturn ? "Returns" : "Dispatches"}
                subtitle="A wrong entry is voided with a reason (kept for the record), never deleted."
                actions={<TextField size="small" type="month" label="Month" value={month} onChange={(e) => setMonth(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />}
            >
                {rows?.length ? (
                    <Stack divider={<Divider />}>
                        {rows.map((row) => (
                            <Stack key={row.DispatchId || row.ReturnId} direction={{ xs: "column", md: "row" }} sx={{ py: 1.25, gap: 1, alignItems: { md: "center" } }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
                                        <Typography variant="subtitle2" sx={(theme) => ({ textDecoration: row.VoidedOn ? "line-through" : "none", color: row.VoidedOn ? theme.palette.text.disabled : theme.palette.text.primary })}>
                                            {row.ProductName} · {row.Quantity} · {rupees(row.Value)}
                                        </Typography>
                                        {isReturn && <Tag label={RETURN_REASONS.find((r) => r.value === row.Reason)?.label || row.Reason} color={row.Reason === "EXPIRED" ? "error" : "warning"} />}
                                        {row.VoidedOn && <Tag label="Voided" color="secondary" title={row.VoidReason} />}
                                    </Stack>
                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {dayLabel(row.DispatchDate || row.ReturnDate)} · {row.StockistName} · {row.TerritoryName} · batch {row.BatchNumber} (exp {dayLabel(row.ExpiryDate)}) · by {row.CreatedByName}
                                    </Typography>
                                </Box>
                                {!row.VoidedOn && (
                                    <Button size="small" color="error" startIcon={<BlockRounded />} onClick={() => setVoiding(row)}>
                                        Void
                                    </Button>
                                )}
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={LocalShippingRounded} title={rows ? "Nothing recorded this month" : "Loading…"} />
                )}
            </Panel>

            {voiding && (
                <ConfirmActionDialog
                    icon={BlockRounded}
                    color="error"
                    title={isReturn ? "Void this return?" : "Void this dispatch?"}
                    message={`${voiding.ProductName} · ${voiding.Quantity} · ${rupees(voiding.Value)}. It stays on record but no longer counts in net sales.`}
                    confirmLabel="Void"
                    remarks="required"
                    remarksLabel="Why? (saved in the audit log)"
                    remarksLimit={300}
                    busy={busy}
                    onClose={() => setVoiding(null)}
                    onConfirm={async (reason) => {
                        setBusy(true);
                        try {
                            await voidRecord(kind, voiding.DispatchId || voiding.ReturnId, reason);
                            setVoiding(null);
                            load();
                        } catch (err) {
                            showSnackbar(errorMessage(err, "Could not void"), "error");
                        } finally {
                            setBusy(false);
                        }
                    }}
                />
            )}
        </Stack>
    );
}

export default RecordsTab;
