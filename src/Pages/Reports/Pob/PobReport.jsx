import { Box, Typography } from "@mui/material";
import { CurrencyRupeeRounded, HourglassTopRounded, LocalShippingRounded, ReceiptLongRounded } from "@mui/icons-material";

import Panel from "../../../components/Panel/Panel";
import Tag from "../../../components/Tag/Tag";
import GroupedBars from "../components/GroupedBars";
import ReportPage from "../components/ReportPage";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, formatAmount, formatDate, formatMoneyCompact, formatMonth, formatPercent, getPobReport } from "../index";

const AGG_COLUMNS = (label) => [
    { key: "label", label, csv: (row) => row.label, render: (row) => <Typography variant="subtitle2">{row.label}</Typography> },
    { key: "orders", label: "Orders", align: "right", csv: (row) => row.orders },
    { key: "units", label: "Units", align: "right", csv: (row) => row.units, render: (row) => `${row.units}${row.freeUnits ? ` + ${row.freeUnits} free` : ""}` },
    { key: "value", label: "Booked value", align: "right", csv: (row) => row.value, render: (row) => formatAmount(row.value) },
    { key: "supplied", label: "Supplied", align: "right", csv: (row) => row.supplied, render: (row) => formatAmount(row.supplied) },
    { key: "suppliedPercent", label: "Supplied %", align: "right", csv: (row) => row.suppliedPercent ?? "", render: (row) => formatPercent(row.suppliedPercent) },
    { key: "pending", label: "Pending", align: "right", csv: (row) => row.pending, render: (row) => formatAmount(row.pending) },
    { key: "cancelled", label: "Cancelled", align: "right", csv: (row) => row.cancelled, render: (row) => formatAmount(row.cancelled) },
];

const ORDER_COLUMNS = [
    { key: "number", label: "Order", csv: (row) => row.OrderNumber, render: (row) => <Typography variant="subtitle2">{row.OrderNumber}</Typography> },
    { key: "date", label: "Date", csv: (row) => row.OrderDate, render: (row) => formatDate(row.OrderDate) },
    { key: "employee", label: "Employee", csv: (row) => row.EmployeeName },
    {
        key: "customer",
        label: "Customer",
        csv: (row) => row.CustomerName,
        render: (row) => (
            <Box>
                <Typography variant="body2">{row.CustomerType === "DOCTOR" ? `Dr. ${row.CustomerName}` : row.CustomerName}</Typography>
                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {[row.CustomerType === "DOCTOR" ? "Doctor" : "Chemist", row.TerritoryName].filter(Boolean).join(" · ")}
                </Typography>
            </Box>
        ),
    },
    { key: "customerType", label: "Customer type", csvOnly: true, csv: (row) => row.CustomerType },
    { key: "territory", label: "Territory", csvOnly: true, csv: (row) => row.TerritoryName },
    { key: "stockist", label: "Stockist", csv: (row) => row.StockistName, render: (row) => row.StockistName || "—" },
    { key: "products", label: "Products", csv: (row) => row.products.join("; "), render: (row) => (row.products.length > 2 ? `${row.products.slice(0, 2).join(", ")} +${row.products.length - 2}` : row.products.join(", ")) },
    { key: "units", label: "Units", align: "right", csv: (row) => row.units, render: (row) => `${row.units}${row.freeUnits ? ` + ${row.freeUnits}` : ""}` },
    { key: "value", label: "Value", align: "right", csv: (row) => row.value, render: (row) => formatAmount(row.value) },
    { key: "status", label: "Status", csv: (row) => ORDER_STATUS_LABEL[row.Status], render: (row) => <Tag label={ORDER_STATUS_LABEL[row.Status]} color={ORDER_STATUS_COLOR[row.Status]} /> },
];

function PobReport() {
    return (
        <ReportPage
            title="POB report"
            subtitle="Orders booked at doctors and chemists: value, supply status and units, by employee, product and customer."
            load={getPobReport}
            showProduct
            kpis={({ kpis }) => [
                { icon: CurrencyRupeeRounded, label: "Booked value", value: formatMoneyCompact(kpis.value), caption: `${kpis.orders} order(s) · avg ${kpis.avgOrderValue == null ? "—" : formatMoneyCompact(kpis.avgOrderValue)}`, color: "primary" },
                { icon: LocalShippingRounded, label: "Supplied", value: formatMoneyCompact(kpis.supplied), caption: `${formatPercent(kpis.suppliedPercent)} of booked value`, color: "success", progress: kpis.suppliedPercent ?? undefined },
                { icon: HourglassTopRounded, label: "Pending supply", value: formatMoneyCompact(kpis.pending), caption: "Booked or confirmed", color: "warning" },
                { icon: ReceiptLongRounded, label: "Units", value: kpis.units, caption: `${kpis.freeUnits} free · ${formatMoneyCompact(kpis.cancelled)} cancelled`, color: "info" },
            ]}
            charts={({ months }) =>
                months.length > 1 && (
                    <Panel title="Month by month" subtitle="Booked vs supplied value">
                        <GroupedBars
                            ariaLabel="POB booked and supplied value per month"
                            format={formatMoneyCompact}
                            series={[
                                { key: "value", label: "Booked", color: (theme) => theme.palette.chart.ours },
                                { key: "supplied", label: "Supplied", color: (theme) => theme.palette.chart.competitor },
                            ]}
                            rows={months.map((row) => ({ key: row.month, label: formatMonth(row.month), value: row.value, supplied: row.supplied }))}
                        />
                    </Panel>
                )
            }
            note={(data) => (data.truncated ? `More than ${data.rowLimit} order lines match; showing the latest ${data.rowLimit}. Narrow the filters for exact totals.` : null)}
            tabs={(data) => [
                { value: "employees", label: "By employee", title: "By employee", subtitle: `${data.employees.length} employee(s) with orders`, columns: AGG_COLUMNS("Employee"), rows: data.employees, rowKey: (row) => row.key, fileName: "pob-by-employee", empty: "No orders booked in this period." },
                { value: "products", label: "By product", title: "By product", subtitle: `${data.products.length} product(s)`, columns: AGG_COLUMNS("Product"), rows: data.products, rowKey: (row) => row.key, fileName: "pob-by-product", empty: "No orders booked in this period." },
                { value: "customers", label: "Top customers", title: "Top customers", subtitle: "Doctors and chemists by booked value", columns: AGG_COLUMNS("Customer"), rows: data.customers, rowKey: (row) => row.key, fileName: "pob-top-customers", empty: "No orders booked in this period." },
                { value: "orders", label: "Orders", title: "Orders", subtitle: `${data.orders.length} order(s)`, columns: ORDER_COLUMNS, rows: data.orders, rowKey: (row) => row.OrderId, fileName: "pob-orders", empty: "No orders booked in this period." },
            ]}
        />
    );
}

export default PobReport;
