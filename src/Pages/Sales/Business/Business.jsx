import { useCallback, useEffect, useState } from "react";

import { Box, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { CurrencyRupeeRounded, Inventory2Rounded, LocalShippingRounded, StorefrontRounded, TrendingUpRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import MonthSwitcher from "../../../components/MonthSwitcher/MonthSwitcher";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../../components/StatCard/StatCard";
import { errorMessage, formatMoneyCompact, formatMonthLabel, formatUnits, getBusiness, monthKey } from "../index";
import TrendChart from "./TrendChart";

const changeText = (change, previousLabel) => {
    if (change == null) return `No ${previousLabel} figure to compare`;
    if (change === 0) return `Same as ${previousLabel}`;
    return `${change > 0 ? "▲" : "▼"} ${Math.abs(change)}% vs ${previousLabel}`;
};

const previousMonthName = (monthStart) => {
    const date = new Date(`${monthStart}T00:00:00`);
    return new Date(date.getFullYear(), date.getMonth() - 1, 1).toLocaleDateString("en-GB", { month: "short" });
};

function Muted({ children }) {
    return (
        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
            {children}
        </Typography>
    );
}

// POB, secondary sales and stock in one place for the month, with a six-month trend.
function Business() {
    const [month, setMonth] = useState(monthKey());
    const [scope, setScope] = useState("self");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            setData(await getBusiness(month, scope));
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load the business summary"));
        } finally {
            setLoading(false);
        }
    }, [month, scope]);

    useEffect(() => {
        load();
    }, [load]);

    const kpis = data?.kpis;
    const previous = data ? previousMonthName(data.month) : "last month";
    const hasTrend = data?.trend?.some((row) => row.pob || row.secondary);

    return (
        <Box>
            <PageHeader
                eyebrow="Sales & distribution · Business"
                title={scope === "team" ? "Team business" : "Business"}
                subtitle="Orders booked (POB), stockist secondary sales and stock in the market, month by month."
                actions={
                    <>
                        {data?.hasTeam && (
                            <SegmentedControl
                                value={scope}
                                onChange={setScope}
                                options={[
                                    { value: "self", label: "Mine" },
                                    { value: "team", label: "My team" },
                                ]}
                            />
                        )}
                        <MonthSwitcher month={month} onChange={setMonth} />
                    </>
                }
            />

            {error ? (
                <LoadError title="Couldn't load the business summary" message={error} onRetry={load} />
            ) : (
                <Stack spacing={2} sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}>
                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                            gap: theme.stat.gap,
                        })}
                    >
                        <StatCard
                            icon={CurrencyRupeeRounded}
                            label="POB booked"
                            value={kpis ? formatMoneyCompact(kpis.pob.value) : "—"}
                            caption={kpis ? `${kpis.pob.orders} order(s) · ${changeText(kpis.pob.change, previous)}` : "—"}
                            color="primary"
                        />
                        <StatCard
                            icon={LocalShippingRounded}
                            label="POB supplied"
                            value={kpis ? formatMoneyCompact(kpis.supplied.value) : "—"}
                            caption={kpis?.supplied.rate == null ? "Nothing booked yet" : `${kpis.supplied.rate}% of POB value`}
                            color="info"
                            progress={kpis?.supplied.rate ?? 0}
                        />
                        <StatCard
                            icon={TrendingUpRounded}
                            label="Secondary sales"
                            value={kpis ? formatMoneyCompact(kpis.secondary.value) : "—"}
                            caption={kpis ? `${kpis.secondary.statements} statement(s) · ${changeText(kpis.secondary.change, previous)}` : "—"}
                            color="success"
                        />
                        <StatCard
                            icon={Inventory2Rounded}
                            label="Stock at stockists"
                            value={kpis ? formatMoneyCompact(kpis.stock.value) : "—"}
                            caption={kpis?.stock.coverDays == null ? "Closing stock this month" : `About ${kpis.stock.coverDays} days of sales`}
                            color="warning"
                        />
                    </Box>

                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: `minmax(0, 1fr) ${theme.spacing(theme.dashboard.sideColumnWidth)}` },
                            gap: theme.stat.gap,
                            alignItems: "start",
                        })}
                    >
                        <Panel title="Six-month trend" subtitle="POB booked vs secondary sales reported by stockists">
                            {hasTrend ? (
                                <TrendChart data={data.trend} />
                            ) : (
                                <EmptyState icon={TrendingUpRounded} title={loading ? "Loading…" : "No business yet"} message={loading ? "" : "Book POBs and submit stockist statements to see the trend."} />
                            )}
                        </Panel>

                        <Panel title="Top customers" subtitle={`By POB · ${formatMonthLabel(data?.month || `${month}-01`)}`}>
                            {data?.customers?.length ? (
                                <Stack divider={<Divider />}>
                                    {data.customers.map((customer, index) => (
                                        <Stack key={customer.CustomerId} direction="row" spacing={1.5} sx={{ py: 1.25, alignItems: "center" }}>
                                            <Typography variant="subtitle2" sx={(theme) => ({ width: theme.spacing(2.5), color: theme.palette.text.disabled })}>
                                                {index + 1}
                                            </Typography>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="subtitle2" noWrap>
                                                    {customer.CustomerType === "DOCTOR" ? `Dr. ${customer.CustomerName}` : customer.CustomerName}
                                                </Typography>
                                                <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                    {customer.CustomerType === "DOCTOR" ? "Doctor" : "Chemist"} · {customer.Orders} order(s)
                                                </Typography>
                                            </Box>
                                            <Typography variant="subtitle2">{formatMoneyCompact(customer.Value)}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            ) : (
                                <Muted>No POB booked this month.</Muted>
                            )}
                        </Panel>
                    </Box>

                    <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", xl: "repeat(2, minmax(0, 1fr))" }, gap: theme.stat.gap, alignItems: "start" })}>
                        <Panel title="Top products" subtitle="POB and secondary sales this month">
                            {data?.products?.length ? (
                                <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product</TableCell>
                                                <TableCell align="right">POB</TableCell>
                                                <TableCell align="right">Secondary</TableCell>
                                                <TableCell align="right">Units sold</TableCell>
                                                <TableCell align="right">Stock</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.products.map((product) => (
                                                <TableRow key={product.id} hover>
                                                    <TableCell>
                                                        <Typography variant="subtitle2">{product.name}</Typography>
                                                    </TableCell>
                                                    <TableCell align="right">{formatMoneyCompact(product.pobValue)}</TableCell>
                                                    <TableCell align="right">{formatMoneyCompact(product.secondaryValue)}</TableCell>
                                                    <TableCell align="right">{formatUnits(product.secondaryQty)}</TableCell>
                                                    <TableCell align="right">{formatMoneyCompact(product.closingValue)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Muted>No product business this month.</Muted>
                            )}
                        </Panel>

                        <Panel title="Top stockists" subtitle="POB routed through them and their secondary sales">
                            {data?.stockists?.length ? (
                                <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Stockist</TableCell>
                                                <TableCell align="right">POB routed</TableCell>
                                                <TableCell align="right">Secondary</TableCell>
                                                <TableCell align="right">Stock</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.stockists.map((stockist) => (
                                                <TableRow key={stockist.id} hover>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                            <StorefrontRounded fontSize="small" sx={(theme) => ({ color: theme.palette.text.secondary })} />
                                                            <Box>
                                                                <Typography variant="subtitle2">{stockist.name}</Typography>
                                                                {stockist.orders > 0 && (
                                                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                        {stockist.orders} order(s)
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align="right">{formatMoneyCompact(stockist.pobValue)}</TableCell>
                                                    <TableCell align="right">{formatMoneyCompact(stockist.secondaryValue)}</TableCell>
                                                    <TableCell align="right">{formatMoneyCompact(stockist.closingValue)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Muted>No stockist business this month.</Muted>
                            )}
                        </Panel>
                    </Box>
                </Stack>
            )}
        </Box>
    );
}

export default Business;
