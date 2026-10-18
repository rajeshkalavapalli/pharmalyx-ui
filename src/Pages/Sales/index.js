import api from "../../configurations/api-config";

export { errorMessage, formatDate, formatMoneyCompact, monthKey, toDateKey, todayKey } from "../Engagement/index";

const get = async (url, params) => (await api.get(url, { params })).data;
const post = async (url, body) => (await api.post(url, body)).data;
const put = async (url, body) => (await api.put(url, body)).data;

// =========================================================
// API
// =========================================================

export const getOrders = (month, scope = "self") => get("/app/orders", { month, scope });
export const getOrderOptions = () => get("/app/orders/options");
export const createOrder = (payload) => post("/app/orders", payload);
export const getAccounts = (kind, month) => get(`/app/sales/${kind}`, { month });
export const getAccount = (kind, accountId) => get(`/app/sales/${kind}/${accountId}`);
export const getSecondaryOverview = (month) => get("/app/secondary", { month });
export const getStatement = (stockistId, month) => get("/app/secondary/statement", { stockistId, month });
export const saveStatement = (payload) => put("/app/secondary/statement", payload);
export const getSecondaryReviews = () => get("/app/secondary/reviews");
export const getStatementById = (statementId) => get(`/app/secondary/statements/${statementId}`);
export const reviewStatement = (statementId, outcome, remarks) =>
    post(`/app/secondary/statements/${statementId}/${outcome === "APPROVED" ? "approve" : "return"}`, { Remarks: remarks || null });
export const getStockPosition = () => get("/app/sales/stock");
export const getBusiness = (month, scope = "self") => get("/app/sales/business", { month, scope });
export const updateOrderStatus = (orderId, status, remarks) =>
    post(`/app/orders/${orderId}/status`, { Status: status, Remarks: remarks || null });
export const uploadSlip = (blob) => post("/app/orders/slip", blob, { headers: { "Content-Type": blob.type || "image/jpeg" } });
export const fetchSlipUrl = async (orderId) => URL.createObjectURL((await api.get(`/app/orders/${orderId}/slip`, { responseType: "blob" })).data);

// =========================================================
// CONSTANTS
// =========================================================

// POB follow-up (not used for incentives): Raised -> Under follow-up -> Supplied -> Verified.
export const ORDER_STATUS = {
    BOOKED: { label: "Raised", color: "info" },
    CONFIRMED: { label: "Under follow-up", color: "warning" },
    SUPPLIED: { label: "Supplied", color: "success" },
    VERIFIED: { label: "Verified", color: "primary" },
    CANCELLED: { label: "Cancelled", color: "error" },
};

export const statusOf = (order) => (order.Status === "SUPPLIED" && order.VerifiedOn ? ORDER_STATUS.VERIFIED : ORDER_STATUS[order.Status]);

// Next steps (the server enforces the same rules). The MR marks supplied or cancels; the manager follows up and verifies.
export const orderActions = (order, role) => {
    if (role === "manager") {
        if (order.Status === "BOOKED") return [{ status: "CONFIRMED", label: "Follow up with MR", color: "warning", remarks: "optional" }];
        if (order.Status === "SUPPLIED" && !order.VerifiedOn) return [{ status: "VERIFIED", label: "Verify", color: "primary", remarks: "none" }];
        return [];
    }
    if (order.Status === "BOOKED" || order.Status === "CONFIRMED") {
        return [
            { status: "SUPPLIED", label: "Mark supplied", color: "success", remarks: "none" },
            { status: "CANCELLED", label: "Cancel order", color: "error", remarks: "required" },
        ];
    }
    return [];
};

export const CUSTOMER_TYPE = {
    DOCTOR: { label: "Doctor" },
    CHEMIST: { label: "Chemist" },
};

// =========================================================
// HELPERS
// =========================================================

const inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatAmount = (value) => (value == null ? "—" : inr2.format(value));

// Same paise arithmetic as the server, for the live preview while booking.
export const lineAmounts = (unitPrice, quantity, discountPercent) => {
    const gross = Math.round(Number(unitPrice || 0) * 100) * (Number(quantity) || 0);
    const discount = Math.round((gross * (Number(discountPercent) || 0)) / 100);

    return { gross: gross / 100, discount: discount / 100, net: (gross - discount) / 100 };
};

export const customerLabel = (order) => (order.CustomerType === "DOCTOR" ? `Dr. ${order.CustomerName}` : order.CustomerName);

// Retailers and stockists share one page; these are the differences.
export const ACCOUNT_KIND = {
    retailers: { singular: "Chemist", plural: "Retailers", noun: "chemist", eyebrow: "Sales & distribution · Retailers" },
    stockists: { singular: "Stockist", plural: "Stockists", noun: "stockist", eyebrow: "Sales & distribution · Stockists" },
};

export const STATEMENT_STATUS = {
    NOT_STARTED: { label: "Not started", color: "secondary" },
    DRAFT: { label: "Draft", color: "secondary" },
    SUBMITTED: { label: "Sent for review", color: "submitted" },
    APPROVED: { label: "Approved", color: "success" },
    RETURNED: { label: "Returned", color: "error" },
};

export const STOCK_STATUS = {
    OUT: { label: "Out of stock", color: "error" },
    LOW: { label: "Low cover", color: "warning" },
    HEALTHY: { label: "Healthy", color: "success" },
    HIGH: { label: "Overstock", color: "info" },
    NO_MOVEMENT: { label: "No movement", color: "secondary" },
};

const units = new Intl.NumberFormat("en-IN");
export const formatUnits = (value) => (value == null ? "—" : units.format(value));

export const formatMonthLabel = (monthStart) =>
    monthStart ? new Date(`${String(monthStart).slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "—";

// Closing = opening + receipts + returns - sales (the server checks the same).
export const closingOf = (row) =>
    (Number(row.OpeningQty) || 0) + (Number(row.ReceiptQty) || 0) + (Number(row.ReturnQty) || 0) - (Number(row.SalesQty) || 0);

export const isStatementQty = (value) => value === "" || (/^\d+$/.test(String(value)) && Number(value) <= 1000000);

export const statementRowError = (row) => {
    if (["OpeningQty", "ReceiptQty", "SalesQty", "ReturnQty"].some((key) => !isStatementQty(row[key]))) return "Whole numbers only";
    if (closingOf(row) < 0) return "Sales exceed stock";
    return "";
};
