import { Box, Stack, Tooltip, Typography } from "@mui/material";

function LegendSwatch({ color, label }) {
    return (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <Box sx={(theme) => ({ width: theme.calendar.legendSwatch, height: theme.calendar.legendSwatch, borderRadius: theme.engagement.swatchRadius, backgroundColor: color(theme) })} />
            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                {label}
            </Typography>
        </Stack>
    );
}

const ours = (theme) => theme.palette.chart.ours;
const theirs = (theme) => theme.palette.chart.competitor;

// One 100% bar per product: our units vs competitor units, with a share label.
function ShareBars({ products }) {
    return (
        <Box>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <LegendSwatch color={ours} label="Our brand" />
                <LegendSwatch color={theirs} label="Competitors" />
            </Stack>

            <Stack spacing={2}>
                {products.map((product) => {
                    const total = product.ours + product.competitor;
                    const ourPct = total ? (product.ours / total) * 100 : 0;

                    return (
                        <Box key={product.ProductId}>
                            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.75, gap: 1 }}>
                                <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {product.ProductName}
                                </Typography>
                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary, whiteSpace: "nowrap" })}>
                                    {product.share == null ? "No units" : `${product.share}% share · ${total} units`}
                                </Typography>
                            </Stack>

                            <Box
                                role="img"
                                aria-label={`${product.ProductName}: ${product.ours} our units, ${product.competitor} competitor units`}
                                sx={(theme) => ({
                                    display: "flex",
                                    gap: `${theme.dashboard.barGap}px`,
                                    height: theme.spacing(1.5),
                                    borderRadius: `${theme.dashboard.barRadius}px`,
                                    overflow: "hidden",
                                    backgroundColor: theme.palette.surface.muted,
                                })}
                            >
                                {product.ours > 0 && (
                                    <Tooltip title={`Our brand: ${product.ours} units`} placement="top">
                                        <Box sx={(theme) => ({ width: `${ourPct}%`, backgroundColor: ours(theme) })} />
                                    </Tooltip>
                                )}
                                {product.competitor > 0 && (
                                    <Tooltip title={`Competitors: ${product.competitor} units`} placement="top">
                                        <Box sx={(theme) => ({ flex: 1, backgroundColor: theirs(theme) })} />
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Stack>
        </Box>
    );
}

export default ShareBars;
