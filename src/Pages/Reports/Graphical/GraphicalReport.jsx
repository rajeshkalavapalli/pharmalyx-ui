import { Box, Typography } from "@mui/material";

import Panel from "../../../components/Panel/Panel";
import GroupedBars from "../components/GroupedBars";
import HBarList from "../components/HBarList";
import ReportPage from "../components/ReportPage";
import BarChart from "../../../screen/dashboard/BarChart";
import { CATEGORY_LABEL, FEEDBACK_LABEL, formatMoneyCompact, formatMonth, formatPercent, getGraphReport } from "../index";

const FEEDBACK_COLOR = { POSITIVE: "success", NEUTRAL: "info", NEGATIVE: "error", NONE: "secondary" };

const TOP_COLUMNS = [
    { key: "name", label: "Employee", csv: (row) => row.Name, render: (row) => <Typography variant="subtitle2">{row.Name}</Typography> },
    { key: "calls", label: "Calls", align: "right", csv: (row) => row.calls },
    { key: "pob", label: "POB booked", align: "right", csv: (row) => row.pobValue, render: (row) => formatMoneyCompact(row.pobValue) },
    { key: "secondary", label: "Secondary", align: "right", csv: (row) => row.secondaryValue, render: (row) => formatMoneyCompact(row.secondaryValue) },
];

const MONTH_COLUMNS = [
    { key: "month", label: "Month", csv: (row) => row.month, render: (row) => formatMonth(row.month) },
    { key: "calls", label: "Calls", align: "right", csv: (row) => row.calls },
    { key: "pob", label: "POB booked", align: "right", csv: (row) => row.pobValue, render: (row) => formatMoneyCompact(row.pobValue) },
    { key: "secondary", label: "Secondary", align: "right", csv: (row) => row.secondaryValue, render: (row) => formatMoneyCompact(row.secondaryValue) },
    { key: "target", label: "Target", align: "right", csv: (row) => row.targetValue, render: (row) => formatMoneyCompact(row.targetValue) },
];

// Chart view of the same period data as the MIS report.
function GraphicalReport() {
    return (
        <ReportPage
            title="Graphical reports"
            subtitle="Calls, coverage, doctor feedback and business for the period, as charts."
            load={getGraphReport}
            kpis={() => []}
            charts={(data) => {
                const feedbackTotal = data.feedback.reduce((sum, row) => sum + row.calls, 0);

                return (
                    <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                        <Panel title="Calls per month" subtitle={`${data.summary.field.calls} call(s) in the period`}>
                            <BarChart
                                unit="call"
                                ariaLabel="Calls per month"
                                items={data.months.map((row) => ({ key: row.month, axisLabel: formatMonth(row.month), tooltipTitle: formatMonth(row.month), value: row.calls }))}
                            />
                        </Panel>

                        <Panel title="POB vs secondary sales" subtitle="Per month">
                            <GroupedBars
                                ariaLabel="POB booked and secondary sales per month"
                                format={formatMoneyCompact}
                                series={[
                                    { key: "pobValue", label: "POB booked", color: (theme) => theme.palette.chart.ours },
                                    { key: "secondaryValue", label: "Secondary sales", color: (theme) => theme.palette.chart.competitor },
                                ]}
                                rows={data.months.map((row) => ({ key: row.month, label: formatMonth(row.month), pobValue: row.pobValue, secondaryValue: row.secondaryValue }))}
                            />
                        </Panel>

                        <Panel title="Coverage by doctor category" subtitle={`Overall ${formatPercent(data.summary.field.coveragePercent)}`}>
                            <HBarList
                                rows={data.coverageByCategory.map((row) => ({
                                    key: row.category,
                                    label: CATEGORY_LABEL[row.category],
                                    value: row.coveragePercent ?? 0,
                                    display: formatPercent(row.coveragePercent),
                                    caption: `${row.visited}/${row.assignments} doctors visited`,
                                }))}
                                empty="No doctors assigned in this scope."
                            />
                        </Panel>

                        <Panel title="Doctor feedback" subtitle={`${feedbackTotal} call(s)`}>
                            <HBarList
                                rows={data.feedback.map((row) => ({
                                    key: row.feedback,
                                    label: FEEDBACK_LABEL[row.feedback] || "Not recorded",
                                    value: row.calls,
                                    display: `${row.calls} · ${formatPercent(feedbackTotal ? Math.round((row.calls / feedbackTotal) * 100) : null)}`,
                                    color: FEEDBACK_COLOR[row.feedback] || "secondary",
                                }))}
                                empty="No calls in this period."
                            />
                        </Panel>

                        <Panel title="Top employees by calls" subtitle="Up to 10" sx={{ gridColumn: { lg: "span 2" } }}>
                            <HBarList
                                rows={data.topEmployees.map((row) => ({
                                    key: row.Name,
                                    label: row.Name,
                                    value: row.calls,
                                    display: `${row.calls} call(s)`,
                                    caption: `POB ${formatMoneyCompact(row.pobValue)} · secondary ${formatMoneyCompact(row.secondaryValue)}`,
                                }))}
                                empty="No calls in this period."
                            />
                        </Panel>
                    </Box>
                );
            }}
            tabs={(data) => [
                { value: "months", label: "Month data", title: "Chart data by month", subtitle: "The numbers behind the charts", columns: MONTH_COLUMNS, rows: data.months, rowKey: (row) => row.month, fileName: "graphical-months" },
                { value: "employees", label: "Top employees", title: "Top employees", subtitle: "By calls", columns: TOP_COLUMNS, rows: data.topEmployees, rowKey: (row) => row.Name, fileName: "graphical-top-employees" },
            ]}
        />
    );
}

export default GraphicalReport;
