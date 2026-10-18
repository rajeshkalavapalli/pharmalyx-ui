import { useEffect, useState } from "react";

import { Alert, Box, Divider, Stack, Typography } from "@mui/material";
import { EventBusyRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import Tag from "../../../components/Tag/Tag";
import { dayLabel, errorMessage, getNearExpiry } from "../index";

// Batches at the territory's stockists that expire soon: move them before they come back as returns.
function ExpiryTab({ userId }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        setData(null);
        getNearExpiry(userId)
            .then((result) => {
                setData(result);
                setError("");
            })
            .catch((err) => setError(errorMessage(err, "Couldn't load near-expiry stock")));
    }, [userId]);

    if (error) return <Alert severity="error" variant="outlined">{error}</Alert>;
    if (!data) return <EmptyState icon={EventBusyRounded} title="Loading…" />;

    return (
        <Panel title="Near-expiry stock" subtitle={`Batches dispatched to your territory's stockists that expire within ${data.days} days (dispatched minus returned).`}>
            {data.batches.length ? (
                <Stack divider={<Divider />}>
                    {data.batches.map((b) => (
                        <Stack key={`${b.BatchId}-${b.StockistId}-${b.TerritoryId}`} direction={{ xs: "column", sm: "row" }} sx={{ py: 1.25, gap: 1, alignItems: { sm: "center" } }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2">
                                    {b.ProductName} · batch {b.BatchNumber}
                                </Typography>
                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    {b.StockistName} · {b.TerritoryName} · {b.Quantity} unit(s) · expires {dayLabel(b.ExpiryDate)}
                                </Typography>
                            </Box>
                            <Tag label={b.expired ? "Expired" : `${b.DaysLeft} days left`} color={b.expired ? "error" : b.DaysLeft <= 30 ? "error" : "warning"} />
                        </Stack>
                    ))}
                </Stack>
            ) : (
                <EmptyState icon={EventBusyRounded} title="Nothing near expiry" />
            )}
        </Panel>
    );
}

export default ExpiryTab;
