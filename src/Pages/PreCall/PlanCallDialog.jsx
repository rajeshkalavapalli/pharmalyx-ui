import { useEffect, useState } from "react";

import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { CloseRounded, LightbulbRounded } from "@mui/icons-material";

import { MESSAGES_LIMIT, OBJECTIVE_LIMIT, formatDayHeading, getProducts } from "./index";

// Plan one call before the visit: objective, key messages, products to detail.
// Mounted per doctor (via `key`), so the fields start from that doctor's plan.
function PlanCallDialog({ doctor, date, saving, onClose, onSave }) {
    const existing = doctor.callPlan;

    const [products, setProducts] = useState([]);
    const [objective, setObjective] = useState(existing?.objective || "");
    const [keyMessages, setKeyMessages] = useState(existing?.keyMessages || "");
    const [productIds, setProductIds] = useState(existing?.productIds?.map((id) => id.toLowerCase()) || []);

    useEffect(() => {
        getProducts(true)
            .then((response) => setProducts(response?.products || []))
            .catch(() => setProducts([]));
    }, []);

    const selected = products.filter((product) => productIds.includes(String(product.ProductId).toLowerCase()));

    // Suggestions from the briefing, one click to use as the objective.
    const suggestions = doctor.talkingPoints.slice(0, 3);

    return (
        <Dialog
            open
            onClose={saving ? undefined : onClose}
            fullWidth
            slotProps={{ paper: { sx: (theme) => ({ maxWidth: theme.dialog.width, backgroundColor: theme.palette.background.paper }) } }}
        >
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2 })}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        {existing ? "Edit planned call" : "Plan call"} · {formatDayHeading(date)}
                    </Typography>
                    <Typography variant="h5" component="h2" noWrap>
                        Dr. {doctor.DoctorName}
                    </Typography>
                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {[doctor.Speciality, doctor.HospitalName].filter(Boolean).join(" · ")}
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Stack spacing={2.25} sx={{ pt: 1 }}>
                    {suggestions.length > 0 && !objective && (
                        <Box
                            sx={(theme) => ({
                                p: 1.5,
                                borderRadius: theme.calendar.cell.radius,
                                backgroundColor: alpha(theme.palette.primary.main, theme.tint.hover),
                                border: "1px solid",
                                borderColor: alpha(theme.palette.primary.main, theme.tint.border),
                            })}
                        >
                            <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 600, mb: 1 })}>
                                From the briefing: tap to use
                            </Typography>
                            <Stack spacing={0.75}>
                                {suggestions.map((point) => (
                                    <Button
                                        key={point}
                                        size="small"
                                        startIcon={<LightbulbRounded />}
                                        onClick={() => setObjective(point.slice(0, OBJECTIVE_LIMIT))}
                                        sx={(theme) => ({
                                            justifyContent: "flex-start",
                                            textAlign: "left",
                                            color: theme.palette.text.primary,
                                            "& .MuiButton-startIcon": { color: theme.palette.warning.main },
                                        })}
                                    >
                                        {point}
                                    </Button>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    <TextField
                        autoFocus
                        required
                        multiline
                        minRows={2}
                        label="Call objective"
                        placeholder="e.g. Convert to prescribing Brand X for new hypertension patients"
                        value={objective}
                        onChange={(event) => setObjective(event.target.value.slice(0, OBJECTIVE_LIMIT))}
                        helperText={`${objective.length}/${OBJECTIVE_LIMIT}`}
                        slotProps={{ formHelperText: { sx: { textAlign: "right" } } }}
                    />

                    <Autocomplete
                        multiple
                        options={products}
                        value={selected}
                        onChange={(event, value) => setProductIds(value.slice(0, 10).map((product) => String(product.ProductId).toLowerCase()))}
                        getOptionLabel={(product) => product.ProductName}
                        isOptionEqualToValue={(option, value) => option.ProductId === value.ProductId}
                        noOptionsText="No active products in the catalogue"
                        renderValue={(value, getItemProps) =>
                            value.map((product, index) => {
                                const { key, ...itemProps } = getItemProps({ index });
                                return <Chip key={key} size="small" label={product.ProductName} {...itemProps} />;
                            })
                        }
                        renderInput={(params) => <TextField {...params} label="Products to detail" placeholder="Choose up to 10" />}
                    />

                    <TextField
                        multiline
                        minRows={3}
                        label="Key messages (optional)"
                        placeholder="Points, data or studies to mention during the call"
                        value={keyMessages}
                        onChange={(event) => setKeyMessages(event.target.value.slice(0, MESSAGES_LIMIT))}
                        helperText={`${keyMessages.length}/${MESSAGES_LIMIT}`}
                        slotProps={{ formHelperText: { sx: { textAlign: "right" } } }}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disabled={!objective.trim() || saving}
                    onClick={() =>
                        onSave({
                            PlanDate: date,
                            DoctorId: doctor.DoctorId,
                            Objective: objective.trim(),
                            KeyMessages: keyMessages.trim() || null,
                            ProductIds: productIds,
                        })
                    }
                >
                    {existing ? "Save plan" : "Add to call plan"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default PlanCallDialog;
