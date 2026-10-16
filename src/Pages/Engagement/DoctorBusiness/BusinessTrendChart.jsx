import { useState } from "react";

import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { formatMoney, formatMoneyCompact, formatShortMonth } from "../index";

const SERIES = [
    { key: "expected", label: "Expected", color: (theme) => theme.palette.chart.competitor },
    { key: "actual", label: "Actual", color: (theme) => theme.palette.chart.ours },
];

// Grouped bars per month: expected vs actual business. Hover a month for values.
function BusinessTrendChart({ data }) {
    const theme = useTheme();
    const [active, setActive] = useState(null);

    const { chartHeight, barGap, barRadius, gridLines, tooltipOffset } = theme.dashboard;
    const peak = Math.max(1, ...data.flatMap((row) => [row.expected, row.actual]));

    return (
        <Box>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                {SERIES.map((series) => (
                    <Stack key={series.key} direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                        <Box sx={{ width: theme.calendar.legendSwatch, height: theme.calendar.legendSwatch, borderRadius: theme.engagement.swatchRadius, backgroundColor: series.color(theme) }} />
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {series.label}
                        </Typography>
                    </Stack>
                ))}
            </Stack>

            <Box sx={{ position: "relative", height: chartHeight }} onMouseLeave={() => setActive(null)}>
                {Array.from({ length: gridLines + 1 }, (_, index) => (
                    <Box
                        key={index}
                        sx={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: `${(index / gridLines) * 100}%`,
                            borderTop: "1px solid",
                            borderColor: index === 0 ? theme.palette.border.strong : theme.palette.border.subtle,
                        }}
                    />
                ))}

                <Box
                    role="img"
                    aria-label={data.map((row) => `${formatShortMonth(row.month)}: expected ${formatMoney(row.expected)}, actual ${formatMoney(row.actual)}`).join("; ")}
                    sx={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
                >
                    {data.map((row, index) => (
                        <Box
                            key={row.month}
                            onMouseEnter={() => setActive(index)}
                            sx={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: `${barGap}px`, height: "100%" }}
                        >
                            {SERIES.map((series) => (
                                <Box
                                    key={series.key}
                                    sx={{
                                        width: theme.engagement.groupedBarWidth,
                                        height: `${(row[series.key] / peak) * 100}%`,
                                        borderRadius: `${barRadius}px ${barRadius}px 0 0`,
                                        backgroundColor: series.color(theme),
                                        opacity: active === null || active === index ? 1 : 0.45,
                                        transition: theme.calendar.transition,
                                    }}
                                />
                            ))}
                        </Box>
                    ))}
                </Box>

                {active !== null && (
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: `calc(${(Math.max(data[active].expected, data[active].actual) / peak) * 100}% + ${tooltipOffset}px)`,
                            left: `${((active + 0.5) / data.length) * 100}%`,
                            transform: "translateX(-50%)",
                            px: 1.25,
                            py: 0.75,
                            borderRadius: theme.sidebarLayout.radius,
                            backgroundColor: theme.palette.secondary.dark,
                            color: theme.palette.secondary.contrastText,
                            boxShadow: theme.elevation.lg,
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                            zIndex: 1,
                        }}
                    >
                        <Typography variant="micro" component="p" sx={{ color: "inherit", opacity: 0.75 }}>
                            {formatShortMonth(data[active].month)}
                        </Typography>
                        <Typography variant="caption" component="p" sx={{ color: "inherit" }}>
                            Expected {formatMoney(data[active].expected)}
                        </Typography>
                        <Typography variant="caption" component="p" sx={{ color: "inherit", fontWeight: 700 }}>
                            Actual {formatMoney(data[active].actual)}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
                {data.map((row) => (
                    <Box key={row.month} sx={{ textAlign: "center" }}>
                        <Typography variant="micro" component="p" sx={{ color: theme.palette.text.secondary }}>
                            {formatShortMonth(row.month)}
                        </Typography>
                        <Typography variant="micro" component="p" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                            {row.actual ? formatMoneyCompact(row.actual) : "—"}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

export default BusinessTrendChart;
