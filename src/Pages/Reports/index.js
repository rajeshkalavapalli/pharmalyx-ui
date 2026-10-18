import api from "../../configurations/api-config";

export { errorMessage, formatMoneyCompact } from "../Engagement/index";
export { formatAmount } from "../Sales/index";

const get = async (url, params) => (await api.get(url, { params })).data;

// =========================================================
// API
// =========================================================

export const getReportOptions = () => get("/app/reports/options");

const filterParams = (filters) => ({
    from: filters.from,
    to: filters.to,
    userId: filters.userId || undefined,
    territoryId: filters.territoryId || undefined,
    productId: filters.productId || undefined,
});

export const getCallReport = (filters) => get("/app/reports/calls", filterParams(filters));
export const getCoverageReport = (filters) => get("/app/reports/coverage", filterParams(filters));
export const getMissedReport = (filters) => get("/app/reports/missed-visits", filterParams(filters));
export const getPobReport = (filters) => get("/app/reports/pob", filterParams(filters));
export const getSalesReport = (filters) => get("/app/reports/sales", filterParams(filters));
export const getKpiReport = (filters) => get("/app/reports/kpi", filterParams(filters));
export const getMisReport = (filters) => get("/app/reports/mis", filterParams(filters));
export const getGraphReport = (filters) => get("/app/reports/graphical", filterParams(filters));

// =========================================================
// DATES
// =========================================================

const pad = (value) => String(value).padStart(2, "0");
export const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Quick ranges for the filter bar; "custom" keeps whatever dates are set.
export const RANGE_PRESETS = [
    {
        value: "this_month",
        label: "This month",
        range: (now) => [toKey(new Date(now.getFullYear(), now.getMonth(), 1)), toKey(now)],
    },
    {
        value: "last_month",
        label: "Last month",
        range: (now) => [toKey(new Date(now.getFullYear(), now.getMonth() - 1, 1)), toKey(new Date(now.getFullYear(), now.getMonth(), 0))],
    },
    {
        value: "this_quarter",
        label: "This quarter",
        range: (now) => [toKey(new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)), toKey(now)],
    },
    { value: "custom", label: "Custom" },
];

export const defaultFilters = () => {
    const [from, to] = RANGE_PRESETS[0].range(new Date());
    return { preset: "this_month", from, to, userId: "", territoryId: "", productId: "" };
};

export const formatDate = (key) =>
    key ? new Date(`${String(key).slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const formatShortDate = (key) => new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export const formatPercent = (value) => (value == null ? "—" : `${value}%`);

// =========================================================
// CSV
// =========================================================

// Quotes every field, and neutralises values a spreadsheet would run as a formula.
const csvCell = (value) => {
    let text = value == null ? "" : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
};

// columns: [{ label, value: (row) => any }]. The BOM makes Excel read UTF-8 (₹, names) correctly.
export const downloadCsv = (fileName, columns, rows) => {
    const lines = [columns.map((column) => csvCell(column.label)).join(","), ...rows.map((row) => columns.map((column) => csvCell(column.value(row))).join(","))];
    const blob = new Blob([`﻿${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

export const LOCATION_LABEL = { CAPTURED: "Captured", DENIED: "Denied", UNAVAILABLE: "Unavailable", NOT_CAPTURED: "Not captured" };
export const PLAN_LABEL = { IN_PLAN: "In plan", OUT_OF_PLAN: "Out of plan", NO_PLAN: "No plan" };
export const FEEDBACK_LABEL = { POSITIVE: "Positive", NEUTRAL: "Neutral", NEGATIVE: "Negative" };

export const formatMonth = (month) => new Date(`${month}-01T00:00:00`).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });

export const ORDER_STATUS_LABEL = { BOOKED: "Raised", CONFIRMED: "Under follow-up", SUPPLIED: "Supplied", CANCELLED: "Cancelled" };
export const ORDER_STATUS_COLOR = { BOOKED: "warning", CONFIRMED: "info", SUPPLIED: "success", CANCELLED: "secondary" };
export const CATEGORY_LABEL = { A: "Class A", B: "Class B", C: "Class C", U: "Unrated" };
export const COVERAGE_STATUS = {
    MET: { label: "Norm met", color: "success" },
    BELOW_NORM: { label: "Below norm", color: "warning" },
    NOT_VISITED: { label: "Not visited", color: "error" },
};

// Green / amber / red for a value against { good, fair } thresholds.
export const ragColor = (value, threshold) => (value == null || !threshold ? "secondary" : value >= threshold.good ? "success" : value >= threshold.fair ? "warning" : "error");
