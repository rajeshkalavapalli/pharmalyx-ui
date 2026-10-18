// Shared helpers for the dashboard module charts.

// Colours for categories, in a fixed order (never cycled by rank).
export const seriesColors = (theme) => [theme.palette.chart.primary, theme.palette.chart.success, theme.palette.chart.warning, theme.palette.chart.secondary, theme.palette.chart.error, theme.palette.chart.neutral];

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const compactMoney = (n) => {
    const v = Number(n) || 0;
    if (Math.abs(v) >= 10000000) return `₹${(v / 10000000).toFixed(1)} Cr`;
    if (Math.abs(v) >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
    if (Math.abs(v) >= 1000) return `₹${(v / 1000).toFixed(1)} K`;
    return `₹${Math.round(v)}`;
};
export const formatValue = (value, money, unit) => (money ? inr.format(value) : `${value}${unit ? ` ${unit}` : ""}`);
