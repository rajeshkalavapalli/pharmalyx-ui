import { Box, Stack, Typography } from "@mui/material";

// Ranked horizontal bars with direct labels. rows: [{ key, label, value, display?, caption?, color? }]
// `color` is a palette key; default is the brand gradient (single series).
function HBarList({ rows, empty = "No data for these filters." }) {
    const peak = Math.max(1, ...rows.map((row) => row.value));

    if (!rows.length) {
        return (
            <Typography variant="body2" sx={(theme) => ({ py: 3, textAlign: "center", color: theme.palette.text.secondary })}>
                {empty}
            </Typography>
        );
    }

    return (
        <Stack spacing={1.5}>
            {rows.map((row) => (
                <Box key={row.key}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" noWrap>
                            {row.label}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                            {row.display ?? row.value}
                        </Typography>
                    </Stack>
                    <Box sx={(theme) => ({ height: theme.stat.progressHeight, borderRadius: theme.stat.progressHeight, backgroundColor: theme.palette.surface.muted, overflow: "hidden" })}>
                        <Box
                            sx={(theme) => ({
                                width: `${(row.value / peak) * 100}%`,
                                height: "100%",
                                borderRadius: "inherit",
                                ...(row.color ? { backgroundColor: theme.palette[row.color].main } : { backgroundImage: theme.palette.brand.gradient }),
                            })}
                        />
                    </Box>
                    {row.caption && (
                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            {row.caption}
                        </Typography>
                    )}
                </Box>
            ))}
        </Stack>
    );
}

export default HBarList;
