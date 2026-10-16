import { Box, Divider, Paper, Stack, Typography } from "@mui/material";

// Elevated surface for page sections, with an optional titled header row.
function Panel({ title, subtitle, actions, children, disablePadding = false, sx }) {
    const hasHeader = Boolean(title || actions);

    return (
        <Paper
            elevation={0}
            sx={[
                (theme) => ({
                    borderRadius: theme.panel.radius,
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: theme.card.shadow,
                    overflow: "hidden",
                }),
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {hasHeader && (
                <>
                    <Stack
                        direction="row"
                        sx={(theme) => ({
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: theme.panel.gap,
                            px: theme.panel.padding,
                            py: theme.panel.headerPaddingY,
                        })}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            {title && (
                                <Typography variant="subtitle1" component="h2">
                                    {title}
                                </Typography>
                            )}

                            {subtitle && (
                                <Typography
                                    variant="caption"
                                    component="p"
                                    sx={(theme) => ({ color: theme.palette.text.secondary })}
                                >
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>

                        {actions}
                    </Stack>

                    <Divider />
                </>
            )}

            <Box sx={(theme) => ({ p: disablePadding ? 0 : theme.panel.padding })}>
                {children}
            </Box>
        </Paper>
    );
}

export default Panel;
