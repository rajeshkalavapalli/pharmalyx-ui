import { Box, Stack, Typography } from "@mui/material";

// Pharmalyx logo for dark surfaces: gradient tile with a "P" + pulse glyph,
// optionally followed by the wordmark. `size` is in px.
function BrandMark({ size, showWordmark = false, tagline }) {
    const mark = (
        <Box
            aria-hidden={showWordmark ? true : undefined}
            sx={(theme) => ({
                width: size,
                height: size,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: theme.sidebarLayout.radius,
                backgroundImage: theme.palette.brand.gradient,
                boxShadow: theme.palette.brand.glow,
                position: "relative",
                overflow: "hidden",

                // Soft top highlight for depth.
                "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 55%)",
                },
            })}
        >
            <Box
                component="svg"
                viewBox="0 0 24 24"
                sx={{ width: "62%", height: "62%", position: "relative", zIndex: 1 }}
            >
                <path
                    d="M7 20V5h6a4.5 4.5 0 0 1 0 9H7"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M10.5 9.5h1.2l.9-1.6 1.2 3.2.9-1.6h1.3"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeOpacity="0.85"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Box>
        </Box>
    );

    if (!showWordmark) return mark;

    return (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0 }}>
            {mark}

            <Box sx={{ minWidth: 0 }}>
                <Typography
                    component="span"
                    sx={(theme) => ({
                        display: "block",
                        fontFamily: theme.typography.displayFontFamily,
                        fontSize: theme.typography.h5.fontSize,
                        fontWeight: 800,
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                        color: theme.palette.sidebar.activeText,
                    })}
                >
                    Pharma
                    <Box
                        component="span"
                        sx={(theme) => ({
                            backgroundImage: theme.palette.brand.gradient,
                            filter: "brightness(1.35)",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                        })}
                    >
                        lyx
                    </Box>
                </Typography>

                {tagline && (
                    <Typography
                        component="span"
                        variant="micro"
                        sx={(theme) => ({
                            display: "block",
                            mt: 0.25,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: theme.palette.sidebar.mutedText,
                            whiteSpace: "nowrap",
                        })}
                    >
                        {tagline}
                    </Typography>
                )}
            </Box>
        </Stack>
    );
}

export default BrandMark;
