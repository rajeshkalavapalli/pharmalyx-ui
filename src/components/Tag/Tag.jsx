import { Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

// Small tinted label with an optional icon. `color` is a palette key.
function Tag({ icon: Icon, label, color = "secondary", title }) {
    return (
        <Typography
            variant="micro"
            title={title}
            sx={(theme) => ({
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1,
                py: 0.25,
                maxWidth: "100%",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                borderRadius: theme.statusChip.radius,
                fontWeight: theme.typography.subtitle2.fontWeight,
                color: theme.palette[color].dark,
                backgroundColor: alpha(theme.palette[color].main, theme.tint.selected),
            })}
        >
            {Icon && <Icon fontSize="inherit" />}
            {label}
        </Typography>
    );
}

export default Tag;
