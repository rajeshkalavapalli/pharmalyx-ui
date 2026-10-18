import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { AddRounded, CloseRounded, DeleteOutlineRounded } from "@mui/icons-material";

import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import { CUSTOMER_TYPE, errorMessage, formatAmount, getOrderOptions, lineAmounts, toDateKey, todayKey, uploadSlip } from "../index";
import { slipHash } from "../slipHash";
import { CameraCapture, LocationStatus } from "../../DoctorRequests/components/LiveCapture";
import useLiveLocation from "../../DoctorRequests/components/useLiveLocation";

const newLine = () => ({ key: `${Date.now()}-${Math.random()}`, ProductId: "", Quantity: "", FreeQuantity: "", DiscountPercent: "" });

const isCount = (value) => value === "" || (/^\d+$/.test(String(value)) && Number(value) <= 100000);
const isPercent = (value) => value === "" || (/^\d{1,3}(\.\d{1,2})?$/.test(String(value)) && Number(value) <= 100);

const shiftDays = (key, days) => {
    const date = new Date(`${key}T00:00:00`);
    date.setDate(date.getDate() + days);
    return toDateKey(date);
};

function SummaryRow({ label, value, strong }) {
    return (
        <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
            <Typography variant={strong ? "subtitle1" : "body2"} sx={(theme) => ({ color: strong ? theme.palette.text.primary : theme.palette.text.secondary })}>
                {label}
            </Typography>
            <Typography variant={strong ? "subtitle1" : "body2"}>{value}</Typography>
        </Stack>
    );
}

