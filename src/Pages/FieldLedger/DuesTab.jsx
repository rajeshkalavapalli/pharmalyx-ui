import { useCallback, useEffect, useState } from "react";

import { Box, ButtonBase, Divider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { AccountBalanceWalletRounded, BlockRounded, HourglassBottomRounded, StorefrontRounded } from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import Panel from "../../components/Panel/Panel";
import StatCard from "../../components/StatCard/StatCard";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import ChemistLedgerDrawer from "./ChemistLedgerDrawer";
import { BUCKETS, errorMessage, getChemists, rupees } from "./index";

const grid = (theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap });
const muted = (theme) => ({ color: theme.palette.text.secondary });

// What each chemist owes the company, with the age of the dues and the credit status.
function DuesTab({ canCollect, onCollect, refreshKey, onChanged }) {
    const { showSnackbar } = useSnackbar();
    const [data, setData] = useState(null);
    const [open, setOpen] = useState(null);

    const load = useCallback(() => {
        getChemists()
            .then(setData)
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load chemist dues"), "error"));
    }, [showSnackbar]);

    useEffect(() => {
        load();
    }, [load, refreshKey]);

    if (!data) return <EmptyState icon={StorefrontRounded} title="Loading…" />;

    const old = data.totals.buckets.d61_90 + data.totals.buckets.d90_plus;

    return (
        <Stack spacing={2}>
            <Box sx={grid}>
                <StatCard icon={AccountBalanceWalletRounded} label="Chemists owe" value={rupees(data.totals.balance)} caption={`${data.chemists.filter((c) => c.balance > 0).length} chemist(s) with dues`} color="primary" />
                <StatCard icon={HourglassBottomRounded} label="31–60 days" value={rupees(data.totals.buckets.d31_60)} caption="Follow up now" color="warning" />
                <StatCard icon={HourglassBottomRounded} label="Over 60 days" value={rupees(old)} caption={`New supply and POBs blocked after ${data.blockDays} days`} color={old > 0 ? "error" : "success"} />
                <StatCard icon={BlockRounded} label="On hold" value={data.totals.blocked} caption="Over the limit or overdue" color={data.totals.blocked ? "error" : "success"} />
            </Box>

            <Panel title="Chemist dues" subtitle="Every rupee is in the company's name. Open a chemist to see the ledger and receipts.">
                {data.chemists.length ? (
                    <Stack divider={<Divider />}>
                        {data.chemists.map((c) => (
                            <ButtonBase
                                key={c.PharmacyId}
                                onClick={() => setOpen(c.PharmacyId)}
                                sx={(theme) => ({ py: 1.25, px: 1, gap: 1.5, display: "flex", justifyContent: "flex-start", textAlign: "left", borderRadius: theme.calendar.cell.radius, "&:hover": { backgroundColor: alpha(theme.palette.primary.main, theme.tint.hover) } })}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
                                        <Typography variant="subtitle2">{c.PharmacyName}</Typography>
                                        {c.blocked && <Tag label="On hold" color="error" title={c.reasons.join("; ")} />}
                                    </Stack>
                                    <Typography variant="caption" sx={muted}>
                                        {c.Owners} · {c.limit != null ? `limit ${rupees(c.limit)}` : "no limit"}
                                        {c.oldestDays ? ` · oldest ${c.oldestDays} days` : ""}
                                    </Typography>
                                    {c.balance > 0 && (
                                        <Stack direction="row" sx={{ gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
                                            {BUCKETS.filter((b) => c.buckets[b.key] > 0).map((b) => (
                                                <Tag key={b.key} label={`${b.label}: ${rupees(c.buckets[b.key])}`} color={b.color} />
                                            ))}
                                        </Stack>
                                    )}
                                </Box>
                                <Typography variant="subtitle1" sx={(theme) => ({ fontVariantNumeric: "tabular-nums", color: c.balance > 0 ? theme.palette.text.primary : theme.palette.text.disabled })}>
                                    {rupees(c.balance)}
                                </Typography>
                            </ButtonBase>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={StorefrontRounded} title="No chemist dues" message="Dues appear when an MR delivers company stock directly to a chemist." />
                )}
            </Panel>

            <ChemistLedgerDrawer
                pharmacyId={open}
                canCollect={canCollect}
                onCollect={(id) => {
                    setOpen(null);
                    onCollect(id);
                }}
                onClose={() => setOpen(null)}
                onChanged={() => {
                    load();
                    onChanged?.();
                }}
            />
        </Stack>
    );
}

export default DuesTab;
