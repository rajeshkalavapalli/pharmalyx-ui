import { useRef, useState } from "react";

import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";

const SERIES = [
    { key: "planned", label: "Planned", color: (theme) => theme.palette.chart.competitor },
    { key: "visits", label: "Completed", color: (theme) => theme.palette.chart.ours },
];

const dayLabel = (key) => new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

// Rounded ceiling so grid lines land on whole numbers.
const niceMax = (value, lines) => Math.max(lines, Math.ceil(value / lines) * lines);

// Two lines per day: calls planned in pre-call planning vs visits completed. data: [{ date, planned, visits }].
function PlannedVsCompletedChart({ data }) {
    const theme = useTheme();
    const ref = useRef(null);
    const [active, setActive] = useState(null);

    const { lineChartHeight: height, gridLines, markerSize, tooltipOffset } = theme.dashboard;
    const max = niceMax(Math.max(...data.flatMap((row) => [row.planned, row.visits])), gridLines);
    const width = 100; // viewBox units; the SVG stretches to the container
    const x = (index) => (data.length === 1 ? width / 2 : (index / (data.length - 1)) * width);
    const y = (value) => height - (value / max) * height;

    const onMove = (event) => {
        const rect = ref.current.getBoundingClientRect();
        const ratio = (event.clientX - rect.left) / rect.width;
        setActive(Math.max(0, Math.min(data.length - 1, Math.round(ratio * (data.length - 1)))));
    };

    const row = active == null ? null : data[active];

    return (
        <Box>
            <Stack direction="row" spacing={2} sx={{ mb: 1.5, justifyContent: "flex-end" }}>
                {SERIES.map((series) => (
                    <Stack key={series.key} direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                        <Box sx={{ width: theme.calendar.legendSwatch, height: theme.calendar.legendSwatch, borderRadius: "50%", backgroundColor: series.color(theme) }} />
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {series.label}
                        </Typography>
                    </Stack>
                ))}
            </Stack>

            <Stack direction="row" sx={{ gap: 1 }}>
                {/* y axis */}
                <Box sx={{ position: "relative", width: theme.spacing(2), height, flexShrink: 0 }}>
                    {Array.from({ length: gridLines + 1 }, (_, index) => (
                        <Typography
                            key={index}
                            variant="micro"
                            sx={{ position: "absolute", right: 0, bottom: `${(index / gridLines) * 100}%`, transform: "translateY(50%)", color: theme.palette.text.secondary }}
                        >
                            {Math.round((max / gridLines) * index)}
                        </Typography>
                    ))}
                </Box>

                <Box
                    ref={ref}
                    onMouseMove={onMove}
                    onMouseLeave={() => setActive(null)}
                    sx={{ position: "relative", flex: 1, height, minWidth: 0 }}
                    role="img"
                    aria-label={`Planned calls vs completed visits over the last ${data.length} days`}
                >
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

                    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                        {SERIES.map((series) => (
                            <polyline
                                key={series.key}
                                fill="none"
                                stroke={series.color(theme)}
                                strokeWidth={2}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                vectorEffect="non-scaling-stroke"
                                points={data.map((point, index) => `${x(index)},${y(point[series.key])}`).join(" ")}
                            />
                        ))}
                    </svg>

                    {/* Markers in HTML so they stay round while the SVG stretches. */}
                    {SERIES.map((series) =>
                        data.map((point, index) => (
                            <Box
                                key={`${series.key}-${point.date}`}
                                sx={{
                                    position: "absolute",
                                    left: `${x(index)}%`,
                                    top: y(point[series.key]),
                                    width: markerSize,
                                    height: markerSize,
                                    transform: "translate(-50%, -50%)",
                                    borderRadius: "50%",
                                    backgroundColor: series.color(theme),
                                    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                                    opacity: active === null || active === index ? 1 : 0.35,
                                    transition: theme.calendar.transition,
                                    pointerEvents: "none",
                                }}
                            />
                        ))
                    )}

                    {row && (
                        <>
                            <Box sx={{ position: "absolute", top: 0, bottom: 0, left: `${x(active)}%`, borderLeft: "1px dashed", borderColor: theme.palette.border.strong, pointerEvents: "none" }} />
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: Math.max(0, Math.min(y(row.planned), y(row.visits)) - tooltipOffset),
                                    left: `${x(active)}%`,
                                    transform: `translate(${active > data.length / 2 ? "calc(-100% - 12px)" : "12px"}, -50%)`,
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
                                    {dayLabel(row.date)}
                                </Typography>
                                <Typography variant="caption" component="p" sx={{ color: "inherit" }}>
                                    Planned {row.planned}
                                </Typography>
                                <Typography variant="caption" component="p" sx={{ color: "inherit", fontWeight: "fontWeightBold" }}>
                                    Completed {row.visits}
                                </Typography>
                            </Box>
                        </>
                    )}
                </Box>
            </Stack>

            {/* x axis: every other day keeps 14 labels readable */}
            <Box sx={{ position: "relative", height: theme.spacing(2.5), mt: 0.75, ml: `calc(${theme.spacing(2)} + ${theme.spacing(1)})` }}>
                {data.map((point, index) =>
                    index % 2 === (data.length - 1) % 2 ? (
                        <Typography
                            key={point.date}
                            variant="micro"
                            sx={{
                                position: "absolute",
                                display: { xs: (data.length - 1 - index) % 4 === 0 ? "block" : "none", sm: "block" },
                                left: `${x(index)}%`,
                                transform: index === data.length - 1 ? "translateX(-100%)" : index === 0 ? "none" : "translateX(-50%)",
                                whiteSpace: "nowrap",
                                color: index === data.length - 1 ? theme.palette.text.primary : theme.palette.text.secondary,
                                fontWeight: index === data.length - 1 ? "fontWeightBold" : "fontWeightRegular",
                            }}
                        >
                            {dayLabel(point.date)}
                        </Typography>
                    ) : null
                )}
            </Box>

            {/* Screen-reader copy of the chart. Hidden on a wrapper: a table ignores width and height. */}
            <Box sx={visuallyHidden}>
                <table>
                    <caption>Planned calls and completed visits per day</caption>
                    <thead>
                        <tr>
                            <th scope="col">Day</th>
                            <th scope="col">Planned</th>
                            <th scope="col">Completed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((point) => (
                            <tr key={point.date}>
                                <th scope="row">{dayLabel(point.date)}</th>
                                <td>{point.planned}</td>
                                <td>{point.visits}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </Box>
    );
}

export default PlannedVsCompletedChart;
