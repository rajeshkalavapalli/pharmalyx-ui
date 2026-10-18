import { useCallback, useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Divider,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    AddRounded,
    AssignmentTurnedInRounded,
    DeleteOutlineRounded,
    DirectionsBikeRounded,
    ReceiptLongRounded,
    RestaurantRounded,
    SendRounded,
    WalletRounded,
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
import Timeline from "../../../components/Timeline/Timeline";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import ClaimDialog from "../components/ClaimDialog";
import ItemDialog from "../components/ItemDialog";
import {
    CLAIM_STATUS,
    STATIONS,
    TRAVEL_LABEL,
    addExpenseItem,
    claimSteps,
    deleteExpenseItem,
    errorMessage,
    formatAmount,
    formatDate,
    formatMonthLabel,
    getClaimReviews,
    getMyClaim,
    monthKey,
    submitClaim,
} from "../index";

// The MR's monthly TA / DA claim, plus the manager's review queue.
function MyClaim() {
    const { showSnackbar } = useSnackbar();

    const [month, setMonth] = useState(monthKey());
    const [tab, setTab] = useState("mine");
    const [data, setData] = useState(null);
    const [reviews, setReviews] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [itemOpen, setItemOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [removing, setRemoving] = useState(null);
    const [confirmSubmit, setConfirmSubmit] = useState(false);
    const [reviewId, setReviewId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const claim = await getMyClaim(month);
            setData(claim);

            // Only managers allowed to approve get a review queue; a 403 just hides it.
            if (claim.hasTeam) setReviews(await getClaimReviews().then((response) => response.reviews).catch(() => null));
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load your claim"));
        } finally {
            setLoading(false);
        }
    }, [month]);

    useEffect(() => {
        load();
    }, [load]);

    const handleAddItem = async (payload) => {
        setSaving(true);

        try {
            const response = await addExpenseItem({ ...payload, Month: data.month });
            showSnackbar(response?.message || "Expense added", "success");
            setItemOpen(false);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to add the expense"), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        setSaving(true);

        try {
            await deleteExpenseItem(removing.ItemId, data.month);
            showSnackbar("Expense removed", "success");
            setRemoving(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to remove the expense"), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        setSaving(true);

        try {
            const response = await submitClaim(data.month);
            showSnackbar(response?.message || "Claim submitted", "success");
            setConfirmSubmit(false);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to submit the claim"), "error");
        } finally {
            setSaving(false);
        }
    };

    const totals = data?.totals;
    const status = data ? CLAIM_STATUS[data.status] : null;
    const canReview = Array.isArray(reviews);
    const remaining = data?.otherLimit == null ? null : Math.max(0, Math.round((data.otherLimit - totals.other) * 100) / 100);
    const returnedNote = data?.status === "RETURNED" ? data.claim?.FinanceRemarks || data.claim?.ManagerRemarks : null;
    const steps = claimSteps(data?.claim);

    return (
        <Box>
            <PageHeader
                eyebrow="Expenses · TA / DA"
                title={tab === "reviews" ? "Team claims to review" : "My expense claim"}
                subtitle="TA and DA come from verified work: distance actually travelled (GPS, work hours) and valid visits. Add other expenses with the bill number, then submit once a month."
                actions={
                    <>
                        {canReview && (
                            <SegmentedControl
                                value={tab}
                                onChange={setTab}
                                options={[
                                    { value: "mine", label: "My claim" },
                                    { value: "reviews", label: `Team reviews · ${reviews.length}` },
                                ]}
                            />
                        )}
                        {tab === "mine" && <MonthSwitcher month={month} onChange={setMonth} />}
                        {tab === "mine" && data?.canSubmit && (
                            <Button variant="contained" startIcon={<SendRounded />} onClick={() => setConfirmSubmit(true)}>
                                Submit claim
                            </Button>
                        )}
                    </>
                }
            />

            {tab === "reviews" && canReview ? (
                <Panel title="Waiting for your review" subtitle={`${reviews.length} claim(s) from your team`}>
                    {reviews.length ? (
                        <Stack divider={<Divider />}>
                            {reviews.map((review) => (
                                <Stack key={review.ClaimId} direction={{ xs: "column", sm: "row" }} sx={{ py: 1.5, gap: 1.5, alignItems: { sm: "center" } }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="subtitle2">
                                            {review.UserName} · {formatMonthLabel(review.ClaimMonth)}
                                        </Typography>
                                        <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            DA {formatAmount(review.DaTotal)} · TA {formatAmount(review.TaTotal)} · Other {formatAmount(review.OtherTotal)} · submitted {formatDate(review.SubmittedOn)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="subtitle2">{formatAmount(review.ClaimedAmount)}</Typography>
                                    <Button variant="contained" size="small" onClick={() => setReviewId(review.ClaimId)}>
                                        Review
                                    </Button>
                                </Stack>
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState icon={AssignmentTurnedInRounded} title="All caught up" message="No claims are waiting for your review." />
                    )}
                </Panel>
            ) : error ? (
                <LoadError title="Couldn't load your claim" message={error} onRetry={load} />
            ) : (
                <Stack spacing={2} sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}>
                    {returnedNote && (
                        <Alert severity="error" variant="outlined">
                            Returned for correction: {returnedNote}
                        </Alert>
                    )}
                    {data?.blockedReason && !data.claim?.SubmittedOn && (
                        <Alert severity="info" variant="outlined">
                            {data.blockedReason}
                        </Alert>
                    )}

                    <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                        <StatCard icon={RestaurantRounded} label="Daily allowance" value={totals ? formatAmount(totals.da) : "—"} caption={`${data?.days?.length ?? 0} working day(s)`} color="primary" />
                        <StatCard icon={DirectionsBikeRounded} label="Travel allowance" value={totals ? formatAmount(totals.ta) : "—"} caption={`${(data?.days || []).reduce((sum, day) => sum + day.DistanceKm, 0)} km`} color="info" />
                        <StatCard
                            icon={ReceiptLongRounded}
                            label="Other expenses"
                            value={totals ? formatAmount(totals.other) : "—"}
                            caption={data?.otherLimit == null ? `${data?.items?.length ?? 0} item(s)` : `Limit ${formatAmount(data.otherLimit)}`}
                            color="warning"
                            progress={data?.otherLimit ? Math.min(100, Math.round((totals.other / data.otherLimit) * 100)) : undefined}
                        />
                        <StatCard
                            icon={WalletRounded}
                            label={data?.claim?.ApprovedAmount != null ? "Approved" : "Total claim"}
                            value={data?.claim?.ApprovedAmount != null ? formatAmount(data.claim.ApprovedAmount) : totals ? formatAmount(totals.total) : "—"}
                            caption={data?.claim?.ApprovedAmount != null ? `of ${formatAmount(data.claim.ClaimedAmount)} claimed` : formatMonthLabel(data?.month || `${month}-01`)}
                            color="success"
                        />
                    </Box>

                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: steps.length ? `minmax(0, 1fr) ${theme.spacing(theme.dashboard.sideColumnWidth)}` : "minmax(0, 1fr)" },
                            gap: theme.stat.gap,
                            alignItems: "start",
                        })}
                    >
                        <Stack spacing={2} sx={{ minWidth: 0 }}>
                            <Panel
                                title="Daily allowance & travel"
                                subtitle={`Days with valid visits. TA = GPS km × your rate; DA needs ${data?.daMinValidVisits ?? 6} valid visits; HQ / Ex-HQ / Outstation comes from the patches you visited.`}
                                actions={status && <StatusChip label={status.label} color={status.color} />}
                            >
                                {data?.days?.length ? (
                                    <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Travel</TableCell>
                                                    <TableCell>Station</TableCell>
                                                    <TableCell align="right">DA</TableCell>
                                                    <TableCell align="right">TA</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.days.map((day) => (
                                                    <TableRow key={day.ExpenseDate} hover>
                                                        <TableCell>
                                                            <Typography variant="subtitle2">{formatDate(day.ExpenseDate)}</Typography>
                                                            {day.VisitCount != null && (
                                                                <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                    {day.VisitCount} valid visit(s)
                                                                </Typography>
                                                            )}
                                                            {day.DaEligible === false && (
                                                                <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.warning.main })}>
                                                                    No DA: needs {data.daMinValidVisits} valid visits
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {TRAVEL_LABEL[day.TravelMode] || day.TravelMode} · {day.DistanceKm} km (GPS)
                                                        </TableCell>
                                                        <TableCell>{STATIONS.find((station) => station.value === day.StationType)?.label}</TableCell>
                                                        <TableCell align="right">{formatAmount(day.DaAmount)}</TableCell>
                                                        <TableCell align="right">{formatAmount(day.TaAmount)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                ) : (
                                    <EmptyState
                                        icon={RestaurantRounded}
                                        title={loading ? "Loading…" : "No days with valid visits yet"}
                                        message={loading ? "" : "Days appear here once you have valid (checked-in) visits this month."}
                                    />
                                )}
                            </Panel>

                            <Panel
                                title="Other expenses"
                                subtitle="Courier, stationery, special meeting travel and other expenses, with the bill number."
                                actions={
                                    data?.canEdit && (
                                        <Button variant="outlined" startIcon={<AddRounded />} onClick={() => setItemOpen(true)} disabled={remaining === 0}>
                                            Add expense
                                        </Button>
                                    )
                                }
                            >
                                {data?.items?.length ? (
                                    <Stack divider={<Divider />}>
                                        {data.items.map((item) => (
                                            <Stack key={item.ItemId} direction="row" sx={{ py: 1.25, gap: 1.5, alignItems: "center" }}>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="subtitle2" noWrap>
                                                        {item.TypeLabel} · {item.Description}
                                                    </Typography>
                                                    <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                        {[formatDate(item.ExpenseDate), item.BillNumber ? `Bill ${item.BillNumber}` : "No bill number", item.Vendor].filter(Boolean).join(" · ")}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="subtitle2">{formatAmount(item.Amount)}</Typography>
                                                {data.canEdit && (
                                                    <Tooltip title="Remove">
                                                        <IconButton aria-label={`Remove ${item.Description}`} onClick={() => setRemoving(item)}>
                                                            <DeleteOutlineRounded fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        No other expenses this month.
                                    </Typography>
                                )}
                            </Panel>
                        </Stack>

                        {steps.length > 0 && (
                            <Panel title="Progress">
                                <Timeline steps={steps} />
                            </Panel>
                        )}
                    </Box>
                </Stack>
            )}

            {itemOpen && data && <ItemDialog month={data.month} itemTypes={data.itemTypes} remaining={remaining} saving={saving} onClose={() => setItemOpen(false)} onSave={handleAddItem} />}

            {removing && (
                <ConfirmActionDialog
                    icon={DeleteOutlineRounded}
                    color="error"
                    title="Remove this expense?"
                    message={`${removing.TypeLabel} · ${removing.Description} · ${formatAmount(removing.Amount)}`}
                    confirmLabel="Remove"
                    busy={saving}
                    onClose={() => setRemoving(null)}
                    onConfirm={handleRemove}
                />
            )}

            {confirmSubmit && (
                <ConfirmActionDialog
                    icon={SendRounded}
                    title="Submit this claim?"
                    message={`${formatMonthLabel(data.month)} · ${formatAmount(totals.total)} (DA ${formatAmount(totals.da)}, TA ${formatAmount(totals.ta)}, other ${formatAmount(totals.other)}). You can't change it unless it's returned.`}
                    confirmLabel="Submit"
                    busy={saving}
                    onClose={() => setConfirmSubmit(false)}
                    onConfirm={handleSubmit}
                />
            )}

            {reviewId && (
                <ClaimDialog
                    claimId={reviewId}
                    onClose={() => setReviewId(null)}
                    onDone={() => {
                        setReviewId(null);
                        load();
                    }}
                />
            )}
        </Box>
    );
}

export default MyClaim;
