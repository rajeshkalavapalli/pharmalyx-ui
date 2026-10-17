import { Box, Divider, Stack, Typography } from "@mui/material";
import { AssignmentTurnedInRounded, CurrencyRupeeRounded, LocationOnRounded, ReceiptLongRounded } from "@mui/icons-material";

import Panel from "../../../components/Panel/Panel";
import ReportPage from "../components/ReportPage";
import { formatAmount, formatMoneyCompact, formatMonth, formatPercent, getMisReport } from "../index";

const show = (value, format = (item) => item) => (value == null ? "—" : format(value));

function Section({ title, rows }) {
    return (
        <Panel title={title} sx={{ height: "100%" }}>
            <Stack divider={<Divider />}>
                {rows.map(([label, value]) => (
                    <Stack key={label} direction="row" sx={{ py: 1, justifyContent: "space-between", gap: 2 }}>
                        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            {label}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {value}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Panel>
    );
}

const MONTH_COLUMNS = [
    { key: "month", label: "Month", csv: (row) => row.month, render: (row) => <Typography variant="subtitle2">{formatMonth(row.month)}</Typography> },
    { key: "calls", label: "Calls", align: "right", csv: (row) => row.calls },
    { key: "doctors", label: "Doctors met", align: "right", csv: (row) => row.doctors },
    { key: "fieldDays", label: "Field days", align: "right", csv: (row) => row.fieldDays },
    { key: "pob", label: "POB booked", align: "right", csv: (row) => row.pobValue, render: (row) => formatAmount(row.pobValue) },
    { key: "pobSupplied", label: "POB supplied", align: "right", csv: (row) => row.pobSupplied, render: (row) => formatAmount(row.pobSupplied) },
    { key: "secondary", label: "Secondary", align: "right", csv: (row) => row.secondaryValue, render: (row) => formatAmount(row.secondaryValue) },
    { key: "target", label: "Target", align: "right", csv: (row) => row.targetValue, render: (row) => (row.targetValue ? formatAmount(row.targetValue) : "—") },
    { key: "achievement", label: "Achievement", align: "right", csv: (row) => row.achievement ?? "", render: (row) => formatPercent(row.achievement) },
    { key: "claimed", label: "Expenses claimed", align: "right", csv: (row) => row.expenseClaimed, render: (row) => formatAmount(row.expenseClaimed) },
    { key: "approved", label: "Expenses approved", align: "right", csv: (row) => row.expenseApproved, render: (row) => formatAmount(row.expenseApproved) },
];

const EMPLOYEE_COLUMNS = [
    { key: "name", label: "Employee", csv: (row) => row.Name, render: (row) => <Typography variant="subtitle2">{row.Name}</Typography> },
    { key: "designation", label: "Designation", csv: (row) => row.DesignationName, render: (row) => row.DesignationName || "—" },
    { key: "calls", label: "Calls", align: "right", csv: (row) => row.calls },
    { key: "fieldDays", label: "Field days", align: "right", csv: (row) => row.fieldDays },
    { key: "callAverage", label: "Calls / day", align: "right", csv: (row) => row.callAverage ?? "", render: (row) => show(row.callAverage) },
    { key: "coverage", label: "Coverage", align: "right", csv: (row) => row.coveragePercent ?? "", render: (row) => formatPercent(row.coveragePercent) },
    { key: "gps", label: "GPS", align: "right", csv: (row) => row.gpsPercent ?? "", render: (row) => formatPercent(row.gpsPercent) },
    { key: "pob", label: "POB booked", align: "right", csv: (row) => row.pobValue, render: (row) => formatAmount(row.pobValue) },
    { key: "secondary", label: "Secondary", align: "right", csv: (row) => row.secondaryValue, render: (row) => formatAmount(row.secondaryValue) },
    { key: "achievement", label: "Target", align: "right", csv: (row) => row.achievement ?? "", render: (row) => formatPercent(row.achievement) },
];

// Management summary for the period: field work, quality, engagement, business and expenses, month by month.
function MisReport() {
    return (
        <ReportPage
            title="MIS report"
            subtitle="One management summary for the period: field work, call quality, doctor engagement, business and expenses."
            load={getMisReport}
            kpis={({ summary }) => [
                { icon: LocationOnRounded, label: "Calls", value: summary.field.calls, caption: `${summary.field.fieldDays} field day(s) · ${show(summary.field.callAverage)} per day`, color: "primary" },
                { icon: AssignmentTurnedInRounded, label: "Coverage", value: formatPercent(summary.field.coveragePercent), caption: `GPS ${formatPercent(summary.quality.gpsPercent)} · in plan ${formatPercent(summary.quality.inPlanPercent)}`, color: "success", progress: summary.field.coveragePercent ?? undefined },
                { icon: CurrencyRupeeRounded, label: "Secondary sales", value: formatMoneyCompact(summary.business.secondaryValue), caption: `${formatPercent(summary.business.achievement)} of target · POB ${formatMoneyCompact(summary.business.pobValue)}`, color: "info" },
                { icon: ReceiptLongRounded, label: "Expenses claimed", value: formatMoneyCompact(summary.expenses.claimed), caption: `${formatMoneyCompact(summary.expenses.approved)} approved`, color: "warning" },
            ]}
            charts={({ summary }) => (
                <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                    <Section
                        title="Field work"
                        rows={[
                            ["Calls", summary.field.calls],
                            ["Doctors met", summary.field.doctorsMet],
                            ["Field days", summary.field.fieldDays],
                            ["Calls per day", show(summary.field.callAverage)],
                            ["Coverage", formatPercent(summary.field.coveragePercent)],
                            ["Visit frequency met", formatPercent(summary.field.compliancePercent)],
                        ]}
                    />
                    <Section
                        title="Call quality"
                        rows={[
                            ["Calls with GPS", formatPercent(summary.quality.gpsPercent)],
                            ["Calls as per tour plan", formatPercent(summary.quality.inPlanPercent)],
                            ["Joint calls", summary.quality.jointCalls],
                            ["Average call", summary.quality.avgMinutes == null ? "—" : `${summary.quality.avgMinutes} min`],
                        ]}
                    />
                    <Section
                        title="Doctor engagement"
                        rows={[
                            ["Samples given", show(summary.engagement.samplesGiven)],
                            ["Gifts given", show(summary.engagement.giftsGiven)],
                            ["RCPA audits", show(summary.engagement.rcpaAudits)],
                        ]}
                    />
                    <Section
                        title="Business"
                        rows={[
                            ["POB booked", formatAmount(summary.business.pobValue)],
                            ["POB supplied", formatAmount(summary.business.pobSupplied)],
                            ["Orders", summary.business.pobOrders],
                            ["Secondary sales", formatAmount(summary.business.secondaryValue)],
                            ["Target", summary.business.targetValue ? formatAmount(summary.business.targetValue) : "—"],
                            ["Achievement", formatPercent(summary.business.achievement)],
                        ]}
                    />
                </Box>
            )}
            tabs={(data) => [
                { value: "months", label: "Month by month", title: "Month by month", subtitle: `${data.months.length} month(s)`, columns: MONTH_COLUMNS, rows: data.months, rowKey: (row) => row.month, fileName: "mis-by-month" },
                data.employees.length > 1 && { value: "employees", label: "By employee", title: "By employee", subtitle: `${data.employees.length} employee(s)`, columns: EMPLOYEE_COLUMNS, rows: data.employees, rowKey: (row) => row.UserId, fileName: "mis-by-employee" },
            ]}
        />
    );
}

export default MisReport;
