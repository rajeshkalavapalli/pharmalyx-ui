import { useCallback, useEffect, useState } from "react";

import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import {
    AssignmentTurnedInRounded,
    CalendarMonthRounded,
    DownloadRounded,
    GpsFixedRounded,
    LocationOnRounded,
    RouteRounded,
} from "@mui/icons-material";

import LoadError from "../../../components/LoadError/LoadError";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import BarChart from "../../../screen/dashboard/BarChart";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import ReportFilters from "../components/ReportFilters";
import useReportOptions from "../components/useReportOptions";
import ReportTable from "../components/ReportTable";
import {
    FEEDBACK_LABEL,
    LOCATION_LABEL,
    PLAN_LABEL,
    defaultFilters,
    downloadCsv,
    errorMessage,
    formatDate,
    formatPercent,
    formatShortDate,
    getCallReport,
} from "../index";

const FEEDBACK_COLOR = { POSITIVE: "success", NEUTRAL: "info", NEGATIVE: "error" };
const PLAN_COLOR = { IN_PLAN: "success", OUT_OF_PLAN: "warning", NO_PLAN: "secondary" };

// =========================================================
// Columns: one definition drives both the table and the CSV
// =========================================================

const EMPLOYEE_COLUMNS = [
    { key: "name", label: "Employee", csv: (row) => row.Name, render: (row) => (
        <Box>
            <Typography variant="subtitle2">{row.Name}</Typography>
            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                {[row.DesignationName, row.ManagerName ? `reports to ${row.ManagerName}` : null].filter(Boolean).join(" · ") || "—"}
            </Typography>
        </Box>
    ) },
    { key: "designation", label: "Designation", csvOnly: true, csv: (row) => row.DesignationName },
    { key: "manager", label: "Manager", csvOnly: true, csv: (row) => row.ManagerName },
    { key: "calls", label: "Calls", align: "right", csv: (row) => row.calls },
    { key: "doctors", label: "Doctors met", align: "right", csv: (row) => row.doctors },
    { key: "fieldDays", label: "Field days", align: "right", csv: (row) => row.fieldDays },
    { key: "callAverage", label: "Calls / day", align: "right", csv: (row) => row.callAverage ?? "" , render: (row) => row.callAverage ?? "—" },
    { key: "gps", label: "GPS", align: "right", csv: (row) => row.gpsPercent ?? "", render: (row) => formatPercent(row.gpsPercent) },
    { key: "inPlan", label: "In plan", align: "right", csv: (row) => row.inPlanPercent ?? "", render: (row) => formatPercent(row.inPlanPercent) },
    { key: "avgMinutes", label: "Avg call (min)", align: "right", csv: (row) => row.avgMinutes ?? "", render: (row) => row.avgMinutes ?? "—" },
    { key: "dcr", label: "DCRs approved / pending / returned", csv: (row) => `${row.dcrApproved}/${row.dcrPending}/${row.dcrReturned}`, render: (row) => (
        <Stack direction="row" sx={{ gap: 0.5 }}>
            <Tag label={`${row.dcrApproved} approved`} color="success" />
            {row.dcrPending > 0 && <Tag label={`${row.dcrPending} pending`} color="submitted" />}
            {row.dcrReturned > 0 && <Tag label={`${row.dcrReturned} returned`} color="error" />}
        </Stack>
    ) },
];

