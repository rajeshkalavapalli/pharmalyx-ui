import { useEffect, useState } from "react";

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { SwapHorizRounded } from "@mui/icons-material";

import api from "../../configurations/api-config";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { getMyTeam } from "../MyDoctors/index";

const message = (err, fallback) => err?.response?.data?.message || fallback;

// A rep leaves (or a patch changes hands): move all their doctors to another person, history included.
function HandoverDialog({ onClose, onDone }) {
    const { showSnackbar } = useSnackbar();
    const [team, setTeam] = useState([]);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getMyTeam()
            .then((r) => setTeam((r?.team || []).filter((m) => !m.IsSelf)))
            .catch(() => setTeam([]));
    }, []);

    useEffect(() => {
        let alive = true;
        if (!from || !to) return undefined;
        api.post("/app/doctors/handover/preview", { FromUserId: from, ToUserId: to })
            .then((r) => alive && (setPreview(r.data), setError("")))
            .catch((err) => alive && (setPreview(null), setError(message(err, "Couldn't check the handover"))));
        return () => {
            alive = false;
        };
    }, [from, to]);

    const save = async () => {
        setSaving(true);
        try {
            const r = await api.post("/app/doctors/handover", { FromUserId: from, ToUserId: to });
            showSnackbar(r.data?.message || "Doctors handed over", "success");
            onDone?.();
            onClose();
        } catch (err) {
            setError(message(err, "Couldn't hand over the doctors"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Hand over doctors</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                    All active doctors move to the new person. Visits, samples and prescriptions stay with each doctor, so nothing is lost when someone leaves.
                </Typography>
                <Stack spacing={2}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField select label="From (leaving)" value={from} onChange={(e) => setFrom(e.target.value)} fullWidth>
                        {team.map((m) => (
                            <MenuItem key={m.UserId} value={m.UserId}>
                                {m.Name}
                                {m.DesignationName ? ` · ${m.DesignationName}` : ""}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField select label="To (takes over)" value={to} onChange={(e) => setTo(e.target.value)} fullWidth>
                        {team.filter((m) => m.UserId !== from).map((m) => (
                            <MenuItem key={m.UserId} value={m.UserId}>
                                {m.Name}
                                {m.DesignationName ? ` · ${m.DesignationName}` : ""}
                            </MenuItem>
                        ))}
                    </TextField>
                    {preview && (
                        <Alert severity="info">
                            {preview.doctors} doctor(s) move from {preview.from} to {preview.to}
                            {preview.alreadyWithNew ? ` (${preview.alreadyWithNew} already with ${preview.to})` : ""}.
                        </Alert>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" startIcon={<SwapHorizRounded />} disabled={!preview?.doctors || saving} onClick={save}>
                    Hand over
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default HandoverDialog;
