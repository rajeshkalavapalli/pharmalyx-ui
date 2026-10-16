import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

// Vertical status timeline.
// steps: [{ key, icon, title, caption?, note?, state: "done" | "current" | "upcoming", color }]
// `color` is a palette key.
function TimelineStep({ step, isLast }) {
    const { icon: Icon, state, color } = step;
    const reached = state !== "upcoming";

    return (
        <Stack
            direction="row"
            sx={(theme) => ({
                gap: 1.5,
                pb: isLast ? 0 : theme.timeline.stepGap,
                position: "relative",
            })}
        >
            {!isLast && (
                <Box
                    sx={(theme) => ({
                        position: "absolute",
                        top: theme.timeline.dotSize,
                        bottom: 0,
                        left: `calc(${theme.timeline.dotSize / 2}px - ${theme.timeline.connectorWidth / 2}px)`,
                        width: theme.timeline.connectorWidth,
                        backgroundColor:
                            state === "done"
                                ? alpha(theme.palette[color].main, theme.tint.strong)
                                : theme.palette.border.default,
                    })}
                />
            )}

            <Box
                sx={(theme) => ({
                    width: theme.timeline.dotSize,
                    height: theme.timeline.dotSize,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    color: reached ? theme.palette[color].main : theme.palette.text.disabled,
                    backgroundColor: reached
                        ? alpha(theme.palette[color].main, theme.tint.soft)
                        : theme.palette.surface.muted,
                    boxShadow:
                        state === "current"
                            ? `0 0 0 3px ${alpha(theme.palette[color].main, theme.tint.border)}`
                            : "none",
                })}
            >
                <Icon sx={(theme) => ({ fontSize: theme.timeline.iconSize })} />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                    variant="subtitle2"
                    sx={(theme) => ({
                        color: reached ? theme.palette.text.primary : theme.palette.text.disabled,
                    })}
                >
                    {step.title}
                </Typography>

                {step.caption && (
                    <Typography
                        variant="caption"
                        component="p"
                        sx={(theme) => ({ color: theme.palette.text.secondary })}
                    >
                        {step.caption}
                    </Typography>
                )}

                {step.note && (
                    <Typography
                        variant="body2"
                        sx={(theme) => ({
                            mt: 1,
                            px: 1.5,
                            py: 1,
                            borderRadius: theme.calendar.cell.radius,
                            color: theme.palette.text.primary,
                            backgroundColor: alpha(theme.palette[color].main, theme.tint.hover),
                            borderLeft: `${theme.calendar.cell.markerWidth}px solid`,
                            borderLeftColor: theme.palette[color].main,
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                        })}
                    >
                        {step.note}
                    </Typography>
                )}
            </Box>
        </Stack>
    );
}

function Timeline({ steps }) {
    return (
        <Box>
            {steps.map((step, index) => (
                <TimelineStep key={step.key} step={step} isLast={index === steps.length - 1} />
            ))}
        </Box>
    );
}

export default Timeline;
