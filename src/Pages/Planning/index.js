import api from "../../configurations/api-config";

export { errorMessage, formatDate, formatMoneyCompact, monthKey } from "../Engagement/index";
export { formatAmount, formatMonthLabel, formatUnits } from "../Sales/index";

const get = async (url, params) => (await api.get(url, { params })).data;
const post = async (url, body) => (await api.post(url, body)).data;
const put = async (url, body) => (await api.put(url, body)).data;

// =========================================================
// SALES PLAN
// =========================================================

export const getSalesPlan = (month, userId) => get("/app/plans/sales", { month, userId });
export const getSalesTeam = (month) => get("/app/plans/sales/team", { month });
export const getTargetForm = (userId, month) => get("/app/plans/sales/targets", { userId, month });
export const saveTargets = (payload) => put("/app/plans/sales/targets", payload);

// =========================================================
// DOCTOR BUSINESS PLAN
// =========================================================

export const getDoctorPlan = (month, userId) => get("/app/plans/doctors", { month, userId });
export const saveDoctorPlan = (payload) => put("/app/plans/doctors/item", payload);
export const submitDoctorPlan = (month) => post("/app/plans/doctors/submit", { Month: month });
export const getDoctorPlanReviews = () => get("/app/plans/doctors/reviews");
export const getDoctorPlanById = (planId) => get(`/app/plans/doctors/${planId}`);
export const reviewDoctorPlan = (planId, outcome, remarks) =>
    post(`/app/plans/doctors/${planId}/${outcome === "APPROVED" ? "approve" : "return"}`, { Remarks: remarks || null });

export const PLAN_STATUS = {
    NOT_STARTED: { label: "Not started", color: "secondary" },
    DRAFT: { label: "Draft", color: "secondary" },
    SUBMITTED: { label: "Sent for review", color: "submitted" },
    APPROVED: { label: "Approved", color: "success" },
    RETURNED: { label: "Returned", color: "error" },
};

// Achievement colour: on track, close, behind. `null` means there is no target.
export const achievementColor = (percent) => {
    if (percent == null) return "secondary";
    if (percent >= 100) return "success";
    if (percent >= 70) return "warning";
    return "error";
};
