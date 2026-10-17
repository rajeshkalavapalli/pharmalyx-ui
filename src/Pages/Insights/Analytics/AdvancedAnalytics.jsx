import { useState } from "react";

import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { CurrencyRupeeRounded, FlagRounded, LocationOnRounded, PieChartRounded } from "@mui/icons-material";

import Panel from "../../../components/Panel/Panel";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import GroupedBars from "../../Reports/components/GroupedBars";
import ReportTable from "../../Reports/components/ReportTable";
import { InsightsLayout } from "../components/InsightsLayout";
import useInsight from "../components/useInsight";
import { SEGMENT_COLOR, formatAmount, formatMoneyCompact, formatMonth, formatPercent, getAnalytics, trend } from "../index";

const DOCTOR_COLUMNS = (segments) => [
    {
        key: "doctor",
        label: "Doctor",
        csv: (row) => row.DoctorName,
        render: (row) => (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="subtitle2">Dr. {row.DoctorName}</Typography>
                {row.Category && <CategoryBadge category={row.Category} />}
            </Stack>
        ),
    },
    { key: "speciality", label: "Speciality", csv: (row) => row.Speciality, render: (row) => row.Speciality || "—" },
    { key: "territory", label: "Territory", csv: (row) => row.TerritoryName, render: (row) => row.TerritoryName || "—" },
    { key: "visits", label: "Visits (90d)", align: "right", csv: (row) => row.visits },
    { key: "share", label: "Rx share", align: "right", csv: (row) => row.share ?? "", render: (row) => (row.share == null ? "—" : formatPercent(row.share)) },
    { key: "pob", label: "POB (90d)", align: "right", csv: (row) => row.pob, render: (row) => formatAmount(row.pob) },
    { key: "segment", label: "Segment", csv: (row) => segments[row.segment].label, render: (row) => <Tag label={segments[row.segment].label} color={SEGMENT_COLOR[row.segment]} /> },
];

const SERIES_COLUMNS = [
    { key: "month", label: "Month", csv: (row) => row.month, render: (row) => <Typography variant="subtitle2">{formatMonth(row.month)}</Typography> },
    { key: "calls", label: "Calls", align: "right", csv: (row) => row.calls },
    { key: "callsGrowth", label: "Calls MoM", align: "right", csv: (row) => row.callsGrowth ?? "", render: (row) => trend(row.callsGrowth)?.text || "—" },
    { key: "pob", label: "POB", align: "right", csv: (row) => row.pob, render: (row) => formatAmount(row.pob) },
    { key: "pobGrowth", label: "POB MoM", align: "right", csv: (row) => row.pobGrowth ?? "", render: (row) => trend(row.pobGrowth)?.text || "—" },
    { key: "secondary", label: "Secondary", align: "right", csv: (row) => row.secondary, render: (row) => formatAmount(row.secondary) },
    { key: "target", label: "Target", align: "right", csv: (row) => row.target, render: (row) => (row.target ? formatAmount(row.target) : "—") },
];

