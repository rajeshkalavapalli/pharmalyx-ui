import api from "../../configurations/api-config";

export { errorMessage } from "../Engagement/index";
export { getMyPermissions } from "../DoctorRequests/index";

const get = async (url, params) => (await api.get(url, { params })).data;
const post = async (url, body, config) => (await api.post(url, body, config)).data;
const put = async (url, body) => (await api.put(url, body)).data;
const blobUrl = async (url) => URL.createObjectURL((await api.get(url, { responseType: "blob" })).data);

// MR / manager / head office views
export const getStock = (userId) => get("/app/ledger/stock", { userId: userId || undefined });
export const getChemists = (userId) => get("/app/ledger/chemists", { userId: userId || undefined });
export const getChemistLedger = (pharmacyId) => get(`/app/ledger/chemists/${pharmacyId}`);
export const deliveryReceiptUrl = (deliveryId) => blobUrl(`/app/ledger/deliveries/${deliveryId}/receipt`);
export const paymentReceiptUrl = (entryId) => blobUrl(`/app/ledger/payments/${entryId}/receipt`);

// MR: direct supply and payments
export const getOptions = () => get("/app/ledger/options");
export const uploadPhoto = (blob) => post("/app/ledger/photo", blob, { headers: { "Content-Type": blob.type || "image/jpeg" } });
export const createDelivery = (payload) => post("/app/ledger/deliveries", payload);
export const createPayment = (payload) => post("/app/ledger/payments", payload);

// Head office
export const getHoldings = () => get("/app/ledger/holdings");
export const issueStock = (payload) => post("/app/ledger/stock/issue", payload);
export const returnStock = (payload) => post("/app/ledger/stock/return", payload);
export const voidStockEntry = (entryId, reason) => post(`/app/ledger/stock/${entryId}/void`, { Reason: reason });
export const setCreditLimit = (pharmacyId, limit, reason) => put(`/app/ledger/chemists/${pharmacyId}/credit-limit`, { CreditLimit: limit, Reason: reason });
export const adjustDues = (pharmacyId, payload) => post(`/app/ledger/chemists/${pharmacyId}/adjust`, payload);
export const getPaymentsWithMr = () => get("/app/ledger/payments/with-mr");
export const confirmDeposit = (entryId) => post(`/app/ledger/payments/${entryId}/confirm`);
export const voidLedgerEntry = (entryId, reason) => post(`/app/ledger/entries/${entryId}/void`, { Reason: reason });
export const voidDelivery = (deliveryId, reason) => post(`/app/ledger/deliveries/${deliveryId}/void`, { Reason: reason });
export const getSchemes = (from, to) => get("/app/ledger/schemes", { from, to });
export const createScheme = (payload) => post("/app/ledger/schemes", payload);
export const voidScheme = (schemeId, reason) => post(`/app/ledger/schemes/${schemeId}/void`, { Reason: reason });
export const getExits = () => get("/app/ledger/exits");
export const getExit = (clearanceId) => get(`/app/ledger/exits/${clearanceId}`);
export const createExit = (payload) => post("/app/ledger/exits", payload);
export const refreshExit = (clearanceId) => post(`/app/ledger/exits/${clearanceId}/refresh`);
export const handoverExit = (clearanceId) => post(`/app/ledger/exits/${clearanceId}/handover`);
export const closeExit = (clearanceId) => post(`/app/ledger/exits/${clearanceId}/close`);
export const closeExitItem = (itemId, note) => post(`/app/ledger/exit-items/${itemId}/close`, { Note: note });

// Lists head office picks from
export const getProducts = () => get("/app/catalogue/products", { active: "1" });
export const getBatches = (productId) => get("/app/business/batches", { productId: productId || undefined });
export const getLookups = () => get("/app/ledger/lookups");

// Reports
export const getFillRate = (months) => get("/app/ledger/reports/fill-rate", { months });
export const getSpendReport = (months) => get("/app/ledger/reports/spend", { months });
export const getFocus = (months) => get("/app/ledger/reports/focus", { months });

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const rupees = (value) => (value == null ? "—" : inr.format(Number(value) || 0));
export const dayLabel = (day) => (day ? new Date(`${String(day).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
export const todayKey = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
export const percent = (value) => (value == null ? "—" : `${value}%`);

export const BUCKETS = [
    { key: "d0_30", label: "0–30 days", color: "success" },
    { key: "d31_60", label: "31–60 days", color: "warning" },
    { key: "d61_90", label: "61–90 days", color: "error" },
    { key: "d90_plus", label: "90+ days", color: "error" },
];

export const ENTRY_LABEL = {
    ISSUE: { label: "Issued by head office", color: "primary" },
    DELIVERY: { label: "Delivered to chemist", color: "info" },
    RETURN: { label: "Returned to company", color: "secondary" },
    TRANSFER_OUT: { label: "Handed over (exit)", color: "warning" },
    TRANSFER_IN: { label: "Taken over", color: "success" },
};

export const LEDGER_LABEL = {
    DELIVERY: { label: "Delivery", color: "info" },
    PAYMENT: { label: "Payment", color: "success" },
    ADJUSTMENT: { label: "Adjustment", color: "warning" },
    WRITE_OFF: { label: "Write-off", color: "error" },
};

export const PAYMENT_MODES = [
    { value: "CASH", label: "Cash" },
    { value: "UPI", label: "UPI" },
    { value: "CHEQUE", label: "Cheque" },
    { value: "BANK", label: "Bank transfer" },
];

export const EXIT_ITEM = {
    STOCK: { label: "Stock in hand", color: "primary" },
    CHEMIST_DUES: { label: "Chemist dues", color: "warning" },
    PAYMENT_WITH_MR: { label: "Money with MR", color: "error" },
    PENDING_SPEND: { label: "Pending spend", color: "info" },
};
