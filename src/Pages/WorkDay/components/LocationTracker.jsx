import { useEffect, useRef, useState } from "react";

import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Typography } from "@mui/material";
import { LocationOnRounded } from "@mui/icons-material";

import { acceptConsent, captureLocation, getConsent, inWorkHours, sendPings } from "../index";

const TICK_MS = 60000;

const POINTS = [
    "Your location is recorded only during work hours, every few minutes, while you are working.",
    "It is used to check visits (were you at the clinic, inside your territory) and to calculate TA from the distance you actually travelled.",
    "It is never recorded outside work hours, on leave, or when you are not using the app.",
    "Your manager sees visit results; head office sees the location data. It is not shared with anyone else.",
    "You can ask head office for your data or to stop, under India's Digital Personal Data Protection Act, 2023.",
];

// Asks once for location consent (DPDP Act), then records the location during work hours
// while the app is open. The server ignores anything outside work hours or before the day has started.
function LocationTracker() {
    const [consent, setConsent] = useState(null);
    const [ticked, setTicked] = useState(false);
    const [saving, setSaving] = useState(false);
    const lastSent = useRef(0);

    useEffect(() => {
        getConsent().then(setConsent).catch(() => setConsent(null));
    }, []);

    useEffect(() => {
        if (!consent?.accepted) return undefined;

        const tick = async () => {
            const due = Date.now() - lastSent.current >= consent.pingIntervalMinutes * 60000;
            if (!due || document.visibilityState !== "visible" || !navigator.onLine) return;
            if (!inWorkHours(consent.workStartHour, consent.workEndHour)) return;

            const fix = await captureLocation();
            if (fix.status !== "CAPTURED") return;

            lastSent.current = Date.now();
            sendPings([{ latitude: fix.latitude, longitude: fix.longitude, accuracy: fix.accuracy, capturedAt: fix.capturedAt }]).catch(() => {});
        };

        tick();
        const timer = setInterval(tick, TICK_MS);
        return () => clearInterval(timer);
    }, [consent]);

    const accept = async () => {
        setSaving(true);
        try {
            await acceptConsent();
            setConsent(await getConsent());
        } finally {
            setSaving(false);
        }
    };

    if (!consent || consent.accepted) return null;

    return (
        <Dialog open fullWidth maxWidth="sm" slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY })}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box sx={(theme) => ({ color: theme.palette.primary.main, display: "grid" })}>
                        <LocationOnRounded />
                    </Box>
                    <Box>
                        <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                            One-time consent
                        </Typography>
                        <Typography variant="h5" component="h2">
                            Location during work hours
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Stack spacing={1.25}>
                    {POINTS.map((point) => (
                        <Typography key={point} variant="body2">
                            • {point}
                        </Typography>
                    ))}
                    <FormControlLabel
                        control={<Checkbox checked={ticked} onChange={(event) => setTicked(event.target.checked)} />}
                        label="I understand and agree to my location being recorded during work hours."
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY })}>
                <Button variant="contained" onClick={accept} disabled={!ticked || saving}>
                    I agree
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default LocationTracker;
