import { useState } from "react";

import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { compact, monthLabel, rupees } from "../index";

const SERIES = [
    { key: "cumulativeCost", label: "Cost (salary + TA/DA)", color: (theme) => theme.palette.error.main, dash: null },
    { key: "cumulativeNet", label: "Net sales", color: (theme) => theme.palette.success.main, dash: null },
    { key: "cumulativeExpected", label: "Expected ramp", color: (theme) => theme.palette.text.secondary, dash: "5 4" },
];

const W = 640;
const H = 240;
const PAD = { left: 56, right: 16, top: 16, bottom: 28 };

// Cumulative cost vs cumulative net sales against the expected ramp curve. Hover a month for values.
function CostChart({ series }) {
    const theme = useTheme();
    const [active, setActive] = useState(null);

    if (!series.length) return null;

    const max = Math.max(1, ...series.flatMap((row) => SERIES.map((s) => Number(row[s.key]) || 0)));
    const min = Math.min(0, ...series.map((row) => Number(row.cumulativeNet) || 0));
    const x = (i) => PAD.left + (series.length === 1 ? (W - PAD.left - PAD.right) / 2 : (i * (W - PAD.left - PAD.right)) / (series.length - 1));
    const y = (v) => PAD.top + ((max - v) * (H - PAD.top - PAD.bottom)) / (max - min || 1);
    const path = (key) => series.map((row, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(Number(row[key]) || 0).toFixed(1)}`).join(" ");
    const ticks = [0, 0.5, 1].map((t) => min + (max - min) * t);
    const hovered = active == null ? null : series[active];

    return (
        <Box>
            <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap", mb: 1 }}>
                {SERIES.map((s) => (
                    <Stack key={s.key} direction="row" sx={{ gap: 0.75, alignItems: "center" }}>
                        <Box sx={{ width: 14, height: 3, borderRadius: 2, backgroundColor: s.color(theme) }} />
                        <Typography variant="caption">{s.label}</Typography>
                    </Stack>
                ))}
            </Stack>

            <Box component="svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cumulative cost versus net sales" sx={{ width: "100%", height: "auto", display: "block" }} onMouseLeave={() => setActive(null)}>
                {ticks.map((tick) => (
                    <g key={tick}>
                        <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} stroke={theme.palette.divider} strokeWidth="1" />
                        <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="11" fill={theme.palette.text.secondary}>
                            {compact(tick)}
                        </text>
                    </g>
                ))}
                {series.map((row, i) => (
                    <text key={row.month} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill={theme.palette.text.secondary}>
                        {i % Math.ceil(series.length / 8) === 0 || i === series.length - 1 ? `M${row.monthNumber}` : ""}
                    </text>
                ))}
                {SERIES.map((s) => (
                    <path key={s.key} d={path(s.key)} fill="none" stroke={s.color(theme)} strokeWidth="2.5" strokeDasharray={s.dash || undefined} strokeLinejoin="round" strokeLinecap="round" />
                ))}
                {series.map((row, i) => (
                    <rect key={row.month} x={x(i) - (W - PAD.left - PAD.right) / Math.max(1, series.length) / 2} y={PAD.top} width={(W - PAD.left - PAD.right) / Math.max(1, series.length)} height={H - PAD.top - PAD.bottom} fill="transparent" onMouseEnter={() => setActive(i)} />
                ))}
                {hovered && <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={H - PAD.bottom} stroke={theme.palette.text.disabled} strokeDasharray="3 3" />}
            </Box>

            <Typography variant="caption" component="p" sx={{ mt: 1, minHeight: theme.spacing(3) }}>
                {hovered
                    ? `${monthLabel(hovered.month)} (month ${hovered.monthNumber}): cost so far ${rupees(hovered.cumulativeCost)} · net sales so far ${rupees(hovered.cumulativeNet)} · expected ${rupees(hovered.cumulativeExpected)}`
                    : "Hover a month to see the numbers."}
            </Typography>
        </Box>
    );
}

export default CostChart;
