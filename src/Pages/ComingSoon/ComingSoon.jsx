import { Box, Button, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ConstructionRounded, DashboardRounded } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

import Panel from "../../components/Panel/Panel";
import navigation from "../../screen/naviagation/Navigation";

// Finds the sidebar label for a path, so the page can name what is coming.
const findLabel = (items, path) => {
    for (const item of items) {
        if (item.path && item.path.replace(/^\/?/, "/") === path) return item.label;

        if (item.children) {
            const label = findLabel(item.children, path);
            if (label) return label;
        }
    }

    return null;
};

// Shown for sidebar links whose module is not built yet, and for unknown URLs.
function ComingSoon() {
    const location = useLocation();
    const navigate = useNavigate();

    const label = findLabel(navigation, location.pathname);

    return (
        <Panel>
            <Box sx={{ py: 8, textAlign: "center" }}>
                <Box
                    sx={(theme) => ({
                        width: theme.stat.iconSize,
                        height: theme.stat.iconSize,
                        mx: "auto",
                        mb: 2,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: theme.stat.iconRadius,
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft),
                    })}
                >
                    <ConstructionRounded sx={(theme) => ({ fontSize: theme.stat.iconFontSize })} />
                </Box>

                <Typography variant="h4" component="h1">
                    {label ? `${label} is coming soon` : "Page not found"}
                </Typography>

                <Typography
                    variant="body2"
                    sx={(theme) => ({ mt: 1, color: theme.palette.text.secondary })}
                >
                    {label
                        ? "This module is part of the Pharmalyx roadmap and isn't available yet."
                        : `Nothing lives at ${location.pathname}.`}
                </Typography>

                <Button
                    variant="outlined"
                    startIcon={<DashboardRounded />}
                    onClick={() => navigate("/dashboard")}
                    sx={{ mt: 3 }}
                >
                    Go to dashboard
                </Button>
            </Box>
        </Panel>
    );
}

export default ComingSoon;
