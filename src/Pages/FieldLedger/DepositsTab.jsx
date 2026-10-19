import { useCallback, useEffect, useState } from "react";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { DoneAllRounded, PaymentsRounded } from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import Panel from "../../components/Panel/Panel";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { PAYMENT_MODES, confirmDeposit, dayLabel, errorMessage, getPaymentsWithMr, rupees } from "./index";

// Head office: money MRs collected from chemists that has not reached the company yet.
function DepositsTab({ onChanged }) {
    const { showSnackbar } = useSnackbar();
    const [rows, setRows] = useState(null);
    const [busy, setBusy] = useState(null);

    const load = useCallback(() => {
        getPaymentsWithMr()
            .then((r) => setRows(r.payments))
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load payments"), "error"));
    }, [showSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    const total = (rows || []).reduce((sum, r) => sum + Number(r.Amount || 0), 0);

    return (
        <Panel title="Payments to confirm" subtitle={`Collected by MRs, not yet received by the company: ${rupees(total)}. Mark each one when the money arrives.`}>
            {rows?.length ? (
                <Stack divider={<Divider />}>
                    {rows.map((p) => (
                        <Stack key={p.EntryId} direction={{ xs: "column", sm: "row" }} sx={{ py: 1.25, gap: 1, alignItems: { sm: "center" } }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" sx={{ gap: 0.75, alignItems: "center" }}>
                                    <Typography variant="subtitle2">{rupees(p.Amount)}</Typography>
                                    <Tag label={PAYMENT_MODES.find((m) => m.value === p.PaymentMode)?.label || p.PaymentMode} color="info" />
                                </Stack>
                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    {p.PharmacyName} · {dayLabel(p.EntryDate)} · collected by {p.UserName}
                                    {p.PaymentRef ? ` · ref ${p.PaymentRef}` : ""}
                                </Typography>
                            </Box>
                            <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                startIcon={<DoneAllRounded />}
                                disabled={busy === p.EntryId}
                                onClick={async () => {
                                    setBusy(p.EntryId);
                                    try {
                                        showSnackbar((await confirmDeposit(p.EntryId)).message, "success");
                                        load();
                                        onChanged?.();
                                    } catch (err) {
                                        showSnackbar(errorMessage(err, "Could not confirm"), "error");
                                    } finally {
                                        setBusy(null);
                                    }
                                }}
                            >
                                Mark received
                            </Button>
                        </Stack>
                    ))}
                </Stack>
            ) : (
                <EmptyState icon={PaymentsRounded} title={rows ? "Nothing waiting" : "Loading…"} message={rows ? "Every collected payment has reached the company." : undefined} />
            )}
        </Panel>
    );
}

export default DepositsTab;
