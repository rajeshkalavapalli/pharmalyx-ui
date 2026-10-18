import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { ChevronRightRounded, CurrencyRupeeRounded, EventBusyRounded, HourglassTopRounded, LocalPharmacyRounded, ReceiptLongRounded, WorkspacePremiumRounded } from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import Panel from "../../components/Panel/Panel";
import StatCard from "../../components/StatCard/StatCard";
import Tag from "../../components/Tag/Tag";
import { MILESTONE_STATUS, compact, getIncentives, getReview, rupees, thisMonth } from "../../Pages/Business/index";
import { getOrders } from "../../Pages/Sales/index";

const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

const Row = ({ label, value, strong }) => (
    <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2, py: 0.75 }}>
        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
            {label}
        </Typography>
        <Typography variant={strong ? "subtitle2" : "body2"}>{value}</Typography>
    </Stack>
);

const grid = (theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap });
const panels = (theme) => ({ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" }, gap: theme.stat.gap });

// Manager: the team's POB this month and what is waiting for follow-up.
function TeamSales() {
    const [data, setData] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        getOrders(thisMonth(), "team")
            .then(setData)
            .catch(() => setFailed(true));
    }, []);

    if (failed) return <EmptyState icon={ReceiptLongRounded} title="Sales data isn't available" message="Ask head office to finish setting up business tracking." />;
    if (!data) return <EmptyState icon={ReceiptLongRounded} title="Loading…" />;

    const s = data.summary;
    const due = data.followUpDue || [];

    return (
        <>
            <Box sx={grid}>
                <StatCard icon={CurrencyRupeeRounded} label="Team POB value" value={compact(s.value)} caption={`${s.orders} order(s) · ${s.customers} customer(s)`} color="primary" />
                <StatCard icon={LocalPharmacyRounded} label="Marked supplied" value={compact(s.suppliedValue)} caption={`${percent(s.suppliedValue, s.value)}% of POB value`} color="success" progress={percent(s.suppliedValue, s.value)} />
                <StatCard icon={HourglassTopRounded} label="Awaiting supply" value={s.pending} caption="Raised or under follow-up" color="warning" />
                <StatCard icon={ReceiptLongRounded} label="Need follow-up" value={due.length} caption={`Raised ${data.followUpAfterDays}+ days ago`} color={due.length ? "error" : "secondary"} />
            </Box>
            <Box sx={panels}>
                <Panel
                    title="Waiting for follow-up"
                    subtitle="Remind the MR, then tap Follow up on the order."
                    actions={
                        <Button size="small" endIcon={<ChevronRightRounded />} component={RouterLink} to="/sales/orders">
                            Team orders
                        </Button>
                    }
                >
                    {due.length ? (
                        <Stack divider={<Divider />}>
                            {due.slice(0, 8).map((order) => (
                                <Row key={order.Id} label={`${order.OrderNumber} · ${order.UserName} · ${order.CustomerName}`} value={rupees(order.NetAmount)} />
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState icon={ReceiptLongRounded} title="Nothing to follow up" />
                    )}
                </Panel>
                <Panel
                    title="Top products"
                    subtitle="By team POB value this month"
                    actions={
                        <Button size="small" endIcon={<ChevronRightRounded />} component={RouterLink} to="/sales/tracker">
                            Business tracker
                        </Button>
                    }
                >
                    {s.topProducts.length ? (
                        <Stack divider={<Divider />}>
                            {s.topProducts.map((product) => (
                                <Row key={product.ProductId} label={`${product.ProductName} · ${product.quantity} unit(s)`} value={rupees(product.value)} />
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState icon={ReceiptLongRounded} title="No POB yet this month" />
                    )}
                </Panel>
            </Box>
        </>
    );
}

// The MR: net sales vs cost and target, POB, incentive and near-expiry stock.
function MySales() {
    const [review, setReview] = useState(null);
    const [incentives, setIncentives] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        Promise.all([getReview(thisMonth()), getIncentives()])
            .then(([r, i]) => {
                setReview(r);
                setIncentives(i);
            })
            .catch(() => setFailed(true));
    }, []);

    if (failed) return <EmptyState icon={CurrencyRupeeRounded} title="Business data isn't available" message="Ask head office to finish setting up business tracking." />;
    if (!review || !incentives) return <EmptyState icon={CurrencyRupeeRounded} title="Loading…" />;

    const sales = review.sales;
    const next = review.milestones.filter((m) => m.status !== "MET").slice(0, 4);
    const behind = sales.targetPct != null && sales.pctOfCost != null && sales.pctOfCost < sales.targetPct;

    return (
        <>
            <Box sx={grid}>
                <StatCard
                    icon={CurrencyRupeeRounded}
                    label="Net sales this month"
                    value={compact(sales.net)}
                    caption={sales.pctOfCost == null ? "Cost not set yet" : `${sales.pctOfCost}% of cost${sales.targetPct != null ? ` · target ${sales.targetPct}%` : ""}`}
                    color={behind ? "warning" : "success"}
                    progress={sales.targetPct ? Math.min(100, percent(sales.pctOfCost || 0, sales.targetPct)) : undefined}
                />
                <StatCard icon={ReceiptLongRounded} label="POB booked" value={review.pob.booked} caption={`${review.pob.supplied} supplied · ${compact(review.pob.bookedValue)}`} color="primary" />
                <StatCard icon={WorkspacePremiumRounded} label="Incentive held" value={compact(incentives.totals.held)} caption={`${compact(incentives.totals.released)} released · ${compact(incentives.totals.deducted)} deducted`} color="info" />
                <StatCard icon={EventBusyRounded} label="Near-expiry batches" value={review.nearExpiry} caption="At your stockists" color={review.nearExpiry ? "error" : "secondary"} />
            </Box>
            <Box sx={panels}>
                <Panel
                    title="This month's business"
                    subtitle="Net sales = dispatch to your stockists − returns and expiry"
                    actions={
                        <Button size="small" endIcon={<ChevronRightRounded />} component={RouterLink} to="/sales/tracker">
                            Business tracker
                        </Button>
                    }
                >
                    <Stack divider={<Divider />}>
                        <Row label="Dispatched" value={rupees(sales.dispatched)} />
                        <Row label="Returns and expiry" value={`− ${rupees(sales.returned)}`} />
                        <Row label="Net sales" value={rupees(sales.net)} strong />
                        <Row label="Your cost (salary + TA/DA)" value={rupees(sales.cost)} />
                        <Row label="Chemists with POB" value={review.pob.chemistsOrdered} />
                    </Stack>
                </Panel>
                <Panel title="Next milestones" subtitle={`Month ${review.monthNumber} since joining`}>
                    {next.length ? (
                        <Stack divider={<Divider />}>
                            {next.map((m) => (
                                <Stack key={m.MilestoneId} direction="row" sx={{ py: 1, gap: 1.5, alignItems: "center" }}>
                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                        Month {m.MonthNumber}: {m.label} {m.Target}
                                        {m.unit === "%" ? "%" : ""}
                                    </Typography>
                                    <Tag label={MILESTONE_STATUS[m.status].label} color={MILESTONE_STATUS[m.status].color} />
                                </Stack>
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState icon={WorkspacePremiumRounded} title="All milestones met" />
                    )}
                </Panel>
            </Box>
        </>
    );
}

function SalesSection({ team }) {
    return team ? <TeamSales /> : <MySales />;
}

export default SalesSection;
