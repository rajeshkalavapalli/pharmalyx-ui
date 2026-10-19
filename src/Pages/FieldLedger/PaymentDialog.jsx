import { useEffect, useState } from "react";

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { PaymentsRounded } from "@mui/icons-material";

import { CameraCapture } from "../DoctorRequests/components/LiveCapture";
import useLiveLocation from "../DoctorRequests/components/useLiveLocation";
import { PAYMENT_MODES, createPayment, errorMessage, getOptions, rupees, uploadPhoto } from "./index";

// MR: money collected from a chemist. Cash needs a photo of the receipt given; other modes a reference.
// It reduces the chemist's dues at once and stays "with MR" until head office confirms it arrived.
function PaymentDialog({ open, pharmacyId: initialChemist, onClose, onSaved }) {
    const location = useLiveLocation();
    const [options, setOptions] = useState(null);
    const [pharmacyId, setPharmacyId] = useState("");
    const [amount, setAmount] = useState("");
    const [mode, setMode] = useState("CASH");
    const [reference, setReference] = useState("");
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const { start } = location;

    useEffect(() => {
        if (!open) return;
        setPharmacyId(initialChemist || "");
        setAmount("");
        setMode("CASH");
        setReference("");
        setPhoto(null);
        setError("");
        getOptions()
            .then(setOptions)
            .catch((err) => setError(errorMessage(err, "Couldn't load your chemists")));
        start();
    }, [open, initialChemist, start]);

    const chemist = options?.chemists.find((c) => c.PharmacyId === pharmacyId);
    const value = Number(amount);
    const tooMuch = chemist && value > chemist.balance;
    const ready = chemist && value > 0 && !tooMuch && (mode === "CASH" ? Boolean(photo) : reference.trim().length > 0);

    const save = async () => {
        setBusy(true);
        setError("");
        try {
            const photoId = photo ? (await uploadPhoto(photo)).photoId : undefined;
            const fix = location.status === "CAPTURED" ? { status: "CAPTURED", latitude: location.fix.latitude, longitude: location.fix.longitude, accuracy: location.fix.accuracy } : undefined;
            const result = await createPayment({ PharmacyId: pharmacyId, Amount: value, Mode: mode, Reference: reference || undefined, ReceiptPhotoId: photoId, Location: fix });
            onSaved(result.message);
        } catch (err) {
            setError(errorMessage(err, "The payment could not be saved"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>Record a payment collected</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField select label="Chemist" value={pharmacyId} onChange={(e) => setPharmacyId(e.target.value)} disabled={!options}>
                        {(options?.chemists || [])
                            .filter((c) => c.balance > 0 || c.PharmacyId === pharmacyId)
                            .map((c) => (
                                <MenuItem key={c.PharmacyId} value={c.PharmacyId}>
                                    {c.PharmacyName} · owes {rupees(c.balance)}
                                </MenuItem>
                            ))}
                    </TextField>
                    {options && !options.chemists.some((c) => c.balance > 0) && <Alert severity="info">None of your chemists owes anything.</Alert>}
                    <TextField
                        type="number"
                        label="Amount collected (Rs)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        error={Boolean(tooMuch)}
                        helperText={tooMuch ? `The chemist owes ${rupees(chemist.balance)}` : " "}
                        slotProps={{ htmlInput: { min: 1, step: "0.01" } }}
                    />
                    <TextField select label="Paid by" value={mode} onChange={(e) => setMode(e.target.value)}>
                        {PAYMENT_MODES.map((m) => (
                            <MenuItem key={m.value} value={m.value}>
                                {m.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    {mode !== "CASH" && <TextField label="UTR / cheque / reference number" value={reference} onChange={(e) => setReference(e.target.value.slice(0, 100))} />}
                    {mode === "CASH" && <CameraCapture value={photo} onChange={setPhoto} label="Photo of the cash receipt given to the chemist *" />}
                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        The chemist's dues go down now. Hand cash and cheques to the company: head office marks them received.
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>
                    Cancel
                </Button>
                <Button variant="contained" startIcon={<PaymentsRounded />} disabled={!ready || busy} onClick={save}>
                    {busy ? "Saving…" : "Record payment"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default PaymentDialog;
