import { useEffect, useState } from "react";

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AddRounded, DeleteOutlineRounded, LocalShippingRounded } from "@mui/icons-material";

import { CameraCapture, LocationStatus } from "../DoctorRequests/components/LiveCapture";
import useLiveLocation from "../DoctorRequests/components/useLiveLocation";
import { createDelivery, errorMessage, getOptions, rupees, uploadPhoto } from "./index";

const muted = (theme) => ({ color: theme.palette.text.secondary });

// MR: give company stock straight to a chemist. Price comes from the catalogue; the chemist's stamped
// receipt is photographed in the app; GPS, date, time and the MR are saved automatically.
function DeliveryDialog({ open, onClose, onSaved }) {
    const location = useLiveLocation();
    const [options, setOptions] = useState(null);
    const [error, setError] = useState("");
    const [pharmacyId, setPharmacyId] = useState("");
    const [lines, setLines] = useState([{ BatchId: "", Quantity: "" }]);
    const [photo, setPhoto] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [busy, setBusy] = useState(false);
    const { start } = location;

    useEffect(() => {
        if (!open) return;
        setError("");
        setPharmacyId("");
        setLines([{ BatchId: "", Quantity: "" }]);
        setPhoto(null);
        setRemarks("");
        getOptions()
            .then(setOptions)
            .catch((err) => setError(errorMessage(err, "Couldn't load your chemists and stock")));
        start();
    }, [open, start]);

    const chemist = options?.chemists.find((c) => c.PharmacyId === pharmacyId);
    const stockOf = (batchId) => options?.stock.find((s) => s.BatchId === batchId);
    const total = lines.reduce((sum, l) => sum + (stockOf(l.BatchId)?.UnitPrice || 0) * (Number(l.Quantity) || 0), 0);

    const lineError = lines
        .map((l, i) => {
            const s = stockOf(l.BatchId);
            if (!l.BatchId) return `Line ${i + 1}: choose a batch`;
            if (!(Number(l.Quantity) >= 1)) return `Line ${i + 1}: enter the quantity`;
            if (s && Number(l.Quantity) > s.Quantity) return `Line ${i + 1}: you hold only ${s.Quantity}`;
            return null;
        })
        .find(Boolean);
    const overLimit = chemist?.limit != null && chemist.balance + total > chemist.limit;
    const ready = chemist && !chemist.blocked && !overLimit && !lineError && photo && location.status === "CAPTURED";

    const set = (index, patch) => setLines((current) => current.map((l, i) => (i === index ? { ...l, ...patch } : l)));

    const save = async () => {
        setBusy(true);
        setError("");
        try {
            const { photoId } = await uploadPhoto(photo);
            const result = await createDelivery({
                PharmacyId: pharmacyId,
                ReceiptPhotoId: photoId,
                Location: { status: "CAPTURED", latitude: location.fix.latitude, longitude: location.fix.longitude, accuracy: location.fix.accuracy },
                Lines: lines.map((l) => ({ BatchId: l.BatchId, Quantity: Number(l.Quantity) })),
                Remarks: remarks || undefined,
            });
            onSaved(result.message);
        } catch (err) {
            setError(errorMessage(err, "The delivery could not be saved"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>Deliver stock to a chemist</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField select label="Chemist" value={pharmacyId} onChange={(e) => setPharmacyId(e.target.value)} disabled={!options}>
                        {(options?.chemists || []).map((c) => (
                            <MenuItem key={c.PharmacyId} value={c.PharmacyId}>
                                {c.PharmacyName} · owes {rupees(c.balance)}
                                {c.blocked ? " · on hold" : ""}
                            </MenuItem>
                        ))}
                    </TextField>

                    {chemist?.blocked && (
                        <Alert severity="error" variant="outlined">
                            Deliveries to {chemist.PharmacyName} are on hold: {chemist.reasons.join("; ")}. Collect the dues first.
                        </Alert>
                    )}
                    {chemist && !chemist.blocked && (
                        <Typography variant="caption" sx={muted}>
                            Owes {rupees(chemist.balance)}
                            {chemist.limit != null ? ` · credit limit ${rupees(chemist.limit)}` : " · no credit limit set"}
                            {chemist.oldestDays ? ` · oldest due ${chemist.oldestDays} days` : ""}
                        </Typography>
                    )}

                    {lines.map((line, index) => {
                        const s = stockOf(line.BatchId);
                        return (
                            <Stack key={index} direction="row" sx={{ gap: 1, alignItems: "flex-start" }}>
                                <TextField select size="small" label="Batch in hand" value={line.BatchId} onChange={(e) => set(index, { BatchId: e.target.value })} sx={{ flex: 2 }}>
                                    {(options?.stock || []).map((b) => (
                                        <MenuItem key={b.BatchId} value={b.BatchId} disabled={lines.some((l, i) => i !== index && l.BatchId === b.BatchId)}>
                                            {b.ProductName} · {b.BatchNumber} · {b.Quantity} in hand
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    size="small"
                                    type="number"
                                    label="Qty"
                                    value={line.Quantity}
                                    onChange={(e) => set(index, { Quantity: e.target.value })}
                                    helperText={s ? `${rupees(s.UnitPrice)} each` : " "}
                                    slotProps={{ htmlInput: { min: 1, max: s?.Quantity } }}
                                    sx={{ flex: 1 }}
                                />
                                <IconButton aria-label="Remove line" disabled={lines.length === 1} onClick={() => setLines((current) => current.filter((_, i) => i !== index))}>
                                    <DeleteOutlineRounded />
                                </IconButton>
                            </Stack>
                        );
                    })}
                    <Box>
                        <Button size="small" startIcon={<AddRounded />} disabled={lines.length >= (options?.stock.length || 1)} onClick={() => setLines((current) => [...current, { BatchId: "", Quantity: "" }])}>
                            Add product
                        </Button>
                    </Box>
                    {options && !options.stock.length && <Alert severity="info">You hold no company stock. Head office issues it when a stockist cannot supply.</Alert>}

                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
                        <Typography variant="body2" sx={muted}>
                            Value at catalogue price (added to the chemist's dues)
                        </Typography>
                        <Typography variant="h6">{rupees(total)}</Typography>
                    </Stack>
                    {overLimit && <Alert severity="error">This delivery would take the chemist over the credit limit of {rupees(chemist.limit)}.</Alert>}

                    <LocationStatus location={location} label="At the chemist" />
                    <CameraCapture value={photo} onChange={setPhoto} label="Photo of the chemist's stamped receipt *" />
                    <Typography variant="caption" sx={muted}>
                        Camera only (no gallery). Date, time, GPS and your name are saved. Record it at the chemist (within {options?.chemistRadius ?? 200} m).
                    </Typography>
                    <TextField size="small" label="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value.slice(0, 300))} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>
                    Cancel
                </Button>
                <Button variant="contained" startIcon={<LocalShippingRounded />} disabled={!ready || busy} onClick={save}>
                    {busy ? "Saving…" : "Record delivery"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DeliveryDialog;
