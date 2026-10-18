import { useEffect, useState } from "react";

import { Alert, Box, Divider, Stack, Typography } from "@mui/material";
import { HourglassBottomRounded, PaidRounded, RemoveCircleOutlineRounded, WorkspacePremiumRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import { dayLabel, errorMessage, getIncentives, monthLabel, rupees } from "../index";

// Incentive on net sales, held for N months; returns from the territory in those months are deducted.
function IncentivesTab({ userId }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        setData(null);
        getIncentives(userId)
            .then((result) => {
                setData(result);
                setError("");
            })
            .catch((err) => setError(errorMessage(err, "Couldn't load incentives")));
    }, [userId]);

    if (error) return <Alert severity="error" variant="outlined">{error}</Alert>;
    if (!data) return <EmptyState icon={WorkspacePremiumRounded} title="Loading…" />;

    const t = data.totals;
    const slabText = data.slabs.map((s) => `${s.RatePercent}% from ${rupees(s.FromAmount)}`).join(" · ");

    return (
        <Stack spacing={2}>
            <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                <StatCard icon={WorkspacePremiumRounded} label="Earned" value={rupees(t.earned)} caption="Last 12 months" color="primary" />
                <StatCard icon={HourglassBottomRounded} label="Held" value={rupees(t.held)} caption={`Released ${data.holdMonths} months later`} color="warning" />
                <StatCard icon={RemoveCircleOutlineRounded} label="Deducted" value={rupees(t.deducted)} caption="Returns / expiry in the hold period" color="error" />
                <StatCard icon={PaidRounded} label="Released" value={rupees(t.released)} caption="After deductions" color="success" />
            </Box>

            <Panel title="By month" subtitle={`Incentive = net sales × slab rate (${slabText}). Held until the end of month + ${data.holdMonths}; returns booked in those months are deducted.`}>
                {data.months.length ? (
                    <Stack divider={<Divider />}>
                        {data.months.map((m) => (
                            <Stack key={m.month} direction={{ xs: "column", md: "row" }} sx={{ py: 1.25, gap: 1, alignItems: { md: "center" } }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2">{monthLabel(m.month)}</Typography>
                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        Net sales {rupees(m.netSales)} × {m.rate}% · {m.status === "HELD" ? `releases after ${dayLabel(m.releaseOn)}` : `released after ${dayLabel(m.releaseOn)}`}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={(theme) => ({ minWidth: theme.spacing(16) })}>
                                    Earned {rupees(m.earned)}
                                </Typography>
                                <Typography variant="body2" sx={(theme) => ({ minWidth: theme.spacing(16), color: m.deducted ? theme.palette.error.main : theme.palette.text.secondary })}>
                                    − {rupees(m.deducted)}
                                </Typography>
                                <Tag label={m.status === "HELD" ? `Held ${rupees(m.held)}` : `Released ${rupees(m.released)}`} color={m.status === "HELD" ? "warning" : "success"} />
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={WorkspacePremiumRounded} title="No net sales yet" message="Incentives start once head office records dispatches to your territory's stockists." />
                )}
            </Panel>
        </Stack>
    );
}

export default IncentivesTab;
