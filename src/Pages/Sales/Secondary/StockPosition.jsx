import { useCallback, useEffect, useMemo, useState } from "react";

import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ErrorOutlineRounded, Inventory2Rounded, TrendingDownRounded, WarehouseRounded, WarningAmberRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../../components/StatCard/StatCard";
import StatusChip from "../../../components/StatusChip/StatusChip";
import Tag from "../../../components/Tag/Tag";
import { STATEMENT_STATUS, STOCK_STATUS, errorMessage, formatAmount, formatMoneyCompact, formatMonthLabel, formatUnits, getStockPosition } from "../index";

const FILTERS = [
    { value: "ALL", label: "All products", test: () => true },
    { value: "OUT", label: "Out of stock", test: (item) => item.stockStatus === "OUT" },
    { value: "LOW", label: "Low cover", test: (item) => item.stockStatus === "LOW" },
    { value: "HIGH", label: "Overstock / no movement", test: (item) => item.stockStatus === "HIGH" || item.stockStatus === "NO_MOVEMENT" },
];

// Latest closing stock at each assigned stockist, from their last submitted statement.
function StockPosition() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            setData(await getStockPosition());
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load stockist stock"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const stockists = useMemo(() => {
        const test = (FILTERS.find((item) => item.value === filter) || FILTERS[0]).test;
        return (data?.stockists || []).map((stockist) => ({ ...stockist, visible: stockist.items.filter(test) }));
    }, [data, filter]);

    const allItems = (data?.stockists || []).flatMap((stockist) => stockist.items);
    const summary = data?.summary;
    const thresholds = data?.thresholds;

    return (
        <Box>
            <PageHeader
                eyebrow="Sales & distribution · Stock"
                title="Stockist stock"
                subtitle={
                    thresholds
                        ? `Closing stock from each stockist's latest statement. Cover is how many days of sales the stock lasts: under ${thresholds.low} days is low, over ${thresholds.high} is overstock.`
                        : "Closing stock from each stockist's latest statement."
                }
            />

            <Box
                sx={(theme) => ({
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                    gap: theme.stat.gap,
                    mb: theme.pageHeader.marginBottom,
                })}
            >
                <StatCard
                    icon={WarehouseRounded}
                    label="Stockists reporting"
                    value={summary ? `${summary.reporting}/${summary.stockists}` : "—"}
                    caption="With a submitted statement"
                    color="primary"
                    progress={summary?.stockists ? Math.round((summary.reporting / summary.stockists) * 100) : 0}
                />
                <StatCard icon={Inventory2Rounded} label="Stock value" value={summary ? formatMoneyCompact(summary.closingValue) : "—"} caption="At catalogue price" color="info" />
                <StatCard icon={ErrorOutlineRounded} label="Out of stock" value={summary?.outOfStock ?? "—"} caption="Product lines to refill" color="error" />
                <StatCard icon={WarningAmberRounded} label="Low cover" value={summary?.lowStock ?? "—"} caption={thresholds ? `Under ${thresholds.low} days of sales` : "—"} color="warning" />
            </Box>

            {error ? (
                <LoadError title="Couldn't load stockist stock" message={error} onRetry={load} />
            ) : !stockists.length ? (
                <Panel>
                    <EmptyState
                        icon={WarehouseRounded}
                        title={loading ? "Loading…" : "No stockists assigned"}
                        message={loading ? "" : "Ask your administrator to map stockists to you in Configuration."}
                    />
                </Panel>
            ) : (
                <Stack spacing={2} sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}>
                    <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                        <SegmentedControl
                            value={filter}
                            onChange={setFilter}
                            options={FILTERS.map((item) => ({ value: item.value, label: `${item.label} · ${allItems.filter(item.test).length}` }))}
                        />
                    </Box>

                    {stockists.map((stockist) => (
                        <Panel
                            key={stockist.StockistId}
                            title={stockist.StockistName}
                            subtitle={
                                stockist.StatementMonth
                                    ? `As of ${formatMonthLabel(stockist.StatementMonth)} · ${formatAmount(stockist.ClosingValue)} in stock`
                                    : "No submitted statement yet"
                            }
                            actions={
                                stockist.StatementMonth && (
                                    <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                                        {stockist.counts.out > 0 && <Tag label={`${stockist.counts.out} out`} color="error" />}
                                        {stockist.counts.low > 0 && <Tag label={`${stockist.counts.low} low`} color="warning" />}
                                        <StatusChip label={STATEMENT_STATUS[stockist.Status].label} color={STATEMENT_STATUS[stockist.Status].color} />
                                    </Stack>
                                )
                            }
                        >
                            {!stockist.StatementMonth ? (
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    Stock appears here once a monthly statement is submitted in Secondary sales.
                                </Typography>
                            ) : stockist.visible.length ? (
                                <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product</TableCell>
                                                <TableCell align="right">Closing stock</TableCell>
                                                <TableCell align="right">Sales last month</TableCell>
                                                <TableCell align="right">Cover</TableCell>
                                                <TableCell align="right">Stock value</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {stockist.visible.map((item) => (
                                                <TableRow key={item.ProductId} hover>
                                                    <TableCell>
                                                        <Typography variant="subtitle2">{item.ProductName}</Typography>
                                                        {item.PackSize && (
                                                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                {item.PackSize}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">{formatUnits(item.ClosingQty)}</TableCell>
                                                    <TableCell align="right">{formatUnits(item.SalesQty)}</TableCell>
                                                    <TableCell align="right">{item.coverDays == null ? "—" : `${item.coverDays} days`}</TableCell>
                                                    <TableCell align="right">{formatAmount(item.ClosingValue)}</TableCell>
                                                    <TableCell>
                                                        <Tag
                                                            icon={item.stockStatus === "OUT" || item.stockStatus === "LOW" ? TrendingDownRounded : undefined}
                                                            label={STOCK_STATUS[item.stockStatus].label}
                                                            color={STOCK_STATUS[item.stockStatus].color}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    No products in this view.
                                </Typography>
                            )}
                        </Panel>
                    ))}
                </Stack>
            )}
        </Box>
    );
}

export default StockPosition;
