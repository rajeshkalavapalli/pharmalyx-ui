import api from "../../configurations/api-config";

export { getMyDoctors, getMyTeam } from "../MyDoctors/index";

// The API identifies the acting user from this header; login does not store it yet.
// Offline syncs pass the user who recorded the visit explicitly.
const userHeaders = (userId = localStorage.getItem('userId')) =>
    userId ? { 'x-user-id': userId } : {};

// =========================================================
// API
// =========================================================

export const getVisits = async ({ userId, from, to, doctorId }) => {
    const response = await api.get('/app/visits', {
        params: { userId, from, to, doctorId },
        headers: userHeaders(),
    });
    return response.data;
};

export const getFollowUps = async (userId) => {
    const response = await api.get('/app/visits/follow-ups', {
        params: { userId },
        headers: userHeaders(),
    });
    return response.data;
};

export const getVisit = async (visitId) => {
    const response = await api.get(`/app/visits/${visitId}`, { headers: userHeaders() });
    return response.data;
};

export const createVisit = async (payload, userId) => {
    const response = await api.post('/app/visits', payload, {
        headers: userHeaders(userId),
    });
    return response.data;
};

// =========================================================
// CONSTANTS (`color` is a palette key)
// =========================================================

export const FEEDBACK = {
    POSITIVE: { label: 'Positive', color: 'success' },
    NEUTRAL: { label: 'Neutral', color: 'info' },
    NEGATIVE: { label: 'Negative', color: 'error' },
};

export const PLAN_STATUS = {
    IN_PLAN: { label: 'As planned', color: 'success' },
    OUT_OF_PLAN: { label: 'Out of plan', color: 'warning' },
    OFF_DAY: { label: 'On a planned off day', color: 'warning' },
    NO_PLAN: { label: 'No tour plan', color: 'info' },
};

export const LOCATION_STATUS = {
    CAPTURED: { label: 'Location captured', color: 'success' },
    DENIED: { label: 'Location denied', color: 'error' },
    UNAVAILABLE: { label: 'Location unavailable', color: 'warning' },
    NOT_CAPTURED: { label: 'No location', color: 'info' },
};

export const MAX_BACKDATE_DAYS = 31;
export const NOTES_LIMIT = 1000;
export const FOLLOW_UP_SOON_DAYS = 7;

// =========================================================
// DATES & TIMES (local, YYYY-MM-DD / HH:mm)
// =========================================================

const pad = (value) => String(value).padStart(2, '0');

export const toDateKey = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayKey = () => toDateKey(new Date());

export const parseDateKey = (key) => new Date(`${String(key).slice(0, 10)}T00:00:00`);

export const addDays = (key, days) => {
    const date = parseDateKey(key);
    date.setDate(date.getDate() + days);
    return toDateKey(date);
};

export const monthStartOf = (key) => `${key.slice(0, 7)}-01`;

export const addMonths = (monthStart, delta) => {
    const date = parseDateKey(monthStart);
    return toDateKey(new Date(date.getFullYear(), date.getMonth() + delta, 1));
};

export const monthEndOf = (monthStart) => {
    const date = parseDateKey(monthStart);
    return toDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0));
};

export const daysUntil = (key) =>
    Math.round((parseDateKey(key) - parseDateKey(todayKey())) / 86400000);

export const timeNow = (offsetMinutes = 0) => {
    const date = new Date(Date.now() + offsetMinutes * 60000);
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const minutesBetween = (start, end) => {
    if (!start || !end) return null;

    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const minutes = eh * 60 + em - (sh * 60 + sm);

    return minutes > 0 ? minutes : null;
};

export const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return rest ? `${hours} h ${rest} min` : `${hours} h`;
};

export const formatMonthLabel = (monthStart) =>
    parseDateKey(monthStart).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export const formatDayHeading = (key) =>
    parseDateKey(key).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
    });

export const formatShortDate = (key) =>
    parseDateKey(key).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (value) =>
    value
        ? new Date(value).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : '';

export const formatTimeRange = (start, end) => {
    if (start && end) return `${start} – ${end}`;
    return start || end || 'Time not set';
};

export const formatDueLabel = (key) => {
    const days = daysUntil(key);

    if (days < 0) return `Overdue by ${-days} day${days === -1 ? '' : 's'}`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
};

// =========================================================
// IDS & LOCATION
// =========================================================

// crypto.randomUUID needs a secure context; fall back to getRandomValues.
export const newId = () => {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

// Device GPS works without network; it needs HTTPS or localhost.
export const captureLocation = () =>
    new Promise((resolve) => {
        if (!globalThis.navigator?.geolocation) {
            resolve({ status: 'UNAVAILABLE' });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) =>
                resolve({
                    status: 'CAPTURED',
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: Math.round(position.coords.accuracy),
                    capturedAt: new Date(position.timestamp).toISOString(),
                }),
            (error) =>
                resolve({ status: error.code === error.PERMISSION_DENIED ? 'DENIED' : 'UNAVAILABLE' }),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    });

export const mapsUrl = (latitude, longitude) =>
    `https://www.google.com/maps?q=${latitude},${longitude}`;

// =========================================================
// OFFLINE STORAGE (localStorage; every access is guarded)
// =========================================================

const QUEUE_KEY = 'pharmalyx.visitQueue.v1';
const DOCTORS_KEY = (userId) => `pharmalyx.myDoctors.v1.${userId}`;

const readJson = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const writeJson = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
};

// Queue items: { userId, payload, doctor, queuedAt, error? }
export const readQueue = () => readJson(QUEUE_KEY, []);
export const writeQueue = (queue) => writeJson(QUEUE_KEY, queue);
export const QUEUE_STORAGE_KEY = QUEUE_KEY;

// Doctors are cached so the visit form works without a connection.
export const readCachedDoctors = (userId) => readJson(DOCTORS_KEY(userId), []);
export const cacheDoctors = (userId, doctors) => writeJson(DOCTORS_KEY(userId), doctors);
