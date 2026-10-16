import { useEffect, useState } from "react";

import {
    Alert,
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
import { CloseRounded, MapRounded, PlaceRounded, SendRounded } from "@mui/icons-material";

import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { getAreasByTerritory } from "../Doctors/index";
import { getTerritories } from "../Territory/index";
import { REASON_LIMIT, REMARKS_LIMIT, createDeviation, todayKey } from "./index";

const TYPE_OPTIONS = [
    { value: "Territory Change", label: "Territory change", icon: MapRounded },
    { value: "Area Change", label: "Area change", icon: PlaceRounded },
];

// Mounted only while open, so the form starts fresh each time.
function RequestDeviation({ onClose, onCreated }) {
    const { showSnackbar } = useSnackbar();

    const [form, setForm] = useState(() => ({
        DeviationDate: todayKey(),
        DeviationType: "Territory Change",
        ActualTerritoryId: "",
        ActualAreaId: "",
        Reason: "",
        Remarks: "",
    }));
    const [territories, setTerritories] = useState([]);
    const [areas, setAreas] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getTerritories()
            .then((response) =>
                setTerritories(Array.isArray(response?.territories) ? response.territories : [])
            )
            .catch(() => setTerritories([]));
    }, []);

    useEffect(() => {
        if (!form.ActualTerritoryId) {
            setAreas([]);
            return undefined;
        }

        let active = true;

        getAreasByTerritory(form.ActualTerritoryId)
            .then((response) => {
                if (active) setAreas(Array.isArray(response) ? response : []);
            })
            .catch(() => {
                if (active) setAreas([]);
            });

        return () => {
            active = false;
        };
    }, [form.ActualTerritoryId]);

    const setField = (field, value) =>
        setForm((current) => ({
            ...current,
            [field]: value,
            ...(field === "ActualTerritoryId" ? { ActualAreaId: "" } : {}),
        }));

    const areaRequired = form.DeviationType === "Area Change";

    const canSubmit =
        form.DeviationDate &&
        form.ActualTerritoryId &&
        form.Reason.trim() &&
        (!areaRequired || form.ActualAreaId);

    const handleSubmit = async () => {
        setSaving(true);

        try {
            const response = await createDeviation({
                ...form,
                Reason: form.Reason.trim(),
                Remarks: form.Remarks.trim(),
                ActualAreaId: form.ActualAreaId || null,
            });

            showSnackbar(response?.message || "Deviation submitted", "success");
            onCreated?.();
            onClose();
        } catch (error) {
            showSnackbar(error.response?.data?.message || "Failed to submit deviation", "error");
        } finally {
            setSaving(false);
        }
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
                        New request
                    </Typography>
                    <Typography variant="h5" component="h2">
                        Request a deviation
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
                    <Alert severity="info" variant="outlined">
                        Your planned territory and area for that day are taken from your
                        approved tour plan automatically.
                    </Alert>

                    <SegmentedControl
                        fullWidth
                        value={form.DeviationType}
                        options={TYPE_OPTIONS}
                        onChange={(value) => setField("DeviationType", value)}
                    />

                    <TextField
                        label="Date of deviation"
                        type="date"
                        required
                        fullWidth
                        value={form.DeviationDate}
                        onChange={(event) => setField("DeviationDate", event.target.value)}
                        slotProps={{
                            inputLabel: { shrink: true },
                            htmlInput: { max: todayKey() },
                        }}
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                            select
                            fullWidth
                            required
                            label="Where you actually worked"
                            value={form.ActualTerritoryId}
                            onChange={(event) => setField("ActualTerritoryId", event.target.value)}
                        >
                            {territories.map((territory) => (
                                <MenuItem key={territory.TerritoryId} value={territory.TerritoryId}>
                                    {territory.TerritoryName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            required={areaRequired}
                            label={areaRequired ? "Area" : "Area (optional)"}
                            disabled={!form.ActualTerritoryId}
                            value={areas.some((area) => area.AreaId === form.ActualAreaId) ? form.ActualAreaId : ""}
                            onChange={(event) => setField("ActualAreaId", event.target.value)}
                        >
                            {areas.map((area) => (
                                <MenuItem key={area.AreaId} value={area.AreaId}>
                                    {area.AreaName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    <TextField
                        required
                        fullWidth
                        label="Reason"
                        placeholder="e.g. Doctor meeting moved to another territory"
                        value={form.Reason}
                        onChange={(event) =>
                            setField("Reason", event.target.value.slice(0, REASON_LIMIT))
                        }
                        helperText={`${form.Reason.length}/${REASON_LIMIT}`}
                        slotProps={{ formHelperText: { sx: { textAlign: "right" } } }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Remarks (optional)"
                        value={form.Remarks}
                        onChange={(event) =>
                            setField("Remarks", event.target.value.slice(0, REMARKS_LIMIT))
                        }
                    />
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
                    startIcon={<SendRounded />}
                    disabled={!canSubmit || saving}
                    onClick={handleSubmit}
                >
                    Submit for review
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default RequestDeviation;
