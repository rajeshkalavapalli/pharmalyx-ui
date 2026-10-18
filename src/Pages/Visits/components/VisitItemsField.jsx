import { Box, Button, Checkbox, FormControlLabel, IconButton, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { AddRounded, CardGiftcardRounded, CloseRounded, MedicationRounded } from "@mui/icons-material";
import { useState } from "react";

const ICONS = { SAMPLE: MedicationRounded, GIFT: CardGiftcardRounded };

export const itemKey = (item) => `${item.ItemType}:${item.ItemId}`;

// Error for the chosen items, or "" when all quantities are within what's held.
export const itemsError = (items, stock) => {
    for (const item of items) {
        const held = stock.find((row) => itemKey(row) === itemKey(item))?.Balance ?? 0;
        const quantity = Number(item.Quantity);

        if (!Number.isInteger(quantity) || quantity < 1) return `Enter a quantity for ${item.ItemName}.`;
        // Given by the joint-work colleague: comes from their stock (checked on the server).
        if (item.GivenBy !== "JOINT" && quantity > held) return `You only hold ${held} of ${item.ItemName}.`;
    }

    return "";
};

// Samples and gifts handed over during the call, limited to what the user holds.
// With joint work, an item can be marked as given by the colleague (recorded as theirs, from their stock).
function VisitItemsField({ stock, value, onChange, jointName = null }) {
    const [anchor, setAnchor] = useState(null);

    const chosen = new Set(value.map(itemKey));
    const available = stock.filter((row) => row.Balance > 0 && !chosen.has(itemKey(row)));

    const add = (row) => {
        onChange([...value, { ItemType: row.ItemType, ItemId: row.ItemId, ItemName: row.ItemName, Quantity: "1" }]);
        setAnchor(null);
    };

    const update = (key, quantity) =>
        onChange(value.map((item) => (itemKey(item) === key ? { ...item, Quantity: quantity } : item)));

    const remove = (key) => onChange(value.filter((item) => itemKey(item) !== key));

    const setGiver = (key, joint) => onChange(value.map((item) => (itemKey(item) === key ? { ...item, GivenBy: joint ? "JOINT" : null } : item)));

    return (
        <Box>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Box>
                    <Typography variant="subtitle2">Samples & gifts given</Typography>
                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {stock.some((row) => row.Balance > 0) ? "Deducted from your stock" : "You don't hold any samples or gifts"}
                    </Typography>
                </Box>
                <Button size="small" startIcon={<AddRounded />} disabled={available.length === 0} onClick={(event) => setAnchor(event.currentTarget)}>
                    Add
                </Button>
            </Stack>

            <Stack spacing={1}>
                {value.map((item) => {
                    const key = itemKey(item);
                    const held = stock.find((row) => itemKey(row) === key)?.Balance ?? 0;
                    const Icon = ICONS[item.ItemType];
                    const byJoint = Boolean(jointName) && item.GivenBy === "JOINT";
                    const over = !byJoint && Number(item.Quantity) > held;

                    return (
                        <Stack
                            key={key}
                            direction="row"
                            spacing={1.25}
                            sx={(theme) => ({
                                alignItems: "center",
                                p: 1,
                                pl: 1.5,
                                borderRadius: theme.calendar.cell.radius,
                                backgroundColor: theme.palette.surface.subtle,
                                border: "1px solid",
                                borderColor: over ? theme.palette.error.main : theme.palette.border.subtle,
                            })}
                        >
                            <Icon fontSize="small" sx={(theme) => ({ color: theme.palette.primary.main })} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" noWrap>
                                    {item.ItemName}
                                </Typography>
                                <Typography variant="caption" sx={(theme) => ({ color: over ? theme.palette.error.dark : theme.palette.text.secondary })}>
                                    {byJoint ? `Given by ${jointName}` : `${held} in hand`}
                                </Typography>
                                {jointName && (
                                    <FormControlLabel
                                        sx={{ display: "flex", m: 0 }}
                                        control={<Checkbox size="small" checked={byJoint} onChange={(event) => setGiver(key, event.target.checked)} />}
                                        label={<Typography variant="caption">Given by {jointName}</Typography>}
                                    />
                                )}
                            </Box>
                            <TextField
                                size="small"
                                type="number"
                                label="Qty"
                                value={item.Quantity}
                                onChange={(event) => update(key, event.target.value)}
                                error={over}
                                sx={(theme) => ({ width: theme.spacing(11) })}
                                slotProps={{ htmlInput: { min: 1, max: held, step: 1 } }}
                            />
                            <Tooltip title="Remove">
                                <IconButton size="small" aria-label={`Remove ${item.ItemName}`} onClick={() => remove(key)}>
                                    <CloseRounded fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    );
                })}
            </Stack>

            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
                {available.map((row) => {
                    const Icon = ICONS[row.ItemType];

                    return (
                        <MenuItem key={itemKey(row)} onClick={() => add(row)} sx={{ gap: 1.25 }}>
                            <Icon fontSize="small" />
                            <Box sx={{ flex: 1 }}>{row.ItemName}</Box>
                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                {row.Balance} left
                            </Typography>
                        </MenuItem>
                    );
                })}
            </Menu>
        </Box>
    );
}

export default VisitItemsField;
