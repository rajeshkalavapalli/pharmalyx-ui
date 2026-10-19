import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Pharmalyx logo: jade tile with a "P" and a pulse line, optionally followed by the
// wordmark and tagline. The same mark is used on every screen and as the favicon.
// `size` is in px. `tone` = "dark" (on ink, e.g. sidebar) or "light" (on white).
function BrandMark({ size, showWordmark = false, tagline, tone = "dark" }) {
    const theme = useTheme();
    const brand = theme.palette.brand;

    const mark = (
        <Box
            aria-hidden={showWordmark ? true : undefined}
            sx={{
                width: size,
                height: size,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: theme.sidebarLayout.radius,
                backgroundImage: brand.gradient,
                boxShadow: tone === "light" ? brand.glowSoft : brand.glow,
                position: "relative",
                overflow: "hidden",
                "&::after": { content: '""', position: "absolute", inset: 0, background: brand.markSheen },
            }}
        >
            <Box component="svg" viewBox="0 0 24 24" sx={{ width: "62%", height: "62%", position: "relative", zIndex: 1 }}>
                <path d="M7 20V5h6a4.5 4.5 0 0 1 0 9H7" fill="none" stroke={brand.markStroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.5 9.5h1.2l.9-1.6 1.2 3.2.9-1.6h1.3" fill="none" stroke={brand.markPulse} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </Box>
        </Box>
    );

    if (!showWordmark) return mark;

    const onDark = tone === "dark";

    return (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0 }}>
            {mark}
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="wordmark" sx={{ display: "block", color: onDark ? theme.palette.night.activeText : theme.palette.text.primary }}>
                    Pharma
                    <Box component="span" sx={{ color: onDark ? brand.jadeGlow : theme.palette.primary.main }}>
                        lyx
                    </Box>
                </Typography>
                {tagline && (
                    <Typography variant="tagline" sx={{ display: "block", mt: 0.5, whiteSpace: "nowrap", color: onDark ? theme.palette.night.mutedText : theme.palette.text.secondary }}>
                        {tagline}
                    </Typography>
                )}
            </Box>
        </Stack>
    );
}

export default BrandMark;
