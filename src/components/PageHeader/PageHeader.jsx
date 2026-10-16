import { Box, Stack, Typography } from "@mui/material";

// Standard page title block: eyebrow, title (+ optional status badge), subtitle
// and right-aligned actions.
// Note: MUI v9 Stack only accepts direction/spacing; flex alignment goes in sx.
function PageHeader({ eyebrow, title, status, subtitle, actions }) {
    return (
        <Stack
            direction={{ xs: "column", md: "row" }}
            sx={(theme) => ({
                alignItems: { xs: "flex-start", md: "flex-end" },
                justifyContent: "space-between",
                gap: theme.pageHeader.gap,
                mb: theme.pageHeader.marginBottom,
            })}
        >
            <Box sx={{ minWidth: 0 }}>
                {eyebrow && (
                    <Typography
                        variant="overline"
                        component="p"
                        sx={(theme) => ({
                            color: theme.palette.primary.main,
                            mb: theme.pageHeader.eyebrowMarginBottom,
                        })}
                    >
                        {eyebrow}
                    </Typography>
                )}

                <Stack
                    direction="row"
                    sx={(theme) => ({
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: theme.pageHeader.actionsGap,
                    })}
                >
                    <Typography variant="h3" component="h1">
                        {title}
                    </Typography>

                    {status}
                </Stack>

                {subtitle && (
                    <Typography
                        variant="body2"
                        sx={(theme) => ({
                            color: theme.palette.text.secondary,
                            mt: theme.pageHeader.subtitleMarginTop,
                        })}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>

            {actions && (
                <Stack
                    direction="row"
                    sx={(theme) => ({
                        alignItems: "center",
                        flexWrap: "wrap",
                        flexShrink: 0,
                        gap: theme.pageHeader.actionsGap,
                    })}
                >
                    {actions}
                </Stack>
            )}
        </Stack>
    );
}

export default PageHeader;
