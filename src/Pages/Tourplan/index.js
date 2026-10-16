import api from "../../configurations/api-config";

// =========================================================
// API
// =========================================================

export const getTerritories = async () => {
    const response = await api.get('/app/get-territories');
    return response.data;
};

export const getAreas = async () => {
    const response = await api.get('/app/get-areas-code');
    return response.data;
};

// The API identifies the acting user from this header; login does not store it yet.
const actingUserHeaders = () => {
    const userId = localStorage.getItem('userId');
    return userId ? { 'x-user-id': userId } : {};
};

export const getCurrentUserId = () => localStorage.getItem('userId');

export const getTourPlan = async (planMonth, userId) => {
    const response = await api.get('/app/tourplan', {
        params: { planMonth, userId },
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const saveTourPlan = async (payload) => {
    const response = await api.post('/app/tourplan', payload, {
        headers: actingUserHeaders(),
    });
    return response.data;
};

// Manager: direct reports' plans for a month (planMonth YYYY-MM-01).
export const getTeamTourPlans = async (planMonth) => {
    const response = await api.get('/app/tourplan/team', {
        params: { planMonth },
        headers: actingUserHeaders(),
    });
    return response.data;
};

// Recent months for yourself, or for a direct report.
export const getTourPlanHistory = async (userId) => {
    const response = await api.get('/app/tourplan/history', {
        params: { userId },
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const approveTourPlan = async (tourPlanId, remarks) => {
    const response = await api.post(`/app/tourplan/${tourPlanId}/approve`, { remarks }, {
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const rejectTourPlan = async (tourPlanId, remarks) => {
    const response = await api.post(`/app/tourplan/${tourPlanId}/reject`, { remarks }, {
        headers: actingUserHeaders(),
    });
    return response.data;
};

// =========================================================
// CONSTANTS
// =========================================================

export const DAY_TYPE = {
    WORKING: 'working',
    OFF: 'non-working',
};

export const REMARKS_LIMIT = 200;
export const REVIEW_REMARKS_LIMIT = 1000;

// `color` is a palette key used by StatusChip and the timeline.
export const PLAN_STATUS = {
    NEW: { label: 'Not started', color: 'info' },
    DRAFT: { label: 'Draft', color: 'secondary' },
    SUBMITTED: { label: 'Sent for approval', color: 'submitted' },
    APPROVED: { label: 'Approved', color: 'success' },
    REJECTED: { label: 'Returned for changes', color: 'error' },
};

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// =========================================================
// DATE HELPERS (plain YYYY-MM-DD strings, local time)
// =========================================================

const pad = (value) => String(value).padStart(2, '0');

export const toDateKey = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateKey = (key) => new Date(`${key.slice(0, 10)}T00:00:00`);

export const todayKey = () => toDateKey(new Date());

export const monthStartOf = (key) => `${key.slice(0, 7)}-01`;

export const addMonths = (monthStart, delta) => {
    const date = parseDateKey(monthStart);
    return toDateKey(new Date(date.getFullYear(), date.getMonth() + delta, 1));
};

export const daysOfMonth = (monthStart) => {
    const date = parseDateKey(monthStart);
    const count = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    return Array.from({ length: count }, (_, index) => `${monthStart.slice(0, 8)}${pad(index + 1)}`);
};

// Monday-based index: 0 = Monday ... 6 = Sunday.
export const weekdayIndex = (key) => (parseDateKey(key).getDay() + 6) % 7;

// Weeks (Mon-Sun) covering the month, padded with neighbouring-month days.
export const buildMonthGrid = (monthStart) => {
    const first = parseDateKey(monthStart);
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - weekdayIndex(monthStart));

    const days = daysOfMonth(monthStart);
    const cellCount = Math.ceil((weekdayIndex(monthStart) + days.length) / 7) * 7;

    const weeks = [];

    for (let index = 0; index < cellCount; index += 1) {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);

        const key = toDateKey(date);

        if (index % 7 === 0) {
            weeks.push([]);
        }

        weeks[weeks.length - 1].push({
            key,
            day: date.getDate(),
            inMonth: key.startsWith(monthStart.slice(0, 7)),
            weekday: index % 7,
        });
    }

    return weeks;
};

export const formatMonthLabel = (monthStart) =>
    parseDateKey(monthStart).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export const formatDayLabel = (key) =>
    parseDateKey(key).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

export const formatShortDate = (key) =>
    parseDateKey(key).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

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

// Describes a set of dates compactly: "12 Oct", "6 – 10 Oct" or "5 days".
export const describeDates = (dates) => {
    if (dates.length === 0) return '';
    if (dates.length === 1) return formatShortDate(dates[0]);

    const sorted = [...dates].sort();
    const contiguous = sorted.every(
        (key, index) =>
            index === 0 ||
            Math.round((parseDateKey(key) - parseDateKey(sorted[index - 1])) / 86400000) === 1
    );

    return contiguous
        ? `${formatShortDate(sorted[0])} – ${formatShortDate(sorted[sorted.length - 1])}`
        : `${sorted.length} days`;
};

// =========================================================
// PLAN HELPERS
// =========================================================

export const isDayComplete = (plan) =>
    Boolean(plan) && (plan.dayType === DAY_TYPE.OFF || (plan.territory && plan.area));

// Maps each day to the same weekday occurrence in the source month
// (e.g. 2nd Tuesday -> 2nd Tuesday), so weekly routes carry over.
export const copyByWeekdayPattern = (sourcePlans, sourceMonth, targetMonth) => {
    const occurrenceKey = (key) =>
        `${weekdayIndex(key)}-${Math.floor((parseDateKey(key).getDate() - 1) / 7)}`;

    const sourceByOccurrence = {};

    daysOfMonth(sourceMonth).forEach((key) => {
        if (sourcePlans[key]) {
            sourceByOccurrence[occurrenceKey(key)] = sourcePlans[key];
        }
    });

    const result = {};

    daysOfMonth(targetMonth).forEach((key) => {
        const source = sourceByOccurrence[occurrenceKey(key)];

        if (source) {
            result[key] = { ...source };
        }
    });

    return result;
};

export const detailsToPlans = (details = []) =>
    details.reduce((plans, detail) => {
        plans[detail.PlanDate] = {
            dayType: detail.DayType,
            territory: detail.TerritoryId || '',
            area: detail.AreaId || '',
            territoryName: detail.TerritoryName || '',
            areaName: detail.AreaName || '',
            remarks: detail.Remarks || '',
        };

        return plans;
    }, {});

export const plansToDetails = (plans, monthStart) =>
    Object.entries(plans)
        .filter(([date]) => date.startsWith(monthStart.slice(0, 7)))
        .map(([date, plan]) => ({
            PlanDate: date,
            DayType: plan.dayType,
            TerritoryId: plan.dayType === DAY_TYPE.WORKING ? plan.territory || null : null,
            AreaId: plan.dayType === DAY_TYPE.WORKING ? plan.area || null : null,
            Remarks: plan.remarks || null,
        }));