// `initial` pre-fills the form, e.g. { customerType: "CHEMIST", customerId } or { stockistId }.
function OrderDialog({ initial = {}, saving, onClose, onSave }) {
    const [options, setOptions] = useState(null);
    const [loadError, setLoadError] = useState("");

    const [customerType, setCustomerType] = useState(initial.customerType || "DOCTOR");
    const [orderDate, setOrderDate] = useState(todayKey());
    const [customerId, setCustomerId] = useState(initial.customerId || "");
    const [stockistId, setStockistId] = useState(initial.stockistId || "");
    const [lines, setLines] = useState([newLine()]);
    const [remarks, setRemarks] = useState("");
    // Chemist POB: in-app photo of the stamped slip and live GPS at the chemist.
    const [slip, setSlip] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [slipError, setSlipError] = useState("");
    const location = useLiveLocation();
    const chemist = customerType === "CHEMIST";

    useEffect(() => {
        if (chemist) location.start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chemist]);

    useEffect(() => {
        getOrderOptions()
            .then((response) => {
                setOptions(response);
                if (response?.stockists?.length === 1) setStockistId((current) => current || response.stockists[0].StockistId);
            })
            .catch((err) => setLoadError(errorMessage(err, "Couldn't load your doctors, chemists and products")));
    }, []);

    const productById = useMemo(() => new Map((options?.products || []).map((product) => [product.ProductId, product])), [options]);

    const customers =
        customerType === "DOCTOR"
            ? (options?.doctors || []).map((doctor) => ({
                  id: doctor.DoctorId,
                  label: `Dr. ${doctor.DoctorName}`,
                  detail: [doctor.Speciality, doctor.AreaName].filter(Boolean).join(" · "),
              }))
            : (options?.pharmacies || []).map((pharmacy) => ({ id: pharmacy.PharmacyId, label: pharmacy.PharmacyName, detail: pharmacy.AreaName }));

    const setLine = (key, field, value) => setLines((current) => current.map((line) => (line.key === key ? { ...line, [field]: value } : line)));

    const priced = lines.map((line) => {
        const product = productById.get(line.ProductId);
        return { ...line, product, amounts: lineAmounts(product?.UnitPrice, line.Quantity, line.DiscountPercent) };
    });

    const totals = priced.reduce(
        (sum, line) => ({
            gross: sum.gross + line.amounts.gross,
            discount: sum.discount + line.amounts.discount,
            net: sum.net + line.amounts.net,
            free: sum.free + (Number(line.FreeQuantity) || 0),
        }),
        { gross: 0, discount: 0, net: 0, free: 0 }
    );

    const chosen = new Set(lines.map((line) => line.ProductId).filter(Boolean));

    const lineError = priced
        .map((line, index) => {
            const label = `Line ${index + 1}`;
            if (!line.ProductId) return `${label}: choose a product.`;
            if (!isCount(line.Quantity) || !(Number(line.Quantity) > 0)) return `${label}: enter a quantity of at least 1.`;
            if (!isCount(line.FreeQuantity)) return `${label}: free quantity must be a whole number.`;
            if (Number(line.FreeQuantity) > Number(line.Quantity)) return `${label}: free quantity can't exceed the ordered quantity.`;
            if (!isPercent(line.DiscountPercent)) return `${label}: discount must be 0–100 with up to 2 decimals.`;
            return "";
        })
        .find(Boolean);

    const canSave = options && orderDate && customerId && stockistId && !lineError && (!chemist || (slip && location.status === "CAPTURED"));

    const handleSave = async () => {
        let slipFields = {};
        if (chemist) {
            setUploading(true);
            setSlipError("");
            try {
                const [{ photoId }, hash] = await Promise.all([uploadSlip(slip), slipHash(slip)]);
                slipFields = {
                    SlipPhotoId: photoId,
                    SlipDHash: hash,
                    Location: { status: "CAPTURED", latitude: location.fix.latitude, longitude: location.fix.longitude, accuracy: location.fix.accuracy },
                };
            } catch (err) {
                setUploading(false);
                setSlipError(errorMessage(err, "The slip photo could not be uploaded. Try again."));
                return;
            }
            setUploading(false);
        }

        onSave({
            ...slipFields,
            OrderDate: chemist ? todayKey() : orderDate,
            CustomerType: customerType,
            DoctorId: customerType === "DOCTOR" ? customerId : null,
            PharmacyId: customerType === "CHEMIST" ? customerId : null,
            StockistId: stockistId,
            Remarks: remarks.trim() || null,
            Lines: lines.map((line) => ({
                ProductId: line.ProductId,
                Quantity: Number(line.Quantity),
                FreeQuantity: Number(line.FreeQuantity || 0),
                DiscountPercent: Number(line.DiscountPercent || 0),
            })),
        });
    };

    const maxLines = options?.maxLines ?? 30;
    const minDate = shiftDays(todayKey(), -(options?.maxBackdateDays ?? 7));

    return (
        <Dialog
            open
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="md"
            slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}
        >
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2 })}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        New POB
                    </Typography>
                    <Typography variant="h5" component="h2">
                        Book an order
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                {loadError ? (
                    <Alert severity="error" variant="outlined">
                        {loadError}
                    </Alert>
                ) : (
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <Box>
                            <SegmentedControl
                                value={customerType}
                                onChange={(next) => {
                                    setCustomerType(next);
                                    setCustomerId("");
                                }}
                                options={Object.entries(CUSTOMER_TYPE).map(([value, type]) => ({ value, label: `From a ${type.label.toLowerCase()}` }))}
                            />
                        </Box>

                        <Box
                            sx={(theme) => ({
                                display: "grid",
                                gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: `${theme.engagement.dateColumn}px repeat(2, minmax(0, 1fr))` },
                                gap: 2,
                            })}
                        >
                            <TextField
                                label="Order date"
                                type="date"
                                required
                                value={chemist ? todayKey() : orderDate}
                                disabled={chemist}
                                helperText={chemist ? "Chemist orders are booked on the day" : " "}
                                onChange={(event) => setOrderDate(event.target.value)}
                                slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: todayKey(), min: minDate } }}
                            />
                            <TextField
                                select
                                required
                                label={CUSTOMER_TYPE[customerType].label}
                                value={customerId}
                                onChange={(event) => setCustomerId(event.target.value)}
                                helperText={options && !customers.length ? `No ${customerType === "DOCTOR" ? "doctors" : "chemists"} assigned to you yet` : " "}
                            >
                                {customers.map((customer) => (
                                    <MenuItem key={customer.id} value={customer.id}>
                                        {customer.label}
                                        {customer.detail ? ` · ${customer.detail}` : ""}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                required
                                label="Supplying stockist"
                                value={stockistId}
                                onChange={(event) => setStockistId(event.target.value)}
                                helperText={options && !options.stockists.length ? "No stockists assigned to you yet" : " "}
                            >
                                {(options?.stockists || []).map((stockist) => (
                                    <MenuItem key={stockist.StockistId} value={stockist.StockistId}>
                                        {stockist.StockistName}
                                        {stockist.AreaName ? ` · ${stockist.AreaName}` : ""}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2">Products</Typography>
                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                Prices come from the catalogue. Free quantity is the scheme (e.g. 10 + 1).
                            </Typography>
                        </Box>

                        <Stack spacing={1.5}>
                            {priced.map((line, index) => (
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
                                            xs: "repeat(3, minmax(0, 1fr))",
                                            md: `minmax(0, 1.6fr) repeat(3, ${theme.engagement.quantityColumn}px) ${theme.engagement.quantityColumn}px auto`,
                                        },
                                        gap: 1.5,
                                        alignItems: "center",
                                    })}
                                >
                                    <TextField
                                        select
                                        size="small"
                                        required
                                        label="Product"
                                        value={line.ProductId}
                                        onChange={(event) => setLine(line.key, "ProductId", event.target.value)}
                                        sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}
                                        helperText={line.product ? `${formatAmount(line.product.UnitPrice)}${line.product.PackSize ? ` · ${line.product.PackSize}` : ""}` : " "}
                                    >
                                        {(options?.products || []).map((product) => (
                                            <MenuItem key={product.ProductId} value={product.ProductId} disabled={chosen.has(product.ProductId) && product.ProductId !== line.ProductId}>
                                                {product.ProductName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField size="small" label="Qty" type="number" value={line.Quantity} onChange={(event) => setLine(line.key, "Quantity", event.target.value)} slotProps={{ htmlInput: { min: 1 } }} helperText=" " />
                                    <TextField size="small" label="Free" type="number" value={line.FreeQuantity} onChange={(event) => setLine(line.key, "FreeQuantity", event.target.value)} slotProps={{ htmlInput: { min: 0 } }} helperText=" " />
                                    <TextField size="small" label="Disc %" type="number" value={line.DiscountPercent} onChange={(event) => setLine(line.key, "DiscountPercent", event.target.value)} slotProps={{ htmlInput: { min: 0, max: 100, step: 0.5 } }} helperText=" " />
                                    <Box sx={{ textAlign: { xs: "left", md: "right" }, gridColumn: { xs: "1 / 3", md: "auto" }, pb: 2.5 }}>
                                        <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            Net
                                        </Typography>
                                        <Typography variant="subtitle2">{formatAmount(line.amounts.net)}</Typography>
                                    </Box>
                                    <Box sx={{ justifySelf: "end", pb: 2.5 }}>
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
                                </Box>
                            ))}

                            <Box>
                                <Button size="small" startIcon={<AddRounded />} disabled={lines.length >= maxLines} onClick={() => setLines((current) => [...current, newLine()])}>
                                    Add product
                                </Button>
                            </Box>
                        </Stack>

                        <Box
                            sx={(theme) => ({
                                display: "grid",
                                gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.4fr) minmax(0, 1fr)" },
                                gap: theme.stat.gap,
                                alignItems: "start",
                            })}
                        >
                            <Stack spacing={2}>
                                {chemist && (
                                    <>
                                        <LocationStatus location={location} label="At the chemist" />
                                        <CameraCapture value={slip} onChange={setSlip} label="Photo of the stamped order slip *" />
                                        {slipError && (
                                            <Alert severity="error" variant="outlined">
                                                {slipError}
                                            </Alert>
                                        )}
                                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            Camera only (no gallery). Date, time, GPS and your name are saved with the order. Book it while you are at the chemist (within {options?.chemistRadius ?? 200} m).
                                        </Typography>
                                    </>
                                )}
                                <TextField multiline minRows={3} label="Remarks (optional)" value={remarks} onChange={(event) => setRemarks(event.target.value.slice(0, 500))} />
                            </Stack>
                            <Stack
                                spacing={1}
                                sx={(theme) => ({
                                    p: 2,
                                    borderRadius: theme.calendar.cell.radius,
                                    border: "1px solid",
                                    borderColor: theme.palette.border.subtle,
                                })}
                            >
                                <SummaryRow label="Gross" value={formatAmount(totals.gross)} />
                                <SummaryRow label="Discount" value={`− ${formatAmount(totals.discount)}`} />
                                <SummaryRow label="Free units" value={totals.free} />
                                <Divider />
                                <SummaryRow label="Order value" value={formatAmount(totals.net)} strong />
                            </Stack>
                        </Box>

                        {lineError && customerId && stockistId && (
                            <Alert severity="info" variant="outlined">
                                {lineError}
                            </Alert>
                        )}
                    </Stack>
                )}
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="contained" disabled={!canSave || saving || uploading} onClick={handleSave}>
                    Book order
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default OrderDialog;
