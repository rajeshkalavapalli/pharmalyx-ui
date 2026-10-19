import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

// KPI tile. `color` is a palette key (primary, success, warning, error, info, secondary).
function StatCard({ icon: Icon, label, value, caption, color = "primary", progress }) {
    return (
        <Paper
            elevation={0}
            sx={(theme) => ({
                p: theme.stat.padding,
                position: "relative",
                overflow: "hidden",
                borderRadius: theme.panel.radius,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.card.shadow,
                // Thin accent line along the top edge.
                "&::before": {
                    content: '""',
                    position: "absolute",
                    insetInline: 0,
                    top: 0,
                    height: theme.spacing(0.375),
                    backgroundColor: alpha(theme.palette[color].main, theme.tint.strong),
                },
                transition: theme.calendar.transition,

                "&:hover": {
                    transform: theme.entityCard.hoverLift,
                    boxShadow: theme.elevation.lg,
                },
            })}
        >
            <Stack
                direction="row"
                sx={(theme) => ({ alignItems: "flex-start", gap: theme.stat.gap })}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="subtitle2"
                        component="p"
                        sx={(theme) => ({ color: theme.palette.text.secondary })}
                    >
                        {label}
                    </Typography>

                    <Typography
                        variant="metric"
                        sx={(theme) => ({ mt: theme.stat.valueMarginTop })}
                    >
                        {value}
                    </Typography>

                    {caption && (
                        <Typography
                            variant="caption"
                            component="p"
                            sx={(theme) => ({ color: theme.palette.text.secondary })}
                        >
                            {caption}
                        </Typography>
                    )}
                </Box>

                {Icon && (
                    <Box
                        sx={(theme) => ({
                            width: theme.stat.iconSize,
                            height: theme.stat.iconSize,
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: theme.stat.iconRadius,
                            color: theme.palette[color].main,
                            backgroundColor: alpha(theme.palette[color].main, theme.tint.soft),
                            border: `1px solid ${alpha(theme.palette[color].main, theme.tint.selected)}`,
                        })}
                    >
                        <Icon sx={(theme) => ({ fontSize: theme.stat.iconFontSize })} />
                    </Box>
                )}
            </Stack>

            {progress != null && (
                <LinearProgress
                    variant="determinate"
                    value={Math.max(0, Math.min(100, progress))}
                    sx={(theme) => ({
                        mt: theme.stat.progressMarginTop,
                        height: theme.stat.progressHeight,
                    })}
                />
            )}
        </Paper>
    );
}

export default StatCard;
