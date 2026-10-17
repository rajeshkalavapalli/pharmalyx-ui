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
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { CloseRounded, SendRounded } from "@mui/icons-material";

import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { checkDuplicates, errorMessage, getOptions, requestNewDoctor, uploadPhoto } from "../index";
import DuplicateMatches from "./DuplicateMatches";
import { CameraCapture, LocationStatus } from "./LiveCapture";
import useLiveLocation from "./useLiveLocation";

const EMPTY = { DoctorName: "", Speciality: "", Qualification: "", HospitalName: "", TerritoryId: "", AreaId: "", MobileNumber: "", RegistrationNumber: "", Category: "", VisitsPerMonth: "", Comment: "" };

// MR adds a doctor at the clinic: details, live GPS and an in-app signboard photo.
// Possible duplicates are shown as they type; the request goes to their manager.
function AddDoctorDialog({ onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();
    const location = useLiveLocation();

    const [options, setOptions] = useState({ territories: [], specialities: [] });
    const [form, setForm] = useState(EMPTY);
    const [photo, setPhoto] = useState(null);
    const [duplicates, setDuplicates] = useState([]);
    const [saving, setSaving] = useState(false);

    const set = (patch) => setForm((current) => ({ ...current, ...patch }));

    useEffect(() => {
        getOptions().then(setOptions).catch(() => {});
        location.start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const areas = useMemo(() => options.territories.find((item) => item.TerritoryId === form.TerritoryId)?.areas || [], [options, form.TerritoryId]);

    // Live duplicate check (debounced) on the fields that identify a doctor.
    const fix = location.fix;
    useEffect(() => {
        const handle = setTimeout(() => {
            checkDuplicates({
                DoctorName: form.DoctorName,
                Speciality: form.Speciality,
                AreaId: form.AreaId || null,
                MobileNumber: form.MobileNumber,
                RegistrationNumber: form.RegistrationNumber,
                Latitude: fix?.latitude ?? null,
                Longitude: fix?.longitude ?? null,
            })
                .then((response) => setDuplicates(response.duplicates || []))
                .catch(() => setDuplicates([]));
        }, 600);
        return () => clearTimeout(handle);
    }, [form.DoctorName, form.Speciality, form.AreaId, form.MobileNumber, form.RegistrationNumber, fix]);

    const registrationClash = duplicates.some((match) => match.doctor.ApprovalStatus === "APPROVED" && match.reasons.some((reason) => reason.reason === "REGISTRATION_NO"));
    const ready = form.DoctorName.trim().length >= 3 && form.Speciality.trim() && form.TerritoryId && form.AreaId && location.status === "CAPTURED" && photo && !registrationClash;

    const submit = async () => {
        setSaving(true);

        try {
            const { photoId } = await uploadPhoto(photo);
            const response = await requestNewDoctor({
                ...form,
                VisitsPerMonth: form.VisitsPerMonth || null,
                Category: form.Category || null,
                LocationStatus: "CAPTURED",
                Latitude: fix.latitude,
                Longitude: fix.longitude,
                Accuracy: fix.accuracy,
                PhotoId: photoId,
            });
            showSnackbar(response?.message || "Sent to your manager", response?.duplicates ? "warning" : "success");
            onSaved();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to send the doctor"), "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="md" slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2 })}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        Add doctor
                    </Typography>
                    <Typography variant="h5" component="h2">
                        New doctor at this clinic
                    </Typography>
                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Fill this in at the clinic. The doctor stays provisional until verified with a registration no., phone, prescription pad / visiting card, or a joint visit.
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
                        <TextField required label="Doctor name" placeholder="e.g. Dr K Rajesh" value={form.DoctorName} onChange={(event) => set({ DoctorName: event.target.value.slice(0, 150) })} />
                        <Autocomplete
                            freeSolo
                            options={options.specialities}
                            inputValue={form.Speciality}
                            onInputChange={(event, value) => set({ Speciality: value.slice(0, 100) })}
                            renderInput={(params) => <TextField {...params} required label="Speciality" />}
                        />
                        <TextField label="Qualification" placeholder="MBBS, MD" value={form.Qualification} onChange={(event) => set({ Qualification: event.target.value.slice(0, 200) })} />
                        <TextField label="Clinic / hospital" value={form.HospitalName} onChange={(event) => set({ HospitalName: event.target.value.slice(0, 200) })} />
                        <TextField select required label="Territory" value={form.TerritoryId} onChange={(event) => set({ TerritoryId: event.target.value, AreaId: "" })}>
                            {options.territories.map((item) => (
                                <MenuItem key={item.TerritoryId} value={item.TerritoryId}>
                                    {item.TerritoryName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField select required label="Area" value={form.AreaId} disabled={!form.TerritoryId} onChange={(event) => set({ AreaId: event.target.value })}>
                            {areas.map((item) => (
                                <MenuItem key={item.AreaId} value={item.AreaId}>
                                    {item.AreaName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Phone (optional)" inputMode="tel" value={form.MobileNumber} onChange={(event) => set({ MobileNumber: event.target.value.slice(0, 20) })} />
                        <TextField label="Registration no. (optional)" value={form.RegistrationNumber} onChange={(event) => set({ RegistrationNumber: event.target.value.slice(0, 40) })} />
                        <TextField select label="Category" value={form.Category} onChange={(event) => set({ Category: event.target.value })}>
                            <MenuItem value="">Not set</MenuItem>
                            {["A", "B", "C"].map((value) => (
                                <MenuItem key={value} value={value}>
                                    Class {value}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField type="number" label="Visits / month" value={form.VisitsPerMonth} onChange={(event) => set({ VisitsPerMonth: event.target.value })} slotProps={{ htmlInput: { min: 1, max: 31 } }} />
                    </Box>

                    <LocationStatus location={location} />
                    <CameraCapture value={photo} onChange={setPhoto} />

                    {registrationClash && (
                        <Alert severity="error" variant="outlined">
                            This registration number already belongs to a doctor. Ask your manager to assign that doctor to you instead.
                        </Alert>
                    )}
                    <DuplicateMatches matches={duplicates} />
                    {duplicates.length > 0 && !registrationClash && (
                        <Alert severity="warning" variant="outlined">
                            If this is the same doctor, close this form and ask your manager to assign the existing doctor to you. You can still send it; your manager will see the comparison.
                        </Alert>
                    )}

                    <TextField multiline minRows={2} label="Note for your manager (optional)" value={form.Comment} onChange={(event) => set({ Comment: event.target.value.slice(0, 1000) })} />
                </Stack>
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="contained" startIcon={<SendRounded />} onClick={submit} disabled={!ready || saving}>
                    {saving ? "Sending…" : "Send to manager"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddDoctorDialog;
