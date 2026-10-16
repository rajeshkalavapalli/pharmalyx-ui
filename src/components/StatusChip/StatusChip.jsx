import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

// Pill with a colored dot. `color` is a palette key (primary, success, warning, error, info).
function StatusChip({ label, color = "primary" }) {
    return (
        <Box
            sx={(theme) => ({
                height: theme.statusChip.height,
                px: theme.statusChip.paddingX,
                gap: theme.statusChip.gap,
                display: "inline-flex",
                alignItems: "center",
                borderRadius: theme.statusChip.radius,
                backgroundColor: alpha(theme.palette[color].main, theme.tint.selected),
                border: "1px solid",
                borderColor: alpha(theme.palette[color].main, theme.tint.border),
            })}
        >
            <Box
                sx={(theme) => ({
                    width: theme.statusChip.dotSize,
                    height: theme.statusChip.dotSize,
                    borderRadius: "50%",
                    backgroundColor: theme.palette[color].main,
                    boxShadow: `0 0 0 3px ${alpha(theme.palette[color].main, theme.tint.border)}`,
                })}
            />

            <Typography
                variant="subtitle2"
                component="span"
                sx={(theme) => ({ color: theme.palette[color].dark })}
            >
                {label}
            </Typography>
        </Box>
    );
}

export default StatusChip;
