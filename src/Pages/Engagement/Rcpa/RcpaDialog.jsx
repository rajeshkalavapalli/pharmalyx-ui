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
    Tooltip,
    Typography,
} from "@mui/material";
import { AddRounded, CloseRounded, DeleteOutlineRounded } from "@mui/icons-material";

import { getMyDoctors, getProducts, getRcpaPharmacies, todayKey } from "../index";

const newLine = () => ({
    key: `${Date.now()}-${Math.random()}`,
    ProductId: "",
    OurQuantity: "",
    CompetitorBrand: "",
    CompetitorCompany: "",
    CompetitorQuantity: "",
});

const isCount = (value) => value === "" || (/^\d+$/.test(String(value)) && Number(value) <= 100000);

function RcpaDialog({ actingUserId, saving, onClose, onSave }) {
    const [pharmacies, setPharmacies] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [products, setProducts] = useState([]);

    const [auditDate, setAuditDate] = useState(todayKey());
    const [pharmacyId, setPharmacyId] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [lines, setLines] = useState([newLine()]);
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        getRcpaPharmacies().then((r) => setPharmacies(r?.pharmacies || [])).catch(() => setPharmacies([]));
        getMyDoctors(actingUserId).then((r) => setDoctors(r?.doctors || [])).catch(() => setDoctors([]));
        getProducts(true).then((r) => setProducts(r?.products || [])).catch(() => setProducts([]));
    }, [actingUserId]);

    const setLine = (key, field, value) =>
        setLines((current) => current.map((line) => (line.key === key ? { ...line, [field]: value } : line)));

    const lineError = lines
        .map((line, index) => {
            if (!line.ProductId) return `Line ${index + 1}: choose a product.`;
            if (!isCount(line.OurQuantity) || !isCount(line.CompetitorQuantity)) return `Line ${index + 1}: quantities must be whole numbers.`;
            if (Number(line.CompetitorQuantity) > 0 && !line.CompetitorBrand.trim()) return `Line ${index + 1}: name the competitor brand.`;
            return "";
        })
        .find(Boolean);

    const canSave = auditDate && pharmacyId && doctorId && lines.length > 0 && !lineError;

    const handleSave = () =>
        onSave({
            AuditDate: auditDate,
            PharmacyId: pharmacyId,
            DoctorId: doctorId,
            Remarks: remarks.trim() || null,
            Lines: lines.map((line) => ({
                ProductId: line.ProductId,
                OurQuantity: Number(line.OurQuantity || 0),
                CompetitorBrand: line.CompetitorBrand.trim() || null,
                CompetitorCompany: line.CompetitorCompany.trim() || null,
                CompetitorQuantity: Number(line.CompetitorQuantity || 0),
            })),
        });

    return (
        <Dialog
            open
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="md"
            slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}
        >
            <DialogTitle
                component="div"
                sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2 })}
            >
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        New RCPA
                    </Typography>
                    <Typography variant="h5" component="h2">
                        Chemist prescription audit
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: `${theme.engagement.dateColumn}px repeat(2, minmax(0, 1fr))` },
                            gap: 2,
                        })}
                    >
                        <TextField
                            label="Date"
                            type="date"
                            required
                            value={auditDate}
                            onChange={(event) => setAuditDate(event.target.value)}
                            slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: todayKey() } }}
                        />
                        <TextField
                            select
                            required
                            label="Chemist"
                            value={pharmacyId}
                            onChange={(event) => setPharmacyId(event.target.value)}
                            helperText={pharmacies.length ? " " : "No chemists assigned to you yet"}
                        >
                            {pharmacies.map((pharmacy) => (
                                <MenuItem key={pharmacy.PharmacyId} value={pharmacy.PharmacyId}>
                                    {pharmacy.PharmacyName}
                                    {pharmacy.AreaName ? ` · ${pharmacy.AreaName}` : ""}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField select required label="Prescribing doctor" value={doctorId} onChange={(event) => setDoctorId(event.target.value)}>
                            {doctors.map((doctor) => (
                                <MenuItem key={doctor.DoctorId} value={doctor.DoctorId}>
                                    {doctor.DoctorName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2">Prescriptions found</Typography>
                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            Units dispensed against this doctor's prescriptions since the last audit.
                        </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                        {lines.map((line, index) => (
                            <Box
                                key={line.key}
                                sx={(theme) => ({
                                    p: 1.5,
                                    borderRadius: theme.calendar.cell.radius,
                                    backgroundColor: theme.palette.surface.subtle,
                                    border: "1px solid",
                                    borderColor: theme.palette.border.subtle,
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "minmax(0, 1fr)",
                                        md: `minmax(0, 1.4fr) ${theme.engagement.quantityColumn}px minmax(0, 1.2fr) minmax(0, 1fr) ${theme.engagement.quantityColumn}px auto`,
                                    },
                                    gap: 1.5,
                                    alignItems: "center",
                                })}
                            >
                                <TextField select size="small" required label="Our product" value={line.ProductId} onChange={(event) => setLine(line.key, "ProductId", event.target.value)}>
                                    {products.map((product) => (
                                        <MenuItem key={product.ProductId} value={product.ProductId}>
                                            {product.ProductName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField size="small" label="Our units" type="number" value={line.OurQuantity} onChange={(event) => setLine(line.key, "OurQuantity", event.target.value)} slotProps={{ htmlInput: { min: 0 } }} />
                                <TextField size="small" label="Competitor brand" value={line.CompetitorBrand} onChange={(event) => setLine(line.key, "CompetitorBrand", event.target.value.slice(0, 150))} />
                                <TextField size="small" label="Company" value={line.CompetitorCompany} onChange={(event) => setLine(line.key, "CompetitorCompany", event.target.value.slice(0, 150))} />
                                <TextField size="small" label="Their units" type="number" value={line.CompetitorQuantity} onChange={(event) => setLine(line.key, "CompetitorQuantity", event.target.value)} slotProps={{ htmlInput: { min: 0 } }} />
                                <Tooltip title="Remove line">
                                    <span>
                                        <IconButton
                                            aria-label={`Remove line ${index + 1}`}
                                            disabled={lines.length === 1}
                                            onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}
                                        >
                                            <DeleteOutlineRounded fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>
                        ))}

                        <Box>
                            <Button size="small" startIcon={<AddRounded />} disabled={lines.length >= 20} onClick={() => setLines((current) => [...current, newLine()])}>
                                Add product
                            </Button>
                        </Box>
                    </Stack>

                    <TextField multiline minRows={2} label="Remarks (optional)" value={remarks} onChange={(event) => setRemarks(event.target.value.slice(0, 500))} />

                    {lineError && pharmacyId && doctorId && (
                        <Alert severity="info" variant="outlined">
                            {lineError}
                        </Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="contained" disabled={!canSave || saving} onClick={handleSave}>
                    Save RCPA
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default RcpaDialog;
