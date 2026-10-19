import { useState } from "react";

import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";

import { formatAmount, formatMoneyCompact } from "../index";

const SERIES = [
    { key: "pob", label: "POB", color: (theme) => theme.palette.chart.ours },
    { key: "secondary", label: "Secondary sales", color: (theme) => theme.palette.chart.competitor },
];

const shortMonth = (month) => new Date(`${month}T00:00:00`).toLocaleDateString("en-GB", { month: "short" });
const longMonth = (month) => new Date(`${month}T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

// Grouped bars per month: POB booked vs secondary sales. Hover a month for values.
function TrendChart({ data }) {
    const theme = useTheme();
    const [active, setActive] = useState(null);

    const { chartHeight, barGap, barRadius, gridLines, tooltipOffset } = theme.dashboard;
    const peak = Math.max(1, ...data.flatMap((row) => [row.pob, row.secondary]));
    const caption = "POB and secondary sales by month";

    return (
        <Box sx={{ position: "relative" }}>
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

            <Box sx={{ position: "relative", height: chartHeight }} onMouseLeave={() => setActive(null)} aria-hidden="true">
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

                <Box sx={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
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
                            bottom: `calc(${(Math.max(data[active].pob, data[active].secondary) / peak) * 100}% + ${tooltipOffset}px)`,
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
                            {longMonth(data[active].month)}
                        </Typography>
                        <Typography variant="caption" component="p" sx={{ color: "inherit" }}>
                            POB {formatAmount(data[active].pob)} · {data[active].orders} order(s)
                        </Typography>
                        <Typography variant="caption" component="p" sx={{ color: "inherit" }}>
                            Secondary {formatAmount(data[active].secondary)}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }} aria-hidden="true">
                {data.map((row) => (
                    <Box key={row.month} sx={{ textAlign: "center" }}>
                        <Typography variant="micro" component="p" sx={{ color: theme.palette.text.secondary }}>
                            {shortMonth(row.month)}
                        </Typography>
                        <Typography variant="micro" component="p" sx={{ color: theme.palette.text.primary, fontWeight: "fontWeightSemibold" }}>
                            {row.secondary ? formatMoneyCompact(row.secondary) : "—"}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Table view for screen readers */}
            {/* Screen-reader copy of the chart. Hidden on a wrapper: a table ignores width and height. */}
            <Box sx={visuallyHidden}>
                <table>
                    <caption>{caption}</caption>
                    <thead>
                        <tr>
                            <th scope="col">Month</th>
                            <th scope="col">POB</th>
                            <th scope="col">Secondary sales</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.month}>
                                <th scope="row">{longMonth(row.month)}</th>
                                <td>{formatAmount(row.pob)}</td>
                                <td>{formatAmount(row.secondary)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </Box>
    );
}

export default TrendChart;
