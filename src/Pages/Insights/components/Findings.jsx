import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { InfoRounded, TrendingDownRounded, TrendingUpRounded } from "@mui/icons-material";

import Panel from "../../../components/Panel/Panel";

const TONE = {
    positive: { icon: TrendingUpRounded, color: "success" },
    negative: { icon: TrendingDownRounded, color: "error" },
    neutral: { icon: InfoRounded, color: "info" },
};

// Plain-English findings. items: [{ tone, text }] or [string] (neutral).
function Findings({ title = "Key findings", subtitle, items, sx }) {
    return (
        <Panel title={title} subtitle={subtitle} sx={sx}>
            <Stack spacing={1.25}>
                {items.map((item, index) => {
                    const finding = typeof item === "string" ? { tone: "neutral", text: item } : item;
                    const { icon: Icon, color } = TONE[finding.tone] || TONE.neutral;

                    return (
                        <Stack key={index} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                            <Box
                                sx={(theme) => ({
                                    width: theme.avatar.sizeSmall,
                                    height: theme.avatar.sizeSmall,
                                    flexShrink: 0,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: theme.sidebarLayout.radius,
                                    color: theme.palette[color].main,
                                    backgroundColor: alpha(theme.palette[color].main, theme.tint.soft),
                                })}
                            >
                                <Icon fontSize="small" />
                            </Box>
                            <Typography variant="body2" sx={{ pt: 0.75 }}>
                                {finding.text}
                            </Typography>
                        </Stack>
                    );
                })}
            </Stack>
        </Panel>
    );
}

export default Findings;
