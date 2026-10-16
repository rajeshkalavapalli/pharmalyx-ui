import { useEffect, useMemo, useRef, useState } from "react";

import { Box, ButtonBase, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AddRounded,
    ChatBubbleOutlineRounded,
    PlaceRounded,
} from "@mui/icons-material";

import { DAY_TYPE, WEEKDAY_LABELS, buildMonthGrid, isDayComplete, todayKey } from "../index";

const isWeekend = (weekday) => weekday >= 5;

// Every in-month date between two keys (inclusive), in calendar order.
const rangeBetween = (from, to, monthDays) => {
    const [start, end] = from <= to ? [from, to] : [to, from];
    return monthDays.filter((key) => key >= start && key <= end);
};

// =========================================================
// CELL STYLES
// =========================================================

const cellSx = (theme, { inMonth, interactive, plan, selected, weekend }) => {
    const { cell, transition, hatchSize } = theme.calendar;
    const { plan: colors } = theme.palette;

    const base = {
        width: "100%",
        height: "100%",
        minHeight: cell.minHeight,
        p: cell.padding,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        textAlign: "left",
        position: "relative",
        overflow: "hidden",
        borderRadius: cell.radius,
        border: "1px solid",
        borderColor: "transparent",
        transition,
        cursor: interactive ? "pointer" : "default",

        "&:focus-visible": {
            outline: "none",
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, theme.tint.border)}`,
        },
    };

    if (!inMonth) {
        return { ...base, backgroundColor: "transparent" };
    }

    let state;

    if (!plan) {
        state = {
            backgroundColor: weekend
                ? theme.palette.surface.muted
                : theme.palette.surface.subtle,
            borderColor: theme.palette.border.subtle,

            ...(interactive && {
                "&:hover": {
                    backgroundColor: theme.palette.background.paper,
                    borderColor: colors.empty,
                    borderStyle: "dashed",
                },
                "&:hover .plan-add-hint": { opacity: 1 },
            }),
        };
    } else if (plan.dayType === DAY_TYPE.OFF) {
        state = {
            borderColor: theme.palette.border.default,
            backgroundColor: colors.offSoft,
            backgroundImage: `repeating-linear-gradient(135deg, transparent 0 ${hatchSize}px, ${colors.offHatch} ${hatchSize}px ${hatchSize * 2}px)`,
        };
    } else {
        const marker = isDayComplete(plan) ? colors.working : theme.palette.warning.main;

        state = {
            backgroundColor: colors.workingSoft,
            borderColor: colors.workingBorder,

            "&::before": {
                content: '""',
                position: "absolute",
                insetBlock: 0,
                left: 0,
                width: cell.markerWidth,
                backgroundColor: marker,
            },
        };
    }

    const hover = interactive && plan && {
        "&:hover": {
            borderColor: theme.palette.border.strong,
            boxShadow: theme.card.shadow,
        },
    };

    const selection = selected && {
        borderColor: theme.palette.primary.main,
        borderStyle: "solid",
        backgroundColor: alpha(theme.palette.primary.main, theme.tint.selected),
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, theme.tint.border)}`,
    };

    return { ...base, ...state, ...hover, ...selection };
};

// =========================================================
// CELL CONTENT
// =========================================================

