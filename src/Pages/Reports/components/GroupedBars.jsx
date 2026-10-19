import { useState } from "react";

import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";

// Two series side by side per group (validated chart pair), hover tooltip, legend, screen-reader table.
// series: [{ key, label, color: (theme) => string }]  rows: [{ key, label, ...values }]
function GroupedBars({ series, rows, format = (value) => value, ariaLabel }) {
    const theme = useTheme();
    const [active, setActive] = useState(null);

    const { chartHeight, barGap, barRadius, gridLines, tooltipOffset } = theme.dashboard;
    const peak = Math.max(1, ...rows.flatMap((row) => series.map((item) => row[item.key] || 0)));

    return (
        <Box>
            <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: "flex-end" }}>
                {series.map((item) => (
                    <Stack key={item.key} direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                        <Box sx={{ width: theme.calendar.legendSwatch, height: theme.calendar.legendSwatch, borderRadius: theme.engagement.swatchRadius, backgroundColor: item.color(theme) }} />
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {item.label}
                        </Typography>
                    </Stack>
                ))}
            </Stack>

            <Box sx={{ position: "relative", height: chartHeight }} onMouseLeave={() => setActive(null)} role="img" aria-label={ariaLabel}>
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

                <Box sx={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))` }}>
                    {rows.map((row, index) => (
                        <Box key={row.key} onMouseEnter={() => setActive(index)} sx={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: `${barGap}px`, height: "100%" }}>
                            {series.map((item) => (
                                <Box
                                    key={item.key}
                                    sx={{
                                        width: theme.engagement.groupedBarWidth,
                                        maxWidth: theme.spacing(4),
                                        height: `${((row[item.key] || 0) / peak) * 100}%`,
                                        borderRadius: `${barRadius}px ${barRadius}px 0 0`,
                                        backgroundColor: item.color(theme),
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
                            bottom: `calc(${(Math.max(...series.map((item) => rows[active][item.key] || 0)) / peak) * 100}% + ${tooltipOffset}px)`,
                            left: `${((active + 0.5) / rows.length) * 100}%`,
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
                            {rows[active].label}
                        </Typography>
                        {series.map((item) => (
                            <Typography key={item.key} variant="caption" component="p" sx={{ color: "inherit" }}>
                                {item.label} {format(rows[active][item.key] || 0)}
                            </Typography>
                        ))}
                    </Box>
                )}
            </Box>

            <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))` }}>
                {rows.map((row) => (
                    <Typography key={row.key} variant="micro" component="p" sx={{ textAlign: "center", color: theme.palette.text.secondary }}>
                        {row.label}
                    </Typography>
                ))}
            </Box>

            {/* Screen-reader copy of the chart. Hidden on a wrapper: a table ignores width and height. */}
            <Box sx={visuallyHidden}>
                <table>
                    <caption>{ariaLabel}</caption>
                    <thead>
                        <tr>
                            <th scope="col">Period</th>
                            {series.map((item) => (
                                <th key={item.key} scope="col">
                                    {item.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.key}>
                                <th scope="row">{row.label}</th>
                                {series.map((item) => (
                                    <td key={item.key}>{format(row[item.key] || 0)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </Box>
    );
}

export default GroupedBars;
