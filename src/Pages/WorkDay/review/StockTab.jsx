import { useCallback, useEffect, useState } from "react";

import { Box, Button, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { Inventory2Rounded, SaveRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { errorMessage, getReconciliation, recordCount } from "../index";

// Samples per MR: issued, given (logged in visits), returned, expected in hand, and physical counts.
function StockTab({ people, canCount }) {
    const { showSnackbar } = useSnackbar();
    const [userId, setUserId] = useState("");
    const [data, setData] = useState(null);
    const [counts, setCounts] = useState({});
    const [remarks, setRemarks] = useState("");
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        setData(null);
        getReconciliation(userId || undefined)
            .then((result) => {
                setData(result);
                setCounts({});
            })
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load stock"), "error"));
    }, [userId, showSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    const entered = Object.entries(counts).filter(([, value]) => value !== "");

    const save = async () => {
        setBusy(true);
        try {
            const result = await recordCount(
                userId,
                entered.map(([key, value]) => {
                    const [ItemType, ItemId] = key.split(":");
                    return { ItemType, ItemId, CountedQty: Number(value) };
                }),
                remarks
            );
            showSnackbar(result.message, "success");
            setRemarks("");
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Could not save"), "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack spacing={2}>
            <TextField select size="small" label="Whose stock" value={userId} onChange={(e) => setUserId(e.target.value)} sx={(theme) => ({ maxWidth: theme.spacing(36) })}>
                <MenuItem value="">Mine</MenuItem>
                {people.map((person) => (
                    <MenuItem key={person.UserId} value={person.UserId}>
                        {person.Name}
                    </MenuItem>
                ))}
            </TextField>

            <Panel
                title="Expected in hand vs counted"
                subtitle="Expected = issued − given − returned. Samples are logged in one tap during a visit, stamped with who gave them, when and where. No doctor signature."
                actions={
                    canCount &&
                    userId && (
                        <Button variant="contained" startIcon={<SaveRounded />} disabled={busy || !entered.length} onClick={save}>
                            Save count
                        </Button>
                    )
                }
            >
                {data?.items?.length ? (
                    <Stack divider={<Divider />}>
                        {data.items.map((item) => {
                            const key = `${item.ItemType}:${item.ItemId}`;
                            const diff = item.LastCountDifference;
                            return (
                                <Stack key={key} direction={{ xs: "column", md: "row" }} sx={{ py: 1.25, gap: 1.5, alignItems: { md: "center" } }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Stack direction="row" sx={{ gap: 0.75, alignItems: "center" }}>
                                            <Typography variant="subtitle2">{item.ItemName}</Typography>
                                            <Tag label={item.ItemType === "SAMPLE" ? "Sample" : "Gift"} color="secondary" />
                                        </Stack>
                                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            Issued {item.Issued} · given {item.Given} · returned {item.Returned} · expected in hand <b>{item.Expected}</b>
                                            {item.LastCountedOn ? ` · last counted ${item.LastCounted} on ${new Date(item.LastCountedOn).toLocaleDateString("en-IN")} by ${item.LastCountedBy}` : " · never counted"}
                                        </Typography>
                                    </Box>
                                    {diff != null && diff !== 0 && <Tag label={diff < 0 ? `${-diff} short` : `${diff} extra`} color={diff < 0 ? "error" : "warning"} />}
                                    {diff === 0 && <Tag label="Matched" color="success" />}
                                    {canCount && userId && (
                                        <TextField
                                            size="small"
                                            type="number"
                                            label="Counted now"
                                            value={counts[key] ?? ""}
                                            onChange={(e) => setCounts((current) => ({ ...current, [key]: e.target.value }))}
                                            sx={(theme) => ({ width: theme.spacing(16) })}
                                            slotProps={{ htmlInput: { min: 0 } }}
                                        />
                                    )}
                                </Stack>
                            );
                        })}
                    </Stack>
                ) : (
                    <EmptyState icon={Inventory2Rounded} title={data ? "No samples or gifts held" : "Loading…"} />
                )}
                {canCount && userId && entered.length > 0 && (
                    <TextField sx={{ mt: 2 }} fullWidth label="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value.slice(0, 500))} />
                )}
            </Panel>

            {data?.history?.length > 0 && (
                <Panel title="Count history">
                    <Stack divider={<Divider />}>
                        {data.history.slice(0, 30).map((row) => (
                            <Typography key={row.CountId} variant="body2" sx={{ py: 0.75 }}>
                                {new Date(row.CountedOn).toLocaleDateString("en-IN")} · {row.ItemName}: expected {row.ExpectedQty}, counted {row.CountedQty} ({row.Difference >= 0 ? "+" : ""}
                                {row.Difference}) · {row.CountedByName}
                            </Typography>
                        ))}
                    </Stack>
                </Panel>
            )}
        </Stack>
    );
}

export default StockTab;
