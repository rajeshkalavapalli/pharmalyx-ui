import { useState } from "react";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { CloseRounded } from "@mui/icons-material";

import { formatMoney, formatMonth } from "../index";

const isAmount = (value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0);

// Mounted per doctor (via `key`), so it starts from that doctor's values.
function BusinessEntryDialog({ doctor, month, isFuture, saving, onClose, onSave }) {
    const [expected, setExpected] = useState(doctor.ExpectedValue ?? "");
    const [actual, setActual] = useState(doctor.ActualValue ?? "");
    const [remarks, setRemarks] = useState(doctor.Remarks || "");

    const valid = expected !== "" && isAmount(expected) && isAmount(actual);
    const rupee = { input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }, htmlInput: { min: 0, step: 100 } };

    return (
        <Dialog
            open
            onClose={saving ? undefined : onClose}
            fullWidth
            slotProps={{ paper: { sx: (theme) => ({ maxWidth: theme.dialog.width, backgroundColor: theme.palette.background.paper }) } }}
        >
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2 })}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        {formatMonth(month)}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        Dr. {doctor.DoctorName}
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    {doctor.PreviousActual != null && (
                        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            Last month's actual: {formatMoney(doctor.PreviousActual)}
                        </Typography>
                    )}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField fullWidth required label="Expected value" type="number" value={expected} onChange={(event) => setExpected(event.target.value)} slotProps={rupee} />
                        <TextField
                            fullWidth
                            label="Actual value"
                            type="number"
                            value={actual}
                            disabled={isFuture}
                            helperText={isFuture ? "Enter once the month has started" : " "}
                            onChange={(event) => setActual(event.target.value)}
                            slotProps={rupee}
                        />
                    </Stack>
                    <TextField multiline minRows={2} label="Remarks (optional)" value={remarks} onChange={(event) => setRemarks(event.target.value.slice(0, 300))} />
                </Stack>
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disabled={!valid || saving}
                    onClick={() =>
                        onSave({
                            DoctorId: doctor.DoctorId,
                            BusinessMonth: month,
                            ExpectedValue: Number(expected),
                            ActualValue: actual === "" || isFuture ? null : Number(actual),
                            Remarks: remarks.trim() || null,
                        })
                    }
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default BusinessEntryDialog;
