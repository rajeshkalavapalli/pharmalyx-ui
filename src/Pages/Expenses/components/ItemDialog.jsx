import { useState } from "react";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { CloseRounded } from "@mui/icons-material";

const isAmount = (value) => /^\d+(\.\d{1,2})?$/.test(String(value)) && Number(value) > 0 && Number(value) <= 100000;

const pad = (value) => String(value).padStart(2, "0");
const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Add one other expense (courier, stationery, special meeting travel, misc) with its bill details.
function ItemDialog({ month, itemTypes, remaining, saving, onClose, onSave }) {
    const first = month;
    const last = toKey(new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0));
    const today = toKey(new Date());
    const maxDate = last < today ? last : today;

    const [date, setDate] = useState(maxDate);
    const [type, setType] = useState(itemTypes[0]?.value || "");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [billNumber, setBillNumber] = useState("");
    const [vendor, setVendor] = useState("");

    const overLimit = remaining != null && Number(amount) > remaining;
    const canSave = date >= first && date <= maxDate && type && description.trim() && isAmount(amount) && !overLimit;

    return (
        <Dialog
            open
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}
        >
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2 })}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        Other expense
                    </Typography>
                    <Typography variant="h5" component="h2">
                        Add an expense
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
                        <TextField label="Date" type="date" required value={date} onChange={(event) => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: first, max: maxDate } }} />
                        <TextField select label="Type" required value={type} onChange={(event) => setType(event.target.value)}>
                            {itemTypes.map((item) => (
                                <MenuItem key={item.value} value={item.value}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    <TextField
                        label="Description"
                        required
                        placeholder={type === "MEETING_TRAVEL" ? "e.g. Train to Pune for the regional meeting" : "What was it for?"}
                        value={description}
                        onChange={(event) => setDescription(event.target.value.slice(0, 300))}
                    />
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
                        <TextField
                            label="Amount (₹)"
                            required
                            type="number"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            error={Boolean(amount) && (!isAmount(amount) || overLimit)}
                            helperText={overLimit ? `Only ₹${remaining.toLocaleString("en-IN")} left this month` : remaining != null ? `₹${remaining.toLocaleString("en-IN")} left` : " "}
                            slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
                        />
                        <TextField label="Bill number" value={billNumber} onChange={(event) => setBillNumber(event.target.value.slice(0, 50))} helperText=" " />
                        <TextField label="Vendor" value={vendor} onChange={(event) => setVendor(event.target.value.slice(0, 150))} helperText=" " />
                    </Box>
                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Keep the original bill; photo upload will be added later.
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disabled={!canSave || saving}
                    onClick={() =>
                        onSave({
                            ExpenseDate: date,
                            ExpenseType: type,
                            Description: description.trim(),
                            Amount: Number(amount),
                            BillNumber: billNumber.trim() || null,
                            Vendor: vendor.trim() || null,
                        })
                    }
                >
                    Add expense
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ItemDialog;
