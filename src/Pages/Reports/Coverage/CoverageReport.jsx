import { Typography } from "@mui/material";
import { DoNotDisturbOnRounded, MedicalServicesRounded, TaskAltRounded, TrackChangesRounded } from "@mui/icons-material";

import Panel from "../../../components/Panel/Panel";
import HBarList from "../components/HBarList";
import ReportPage from "../components/ReportPage";
import { DOCTOR_COLUMNS } from "../components/doctorColumns";
import { CATEGORY_LABEL, formatPercent, getCoverageReport } from "../index";

const SUMMARY_COLUMNS = [
    { key: "assignments", label: "Doctors", align: "right", csv: (row) => row.assignments },
    { key: "visited", label: "Visited", align: "right", csv: (row) => row.visited },
    { key: "notVisited", label: "Not visited", align: "right", csv: (row) => row.notVisited },
    { key: "belowNorm", label: "Below norm", align: "right", csv: (row) => row.belowNorm },
    { key: "visits", label: "Visits", align: "right", csv: (row) => row.visits },
    { key: "coverage", label: "Coverage", align: "right", csv: (row) => row.coveragePercent ?? "", render: (row) => formatPercent(row.coveragePercent) },
    { key: "compliance", label: "Frequency met", align: "right", csv: (row) => row.compliancePercent ?? "", render: (row) => formatPercent(row.compliancePercent) },
];

const EMPLOYEE_COLUMNS = [{ key: "name", label: "Employee", csv: (row) => row.Name, render: (row) => <Typography variant="subtitle2">{row.Name}</Typography> }, ...SUMMARY_COLUMNS];

const CATEGORY_COLUMNS = [
    { key: "category", label: "Category", csv: (row) => CATEGORY_LABEL[row.category], render: (row) => CATEGORY_LABEL[row.category] },
    ...SUMMARY_COLUMNS,
];


// Doctors visited vs assigned, and whether each doctor got the visits their category norm asks for.
function CoverageReport() {
    return (
        <ReportPage
            title="Coverage report"
            subtitle="Assigned doctors visited in the period, and visit frequency against each doctor's monthly norm."
            load={getCoverageReport}
            kpis={({ kpis }) => [
                { icon: MedicalServicesRounded, label: "Doctor assignments", value: kpis.assignments, caption: `${kpis.visits} visit(s) in the period`, color: "primary" },
                { icon: TrackChangesRounded, label: "Coverage", value: formatPercent(kpis.coveragePercent), caption: `${kpis.visited} of ${kpis.assignments} visited`, color: "success", progress: kpis.coveragePercent ?? undefined },
                { icon: TaskAltRounded, label: "Frequency met", value: formatPercent(kpis.compliancePercent), caption: `${kpis.met} met · ${kpis.belowNorm} below norm`, color: "info", progress: kpis.compliancePercent ?? undefined },
                { icon: DoNotDisturbOnRounded, label: "Not visited", value: kpis.notVisited, caption: "Doctors with no call", color: kpis.notVisited ? "error" : "warning" },
            ]}
            charts={({ byCategory }) => (
                <Panel title="Coverage by category" subtitle="Share of doctors visited in each class">
                    <HBarList
                        rows={byCategory.map((row) => ({
                            key: row.category,
                            label: CATEGORY_LABEL[row.category],
                            value: row.coveragePercent ?? 0,
                            display: formatPercent(row.coveragePercent),
                            caption: `${row.visited}/${row.assignments} visited · frequency met ${formatPercent(row.compliancePercent)}`,
                        }))}
                        empty="No doctors assigned in this scope."
                    />
                </Panel>
            )}
            note={(data) => (data.truncated ? `More than ${data.rowLimit} doctor assignments match; showing the first ${data.rowLimit}. Narrow the filters to see all.` : null)}
            tabs={(data) => [
                { value: "employees", label: "By employee", title: "By employee", subtitle: `${data.employees.length} employee(s)`, columns: EMPLOYEE_COLUMNS, rows: data.employees, rowKey: (row) => row.UserId, fileName: "coverage-by-employee" },
                { value: "category", label: "By category", title: "By category", subtitle: "Doctor class A / B / C", columns: CATEGORY_COLUMNS, rows: data.byCategory, rowKey: (row) => row.category, fileName: "coverage-by-category" },
                { value: "doctors", label: "Doctors", title: "Doctor details", subtitle: `${data.rows.length} assignment(s) · required visits = monthly norm × ${data.days} days / 30`, columns: DOCTOR_COLUMNS, rows: data.rows, rowKey: (row) => `${row.UserId}-${row.DoctorId}`, fileName: "coverage-doctors" },
            ]}
        />
    );
}

export default CoverageReport;
