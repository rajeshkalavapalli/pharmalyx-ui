import { useEffect, useState } from "react";

import { Alert, Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { SendRounded } from "@mui/icons-material";

import { createRequest, errorMessage, rupees } from "./index";

const EMPTY = { doctor: null, TypeId: "", Amount: "", Purpose: "", ExpectedBusiness: "", PeriodMonths: 3 };

// MR: ask for an allowed doctor-related activity and say what business the territory will give.
function RequestDialog({ open, config, onClose, onSaved }) {
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const set = (patch) => setForm((current) => ({ ...current, ...patch }));

    useEffect(() => {
        if (open) {
            setForm(EMPTY);
            setError("");
        }
    }, [open]);

    const type = config?.types.find((t) => t.TypeId === form.TypeId);
    const amount = Number(form.Amount);
    const overMax = type && amount > Number(type.MaxAmount);
    const ready = form.doctor && type && amount > 0 && !overMax && Number(form.ExpectedBusiness) > 0 && form.Purpose.trim().length >= 10;

    const save = async () => {
        setBusy(true);
        setError("");
        try {
            const result = await createRequest({ DoctorId: form.doctor.DoctorId, TypeId: form.TypeId, Amount: amount, Purpose: form.Purpose, ExpectedBusiness: Number(form.ExpectedBusiness), PeriodMonths: form.PeriodMonths });
            onSaved(result.message);
        } catch (err) {
            setError(errorMessage(err, "The request could not be sent"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>Request doctor-related spend</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {config && !config.types.length && <Alert severity="info">Head office has not allowed any activity types yet.</Alert>}
                    <Autocomplete
                        options={config?.doctors || []}
                        value={form.doctor}
                        onChange={(_, value) => set({ doctor: value })}
                        getOptionLabel={(d) => `Dr. ${d.DoctorName}${d.TerritoryName ? ` · ${d.TerritoryName}` : ""}`}
                        isOptionEqualToValue={(a, b) => a.DoctorId === b.DoctorId}
                        renderInput={(params) => <TextField {...params} label="Doctor" />}
                    />
                    <TextField select label="Activity (allowed by head office)" value={form.TypeId} onChange={(e) => set({ TypeId: e.target.value })}>
                        {(config?.types || []).map((t) => (
                            <MenuItem key={t.TypeId} value={t.TypeId}>
                                {t.TypeName} · up to {rupees(t.MaxAmount)}
                            </MenuItem>
                        ))}
                    </TextField>
                    {type?.Description && (
                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            {type.Description}
                        </Typography>
                    )}
                    <TextField type="number" label="Amount (Rs)" value={form.Amount} onChange={(e) => set({ Amount: e.target.value })} error={Boolean(overMax)} helperText={overMax ? `The most allowed is ${rupees(type.MaxAmount)}` : " "} />
                    <TextField label="Purpose" value={form.Purpose} onChange={(e) => set({ Purpose: e.target.value.slice(0, 500) })} multiline minRows={2} helperText="What the activity is and why (at least 10 characters)" />
                    <Stack direction="row" sx={{ gap: 2 }}>
                        <TextField type="number" label="Business expected from the territory (Rs)" value={form.ExpectedBusiness} onChange={(e) => set({ ExpectedBusiness: e.target.value })} sx={{ flex: 2 }} />
                        <TextField select label="Over" value={form.PeriodMonths} onChange={(e) => set({ PeriodMonths: Number(e.target.value) })} sx={{ flex: 1 }}>
                            {(config?.periods || [3, 6]).map((p) => (
                                <MenuItem key={p} value={p}>
                                    {p} months
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        After the period, your expected business is compared with the territory's actual net sales. Your manager recommends; only head office approves and pays. Spend outside this process is not reimbursed.
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>
                    Cancel
                </Button>
                <Button variant="contained" startIcon={<SendRounded />} disabled={!ready || busy} onClick={save}>
                    Send request
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default RequestDialog;
