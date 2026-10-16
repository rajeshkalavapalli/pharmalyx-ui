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
                // Soft accent glow in the top-right corner.
                backgroundImage: `radial-gradient(circle at 100% 0%, ${alpha(
                    theme.palette[color].main,
                    theme.tint.soft
                )} 0%, transparent 55%)`,
                boxShadow: theme.card.shadow,
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
                            color: theme.palette[color].contrastText,
                            backgroundImage:
                                color === "primary"
                                    ? theme.palette.brand.gradient
                                    : `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].light} 100%)`,
                            boxShadow: `0 6px 16px ${alpha(theme.palette[color].main, theme.tint.border)}`,
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
