import { useEffect, useId, useRef, useState } from "react";

import { Box, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { ArrowDownwardRounded, ArrowUpwardRounded } from "@mui/icons-material";

import { compactMoney, formatValue, seriesColors } from "./chartUtils";

// Width of the chart box, so SVG text stays at its real size instead of shrinking with the viewBox.
function useWidth(fallback = 600) {
    const ref = useRef(null);
    const [width, setWidth] = useState(fallback);
    useEffect(() => {
        if (!ref.current || typeof ResizeObserver === "undefined") return undefined;
        const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))));
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return [ref, width];
}

// ---------------------------------------------------------------- Mini visuals (for KPI cards)
function Sparkline({ values, color }) {
    const theme = useTheme();
    const id = useId().replace(/:/g, "");
    if (!values?.length || values.every((v) => !v)) return null;
    const { sparkWidth: w, sparkHeight: h } = theme.dashboard.kpi;
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => [(i * w) / (values.length - 1 || 1), h - 3 - ((v || 0) / max) * (h - 6)]);
    const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    return (
        <Box component="svg" viewBox={`0 0 ${w} ${h}`} sx={{ width: w, height: h, display: "block", flexShrink: 0 }} aria-hidden>
            <defs>
                <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#spark-${id})`} />
            <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Box>
    );
}

