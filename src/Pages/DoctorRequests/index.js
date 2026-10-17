import api from "../../configurations/api-config";

export { errorMessage } from "../Engagement/index";
export { formatDate } from "../Reports/index";

const get = async (url, params) => (await api.get(url, { params })).data;
const post = async (url, body, config) => (await api.post(url, body, config)).data;

// =========================================================
// API
// =========================================================

export const getMyPermissions = async () => new Set((await get("/app/me/permissions"))?.permissions || []);

export const getOptions = () => get("/app/doctor-requests/options");
export const checkDuplicates = (payload) => post("/app/doctor-requests/check", payload);
export const uploadPhoto = (blob) => post("/app/doctor-requests/photo", blob, { headers: { "Content-Type": blob.type || "image/jpeg" } });
export const requestNewDoctor = (payload) => post("/app/doctor-requests", payload);
export const requestChange = (doctorId, payload) => post(`/app/doctor-requests/doctors/${doctorId}/change`, payload);

export const listRequests = (status) => get("/app/doctor-requests", { status: status || undefined });
export const getRequest = (requestId) => get(`/app/doctor-requests/${requestId}`);
export const cancelRequest = (requestId) => post(`/app/doctor-requests/${requestId}/cancel`);
export const resubmitRequest = (requestId, payload) => post(`/app/doctor-requests/${requestId}/resubmit`, payload);
export const decideRequest = (requestId, approve, payload) => post(`/app/doctor-requests/${requestId}/${approve ? "approve" : "reject"}`, payload);

export const listDuplicateFlags = (status) => get("/app/doctor-duplicates", { status });
export const resolveDuplicateFlag = (flagId, status, note) => post(`/app/doctor-duplicates/${flagId}/resolve`, { Status: status, Note: note });
export const scanDuplicates = () => post("/app/doctor-duplicates/scan");

// Photos need the sign-in header, so they are fetched as blobs and shown via object URLs.
export const fetchPhotoUrl = async (evidenceId) => {
    const response = await api.get(`/app/doctor-evidence/${evidenceId}`, { responseType: "blob" });
    return URL.createObjectURL(response.data);
};

// =========================================================
// LABELS
// =========================================================

export const REQUEST_TYPE = {
    CREATE: { label: "New doctor", color: "primary" },
    EDIT: { label: "Edit", color: "info" },
    DELETE: { label: "Delete", color: "error" },
};

export const REQUEST_STATUS = {
    PENDING: { label: "Waiting for manager", color: "warning" },
    APPROVED: { label: "Approved", color: "success" },
    REJECTED: { label: "Rejected", color: "error" },
    CANCELLED: { label: "Cancelled", color: "secondary" },
};

export const DUPLICATE_REASON = {
    REGISTRATION_NO: { label: "Same registration no.", color: "error" },
    PHONE: { label: "Same phone number", color: "error" },
    NAME_NEARBY: { label: "Similar name nearby", color: "warning" },
    SAME_SPOT: { label: "Same GPS spot, other area", color: "warning" },
};

export const WARNING_LABEL = {
    WEAK_GPS: "Weak GPS when the clinic was pinned",
    CLINIC_MOVED: "Clinic location changed",
};

export const FIELD_LABEL = {
    DoctorName: "Name",
    Qualification: "Qualification",
    Speciality: "Speciality",
    HospitalName: "Clinic / hospital",
    MobileNumber: "Phone",
    EmailId: "Email",
    RegistrationNumber: "Registration no.",
    Category: "Category",
    VisitsPerMonth: "Visits / month",
    TerritoryId: "Territory",
    AreaId: "Area",
    ClinicLatitude: "Clinic latitude",
    ClinicLongitude: "Clinic longitude",
    ClinicGpsAccuracy: "GPS accuracy (m)",
    CountryId: "Country",
    StateId: "State",
    DateOfBirth: "Date of birth",
    AnniversaryDate: "Anniversary",
    IsActive: "Active",
};

export const describeReason = (reason) => {
    const base = DUPLICATE_REASON[reason.reason]?.label || reason.reason;
    const parts = [base];
    if (reason.score != null) parts.push(`${Math.round(reason.score * 100)}% name match`);
    if (reason.distanceM != null) parts.push(reason.distanceM >= 1000 ? `${(reason.distanceM / 1000).toFixed(1)} km apart` : `${reason.distanceM} m apart`);
    else if (reason.reason === "NAME_NEARBY") parts.push("same area");
    return parts.join(" · ");
};

export const mapsUrl = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

// =========================================================
// VERIFICATION
// =========================================================

export const getVerificationOverview = (status) => get("/app/doctor-verification", { status: status || undefined });
export const getVerification = (verificationId) => get(`/app/doctor-verification/${verificationId}`);
export const submitVerification = (doctorId, payload) => post(`/app/doctor-verification/doctors/${doctorId}`, payload);
export const confirmJointVisit = (doctorId, remarks) => post(`/app/doctor-verification/doctors/${doctorId}/joint-visit`, { Remarks: remarks || null });
export const extendDeadline = (doctorId, days, reason) => post(`/app/doctor-verification/doctors/${doctorId}/extend`, { Days: days, Reason: reason });
export const decideVerification = (verificationId, accept, remarks) => post(`/app/doctor-verification/${verificationId}/${accept ? "accept" : "reject"}`, { Remarks: remarks || null });

export const VERIFY_METHOD = {
    REGISTRATION_NO: { label: "Registration no.", color: "primary" },
    PHONE: { label: "Phone", color: "info" },
    DOCUMENT: { label: "Pad / card photo", color: "secondary" },
    JOINT_VISIT: { label: "Joint visit", color: "success" },
};

export const VERIFY_STATUS = {
    PENDING: { label: "Waiting for manager", color: "warning" },
    ACCEPTED: { label: "Accepted", color: "success" },
    REJECTED: { label: "Rejected", color: "error" },
};

// "12 days left" / "Due today" / "5 days overdue", with a colour.
export const deadlineLabel = (daysLeft) => {
    if (daysLeft == null) return { label: "No deadline", color: "secondary" };
    if (daysLeft < 0) return { label: `${-daysLeft} day(s) overdue`, color: "error" };
    if (daysLeft === 0) return { label: "Due today", color: "error" };
    return { label: `${daysLeft} day(s) left`, color: daysLeft <= 7 ? "warning" : "info" };
};
