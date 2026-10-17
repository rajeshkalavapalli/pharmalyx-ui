import api from "../../configurations/api-config";

export { errorMessage } from "../Engagement/index";
export { formatDate } from "../Reports/index";

const get = async (url, params) => (await api.get(url, { params })).data;
const post = async (url, body) => (await api.post(url, body)).data;
const put = async (url, body) => (await api.put(url, body)).data;

// =========================================================
// API
// =========================================================

export const getMyPermissions = async () => new Set((await get("/app/me/permissions"))?.permissions || []);

export const getToday = () => get("/app/attendance/today");
export const checkIn = (payload) => post("/app/attendance/check-in", payload);
export const checkOut = (payload) => post("/app/attendance/check-out", payload);
export const getAttendanceMonth = (month, userId) => get("/app/attendance/month", { month, userId: userId || undefined });

export const getLeave = (year, userId) => get("/app/leave", { year, userId: userId || undefined });
export const getLeaveTypes = () => get("/app/leave/types");
export const applyLeave = (payload) => post("/app/leave", payload);
export const cancelLeave = (leaveId) => post(`/app/leave/${leaveId}/cancel`);
export const reviewLeave = (leaveId, approve, remarks) => post(`/app/leave/${leaveId}/${approve ? "approve" : "reject"}`, { Remarks: remarks || null });
export const saveLeaveType = (leaveTypeId, payload) => (leaveTypeId ? put(`/app/leave/types/${leaveTypeId}`, payload) : post("/app/leave/types", payload));

export const getActivity = (userId, from, to) => get("/app/activity", { userId: userId || undefined, from, to });

export const getCycles = () => get("/app/appraisals/cycles");
export const createCycle = (payload) => post("/app/appraisals/cycles", payload);
export const closeCycle = (cycleId) => post(`/app/appraisals/cycles/${cycleId}/close`);
export const getCycle = (cycleId) => get(`/app/appraisals/cycles/${cycleId}`);
export const getAppraisal = (cycleId, userId) => get(`/app/appraisals/cycles/${cycleId}/review`, { userId: userId || undefined });
export const saveSelfReview = (cycleId, payload) => put(`/app/appraisals/cycles/${cycleId}/self`, payload);
export const saveManagerReview = (cycleId, userId, payload) => put(`/app/appraisals/cycles/${cycleId}/manager/${userId}`, payload);

// =========================================================
// GPS: resolves to the API's location payload; never rejects.
// =========================================================

export const captureLocation = () =>
    new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ LocationStatus: "UNAVAILABLE" });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) =>
                resolve({
                    LocationStatus: "CAPTURED",
                    Latitude: position.coords.latitude,
                    Longitude: position.coords.longitude,
                    Accuracy: position.coords.accuracy,
                }),
            (error) => resolve({ LocationStatus: error.code === error.PERMISSION_DENIED ? "DENIED" : "UNAVAILABLE" }),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    });

// =========================================================
// CONSTANTS
// =========================================================

export const DAY_STATUS = {
    PRESENT: { label: "Present", short: "P", color: "success" },
    ABSENT: { label: "Absent", short: "A", color: "error" },
    LEAVE: { label: "Leave", short: "L", color: "info" },
    HALF_DAY_LEAVE: { label: "Half-day leave", short: "½", color: "info" },
    WEEK_OFF: { label: "Week off", short: "W", color: "secondary" },
    TODAY: { label: "Today", short: "•", color: "primary" },
    UPCOMING: { label: "Upcoming", short: "", color: "secondary" },
};

export const LEAVE_STATUS = {
    PENDING: { label: "Pending", color: "warning" },
    APPROVED: { label: "Approved", color: "success" },
    REJECTED: { label: "Rejected", color: "error" },
    CANCELLED: { label: "Cancelled", color: "secondary" },
};

export const APPRAISAL_STATUS = {
    NOT_STARTED: { label: "Not started", color: "secondary" },
    PENDING_SELF: { label: "Self-review due", color: "warning" },
    PENDING_MANAGER: { label: "With manager", color: "submitted" },
    COMPLETED: { label: "Completed", color: "success" },
};

const pad = (value) => String(value).padStart(2, "0");
export const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const todayKey = () => toKey(new Date());
export const shiftKey = (key, days) => {
    const date = new Date(`${key}T00:00:00`);
    date.setDate(date.getDate() + days);
    return toKey(date);
};
