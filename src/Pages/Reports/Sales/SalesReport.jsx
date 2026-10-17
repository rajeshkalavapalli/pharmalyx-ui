import { Typography } from "@mui/material";
import { FlagRounded, Inventory2Rounded, TrendingUpRounded, WarehouseRounded } from "@mui/icons-material";

import Panel from "../../../components/Panel/Panel";
import Tag from "../../../components/Tag/Tag";
import GroupedBars from "../components/GroupedBars";
import ReportPage from "../components/ReportPage";
import { formatAmount, formatMoneyCompact, formatMonth, formatPercent, getSalesReport, ragColor } from "../index";

const ACHIEVEMENT = { good: 100, fair: 80 };

const achievementTag = (row) => (row.achievement == null ? "—" : <Tag label={formatPercent(row.achievement)} color={ragColor(row.achievement, ACHIEVEMENT)} />);

const SALES_COLUMNS = (label, { withTarget = true } = {}) => [
    { key: "label", label, csv: (row) => row.label, render: (row) => <Typography variant="subtitle2">{row.label}</Typography> },
    { key: "qty", label: "Units sold", align: "right", csv: (row) => row.qty },
    { key: "value", label: "Secondary sales", align: "right", csv: (row) => row.value, render: (row) => formatAmount(row.value) },
    ...(withTarget
        ? [
              { key: "targetQty", label: "Target units", align: "right", csv: (row) => row.targetQty, render: (row) => row.targetQty || "—" },
              { key: "targetValue", label: "Target value", align: "right", csv: (row) => row.targetValue, render: (row) => (row.targetValue ? formatAmount(row.targetValue) : "—") },
              { key: "achievement", label: "Achievement", align: "right", csv: (row) => row.achievement ?? "", render: achievementTag },
          ]
        : []),
    { key: "closing", label: "Closing stock", align: "right", csv: (row) => row.closingValue, render: (row) => formatAmount(row.closingValue) },
];

const MONTH_COLUMNS = SALES_COLUMNS("Month").map((column) => (column.key === "label" ? { ...column, csv: (row) => row.month, render: (row) => <Typography variant="subtitle2">{formatMonth(row.month)}</Typography> } : column));

const LINE_COLUMNS = [
    { key: "month", label: "Month", csv: (row) => row.SalesMonth, render: (row) => formatMonth(row.SalesMonth) },
    { key: "employee", label: "Employee", csv: (row) => row.EmployeeName },
    { key: "stockist", label: "Stockist", csv: (row) => row.StockistName, render: (row) => row.StockistName || "—" },
    { key: "territory", label: "Territory", csv: (row) => row.TerritoryName, render: (row) => row.TerritoryName || "—" },
    { key: "product", label: "Product", csv: (row) => row.ProductName },
    { key: "receipts", label: "Receipts", align: "right", csv: (row) => row.ReceiptQty },
    { key: "sales", label: "Sales qty", align: "right", csv: (row) => row.SalesQty },
    { key: "salesValue", label: "Sales value", align: "right", csv: (row) => row.SalesValue, render: (row) => formatAmount(row.SalesValue) },
    { key: "closing", label: "Closing qty", align: "right", csv: (row) => row.ClosingQty },
    { key: "status", label: "Statement", csv: (row) => row.Status, render: (row) => <Tag label={row.Status === "APPROVED" ? "Approved" : "Submitted"} color={row.Status === "APPROVED" ? "success" : "submitted"} /> },
];

// Secondary sales from submitted / approved stockist statements, against the manager's targets.
function SalesReport() {
    return (
        <ReportPage
            title="Sales report"
            subtitle="Secondary sales from submitted stockist statements against monthly targets. Months are whole months covered by the dates."
            load={getSalesReport}
            showProduct
            kpis={({ kpis }) => [
                { icon: TrendingUpRounded, label: "Secondary sales", value: formatMoneyCompact(kpis.value), caption: `${kpis.qty} unit(s) sold`, color: "primary" },
                { icon: FlagRounded, label: "Target", value: kpis.targetValue ? formatMoneyCompact(kpis.targetValue) : "—", caption: kpis.targetValue ? "Set by managers" : "No targets set", color: "info" },
                { icon: FlagRounded, label: "Achievement", value: formatPercent(kpis.achievement), caption: "Secondary value vs target", color: ragColor(kpis.achievement, ACHIEVEMENT) === "secondary" ? "warning" : ragColor(kpis.achievement, ACHIEVEMENT), progress: kpis.achievement == null ? undefined : Math.min(100, kpis.achievement) },
                { icon: kpis.stockists ? WarehouseRounded : Inventory2Rounded, label: "Stockists reporting", value: kpis.stockists, caption: `${formatMoneyCompact(kpis.closingValue)} closing stock (last month)`, color: "success" },
            ]}
            charts={({ months }) => (
                <Panel title="Month by month" subtitle="Secondary sales vs target">
                    <GroupedBars
                        ariaLabel="Secondary sales and target per month"
                        format={formatMoneyCompact}
                        series={[
                            { key: "value", label: "Secondary sales", color: (theme) => theme.palette.chart.ours },
                            { key: "targetValue", label: "Target", color: (theme) => theme.palette.chart.competitor },
                        ]}
                        rows={months.map((row) => ({ key: row.month, label: formatMonth(row.month), value: row.value, targetValue: row.targetValue }))}
                    />
                </Panel>
            )}
            note={(data) => (data.truncated ? `More than ${data.rowLimit} statement lines match; showing the first ${data.rowLimit}. Narrow the filters for exact totals.` : null)}
            tabs={(data) => [
                { value: "employees", label: "By employee", title: "By employee", subtitle: `${data.employees.length} employee(s)`, columns: SALES_COLUMNS("Employee"), rows: data.employees, rowKey: (row) => row.key, fileName: "sales-by-employee", empty: "No secondary sales or targets in this period." },
                { value: "products", label: "By product", title: "By product", subtitle: `${data.products.length} product(s)`, columns: SALES_COLUMNS("Product"), rows: data.products, rowKey: (row) => row.key, fileName: "sales-by-product", empty: "No secondary sales or targets in this period." },
                { value: "stockists", label: "By stockist", title: "By stockist", subtitle: `${data.stockists.length} stockist(s)`, columns: SALES_COLUMNS("Stockist", { withTarget: false }), rows: data.stockists, rowKey: (row) => row.key, fileName: "sales-by-stockist", empty: "No statements submitted in this period." },
                { value: "months", label: "By month", title: "By month", subtitle: `${data.months.length} month(s)`, columns: MONTH_COLUMNS, rows: data.months, rowKey: (row) => row.month, fileName: "sales-by-month" },
                { value: "lines", label: "Statement lines", title: "Statement lines", subtitle: `${data.rows.length} line(s)`, columns: LINE_COLUMNS, rows: data.rows, rowKey: (row) => `${row.SalesMonth}-${row.StockistId}-${row.ProductId}`, fileName: "sales-statement-lines", empty: "No statements submitted in this period." },
            ]}
        />
    );
}

export default SalesReport;
