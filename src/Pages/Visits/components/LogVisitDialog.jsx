import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    MenuItem,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import {
    CloseRounded,
    CloudOffRounded,
    LocationOffRounded,
    MyLocationRounded,
    PlaceRounded,
    SaveRounded,
    SentimentDissatisfiedRounded,
    SentimentNeutralRounded,
    SentimentSatisfiedAltRounded,
} from "@mui/icons-material";

import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import Tag from "../../../components/Tag/Tag";
import VisitItemsField, { itemsError } from "./VisitItemsField";
import {
    FEEDBACK,
    LOCATION_STATUS,
    MAX_BACKDATE_DAYS,
    NOTES_LIMIT,
    addDays,
    captureLocation,
    clinicDistance,
    formatDistance,
    formatDuration,
    minutesBetween,
    newId,
    timeNow,
    todayKey,
} from "../index";

const FEEDBACK_OPTIONS = [
    { value: "POSITIVE", label: FEEDBACK.POSITIVE.label, icon: SentimentSatisfiedAltRounded },
    { value: "NEUTRAL", label: FEEDBACK.NEUTRAL.label, icon: SentimentNeutralRounded },
    { value: "NEGATIVE", label: FEEDBACK.NEGATIVE.label, icon: SentimentDissatisfiedRounded },
];

// Defaults to a 20-minute call ending now (blank if that would cross midnight).
const defaultTimes = () => {
    const start = timeNow(-20);
    const end = timeNow();
    return minutesBetween(start, end) ? { start, end } : { start: "", end: "" };
};

function LocationStatus({ location, onRetry }) {
    if (location.status === "PENDING") {
        return <Tag icon={MyLocationRounded} label="Getting your location…" color="info" />;
    }

    const config = LOCATION_STATUS[location.status];

    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Tag
                icon={location.status === "CAPTURED" ? PlaceRounded : LocationOffRounded}
                label={
                    location.status === "CAPTURED"
                        ? `${config.label} · ±${location.accuracy} m`
                        : config.label
                }
                color={config.color}
            />

            {location.status !== "CAPTURED" && (
                <Button size="small" onClick={onRetry}>
                    Try again
                </Button>
            )}
        </Stack>
    );
}

