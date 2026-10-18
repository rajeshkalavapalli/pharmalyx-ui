import { useCallback, useEffect, useState } from "react";

import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import { AddRounded, DeleteOutlineRounded, Inventory2Rounded, SaveRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { addSalary, createBatch, dayLabel, errorMessage, getBatches, getConfig, getPeopleCosts, getSalaries, monthLabel, rupees, saveMilestones, saveSlabs, setJoining, setStockistTerritories, thisMonth } from "../index";

const useRun = () => {
    const { showSnackbar } = useSnackbar();
    const [busy, setBusy] = useState(false);
    const run = async (work, after) => {
        setBusy(true);
        try {
            const result = await work();
            showSnackbar(result?.message || "Saved", "success");
            if (after) after();
            return true;
        } catch (err) {
            showSnackbar(errorMessage(err, "Could not save"), "error");
            return false;
        } finally {
            setBusy(false);
        }
    };
    return { busy, run };
};

// ---------------------------------------------------------------- Batches
export function BatchesTab({ products }) {
    const { busy, run } = useRun();
    const [rows, setRows] = useState(null);
    const [form, setForm] = useState({ ProductId: "", BatchNumber: "", MfgDate: "", ExpiryDate: "" });

    const load = useCallback(() => {
        getBatches()
            .then((result) => setRows(result.batches))
            .catch(() => setRows([]));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const set = (patch) => setForm((current) => ({ ...current, ...patch }));

    return (
        <Stack spacing={2}>
            <Panel title="Add a batch" subtitle="Batch number, manufacture and expiry date for a product.">
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
                    <TextField select label="Product" value={form.ProductId} onChange={(e) => set({ ProductId: e.target.value })}>
                        {products.map((p) => (
                            <MenuItem key={p.ProductId} value={p.ProductId}>
                                {p.ProductName}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField label="Batch number" value={form.BatchNumber} onChange={(e) => set({ BatchNumber: e.target.value.slice(0, 50) })} />
                    <TextField type="date" label="Manufactured" value={form.MfgDate} onChange={(e) => set({ MfgDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                    <TextField type="date" label="Expiry" value={form.ExpiryDate} onChange={(e) => set({ ExpiryDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                </Box>
                <Button
                    sx={{ mt: 2 }}
                    variant="contained"
                    startIcon={<AddRounded />}
                    disabled={busy || !form.ProductId || !form.BatchNumber.trim() || !form.MfgDate || !form.ExpiryDate}
                    onClick={() => run(() => createBatch(form), () => {
                        setForm({ ProductId: form.ProductId, BatchNumber: "", MfgDate: "", ExpiryDate: "" });
                        load();
                    })}
                >
                    Add batch
                </Button>
            </Panel>
            <Panel title="Batches">
                {rows?.length ? (
                    <Stack divider={<Divider />}>
                        {rows.map((b) => (
                            <Stack key={b.BatchId} direction="row" sx={{ py: 1, gap: 1.5, alignItems: "center" }}>
                                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                                    {b.ProductName} · {b.BatchNumber}
                                </Typography>
                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    Mfg {dayLabel(b.MfgDate)} · Exp {dayLabel(b.ExpiryDate)}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={Inventory2Rounded} title={rows ? "No batches yet" : "Loading…"} />
                )}
            </Panel>
        </Stack>
    );
}

// ---------------------------------------------------------------- Stockists
export function StockistsTab({ stockists, territories, onChanged }) {
    const { busy, run } = useRun();
    const [editing, setEditing] = useState(null);

    const save = () => {
        const before = new Set(editing.stockist.TerritoryIds.map((id) => id.toLowerCase()));
        const after = editing.selected;
        const add = [...after].filter((id) => !before.has(id));
        const remove = [...before].filter((id) => !after.has(id));
        run(() => setStockistTerritories(editing.stockist.StockistId, add, remove), () => {
            setEditing(null);
            onChanged();
        });
    };

    return (
        <Panel title="Stockists and territories" subtitle="A stockist can serve one or more territories. Dispatch and returns are counted per territory.">
            <Stack divider={<Divider />}>
                {stockists.map((s) => (
                    <Stack key={s.StockistId} direction="row" sx={{ py: 1.25, gap: 1.5, alignItems: "center" }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2">{s.StockistName}</Typography>
                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                {s.TerritoryNames || "No territory linked"}
                            </Typography>
                        </Box>
                        <Button size="small" onClick={() => setEditing({ stockist: s, selected: new Set(s.TerritoryIds.map((id) => id.toLowerCase())) })}>
                            Territories
                        </Button>
                    </Stack>
                ))}
            </Stack>

            {editing && (
                <Dialog open fullWidth maxWidth="xs" onClose={() => setEditing(null)} slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
                    <DialogTitle>{editing.stockist.StockistName}</DialogTitle>
                    <DialogContent>
                        {territories.map((t) => {
                            const id = String(t.TerritoryId).toLowerCase();
                            return (
                                <FormControlLabel
                                    key={t.TerritoryId}
                                    sx={{ display: "flex" }}
                                    control={
                                        <Checkbox
                                            checked={editing.selected.has(id)}
                                            onChange={(e) =>
                                                setEditing((current) => {
                                                    const selected = new Set(current.selected);
                                                    if (e.target.checked) selected.add(id);
                                                    else selected.delete(id);
                                                    return { ...current, selected };
                                                })
                                            }
                                        />
                                    }
                                    label={t.TerritoryName}
                                />
                            );
                        })}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditing(null)}>Cancel</Button>
                        <Button variant="contained" onClick={save} disabled={busy}>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Panel>
    );
}

// ---------------------------------------------------------------- People: joining and salary
export function PeopleTab() {
    const { busy, run } = useRun();
    const [rows, setRows] = useState(null);
    const [editing, setEditing] = useState(null);

    const load = useCallback(() => {
        getPeopleCosts()
            .then((result) => setRows(result.people))
            .catch(() => setRows([]));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const open = async (person) => {
        const { salaries } = await getSalaries(person.UserId);
        setEditing({ person, joining: person.JoiningDate, month: thisMonth(), salary: person.MonthlySalary ?? "", salaries });
    };

    return (
        <Panel title="People" subtitle="Joining date (for ramp-up months) and monthly salary (for cost vs business). Allowances come from TA/DA.">
            {rows?.length ? (
                <Stack divider={<Divider />}>
                    {rows.map((p) => (
                        <Stack key={p.UserId} direction="row" sx={{ py: 1.25, gap: 1.5, alignItems: "center" }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2">{p.Name}</Typography>
                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    {p.RoleName || "—"} · joined {dayLabel(p.JoiningDate)}
                                    {p.JoiningSet ? "" : " (account date)"}
                                </Typography>
                            </Box>
                            {p.MonthlySalary != null ? <Tag label={`${rupees(p.MonthlySalary)} / month`} color="primary" /> : <Tag label="Salary not set" color="warning" />}
                            <Button size="small" onClick={() => open(p)}>
                                Edit
                            </Button>
                        </Stack>
                    ))}
                </Stack>
            ) : (
                <EmptyState icon={Inventory2Rounded} title={rows ? "Nobody yet" : "Loading…"} />
            )}

            {editing && (
                <Dialog open fullWidth maxWidth="sm" onClose={() => setEditing(null)} slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
                    <DialogTitle>{editing.person.Name}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2.5} sx={{ pt: 1 }}>
                            <Stack direction="row" sx={{ gap: 1.5, alignItems: "center" }}>
                                <TextField type="date" label="Joining date" value={editing.joining} onChange={(e) => setEditing((c) => ({ ...c, joining: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
                                <Button disabled={busy} onClick={() => run(() => setJoining(editing.person.UserId, editing.joining), load)}>
                                    Save date
                                </Button>
                            </Stack>
                            <Stack direction="row" sx={{ gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                                <TextField type="month" label="From month" value={editing.month} onChange={(e) => setEditing((c) => ({ ...c, month: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
                                <TextField type="number" label="Monthly salary (Rs)" value={editing.salary} onChange={(e) => setEditing((c) => ({ ...c, salary: e.target.value }))} />
                                <Button
                                    disabled={busy || editing.salary === ""}
                                    onClick={() =>
                                        run(() => addSalary(editing.person.UserId, editing.month, Number(editing.salary)), async () => {
                                            load();
                                            const { salaries } = await getSalaries(editing.person.UserId);
                                            setEditing((c) => ({ ...c, salaries }));
                                        })
                                    }
                                >
                                    Add salary
                                </Button>
                            </Stack>
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                    Salary history
                                </Typography>
                                {editing.salaries.length ? (
                                    editing.salaries.map((s) => (
                                        <Typography key={s.EffectiveFrom} variant="body2">
                                            From {monthLabel(s.EffectiveFrom)}: {rupees(s.MonthlySalary)}
                                        </Typography>
                                    ))
                                ) : (
                                    <Typography variant="body2">No salary yet.</Typography>
                                )}
                            </Box>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditing(null)}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Panel>
    );
}

// ---------------------------------------------------------------- Milestones and incentive slabs
export function TargetsTab() {
    const { busy, run } = useRun();
    const [config, setConfig] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [slabs, setSlabs] = useState([]);
    const [reason, setReason] = useState("");

    const load = useCallback(() => {
        getConfig().then((result) => {
            setConfig(result);
            setMilestones(result.milestones);
            setSlabs(result.slabs);
        });
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (!config) return <EmptyState icon={Inventory2Rounded} title="Loading…" />;

    const setMilestone = (index, patch) => setMilestones((list) => list.map((m, i) => (i === index ? { ...m, ...patch } : m)));
    const setSlab = (index, patch) => setSlabs((list) => list.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    const reasonOk = reason.trim().length >= 10;

    return (
        <Stack spacing={2}>
            <Panel
                title="Ramp-up milestones"
                subtitle="Month 1 = the joining month. Defaults: month 1 mapped + STP 80%, month 2 ten chemists supplied, month 3 net sales 25% of cost, month 6 100%."
                actions={
                    <Button variant="contained" startIcon={<SaveRounded />} disabled={busy || !reasonOk} onClick={() => run(() => saveMilestones(milestones, reason), load)}>
                        Save milestones
                    </Button>
                }
            >
                <Stack spacing={1.5}>
                    {milestones.map((m, index) => (
                        <Stack key={m.MilestoneId || index} direction={{ xs: "column", md: "row" }} sx={{ gap: 1.5, alignItems: { md: "center" } }}>
                            <TextField size="small" type="number" label="Month" value={m.MonthNumber} onChange={(e) => setMilestone(index, { MonthNumber: Number(e.target.value) })} sx={(theme) => ({ width: theme.spacing(12) })} />
                            <TextField select size="small" label="Measure" value={m.Metric} onChange={(e) => setMilestone(index, { Metric: e.target.value })} sx={{ flex: 1 }}>
                                {config.metrics.map((metric) => (
                                    <MenuItem key={metric.value} value={metric.value}>
                                        {metric.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField size="small" type="number" label="Target" value={m.Target} onChange={(e) => setMilestone(index, { Target: Number(e.target.value) })} sx={(theme) => ({ width: theme.spacing(14) })} />
                            <FormControlLabel control={<Switch checked={m.IsActive} onChange={(e) => setMilestone(index, { IsActive: e.target.checked })} />} label="Active" />
                        </Stack>
                    ))}
                    <Button startIcon={<AddRounded />} sx={{ alignSelf: "flex-start" }} onClick={() => setMilestones((list) => [...list, { MonthNumber: 4, Metric: "NET_SALES_PCT_COST", Target: 50, IsActive: true }])}>
                        Add milestone
                    </Button>
                </Stack>
            </Panel>

            <Panel
                title="Incentive slabs"
                subtitle="Incentive = the month's net sales × the rate of the highest slab reached. One slab must start at 0."
                actions={
                    <Button variant="contained" startIcon={<SaveRounded />} disabled={busy || !reasonOk} onClick={() => run(() => saveSlabs(slabs, reason), load)}>
                        Save slabs
                    </Button>
                }
            >
                <Stack spacing={1.5}>
                    {slabs.map((s, index) => (
                        <Stack key={index} direction="row" sx={{ gap: 1.5, alignItems: "center" }}>
                            <TextField size="small" type="number" label="Net sales from (Rs)" value={s.FromAmount} onChange={(e) => setSlab(index, { FromAmount: Number(e.target.value) })} />
                            <TextField size="small" type="number" label="Rate %" value={s.RatePercent} onChange={(e) => setSlab(index, { RatePercent: Number(e.target.value) })} sx={(theme) => ({ width: theme.spacing(14) })} />
                            <IconButton aria-label="Remove slab" disabled={slabs.length === 1} onClick={() => setSlabs((list) => list.filter((_, i) => i !== index))}>
                                <DeleteOutlineRounded />
                            </IconButton>
                        </Stack>
                    ))}
                    <Button startIcon={<AddRounded />} sx={{ alignSelf: "flex-start" }} onClick={() => setSlabs((list) => [...list, { FromAmount: 100000, RatePercent: 3 }])}>
                        Add slab
                    </Button>
                </Stack>
            </Panel>

            <TextField label="Why are you changing these? (required, saved in the audit log)" value={reason} onChange={(e) => setReason(e.target.value.slice(0, 300))} />
        </Stack>
    );
}
