import api from "../../configurations/api-config";

export { errorMessage, formatMoneyCompact } from "../Engagement/index";
export { formatAmount } from "../Sales/index";
export { downloadCsv, formatDate, formatMonth, formatPercent } from "../Reports/index";

const get = async (url, params) => (await api.get(url, { params })).data;
const post = async (url, body) => (await api.post(url, body)).data;
const put = async (url, body) => (await api.put(url, body)).data;

export const getAlerts = (userId) => get("/app/insights/alerts", { userId: userId || undefined });
export const actOnAlert = (alertKey, status, note) => post("/app/insights/alerts/action", { AlertKey: alertKey, Status: status, Note: note || null });
export const getPerformance = (userId) => get("/app/insights/performance", { userId: userId || undefined });
export const getFieldIntel = (userId) => get("/app/insights/field", { userId: userId || undefined });
export const getAnalytics = (userId) => get("/app/insights/analytics", { userId: userId || undefined });
export const getInsightRules = () => get("/app/insights/rules");
export const saveInsightRule = (ruleCode, payload) => put(`/app/insights/rules/${ruleCode}`, payload);

export const SEVERITY = {
    HIGH: { label: "High", color: "error" },
    MEDIUM: { label: "Medium", color: "warning" },
    LOW: { label: "Low", color: "info" },
};

export const GROUPS = [
    { value: "ALL", label: "All" },
    { value: "DOCTOR", label: "Doctor risk" },
    { value: "REP", label: "Rep performance" },
    { value: "STOCK", label: "Business & stock" },
    { value: "GPS", label: "GPS & location" },
];

export const SEGMENT_COLOR = { CHAMPION: "success", GROW: "primary", UNDERSERVED: "warning", RECONSIDER: "error", NO_DATA: "secondary" };

// "+12%" / "−8%" with a direction for colouring; null when there is nothing to compare.
export const trend = (value, suffix = "%") =>
    value == null ? null : { text: `${value > 0 ? "▲" : value < 0 ? "▼" : "•"} ${Math.abs(value)}${suffix}`, color: value > 0 ? "success" : value < 0 ? "error" : "secondary" };
