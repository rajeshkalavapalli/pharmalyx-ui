import { Box, Typography } from "@mui/material";

import Tag from "../../../components/Tag/Tag";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import { COVERAGE_STATUS, formatDate } from "../index";

// One row per doctor assignment (Coverage and Missed visits reports).
export const DOCTOR_COLUMNS = [
    { key: "employee", label: "Employee", csv: (row) => row.EmployeeName },
    {
        key: "doctor",
        label: "Doctor",
        csv: (row) => row.DoctorName,
        render: (row) => (
            <Box>
                <Typography variant="subtitle2">Dr. {row.DoctorName}</Typography>
                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {[row.Speciality, row.HospitalName].filter(Boolean).join(" · ") || "—"}
                </Typography>
            </Box>
        ),
    },
    { key: "category", label: "Category", csv: (row) => row.Category || "", render: (row) => (row.Category ? <CategoryBadge category={row.Category} /> : "—") },
    { key: "speciality", label: "Speciality", csvOnly: true, csv: (row) => row.Speciality },
    { key: "territory", label: "Territory / area", csv: (row) => [row.TerritoryName, row.AreaName].filter(Boolean).join(" / "), render: (row) => [row.TerritoryName, row.AreaName].filter(Boolean).join(" · ") || "—" },
    { key: "norm", label: "Norm / month", align: "right", csv: (row) => row.Norm, render: (row) => row.Norm || "—" },
    { key: "required", label: "Required", align: "right", csv: (row) => row.required, render: (row) => row.required || "—" },
    { key: "visits", label: "Visits", align: "right", csv: (row) => row.visits },
    { key: "lastVisit", label: "Last visit", csv: (row) => row.LastVisit || "", render: (row) => (row.LastVisit ? formatDate(row.LastVisit) : "Never") },
    { key: "status", label: "Status", csv: (row) => COVERAGE_STATUS[row.status].label, render: (row) => <Tag label={COVERAGE_STATUS[row.status].label} color={COVERAGE_STATUS[row.status].color} /> },
];
