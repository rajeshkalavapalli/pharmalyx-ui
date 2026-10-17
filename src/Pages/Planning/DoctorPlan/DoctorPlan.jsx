import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert, Box, Button, Divider, Stack, Typography } from "@mui/material";
import {
    AssignmentTurnedInRounded,
    EditNoteRounded,
    EventAvailableRounded,
    MedicalServicesRounded,
    ReceiptLongRounded,
    SendRounded,
} from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import MonthSwitcher from "../../../components/MonthSwitcher/MonthSwitcher";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../../components/StatCard/StatCard";
import StatusChip from "../../../components/StatusChip/StatusChip";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import Achievement from "../Achievement";
import {
    PLAN_STATUS,
    errorMessage,
    formatDate,
    formatMonthLabel,
    formatUnits,
    getDoctorPlan,
    getDoctorPlanReviews,
    monthKey,
    submitDoctorPlan,
} from "../index";
import DoctorPlanDialog from "./DoctorPlanDialog";
import PlanReviewDialog from "./PlanReviewDialog";

const FILTERS = [
    { value: "ALL", label: "All doctors", test: () => true },
    { value: "PLANNED", label: "In plan", test: (doctor) => doctor.planned },
    { value: "UNPLANNED", label: "Not planned", test: (doctor) => !doctor.planned },
];

