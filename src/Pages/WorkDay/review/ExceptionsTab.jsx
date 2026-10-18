import { useCallback, useEffect, useState } from "react";

import { Box, Button, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AddRounded, BlockRounded, VerifiedUserRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { EXCEPTION_TYPES, errorMessage, formatDay, getDoctorsOf, getExceptions, grantException, revokeException } from "../index";

const EMPTY = { UserId: "", ExceptionType: "SPECIAL_DUTY", DoctorId: "", CoverUserId: "", FromDate: "", ToDate: "", Reason: "" };

// Head office only: let work outside the boundary count (a doctor just outside, leave cover, special duty).
function ExceptionsTab({ people, canGrant }) {
    const { showSnackbar } = useSnackbar();
    const [rows, setRows] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [doctors, setDoctors] = useState([]);
    const [revoking, setRevoking] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        getExceptions()
            .then((result) => setRows(result.exceptions))
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load exceptions"), "error"));
    }, [showSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (form.ExceptionType !== "DOCTOR" || !form.UserId) return;
        getDoctorsOf(form.UserId)
            .then((result) => setDoctors(result.doctors))
            .catch(() => setDoctors([]));
    }, [form.ExceptionType, form.UserId]);

    const set = (patch) => setForm((current) => ({ ...current, ...patch }));

    const grant = async () => {
        setBusy(true);
        try {
            const result = await grantException({ ...form, DoctorId: form.DoctorId || null, CoverUserId: form.CoverUserId || null, FromDate: form.FromDate || null, ToDate: form.ToDate || null });
            showSnackbar(result.message, "success");
            setForm(EMPTY);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Could not grant"), "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack spacing={2}>
            {canGrant && (
                <Panel title="Grant an exception" subtitle="Only head office can grant these. Each one is logged with your name and reason.">
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
                        <TextField select label="Employee" value={form.UserId} onChange={(e) => set({ UserId: e.target.value, DoctorId: "" })}>
                            {people.map((person) => (
                                <MenuItem key={person.UserId} value={person.UserId}>
                                    {person.Name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Type" value={form.ExceptionType} onChange={(e) => set({ ExceptionType: e.target.value })}>
                            {EXCEPTION_TYPES.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        {form.ExceptionType === "DOCTOR" && (
                            <TextField select label="Doctor" value={form.DoctorId} onChange={(e) => set({ DoctorId: e.target.value })} disabled={!form.UserId}>
                                {doctors.map((doctor) => (
                                    <MenuItem key={doctor.DoctorId} value={doctor.DoctorId}>
                                        {doctor.DoctorName} {doctor.AreaName ? `· ${doctor.AreaName}` : ""}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                        {form.ExceptionType === "COVER" && (
                            <TextField select label="Covering for" value={form.CoverUserId} onChange={(e) => set({ CoverUserId: e.target.value })}>
                                {people
                                    .filter((person) => person.UserId !== form.UserId)
                                    .map((person) => (
                                        <MenuItem key={person.UserId} value={person.UserId}>
                                            {person.Name}
                                        </MenuItem>
                                    ))}
                            </TextField>
                        )}
                        <TextField type="date" label={form.ExceptionType === "DOCTOR" ? "From (optional)" : "From"} value={form.FromDate} onChange={(e) => set({ FromDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                        <TextField type="date" label={form.ExceptionType === "DOCTOR" ? "To (optional)" : "To"} value={form.ToDate} onChange={(e) => set({ ToDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                        <TextField sx={{ gridColumn: { md: "1 / -1" } }} label="Reason (at least 10 characters)" value={form.Reason} onChange={(e) => set({ Reason: e.target.value.slice(0, 500) })} />
                    </Box>
                    <Button sx={{ mt: 2 }} variant="contained" startIcon={<AddRounded />} disabled={busy || !form.UserId || form.Reason.trim().length < 10} onClick={grant}>
                        Grant
                    </Button>
                </Panel>
            )}

            <Panel title="Exceptions" subtitle="Active first.">
                {rows?.length ? (
                    <Stack divider={<Divider />}>
                        {rows.map((row) => (
                            <Stack key={row.ExceptionId} direction={{ xs: "column", md: "row" }} sx={{ py: 1.25, gap: 1, alignItems: { md: "center" } }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                                        <Typography variant="subtitle2">{row.UserName}</Typography>
                                        <Tag label={EXCEPTION_TYPES.find((t) => t.value === row.ExceptionType)?.label || row.ExceptionType} color="info" />
                                        {row.RevokedOn ? <Tag label="Revoked" color="secondary" /> : <Tag label="Active" color="success" />}
                                    </Stack>
                                    <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {[
                                            row.DoctorName ? `Dr. ${row.DoctorName}` : null,
                                            row.CoverUserName ? `covering ${row.CoverUserName}` : null,
                                            row.FromDate ? `${formatDay(row.FromDate)} – ${formatDay(row.ToDate)}` : "no end date",
                                            `granted by ${row.GrantedByName}`,
                                        ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </Typography>
                                    <Typography variant="body2">{row.Reason}</Typography>
                                </Box>
                                {canGrant && !row.RevokedOn && (
                                    <Button size="small" color="error" startIcon={<BlockRounded />} onClick={() => setRevoking(row)}>
                                        Revoke
                                    </Button>
                                )}
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={VerifiedUserRounded} title={rows ? "No exceptions" : "Loading…"} />
                )}
            </Panel>

            {revoking && (
                <ConfirmActionDialog
                    icon={BlockRounded}
                    color="error"
                    title="Revoke this exception?"
                    message={`${revoking.UserName}: ${revoking.Reason}`}
                    confirmLabel="Revoke"
                    remarks="required"
                    remarksLabel="Why revoke?"
                    remarksLimit={500}
                    busy={busy}
                    onClose={() => setRevoking(null)}
                    onConfirm={async (reason) => {
                        setBusy(true);
                        try {
                            await revokeException(revoking.ExceptionId, reason);
                            setRevoking(null);
                            load();
                        } catch (err) {
                            showSnackbar(errorMessage(err, "Could not revoke"), "error");
                        } finally {
                            setBusy(false);
                        }
                    }}
                />
            )}
        </Stack>
    );
}

export default ExceptionsTab;
