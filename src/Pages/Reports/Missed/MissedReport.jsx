import { Typography } from "@mui/material";
import { EventBusyRounded, PersonOffRounded, TrendingDownRounded, WorkOffRounded } from "@mui/icons-material";

import Tag from "../../../components/Tag/Tag";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import { DOCTOR_COLUMNS } from "../components/doctorColumns";
import ReportPage from "../components/ReportPage";
import { formatDate, getMissedReport } from "../index";

const DOCTOR_MISSED_COLUMNS = [
    ...DOCTOR_COLUMNS,
    { key: "shortBy", label: "Short by", align: "right", csv: (row) => row.shortBy, render: (row) => row.shortBy || "—" },
    {
        key: "daysSince",
        label: "Days since visit",
        align: "right",
        csv: (row) => row.daysSince ?? "Never",
        render: (row) => (row.daysSince == null ? <Tag label="Never visited" color="error" /> : row.daysSince),
    },
];

const PLAN_COLUMNS = [
    { key: "date", label: "Planned for", csv: (row) => row.PlanDate, render: (row) => formatDate(row.PlanDate) },
    { key: "employee", label: "Employee", csv: (row) => row.EmployeeName },
    { key: "doctor", label: "Doctor", csv: (row) => row.DoctorName, render: (row) => <Typography variant="subtitle2">Dr. {row.DoctorName}</Typography> },
    { key: "category", label: "Category", csv: (row) => row.Category || "", render: (row) => (row.Category ? <CategoryBadge category={row.Category} /> : "—") },
    { key: "territory", label: "Territory", csv: (row) => row.TerritoryName, render: (row) => row.TerritoryName || "—" },
    { key: "objective", label: "Objective", csv: (row) => row.Objective, render: (row) => row.Objective || "—" },
];

const DAY_COLUMNS = [
    { key: "date", label: "Date", csv: (row) => row.PlanDate, render: (row) => formatDate(row.PlanDate) },
    { key: "employee", label: "Employee", csv: (row) => row.EmployeeName },
    { key: "territory", label: "Planned territory / area", csv: (row) => [row.TerritoryName, row.AreaName].filter(Boolean).join(" / "), render: (row) => [row.TerritoryName, row.AreaName].filter(Boolean).join(" · ") || "—" },
];

const EMPLOYEE_COLUMNS = [
    { key: "name", label: "Employee", csv: (row) => row.Name, render: (row) => <Typography variant="subtitle2">{row.Name}</Typography> },
    { key: "notVisited", label: "Doctors not visited", align: "right", csv: (row) => row.notVisited },
    { key: "belowNorm", label: "Below norm", align: "right", csv: (row) => row.belowNorm },
    { key: "missedCalls", label: "Missed planned calls", align: "right", csv: (row) => row.missedCalls },
    { key: "missedDays", label: "Field days without calls", align: "right", csv: (row) => row.missedDays },
];

// What didn't happen: doctors not seen (or seen less than their norm), planned calls not made, and planned field days with no calls.
function MissedReport() {
    return (
        <ReportPage
            title="Missed visits"
            subtitle="Doctors not visited or below their visit norm, pre-call plans not made, and tour-plan working days with no calls."
            load={getMissedReport}
            kpis={({ kpis }) => [
                { icon: PersonOffRounded, label: "Doctors not visited", value: kpis.notVisited, caption: `of ${kpis.assignments} assignments`, color: "error" },
                { icon: TrendingDownRounded, label: "Below visit norm", value: kpis.belowNorm, caption: "Visited, but not often enough", color: "warning" },
                { icon: EventBusyRounded, label: "Missed planned calls", value: kpis.missedCalls, caption: "Pre-call plans not visited", color: "info" },
                { icon: WorkOffRounded, label: "Field days without calls", value: kpis.missedDays, caption: "Working days on the tour plan", color: "secondary" },
            ]}
            note={(data) => (data.truncated ? `Some lists have more than ${data.rowLimit} rows; showing the first ${data.rowLimit}.` : null)}
            tabs={(data) => [
                data.employees.length > 1 && { value: "employees", label: "By employee", title: "By employee", subtitle: `${data.employees.length} employee(s) with misses`, columns: EMPLOYEE_COLUMNS, rows: data.employees, rowKey: (row) => row.Name, fileName: "missed-by-employee", empty: "Nothing missed in this period." },
                { value: "doctors", label: "Doctors", title: "Doctors not visited / below norm", subtitle: `${data.doctors.length} doctor assignment(s), longest gap first`, columns: DOCTOR_MISSED_COLUMNS, rows: data.doctors, rowKey: (row) => `${row.UserId}-${row.DoctorId}`, fileName: "missed-doctors", empty: "Every assigned doctor got their visits." },
                { value: "calls", label: "Planned calls", title: "Missed planned calls", subtitle: `${data.plannedCalls.length} call(s) planned but not visited`, columns: PLAN_COLUMNS, rows: data.plannedCalls, rowKey: (row) => row.PreCallId, fileName: "missed-planned-calls", empty: "No missed planned calls." },
                { value: "days", label: "Field days", title: "Field days without calls", subtitle: `${data.missedDays.length} working day(s) with no visit`, columns: DAY_COLUMNS, rows: data.missedDays, rowKey: (row) => `${row.EmployeeName}-${row.PlanDate}`, fileName: "missed-field-days", empty: "Every planned working day has calls." },
            ]}
        />
    );
}

export default MissedReport;
