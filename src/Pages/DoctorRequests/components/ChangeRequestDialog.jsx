import { useEffect, useMemo, useState } from "react";

import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { CloseRounded, SendRounded } from "@mui/icons-material";

import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { errorMessage, getOptions, requestChange, resubmitRequest, uploadPhoto } from "../index";
import { CameraCapture, LocationStatus } from "./LiveCapture";
import useLiveLocation from "./useLiveLocation";

const MIN_REASON = 10;

// MR asks to edit or delete an assigned doctor. A reason is required; nothing changes until the manager approves.
// With `resubmit` ({ requestId, type, remarks, reviewedBy, proposed }) it reopens a rejected request, filled in, to fix and send again.
function ChangeRequestDialog({ doctor, initialType = "EDIT", resubmit = null, onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();
    const location = useLiveLocation();

    const proposed = resubmit?.type === "EDIT" ? resubmit.proposed || {} : {};
    const start = { ...doctor, ...proposed };

    const [type, setType] = useState(resubmit?.type || initialType);
    const [options, setOptions] = useState({ territories: [], specialities: [] });
    const [form, setForm] = useState({
        DoctorName: start.DoctorName || "",
        Speciality: start.Speciality || "",
        Qualification: start.Qualification || "",
        HospitalName: start.HospitalName || "",
        MobileNumber: start.MobileNumber || "",
        EmailId: start.EmailId || "",
        Category: start.Category || "",
        VisitsPerMonth: start.VisitsPerMonth ?? "",
        TerritoryId: String(start.TerritoryId || "").toUpperCase(),
        AreaId: String(start.AreaId || "").toUpperCase(),
        // A new doctor keeps its registration no.; an edit only sends one when typed.
        RegistrationNumber: (resubmit?.type === "CREATE" ? doctor.RegistrationNumber : proposed.RegistrationNumber) || "",
    });
    const [moveClinic, setMoveClinic] = useState(proposed.ClinicLatitude != null);
    const [photo, setPhoto] = useState(null);
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);

    const set = (patch) => setForm((current) => ({ ...current, ...patch }));

    useEffect(() => {
        getOptions().then(setOptions).catch(() => {});
    }, []);

    useEffect(() => {
        if (moveClinic) location.start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moveClinic]);

    const areas = useMemo(() => options.territories.find((item) => String(item.TerritoryId).toUpperCase() === form.TerritoryId)?.areas || [], [options, form.TerritoryId]);

    const isCreate = type === "CREATE";
    const hasDetails = type === "EDIT" || isCreate;
    const requiredOk = !isCreate || (form.DoctorName.trim().length >= 3 && form.Speciality.trim() && form.TerritoryId && form.AreaId);
    const ready = reason.trim().length >= MIN_REASON && requiredOk && (type === "DELETE" || !moveClinic || location.status === "CAPTURED");

    const submit = async () => {
        setSaving(true);

        try {
            const payload = { RequestType: type, Comment: reason.trim() };

            if (hasDetails) {
                const changes = { ...form, VisitsPerMonth: form.VisitsPerMonth === "" ? null : form.VisitsPerMonth, Category: form.Category || null };
                if (!changes.RegistrationNumber) {
                    if (isCreate) changes.RegistrationNumber = null;
                    else delete changes.RegistrationNumber;
                }
                payload.Changes = changes;

                if (moveClinic) {
                    Object.assign(payload, { MoveClinic: true, LocationStatus: "CAPTURED", Latitude: location.fix.latitude, Longitude: location.fix.longitude, Accuracy: location.fix.accuracy });
                    if (photo) payload.PhotoId = (await uploadPhoto(photo)).photoId;
                }
            }

            const response = resubmit ? await resubmitRequest(resubmit.requestId, payload) : await requestChange(doctor.DoctorId, payload);
            showSnackbar(response?.message || "Request sent", "success");
            onSaved();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to send the request"), "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2 })}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        {resubmit ? "Fix and send again" : "Request a change"}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        Dr. {String(doctor.DoctorName || "").replace(/^dr\.?\s*/i, "")}
                    </Typography>
                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Your manager approves first; nothing changes until then. The request and your reason are kept for future reference.
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    {resubmit ? (
                        <Alert severity="warning" variant="outlined">
                            <Typography variant="caption" component="p" sx={{ fontWeight: "fontWeightSemibold" }}>
                                Rejected{resubmit.reviewedBy ? ` by ${resubmit.reviewedBy}` : ""}
                            </Typography>
                            {resubmit.remarks || "No reason given."}
                        </Alert>
                    ) : (
                        <SegmentedControl
                            value={type}
                            onChange={setType}
                            options={[
                                { value: "EDIT", label: "Edit details" },
                                { value: "DELETE", label: "Remove doctor" },
                            ]}
                        />
                    )}

                    {resubmit && type === "DELETE" && (
                        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            You are asking again to remove this doctor. Explain below what has changed or answer your manager&apos;s question.
                        </Typography>
                    )}

                    {hasDetails && (
                        <>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
                                <TextField required={isCreate} label="Doctor name" value={form.DoctorName} onChange={(event) => set({ DoctorName: event.target.value.slice(0, 150) })} />
                                <TextField required={isCreate} label="Speciality" value={form.Speciality} onChange={(event) => set({ Speciality: event.target.value.slice(0, 100) })} />
                                <TextField label="Qualification" value={form.Qualification} onChange={(event) => set({ Qualification: event.target.value.slice(0, 200) })} />
                                <TextField label="Clinic / hospital" value={form.HospitalName} onChange={(event) => set({ HospitalName: event.target.value.slice(0, 200) })} />
                                <TextField select label="Territory" value={form.TerritoryId} onChange={(event) => set({ TerritoryId: event.target.value, AreaId: "" })}>
                                    {options.territories.map((item) => (
                                        <MenuItem key={item.TerritoryId} value={String(item.TerritoryId).toUpperCase()}>
                                            {item.TerritoryName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField select label="Area" value={form.AreaId} onChange={(event) => set({ AreaId: event.target.value })}>
                                    {areas.map((item) => (
                                        <MenuItem key={item.AreaId} value={String(item.AreaId).toUpperCase()}>
                                            {item.AreaName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField label="Phone" value={form.MobileNumber} onChange={(event) => set({ MobileNumber: event.target.value.slice(0, 20) })} />
                                <TextField label="Registration no. (if you have it)" value={form.RegistrationNumber} onChange={(event) => set({ RegistrationNumber: event.target.value.slice(0, 40) })} />
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

                            <FormControlLabel control={<Checkbox checked={moveClinic} onChange={(event) => setMoveClinic(event.target.checked)} />} label={isCreate ? "The clinic location was wrong. Pin it again (I am at the clinic now)." : "The clinic has moved. Pin the new location (I am at the new clinic now)."} />
                            {moveClinic && (
                                <>
                                    <LocationStatus location={location} label="New clinic location" />
                                    <CameraCapture value={photo} onChange={setPhoto} label="New signboard photo (recommended)" />
                                </>
                            )}
                        </>
                    )}

                    <TextField
                        multiline
                        minRows={3}
                        required
                        label={resubmit ? "What did you fix? (your manager sees this)" : type === "DELETE" ? "Why should this doctor be removed?" : "Why do these details need to change?"}
                        value={reason}
                        onChange={(event) => setReason(event.target.value.slice(0, 1000))}
                        error={Boolean(reason) && reason.trim().length < MIN_REASON}
                        helperText={reason.trim().length < MIN_REASON ? `At least ${MIN_REASON} characters` : `${reason.length}/1000`}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="contained" color={type === "DELETE" ? "error" : "primary"} startIcon={<SendRounded />} onClick={submit} disabled={!ready || saving}>
                    {resubmit ? "Send again" : "Send to manager"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ChangeRequestDialog;
