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
    TextField,
    Typography,
} from "@mui/material";
import { CloseRounded, SearchRounded, SendRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import StatusChip from "../../../components/StatusChip/StatusChip";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { STATEMENT_STATUS, closingOf, errorMessage, formatAmount, formatMonthLabel, formatUnits, getStatement, saveStatement, statementRowError as rowError } from "../index";
import StatementTable from "./StatementTable";

const hasValues = (row) => ["OpeningQty", "ReceiptQty", "SalesQty", "ReturnQty"].some((key) => Number(row[key]) > 0);

function Total({ label, value }) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                {label}
            </Typography>
            <Typography variant="subtitle1">{value}</Typography>
        </Box>
    );
}

// The MR's monthly statement for one stockist: enter, save as draft, submit for review.
function StatementDialog({ stockistId, month, onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();

    const [data, setData] = useState(null);
    const [rows, setRows] = useState([]);
    const [remarks, setRemarks] = useState("");
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);
    const [confirmSubmit, setConfirmSubmit] = useState(false);

    useEffect(() => {
        getStatement(stockistId, month)
            .then((response) => {
                setData(response);
                setRows(response.rows.map((row) => ({ ...row })));
                setRemarks(response.statement?.Remarks || "");
            })
            .catch((err) => setError(errorMessage(err, "Couldn't load the statement")));
    }, [stockistId, month]);

    const editable = Boolean(data?.canEdit);

    const visibleRows = useMemo(() => {
        const term = search.trim().toLowerCase();
        return rows.filter((row) => (!term || row.ProductName.toLowerCase().includes(term)) && (editable || hasValues(row)));
    }, [rows, search, editable]);

    const totals = rows.reduce(
        (sum, row) => {
            const sales = Number(row.SalesQty) || 0;
            const closing = Math.max(0, closingOf(row));
            const price = Math.round((row.UnitPrice || 0) * 100);

            return { units: sum.units + sales, sales: sum.sales + price * sales, closing: sum.closing + price * closing };
        },
        { units: 0, sales: 0, closing: 0 }
    );

    const firstError = rows.map((row) => (rowError(row) ? `${row.ProductName}: ${rowError(row)}` : "")).find(Boolean);
    const anyValues = rows.some(hasValues);

    const setValue = (productId, field, value) =>
        setRows((current) => current.map((row) => (row.ProductId === productId ? { ...row, [field]: value } : row)));

    const save = async (submit) => {
        setSaving(true);

        try {
            const response = await saveStatement({
                StockistId: stockistId,
                Month: data.month,
                Submit: submit,
                Remarks: remarks.trim() || null,
                Lines: rows.filter(hasValues).map((row) => ({
                    ProductId: row.ProductId,
                    OpeningQty: Number(row.OpeningQty) || 0,
                    ReceiptQty: Number(row.ReceiptQty) || 0,
                    SalesQty: Number(row.SalesQty) || 0,
                    ReturnQty: Number(row.ReturnQty) || 0,
                })),
            });

            showSnackbar(response?.message || "Statement saved", "success");
            onSaved();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to save the statement"), "error");
            setConfirmSubmit(false);
        } finally {
            setSaving(false);
        }
    };

    const status = data?.statement ? STATEMENT_STATUS[data.statement.Status] : STATEMENT_STATUS.NOT_STARTED;

    return (
        <Dialog
            open
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="lg"
            slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}
        >
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2, alignItems: "flex-start" })}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        Stockist statement · {formatMonthLabel(data?.month || `${month}-01`)}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {data?.stockist?.StockistName || "Loading…"}
                    </Typography>
                </Box>
                {data && <StatusChip label={status.label} color={status.color} />}
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
                    data && (
                        <Stack spacing={2}>
                            {data.statement?.Status === "RETURNED" && data.statement.ReviewRemarks && (
                                <Alert severity="error" variant="outlined">
                                    Returned by your manager: {data.statement.ReviewRemarks}
                                </Alert>
                            )}
                            {!editable && data.blockedReason && (
                                <Alert severity="info" variant="outlined">
                                    {data.blockedReason}
                                </Alert>
                            )}
                            {editable && data.openingLocked && (
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    Opening stock is carried from {formatMonthLabel(data.previous.StatementMonth)}'s closing.
                                </Typography>
                            )}
                            {editable && data.previous && !data.openingLocked && (
                                <Alert severity="warning" variant="outlined">
                                    {formatMonthLabel(data.previous.StatementMonth)} isn't submitted yet. You can save a draft, but submit that month first.
                                </Alert>
                            )}

                            <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 1.5, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}>
                                <Box
                                    sx={(theme) => ({
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, minmax(0, auto))",
                                        gap: theme.stat.gap,
                                    })}
                                >
                                    <Total label="Units sold" value={formatUnits(totals.units)} />
                                    <Total label="Sales value" value={formatAmount(totals.sales / 100)} />
                                    <Total label="Closing stock value" value={formatAmount(totals.closing / 100)} />
                                </Box>
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
                            </Stack>

                            {visibleRows.length ? (
                                <StatementTable rows={visibleRows} editable={editable} openingLocked={data.openingLocked} onChange={setValue} />
                            ) : (
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    {rows.length ? "No products match." : "No priced products in the catalogue yet."}
                                </Typography>
                            )}

                            {(editable || remarks) && (
                                <TextField
                                    multiline
                                    minRows={2}
                                    label="Remarks (optional)"
                                    value={remarks}
                                    onChange={(event) => setRemarks(event.target.value.slice(0, 500))}
                                    disabled={!editable}
                                />
                            )}

                            {editable && firstError && (
                                <Alert severity="info" variant="outlined">
                                    {firstError}
                                </Alert>
                            )}
                        </Stack>
                    )
                )}
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    {editable ? "Cancel" : "Close"}
                </Button>
                {editable && (
                    <>
                        <Button variant="outlined" onClick={() => save(false)} disabled={saving || Boolean(firstError)}>
                            Save draft
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<SendRounded />}
                            onClick={() => setConfirmSubmit(true)}
                            disabled={saving || Boolean(firstError) || !anyValues || (data.previous && !data.openingLocked)}
                        >
                            Submit for review
                        </Button>
                    </>
                )}
            </DialogActions>

            {confirmSubmit && (
                <ConfirmActionDialog
                    icon={SendRounded}
                    title="Submit this statement?"
                    message={`${formatUnits(totals.units)} units sold worth ${formatAmount(totals.sales / 100)}. You can't change it unless your manager returns it.`}
                    confirmLabel="Submit"
                    busy={saving}
                    onClose={() => setConfirmSubmit(false)}
                    onConfirm={() => save(true)}
                />
            )}
        </Dialog>
    );
}

export default StatementDialog;
