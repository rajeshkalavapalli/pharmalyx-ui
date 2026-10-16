import { useState } from "react";

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const visuallyHidden = {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
};

// Rounded "nice" ceiling so grid lines land on whole numbers.
const niceMax = (value, lines) => Math.max(lines, Math.ceil(value / lines) * lines);

const plural = (value, unit) => `${value} ${unit}${value === 1 ? "" : "s"}`;

// Single-series bar chart with a hover tooltip and a screen-reader table.
// items: [{ key, axisLabel, tooltipTitle, value, detail? }]
function BarChart({ items, unit, ariaLabel, highlightKey }) {
    const theme = useTheme();
    const [active, setActive] = useState(null);

    const { chartHeight, barGap, barRadius, gridLines, barWidth, barMinWidth, tooltipOffset } = theme.dashboard;
    const max = niceMax(Math.max(0, ...items.map((item) => item.value)), gridLines);
    const step = max / gridLines;

    return (
        <Box sx={{ position: "relative" }}>
            <Box role="img" aria-label={ariaLabel} sx={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", columnGap: 1.25 }}>
                {/* Y axis */}
                <Box sx={{ position: "relative", height: chartHeight }}>
                    {Array.from({ length: gridLines + 1 }, (_, index) => (
                        <Typography
                            key={index}
                            variant="micro"
                            sx={{
                                position: "absolute",
                                right: 0,
                                bottom: `${(index / gridLines) * 100}%`,
                                transform: "translateY(50%)",
                                color: theme.palette.text.secondary,
                                fontVariantNumeric: "tabular-nums",
                            }}
                        >
                            {Number.isInteger(step) ? step * index : (step * index).toFixed(1)}
                        </Typography>
                    ))}
                </Box>

                {/* Plot */}
                <Box sx={{ position: "relative", height: chartHeight }}>
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
                        sx={{
                            position: "absolute",
                            inset: 0,
                            display: "grid",
                            gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
                            columnGap: `${barGap}px`,
                            alignItems: "end",
                        }}
                        onMouseLeave={() => setActive(null)}
                    >
                        {items.map((item, index) => (
                            // Full-height hit target, larger than the bar.
                            <Box
                                key={item.key}
                                onMouseEnter={() => setActive(index)}
                                sx={{ height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
                            >
                                <Box
                                    sx={{
                                        width: barWidth,
                                        minWidth: barMinWidth,
                                        height: item.value ? `${(item.value / max) * 100}%` : 0,
                                        borderRadius: `${barRadius}px ${barRadius}px 0 0`,
                                        backgroundImage: theme.palette.brand.gradient,
                                        opacity: active === null ? (highlightKey && item.key !== highlightKey ? 0.55 : 1) : active === index ? 1 : 0.45,
                                        transition: theme.calendar.transition,
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>

                    {active !== null && (
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: `calc(${(items[active].value / max) * 100}% + ${tooltipOffset}px)`,
                                left: `${((active + 0.5) / items.length) * 100}%`,
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
                                {items[active].tooltipTitle}
                            </Typography>
                            <Typography variant="subtitle2" component="p" sx={{ color: "inherit" }}>
                                {items[active].detail || plural(items[active].value, unit)}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* X axis */}
                <Box />
                <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`, columnGap: `${barGap}px` }}>
                    {items.map((item, index) => (
                        <Typography
                            key={item.key}
                            variant="micro"
                            sx={{
                                textAlign: "center",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                color: active === index || item.key === highlightKey ? theme.palette.text.primary : theme.palette.text.secondary,
                                fontWeight: item.key === highlightKey ? theme.typography.subtitle2.fontWeight : undefined,
                            }}
                        >
                            {item.axisLabel}
                        </Typography>
                    ))}
                </Box>
            </Box>

            {/* Table view for screen readers */}
            <Box component="table" sx={visuallyHidden}>
                <caption>{ariaLabel}</caption>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.key}>
                            <th scope="row">{item.tooltipTitle}</th>
                            <td>{item.detail || plural(item.value, unit)}</td>
                        </tr>
                    ))}
                </tbody>
            </Box>
        </Box>
    );
}

export default BarChart;
