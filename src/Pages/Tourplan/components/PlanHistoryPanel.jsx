import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

import Panel from "../../../components/Panel/Panel";
import StatusChip from "../../../components/StatusChip/StatusChip";
import { PLAN_STATUS, formatMonthLabel } from "../index";

// Recent months with their approval status; clicking one opens that month.
function PlanHistoryPanel({ history, currentMonth, onSelect }) {
    return (
        <Panel title="Plan history" subtitle="Your recent months and their status">
            {history.length === 0 ? (
                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    No tour plans yet. Save your first month as a draft to start.
                </Typography>
            ) : (
                <Stack spacing={0.5}>
                    {history.map((item) => {
                        const status = PLAN_STATUS[item.Status] || PLAN_STATUS.DRAFT;
                        const selected = item.PlanMonth === currentMonth;

                        return (
                            <ButtonBase
                                key={item.TourPlanId}
                                onClick={() => onSelect(item.PlanMonth)}
                                aria-current={selected ? "true" : undefined}
                                sx={(theme) => ({
                                    width: "100%",
                                    gap: 1.5,
                                    p: 1.25,
                                    justifyContent: "flex-start",
                                    textAlign: "left",
                                    borderRadius: theme.calendar.cell.radius,
                                    backgroundColor: selected ? alpha(theme.palette.primary.main, theme.tint.selected) : "transparent",
                                    transition: theme.calendar.transition,
                                    "&:hover": { backgroundColor: selected ? alpha(theme.palette.primary.main, theme.tint.selected) : theme.palette.surface.muted },
                                })}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2">{formatMonthLabel(item.PlanMonth)}</Typography>
                                    <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {item.DaysPlanned}/{item.TotalDays} days
                                        {item.ReviewedByName ? ` · by ${item.ReviewedByName}` : ""}
                                    </Typography>
                                </Box>
                                <StatusChip label={status.label} color={status.color} />
                            </ButtonBase>
                        );
                    })}
                </Stack>
            )}
        </Panel>
    );
}

export default PlanHistoryPanel;