function DoctorRow({ doctor, canEdit, onEdit }) {
    return (
        <Stack direction={{ xs: "column", lg: "row" }} sx={{ py: 1.5, gap: 2, alignItems: { lg: "center" } }}>
            <Box sx={{ flex: 1.3, minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography variant="subtitle2" noWrap>
                        Dr. {doctor.DoctorName}
                    </Typography>
                    <CategoryBadge category={doctor.Category} />
                </Stack>
                <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {[doctor.Speciality, doctor.AreaName, doctor.support].filter(Boolean).join(" · ") || "—"}
                </Typography>
                {doctor.products.some((item) => item.plannedUnits > 0) && (
                    <Stack direction="row" sx={{ gap: 0.5, flexWrap: "wrap", mt: 0.75 }}>
                        {doctor.products
                            .filter((item) => item.plannedUnits > 0)
                            .map((item) => (
                                <Tag key={item.ProductId} label={`${item.ProductName} ${formatUnits(item.rxUnits)}/${formatUnits(item.plannedUnits)}`} color={item.rxUnits >= item.plannedUnits ? "success" : "secondary"} />
                            ))}
                    </Stack>
                )}
            </Box>

            {doctor.planned ? (
                <>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            Visits
                        </Typography>
                        <Achievement actual={doctor.actualVisits} planned={doctor.plannedVisits} percent={doctor.plannedVisits ? Math.round((doctor.actualVisits / doctor.plannedVisits) * 100) : null} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            Rx units (RCPA){doctor.pobUnits ? ` · POB ${formatUnits(doctor.pobUnits)}` : ""}
                        </Typography>
                        <Achievement actual={doctor.rxUnits} planned={doctor.plannedUnits} percent={doctor.achievement} format={formatUnits} />
                    </Box>
                </>
            ) : (
                <Typography variant="body2" sx={(theme) => ({ flex: 2, color: theme.palette.text.secondary })}>
                    Not in this month's plan{doctor.actualVisits ? ` · ${doctor.actualVisits} visit(s) made` : ""}
                </Typography>
            )}

            {canEdit && (
                <Button variant={doctor.planned ? "outlined" : "contained"} size="small" startIcon={<EditNoteRounded />} onClick={onEdit} sx={(theme) => ({ minWidth: theme.engagement.quantityColumn })}>
                    {doctor.planned ? "Edit" : "Plan"}
                </Button>
            )}
        </Stack>
    );
}

// Product-wise Rx plan per doctor for the month, approved by the manager, with achievement.
function DoctorPlan() {
    const { showSnackbar } = useSnackbar();

    const [month, setMonth] = useState(monthKey());
    const [tab, setTab] = useState("mine");
    const [filter, setFilter] = useState("ALL");
    const [data, setData] = useState(null);
    const [reviews, setReviews] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [editing, setEditing] = useState(null);
    const [confirmSubmit, setConfirmSubmit] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [reviewId, setReviewId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const plan = await getDoctorPlan(month);
            setData(plan);

            // Only managers allowed to approve get a review queue; a 403 just hides it.
            if (plan.hasTeam) setReviews(await getDoctorPlanReviews().then((response) => response.reviews).catch(() => null));
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load the doctor plan"));
        } finally {
            setLoading(false);
        }
    }, [month]);

    useEffect(() => {
        load();
    }, [load]);

    const doctors = useMemo(() => {
        const test = (FILTERS.find((item) => item.value === filter) || FILTERS[0]).test;
        return (data?.doctors || []).filter(test);
    }, [data, filter]);

    const handleSubmit = async () => {
        setSubmitting(true);

        try {
            const response = await submitDoctorPlan(data.month);
            showSnackbar(response?.message || "Plan submitted", "success");
            setConfirmSubmit(false);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to submit the plan"), "error");
        } finally {
            setSubmitting(false);
        }
    };

    const summary = data?.summary;
    const status = data ? PLAN_STATUS[data.status] : null;
    const canReview = Array.isArray(reviews);
    const all = data?.doctors || [];

    return (
        <Box>
            <PageHeader
                eyebrow="Planning · Doctor business plan"
                title={tab === "reviews" ? "Team plans to review" : "Doctor business plan"}
                subtitle="Plan each doctor's visits and prescriptions per product for the month. Achievement comes from your visits, RCPA and POB."
                actions={
                    <>
                        {canReview && (
                            <SegmentedControl
                                value={tab}
                                onChange={setTab}
                                options={[
                                    { value: "mine", label: "My plan" },
                                    { value: "reviews", label: `Team reviews · ${reviews.length}` },
                                ]}
                            />
                        )}
                        {tab === "mine" && <MonthSwitcher month={month} onChange={setMonth} allowFuture />}
                        {tab === "mine" && data?.canSubmit && (
                            <Button variant="contained" startIcon={<SendRounded />} onClick={() => setConfirmSubmit(true)}>
                                Submit plan
                            </Button>
                        )}
                    </>
                }
            />

            {tab === "reviews" && canReview ? (
                <Panel title="Waiting for your review" subtitle={`${reviews.length} plan(s) from your team`}>
                    {reviews.length ? (
                        <Stack divider={<Divider />}>
                            {reviews.map((review) => (
                                <Stack key={review.PlanId} direction={{ xs: "column", sm: "row" }} sx={{ py: 1.5, gap: 1.5, alignItems: { sm: "center" } }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="subtitle2">
                                            {review.UserName} · {formatMonthLabel(review.PlanMonth)}
                                        </Typography>
                                        <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {review.Doctors} doctor(s) · {formatUnits(review.PlannedVisits)} visits · {formatUnits(review.PlannedUnits)} Rx units · submitted {formatDate(review.SubmittedOn)}
                                        </Typography>
                                    </Box>
                                    <Button variant="contained" size="small" onClick={() => setReviewId(review.PlanId)}>
                                        Review
                                    </Button>
                                </Stack>
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState icon={AssignmentTurnedInRounded} title="All caught up" message="No doctor plans are waiting for your review." />
                    )}
                </Panel>
            ) : error ? (
                <LoadError title="Couldn't load the doctor plan" message={error} onRetry={load} />
            ) : (
                <Stack spacing={2} sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}>
                    {data?.status === "RETURNED" && data.plan?.ReviewRemarks && (
                        <Alert severity="error" variant="outlined">
                            Returned by your manager: {data.plan.ReviewRemarks}
                        </Alert>
                    )}

                    <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                        <StatCard
                            icon={MedicalServicesRounded}
                            label="Doctors in plan"
                            value={summary ? `${summary.planned}/${summary.doctors}` : "—"}
                            caption="Assigned doctors planned"
                            color="primary"
                            progress={summary?.doctors ? Math.round((summary.planned / summary.doctors) * 100) : 0}
                        />
                        <StatCard
                            icon={EventAvailableRounded}
                            label="Visits"
                            value={summary ? `${formatUnits(summary.actualVisits)}/${formatUnits(summary.plannedVisits)}` : "—"}
                            caption={summary?.visitPercent == null ? "No visits planned" : `${summary.visitPercent}% of planned visits`}
                            color="info"
                            progress={Math.min(100, summary?.visitPercent ?? 0)}
                        />
                        <StatCard
                            icon={ReceiptLongRounded}
                            label="Rx units (RCPA)"
                            value={summary ? `${formatUnits(summary.rxUnits)}/${formatUnits(summary.plannedUnits)}` : "—"}
                            caption={summary?.rxPercent == null ? "No Rx planned" : `${summary.rxPercent}% of planned Rx`}
                            color="success"
                            progress={Math.min(100, summary?.rxPercent ?? 0)}
                        />
                        <StatCard icon={ReceiptLongRounded} label="POB units" value={summary ? formatUnits(summary.pobUnits) : "—"} caption="Ordered by planned doctors" color="warning" />
                    </Box>

                    <Panel
                        title={`Doctors · ${formatMonthLabel(data?.month || `${month}-01`)}`}
                        subtitle={data?.blockedReason || "Plan your key doctors, then submit the plan for your manager's approval."}
                        actions={status && <StatusChip label={status.label} color={status.color} />}
                    >
                        <Box sx={{ maxWidth: "100%", overflowX: "auto", mb: 1 }}>
                            <SegmentedControl value={filter} onChange={setFilter} options={FILTERS.map((item) => ({ value: item.value, label: `${item.label} · ${all.filter(item.test).length}` }))} />
                        </Box>

                        {doctors.length ? (
                            <Stack divider={<Divider />}>
                                {doctors.map((doctor) => (
                                    <DoctorRow key={doctor.DoctorId} doctor={doctor} canEdit={data.canEdit} onEdit={() => setEditing(doctor)} />
                                ))}
                            </Stack>
                        ) : (
                            <EmptyState
                                icon={MedicalServicesRounded}
                                title={loading ? "Loading…" : all.length ? "No doctors in this view" : "No doctors assigned"}
                                message={loading || all.length ? "" : "Ask your administrator to map doctors to you in Configuration."}
                            />
                        )}
                    </Panel>
                </Stack>
            )}

            {editing && data && (
                <DoctorPlanDialog
                    doctor={editing}
                    month={data.month}
                    products={data.products}
                    limits={data.limits}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        load();
                    }}
                />
            )}

            {confirmSubmit && (
                <ConfirmActionDialog
                    icon={SendRounded}
                    title="Submit this plan?"
                    message={`${summary.planned} doctor(s), ${formatUnits(summary.plannedVisits)} visits and ${formatUnits(summary.plannedUnits)} Rx units. You can't change it unless your manager returns it.`}
                    confirmLabel="Submit"
                    busy={submitting}
                    onClose={() => setConfirmSubmit(false)}
                    onConfirm={handleSubmit}
                />
            )}

            {reviewId && (
                <PlanReviewDialog
                    planId={reviewId}
                    onClose={() => setReviewId(null)}
                    onReviewed={() => {
                        setReviewId(null);
                        load();
                    }}
                />
            )}
        </Box>
    );
}

export default DoctorPlan;
