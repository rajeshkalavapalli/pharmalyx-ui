import { useEffect, useState } from "react";

import { Alert, Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { AccountBalanceWalletRounded, FlagCircleRounded, SavingsRounded, TrendingUpRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import CostChart from "../components/CostChart";
import { MILESTONE_STATUS, errorMessage, getCost, getRampUp, monthLabel, rupees } from "../index";

// Ramp-up milestones and cumulative cost vs net sales against the expected curve.
function RampTab({ userId }) {
    const [ramp, setRamp] = useState(null);
    const [cost, setCost] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        setRamp(null);
        setCost(null);
        Promise.all([getRampUp(userId), getCost(userId)])
            .then(([r, c]) => {
                setRamp(r);
                setCost(c);
                setError("");
            })
            .catch((err) => setError(errorMessage(err, "Couldn't load ramp-up")));
    }, [userId]);

    if (error) return <Alert severity="error" variant="outlined">{error}</Alert>;
    if (!ramp || !cost) return <EmptyState icon={TrendingUpRounded} title="Loading…" />;

    const s = cost.summary;

    return (
        <Stack spacing={2}>
            {(!ramp.joiningSet || !ramp.salarySet) && (
                <Alert severity="info" variant="outlined">
                    {!ramp.joiningSet ? "Joining date is not set (the account creation date is used). " : ""}
                    {!ramp.salarySet ? "Monthly salary is not set, so cost shows only TA/DA. " : ""}
                    Head office sets these under Business data → People.
                </Alert>
            )}

            <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                <StatCard icon={FlagCircleRounded} label="Month since joining" value={ramp.monthNumber} caption={`Joined ${monthLabel(ramp.joiningDate)}`} color="primary" />
                <StatCard icon={AccountBalanceWalletRounded} label="Cost so far" value={rupees(s?.cumulativeCost)} caption="Salary + TA/DA" color="error" />
                <StatCard icon={SavingsRounded} label="Net sales so far" value={rupees(s?.cumulativeNet)} caption={s?.recoveredPercent == null ? "—" : `${s.recoveredPercent}% of cost`} color="success" />
                <StatCard icon={TrendingUpRounded} label="Vs expected ramp" value={s?.vsExpected == null ? "—" : `${s.vsExpected}%`} caption={`Expected so far ${rupees(s?.cumulativeExpected)}`} color={s?.vsExpected != null && s.vsExpected < 100 ? "warning" : "success"} />
            </Box>

            <Panel title="Milestones" subtitle="Set by head office for new MRs and new territories.">
                <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                    {ramp.milestones.map((m) => {
                        const color = MILESTONE_STATUS[m.status].color;
                        return (
                            <Box
                                key={m.MilestoneId}
                                sx={(theme) => ({
                                    p: 2,
                                    borderRadius: theme.card.radius,
                                    border: `1px solid ${alpha(theme.palette[color].main, theme.tint.border)}`,
                                    backgroundColor: alpha(theme.palette[color].main, theme.tint.soft / 2),
                                })}
                            >
                                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                    <Typography variant="overline" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        Month {m.MonthNumber} · {monthLabel(m.month)}
                                    </Typography>
                                    <Tag label={MILESTONE_STATUS[m.status].label} color={color} />
                                </Stack>
                                <Typography variant="subtitle1" sx={{ fontWeight: "fontWeightSemibold" }}>
                                    {m.label}
                                </Typography>
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    Target {m.Target}
                                    {m.unit === "%" ? "%" : ""} · actual {m.actual == null ? "—" : `${m.actual}${m.unit === "%" ? "%" : ""}`}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Panel>

            <Panel title="Cost vs business" subtitle="Cumulative from the joining month. Expected = the ramp milestones applied to the cost.">
                {cost.series.length ? <CostChart series={cost.series} /> : <EmptyState icon={TrendingUpRounded} title="No months yet" />}
            </Panel>
        </Stack>
    );
}

export default RampTab;
