import { useState } from "react";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { CloseRounded } from "@mui/icons-material";

// Field definitions per catalogue kind; `money` fields get a ₹ prefix.
export const CATALOGUE_KINDS = {
    products: {
        noun: "product",
        idKey: "ProductId",
        nameKey: "ProductName",
        fields: [
            { key: "ProductName", label: "Product name", required: true, max: 150 },
            { key: "Composition", label: "Composition", max: 300, multiline: true, full: true },
            { key: "Therapy", label: "Therapy area", max: 100 },
            { key: "PackSize", label: "Pack size", max: 50, placeholder: "e.g. 10 × 10 tablets" },
            { key: "UnitPrice", label: "Unit price", money: true },
        ],
        flags: [
            { key: "IsSample", label: "Available as a sample", defaultValue: true },
            { key: "IsActive", label: "Active", defaultValue: true },
        ],
    },
    gifts: {
        noun: "gift",
        idKey: "GiftId",
        nameKey: "GiftName",
        fields: [
            { key: "GiftName", label: "Gift name", required: true, max: 150 },
            { key: "Description", label: "Description", max: 300, multiline: true, full: true },
            { key: "UnitValue", label: "Unit value", money: true },
        ],
        flags: [{ key: "IsActive", label: "Active", defaultValue: true }],
    },
};

const initialValues = (config, item) => ({
    ...Object.fromEntries(config.fields.map((field) => [field.key, item?.[field.key] ?? ""])),
    ...Object.fromEntries(config.flags.map((flag) => [flag.key, item ? Boolean(item[flag.key]) : flag.defaultValue])),
});

// Mounted per item (via `key`), so it starts from that item's values.
function CatalogueItemDialog({ kind, item, saving, onClose, onSave }) {
    const config = CATALOGUE_KINDS[kind];
    const [values, setValues] = useState(() => initialValues(config, item));

    const set = (key, value) => setValues((current) => ({ ...current, [key]: value }));

    const missing = config.fields.some((field) => field.required && !String(values[field.key]).trim());
    const badMoney = config.fields.some(
        (field) => field.money && values[field.key] !== "" && !(Number(values[field.key]) >= 0)
    );

    return (
        <Dialog
            open
            onClose={saving ? undefined : onClose}
            fullWidth
            slotProps={{
                paper: { sx: (theme) => ({ maxWidth: theme.dialog.width, backgroundColor: theme.palette.background.paper }) },
            }}
        >
            <DialogTitle
                component="div"
                sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2 })}
            >
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        Catalogue
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {item ? `Edit ${config.noun}` : `Add ${config.noun}`}
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Box
                    sx={{
                        pt: 1,
                        display: "grid",
                        gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
                        gap: 2,
                    }}
                >
                    {config.fields.map((field) => (
                        <TextField
                            key={field.key}
                            label={field.label}
                            required={field.required}
                            multiline={field.multiline}
                            minRows={field.multiline ? 2 : undefined}
                            type={field.money ? "number" : "text"}
                            placeholder={field.placeholder}
                            value={values[field.key]}
                            onChange={(event) => set(field.key, field.max ? event.target.value.slice(0, field.max) : event.target.value)}
                            sx={{ gridColumn: field.full ? "1 / -1" : undefined }}
                            slotProps={
                                field.money
                                    ? {
                                          input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
                                          htmlInput: { min: 0, step: 0.01 },
                                      }
                                    : undefined
                            }
                        />
                    ))}
                </Box>

                <Stack sx={{ mt: 2 }}>
                    {config.flags.map((flag) => (
                        <FormControlLabel
                            key={flag.key}
                            control={<Switch checked={values[flag.key]} onChange={(event) => set(flag.key, event.target.checked)} />}
                            label={flag.label}
                        />
                    ))}
                </Stack>
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="contained" disabled={saving || missing || badMoney} onClick={() => onSave(values)}>
                    {item ? "Save changes" : `Add ${config.noun}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CatalogueItemDialog;
