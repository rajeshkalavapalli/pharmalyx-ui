import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

// Centered placeholder for empty lists: icon tile, title, message, optional action.
function EmptyState({ icon: Icon, title, message, action }) {
    return (
        <Box sx={(theme) => ({ py: theme.table.emptyPaddingY, px: 2, textAlign: "center" })}>
            {Icon && (
                <Box
                    sx={(theme) => ({
                        width: theme.stat.iconSize,
                        height: theme.stat.iconSize,
                        mx: "auto",
                        mb: 1.5,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: theme.stat.iconRadius,
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft),
                    })}
                >
                    <Icon />
                </Box>
            )}
            <Typography variant="subtitle1">{title}</Typography>
            {message && (
                <Typography
                    variant="body2"
                    sx={(theme) => ({ mt: 0.5, color: theme.palette.text.secondary, maxWidth: theme.table.emptyMessageMaxWidth, mx: "auto" })}
                >
                    {message}
                </Typography>
            )}
            {action && <Box sx={{ mt: 2 }}>{action}</Box>}
        </Box>
    );
}

export default EmptyState;