const CALL_COLUMNS = [
    { key: "date", label: "Date", csv: (row) => row.VisitDate, render: (row) => formatDate(row.VisitDate) },
    { key: "time", label: "Time", csv: (row) => [row.StartTime, row.EndTime].filter(Boolean).join("-"), render: (row) => [row.StartTime, row.EndTime].filter(Boolean).join("–") || "—" },
    { key: "minutes", label: "Min", align: "right", csv: (row) => row.Minutes ?? "", render: (row) => row.Minutes ?? "—" },
    { key: "employee", label: "Employee", csv: (row) => row.EmployeeName, render: (row) => row.EmployeeName },
    { key: "doctor", label: "Doctor", csv: (row) => row.DoctorName, render: (row) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box>
                <Typography variant="subtitle2">Dr. {row.DoctorName}</Typography>
                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {[row.Speciality, row.HospitalName].filter(Boolean).join(" · ") || "—"}
                </Typography>
            </Box>
            {row.Category && <CategoryBadge category={row.Category} />}
        </Stack>
    ) },
    { key: "category", label: "Category", csvOnly: true, csv: (row) => row.Category },
    { key: "speciality", label: "Speciality", csvOnly: true, csv: (row) => row.Speciality },
    { key: "territory", label: "Territory / area", csv: (row) => [row.TerritoryName, row.AreaName].filter(Boolean).join(" / "), render: (row) => [row.TerritoryName, row.AreaName].filter(Boolean).join(" · ") || "—" },
    { key: "gps", label: "GPS", csv: (row) => LOCATION_LABEL[row.LocationStatus] || row.LocationStatus, render: (row) => (
        <Tag label={LOCATION_LABEL[row.LocationStatus] || "—"} color={row.LocationStatus === "CAPTURED" ? "success" : "warning"} />
    ) },
    { key: "plan", label: "Tour plan", csv: (row) => PLAN_LABEL[row.PlanStatus] || row.PlanStatus, render: (row) => (
        <Tag label={PLAN_LABEL[row.PlanStatus] || "—"} color={PLAN_COLOR[row.PlanStatus] || "secondary"} />
    ) },
    { key: "joint", label: "Joint work", csv: (row) => row.JointWorkName, render: (row) => row.JointWorkName || "—" },
    { key: "feedback", label: "Feedback", csv: (row) => FEEDBACK_LABEL[row.Feedback] || row.Feedback, render: (row) => (
        row.Feedback ? <Tag label={FEEDBACK_LABEL[row.Feedback]} color={FEEDBACK_COLOR[row.Feedback]} /> : "—"
    ) },
    { key: "followUp", label: "Follow-up", csv: (row) => row.FollowUpDate, render: (row) => (row.FollowUpDate ? formatDate(row.FollowUpDate) : "—") },
];

// Label every Nth day so long ranges stay readable.
const axisEvery = (days) => (days <= 16 ? 1 : days <= 35 ? 3 : days <= 95 ? 7 : 30);

