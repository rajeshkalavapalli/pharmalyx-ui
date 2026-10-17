import { CheckRounded, CurrencyRupeeRounded, HourglassTopRounded, SendRounded, UndoRounded, VerifiedRounded } from "@mui/icons-material";

import api from "../../configurations/api-config";

export { errorMessage, formatDate, formatMoneyCompact, monthKey } from "../Engagement/index";
export { formatAmount, formatMonthLabel } from "../Sales/index";

const get = async (url, params) => (await api.get(url, { params })).data;
const post = async (url, body) => (await api.post(url, body)).data;
const put = async (url, body) => (await api.put(url, body)).data;
const del = async (url, params) => (await api.delete(url, { params })).data;

// =========================================================
// API
// =========================================================

export const getMyClaim = (month) => get("/app/expenses", { month });
export const saveDay = (month, day) => put("/app/expenses/days", { Month: month, Days: [day] });
export const addExpenseItem = (payload) => post("/app/expenses/items", payload);
export const deleteExpenseItem = (itemId, month) => del(`/app/expenses/items/${itemId}`, { month });
export const submitClaim = (month) => post("/app/expenses/submit", { Month: month });

export const getClaim = (claimId) => get(`/app/expenses/claims/${claimId}`);
export const getClaimReviews = () => get("/app/expenses/reviews");
export const managerApprove = (claimId, payload) => post(`/app/expenses/claims/${claimId}/manager-approve`, payload);
export const returnClaim = (claimId, remarks) => post(`/app/expenses/claims/${claimId}/return`, { Remarks: remarks });

export const getFinanceClaims = (status) => get("/app/expenses/finance", { status });
export const finalApprove = (claimId, remarks) => post(`/app/expenses/claims/${claimId}/final-approve`, { Remarks: remarks || null });
export const markPaid = (claimId, paymentRef) => post(`/app/expenses/claims/${claimId}/mark-paid`, { PaymentRef: paymentRef });

export const getRates = () => get("/app/expenses/rates");
export const saveRate = (designationId, payload) => put(`/app/expenses/rates/${designationId}`, payload);

// =========================================================
// CONSTANTS
// =========================================================

export const CLAIM_STATUS = {
    NOT_STARTED: { label: "Not started", color: "secondary" },
    DRAFT: { label: "Draft", color: "secondary" },
    SUBMITTED: { label: "With manager", color: "submitted" },
    MANAGER_APPROVED: { label: "With finance", color: "info" },
    APPROVED: { label: "Approved for payment", color: "primary" },
    PAID: { label: "Paid", color: "success" },
    RETURNED: { label: "Returned", color: "error" },
};

export const STATIONS = [
    { value: "HQ", label: "HQ" },
    { value: "EX_HQ", label: "Ex-HQ" },
    { value: "OUTSTATION", label: "Outstation" },
];

export const TRAVEL_LABEL = { BIKE: "Bike", CAR: "Car", BUS: "Bus", TRAIN: "Train", AUTO: "Auto", OTHER: "Other" };

export const RATE_FIELDS = [
    { key: "DaHq", label: "DA at HQ", group: "da" },
    { key: "DaExHq", label: "DA Ex-HQ", group: "da" },
    { key: "DaOutstation", label: "DA outstation", group: "da" },
    { key: "KmBike", label: "Bike / km", group: "km" },
    { key: "KmCar", label: "Car / km", group: "km" },
    { key: "KmBus", label: "Bus / km", group: "km" },
    { key: "KmTrain", label: "Train / km", group: "km" },
    { key: "KmAuto", label: "Auto / km", group: "km" },
    { key: "KmOther", label: "Other / km", group: "km" },
];

const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

const rupees = (value) => (value == null ? "" : `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

// Claim progress for the shared Timeline: submitted → manager → finance → paid.
export const claimSteps = (claim) => {
    if (!claim || !claim.SubmittedOn) return [];

    const status = claim.Status;
    const steps = [{ key: "submitted", icon: SendRounded, title: "Submitted", caption: formatDateTime(claim.SubmittedOn), state: "done", color: "primary" }];
    const returnedByManager = status === "RETURNED" && claim.ManagerReviewedOn && !claim.FinanceReviewedOn;
    const returnedByFinance = status === "RETURNED" && claim.FinanceReviewedOn;

    if (status === "SUBMITTED") {
        steps.push({ key: "manager", icon: HourglassTopRounded, title: "Manager review", caption: "Waiting for a decision", state: "current", color: "warning" });
    } else if (claim.ManagerReviewedOn) {
        steps.push({
            key: "manager",
            icon: returnedByManager ? UndoRounded : CheckRounded,
            title: returnedByManager ? "Returned by manager" : `Manager approved ${rupees(claim.ApprovedAmount)}`,
            caption: [claim.ManagerReviewedByName, formatDateTime(claim.ManagerReviewedOn)].filter(Boolean).join(" · "),
            note: claim.ManagerRemarks,
            state: returnedByManager ? "current" : "done",
            color: returnedByManager ? "error" : "success",
        });
    }

    if (status === "MANAGER_APPROVED") {
        steps.push({ key: "finance", icon: HourglassTopRounded, title: "Finance approval", caption: "Waiting for final approval", state: "current", color: "warning" });
    } else if (claim.FinanceReviewedOn) {
        steps.push({
            key: "finance",
            icon: returnedByFinance ? UndoRounded : VerifiedRounded,
            title: returnedByFinance ? "Returned by finance" : "Approved for payment",
            caption: [claim.FinanceReviewedByName, formatDateTime(claim.FinanceReviewedOn)].filter(Boolean).join(" · "),
            note: claim.FinanceRemarks,
            state: returnedByFinance ? "current" : "done",
            color: returnedByFinance ? "error" : "success",
        });
    }

    if (status === "APPROVED") {
        steps.push({ key: "paid", icon: HourglassTopRounded, title: "Payment", caption: "Waiting to be paid", state: "current", color: "warning" });
    } else if (status === "PAID") {
        steps.push({ key: "paid", icon: CurrencyRupeeRounded, title: "Paid", caption: [claim.PaymentRef, formatDateTime(claim.PaidOn)].filter(Boolean).join(" · "), state: "done", color: "success" });
    }

    return steps;
};