function MiniRing({ value, color }) {
    const theme = useTheme();
    const { ringSize: size, ringStroke: stroke } = theme.dashboard.kpi;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    return (
        <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }} aria-hidden>
            <Box component="svg" viewBox={`0 0 ${size} ${size}`} sx={{ width: size, height: size, display: "block" }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.palette.surface.muted} strokeWidth={stroke} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${(pct / 100) * c} ${c}`}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Box>
            <Typography variant="micro" sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontWeight: 700 }}>
                {Math.round(pct)}%
            </Typography>
        </Box>
    );
}

function MiniBars({ values, color }) {
    const theme = useTheme();
    if (!values?.length || values.every((v) => !v)) return null;
    const { barWidth, barGap, barHeight } = theme.dashboard.kpi;
    const max = Math.max(...values, 1);
    const w = values.length * barWidth + (values.length - 1) * barGap;
    return (
        <Box component="svg" viewBox={`0 0 ${w} ${barHeight}`} sx={{ width: w, height: barHeight, display: "block", flexShrink: 0 }} aria-hidden>
            {values.map((v, i) => {
                const h = Math.max(3, ((v || 0) / max) * barHeight);
                return (
                    <rect
                        key={i}
                        x={i * (barWidth + barGap)}
                        y={barHeight - h}
                        width={barWidth}
                        height={h}
                        rx={barWidth / 2}
                        fill={color}
                        opacity={i === values.length - 1 ? 1 : 0.35 + (0.5 * i) / values.length}
                    />
                );
            })}
        </Box>
    );
}

// ---------------------------------------------------------------- KPI card: icon, value, trend pill and one mini visual
// Visual: `ring` (a percent), `bars` (mini columns) or `spark` (line); `progress` adds a bar under the value.
export function KpiCard({ icon: Icon, label, value, caption, color = "primary", progress, spark, bars, ring, trend }) {
    const theme = useTheme();
    const main = theme.palette[color]?.main || theme.palette.primary.main;
    const up = trend != null && trend >= 0;
    const trendColor = up ? theme.palette.success.main : theme.palette.error.main;

    return (
        <Box
            sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                borderRadius: theme.card.radius,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.card.shadow,
                transition: theme.calendar.transition,
                "&:hover": { transform: theme.entityCard.hoverLift, borderColor: alpha(main, theme.tint.border) },
            }}
        >
            <Stack direction="row" sx={{ gap: 1.25, alignItems: "center", minWidth: 0 }}>
                <Box sx={{ width: theme.avatar.size, height: theme.avatar.size, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: theme.stat.iconRadius, color: main, backgroundColor: alpha(main, theme.tint.soft) }}>
                    {Icon && <Icon />}
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600, lineHeight: 1.25, minWidth: 0 }}>
                    {label}
                </Typography>
            </Stack>

            <Stack direction="row" sx={{ alignItems: "flex-end", justifyContent: "space-between", gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h4" component="p" noWrap sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                        {value}
                    </Typography>
                    {trend != null && (
                        <Stack
                            direction="row"
                            title="Compared with last month"
                            sx={{ mt: 0.75, px: 0.75, py: 0.25, width: "fit-content", alignItems: "center", gap: 0.25, borderRadius: theme.statusChip.radius, color: trendColor, backgroundColor: alpha(trendColor, theme.tint.soft) }}
                        >
                            {up ? <ArrowUpwardRounded fontSize="inherit" /> : <ArrowDownwardRounded fontSize="inherit" />}
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {Math.abs(trend)}%
                            </Typography>
                        </Stack>
                    )}
                </Box>
                {ring != null ? <MiniRing value={ring} color={main} /> : bars ? <MiniBars values={bars} color={main} /> : <Sparkline values={spark} color={main} />}
            </Stack>

            {progress != null && (
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                    <Box sx={{ flex: 1, height: theme.stat.progressHeight, borderRadius: theme.stat.progressHeight, backgroundColor: theme.palette.surface.muted, overflow: "hidden" }}>
                        <Box sx={{ width: `${Math.min(100, progress)}%`, height: "100%", borderRadius: "inherit", backgroundColor: main }} />
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {Math.round(progress)}%
                    </Typography>
                </Stack>
            )}

            {caption && (
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: "auto" }}>
                    {caption}
                </Typography>
            )}
        </Box>
    );
}

// ---------------------------------------------------------------- Paired bars per period (e.g. planned vs completed)
// rows: [{ key, label, values: [a, b] }]; series: [{ label, color }]. One shared axis.
export function GroupedBars({ rows, series }) {
    const theme = useTheme();
    const [active, setActive] = useState(null);
    const [ref, W] = useWidth();
    const H = theme.dashboard.lineChartHeight + 40;
    const pad = { l: 36, r: 8, t: 12, b: 28 };
    const lines = theme.dashboard.gridLines;
    const peak = Math.max(1, ...rows.flatMap((r) => r.values));
    const step = Math.max(1, Math.ceil(peak / lines));
    const max = step * lines;
    const slot = (W - pad.l - pad.r) / Math.max(1, rows.length);
    const gap = slot * theme.dashboard.groupedBarGap;
    const bw = Math.max(2, (slot - gap * 2) / series.length);
    const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
    const ticks = Array.from({ length: lines + 1 }, (_, i) => i * step);
    const labelEvery = Math.ceil(rows.length / Math.max(2, Math.floor(W / 56)));

    return (
        <Box ref={ref} sx={{ position: "relative" }} onMouseLeave={() => setActive(null)}>
            <Stack direction="row" sx={{ gap: 2, mb: 1, justifyContent: "flex-end" }}>
                {series.map((s) => (
                    <Stack key={s.label} direction="row" sx={{ gap: 0.75, alignItems: "center" }}>
                        <Box sx={{ width: theme.calendar.legendSwatch, height: theme.calendar.legendSwatch, borderRadius: "50%", backgroundColor: s.color }} />
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {s.label}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
            <Box component="svg" viewBox={`0 0 ${W} ${H}`} sx={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={series.map((s) => s.label).join(" vs ")}>
                {ticks.map((t) => (
                    <g key={t}>
                        <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={theme.palette.divider} strokeDasharray="3 4" />
                        <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={theme.palette.text.secondary}>
                            {t}
                        </text>
                    </g>
                ))}
                {rows.map((row, i) => {
                    const x0 = pad.l + i * slot;
                    return (
                        <g key={row.key} onMouseEnter={() => setActive(i)}>
                            <rect x={x0} y={pad.t} width={slot} height={H - pad.t - pad.b} rx="6" fill={active === i ? alpha(theme.palette.primary.main, theme.tint.selected) : "transparent"} />
                            {row.values.map((v, j) => {
                                const h = v ? Math.max(2, H - pad.b - y(v)) : 0;
                                return <rect key={j} x={x0 + gap + j * bw} y={H - pad.b - h} width={Math.max(1, bw - 2)} height={h} rx={Math.min(theme.dashboard.barRadius, (bw - 2) / 2)} fill={series[j].color} />;
                            })}
                            {i % labelEvery === 0 && (
                                <text x={x0 + slot / 2} y={H - 8} textAnchor="middle" fontSize="11" fill={active === i ? theme.palette.text.primary : theme.palette.text.secondary} fontWeight={active === i ? 700 : 400}>
                                    {row.label}
                                </text>
                            )}
                        </g>
                    );
                })}
            </Box>
            {active != null && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: `${((pad.l + (active + 0.5) * slot) / W) * 100}%`,
                        transform: "translateX(-50%)",
                        px: 1.25,
                        py: 0.75,
                        pointerEvents: "none",
                        borderRadius: theme.calendar.cell.radius,
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.card.shadow,
                        whiteSpace: "nowrap",
                    }}
                >
                    <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>
                        {rows[active].label}
                    </Typography>
                    {series.map((s, j) => (
                        <Typography key={s.label} variant="caption" sx={{ display: "block", color: theme.palette.text.secondary }}>
                            {s.label}: <b>{rows[active].values[j]}</b>
                        </Typography>
                    ))}
                </Box>
            )}
        </Box>
    );
}

// ---------------------------------------------------------------- Line / area chart for monthly series
export function LineChart({ items, money, unit }) {
    const theme = useTheme();
    const id = useId().replace(/:/g, "");
    const [active, setActive] = useState(null);
    const color = theme.palette.chart.primary;
    const [ref, W] = useWidth();
    const H = theme.dashboard.lineChartHeight + 40;
    const pad = { l: 44, r: 16, t: 16, b: 28 };
    // Round axis steps (1, 2, 2.5, 5 × 10ⁿ) so ticks read 0 / 25 / 50 / 75 / 100, not 0 / 28.7 / 57.5.
    const peak = Math.max(1, ...items.map((i) => i.value));
    const magnitude = 10 ** Math.floor(Math.log10(peak / 4));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s * 4 >= peak);
    const max = step * 4;
    const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, items.length - 1);
    const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
    const pts = items.map((item, i) => [x(i), y(item.value)]);
    // Smooth curve (cardinal spline -> cubic Bézier).
    const curve = pts
        .map(([px, py], i) => {
            if (!i) return `M${px},${py}`;
            const [x0, y0] = pts[i - 1];
            const cx = (x0 + px) / 2;
            return `C${cx},${y0} ${cx},${py} ${px},${py}`;
        })
        .join(" ");
    const ticks = [0, 1, 2, 3, 4].map((t) => step * t);
    const label = (v) => (money ? compactMoney(v) : Math.round(v * 100) / 100);

    return (
        <Box ref={ref} sx={{ position: "relative" }} onMouseLeave={() => setActive(null)}>
            <Box component="svg" viewBox={`0 0 ${W} ${H}`} sx={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Trend by month">
                <defs>
                    <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {ticks.map((t) => (
                    <g key={t}>
                        <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={theme.palette.divider} strokeDasharray="3 4" />
                        <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={theme.palette.text.secondary}>
                            {label(t)}
                        </text>
                    </g>
                ))}
                <path d={`${curve} L${x(items.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`} fill={`url(#area-${id})`} />
                <path d={curve} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
                {pts.map(([px, py], i) => (
                    <g key={items[i].key}>
                        <circle cx={px} cy={py} r={active === i ? 6 : 4.5} fill={theme.palette.background.paper} stroke={color} strokeWidth="2.5" />
                        <text x={px} y={H - 8} textAnchor="middle" fontSize="11" fill={active === i ? theme.palette.text.primary : theme.palette.text.secondary} fontWeight={active === i ? 700 : 400}>
                            {items[i].label}
                        </text>
                        <rect x={px - (W - pad.l - pad.r) / items.length / 2} y={0} width={(W - pad.l - pad.r) / items.length} height={H} fill="transparent" onMouseEnter={() => setActive(i)} />
                    </g>
                ))}
            </Box>
            {active != null && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: `${(x(active) / W) * 100}%`,
                        transform: "translateX(-50%)",
                        px: 1.25,
                        py: 0.75,
                        borderRadius: theme.field.radius,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.card.shadow,
                        border: `1px solid ${theme.palette.divider}`,
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                    }}
                >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {items[active].label}: {formatValue(items[active].value, money, unit)}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

// ---------------------------------------------------------------- Donut with legend
export function DonutChart({ items, money, unit }) {
    const theme = useTheme();
    const colors = seriesColors(theme);
    const size = theme.dashboard.donutSize;
    const stroke = theme.dashboard.donutStroke + 4;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const total = items.reduce((s, i) => s + i.value, 0);
    const top = [...items].sort((a, b) => b.value - a.value)[0];
    let offset = 0;

    return (
        <Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: "center", gap: 3, justifyContent: "center", py: 1 }}>
            <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
                <Box component="svg" viewBox={`0 0 ${size} ${size}`} sx={{ width: size, height: size, transform: "rotate(-90deg)" }} role="img" aria-label="Split">
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.palette.surface.muted} strokeWidth={stroke} />
                    {total > 0 &&
                        items.map((item, i) => {
                            const len = (item.value / total) * c;
                            const gap = items.filter((x) => x.value).length > 1 ? theme.dashboard.donutGap : 0;
                            const seg = (
                                <circle
                                    key={item.key}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={r}
                                    fill="none"
                                    stroke={colors[i % colors.length]}
                                    strokeWidth={stroke}
                                    strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
                                    strokeDashoffset={-offset}
                                    strokeLinecap="butt"
                                />
                            );
                            offset += len;
                            return seg;
                        })}
                </Box>
                <Stack sx={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                    <Typography variant="h5" component="p" sx={{ fontWeight: 700 }}>
                        {total ? `${Math.round((top.value / total) * 100)}%` : "0"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {total ? top.label : "No data"}
                    </Typography>
                </Stack>
            </Box>
            <Stack sx={{ gap: 1.25, minWidth: 0, flex: 1, maxWidth: theme.spacing(34) }}>
                {items.map((item, i) => (
                    <Stack key={item.key} direction="row" sx={{ alignItems: "center", gap: 1.25 }}>
                        <Box sx={{ width: theme.spacing(1.25), height: theme.spacing(1.25), borderRadius: "50%", flexShrink: 0, backgroundColor: colors[i % colors.length] }} />
                        <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                            {item.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {money ? compactMoney(item.value) : item.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, width: theme.spacing(4.5), textAlign: "right" }}>
                            {total ? `${Math.round((item.value / total) * 100)}%` : ""}
                        </Typography>
                    </Stack>
                ))}
                {!money && unit && (
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {total} {total === 1 ? (unit === "people" ? "person" : unit.replace(/s$/, "")) : unit} in all
                    </Typography>
                )}
            </Stack>
        </Stack>
    );
}

// ---------------------------------------------------------------- Ranked list with progress bars
export function RankList({ items, money, unit }) {
    const theme = useTheme();
    const colors = seriesColors(theme);
    const sorted = [...items].sort((a, b) => b.value - a.value);
    const max = Math.max(1, ...sorted.map((i) => i.value));

    return (
        <Stack sx={{ gap: 1.75 }}>
            {sorted.map((item, i) => {
                const color = colors[i % colors.length];
                return (
                    <Stack key={item.key} direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ width: theme.spacing(3.25), height: theme.spacing(3.25), flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", color, backgroundColor: alpha(color, theme.tint.soft) }}>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {i + 1}
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                    {item.label}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
                                    {money ? compactMoney(item.value) : `${item.value}${unit ? ` ${unit}` : ""}`}
                                </Typography>
                            </Stack>
                            <Box sx={{ height: theme.stat.progressHeight, borderRadius: theme.stat.progressHeight, backgroundColor: theme.palette.surface.muted, overflow: "hidden" }}>
                                <Box sx={{ width: `${(item.value / max) * 100}%`, height: "100%", borderRadius: "inherit", backgroundColor: color }} />
                            </Box>
                            {item.detail && (
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                    {item.detail}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                );
            })}
        </Stack>
    );
}
