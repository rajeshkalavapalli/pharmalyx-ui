import { useEffect, useState } from "react";

import { Alert, Box, Divider, Stack, TextField, Typography } from "@mui/material";
import { AssignmentTurnedInRounded, CurrencyRupeeRounded, FlagRounded, LocalPharmacyRounded, PercentRounded, ReplayRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import { FLAG_LABEL } from "../../WorkDay/index";
import { MILESTONE_STATUS, errorMessage, getReview, monthLabel, rupees, thisMonth } from "../index";

const Row = ({ label, value, strong }) => (
    <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2, py: 0.75 }}>
        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
            {label}
        </Typography>
        <Typography variant={strong ? "subtitle2" : "body2"}>{value}</Typography>
    </Stack>
);

// Data-only monthly review: the same numbers for the MR, their manager and head office.
function ReviewTab({ userId }) {
    const [month, setMonth] = useState(thisMonth());
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        setData(null);
        getReview(month, userId)
            .then((result) => {
                setData(result);
                setError("");
            })
            .catch((err) => setError(errorMessage(err, "Couldn't load the review")));
    }, [month, userId]);

    if (error) return <Alert severity="error" variant="outlined">{error}</Alert>;

    return (
        <Stack spacing={2}>
            <Stack direction="row" sx={{ gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                <TextField size="small" type="month" label="Month" value={month} onChange={(e) => setMonth(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                {data && (
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {data.name} · month {data.monthNumber} since joining · {data.territories.map((t) => t.TerritoryName).join(", ") || "no territory mapped"}
                    </Typography>
                )}
            </Stack>

            {!data ? (
                <EmptyState icon={AssignmentTurnedInRounded} title="Loading…" />
            ) : (
                <>
                    <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                        <StatCard icon={PercentRounded} label="STP coverage" value={data.stpCoverage == null ? "—" : `${data.stpCoverage}%`} caption={`${data.validVisits} verified visits`} color="primary" progress={data.stpCoverage || 0} />
                        <StatCard icon={LocalPharmacyRounded} label="Chemists with POB" value={data.pob.chemistsOrdered} caption={`${data.pob.supplied} of ${data.pob.booked} orders supplied`} color="info" />
                        <StatCard
                            icon={CurrencyRupeeRounded}
                            label="Net sales"
                            value={rupees(data.sales.net)}
                            caption={data.sales.pctOfCost == null ? "Cost not set" : `${data.sales.pctOfCost}% of cost${data.sales.targetPct != null ? ` · target ${data.sales.targetPct}%` : ""}`}
                            color={data.sales.targetPct != null && data.sales.pctOfCost != null && data.sales.pctOfCost < data.sales.targetPct ? "warning" : "success"}
                        />
                        <StatCard icon={FlagRounded} label="Order flags" value={data.flags.length} caption={`${data.nearExpiry} batch(es) near expiry`} color={data.flags.length ? "error" : "secondary"} />
                    </Box>

                    <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                        <Panel title="Business" subtitle={`${monthLabel(data.month)} · net sales = dispatch − returns`}>
                            <Stack divider={<Divider />}>
                                <Row label="Dispatched to stockists" value={rupees(data.sales.dispatched)} />
                                <Row label="Returned: expired" value={rupees(data.sales.expired)} />
                                <Row label="Returned: damaged / other" value={rupees((data.sales.damaged || 0) + (data.sales.other || 0))} />
                                <Row label="Net sales" value={rupees(data.sales.net)} strong />
                                <Row label="Cost (salary + TA/DA)" value={rupees(data.sales.cost)} />
                                <Row label="Net sales vs cost" value={data.sales.pctOfCost == null ? "—" : `${data.sales.pctOfCost}%`} strong />
                            </Stack>
                        </Panel>
                        <Panel title="Field work and POB" subtitle="POB status is for follow-up only, not incentives.">
                            <Stack divider={<Divider />}>
                                <Row label="STP coverage" value={data.stpCoverage == null ? "—" : `${data.stpCoverage}%`} />
                                <Row label="Verified visits" value={data.validVisits} />
                                <Row label="POB booked" value={`${data.pob.booked} · ${rupees(data.pob.bookedValue)}`} />
                                <Row label="POB marked supplied" value={`${data.pob.supplied} · ${rupees(data.pob.suppliedValue)}`} />
                                <Row label="Verified by manager" value={data.pob.verified} />
                                <Row label="Chemists with POB orders" value={data.pob.chemistsOrdered} strong />
                            </Stack>
                        </Panel>
                    </Box>

                    <Panel title="Ramp-up milestones" subtitle="Set by head office. Months count from the joining month.">
                        <Stack divider={<Divider />}>
                            {data.milestones.map((m) => (
                                <Stack key={m.MilestoneId} direction="row" sx={{ py: 1, gap: 1.5, alignItems: "center" }}>
                                    <Typography variant="body2" sx={(theme) => ({ width: theme.spacing(10), color: theme.palette.text.secondary })}>
                                        Month {m.MonthNumber}
                                    </Typography>
                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                        {m.label}: {m.Target}
                                        {m.unit === "%" ? "%" : ""}
                                    </Typography>
                                    <Typography variant="body2">{m.actual == null ? "—" : `${m.actual}${m.unit === "%" ? "%" : ""}`}</Typography>
                                    <Tag label={MILESTONE_STATUS[m.status].label} color={MILESTONE_STATUS[m.status].color} />
                                </Stack>
                            ))}
                        </Stack>
                    </Panel>

                    <Panel title="Order checks" subtitle="Automatic flags this month. Head office reviews them; nothing is decided automatically.">
                        {data.flags.length ? (
                            <Stack divider={<Divider />}>
                                {data.flags.map((flag) => (
                                    <Stack key={flag.FlagId} direction="row" sx={{ py: 1, gap: 1.5, alignItems: "center" }}>
                                        <Tag label={FLAG_LABEL[flag.FlagType] || flag.FlagType} color={flag.Severity === "HIGH" ? "error" : "warning"} />
                                        <Typography variant="body2" sx={{ flex: 1 }}>
                                            {flag.Details}
                                        </Typography>
                                        <Tag label={flag.Status === "OPEN" ? "Open" : flag.Status === "RESOLVED" ? "Resolved" : "Acknowledged"} color="secondary" />
                                    </Stack>
                                ))}
                            </Stack>
                        ) : (
                            <EmptyState icon={ReplayRounded} title="No flags this month" />
                        )}
                    </Panel>
                </>
            )}
        </Stack>
    );
}

export default ReviewTab;
