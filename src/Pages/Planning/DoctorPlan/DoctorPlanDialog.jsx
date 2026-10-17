import { useState } from "react";

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
    Tooltip,
    Typography,
} from "@mui/material";
import { AddRounded, CloseRounded, DeleteOutlineRounded } from "@mui/icons-material";

import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import { errorMessage, saveDoctorPlan } from "../index";

const isCount = (value, max) => value === "" || (/^\d+$/.test(String(value)) && Number(value) <= max);
const newLine = (ProductId = "", PlannedUnits = "") => ({ key: `${Date.now()}-${Math.random()}`, ProductId, PlannedUnits: String(PlannedUnits) });

// Plan one doctor for the month: visits, support and Rx units per product.
function DoctorPlanDialog({ doctor, month, products, limits, onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();

    const planned = doctor.products.filter((item) => item.plannedUnits > 0);

    const [visits, setVisits] = useState(doctor.planned ? String(doctor.plannedVisits) : String(doctor.VisitsPerMonth || ""));
    const [support, setSupport] = useState(doctor.support || "");
    const [lines, setLines] = useState(planned.length ? planned.map((item) => newLine(item.ProductId, item.plannedUnits)) : [newLine()]);
    const [saving, setSaving] = useState(false);

    const setLine = (key, field, value) => setLines((current) => current.map((line) => (line.key === key ? { ...line, [field]: value } : line)));
    const chosen = new Set(lines.map((line) => line.ProductId).filter(Boolean));

    const error =
        (!isCount(visits, limits.maxVisits) && `Visits must be 0–${limits.maxVisits}.`) ||
        lines
            .map((line, index) => {
                if (!line.ProductId && line.PlannedUnits) return `Line ${index + 1}: choose a product.`;
                if (!isCount(line.PlannedUnits, limits.maxUnits)) return `Line ${index + 1}: units must be a whole number.`;
                return "";
            })
            .find(Boolean) ||
        "";

    const save = async (remove) => {
        setSaving(true);

        try {
            const response = await saveDoctorPlan({
                Month: month,
                DoctorId: doctor.DoctorId,
                PlannedVisits: remove ? 0 : Number(visits) || 0,
                Support: remove ? null : support.trim() || null,
                Products: remove
                    ? []
                    : lines.filter((line) => line.ProductId && Number(line.PlannedUnits) > 0).map((line) => ({ ProductId: line.ProductId, PlannedUnits: Number(line.PlannedUnits) })),
            });
            showSnackbar(response?.message || "Plan saved", "success");
            onSaved();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to save the plan"), "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}
        >
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2 })}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        Doctor business plan
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Typography variant="h5" component="h2" noWrap>
                            Dr. {doctor.DoctorName}
                        </Typography>
                        <CategoryBadge category={doctor.Category} />
                    </Stack>
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {[doctor.Speciality, doctor.AreaName].filter(Boolean).join(" · ") || "—"}
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <TextField
                        label="Planned visits this month"
                        type="number"
                        value={visits}
                        onChange={(event) => setVisits(event.target.value)}
                        error={!isCount(visits, limits.maxVisits)}
                        helperText={doctor.VisitsPerMonth ? `Category norm: ${doctor.VisitsPerMonth} visit(s) a month` : " "}
                        slotProps={{ htmlInput: { min: 0, max: limits.maxVisits } }}
                    />

                    <Box>
                        <Typography variant="subtitle2">Planned prescriptions</Typography>
                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            Rx units you expect this doctor to generate per product. Checked against RCPA.
                        </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                        {lines.map((line, index) => (
                            <Stack key={line.key} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                <TextField select size="small" label="Product" value={line.ProductId} onChange={(event) => setLine(line.key, "ProductId", event.target.value)} sx={{ flex: 1 }}>
                                    {products.map((product) => (
                                        <MenuItem key={product.ProductId} value={product.ProductId} disabled={chosen.has(product.ProductId) && product.ProductId !== line.ProductId}>
                                            {product.ProductName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    size="small"
                                    label="Rx units"
                                    type="number"
                                    value={line.PlannedUnits}
                                    onChange={(event) => setLine(line.key, "PlannedUnits", event.target.value)}
                                    error={!isCount(line.PlannedUnits, limits.maxUnits)}
                                    slotProps={{ htmlInput: { min: 0 } }}
                                    sx={(theme) => ({ width: theme.engagement.quantityColumn })}
                                />
                                <Tooltip title="Remove product">
                                    <span>
                                        <IconButton aria-label={`Remove product ${index + 1}`} disabled={lines.length === 1} onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}>
                                            <DeleteOutlineRounded fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Stack>
                        ))}
                        <Box>
                            <Button size="small" startIcon={<AddRounded />} disabled={lines.length >= limits.maxProducts} onClick={() => setLines((current) => [...current, newLine()])}>
                                Add product
                            </Button>
                        </Box>
                    </Stack>

                    <TextField
                        multiline
                        minRows={2}
                        label="Support planned (optional)"
                        placeholder="Samples, CME, inputs, joint work…"
                        value={support}
                        onChange={(event) => setSupport(event.target.value.slice(0, 300))}
                        helperText={`${support.length}/300`}
                    />

                    {error && (
                        <Alert severity="info" variant="outlined">
                            {error}
                        </Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                {doctor.planned && (
                    <Button color="error" onClick={() => save(true)} disabled={saving} sx={{ mr: "auto" }}>
                        Remove from plan
                    </Button>
                )}
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={() => save(false)} disabled={saving || Boolean(error)}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DoctorPlanDialog;
