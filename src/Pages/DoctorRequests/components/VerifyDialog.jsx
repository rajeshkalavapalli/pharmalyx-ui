import { useState } from "react";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from "@mui/material";
import { CloseRounded, SendRounded } from "@mui/icons-material";

import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { errorMessage, submitVerification, uploadPhoto } from "../index";
import { CameraCapture } from "./LiveCapture";

const METHODS = [
    { value: "REGISTRATION_NO", label: "Registration no." },
    { value: "PHONE", label: "Phone" },
    { value: "DOCUMENT", label: "Pad / card photo" },
];

const HELP = {
    REGISTRATION_NO: "The number from the doctor's certificate or letterhead. Your manager checks it, e.g. on the medical council website.",
    PHONE: "The doctor's own number. Your manager calls to confirm it is really the doctor.",
    DOCUMENT: "Take a photo of the doctor's prescription pad or visiting card with the camera. Your manager checks the name matches.",
};

// MR sends one proof that the doctor is genuine; the manager accepts it.
function VerifyDialog({ doctor, onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();
    const [method, setMethod] = useState("REGISTRATION_NO");
    const [value, setValue] = useState("");
    const [council, setCouncil] = useState("");
    const [kind, setKind] = useState("PRESCRIPTION_PAD");
    const [photo, setPhoto] = useState(null);
    const [saving, setSaving] = useState(false);

    const ready = method === "DOCUMENT" ? Boolean(photo) : method === "PHONE" ? value.replace(/\D/g, "").length >= 10 : value.replace(/[^a-z0-9]/gi, "").length >= 3;

    const submit = async () => {
        setSaving(true);

        try {
            const payload = { Method: method };
            if (method === "DOCUMENT") Object.assign(payload, { Kind: kind, PhotoId: (await uploadPhoto(photo)).photoId });
            else Object.assign(payload, { Value: value.trim(), Council: council.trim() || null });

            const response = await submitVerification(doctor.DoctorId, payload);
            showSnackbar(response?.message || "Sent to your manager", "success");
            onSaved();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to send the proof"), "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2 })}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        Verify doctor
                    </Typography>
                    <Typography variant="h5" component="h2">
                        Dr. {String(doctor.DoctorName || "").replace(/^dr\.?\s*/i, "")}
                    </Typography>
                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        One proof is enough. Your manager accepts it and the doctor becomes verified.
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <SegmentedControl value={method} onChange={(next) => { setMethod(next); setValue(""); }} options={METHODS} fullWidth />
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {HELP[method]}
                    </Typography>

                    {method === "REGISTRATION_NO" && (
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "2fr 1fr" }, gap: 2 }}>
                            <TextField autoFocus label="Registration number" value={value} onChange={(event) => setValue(event.target.value.slice(0, 40))} />
                            <TextField label="Council (optional)" placeholder="e.g. AP Medical Council" value={council} onChange={(event) => setCouncil(event.target.value.slice(0, 60))} />
                        </Box>
                    )}
                    {method === "PHONE" && <TextField autoFocus label="Doctor's phone number" inputMode="tel" value={value} onChange={(event) => setValue(event.target.value.slice(0, 20))} />}
                    {method === "DOCUMENT" && (
                        <>
                            <SegmentedControl
                                value={kind}
                                onChange={setKind}
                                options={[
                                    { value: "PRESCRIPTION_PAD", label: "Prescription pad" },
                                    { value: "VISITING_CARD", label: "Visiting card" },
                                ]}
                            />
                            <CameraCapture value={photo} onChange={setPhoto} label={kind === "PRESCRIPTION_PAD" ? "Prescription pad photo" : "Visiting card photo"} />
                        </>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="contained" startIcon={<SendRounded />} onClick={submit} disabled={!ready || saving}>
                    Send to manager
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default VerifyDialog;
