import { useMemo } from "react";

import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

import {
    DAY_STATUS,
    HIGHLIGHT_STATUSES,
    WEEKDAY_LABELS,
    buildMonthGrid,
    todayKey,
} from "../index";

const LEGEND = ["APPROVED", "SUBMITTED", "DUE", "RETURNED", "MISSED", "OFF"];

function Dot({ color }) {
    return (
        <Box
            component="span"
            sx={(theme) => ({
                width: theme.dcr.dotSize,
                height: theme.dcr.dotSize,
                flexShrink: 0,
                borderRadius: "50%",
                backgroundColor: theme.palette[color].main,
            })}
        />
    );
}

// Month grid coloured by each day's DCR status.
function DcrCalendar({ month, days, selectedDate, onSelect }) {
    const weeks = useMemo(() => buildMonthGrid(month), [month]);
    const byDate = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);
    const today = todayKey();

    return (
        <Box>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    gap: 0.5,
                    mb: 1,
                }}
            >
                {WEEKDAY_LABELS.map((label) => (
                    <Typography
                        key={label}
                        variant="overline"
                        sx={(theme) => ({ textAlign: "center", color: theme.palette.text.secondary })}
                    >
                        {label.slice(0, 2)}
                    </Typography>
                ))}
            </Box>

            <Box sx={{ display: "grid", gap: 0.5 }}>
                {weeks.map((week) => (
                    <Box
                        key={week[0].key}
                        sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 0.5 }}
                    >
                        {week.map(({ key, day, inMonth }) => {
                            if (!inMonth) return <Box key={key} />;

                            const info = byDate.get(key);
                            const status = DAY_STATUS[info?.status];
                            const highlight = status && HIGHLIGHT_STATUSES.includes(info.status);
                            const selected = key === selectedDate;
                            const isToday = key === today;

                            return (
                                <ButtonBase
                                    key={key}
                                    onClick={() => onSelect(key)}
                                    aria-label={`${key}${status ? `, ${status.label}` : ""}`}
                                    aria-pressed={selected}
                                    sx={(theme) => ({
                                        minHeight: theme.dcr.cellMinHeight,
                                        p: 0.75,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        justifyContent: "space-between",
                                        borderRadius: theme.calendar.cell.radius,
                                        border: "1px solid",
                                        borderColor: selected
                                            ? theme.palette.primary.main
                                            : highlight
                                              ? alpha(theme.palette[status.color].main, theme.tint.border)
                                              : theme.palette.border.subtle,
                                        backgroundColor: highlight
                                            ? alpha(theme.palette[status.color].main, theme.tint.selected)
                                            : theme.palette.surface.subtle,
                                        boxShadow: selected
                                            ? `0 0 0 3px ${alpha(theme.palette.primary.main, theme.tint.border)}`
                                            : "none",
                                        transition: theme.calendar.transition,

                                        "&:hover": { borderColor: theme.palette.border.strong },
                                    })}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={(theme) => ({
                                            color: isToday
                                                ? theme.palette.primary.main
                                                : info?.status === "UPCOMING"
                                                  ? theme.palette.text.disabled
                                                  : theme.palette.text.primary,
                                            textDecoration: isToday ? "underline" : "none",
                                            textUnderlineOffset: 3,
                                        })}
                                    >
                                        {day}
                                    </Typography>

                                    {highlight && (
                                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", minWidth: 0 }}>
                                            <Dot color={status.color} />
                                            {info.visitCount > 0 && (
                                                <Typography
                                                    variant="micro"
                                                    sx={(theme) => ({
                                                        display: { xs: "none", sm: "inline" },
                                                        color: theme.palette.text.secondary,
                                                    })}
                                                >
                                                    {info.visitCount}
                                                </Typography>
                                            )}
                                        </Stack>
                                    )}
                                </ButtonBase>
                            );
                        })}
                    </Box>
                ))}
            </Box>

            <Stack direction="row" sx={{ mt: 2, gap: 1.5, flexWrap: "wrap" }}>
                {LEGEND.map((key) => (
                    <Stack key={key} direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                        <Dot color={DAY_STATUS[key].color} />
                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            {DAY_STATUS[key].label}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Box>
    );
}

export default DcrCalendar;
