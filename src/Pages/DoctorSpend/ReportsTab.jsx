import { useEffect, useState } from "react";

import { Box, Divider, Stack, Typography } from "@mui/material";
import { CheckCircleRounded, HighlightOffRounded, PaymentsRounded, TrendingUpRounded } from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import Panel from "../../components/Panel/Panel";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../components/StatCard/StatCard";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { errorMessage, getReports, rupees, scoreText } from "./index";

const VIEWS = [
    { value: "byDoctor", label: "Doctor" },
    { value: "byTerritory", label: "Territory" },
    { value: "byMr", label: "MR" },
    { value: "byManager", label: "Manager" },
];
const grid = (theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap });

// Doctor-related spend paid, and whether the promised business came.
function ReportsTab() {
    const { showSnackbar } = useSnackbar();
    const [data, setData] = useState(null);
    const [view, setView] = useState("byDoctor");

    useEffect(() => {
        getReports()
            .then(setData)
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load the reports"), "error"));
    }, [showSnackbar]);

    if (!data) return <EmptyState icon={PaymentsRounded} title="Loading…" />;
    const s = data.summary;
    const rows = data[view];

    return (
        <Stack spacing={2}>
            <Box sx={grid}>
                <StatCard icon={PaymentsRounded} label="Spend paid" value={rupees(s.paid)} caption={`${s.paidCount} request(s) · ${s.waiting} waiting`} color="primary" />
                <StatCard icon={CheckCircleRounded} label="On track" value={s.onTrack} caption={`of ${s.finals} finished claim(s)`} color="success" progress={s.finals ? Math.round((s.onTrack / s.finals) * 100) : undefined} />
                <StatCard icon={HighlightOffRounded} label="Claims failed" value={s.failed} caption={`${s.partly} partly met · ${s.inProgress} in progress`} color={s.failed ? "error" : "secondary"} />
                <StatCard icon={TrendingUpRounded} label="Promised vs actual" value={rupees(s.actual)} caption={`against ${rupees(s.expected)} promised (finished claims)`} color="info" />
            </Box>
            <Box sx={{ overflowX: "auto" }}>
                <SegmentedControl value={view} onChange={setView} options={VIEWS} />
            </Box>
            <Panel title={`Spend by ${VIEWS.find((v) => v.value === view).label.toLowerCase()}`} subtitle="Paid amounts and how the claims turned out">
                {rows.length ? (
                    <Stack divider={<Divider />}>
                        {rows.map((r) => (
                            <Stack key={r.id} direction="row" sx={{ py: 1.25, gap: 1, alignItems: "center" }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2">{view === "byDoctor" ? `Dr. ${r.name}` : r.name}</Typography>
                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {r.requests} paid · {r.onTrack} on track · {r.partly} partly · {r.failed} failed · {r.inProgress} running
                                        {r.score ? ` · score ${scoreText(r.score)}` : ""}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: "right" }}>
                                    <Typography variant="subtitle2">{rupees(r.paid)}</Typography>
                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {rupees(r.actual)} of {rupees(r.expected)}
                                    </Typography>
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={PaymentsRounded} title="No spend paid yet" />
                )}
            </Panel>
        </Stack>
    );
}

export default ReportsTab;
