import { useState } from "react";

import { Alert, AlertTitle, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, Switch, TextField, Typography } from "@mui/material";
import { AddRounded, EditRounded, GavelRounded } from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import Panel from "../../components/Panel/Panel";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { errorMessage, rupees, saveType } from "./index";

function TypeDialog({ type, onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();
    const [form, setForm] = useState({ TypeName: type?.TypeName || "", Description: type?.Description || "", MaxAmount: type ? String(type.MaxAmount) : "", IsActive: type ? Boolean(type.IsActive) : true, LegalConfirmed: false });
    const [busy, setBusy] = useState(false);
    const set = (patch) => setForm((current) => ({ ...current, ...patch }));
    const ready = form.TypeName.trim().length >= 3 && Number(form.MaxAmount) > 0 && form.LegalConfirmed;
    return (
        <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>{type ? "Edit activity type" : "Allow an activity type"}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField label="Activity" placeholder="e.g. Documented CME sponsorship" value={form.TypeName} onChange={(e) => set({ TypeName: e.target.value.slice(0, 100) })} />
                    <TextField label="What is allowed and what must be documented" value={form.Description} onChange={(e) => set({ Description: e.target.value.slice(0, 500) })} multiline minRows={2} />
                    <TextField type="number" label="Most that can be requested (Rs)" value={form.MaxAmount} onChange={(e) => set({ MaxAmount: e.target.value })} />
                    <FormControlLabel control={<Switch checked={form.IsActive} onChange={(e) => set({ IsActive: e.target.checked })} />} label={form.IsActive ? "MRs can request it" : "Switched off"} />
                    <FormControlLabel
                        control={<Checkbox checked={form.LegalConfirmed} onChange={(e) => set({ LegalConfirmed: e.target.checked })} />}
                        label="I confirm this activity type was checked with the company's legal advisor under UCPMP 2024."
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disabled={!ready || busy}
                    onClick={async () => {
                        setBusy(true);
                        try {
                            onSaved((await saveType(type?.TypeId, { ...form, MaxAmount: Number(form.MaxAmount) })).message);
                        } catch (err) {
                            showSnackbar(errorMessage(err, "Could not save"), "error");
                        } finally {
                            setBusy(false);
                        }
                    }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// Head office: the only activities MRs may request, each with a limit.
function TypesTab({ config, onChanged }) {
    const { showSnackbar } = useSnackbar();
    const [editing, setEditing] = useState(null);
    return (
        <Stack spacing={2}>
            <Alert severity="warning" variant="outlined" icon={<GavelRounded />}>
                <AlertTitle>Legal check required (UCPMP 2024)</AlertTitle>
                {config.ucpmpNote}
            </Alert>
            <Box>
                <Button variant="contained" startIcon={<AddRounded />} onClick={() => setEditing("new")}>
                    Allow an activity type
                </Button>
            </Box>
            <Panel title="Allowed activity types" subtitle="Only these can be requested. Switch a type off instead of deleting it.">
                {config.types.length ? (
                    <Stack divider={<Divider />}>
                        {config.types.map((t) => (
                            <Stack key={t.TypeId} direction="row" sx={{ py: 1.25, gap: 1, alignItems: "center" }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" sx={{ gap: 0.75, alignItems: "center" }}>
                                        <Typography variant="subtitle2">{t.TypeName}</Typography>
                                        <Tag label={t.IsActive ? "Allowed" : "Off"} color={t.IsActive ? "success" : "secondary"} />
                                    </Stack>
                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        Up to {rupees(t.MaxAmount)}
                                        {t.Description ? ` · ${t.Description}` : ""}
                                    </Typography>
                                </Box>
                                <Button size="small" startIcon={<EditRounded />} onClick={() => setEditing(t)}>
                                    Edit
                                </Button>
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={GavelRounded} title="No activity types yet" message="MRs cannot request anything until head office allows at least one type." />
                )}
            </Panel>
            {editing && (
                <TypeDialog
                    type={editing === "new" ? null : editing}
                    onClose={() => setEditing(null)}
                    onSaved={(message) => {
                        showSnackbar(message, "success");
                        setEditing(null);
                        onChanged();
                    }}
                />
            )}
        </Stack>
    );
}

export default TypesTab;
