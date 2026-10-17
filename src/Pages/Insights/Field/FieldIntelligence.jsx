import { Box, Stack, Typography } from "@mui/material";
import { GroupsRounded, LocationOnRounded, MedicalServicesRounded, SentimentSatisfiedAltRounded } from "@mui/icons-material";

import Panel from "../../../components/Panel/Panel";
import StatCard from "../../../components/StatCard/StatCard";
import BarChart from "../../../screen/dashboard/BarChart";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import HBarList from "../../Reports/components/HBarList";
import ReportTable from "../../Reports/components/ReportTable";
import Findings from "../components/Findings";
import { InsightsLayout } from "../components/InsightsLayout";
import useInsight from "../components/useInsight";
import { formatAmount, formatDate, formatPercent, getFieldIntel } from "../index";

const TERRITORY_COLUMNS = [
    { key: "territory", label: "Territory", csv: (row) => row.territory, render: (row) => <Typography variant="subtitle2">{row.territory}</Typography> },
    { key: "calls", label: "Calls", align: "right", csv: (row) => row.calls },
    { key: "doctors", label: "Doctors", align: "right", csv: (row) => row.doctors },
    { key: "positive", label: "Positive", align: "right", csv: (row) => row.positiveRate ?? "", render: (row) => formatPercent(row.positiveRate) },
    { key: "negative", label: "Negative calls", align: "right", csv: (row) => row.negative },
];

const EFFORT_COLUMNS = [
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
    { key: "territory", label: "Territory", csv: (row) => row.TerritoryName, render: (row) => row.TerritoryName || "—" },
    { key: "visits", label: "Visits", align: "right", csv: (row) => row.visits },
    { key: "share", label: "Rx share", align: "right", csv: (row) => row.share ?? "", render: (row) => (row.share == null ? "No RCPA" : formatPercent(row.share)) },
    { key: "pob", label: "POB", align: "right", csv: (row) => row.pob, render: (row) => formatAmount(row.pob) },
];

// Patterns in the last 90 days of calls: when calls work best, where, and where effort isn't paying back.
function FieldIntelligence() {
    const state = useInsight(getFieldIntel);

    return (
        <InsightsLayout title="Field intelligence" subtitle="Patterns from the last 90 days of calls: best days and times, territories, joint work and effort vs return." state={state}>
            {(data) => {
                const { joint, solo } = data.joint;

                return (
                    <>
                        <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                            <StatCard icon={LocationOnRounded} label="Calls (90 days)" value={data.totals.calls} caption={`${formatDate(data.period.from)} – ${formatDate(data.period.to)}`} color="primary" />
                            <StatCard icon={MedicalServicesRounded} label="Doctors met" value={data.totals.doctors} caption="Distinct doctors" color="info" />
                            <StatCard icon={SentimentSatisfiedAltRounded} label="Positive feedback" value={formatPercent(data.totals.positiveRate)} caption={`${data.totals.positive} positive · ${data.totals.negative} negative`} color="success" />
                            <StatCard icon={GroupsRounded} label="Joint calls" value={joint.calls} caption={`Positive ${formatPercent(joint.positiveRate)} vs solo ${formatPercent(solo.positiveRate)}`} color="warning" />
                        </Box>

                        <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(12, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                            <Box sx={{ gridColumn: { lg: "span 4" } }}>
                                <Findings title="What the data says" items={data.highlights} sx={{ height: "100%" }} />
                            </Box>
                            <Box sx={{ gridColumn: { lg: "span 4" } }}>
                                <Panel title="Calls by weekday" subtitle="Average per week" sx={{ height: "100%" }}>
                                    <BarChart
                                        unit="call"
                                        ariaLabel="Average calls per week by weekday"
                                        items={data.weekdays.map((row) => ({
                                            key: row.day,
                                            axisLabel: row.day,
                                            tooltipTitle: `${row.day} · positive ${formatPercent(row.positiveRate)}`,
                                            value: row.perWeek,
                                            detail: `${row.perWeek} a week · ${row.calls} in 90 days`,
                                        }))}
                                    />
                                </Panel>
                            </Box>
                            <Box sx={{ gridColumn: { lg: "span 4" } }}>
                                <Panel title="Time of day" subtitle="Calls and positive feedback" sx={{ height: "100%" }}>
                                    <HBarList
                                        rows={data.slots.map((row) => ({
                                            key: row.key,
                                            label: row.label,
                                            value: row.calls,
                                            display: `${row.calls} call(s)`,
                                            caption: `Positive ${formatPercent(row.positiveRate)}`,
                                        }))}
                                        empty="No calls in the last 90 days."
                                    />
                                </Panel>
                            </Box>
                        </Box>

                        <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap, alignItems: "start" })}>
                            <Panel title="Territory activity" subtitle="Calls, doctors and feedback per territory" disablePadding>
                                <ReportTable columns={TERRITORY_COLUMNS} rows={data.territories} rowKey={(row) => row.territory} empty="No calls in the last 90 days." />
                            </Panel>
                            <Panel title="Calls by speciality" subtitle="Top 10">
                                <HBarList
                                    rows={data.specialities.map((row) => ({ key: row.speciality, label: row.speciality, value: row.calls, display: `${row.calls}`, caption: `Positive ${formatPercent(row.positiveRate)}` }))}
                                    empty="No calls in the last 90 days."
                                />
                            </Panel>
                        </Box>

                        <Panel title="High effort, low return" subtitle="3+ visits in 90 days but Rx share under 30% (or no POB when there's no RCPA)" disablePadding>
                            <ReportTable columns={EFFORT_COLUMNS} rows={data.highEffort} rowKey={(row) => row.DoctorId} empty="No doctors match. Effort and return are lined up." />
                        </Panel>
                    </>
                );
            }}
        </InsightsLayout>
    );
}

export default FieldIntelligence;
