import api from "../../configurations/api-config";

export { errorMessage } from "../Engagement/index";
export { getPeople } from "../WorkDay/index";

const get = async (url, params) => (await api.get(url, { params })).data;
const post = async (url, body) => (await api.post(url, body)).data;
const put = async (url, body) => (await api.put(url, body)).data;

// Views (read-only for everyone)
export const getReview = (month, userId) => get("/app/business/review", { month, userId: userId || undefined });
export const getRampUp = (userId) => get("/app/business/ramp-up", { userId: userId || undefined });
export const getCost = (userId) => get("/app/business/cost", { userId: userId || undefined });
export const getIncentives = (userId) => get("/app/business/incentives", { userId: userId || undefined });
export const getNearExpiry = (userId) => get("/app/business/near-expiry", { userId: userId || undefined });

// Head office data
export const getProducts = () => get("/app/catalogue/products", { active: "1" });
export const getBatches = (productId) => get("/app/business/batches", { productId: productId || undefined });
export const createBatch = (payload) => post("/app/business/batches", payload);
export const getStockists = () => get("/app/business/stockists");
export const setStockistTerritories = (stockistId, add, remove) => post(`/app/business/stockists/${stockistId}/territories`, { Add: add, Remove: remove });
export const getRecords = (kind, month) => get(`/app/business/${kind}`, { month });
export const createRecord = (kind, payload) => post(`/app/business/${kind}`, payload);
export const voidRecord = (kind, recordId, reason) => post(`/app/business/${kind}/${recordId}/void`, { Reason: reason });
export const getPeopleCosts = () => get("/app/business/people");
export const getSalaries = (userId) => get(`/app/business/people/${userId}/salaries`);
export const setJoining = (userId, date) => put(`/app/business/people/${userId}/joining`, { JoiningDate: date });
export const addSalary = (userId, month, salary) => post(`/app/business/people/${userId}/salaries`, { EffectiveFrom: month, MonthlySalary: salary });
export const getConfig = () => get("/app/business/config");
export const saveMilestones = (milestones, reason) => put("/app/business/milestones", { Milestones: milestones, Reason: reason });
export const saveSlabs = (slabs, reason) => put("/app/business/slabs", { Slabs: slabs, Reason: reason });
export const runChecks = () => post("/app/business/checks/run");

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const rupees = (value) => (value == null ? "—" : inr.format(Number(value) || 0));
export const compact = (value) => {
    const n = Number(value) || 0;
    if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
    if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
    if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(1)} K`;
    return `₹${Math.round(n)}`;
};

export const monthLabel = (month) => (month ? new Date(`${String(month).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—");
export const dayLabel = (day) => (day ? new Date(`${String(day).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
export const thisMonth = () => new Date().toISOString().slice(0, 7);

export const MILESTONE_STATUS = {
    MET: { label: "Met", color: "success" },
    MISSED: { label: "Missed", color: "error" },
    IN_PROGRESS: { label: "This month", color: "warning" },
    UPCOMING: { label: "Upcoming", color: "secondary" },
};

export const RETURN_REASONS = [
    { value: "EXPIRED", label: "Expired" },
    { value: "DAMAGED", label: "Damaged" },
    { value: "OTHER", label: "Other" },
];
