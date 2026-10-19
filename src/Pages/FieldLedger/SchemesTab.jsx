import { useCallback, useEffect, useState } from "react";

import { Autocomplete, Box, Button, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AddRounded, BlockRounded, LocalOfferRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../components/EmptyState/EmptyState";
import Panel from "../../components/Panel/Panel";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { createScheme, dayLabel, errorMessage, getLookups, getSchemes, rupees, todayKey, voidScheme } from "./index";

const KINDS = [
    { value: "SCHEME", label: "Scheme (e.g. 10+1)" },
    { value: "SPECIAL_PRICE", label: "Special price" },
];
const EMPTY = { Kind: "SCHEME", BillingDate: todayKey(), StockistId: "", BillReference: "", PharmacyId: null, DoctorId: null, TerritoryId: "", ProductId: "", Description: "", Value: "" };
const muted = (theme) => ({ color: theme.palette.text.secondary });
const monthStart = () => `${todayKey().slice(0, 7)}-01`;

// Head office only: schemes and special prices from stockist billing, with their cost to the company.
// MRs never enter these. They feed the spend vs business report.
function SchemesTab() {
    const { showSnackbar } = useSnackbar();
    const [lists, setLists] = useState(null);
    const [range, setRange] = useState({ from: monthStart(), to: todayKey() });
    const [rows, setRows] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [busy, setBusy] = useState(false);
    const [voiding, setVoiding] = useState(null);
    const set = (patch) => setForm((current) => ({ ...current, ...patch }));

    useEffect(() => {
        getLookups()
            .then(setLists)
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load the lists"), "error"));
    }, [showSnackbar]);

    const load = useCallback(() => {
        getSchemes(range.from, range.to)
            .then((r) => setRows(r.schemes))
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load schemes"), "error"));
    }, [range, showSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    const ready = form.StockistId && form.Description.trim() && Number(form.Value) > 0 && (form.PharmacyId || form.DoctorId || form.TerritoryId);

    const save = async () => {
        setBusy(true);
        try {
            const result = await createScheme({ ...form, PharmacyId: form.PharmacyId?.PharmacyId, DoctorId: form.DoctorId?.DoctorId, ProductId: form.ProductId || undefined, TerritoryId: form.TerritoryId || undefined, Value: Number(form.Value) });
            showSnackbar(result.message, "success");
            setForm({ ...EMPTY, StockistId: form.StockistId, BillingDate: form.BillingDate, BillReference: form.BillReference });
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Could not save"), "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack spacing={2}>
            <Panel title="Record from stockist billing" subtitle="Schemes and special prices are entered here by head office only, with what they cost the company.">
                {lists ? (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
                        <TextField select label="Type" value={form.Kind} onChange={(e) => set({ Kind: e.target.value })}>
                            {KINDS.map((k) => (
                                <MenuItem key={k.value} value={k.value}>
                                    {k.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Stockist (billed by)" value={form.StockistId} onChange={(e) => set({ StockistId: e.target.value })}>
                            {lists.stockists.map((s) => (
                                <MenuItem key={s.StockistId} value={s.StockistId}>
                                    {s.StockistName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Bill number (optional)" value={form.BillReference} onChange={(e) => set({ BillReference: e.target.value.slice(0, 60) })} />
                        <Autocomplete
                            options={lists.chemists}
                            value={form.PharmacyId}
                            onChange={(_, value) => set({ PharmacyId: value })}
                            getOptionLabel={(o) => o.PharmacyName}
                            isOptionEqualToValue={(a, b) => a.PharmacyId === b.PharmacyId}
                            renderInput={(params) => <TextField {...params} label="Chemist (if for one chemist)" />}
                        />
                        <Autocomplete
                            options={lists.doctors}
                            value={form.DoctorId}
                            onChange={(_, value) => set({ DoctorId: value })}
                            getOptionLabel={(o) => `Dr. ${o.DoctorName}`}
                            isOptionEqualToValue={(a, b) => a.DoctorId === b.DoctorId}
                            renderInput={(params) => <TextField {...params} label="Doctor (if linked to one doctor)" />}
                        />
                        <TextField select label="Territory" value={form.TerritoryId} onChange={(e) => set({ TerritoryId: e.target.value })} helperText="Taken from the chemist or doctor if left empty">
                            <MenuItem value="">From the chemist / doctor</MenuItem>
                            {lists.territories.map((t) => (
                                <MenuItem key={t.TerritoryId} value={t.TerritoryId}>
                                    {t.TerritoryName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Product (optional)" value={form.ProductId} onChange={(e) => set({ ProductId: e.target.value })}>
                            <MenuItem value="">Any / several</MenuItem>
                            {lists.products.map((p) => (
                                <MenuItem key={p.ProductId} value={p.ProductId}>
                                    {p.ProductName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label={form.Kind === "SCHEME" ? "Scheme, e.g. 10+1" : "Price, e.g. Rs 85 instead of Rs 100"} value={form.Description} onChange={(e) => set({ Description: e.target.value.slice(0, 200) })} />
                        <TextField type="number" label="Cost to the company (Rs)" value={form.Value} onChange={(e) => set({ Value: e.target.value })} slotProps={{ htmlInput: { min: 1 } }} />
                        <TextField type="date" label="Billing date" value={form.BillingDate} onChange={(e) => set({ BillingDate: e.target.value })} slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: todayKey() } }} />
                    </Box>
                ) : (
                    <EmptyState icon={LocalOfferRounded} title="Loading…" />
                )}
                <Button sx={{ mt: 2 }} variant="contained" startIcon={<AddRounded />} disabled={!ready || busy} onClick={save}>
                    Record
                </Button>
            </Panel>

            <Panel
                title="Schemes and special prices"
                subtitle="A wrong entry is voided with a reason, never deleted."
                actions={
                    <Stack direction="row" sx={{ gap: 1 }}>
                        <TextField size="small" type="date" label="From" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
                        <TextField size="small" type="date" label="To" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
                    </Stack>
                }
            >
                {rows?.length ? (
                    <Stack divider={<Divider />}>
                        {rows.map((s) => (
                            <Stack key={s.SchemeId} direction={{ xs: "column", sm: "row" }} sx={{ py: 1.25, gap: 1, alignItems: { sm: "center" } }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
                                        <Tag label={s.Kind === "SCHEME" ? "Scheme" : "Special price"} color={s.Kind === "SCHEME" ? "info" : "warning"} />
                                        <Typography variant="subtitle2" sx={(theme) => ({ textDecoration: s.VoidedOn ? "line-through" : "none", color: s.VoidedOn ? theme.palette.text.disabled : theme.palette.text.primary })}>
                                            {s.Description} · {rupees(s.Value)}
                                        </Typography>
                                        {s.VoidedOn && <Tag label="Voided" color="secondary" title={s.VoidReason} />}
                                    </Stack>
                                    <Typography variant="caption" sx={muted}>
                                        {dayLabel(s.BillingDate)} · {s.StockistName}
                                        {s.BillReference ? ` bill ${s.BillReference}` : ""} · {[s.PharmacyName, s.DoctorName && `Dr. ${s.DoctorName}`, s.TerritoryName, s.ProductName].filter(Boolean).join(" · ")}
                                    </Typography>
                                </Box>
                                {!s.VoidedOn && (
                                    <Button size="small" color="error" startIcon={<BlockRounded />} onClick={() => setVoiding(s)}>
                                        Void
                                    </Button>
                                )}
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={LocalOfferRounded} title={rows ? "Nothing recorded in these dates" : "Loading…"} />
                )}
            </Panel>

            {voiding && (
                <ConfirmActionDialog
                    icon={BlockRounded}
                    color="error"
                    title="Void this entry?"
                    message={`${voiding.Description} · ${rupees(voiding.Value)} stays on record but no longer counts as spend.`}
                    confirmLabel="Void"
                    remarks="required"
                    remarksLabel="Why? (saved in the audit log)"
                    remarksLimit={300}
                    busy={busy}
                    onClose={() => setVoiding(null)}
                    onConfirm={async (reason) => {
                        setBusy(true);
                        try {
                            showSnackbar((await voidScheme(voiding.SchemeId, reason)).message, "success");
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

export default SchemesTab;
