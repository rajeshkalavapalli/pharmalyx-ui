import { useCallback, useEffect, useState } from "react";

import { Alert, AlertTitle, Box, Button, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AssignmentReturnRounded, BlockRounded, Inventory2Rounded, LocalShippingRounded, MoveToInboxRounded, WarningAmberRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../components/EmptyState/EmptyState";
import Panel from "../../components/Panel/Panel";
import StatCard from "../../components/StatCard/StatCard";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { ENTRY_LABEL, dayLabel, errorMessage, getStock, rupees, voidStockEntry } from "./index";

const grid = (theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap });
const muted = (theme) => ({ color: theme.palette.text.secondary });

// Saleable stock in one MR's hands: what head office issued, what went to chemists, what came back.
// The MR sees their own; managers their team; head office anyone (and can void a wrong issue / return).
function StockTab({ headOffice, refreshKey }) {
    const { showSnackbar } = useSnackbar();
    const [userId, setUserId] = useState("");
    const [data, setData] = useState(null);
    const [voiding, setVoiding] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        getStock(userId)
            .then(setData)
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load the stock"), "error"));
    }, [userId, showSnackbar]);

    useEffect(() => {
        load();
    }, [load, refreshKey]);

    if (!data) return <EmptyState icon={Inventory2Rounded} title="Loading…" />;

    const t = data.totals;
    const used = data.limit ? Math.min(100, Math.round((t.balanceValue / data.limit) * 100)) : 0;

    return (
        <Stack spacing={2}>
            {data.people.length > 0 && (
                <TextField
                    select
                    size="small"
                    label="Employee"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
                    sx={(theme) => ({ maxWidth: theme.spacing(40) })}
                >
                    <MenuItem value="">Me</MenuItem>
                    {data.people.map((p) => (
                        <MenuItem key={p.UserId} value={p.UserId}>
                            {p.Name}
                        </MenuItem>
                    ))}
                </TextField>
            )}

            <Box sx={grid}>
                <StatCard icon={Inventory2Rounded} label="Stock in hand" value={rupees(t.balanceValue)} caption={`${t.balanceQty} units · limit ${rupees(data.limit)}`} color={used >= 100 ? "error" : used >= 80 ? "warning" : "primary"} progress={used} />
                <StatCard icon={MoveToInboxRounded} label="Issued" value={t.issued + t.transferredIn} caption={t.transferredIn ? `${t.transferredIn} taken over from a leaving MR` : "By head office"} color="info" />
                <StatCard icon={LocalShippingRounded} label="Delivered to chemists" value={t.delivered} caption="With stamped receipts" color="success" />
                <StatCard icon={AssignmentReturnRounded} label="Returned to company" value={t.returned + t.transferredOut} caption={t.transferredOut ? `${t.transferredOut} handed over on exit` : "Back with head office"} color="secondary" />
            </Box>

            {data.heldLong.length > 0 && (
                <Alert severity="warning" variant="outlined" icon={<WarningAmberRounded />}>
                    <AlertTitle>Stock held longer than {data.holdDays} days</AlertTitle>
                    {data.heldLong.map((lot) => (
                        <Typography key={`${lot.BatchNumber}-${lot.date}`} variant="body2">
                            {lot.quantity} of {lot.ProductName} (batch {lot.BatchNumber}) since {dayLabel(lot.date)}: {lot.ageDays} days. Deliver it or return it to the company.
                        </Typography>
                    ))}
                </Alert>
            )}

            <Panel title="In hand by batch" subtitle="Company stock, recorded in the company's name">
                {data.balances.length ? (
                    <Stack divider={<Divider />}>
                        {data.balances.map((b) => (
                            <Stack key={b.BatchId} direction="row" sx={{ py: 1.25, gap: 1, alignItems: "center" }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2">{b.ProductName}</Typography>
                                    <Typography variant="caption" sx={muted}>
                                        Batch {b.BatchNumber} · expires {dayLabel(b.ExpiryDate)}
                                    </Typography>
                                </Box>
                                <Typography variant="subtitle2" sx={{ fontVariantNumeric: "tabular-nums" }}>
                                    {b.Quantity}
                                </Typography>
                                <Typography variant="body2" sx={(theme) => ({ ...muted(theme), minWidth: theme.spacing(12), textAlign: "right" })}>
                                    {rupees(b.Value)}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={Inventory2Rounded} title="No stock in hand" message="Head office issues saleable stock when a stockist cannot supply." />
                )}
            </Panel>

            <Panel title="History" subtitle="Every movement, newest first. Wrong entries are voided with a reason, never deleted.">
                {data.entries.length ? (
                    <Stack divider={<Divider />}>
                        {data.entries.map((e) => {
                            const kind = ENTRY_LABEL[e.EntryType] || { label: e.EntryType, color: "secondary" };
                            return (
                                <Stack key={e.EntryId} direction={{ xs: "column", sm: "row" }} sx={{ py: 1.25, gap: 1, alignItems: { sm: "center" } }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
                                            <Tag label={kind.label} color={kind.color} />
                                            <Typography variant="subtitle2" sx={(theme) => ({ textDecoration: e.VoidedOn ? "line-through" : "none", color: e.VoidedOn ? theme.palette.text.disabled : theme.palette.text.primary })}>
                                                {e.ProductName} · {e.Quantity > 0 ? `+${e.Quantity}` : e.Quantity} · {rupees(Math.abs(e.Value))}
                                            </Typography>
                                            {e.VoidedOn && <Tag label="Voided" color="secondary" title={e.VoidReason} />}
                                        </Stack>
                                        <Typography variant="caption" sx={muted}>
                                            {dayLabel(e.EntryDate)} · batch {e.BatchNumber}
                                            {e.DeliveryNumber ? ` · ${e.DeliveryNumber} to ${e.PharmacyName}` : ""} · by {e.CreatedByName}
                                            {e.Remarks ? ` · ${e.Remarks}` : ""}
                                        </Typography>
                                    </Box>
                                    {headOffice && !e.VoidedOn && !e.DeliveryId && ["ISSUE", "RETURN"].includes(e.EntryType) && (
                                        <Button size="small" color="error" startIcon={<BlockRounded />} onClick={() => setVoiding(e)}>
                                            Void
                                        </Button>
                                    )}
                                </Stack>
                            );
                        })}
                    </Stack>
                ) : (
                    <EmptyState icon={Inventory2Rounded} title="No movements yet" />
                )}
            </Panel>

            {voiding && (
                <ConfirmActionDialog
                    icon={BlockRounded}
                    color="error"
                    title="Void this entry?"
                    message={`${voiding.ProductName} · ${voiding.Quantity} · ${rupees(Math.abs(voiding.Value))}. It stays on record but no longer counts.`}
                    confirmLabel="Void"
                    remarks="required"
                    remarksLabel="Why? (saved in the audit log)"
                    remarksLimit={300}
                    busy={busy}
                    onClose={() => setVoiding(null)}
                    onConfirm={async (reason) => {
                        setBusy(true);
                        try {
                            showSnackbar((await voidStockEntry(voiding.EntryId, reason)).message, "success");
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

export default StockTab;