// Mounted only while open, so every visit starts with a fresh id and GPS fix.
function LogVisitDialog({ doctors, colleagues, stock = [], initialDoctorId, initialDate, initialNotes, online, onClose, onSave }) {
    const today = todayKey();
    const minDate = addDays(today, -MAX_BACKDATE_DAYS);

    const [visitId] = useState(newId);
    const [doctorId, setDoctorId] = useState(initialDoctorId || "");
    const [visitDate, setVisitDate] = useState(initialDate && initialDate <= today ? initialDate : today);
    const [times, setTimes] = useState(defaultTimes);
    const [jointWork, setJointWork] = useState(false);
    const [jointWorkUserId, setJointWorkUserId] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [notes, setNotes] = useState(() => String(initialNotes || "").slice(0, NOTES_LIMIT));
    const [followUpDate, setFollowUpDate] = useState("");
    const [location, setLocation] = useState({ status: "PENDING" });
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [geofenceReason, setGeofenceReason] = useState("");

    const locate = () => {
        setLocation({ status: "PENDING" });
        captureLocation().then(setLocation);
    };

    useEffect(() => {
        captureLocation().then(setLocation);
    }, []);

    const doctor = useMemo(
        () => doctors.find((item) => item.DoctorId === doctorId) || null,
        [doctors, doctorId]
    );

    const duration = minutesBetween(times.start, times.end);
    const fence = clinicDistance(location, doctor);

    const error = (() => {
        if (visitDate > today) return "The visit date cannot be in the future.";
        if (visitDate < minDate) return `Visits older than ${MAX_BACKDATE_DAYS} days cannot be logged.`;
        if (times.start && times.end && !duration) return "End time must be after the start time.";
        if (followUpDate && followUpDate < visitDate) return "Follow-up cannot be before the visit.";
        return itemsError(items, stock);
    })();

    const canSave =
        doctor && visitDate && !error && (!jointWork || jointWorkUserId) && location.status !== "PENDING";

    const handleSave = async () => {
        setSaving(true);

        const saved = await onSave(
            {
                VisitId: visitId,
                DoctorId: doctorId,
                VisitDate: visitDate,
                StartTime: times.start || null,
                EndTime: times.end || null,
                JointWorkUserId: jointWork ? jointWorkUserId : null,
                Feedback: feedback,
                Notes: notes.trim() || null,
                FollowUpDate: followUpDate || null,
                Location: location,
                GeofenceReason: fence?.outside && geofenceReason.trim() ? geofenceReason.trim() : null,
                RecordedOffline: !online,
                RecordedAt: new Date().toISOString(),
                Items: items.map((item) => ({
                    ItemType: item.ItemType,
                    ItemId: item.ItemId,
                    ItemName: item.ItemName,
                    Quantity: Number(item.Quantity),
                })),
            },
            doctor
        );

        setSaving(false);

        if (saved) onClose();
    };

    return (
        <Dialog
            open
            onClose={saving ? undefined : onClose}
            fullWidth
            slotProps={{
                paper: {
                    sx: (theme) => ({
                        maxWidth: theme.dialog.width,
                        backgroundColor: theme.palette.background.paper,
                    }),
                },
            }}
        >
            <DialogTitle
                component="div"
                sx={(theme) => ({
                    px: theme.dialog.paddingX,
                    pt: theme.dialog.paddingY,
                    pb: 1,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                })}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="overline"
                        component="p"
                        sx={(theme) => ({ color: theme.palette.primary.main })}
                    >
                        New visit
                    </Typography>
                    <Typography variant="h5" component="h2">
                        Log a doctor visit
                    </Typography>
                </Box>

                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={(theme) => ({
                    px: theme.dialog.paddingX,
                    pt: `${theme.spacing(1)} !important`,
                })}
            >
                <Stack spacing={2.5}>
                    {!online && (
                        <Alert severity="warning" variant="outlined" icon={<CloudOffRounded />}>
                            You're offline. The visit will be saved on this device and synced
                            automatically when you're back online.
                        </Alert>
                    )}

                    <LocationStatus location={location} onRetry={locate} />

                    {fence?.outside && (
                        <Alert severity="warning" variant="outlined">
                            You are about {formatDistance(fence.distance)} from Dr. {doctor.DoctorName}&apos;s clinic (limit {fence.limit} m). You can still log the visit; it will be flagged for your manager.
                            <TextField
                                fullWidth
                                size="small"
                                sx={{ mt: 1.25 }}
                                label="Reason (optional), e.g. met the doctor at the hospital"
                                value={geofenceReason}
                                onChange={(event) => setGeofenceReason(event.target.value.slice(0, 300))}
                            />
                        </Alert>
                    )}
                    {doctor && fence === null && location.status === "CAPTURED" && doctor.ClinicLatitude == null && (
                        <Alert severity="info" variant="outlined">
                            This doctor&apos;s clinic is not pinned yet. Ask to pin it from My Doctors (Request edit, then "The clinic has moved") while you are there.
                        </Alert>
                    )}

                    <Autocomplete
                        options={doctors}
                        value={doctor}
                        onChange={(event, value) => setDoctorId(value?.DoctorId || "")}
                        getOptionLabel={(option) => option.DoctorName || ""}
                        isOptionEqualToValue={(option, value) => option.DoctorId === value.DoctorId}
                        noOptionsText="No doctors are assigned to you"
                        renderOption={(props, option) => {
                            const { key, ...rest } = props;

                            return (
                                <Box component="li" key={key} {...rest}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="body2">{option.DoctorName}</Typography>
                                        <Typography
                                            variant="caption"
                                            sx={(theme) => ({ color: theme.palette.text.secondary })}
                                        >
                                            {[option.Category && `Class ${option.Category}`, option.HospitalName, option.AreaName]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        }}
                        renderInput={(params) => <TextField {...params} label="Doctor" required />}
                    />

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(3, minmax(0, 1fr))" },
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Date"
                            type="date"
                            required
                            value={visitDate}
                            onChange={(event) => setVisitDate(event.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { min: minDate, max: today },
                            }}
                        />
                        <TextField
                            label="Start"
                            type="time"
                            value={times.start}
                            onChange={(event) => setTimes((current) => ({ ...current, start: event.target.value }))}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <TextField
                            label="End"
                            type="time"
                            value={times.end}
                            onChange={(event) => setTimes((current) => ({ ...current, end: event.target.value }))}
                            helperText={duration ? formatDuration(duration) : " "}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Doctor's response
                        </Typography>
                        <SegmentedControl
                            fullWidth
                            value={feedback}
                            options={FEEDBACK_OPTIONS}
                            onChange={setFeedback}
                        />
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Notes"
                        placeholder="What was discussed, products detailed, requests…"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value.slice(0, NOTES_LIMIT))}
                        helperText={`${notes.length}/${NOTES_LIMIT}`}
                        slotProps={{ formHelperText: { sx: { textAlign: "right" } } }}
                    />

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
                            gap: 2,
                            alignItems: "start",
                        }}
                    >
                        <TextField
                            label="Follow-up on (optional)"
                            type="date"
                            value={followUpDate}
                            onChange={(event) => setFollowUpDate(event.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { min: visitDate },
                            }}
                        />

                        <Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={jointWork}
                                        onChange={(event) => setJointWork(event.target.checked)}
                                    />
                                }
                                label="Joint work"
                            />

                            {jointWork && (
                                <TextField
                                    select
                                    fullWidth
                                    required
                                    label="Worked with"
                                    value={jointWorkUserId}
                                    onChange={(event) => setJointWorkUserId(event.target.value)}
                                    sx={{ mt: 1 }}
                                >
                                    {colleagues.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        </Box>
                    </Box>

                    <VisitItemsField stock={stock} value={items} onChange={setItems} />

                    {error && (
                        <Alert severity="error" variant="outlined">
                            {error}
                        </Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions
                sx={(theme) => ({
                    px: theme.dialog.paddingX,
                    pb: theme.dialog.paddingY,
                    pt: 1,
                    gap: 1,
                })}
            >
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    startIcon={online ? <SaveRounded /> : <CloudOffRounded />}
                    disabled={!canSave || saving}
                    onClick={handleSave}
                >
                    {online ? "Log visit" : "Save offline"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default LogVisitDialog;
