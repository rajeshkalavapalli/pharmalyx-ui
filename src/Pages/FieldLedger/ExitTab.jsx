import { useCallback, useEffect, useState } from "react";

import { Alert, Box, Button, ButtonBase, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ArrowBackRounded, CheckCircleRounded, ExitToAppRounded, HandshakeRounded, LockRounded, PersonOffRounded, RefreshRounded, TaskAltRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../components/EmptyState/EmptyState";
import Panel from "../../components/Panel/Panel";
import StatCard from "../../components/StatCard/StatCard";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { EXIT_ITEM, closeExit, closeExitItem, createExit, dayLabel, errorMessage, getExit, getExits, handoverExit, refreshExit, rupees, todayKey } from "./index";

const muted = (theme) => ({ color: theme.palette.text.secondary });
const grid = (theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap });

function NewExitDialog({ users, onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();
    const [form, setForm] = useState({ UserId: "", LeavingDate: todayKey(), SuccessorUserId: "", Reason: "" });
    const [busy, setBusy] = useState(false);
    const set = (patch) => setForm((current) => ({ ...current, ...patch }));
    return (
        <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>Mark an MR as leaving</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Typography variant="body2" sx={muted}>
                        This lists everything the MR still holds or owes the company. Full and final settlement stays on hold until head office closes each item. On the leaving date their chemists, doctors and stock move to the new MR (or to head office) automatically, with full history.
                    </Typography>
                    <TextField select label="MR who is leaving" value={form.UserId} onChange={(e) => set({ UserId: e.target.value })}>
                        {users.map((u) => (
                            <MenuItem key={u.UserId} value={u.UserId}>
                                {u.Name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField type="date" label="Leaving date" value={form.LeavingDate} onChange={(e) => set({ LeavingDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                    <TextField select label="Who takes over" value={form.SuccessorUserId} onChange={(e) => set({ SuccessorUserId: e.target.value })} slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}>
                        <MenuItem value="">Head office (until a new MR joins)</MenuItem>
                        {users
                            .filter((u) => u.UserId !== form.UserId)
                            .map((u) => (
                                <MenuItem key={u.UserId} value={u.UserId}>
                                    {u.Name}
                                </MenuItem>
                            ))}
                    </TextField>
                    <TextField label="Reason (optional)" value={form.Reason} onChange={(e) => set({ Reason: e.target.value.slice(0, 300) })} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="warning"
                    startIcon={<PersonOffRounded />}
                    disabled={!form.UserId || !form.LeavingDate || busy}
                    onClick={async () => {
                        setBusy(true);
                        try {
                            const result = await createExit({ ...form, SuccessorUserId: form.SuccessorUserId || undefined });
                            onSaved(result.message, result.ClearanceId);
                        } catch (err) {
                            showSnackbar(errorMessage(err, "Could not open the clearance"), "error");
                        } finally {
                            setBusy(false);
                        }
                    }}
                >
                    Open exit clearance
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function ClearanceView({ clearanceId, onBack, onChanged }) {
    const { showSnackbar } = useSnackbar();
    const [data, setData] = useState(null);
    const [closing, setClosing] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        getExit(clearanceId)
            .then(setData)
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load the clearance"), "error"));
    }, [clearanceId, showSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    const act = async (work) => {
        setBusy(true);
        try {
            showSnackbar((await work()).message, "success");
            setClosing(null);
            setConfirm(null);
            load();
            onChanged();
        } catch (err) {
            showSnackbar(errorMessage(err, "That didn't work"), "error");
        } finally {
            setBusy(false);
        }
    };

    if (!data) return <EmptyState icon={ExitToAppRounded} title="Loading…" />;
    const c = data.clearance;
    const open = c.Status === "OPEN";

    return (
        <Stack spacing={2}>
            <Box>
                <Button startIcon={<ArrowBackRounded />} onClick={onBack}>
                    All clearances
                </Button>
            </Box>
            <Alert severity={data.settlement === "ON_HOLD" ? "warning" : "success"} variant="outlined" icon={data.settlement === "ON_HOLD" ? <LockRounded /> : <CheckCircleRounded />}>
                {c.UserName} · leaving {dayLabel(c.LeavingDate)} · taken over by {c.SuccessorName || "head office"}.{" "}
                <b>Full and final settlement: {data.settlement === "ON_HOLD" ? "ON HOLD" : "can be released"}.</b>
                {c.HandedOverOn ? ` Chemists, doctors and stock handed over on ${dayLabel(c.HandedOverOn)}.` : " Handover happens automatically on the leaving date."}
            </Alert>

            <Box sx={grid}>
                <StatCard icon={ExitToAppRounded} label="Stock in hand" value={rupees(data.summary.stockValue)} caption="Open items" color="primary" />
                <StatCard icon={ExitToAppRounded} label="Chemist dues" value={rupees(data.summary.chemistDues)} caption="From this MR's deliveries" color="warning" />
                <StatCard icon={ExitToAppRounded} label="Money with the MR" value={rupees(data.summary.paymentsWithMr)} caption="Collected, not yet received" color="error" />
                <StatCard icon={ExitToAppRounded} label="Pending spend" value={data.summary.pendingSpend} caption="Doctor spend requests" color="info" />
            </Box>

            <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                {open && (
                    <Button variant="outlined" startIcon={<RefreshRounded />} disabled={busy} onClick={() => act(() => refreshExit(clearanceId))}>
                        Add anything new
                    </Button>
                )}
                {open && !c.HandedOverOn && (
                    <Button variant="outlined" color="warning" startIcon={<HandshakeRounded />} disabled={busy} onClick={() => setConfirm("handover")}>
                        Hand over now
                    </Button>
                )}
                {open && (
                    <Button variant="contained" color="success" startIcon={<TaskAltRounded />} disabled={busy || data.summary.openItems > 0} onClick={() => setConfirm("close")}>
                        Close clearance
                    </Button>
                )}
            </Stack>

            <Panel title="Items to settle" subtitle="Head office closes each item with a note of how it was settled. Every step is in the audit log.">
                {data.items.length ? (
                    <Stack divider={<Divider />}>
                        {data.items.map((item) => {
                            const kind = EXIT_ITEM[item.ItemType];
                            return (
                                <Stack key={item.ItemId} direction={{ xs: "column", sm: "row" }} sx={{ py: 1.25, gap: 1, alignItems: { sm: "center" } }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
                                            <Tag label={kind.label} color={kind.color} />
                                            <Typography variant="subtitle2">{item.Label}</Typography>
                                        </Stack>
                                        <Typography variant="caption" sx={muted}>
                                            {item.Amount != null ? rupees(item.Amount) : ""}
                                            {item.Status === "CLOSED" ? ` · closed ${dayLabel(item.ClosedOn)} by ${item.ClosedByName}: ${item.CloseNote}` : ""}
                                        </Typography>
                                    </Box>
                                    {item.Status === "OPEN" ? (
                                        open && (
                                            <Button size="small" variant="outlined" onClick={() => setClosing(item)}>
                                                Close item
                                            </Button>
                                        )
                                    ) : (
                                        <Tag label="Closed" color="success" />
                                    )}
                                </Stack>
                            );
                        })}
                    </Stack>
                ) : (
                    <EmptyState icon={CheckCircleRounded} title="Nothing to settle" message="Close the clearance to release full and final." />
                )}
            </Panel>

            {closing && (
                <ConfirmActionDialog
                    icon={TaskAltRounded}
                    color="success"
                    title="Close this item?"
                    message={closing.Label}
                    confirmLabel="Close item"
                    remarks="required"
                    remarksLabel='How was it settled? e.g. "stock returned to depot", "chemist paid by NEFT"'
                    remarksLimit={500}
                    busy={busy}
                    onClose={() => setClosing(null)}
                    onConfirm={(note) => act(() => closeExitItem(closing.ItemId, note))}
                />
            )}
            {confirm && (
                <ConfirmActionDialog
                    icon={confirm === "close" ? TaskAltRounded : HandshakeRounded}
                    color={confirm === "close" ? "success" : "warning"}
                    title={confirm === "close" ? "Close the exit clearance?" : "Hand over now?"}
                    message={
                        confirm === "close"
                            ? "Every item is closed. Full and final settlement can then be released."
                            : `${c.UserName}'s chemists and doctors move to ${c.SuccessorName || "head office"}${c.SuccessorName ? ", with the stock in hand" : ""}. History is kept.`
                    }
                    confirmLabel={confirm === "close" ? "Close clearance" : "Hand over"}
                    busy={busy}
                    onClose={() => setConfirm(null)}
                    onConfirm={() => act(() => (confirm === "close" ? closeExit(clearanceId) : handoverExit(clearanceId)))}
                />
            )}
        </Stack>
    );
}

// Head office: exit clearances for MRs who are leaving.
function ExitTab() {
    const { showSnackbar } = useSnackbar();
    const [data, setData] = useState(null);
    const [creating, setCreating] = useState(false);
    const [openId, setOpenId] = useState(null);

    const load = useCallback(() => {
        getExits()
            .then(setData)
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load exit clearances"), "error"));
    }, [showSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    if (openId) return <ClearanceView clearanceId={openId} onBack={() => setOpenId(null)} onChanged={load} />;
    if (!data) return <EmptyState icon={ExitToAppRounded} title="Loading…" />;

    return (
        <Stack spacing={2}>
            <Box>
                <Button variant="contained" color="warning" startIcon={<PersonOffRounded />} onClick={() => setCreating(true)}>
                    Mark an MR as leaving
                </Button>
            </Box>
            <Panel title="Exit clearances" subtitle="Open ones first">
                {data.clearances.length ? (
                    <Stack divider={<Divider />}>
                        {data.clearances.map((c) => (
                            <ButtonBase
                                key={c.ClearanceId}
                                onClick={() => setOpenId(c.ClearanceId)}
                                sx={(theme) => ({ py: 1.25, px: 1, gap: 1, display: "flex", justifyContent: "flex-start", textAlign: "left", borderRadius: theme.calendar.cell.radius, "&:hover": { backgroundColor: alpha(theme.palette.primary.main, theme.tint.hover) } })}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2">{c.UserName}</Typography>
                                    <Typography variant="caption" sx={muted}>
                                        Leaving {dayLabel(c.LeavingDate)} · to {c.SuccessorName || "head office"} · {c.OpenItems} of {c.TotalItems} item(s) open
                                    </Typography>
                                </Box>
                                <Tag label={c.Status === "OPEN" ? "Full and final on hold" : "Closed"} color={c.Status === "OPEN" ? "warning" : "success"} />
                            </ButtonBase>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={ExitToAppRounded} title="No exit clearances" />
                )}
            </Panel>
            {creating && (
                <NewExitDialog
                    users={data.users}
                    onClose={() => setCreating(false)}
                    onSaved={(message, id) => {
                        showSnackbar(message, "success");
                        setCreating(false);
                        load();
                        setOpenId(id);
                    }}
                />
            )}
        </Stack>
    );
}

export default ExitTab;
