import { useEffect, useState } from "react";

import { Box, Stack, Typography } from "@mui/material";
import { HistoryRounded } from "@mui/icons-material";

import Tag from "../../../components/Tag/Tag";
import {
    FEEDBACK,
    addDays,
    formatShortDate,
    formatTimeRange,
    getVisits,
    todayKey,
} from "../../Visits/index";

const HISTORY_DAYS = 365;
const HISTORY_LIMIT = 5;

// Last few visits by `userId` to one doctor.
function RecentVisits({ doctorId, userId }) {
    const [state, setState] = useState({ loading: true, visits: [], failed: false });

    useEffect(() => {
        let active = true;

        setState({ loading: true, visits: [], failed: false });

        getVisits({ userId, doctorId, from: addDays(todayKey(), -HISTORY_DAYS), to: todayKey() })
            .then((response) => {
                if (active) setState({ loading: false, visits: response?.visits || [], failed: false });
            })
            .catch(() => {
                if (active) setState({ loading: false, visits: [], failed: true });
            });

        return () => {
            active = false;
        };
    }, [doctorId, userId]);

    if (state.loading || state.failed || state.visits.length === 0) {
        return (
            <Box
                sx={(theme) => ({
                    p: 2.5,
                    textAlign: "center",
                    borderRadius: theme.calendar.cell.radius,
                    border: "1px dashed",
                    borderColor: theme.palette.plan.empty,
                    backgroundColor: theme.palette.surface.subtle,
                })}
            >
                <HistoryRounded sx={(theme) => ({ color: theme.palette.text.disabled })} />
                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {state.loading
                        ? "Loading visits…"
                        : state.failed
                          ? "Visit history is unavailable right now."
                          : "No visits in the last 12 months."}
                </Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={1.25}>
            {state.visits.slice(0, HISTORY_LIMIT).map((visit) => {
                const feedback = FEEDBACK[visit.Feedback];

                return (
                    <Stack
                        key={visit.VisitId}
                        direction="row"
                        spacing={1.5}
                        sx={(theme) => ({
                            alignItems: "flex-start",
                            p: 1.5,
                            borderRadius: theme.calendar.cell.radius,
                            backgroundColor: theme.palette.surface.subtle,
                        })}
                    >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2">
                                {formatShortDate(visit.VisitDate)}
                                <Typography
                                    component="span"
                                    variant="caption"
                                    sx={(theme) => ({ ml: 1, color: theme.palette.text.secondary })}
                                >
                                    {formatTimeRange(visit.StartTime, visit.EndTime)}
                                </Typography>
                            </Typography>

                            {visit.Notes && (
                                <Typography
                                    variant="body2"
                                    sx={(theme) => ({
                                        mt: 0.5,
                                        color: theme.palette.text.secondary,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                    })}
                                >
                                    {visit.Notes}
                                </Typography>
                            )}
                        </Box>

                        {feedback && <Tag label={feedback.label} color={feedback.color} />}
                    </Stack>
                );
            })}

            {state.visits.length > HISTORY_LIMIT && (
                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    Showing the latest {HISTORY_LIMIT} of {state.visits.length} visits in the last 12 months.
                </Typography>
            )}
        </Stack>
    );
}

export default RecentVisits;