function CallReport() {
    const options = useReportOptions();

    const [filters, setFilters] = useState(defaultFilters);
    const [view, setView] = useState("employees");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        if (!filters.from || !filters.to || filters.from > filters.to) return;

        setLoading(true);
        setError("");

        try {
            setData(await getCallReport(filters));
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load the call report"));
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        load();
    }, [load]);

    const kpis = data?.kpis;
    const showEmployees = (options?.users?.length || 0) > 1 && !filters.userId;
    const activeView = showEmployees ? view : "calls";
    const every = axisEvery(data?.days?.length || 0);

    const handleExport = () => {
        const columns = (activeView === "employees" ? EMPLOYEE_COLUMNS : CALL_COLUMNS).map((column) => ({ label: column.label, value: column.csv }));
        const rows = activeView === "employees" ? data.employees : data.rows;
        downloadCsv(`call-report-${activeView}-${filters.from}-to-${filters.to}.csv`, columns, rows);
    };

    return (
        <Box>
            <PageHeader
                eyebrow="Reports & analytics"
                title="DCR / Call report"
                subtitle="Doctor calls, field days, GPS and tour-plan compliance, and DCR status for you and your team."
                actions={
                    <Button variant="outlined" startIcon={<DownloadRounded />} onClick={handleExport} disabled={!data || loading}>
                        Download CSV
                    </Button>
                }
            />

            <ReportFilters filters={filters} onChange={setFilters} options={options} />

            {error ? (
                <LoadError title="Couldn't load the call report" message={error} onRetry={load} />
            ) : (
                <Box sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1, transition: theme.calendar.transition })}>
                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                            gap: theme.stat.gap,
                            mb: theme.stat.gap,
                        })}
                    >
                        <StatCard icon={LocationOnRounded} label="Calls" value={kpis?.calls ?? "—"} caption={kpis ? `${kpis.doctors} doctor(s) met · ${kpis.jointCalls} joint` : "—"} color="primary" />
                        <StatCard
                            icon={CalendarMonthRounded}
                            label="Field days"
                            value={kpis?.fieldDays ?? "—"}
                            caption={kpis?.callAverage == null ? "No calls in range" : `${kpis.callAverage} calls per day · avg call ${kpis.avgMinutes ?? "—"} min`}
                            color="info"
                        />
                        <StatCard
                            icon={GpsFixedRounded}
                            label="GPS / in plan"
                            value={kpis ? `${formatPercent(kpis.gpsPercent)} · ${formatPercent(kpis.inPlanPercent)}` : "—"}
                            caption="Calls with GPS · calls as per tour plan"
                            color="success"
                            progress={kpis?.gpsPercent ?? undefined}
                        />
                        <StatCard
                            icon={AssignmentTurnedInRounded}
                            label="DCRs"
                            value={kpis ? `${kpis.dcrApproved} approved` : "—"}
                            caption={kpis ? `${kpis.dcrPending} pending · ${kpis.dcrReturned} returned` : "—"}
                            color={kpis?.dcrReturned ? "error" : "warning"}
                        />
                    </Box>

                    <Panel title="Calls per day" subtitle={data ? `${formatDate(data.filters.from)} – ${formatDate(data.filters.to)}` : " "} sx={(theme) => ({ mb: theme.stat.gap })}>
                        {data && (
                            <BarChart
                                unit="call"
                                ariaLabel={`Calls per day from ${data.filters.from} to ${data.filters.to}, ${kpis.calls} in total`}
                                items={data.days.map((day, index) => ({
                                    key: day.date,
                                    axisLabel: (data.days.length - 1 - index) % every === 0 ? formatShortDate(day.date) : "",
                                    tooltipTitle: formatDate(day.date),
                                    value: day.calls,
                                }))}
                            />
                        )}
                    </Panel>

                    <Panel
                        title={activeView === "employees" ? "By employee" : "Call details"}
                        subtitle={
                            activeView === "employees"
                                ? `${data?.employees?.length ?? 0} employee(s) in scope`
                                : `${data?.rows?.length ?? 0} call(s)${data?.truncated ? ` · showing the latest ${data.rowLimit}` : ""}`
                        }
                        actions={
                            showEmployees && (
                                <SegmentedControl
                                    value={view}
                                    onChange={setView}
                                    options={[
                                        { value: "employees", label: "By employee", icon: RouteRounded },
                                        { value: "calls", label: "Call details", icon: LocationOnRounded },
                                    ]}
                                />
                            )
                        }
                        disablePadding
                    >
                        {data?.truncated && activeView === "calls" && (
                            <Alert severity="info" variant="outlined" sx={{ m: 2 }}>
                                More than {data.rowLimit} calls match. Narrow the dates or pick an employee to see them all; the totals above include every call.
                            </Alert>
                        )}
                        {activeView === "employees" ? (
                            <ReportTable columns={EMPLOYEE_COLUMNS.filter((column) => !column.csvOnly)} rows={data?.employees || []} rowKey={(row) => row.UserId} />
                        ) : (
                            <ReportTable columns={CALL_COLUMNS.filter((column) => !column.csvOnly)} rows={data?.rows || []} rowKey={(row) => row.VisitId} empty="No calls for these filters." />
                        )}
                    </Panel>
                </Box>
            )}
        </Box>
    );
}

export default CallReport;