function DateBadge({ day, inMonth, isToday, weekend }) {
    return (
        <Box
            sx={(theme) => ({
                width: theme.calendar.dateBadge.size,
                height: theme.calendar.dateBadge.size,
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                flexShrink: 0,
                ...theme.typography.subtitle2,
                color: !inMonth
                    ? theme.palette.text.disabled
                    : weekend
                      ? theme.palette.text.secondary
                      : theme.palette.text.primary,

                ...(isToday && {
                    color: theme.palette.primary.contrastText,
                    backgroundColor: theme.palette.primary.main,
                    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, theme.tint.strong)}`,
                }),
            })}
        >
            {day}
        </Box>
    );
}

const truncate = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

function PlanDetails({ plan }) {
    if (plan.dayType === DAY_TYPE.OFF) {
        return (
            <Typography
                variant="micro"
                sx={(theme) => ({
                    ...truncate,
                    fontWeight: theme.typography.subtitle2.fontWeight,
                    color: theme.palette.plan.off,
                })}
            >
                {plan.remarks || "Off"}
            </Typography>
        );
    }

    if (!isDayComplete(plan)) {
        return (
            <Typography
                variant="micro"
                sx={(theme) => ({
                    ...truncate,
                    fontWeight: theme.typography.subtitle2.fontWeight,
                    color: theme.palette.warning.dark,
                })}
            >
                {plan.territoryName ? "Area missing" : "Location missing"}
            </Typography>
        );
    }

    return (
        <>
            <Typography
                variant="micro"
                sx={(theme) => ({
                    ...truncate,
                    fontWeight: theme.typography.subtitle2.fontWeight,
                    color: theme.palette.plan.working,
                })}
            >
                {plan.territoryName}
            </Typography>

            <Typography
                variant="micro"
                sx={(theme) => ({
                    ...truncate,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.25,
                    color: theme.palette.text.secondary,
                })}
            >
                <PlaceRounded fontSize="inherit" />
                <Box component="span" sx={truncate}>
                    {plan.areaName}
                </Box>
            </Typography>
        </>
    );
}

// =========================================================
// GRID
// =========================================================

function MonthGrid({ month, monthDays, plans, editable, loading, onSelectDates }) {
    const weeks = useMemo(() => buildMonthGrid(month), [month]);
    const today = todayKey();

    // Drag selection: { anchor, current } while the pointer is held down.
    const [drag, setDrag] = useState(null);
    const dragRef = useRef(null);

    const onSelectRef = useRef(onSelectDates);

    useEffect(() => {
        onSelectRef.current = onSelectDates;
    }, [onSelectDates]);

    useEffect(() => {
        const finish = () => {
            const current = dragRef.current;

            if (!current) return;

            dragRef.current = null;
            setDrag(null);
            onSelectRef.current(rangeBetween(current.anchor, current.current, monthDays));
        };

        const cancel = () => {
            dragRef.current = null;
            setDrag(null);
        };

        window.addEventListener("pointerup", finish);
        window.addEventListener("pointercancel", cancel);

        return () => {
            window.removeEventListener("pointerup", finish);
            window.removeEventListener("pointercancel", cancel);
        };
    }, [monthDays]);

    const selected = useMemo(
        () => new Set(drag ? rangeBetween(drag.anchor, drag.current, monthDays) : []),
        [drag, monthDays]
    );

    const handlePointerDown = (event, key) => {
        if (!editable || event.button !== 0) return;

        dragRef.current = { anchor: key, current: key };
        setDrag(dragRef.current);
    };

    const handlePointerMove = (event) => {
        if (!dragRef.current || event.pointerType === "touch") return;

        const target = document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest("[data-plan-date]");

        const key = target?.dataset.planDate;

        if (key && key !== dragRef.current.current) {
            dragRef.current = { ...dragRef.current, current: key };
            setDrag(dragRef.current);
        }
    };

    // Pointer selection is handled above; clicks here come from the keyboard
    // (detail === 0) or from read-only viewing.
    const handleClick = (event, key) => {
        if (event.detail === 0 || !editable) {
            onSelectDates([key]);
        }
    };

    return (
        <Box
            role="grid"
            aria-busy={loading}
            onPointerMove={handlePointerMove}
            sx={(theme) => ({
                userSelect: "none",
                opacity: loading ? theme.calendar.loadingOpacity : 1,
                transition: theme.calendar.transition,
            })}
        >
            {/* WEEKDAY HEADER */}

            <Box
                role="row"
                sx={(theme) => ({
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    gap: theme.calendar.gridGap,
                    pb: theme.calendar.weekdayPaddingY,
                })}
            >
                {WEEKDAY_LABELS.map((label, index) => (
                    <Typography
                        key={label}
                        role="columnheader"
                        variant="overline"
                        sx={(theme) => ({
                            textAlign: "center",
                            color: isWeekend(index)
                                ? theme.palette.text.disabled
                                : theme.palette.text.secondary,
                        })}
                    >
                        {label}
                    </Typography>
                ))}
            </Box>

            {/* WEEKS */}

            <Box
                sx={(theme) => ({
                    display: "grid",
                    gap: theme.calendar.gridGap,
                })}
            >
                {weeks.map((week) => (
                    <Box
                        key={week[0].key}
                        role="row"
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                            gap: theme.calendar.gridGap,
                        })}
                    >
                        {week.map(({ key, day, inMonth, weekday }) => {
                            const plan = inMonth ? plans[key] : null;
                            const interactive = inMonth && (editable || Boolean(plan));
                            const weekend = isWeekend(weekday);

                            return (
                                <Box key={key} role="gridcell" sx={{ minWidth: 0 }}>
                                    <ButtonBase
                                        disableRipple
                                        disabled={!interactive}
                                        data-plan-date={inMonth ? key : undefined}
                                        aria-label={key}
                                        aria-selected={selected.has(key)}
                                        onPointerDown={(event) => handlePointerDown(event, key)}
                                        onClick={(event) => handleClick(event, key)}
                                        sx={(theme) =>
                                            cellSx(theme, {
                                                inMonth,
                                                interactive,
                                                plan,
                                                selected: selected.has(key),
                                                weekend,
                                            })
                                        }
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: 0.5,
                                            }}
                                        >
                                            <DateBadge
                                                day={day}
                                                inMonth={inMonth}
                                                isToday={key === today}
                                                weekend={weekend}
                                            />

                                            {plan?.remarks && plan.dayType === DAY_TYPE.WORKING && (
                                                <ChatBubbleOutlineRounded
                                                    sx={(theme) => ({
                                                        fontSize: theme.typography.micro.fontSize,
                                                        color: theme.palette.text.secondary,
                                                    })}
                                                />
                                            )}
                                        </Box>

                                        {/* Details are hidden on phones; the cell color carries the state. */}
                                        <Box
                                            sx={{
                                                mt: 0.75,
                                                minWidth: 0,
                                                display: { xs: "none", sm: "flex" },
                                                flexDirection: "column",
                                                gap: 0.25,
                                            }}
                                        >
                                            {plan && <PlanDetails plan={plan} />}

                                            {!plan && inMonth && editable && (
                                                <Typography
                                                    className="plan-add-hint"
                                                    variant="micro"
                                                    sx={(theme) => ({
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 0.25,
                                                        opacity: 0,
                                                        transition: theme.calendar.transition,
                                                        color: theme.palette.text.secondary,
                                                        fontWeight: theme.typography.subtitle2.fontWeight,
                                                    })}
                                                >
                                                    <AddRounded fontSize="inherit" />
                                                    Plan
                                                </Typography>
                                            )}
                                        </Box>
                                    </ButtonBase>
                                </Box>
                            );
                        })}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

export default MonthGrid;
