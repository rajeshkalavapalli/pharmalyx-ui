import { useCallback, useEffect, useState } from "react";

import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import { AddRounded, LocalHospitalRounded, MyLocationRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { captureLocation, errorMessage, getHospitalDoctors, getHospitals, saveHospital, setHospitalDoctors } from "../index";

const EMPTY = { HospitalName: "", Latitude: "", Longitude: "", RadiusM: 200 };

// Multi-speciality hospitals: several doctors at one place, one radius. Visits to them can follow each other
// inside the hospital, but their times must not overlap.
function HospitalsTab({ canEdit }) {
    const { showSnackbar } = useSnackbar();
    const [rows, setRows] = useState(null);
    const [editing, setEditing] = useState(null);
    const [doctorsFor, setDoctorsFor] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        getHospitals()
            .then((result) => setRows(result.hospitals))
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load hospitals"), "error"));
    }, [showSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    const save = async () => {
        setBusy(true);
        try {
            const { HospitalId, ...body } = editing;
            const result = await saveHospital(HospitalId, { ...body, RadiusM: Number(body.RadiusM) });
            showSnackbar(result.message, "success");
            setEditing(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Could not save"), "error");
        } finally {
            setBusy(false);
        }
    };

    const openDoctors = async (hospital) => {
        const result = await getHospitalDoctors(hospital.HospitalId, hospital.AreaId);
        setDoctorsFor({ hospital, doctors: result.doctors, selected: new Set(result.doctors.filter((d) => d.HospitalId).map((d) => d.DoctorId)) });
    };

    const saveDoctors = async () => {
        const before = new Set(doctorsFor.doctors.filter((d) => d.HospitalId).map((d) => d.DoctorId));
        const add = [...doctorsFor.selected].filter((id) => !before.has(id));
        const remove = [...before].filter((id) => !doctorsFor.selected.has(id));
        setBusy(true);
        try {
            await setHospitalDoctors(doctorsFor.hospital.HospitalId, add, remove);
            setDoctorsFor(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Could not save"), "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack spacing={2}>
            <Panel
                title="Hospitals"
                subtitle="Doctors in a hospital are checked against the hospital's location and radius."
                actions={
                    canEdit && (
                        <Button variant="contained" startIcon={<AddRounded />} onClick={() => setEditing({ ...EMPTY })}>
                            Add hospital
                        </Button>
                    )
                }
            >
                {rows?.length ? (
                    <Stack divider={<Divider />}>
                        {rows.map((row) => (
                            <Stack key={row.HospitalId} direction={{ xs: "column", sm: "row" }} sx={{ py: 1.25, gap: 1, alignItems: { sm: "center" } }}>
                                <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" sx={{ gap: 0.75, alignItems: "center" }}>
                                        <Typography variant="subtitle2">{row.HospitalName}</Typography>
                                        {!row.IsActive && <Tag label="Inactive" color="secondary" />}
                                    </Stack>
                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {row.Doctors} doctor(s) · radius {row.RadiusM} m · {Number(row.Latitude).toFixed(5)}, {Number(row.Longitude).toFixed(5)}
                                    </Typography>
                                </Box>
                                {canEdit && (
                                    <Stack direction="row" sx={{ gap: 1 }}>
                                        <Button size="small" onClick={() => openDoctors(row)}>
                                            Doctors
                                        </Button>
                                        <Button size="small" onClick={() => setEditing({ HospitalId: row.HospitalId, HospitalName: row.HospitalName, Latitude: row.Latitude, Longitude: row.Longitude, RadiusM: row.RadiusM, AreaId: row.AreaId, IsActive: Boolean(row.IsActive) })}>
                                            Edit
                                        </Button>
                                    </Stack>
                                )}
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={LocalHospitalRounded} title={rows ? "No hospitals yet" : "Loading…"} />
                )}
            </Panel>

            {editing && (
                <Dialog open fullWidth maxWidth="sm" onClose={() => setEditing(null)} slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
                    <DialogTitle>{editing.HospitalId ? "Edit hospital" : "Add hospital"}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <TextField label="Hospital name" value={editing.HospitalName} onChange={(e) => setEditing((h) => ({ ...h, HospitalName: e.target.value.slice(0, 200) }))} />
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 2 }}>
                                <TextField label="Latitude" value={editing.Latitude} onChange={(e) => setEditing((h) => ({ ...h, Latitude: e.target.value }))} />
                                <TextField label="Longitude" value={editing.Longitude} onChange={(e) => setEditing((h) => ({ ...h, Longitude: e.target.value }))} />
                                <TextField type="number" label="Radius (m)" value={editing.RadiusM} onChange={(e) => setEditing((h) => ({ ...h, RadiusM: e.target.value }))} />
                            </Box>
                            <Button
                                startIcon={<MyLocationRounded />}
                                sx={{ alignSelf: "flex-start" }}
                                onClick={async () => {
                                    const fix = await captureLocation();
                                    if (fix.status === "CAPTURED") setEditing((h) => ({ ...h, Latitude: fix.latitude.toFixed(6), Longitude: fix.longitude.toFixed(6) }));
                                }}
                            >
                                Use my current location
                            </Button>
                            {editing.HospitalId && (
                                <FormControlLabel control={<Checkbox checked={editing.IsActive} onChange={(e) => setEditing((h) => ({ ...h, IsActive: e.target.checked }))} />} label="Active" />
                            )}
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditing(null)}>Cancel</Button>
                        <Button variant="contained" onClick={save} disabled={busy}>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {doctorsFor && (
                <Dialog open fullWidth maxWidth="sm" onClose={() => setDoctorsFor(null)} slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
                    <DialogTitle>Doctors in {doctorsFor.hospital.HospitalName}</DialogTitle>
                    <DialogContent>
                        {doctorsFor.doctors.length ? (
                            doctorsFor.doctors.map((doctor) => (
                                <FormControlLabel
                                    key={doctor.DoctorId}
                                    sx={{ display: "flex" }}
                                    control={
                                        <Checkbox
                                            checked={doctorsFor.selected.has(doctor.DoctorId)}
                                            onChange={(e) =>
                                                setDoctorsFor((current) => {
                                                    const selected = new Set(current.selected);
                                                    if (e.target.checked) selected.add(doctor.DoctorId);
                                                    else selected.delete(doctor.DoctorId);
                                                    return { ...current, selected };
                                                })
                                            }
                                        />
                                    }
                                    label={`${doctor.DoctorName}${doctor.Speciality ? ` · ${doctor.Speciality}` : ""}`}
                                />
                            ))
                        ) : (
                            <Typography variant="body2">No doctors in this hospital&apos;s area. Set the hospital&apos;s area or add doctors first.</Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDoctorsFor(null)}>Cancel</Button>
                        <Button variant="contained" onClick={saveDoctors} disabled={busy}>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Stack>
    );
}

export default HospitalsTab;
