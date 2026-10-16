import api from "../../configurations/api-config";

// The API identifies the acting user from this header; login does not store it yet.
const actingUserHeaders = () => {
    const userId = localStorage.getItem('userId');
    return userId ? { 'x-user-id': userId } : {};
};

// =========================================================
// CONSTANTS
// =========================================================

export const DEVIATION_TYPES = ['Territory Change', 'Area Change'];

export const REASON_LIMIT = 200;
export const REMARKS_LIMIT = 1000;

// `color` is a palette key used by StatusChip and the timeline.
export const DEVIATION_STATUS = {
    PENDING: { label: 'Pending review', color: 'warning' },
    APPROVED: { label: 'Approved', color: 'success' },
    REJECTED: { label: 'Rejected', color: 'error' },
};

export const SYSTEM_SOURCE = 'System Detected';

// =========================================================
// FORMATTERS
// =========================================================

const parseDate = (value) => new Date(`${String(value).slice(0, 10)}T00:00:00`);

export const formatDate = (value) => {
    if (!value) return '-';

    return parseDate(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const formatWeekday = (value) =>
    value ? parseDate(value).toLocaleDateString('en-GB', { weekday: 'long' }) : '';

export const formatDateTime = (value) => {
    if (!value) return '';

    return new Date(value).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Local calendar date as YYYY-MM-DD (toISOString would give the UTC date).
export const todayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const initials = (name) =>
    String(name || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('') || '?';

// =========================================================
// API
// =========================================================

export const getDeviations = async (params) => {
    const response = await api.get('/app/deviations', {
        params,
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const getDeviationById = async (deviationId) => {
    const response = await api.get(`/app/deviations/${deviationId}`, {
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const createDeviation = async (payload) => {
    const response = await api.post('/app/deviations', payload, {
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const approveDeviation = async (deviationId, remarks) => {
    const response = await api.post(`/app/deviations/${deviationId}/approve`, { remarks }, {
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const rejectDeviation = async (deviationId, remarks) => {
    const response = await api.post(`/app/deviations/${deviationId}/reject`, { remarks }, {
        headers: actingUserHeaders(),
    });
    return response.data;
};
