import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import useActingUser from "../../components/ActingUserSelect/useActingUser";
import {
    DAY_TYPE,
    addMonths,
    approveTourPlan,
    copyByWeekdayPattern,
    daysOfMonth,
    detailsToPlans,
    getCurrentUserId,
    getTerritories,
    getTourPlan,
    getTourPlanHistory,
    isDayComplete,
    monthStartOf,
    plansToDetails,
    rejectTourPlan,
    saveTourPlan,
    todayKey,
    weekdayIndex,
} from "./index";

const EMPTY_META = {
    planId: null,
    status: "NEW",
    canEdit: false,
    canApprove: false,
    ownerUserId: null,
    createdOn: null,
    submittedOn: null,
    reviewedOn: null,
    reviewedByName: null,
    reviewRemarks: null,
};

// The API puts a friendly text in `message` and the underlying cause in `error`.
const errorMessage = (error, fallback) => {
    const data = error.response?.data;
    const message = data?.message || error.message || fallback;

    return data?.error && data.error !== message ? `${message} (${data.error})` : message;
};

// Stable fingerprint of a plan map, used to detect unsaved changes.
const fingerprint = (plans) =>
    JSON.stringify(
        Object.keys(plans)
            .sort()
            .map((key) => {
                const plan = plans[key];
                return [key, plan.dayType, plan.territory, plan.area, plan.remarks];
            })
    );

