import api from "../../configurations/api-config";

export const getPreCallDay = async (date, userId) =>
    (await api.get('/app/precall', { params: { date, userId } })).data;

export const savePreCallPlan = async (payload) => (await api.put('/app/precall/plan', payload)).data;

export const deletePreCallPlan = async (preCallId) => (await api.delete(`/app/precall/plan/${preCallId}`)).data;

export const reorderPreCallPlan = async (planDate, order) =>
    (await api.put('/app/precall/plan/order', { PlanDate: planDate, Order: order })).data;

export { getProducts } from "../Engagement/index";

// Notes carried into the visit form when the planned call is logged.
export const planToVisitNotes = (callPlan) =>
    [
        `Objective: ${callPlan.objective}`,
        callPlan.keyMessages ? `Key messages: ${callPlan.keyMessages}` : null,
        callPlan.productNames ? `Products detailed: ${callPlan.productNames}` : null,
    ]
        .filter(Boolean)
        .join("\n");

export const OBJECTIVE_LIMIT = 500;
export const MESSAGES_LIMIT = 1000;

export const FEEDBACK = {
    POSITIVE: { label: 'Positive', color: 'success' },
    NEUTRAL: { label: 'Neutral', color: 'info' },
    NEGATIVE: { label: 'Negative', color: 'error' },
};

const pad = (value) => String(value).padStart(2, '0');

export const toDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const todayKey = () => toDateKey(new Date());

export const addDays = (key, days) => {
    const date = new Date(`${key}T00:00:00`);
    date.setDate(date.getDate() + days);
    return toDateKey(date);
};

export const formatDayHeading = (key) =>
    new Date(`${key}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export const formatShortDate = (key) =>
    key ? new Date(`${key}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatMoney = (value) => (value == null ? '—' : inr.format(value));

export const errorMessage = (error, fallback) => {
    const data = error.response?.data;
    const message = data?.message || error.message || fallback;

    return data?.error && data.error !== message ? `${message} (${data.error})` : message;
};