// Doctor segmentation (effort vs Rx share), Pareto of POB, month-end forecast and 6-month growth.
function AdvancedAnalytics() {
    const state = useInsight(getAnalytics);
    const [segment, setSegment] = useState("ALL");

    return (
        <InsightsLayout title="Advanced analytics" subtitle="Where to focus: doctor segments by visits and Rx share, how concentrated the business is, and where the month will land." state={state}>
            {(data) => {
                const segments = Object.fromEntries(data.segments.map((row) => [row.key, row]));
                const doctors = data.doctors.filter((row) => segment === "ALL" || row.segment === segment);
                const f = data.forecast;

                return (
                    <>
                        <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                            <StatCard icon={LocationOnRounded} label="Calls forecast" value={f.callsProjected} caption={`${f.callsSoFar} so far · day ${f.dayOfMonth} of ${f.daysInMonth}`} color="primary" progress={Math.round((f.dayOfMonth / f.daysInMonth) * 100)} />
                            <StatCard icon={CurrencyRupeeRounded} label="POB forecast" value={formatMoneyCompact(f.pobProjected)} caption={`${formatMoneyCompact(f.pobSoFar)} booked so far (run rate)`} color="success" />
                            <StatCard icon={FlagRounded} label="Secondary expected" value={f.secondaryExpected == null ? "—" : formatMoneyCompact(f.secondaryExpected)} caption={f.target ? `Target ${formatMoneyCompact(f.target)} · gap ${formatMoneyCompact(f.targetGap)}` : "Average of recent months · no target set"} color="info" />
                            <StatCard icon={PieChartRounded} label="Top 20% of doctors" value={formatPercent(data.pareto.topShare)} caption={data.pareto.orderingDoctors ? `of POB from ${data.pareto.topCount} of ${data.pareto.orderingDoctors} ordering doctors` : "No doctor POB in 90 days"} color="warning" />
                        </Box>

                        <Panel title="Doctor segments" subtitle={`Last 90 days · frequent = ${data.thresholds.frequentVisits}+ visits · strong share = ${data.thresholds.strongShare}%+ (RCPA). Click a segment to filter.`} sx={(theme) => ({ mb: theme.stat.gap })}>
                            <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))", xl: "repeat(5, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                                {data.segments.map((row) => {
                                    const selected = segment === row.key;
                                    const color = SEGMENT_COLOR[row.key];

                                    return (
                                        <ButtonBase
                                            key={row.key}
                                            onClick={() => setSegment(selected ? "ALL" : row.key)}
                                            sx={(theme) => ({
                                                p: 1.75,
                                                display: "block",
                                                textAlign: "left",
                                                borderRadius: theme.calendar.cell.radius,
                                                border: "1px solid",
                                                borderColor: selected ? theme.palette[color].main : theme.palette.border.subtle,
                                                backgroundColor: selected ? alpha(theme.palette[color].main, theme.tint.selected) : "transparent",
                                                transition: theme.calendar.transition,
                                                "&:hover": { borderColor: alpha(theme.palette[color].main, theme.tint.strong) },
                                            })}
                                        >
                                            <Tag label={row.label} color={color} />
                                            <Typography variant="metric" component="p" sx={{ mt: 1 }}>
                                                {row.doctors}
                                            </Typography>
                                            <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                {row.advice}
                                            </Typography>
                                            {row.pob > 0 && (
                                                <Typography variant="caption" component="p" sx={{ mt: 0.5, fontWeight: 600 }}>
                                                    POB {formatMoneyCompact(row.pob)}
                                                </Typography>
                                            )}
                                        </ButtonBase>
                                    );
                                })}
                            </Box>
                        </Panel>

                        <Panel title={segment === "ALL" ? "All assigned doctors" : segments[segment].label} subtitle={`${doctors.length} doctor(s), highest POB first`} sx={(theme) => ({ mb: theme.stat.gap })} disablePadding>
                            <ReportTable columns={DOCTOR_COLUMNS(segments)} rows={doctors} rowKey={(row) => row.DoctorId} empty="No doctors in this segment." />
                        </Panel>

                        <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" }, gap: theme.stat.gap, alignItems: "start" })}>
                            <Panel title="Six-month trend" subtitle="POB booked vs secondary sales">
                                <GroupedBars
                                    ariaLabel="POB and secondary sales per month, last six months"
                                    format={formatMoneyCompact}
                                    series={[
                                        { key: "pob", label: "POB", color: (theme) => theme.palette.chart.ours },
                                        { key: "secondary", label: "Secondary", color: (theme) => theme.palette.chart.competitor },
                                    ]}
                                    rows={data.series.map((row) => ({ key: row.month, label: formatMonth(row.month), pob: row.pob, secondary: row.secondary }))}
                                />
                            </Panel>
                            <Panel title="Month on month" subtitle="Growth vs the previous month" disablePadding>
                                <ReportTable columns={SERIES_COLUMNS} rows={data.series} rowKey={(row) => row.month} />
                            </Panel>
                        </Box>
                    </>
                );
            }}
        </InsightsLayout>
    );
}

export default AdvancedAnalytics;
