import { Box, Typography } from "@mui/material";
import { CurrencyRupeeRounded, GroupsRounded, LocationOnRounded, TrendingDownRounded } from "@mui/icons-material";

import Panel from "../../../components/Panel/Panel";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import ReportTable from "../../Reports/components/ReportTable";
import Findings from "../components/Findings";
import { InsightsLayout } from "../components/InsightsLayout";
import useInsight from "../components/useInsight";
import { formatAmount, formatDate, formatMoneyCompact, formatPercent, getPerformance, trend } from "../index";

const Trend = ({ value, suffix }) => {
    const t = trend(value, suffix);
    return t ? <Tag label={t.text} color={t.color} /> : <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.disabled })}>—</Typography>;
};

const COLUMNS = [
    {
        key: "name",
        label: "Employee",
        csv: (row) => row.Name,
        render: (row) => (
            <Box>
                <Typography variant="subtitle2">{row.Name}</Typography>
                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {[row.DesignationName, row.ManagerName ? `reports to ${row.ManagerName}` : null].filter(Boolean).join(" · ") || "—"}
                </Typography>
            </Box>
        ),
    },
    { key: "calls", label: "Calls", align: "right", csv: (row) => row.calls, render: (row) => `${row.calls} (${row.prevCalls})` },
    { key: "callsChange", label: "Calls trend", align: "right", csv: (row) => row.callsChange ?? "", render: (row) => <Trend value={row.callsChange} /> },
    { key: "coverage", label: "Coverage", align: "right", csv: (row) => row.coverage ?? "", render: (row) => formatPercent(row.coverage) },
    { key: "coverageChange", label: "Coverage trend", align: "right", csv: (row) => row.coverageChange ?? "", render: (row) => <Trend value={row.coverageChange} suffix=" pts" /> },
    { key: "gps", label: "GPS", align: "right", csv: (row) => row.gps ?? "", render: (row) => formatPercent(row.gps) },
    { key: "callAverage", label: "Calls / day", align: "right", csv: (row) => row.callAverage ?? "", render: (row) => row.callAverage ?? "—" },
    { key: "missedDcrs", label: "DCRs late", align: "right", csv: (row) => row.missedDcrs, render: (row) => (row.missedDcrs ? <Tag label={`${row.missedDcrs}`} color="error" /> : "0") },
    { key: "pob", label: "POB", align: "right", csv: (row) => row.pob, render: (row) => formatAmount(row.pob) },
    { key: "pobChange", label: "POB trend", align: "right", csv: (row) => row.pobChange ?? "", render: (row) => <Trend value={row.pobChange} /> },
    { key: "lastVisit", label: "Last visit", csv: (row) => row.lastVisit || "", render: (row) => (row.lastVisit ? formatDate(row.lastVisit) : "Never") },
];

// Each rep this month so far vs the same days last month, with findings in plain English.
function PerformanceInsights() {
    const state = useInsight(getPerformance);

    return (
        <InsightsLayout title="Performance insights" subtitle="This month so far compared with the same days last month, for you and your team." state={state}>
            {(data) => {
                const declining = data.employees.filter((row) => row.callsChange != null && row.callsChange < 0).length;

                return (
                    <>
                        <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                            <StatCard icon={LocationOnRounded} label="Calls this month" value={data.totals.calls} caption={`${data.totals.prevCalls} by this day last month${trend(data.totals.callsChange) ? ` · ${trend(data.totals.callsChange).text}` : ""}`} color="primary" />
                            <StatCard icon={CurrencyRupeeRounded} label="POB this month" value={formatMoneyCompact(data.totals.pob)} caption={`${formatMoneyCompact(data.totals.prevPob)} last month${trend(data.totals.pobChange) ? ` · ${trend(data.totals.pobChange).text}` : ""}`} color="success" />
                            <StatCard icon={GroupsRounded} label="People" value={data.employees.length} caption="In view" color="info" />
                            <StatCard icon={TrendingDownRounded} label="Calls declining" value={declining} caption="Fewer calls than last month" color={declining ? "error" : "warning"} />
                        </Box>

                        <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: `${theme.spacing(theme.dashboard.sideColumnWidth)} minmax(0, 1fr)` }, gap: theme.stat.gap, alignItems: "start" })}>
                            <Findings subtitle={`${formatDate(data.period.from)} – ${formatDate(data.period.to)}`} items={data.findings} />

                            <Panel title="By employee" subtitle="Biggest drop in calls first · (last month in brackets)" disablePadding>
                                <ReportTable columns={COLUMNS} rows={data.employees} rowKey={(row) => row.UserId} />
                            </Panel>
                        </Box>
                    </>
                );
            }}
        </InsightsLayout>
    );
}

export default PerformanceInsights;
