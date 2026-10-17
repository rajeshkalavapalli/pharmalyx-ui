import { Box, LinearProgress, Stack, Typography } from "@mui/material";

import { achievementColor } from "./index";

// "actual / planned" with a slim progress bar and the percentage.
function Achievement({ actual, planned, percent, format = (value) => value }) {
    const color = achievementColor(percent);

    return (
        <Box sx={(theme) => ({ minWidth: theme.engagement.dateColumn })}>
            <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                <Typography variant="body2">
                    {format(actual)}
                    <Typography component="span" variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {" "}/ {planned ? format(planned) : "—"}
                    </Typography>
                </Typography>
                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary, fontWeight: theme.typography.subtitle2.fontWeight })}>
                    {percent == null ? "—" : `${percent}%`}
                </Typography>
            </Stack>
            <LinearProgress
                variant="determinate"
                color={color === "secondary" ? "inherit" : color}
                value={Math.min(100, percent ?? 0)}
                aria-label={percent == null ? "No target" : `${percent}% achieved`}
            />
        </Box>
    );
}

export default Achievement;
