import api from "../../configurations/api-config";

export { getMyTeam } from "../MyDoctors/index";
export { WEEKDAY_LABELS, buildMonthGrid } from "../Tourplan/index";
export {
    FEEDBACK,
    PLAN_STATUS as VISIT_PLAN_STATUS,
    addMonths,
    formatDateTime,
    formatDayHeading,
    formatDuration,
    formatMonthLabel,
    formatTimeRange,
    minutesBetween,
    monthStartOf,
    readQueue,
    todayKey,
} from "../Visits/index";

// The API identifies the acting user from this header; login does not store it yet.
const actingUserHeaders = () => {
    const userId = localStorage.getItem('userId');
    return userId ? { 'x-user-id': userId } : {};
};

// =========================================================
// API
// =========================================================

export const getDcrMonth = async (month, userId) => {
    const response = await api.get('/app/dcr/month', {
        params: { month, userId },
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const getDcrDay = async (date, userId) => {
    const response = await api.get('/app/dcr/day', {
        params: { date, userId },
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const getDcrReviews = async () => {
    const response = await api.get('/app/dcr/reviews', { headers: actingUserHeaders() });
    return response.data;
};

export const submitDcr = async (payload) => {
    const response = await api.post('/app/dcr', payload, { headers: actingUserHeaders() });
    return response.data;
};

export const approveDcr = async (dcrId, remarks) => {
    const response = await api.post(`/app/dcr/${dcrId}/approve`, { remarks }, {
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const returnDcr = async (dcrId, remarks) => {
    const response = await api.post(`/app/dcr/${dcrId}/return`, { remarks }, {
        headers: actingUserHeaders(),
    });
    return response.data;
};

// =========================================================
// CONSTANTS (`color` is a palette key)
// =========================================================

export const DAY_STATUS = {
    APPROVED: { label: 'Approved', color: 'success' },
    SUBMITTED: { label: 'Sent for review', color: 'submitted' },
    RETURNED: { label: 'Returned', color: 'error' },
    DUE: { label: 'Due', color: 'primary' },
    MISSED: { label: 'Missed', color: 'error' },
    OFF: { label: 'Off day', color: 'info' },
    NO_ACTIVITY: { label: 'No activity', color: 'secondary' },
    UPCOMING: { label: 'Upcoming', color: 'secondary' },
};

// Statuses that make a calendar cell stand out; the rest stay neutral.
export const HIGHLIGHT_STATUSES = ['APPROVED', 'SUBMITTED', 'RETURNED', 'DUE', 'MISSED'];

export const TRAVEL_MODES = [
    { value: 'BIKE', label: 'Bike' },
    { value: 'CAR', label: 'Car' },
    { value: 'BUS', label: 'Bus' },
    { value: 'TRAIN', label: 'Train' },
    { value: 'AUTO', label: 'Auto' },
    { value: 'OTHER', label: 'Other' },
];

export const MAX_DISTANCE_KM = 2000;
export const REMARKS_LIMIT = 1000;

const pad = (value) => String(value).padStart(2, '0');

// Shifts an HH:mm time by whole minutes, clamped to the same day.
export const shiftTime = (time, minutes) => {
    if (!time) return '';

    const [hours, mins] = time.split(':').map(Number);
    const total = Math.min(Math.max(hours * 60 + mins + minutes, 0), 23 * 60 + 59);

    return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
};

export const formatDeadline = (key) =>
    new Date(`${key}T00:00:00`).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
