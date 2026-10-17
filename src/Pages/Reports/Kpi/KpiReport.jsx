import { Box, Typography } from "@mui/material";
import { EmojiEventsRounded, FlagRounded, GpsFixedRounded, TrackChangesRounded } from "@mui/icons-material";

import Tag from "../../../components/Tag/Tag";
import ReportPage from "../components/ReportPage";
import { formatAmount, formatPercent, getKpiReport, ragColor } from "../index";

const rag = (field, format = formatPercent) => (row, thresholds) =>
    row[field] == null ? "—" : <Tag label={format(row[field])} color={ragColor(row[field], thresholds[field])} />;

const columns = (thresholds) => [
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
    { key: "designation", label: "Designation", csvOnly: true, csv: (row) => row.DesignationName },
    { key: "manager", label: "Manager", csvOnly: true, csv: (row) => row.ManagerName },
    {
        key: "score",
        label: "Score",
        align: "right",
        csv: (row) => row.score ?? "",
        render: (row) => (row.score == null ? "—" : <Tag label={`${row.score}`} color={ragColor(row.score, { good: 80, fair: 60 })} />),
    },
    { key: "calls", label: "Calls", align: "right", csv: (row) => row.calls },
    { key: "callAverage", label: "Calls / day", align: "right", csv: (row) => row.callAverage ?? "", render: (row) => rag("callAverage", (value) => value)(row, thresholds) },
    { key: "coverage", label: "Coverage", align: "right", csv: (row) => row.coveragePercent ?? "", render: (row) => rag("coveragePercent")(row, thresholds) },
    { key: "gps", label: "GPS", align: "right", csv: (row) => row.gpsPercent ?? "", render: (row) => rag("gpsPercent")(row, thresholds) },
    { key: "inPlan", label: "In plan", align: "right", csv: (row) => row.inPlanPercent ?? "", render: (row) => rag("inPlanPercent")(row, thresholds) },
    { key: "dcr", label: "DCR approved", align: "right", csv: (row) => row.dcrPercent ?? "", render: (row) => rag("dcrPercent")(row, thresholds) },
    { key: "pob", label: "POB booked", align: "right", csv: (row) => row.pobValue, render: (row) => formatAmount(row.pobValue) },
    { key: "secondary", label: "Secondary", align: "right", csv: (row) => row.secondaryValue, render: (row) => formatAmount(row.secondaryValue) },
    { key: "achievement", label: "Target", align: "right", csv: (row) => row.achievement ?? "", render: (row) => rag("achievement")(row, thresholds) },
];

// Per-employee scorecard. Score = average of coverage, GPS, in-plan, DCR approval and target achievement (those with data).
function KpiReport() {
    return (
        <ReportPage
            title="KPI report"
            subtitle="A scorecard per employee: green, amber or red against the target for each KPI, and an overall score out of 100."
            load={getKpiReport}
            kpis={({ kpis }) => [
                { icon: EmojiEventsRounded, label: "Average score", value: kpis.score ?? "—", caption: `${kpis.employees} employee(s)`, color: "primary", progress: kpis.score ?? undefined },
                { icon: TrackChangesRounded, label: "Avg coverage", value: formatPercent(kpis.coveragePercent), caption: "Doctors visited vs assigned", color: "success" },
                { icon: GpsFixedRounded, label: "Avg GPS", value: formatPercent(kpis.gpsPercent), caption: "Calls with GPS captured", color: "info" },
                { icon: FlagRounded, label: "Avg target achievement", value: formatPercent(kpis.achievement), caption: "Secondary sales vs target", color: "warning" },
            ]}
            note={({ thresholds }) =>
                `Green at or above: calls/day ${thresholds.callAverage.good}, coverage ${thresholds.coveragePercent.good}%, GPS ${thresholds.gpsPercent.good}%, in plan ${thresholds.inPlanPercent.good}%, DCR approved ${thresholds.dcrPercent.good}%, target ${thresholds.achievement.good}%. Score: green at 80+, amber at 60+.`
            }
            tabs={(data) => [
                { value: "employees", label: "Scorecard", title: "Scorecard", subtitle: `${data.employees.length} employee(s), best score first`, columns: columns(data.thresholds), rows: data.employees, rowKey: (row) => row.UserId, fileName: "kpi-scorecard" },
            ]}
        />
    );
}

export default KpiReport;
