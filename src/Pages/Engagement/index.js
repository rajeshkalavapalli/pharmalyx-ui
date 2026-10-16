import api from "../../configurations/api-config";

export { getMyDoctors } from "../MyDoctors/index";

// The API identifies the acting user from this header.
const headers = () => {
    const userId = localStorage.getItem('userId');
    return userId ? { 'x-user-id': userId } : {};
};

const get = async (url, params) => (await api.get(url, { params, headers: headers() })).data;
const post = async (url, body) => (await api.post(url, body, { headers: headers() })).data;
const put = async (url, body) => (await api.put(url, body, { headers: headers() })).data;

// =========================================================
// API
// =========================================================

export const getProducts = (activeOnly = false) => get('/app/catalogue/products', { active: activeOnly ? '1' : undefined });
export const saveProduct = (productId, payload) =>
    productId ? put(`/app/catalogue/products/${productId}`, payload) : post('/app/catalogue/products', payload);

export const getGifts = (activeOnly = false) => get('/app/catalogue/gifts', { active: activeOnly ? '1' : undefined });
export const saveGift = (giftId, payload) =>
    giftId ? put(`/app/catalogue/gifts/${giftId}`, payload) : post('/app/catalogue/gifts', payload);

export const getStockBalances = (userId, itemType) => get('/app/stock/balances', { userId, itemType });
export const getStockLedger = (userId, itemType, from) => get('/app/stock/ledger', { userId, itemType, from });
export const issueStock = (payload) => post('/app/stock/issue', payload);
export const returnStock = (payload) => post('/app/stock/return', payload);

export const getRcpa = (userId, month) => get('/app/rcpa', { userId, month });
export const getRcpaPharmacies = () => get('/app/rcpa/pharmacies');
export const createRcpa = (payload) => post('/app/rcpa', payload);

export const getDoctorBusiness = (userId, month) => get('/app/doctor-business', { userId, month });
export const saveDoctorBusiness = (payload) => put('/app/doctor-business', payload);

export const getFeedback = (userId, month) => get('/app/feedback', { userId, month });

// =========================================================
// CONSTANTS
// =========================================================

export const ITEM_TYPE = {
    SAMPLE: { label: 'Sample', plural: 'Samples', unit: 'units' },
    GIFT: { label: 'Gift', plural: 'Gifts', unit: 'pcs' },
};

export const ENTRY_TYPE = {
    ISSUE: { label: 'Received', color: 'success' },
    DISTRIBUTION: { label: 'Given to doctor', color: 'primary' },
    RETURN: { label: 'Returned', color: 'warning' },
};

export const FEEDBACK = {
    POSITIVE: { label: 'Positive', color: 'success' },
    NEUTRAL: { label: 'Neutral', color: 'info' },
    NEGATIVE: { label: 'Negative', color: 'error' },
};

export const LOW_STOCK_THRESHOLD = 5;

// =========================================================
// HELPERS
// =========================================================

const pad = (value) => String(value).padStart(2, '0');

export const toDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const todayKey = () => toDateKey(new Date());
export const monthKey = (key = todayKey()) => key.slice(0, 7);

export const shiftMonth = (month, delta) => {
    const [year, mon] = month.split('-').map(Number);
    return toDateKey(new Date(year, mon - 1 + delta, 1)).slice(0, 7);
};

export const formatMonth = (month) =>
    new Date(`${month}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export const formatShortMonth = (month) =>
    new Date(`${month.slice(0, 7)}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short' });

export const formatDate = (key) =>
    key ? new Date(`${String(key).slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inrCompact = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 });

export const formatMoney = (value) => (value == null ? '—' : inr.format(value));
export const formatMoneyCompact = (value) => (value == null ? '—' : inrCompact.format(value));

export const errorMessage = (error, fallback) => {
    const data = error.response?.data;
    const message = data?.message || error.message || fallback;

    return data?.error && data.error !== message ? `${message} (${data.error})` : message;
};

// Stock balances cached per user so the visit form can offer items offline.
const BALANCES_KEY = (userId) => `pharmalyx.stockBalances.v1.${userId}`;

export const cacheBalances = (userId, balances) => {
    try {
        localStorage.setItem(BALANCES_KEY(userId), JSON.stringify(balances));
    } catch {
        // Offline offer just won't be available.
    }
};

export const readCachedBalances = (userId) => {
    try {
        return JSON.parse(localStorage.getItem(BALANCES_KEY(userId)) || '[]');
    } catch {
        return [];
    }
};
