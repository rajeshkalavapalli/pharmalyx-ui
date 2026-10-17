import { useCallback, useEffect, useState } from "react";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AssignmentTurnedInRounded,
    CurrencyRupeeRounded,
    Inventory2Rounded,
    ShoppingCartCheckoutRounded,
    WarehouseRounded,
} from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import MonthSwitcher from "../../../components/MonthSwitcher/MonthSwitcher";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../../components/StatCard/StatCard";
import StatusChip from "../../../components/StatusChip/StatusChip";
import {
    STATEMENT_STATUS,
    errorMessage,
    formatAmount,
    formatDate,
    formatMoneyCompact,
    formatMonthLabel,
    formatUnits,
    getSecondaryOverview,
    getSecondaryReviews,
    monthKey,
} from "../index";
import ReviewDialog from "./ReviewDialog";
import StatementDialog from "./StatementDialog";

const actionLabel = (row, editable) => {
    if (!row.isOwner) return "View";
    if (!editable) return row.statement ? "View" : null;
    if (row.status === "NOT_STARTED") return "Enter statement";
    if (row.status === "DRAFT") return "Continue";
    if (row.status === "RETURNED") return "Correct & resubmit";
    return "View";
};

function SecondarySales() {
    const [month, setMonth] = useState(monthKey());
    const [tab, setTab] = useState("mine");
    const [data, setData] = useState(null);
    const [reviews, setReviews] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [openStockistId, setOpenStockistId] = useState(null);
    const [reviewId, setReviewId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const overview = await getSecondaryOverview(month);
            setData(overview);

            // The review queue is only for managers allowed to approve; a 403 just hides it.
            if (overview.hasTeam) {
                setReviews(await getSecondaryReviews().then((response) => response.reviews).catch(() => null));
            }
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load secondary sales"));
        } finally {
            setLoading(false);
        }
    }, [month]);

    useEffect(() => {
        load();
    }, [load]);

    const summary = data?.summary;
    const editable = data && !data.editableReason;
    const canReview = Array.isArray(reviews);

    return (
        <Box>
            <PageHeader
                eyebrow="Sales & distribution · Secondary"
                title="Secondary sales"
                subtitle="Each month, enter every stockist's statement: opening, receipts from the company, sales to the market, returns and closing stock."
                actions={
                    <>
                        {canReview && (
                            <SegmentedControl
                                value={tab}
                                onChange={setTab}
                                options={[
                                    { value: "mine", label: "My statements" },
                                    { value: "reviews", label: `Team reviews · ${reviews.length}` },
                                ]}
                            />
                        )}
                        {tab === "mine" && <MonthSwitcher month={month} onChange={setMonth} />}
                    </>
                }
            />

            {tab === "reviews" && canReview ? (
                <Panel title="Waiting for your review" subtitle={`${reviews.length} statement(s) from your team`}>
                    {reviews.length ? (
                        <Stack divider={<Divider />}>
                            {reviews.map((review) => (
                                <Stack key={review.StatementId} direction={{ xs: "column", sm: "row" }} sx={{ py: 1.5, gap: 1.5, alignItems: { sm: "center" } }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="subtitle2">
                                            {review.StockistName} · {formatMonthLabel(review.StatementMonth)}
                                        </Typography>
                                        <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {review.UserName} · submitted {formatDate(review.SubmittedOn)} · {formatUnits(review.TotalSalesQty)} units
                                        </Typography>
                                    </Box>
                                    <Typography variant="subtitle2">{formatAmount(review.SalesValue)}</Typography>
                                    <Button variant="contained" size="small" onClick={() => setReviewId(review.StatementId)}>
                                        Review
                                    </Button>
                                </Stack>
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState icon={AssignmentTurnedInRounded} title="All caught up" message="No statements are waiting for your review." />
                    )}
                </Panel>
            ) : (
                <>
                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                            gap: theme.stat.gap,
                            mb: theme.pageHeader.marginBottom,
                        })}
                    >
                        <StatCard
                            icon={AssignmentTurnedInRounded}
                            label="Statements submitted"
                            value={summary ? `${summary.submitted}/${summary.stockists}` : "—"}
                            caption={summary ? `${summary.approved} approved` : "—"}
                            color="primary"
                            progress={summary?.stockists ? Math.round((summary.submitted / summary.stockists) * 100) : 0}
                        />
                        <StatCard icon={CurrencyRupeeRounded} label="Secondary sales" value={summary ? formatMoneyCompact(summary.salesValue) : "—"} caption="Submitted statements" color="success" />
                        <StatCard icon={ShoppingCartCheckoutRounded} label="Units sold" value={summary ? formatUnits(summary.salesQty) : "—"} caption="To the market" color="info" />
                        <StatCard icon={Inventory2Rounded} label="Closing stock" value={summary ? formatMoneyCompact(summary.closingValue) : "—"} caption="Value at stockists" color="warning" />
                    </Box>

                    {error ? (
                        <LoadError title="Couldn't load secondary sales" message={error} onRetry={load} />
                    ) : (
                        <Panel
                            title={`Stockist statements · ${formatMonthLabel(data?.month || `${month}-01`)}`}
                            subtitle={data?.editableReason || "Submit each statement once the stockist shares the month's figures."}
                            sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}
                        >
                            {data?.stockists?.length ? (
                                <Stack divider={<Divider />}>
                                    {data.stockists.map((row) => {
                                        const status = STATEMENT_STATUS[row.status];
                                        const label = actionLabel(row, editable);

                                        return (
                                            <Stack key={row.StockistId} direction={{ xs: "column", sm: "row" }} sx={{ py: 1.5, gap: 1.5, alignItems: { sm: "center" } }}>
                                                <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0, alignItems: "center" }}>
                                                    <Box
                                                        sx={(theme) => ({
                                                            width: theme.avatar.sizeSmall,
                                                            height: theme.avatar.sizeSmall,
                                                            flexShrink: 0,
                                                            display: "grid",
                                                            placeItems: "center",
                                                            borderRadius: theme.stat.iconRadius,
                                                            color: theme.palette.primary.main,
                                                            backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft),
                                                        })}
                                                    >
                                                        <WarehouseRounded fontSize="small" />
                                                    </Box>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography variant="subtitle2" noWrap>
                                                            {row.StockistName}
                                                        </Typography>
                                                        <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                            {[
                                                                row.AreaName,
                                                                row.statement && !row.isOwner ? `Prepared by ${row.statement.UserName}` : null,
                                                                row.status === "RETURNED" && row.statement?.ReviewRemarks ? `“${row.statement.ReviewRemarks}”` : null,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(" · ") || "—"}
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                <StatusChip label={status.label} color={status.color} />

                                                <Box sx={(theme) => ({ minWidth: theme.engagement.quantityColumn, textAlign: { sm: "right" } })}>
                                                    <Typography variant="subtitle2">{row.statement ? formatAmount(row.statement.SalesValue) : "—"}</Typography>
                                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                        {row.statement ? `${formatUnits(row.statement.TotalSalesQty)} units` : "No figures yet"}
                                                    </Typography>
                                                </Box>

                                                {label && (
                                                    <Button
                                                        variant={label === "View" ? "outlined" : "contained"}
                                                        size="small"
                                                        onClick={() => setOpenStockistId(row.StockistId)}
                                                        sx={(theme) => ({ minWidth: theme.engagement.dateColumn })}
                                                    >
                                                        {label}
                                                    </Button>
                                                )}
                                            </Stack>
                                        );
                                    })}
                                </Stack>
                            ) : (
                                <EmptyState
                                    icon={WarehouseRounded}
                                    title={loading ? "Loading…" : "No stockists assigned"}
                                    message={loading ? "" : "Ask your administrator to map stockists to you in Configuration."}
                                />
                            )}
                        </Panel>
                    )}
                </>
            )}

            {openStockistId && (
                <StatementDialog
                    stockistId={openStockistId}
                    month={month}
                    onClose={() => setOpenStockistId(null)}
                    onSaved={() => {
                        setOpenStockistId(null);
                        load();
                    }}
                />
            )}

            {reviewId && (
                <ReviewDialog
                    statementId={reviewId}
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

export default SecondarySales;
