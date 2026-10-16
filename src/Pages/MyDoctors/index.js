import api from "../../configurations/api-config";

export { DOCTOR_CATEGORY } from "../Doctors/index";

// The API identifies the acting user from this header; login does not store it yet.
const actingUserHeaders = () => {
    const userId = localStorage.getItem('userId');
    return userId ? { 'x-user-id': userId } : {};
};

// =========================================================
// API
// =========================================================

export const getMyDoctors = async (userId) => {
    const response = await api.get('/app/my-doctors', {
        params: { userId },
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const getMyTeam = async () => {
    const response = await api.get('/app/my-doctors/team', {
        headers: actingUserHeaders(),
    });
    return response.data;
};

// =========================================================
// HELPERS
// =========================================================

export const OCCASION_WINDOW_DAYS = 30;
export const OCCASION_SOON_DAYS = 7;

export const OCCASION_TYPE = {
    birthday: { label: 'Birthday', field: 'DateOfBirth' },
    anniversary: { label: 'Anniversary', field: 'AnniversaryDate' },
};

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfToday = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const initials = (name) =>
    String(name || '')
        .replace(/^dr\.?\s+/i, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('') || '?';

// Next yearly occurrence of a YYYY-MM-DD date. 29 Feb falls back to 28 Feb.
export const nextOccurrence = (value) => {
    if (!value) return null;

    const [, month, day] = String(value).slice(0, 10).split('-').map(Number);

    if (!month || !day) return null;

    const today = startOfToday();

    const onYear = (year) => {
        const date = new Date(year, month - 1, day);
        return date.getMonth() === month - 1 ? date : new Date(year, month - 1, 28);
    };

    let date = onYear(today.getFullYear());

    if (date < today) {
        date = onYear(today.getFullYear() + 1);
    }

    return { date, days: Math.round((date - today) / DAY_MS) };
};

export const formatDayMonth = (date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const formatLongDate = (value) =>
    value
        ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : '';

export const formatCountdown = (days) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
};

// All birthdays/anniversaries within `windowDays`, soonest first.
export const upcomingOccasions = (doctors, windowDays = OCCASION_WINDOW_DAYS) =>
    doctors
        .flatMap((doctor) =>
            Object.entries(OCCASION_TYPE).map(([type, config]) => {
                const next = nextOccurrence(doctor[config.field]);
                return next && next.days <= windowDays ? { doctor, type, ...next } : null;
            })
        )
        .filter(Boolean)
        .sort((a, b) => a.days - b.days);

// The single nearest occasion for one doctor, if within the window.
export const nearestOccasion = (doctor) => upcomingOccasions([doctor])[0] || null;
