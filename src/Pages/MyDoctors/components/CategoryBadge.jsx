import { Box, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";

import { DOCTOR_CATEGORY } from "../index";

// Compact "A / B / C" marker with the meaning on hover.
function CategoryBadge({ category }) {
    const config = DOCTOR_CATEGORY[category];

    if (!config) return null;

    return (
        <Tooltip title={`${config.label} · ${config.hint}`}>
            <Box
                aria-label={config.label}
                sx={(theme) => ({
                    width: theme.entityCard.badgeSize,
                    height: theme.entityCard.badgeSize,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: theme.calendar.cell.radius,
                    ...theme.typography.subtitle2,
                    color: theme.palette[config.color].dark,
                    backgroundColor: alpha(theme.palette[config.color].main, theme.tint.soft),
                    border: "1px solid",
                    borderColor: alpha(theme.palette[config.color].main, theme.tint.border),
                })}
            >
                {category}
            </Box>
        </Tooltip>
    );
}

export default CategoryBadge;