function useTourPlan() {
    const { showSnackbar } = useSnackbar();

    // The snackbar function is not memoised by its provider; keep the latest in a ref
    // so the loaders below stay stable.
    const notifyRef = useRef(showSnackbar);

    useEffect(() => {
        notifyRef.current = showSnackbar;
    }, [showSnackbar]);

    const notify = useCallback((message, severity) => notifyRef.current(message, severity), []);

    // A manager opens a team member's plan with ?userId=<member>.
    const [searchParams] = useSearchParams();
    const viewUserId = searchParams.get("userId") || undefined;

    const { actingUserId, setActingUserId, users } = useActingUser();

    const monthParam = searchParams.get("month");
    const [month, setMonth] = useState(() =>
        /^\d{4}-\d{2}$/.test(monthParam || "") ? `${monthParam}-01` : monthStartOf(todayKey())
    );
    const [owner, setOwner] = useState(null);
    const [history, setHistory] = useState([]);
    const [plans, setPlans] = useState({});
    const [savedPlans, setSavedPlans] = useState({});
    const [meta, setMeta] = useState(EMPTY_META);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [busy, setBusy] = useState(false);
    const [territories, setTerritories] = useState([]);

    // =========================================================
    // REFERENCE DATA
    // =========================================================

    useEffect(() => {
        getTerritories()
            .then((response) =>
                setTerritories(Array.isArray(response?.territories) ? response.territories : [])
            )
            .catch(() => setTerritories([]));
    }, []);

    // =========================================================
    // LOAD PLAN
    // =========================================================

    const requestRef = useRef(0);

    const loadPlan = useCallback(
        async (targetMonth) => {
            const requestId = ++requestRef.current;
            const isCurrent = () => requestId === requestRef.current;

            setLoading(true);
            setLoadError("");

            try {
                const { plan, owner: planOwner } = await getTourPlan(targetMonth, viewUserId);

                if (!isCurrent()) return;

                setOwner(planOwner || null);

                if (!plan) {
                    const self = getCurrentUserId();

                    setPlans({});
                    setSavedPlans({});
                    setMeta({
                        ...EMPTY_META,
                        canEdit: !viewUserId || viewUserId === self,
                        ownerUserId: viewUserId || self,
                    });
                    return;
                }

                const loaded = detailsToPlans(plan.details);

                setPlans(loaded);
                setSavedPlans(loaded);
                setMeta({
                    planId: plan.TourPlanId,
                    status: plan.Status || "DRAFT",
                    canEdit: Boolean(plan.canEdit),
                    canApprove: Boolean(plan.canApprove),
                    ownerUserId: plan.UserId,
                    createdOn: plan.CreatedOn,
                    submittedOn: plan.SubmittedOn,
                    reviewedOn: plan.ReviewedOn,
                    reviewedByName: plan.ReviewedByName,
                    reviewRemarks: plan.ReviewRemarks,
                });
            } catch (error) {
                if (!isCurrent()) return;

                setPlans({});
                setSavedPlans({});
                setMeta(EMPTY_META);
                setOwner(null);
                setLoadError(errorMessage(error, "Unable to load tour plan"));
            } finally {
                if (isCurrent()) {
                    setLoading(false);
                }
            }
        },
        [viewUserId]
    );

    const loadHistory = useCallback(() => {
        getTourPlanHistory(viewUserId)
            .then((response) => setHistory(response?.history || []))
            .catch(() => setHistory([]));
    }, [viewUserId]);

    useEffect(() => {
        if (actingUserId) {
            loadPlan(month);
            loadHistory();
            return;
        }

        requestRef.current += 1;
        setPlans({});
        setSavedPlans({});
        setMeta(EMPTY_META);
        setLoadError("");
        setLoading(false);
    }, [month, actingUserId, loadPlan, loadHistory]);

    // =========================================================
    // DERIVED
    // =========================================================

    const monthDays = useMemo(() => daysOfMonth(month), [month]);

    const isDirty = useMemo(() => fingerprint(plans) !== fingerprint(savedPlans), [plans, savedPlans]);

    const summary = useMemo(() => {
        let working = 0;
        let off = 0;
        let complete = 0;
        const territoryIds = new Set();

        monthDays.forEach((key) => {
            const plan = plans[key];

            if (!plan) return;

            if (plan.dayType === DAY_TYPE.OFF) {
                off += 1;
            } else {
                working += 1;

                if (plan.territory) {
                    territoryIds.add(plan.territory);
                }
            }

            if (isDayComplete(plan)) {
                complete += 1;
            }
        });

        return {
            totalDays: monthDays.length,
            planned: complete,
            remaining: monthDays.length - complete,
            working,
            off,
            territories: territoryIds.size,
            isComplete: complete === monthDays.length,
        };
    }, [plans, monthDays]);

    const ownerName = owner?.Name || users.find((user) => user.id === meta.ownerUserId)?.name || "";

    // =========================================================
    // LOCAL EDITS
    // =========================================================

    const applyToDays = (dates, plan) =>
        setPlans((previous) => {
            const next = { ...previous };
            dates.forEach((date) => {
                next[date] = { ...plan };
            });
            return next;
        });

    const clearDays = (dates) =>
        setPlans((previous) => {
            const next = { ...previous };
            dates.forEach((date) => delete next[date]);
            return next;
        });

    const clearMonth = () => clearDays(monthDays);

    // Fills only unplanned days, so existing choices are never overwritten.
    const markWeekdaysOff = (weekdays, label) => {
        const targets = monthDays.filter(
            (key) => !plans[key] && weekdays.includes(weekdayIndex(key))
        );

        if (targets.length === 0) {
            notify(`No unplanned ${label} left this month`, "info");
            return;
        }

        applyToDays(targets, {
            dayType: DAY_TYPE.OFF,
            territory: "",
            area: "",
            territoryName: "",
            areaName: "",
            remarks: "",
        });

        notify(`${targets.length} ${label} marked as off`, "success");
    };

    const copyPreviousMonth = async () => {
        const previousMonth = addMonths(month, -1);

        setBusy(true);

        try {
            const { plan } = await getTourPlan(previousMonth, viewUserId);

            if (!plan || plan.details.length === 0) {
                notify("There is no plan for the previous month to copy", "info");
                return;
            }

            const copied = copyByWeekdayPattern(detailsToPlans(plan.details), previousMonth, month);
            const targets = Object.keys(copied).filter((key) => !plans[key]);

            if (targets.length === 0) {
                notify("All matching days are already planned", "info");
                return;
            }

            setPlans((previous) => {
                const next = { ...previous };
                targets.forEach((key) => {
                    next[key] = copied[key];
                });
                return next;
            });

            notify(`Copied ${targets.length} days from last month by weekday`, "success");
        } catch (error) {
            notify(errorMessage(error, "Unable to copy the previous month"), "error");
        } finally {
            setBusy(false);
        }
    };

    // =========================================================
    // SERVER ACTIONS
    // =========================================================

    const runAction = async (action, fallbackMessage) => {
        setBusy(true);

        try {
            const response = await action();

            notify(response?.message || fallbackMessage, "success");
            await loadPlan(month);
            loadHistory();

            return true;
        } catch (error) {
            notify(errorMessage(error, "Tour plan action failed"), "error");
            return false;
        } finally {
            setBusy(false);
        }
    };

    const save = (submit) =>
        runAction(
            () =>
                saveTourPlan({
                    PlanMonth: month,
                    Submit: submit,
                    details: plansToDetails(plans, month),
                }),
            submit ? "Tour plan saved. No manager approval is needed inside your territory." : "Tour plan saved"
        );

    const approve = (remarks) =>
        runAction(() => approveTourPlan(meta.planId, remarks), "Tour plan approved");

    const reject = (remarks) =>
        runAction(() => rejectTourPlan(meta.planId, remarks), "Tour plan returned for changes");

    return {
        viewUserId,
        owner,
        history,
        actingUserId,
        setActingUserId,
        users,
        ownerName,

        month,
        setMonth,
        monthDays,
        plans,
        meta,
        summary,
        territories,

        loading,
        loadError,
        reload: () => loadPlan(month),
        busy,
        isDirty,

        applyToDays,
        clearDays,
        clearMonth,
        markWeekdaysOff,
        copyPreviousMonth,

        saveDraft: () => save(false),
        submit: () => save(true),
        approve,
        reject,
    };
}

export default useTourPlan;
