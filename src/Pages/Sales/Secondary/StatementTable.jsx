import { Box, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { LockRounded } from "@mui/icons-material";

import { closingOf, formatUnits, isStatementQty as isQty, statementRowError as rowError } from "../index";


const FIELDS = [
    { key: "OpeningQty", label: "Opening" },
    { key: "ReceiptQty", label: "Receipts", hint: "Received from the company" },
    { key: "SalesQty", label: "Sales", hint: "Sold to the market" },
    { key: "ReturnQty", label: "Returns", hint: "Returned by retailers" },
];

// Product × (opening, receipts, sales, returns → closing). Editable for the MR, read-only for review.
function StatementTable({ rows, editable = false, openingLocked = false, onChange }) {
    const showPrevious = rows.some((row) => row.PreviousSalesQty != null);

    return (
        <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>Product</TableCell>
                        {FIELDS.map((field) => (
                            <TableCell key={field.key} align="right">
                                <Tooltip title={field.key === "OpeningQty" && openingLocked ? "Carried from last month's closing" : field.hint || ""}>
                                    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                                        {field.key === "OpeningQty" && openingLocked && <LockRounded sx={{ fontSize: "inherit" }} />}
                                        {field.label}
                                    </Box>
                                </Tooltip>
                            </TableCell>
                        ))}
                        <TableCell align="right">Closing</TableCell>
                        {showPrevious && <TableCell align="right">Last month sales</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => {
                        const error = editable ? rowError(row) : "";
                        const closing = closingOf(row);

                        return (
                            <TableRow key={row.ProductId} hover>
                                <TableCell sx={(theme) => ({ minWidth: theme.permissionMatrix.featureColumnMinWidth })}>
                                    <Typography variant="subtitle2">{row.ProductName}</Typography>
                                    {row.PackSize && (
                                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {row.PackSize}
                                        </Typography>
                                    )}
                                </TableCell>

                                {FIELDS.map((field) => {
                                    const locked = !editable || (field.key === "OpeningQty" && openingLocked);

                                    return (
                                        <TableCell key={field.key} align="right">
                                            {locked ? (
                                                <Typography variant="body2" sx={(theme) => ({ color: row[field.key] ? theme.palette.text.primary : theme.palette.text.disabled })}>
                                                    {formatUnits(Number(row[field.key]) || 0)}
                                                </Typography>
                                            ) : (
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={row[field.key]}
                                                    onChange={(event) => onChange(row.ProductId, field.key, event.target.value)}
                                                    error={!isQty(row[field.key])}
                                                    slotProps={{
                                                        htmlInput: { min: 0, "aria-label": `${row.ProductName} ${field.label}` },
                                                    }}
                                                    sx={(theme) => ({ width: theme.engagement.quantityColumn, "& input": { textAlign: "right" } })}
                                                />
                                            )}
                                        </TableCell>
                                    );
                                })}

                                <TableCell align="right">
                                    <Typography variant="subtitle2" sx={(theme) => ({ color: error ? theme.palette.error.main : theme.palette.text.primary })}>
                                        {formatUnits(closing)}
                                    </Typography>
                                    {error && (
                                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.error.main })}>
                                            {error}
                                        </Typography>
                                    )}
                                </TableCell>

                                {showPrevious && (
                                    <TableCell align="right">
                                        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {row.PreviousSalesQty == null ? "—" : formatUnits(row.PreviousSalesQty)}
                                        </Typography>
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Box>
    );
}

export default StatementTable;
