import { useEffect, useState } from "react";

import {
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
import { CloseRounded } from "@mui/icons-material";

import { ITEM_TYPE, getGifts, getProducts } from "../index";

function DialogFrame({ eyebrow, title, saving, onClose, actions, children }) {
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
                        {eyebrow}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {title}
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    {children}
                </Stack>
            </DialogContent>
            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                {actions}
            </DialogActions>
        </Dialog>
    );
}

const wholeNumber = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;

// Manager hands stock to a direct report.
export function IssueStockDialog({ itemType, reports, defaultUserId, saving, onClose, onSave }) {
    const [items, setItems] = useState([]);
    const [userId, setUserId] = useState(defaultUserId || "");
    const [itemId, setItemId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [batchNumber, setBatchNumber] = useState("");
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        const request = itemType === "SAMPLE" ? getProducts(true) : getGifts(true);

        request
            .then((response) =>
                setItems(
                    itemType === "SAMPLE"
                        ? (response?.products || [])
                              .filter((product) => product.IsSample)
                              .map((product) => ({ id: product.ProductId, name: product.ProductName, detail: product.PackSize }))
                        : (response?.gifts || []).map((gift) => ({ id: gift.GiftId, name: gift.GiftName, detail: gift.Description }))
                )
            )
            .catch(() => setItems([]));
    }, [itemType]);

    const canSave = userId && itemId && wholeNumber(quantity);
    const config = ITEM_TYPE[itemType];

    return (
        <DialogFrame
            eyebrow="Issue stock"
            title={`Issue ${config.plural.toLowerCase()}`}
            saving={saving}
            onClose={onClose}
            actions={
                <Button
                    variant="contained"
                    disabled={!canSave || saving}
                    onClick={() =>
                        onSave({
                            UserId: userId,
                            ItemType: itemType,
                            ItemId: itemId,
                            Quantity: Number(quantity),
                            BatchNumber: batchNumber.trim() || null,
                            Remarks: remarks.trim() || null,
                        })
                    }
                >
                    Issue
                </Button>
            }
        >
            <TextField select required label="Team member" value={userId} onChange={(event) => setUserId(event.target.value)}>
                {reports.map((member) => (
                    <MenuItem key={member.UserId} value={member.UserId}>
                        {member.Name}
                        {member.DesignationName ? ` · ${member.DesignationName}` : ""}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                select
                required
                label={config.label}
                value={itemId}
                onChange={(event) => setItemId(event.target.value)}
                helperText={items.length === 0 ? `No active ${config.plural.toLowerCase()} in the catalogue yet.` : " "}
            >
                {items.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                        {item.name}
                        {item.detail ? ` · ${item.detail}` : ""}
                    </MenuItem>
                ))}
            </TextField>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                    required
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    slotProps={{ htmlInput: { min: 1, step: 1 } }}
                />
                {itemType === "SAMPLE" && (
                    <TextField
                        fullWidth
                        label="Batch number (optional)"
                        value={batchNumber}
                        onChange={(event) => setBatchNumber(event.target.value.slice(0, 50))}
                    />
                )}
            </Stack>

            <TextField
                multiline
                minRows={2}
                label="Note (optional)"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value.slice(0, 300))}
            />
        </DialogFrame>
    );
}

// Holder returns unused stock (expired, damaged, surplus).
export function ReturnStockDialog({ item, saving, onClose, onSave }) {
    const [quantity, setQuantity] = useState("");
    const [remarks, setRemarks] = useState("");

    const valid = wholeNumber(quantity) && Number(quantity) <= item.Balance;

    return (
        <DialogFrame
            eyebrow="Return stock"
            title={`Return ${item.ItemName}`}
            saving={saving}
            onClose={onClose}
            actions={
                <Button
                    variant="contained"
                    color="warning"
                    disabled={!valid || !remarks.trim() || saving}
                    onClick={() =>
                        onSave({ ItemType: item.ItemType, ItemId: item.ItemId, Quantity: Number(quantity), Remarks: remarks.trim() })
                    }
                >
                    Return
                </Button>
            }
        >
            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                You hold {item.Balance} {ITEM_TYPE[item.ItemType].unit}.
            </Typography>
            <TextField
                required
                label="Quantity to return"
                type="number"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                error={quantity !== "" && !valid}
                helperText={quantity !== "" && !valid ? `Enter 1 to ${item.Balance}` : " "}
                slotProps={{ htmlInput: { min: 1, max: item.Balance, step: 1 } }}
            />
            <TextField
                required
                multiline
                minRows={2}
                label="Reason"
                placeholder="e.g. Near expiry, damaged packs"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value.slice(0, 300))}
            />
        </DialogFrame>
    );
}
