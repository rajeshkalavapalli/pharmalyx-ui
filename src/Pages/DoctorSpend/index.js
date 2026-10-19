import api from "../../configurations/api-config";

export { errorMessage } from "../Engagement/index";

const get = async (url, params) => (await api.get(url, { params })).data;
const post = async (url, body, config) => (await api.post(url, body, config)).data;
const put = async (url, body) => (await api.put(url, body)).data;

export const getConfig = () => get("/app/spend/config");
export const getRequests = (filter) => get("/app/spend/requests", { filter });
export const getReports = () => get("/app/spend/reports");
export const createRequest = (payload) => post("/app/spend/requests", payload);
export const recommend = (requestId, payload) => post(`/app/spend/requests/${requestId}/recommend`, payload);
export const decide = (requestId, payload) => post(`/app/spend/requests/${requestId}/decide`, payload);
export const uploadDocument = (file) => post("/app/spend/documents", file, { headers: { "Content-Type": file.type || "application/octet-stream" } });
export const disburse = (requestId, payload) => post(`/app/spend/requests/${requestId}/disburse`, payload);
export const documentUrl = async (requestId) => URL.createObjectURL((await api.get(`/app/spend/requests/${requestId}/document`, { responseType: "blob" })).data);
export const saveType = (typeId, payload) => (typeId ? put(`/app/spend/types/${typeId}`, payload) : post("/app/spend/types", payload));

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const rupees = (value) => (value == null ? "—" : inr.format(Number(value) || 0));
export const dayLabel = (day) => (day ? new Date(`${String(day).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
export const todayKey = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);

export const STATUS = {
    REQUESTED: { label: "Waiting for manager", color: "warning" },
    RECOMMENDED: { label: "Recommended · with head office", color: "info" },
    NOT_RECOMMENDED: { label: "Not recommended · with head office", color: "warning" },
    APPROVED: { label: "Approved · to be paid", color: "primary" },
    REJECTED: { label: "Rejected", color: "error" },
    DISBURSED: { label: "Paid", color: "success" },
};

export const OUTCOME = {
    ON_TRACK: { label: "On track", color: "success" },
    PARTLY_MET: { label: "Partly met", color: "warning" },
    CLAIM_FAILED: { label: "Claim failed", color: "error" },
    NOT_STARTED: { label: "Not started", color: "secondary" },
};

export const METHOD_LABEL = { BANK: "Bank transfer", CHEQUE: "Cheque", UPI: "UPI", VENDOR: "Paid to vendor" };

export const scoreText = (score) => (!score || score.pct == null ? "No finished claims yet" : `${score.pct}% met (${score.met} of ${score.claims})`);
