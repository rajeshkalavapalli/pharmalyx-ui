import api from "../../configurations/api-config";

export { errorMessage } from "../Engagement/index";
export { captureLocation } from "../Visits/index";

const get = async (url, params) => (await api.get(url, { params })).data;
const post = async (url, body) => (await api.post(url, body)).data;
const put = async (url, body) => (await api.put(url, body)).data;

// MR's day
export const getConsent = () => get("/app/work/consent");
export const acceptConsent = () => post("/app/work/consent", { Accept: true });
export const startDay = (location) => post("/app/work/day/start", { Location: location });
export const getToday = () => get("/app/work/today");
export const checkIn = (doctorId, location) => post("/app/work/check-in", { DoctorId: doctorId, Location: location });
export const sendPings = (points) => post("/app/work/pings", { Points: points, Source: "WEB" });
export const getMonthPlan = (month, userId) => get("/app/work/plan", { month, userId: userId || undefined });
export const getCoverage = (month, userId) => get("/app/work/coverage", { month, userId: userId || undefined });
export const getPeople = () => get("/app/work/people");
export const getDoctorsOf = (userId) => get("/app/work/doctors", { userId });

// Standard tour plan
export const getStp = (userId) => get("/app/stp", { userId: userId || undefined });
export const saveStp = (payload) => put("/app/stp", payload);
export const submitStp = (stpId) => post(`/app/stp/${stpId}/submit`);
export const withdrawStp = (stpId) => post(`/app/stp/${stpId}/withdraw`);
export const getSubmittedStps = () => get("/app/stp/submitted");
export const decideStp = (stpId, approve, remarks) => post(`/app/stp/${stpId}/${approve ? "approve" : "return"}`, { Remarks: remarks || null });
export const generateMonth = (month) => post("/app/stp/generate", { Month: month });

// Review and head office
export const getWorkVisits = (params) => get("/app/work/visits", params);
export const overrideVisit = (visitId, validity, reason) => post(`/app/work/visits/${visitId}/override`, { Validity: validity, Reason: reason });
export const getFlags = (status) => get("/app/work/flags", { status: status || undefined });
export const actOnFlag = (flagId, status, note) => post(`/app/work/flags/${flagId}`, { Status: status, Note: note || null });
export const getSettings = () => get("/app/work/settings");
export const saveSettings = (values, reason) => put("/app/work/settings", { Values: values, Reason: reason });
export const getBoundaries = () => get("/app/work/boundaries");
export const draftBoundary = (userId, payload) => post(`/app/work/boundaries/users/${userId}`, payload);
export const approveBoundary = (boundaryId, remarks) => post(`/app/work/boundaries/${boundaryId}/approve`, { Remarks: remarks || null });
export const getExceptions = () => get("/app/work/exceptions");
export const grantException = (payload) => post("/app/work/exceptions", payload);
export const revokeException = (exceptionId, reason) => post(`/app/work/exceptions/${exceptionId}/revoke`, { Reason: reason });
export const getHospitals = () => get("/app/work/hospitals");
export const saveHospital = (hospitalId, payload) => (hospitalId ? put(`/app/work/hospitals/${hospitalId}`, payload) : post("/app/work/hospitals", payload));
export const getHospitalDoctors = (hospitalId, areaId) => get(`/app/work/hospitals/${hospitalId}/doctors`, { areaId: areaId || undefined });
export const setHospitalDoctors = (hospitalId, add, remove) => post(`/app/work/hospitals/${hospitalId}/doctors`, { Add: add, Remove: remove });

// Samples
export const getReconciliation = (userId) => get("/app/stock/reconciliation", { userId: userId || undefined });
export const recordCount = (userId, counts, remarks) => post("/app/stock/counts", { UserId: userId, Counts: counts, Remarks: remarks || null });

// Counted / needs a look (still counts) / not counted.
export const VALIDITY = {
    VALID: { label: "Counted", color: "success" },
    REVIEW: { label: "Counted · needs a look", color: "warning" },
    INVALID: { label: "Not counted", color: "error" },
    UNCHECKED: { label: "Before verification", color: "secondary" },
};

export const validityOf = (visit) => VALIDITY[visit?.FinalValidity] || VALIDITY.UNCHECKED;

// Visit explanations: the employee explains; the manager or head office decides.
export const explainVisit = (visitId, reason) => post(`/app/work/visits/${visitId}/explain`, { Reason: reason });
export const EXPLANATION_STATUS = {
    PENDING: { label: "Explained · waiting for your manager", color: "info" },
    ACCEPTED: { label: "Explanation accepted", color: "success" },
    REJECTED: { label: "Explanation rejected", color: "error" },
};

export const PATCH_TYPES = [
    { value: "HQ", label: "HQ", color: "primary" },
    { value: "EX_HQ", label: "Ex-HQ", color: "info" },
    { value: "OUTSTATION", label: "Outstation", color: "warning" },
];

export const patchLabel = (type) => PATCH_TYPES.find((item) => item.value === type)?.label || "Not set";

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const FLAG_LABEL = {
    DAY_START_OUTSIDE: "Day started outside territory",
    VISIT_OUTSIDE_TERRITORY: "Visit outside territory",
    DRIVE_BY: "Drive-by check-in",
    OUTSIDE_GEOFENCE: "Away from clinic",
    SAME_SPOT: "Many clinics, one spot",
    IMPOSSIBLE_TRAVEL: "Impossible travel",
    MOCK_GPS: "Fake GPS",
    NO_GPS: "No GPS",
    POB_INFLATED: "Inflated order quantity",
    POB_FIRST_LARGE: "Large first order",
    POB_NO_REORDER: "Large order, no reorder",
    POB_MONTH_END_SPIKE: "Month-end order spike",
    POB_DUPLICATE_SLIP: "Same slip photo reused",
    POB_UNSUPPLIED: "POB not supplied in time",
    STOCK_HELD_LONG: "MR holding stock too long",
    SPEND_PRIOR_FAILED: "Spend request: earlier claim failed",
};

export const EXCEPTION_TYPES = [
    { value: "DOCTOR", label: "Doctor just outside the boundary" },
    { value: "COVER", label: "Leave cover (colleague's territory)" },
    { value: "SPECIAL_DUTY", label: "Special duty (work anywhere)" },
];

export const thisMonth = () => new Date().toISOString().slice(0, 7);

export const formatClock = (value) => (value ? new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—");

export const formatDwell = (seconds) => (seconds == null ? "—" : `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, "0")} s`);

export const formatDay = (value) => (value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" }) : "—");

// Is now inside work hours (IST)?
export const inWorkHours = (startHour, endHour, now = new Date()) => {
    const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
    const hour = ist.getHours() + ist.getMinutes() / 60;
    return hour >= startHour && hour < endHour;
};
