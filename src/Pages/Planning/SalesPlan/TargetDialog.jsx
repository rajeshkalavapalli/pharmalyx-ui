import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { CloseRounded, ContentCopyRounded, SearchRounded } from "@mui/icons-material";

import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { errorMessage, formatAmount, formatMonthLabel, formatUnits, getTargetForm, saveTargets } from "../index";

const isQty = (value) => value === "" || (/^\d+$/.test(String(value)) && Number(value) <= 1000000);

// Manager sets one team member's monthly target per product.
function TargetDialog({ userId, month, onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();

    const [form, setForm] = useState(null);
    const [qty, setQty] = useState({});
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getTargetForm(userId, month)
            .then((response) => {
                setForm(response);
                setQty(Object.fromEntries(response.current.map((item) => [item.ProductId, String(item.TargetQty)])));
            })
            .catch((err) => setError(errorMessage(err, "Couldn't load the target form")));
    }, [userId, month]);

    const products = useMemo(() => {
        const term = search.trim().toLowerCase();
        return (form?.products || []).filter((product) => !term || product.ProductName.toLowerCase().includes(term));
    }, [form, search]);

    const total = (form?.products || []).reduce((sum, product) => sum + Math.round(product.UnitPrice * 100) * (Number(qty[product.ProductId]) || 0), 0) / 100;
    const targeted = Object.values(qty).filter((value) => Number(value) > 0).length;
    const invalid = Object.values(qty).some((value) => !isQty(value));

    const copyPrevious = () => setQty(Object.fromEntries(form.previous.map((item) => [item.ProductId, String(item.TargetQty)])));

    const handleSave = async () => {
        setSaving(true);

        try {
            const response = await saveTargets({
                UserId: userId,
                Month: form.month,
                Lines: Object.entries(qty)
                    .filter(([, value]) => Number(value) > 0)
                    .map(([ProductId, value]) => ({ ProductId, TargetQty: Number(value) })),
            });
            showSnackbar(response?.message || "Targets saved", "success");
            onSaved();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to save targets"), "error");
        } finally {
            setSaving(false);
        }
    };

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
                        Set targets · {formatMonthLabel(form?.month || `${month}-01`)}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {form?.user?.Name || "Loading…"}
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                {error ? (
                    <Alert severity="error" variant="outlined">
                        {error}
                    </Alert>
                ) : (
                    form && (
                        <Stack spacing={2}>
                            <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 1.5, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}>
                                <TextField
                                    size="small"
                                    placeholder="Search products…"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    sx={(theme) => ({ minWidth: theme.search.minWidth, "& .MuiOutlinedInput-root": { minHeight: theme.field.compactHeight } })}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchRounded fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                                <Button startIcon={<ContentCopyRounded />} onClick={copyPrevious} disabled={!form.previous.length}>
                                    Copy last month ({form.previous.length})
                                </Button>
                            </Stack>

                            {form.products.length ? (
                                <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product</TableCell>
                                                <TableCell align="right">Price</TableCell>
                                                <TableCell align="right">Target units</TableCell>
                                                <TableCell align="right">Target value</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {products.map((product) => {
                                                const value = qty[product.ProductId] ?? "";

                                                return (
                                                    <TableRow key={product.ProductId} hover>
                                                        <TableCell>
                                                            <Typography variant="subtitle2">{product.ProductName}</Typography>
                                                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                {[product.Therapy, product.PackSize].filter(Boolean).join(" · ")}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">{formatAmount(product.UnitPrice)}</TableCell>
                                                        <TableCell align="right">
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={value}
                                                                error={!isQty(value)}
                                                                onChange={(event) => setQty((current) => ({ ...current, [product.ProductId]: event.target.value }))}
                                                                slotProps={{ htmlInput: { min: 0, "aria-label": `${product.ProductName} target units` } }}
                                                                sx={(theme) => ({ width: theme.engagement.quantityColumn, "& input": { textAlign: "right" } })}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">{Number(value) > 0 ? formatAmount((Math.round(product.UnitPrice * 100) * Number(value)) / 100) : "—"}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Alert severity="info" variant="outlined">
                                    Add prices to products in Configuration → Catalogue first.
                                </Alert>
                            )}

                            <Stack direction="row" sx={{ gap: 3, justifyContent: "flex-end" }}>
                                <Box sx={{ textAlign: "right" }}>
                                    <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        Products
                                    </Typography>
                                    <Typography variant="subtitle1">{formatUnits(targeted)}</Typography>
                                </Box>
                                <Box sx={{ textAlign: "right" }}>
                                    <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        Total target
                                    </Typography>
                                    <Typography variant="subtitle1">{formatAmount(total)}</Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    )
                )}
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleSave} disabled={!form || saving || invalid}>
                    Save targets
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default TargetDialog;
