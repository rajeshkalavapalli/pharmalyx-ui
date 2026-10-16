import { Box, Typography } from "@mui/material";

// Titled block used inside detail drawers.
export function DetailSection({ title, children }) {
    return (
        <Box>
            <Typography
                variant="overline"
                component="h3"
                sx={(theme) => ({ color: theme.palette.text.secondary, mb: 1.5 })}
            >
                {title}
            </Typography>
            {children}
        </Box>
    );
}

// Label + value pair. `children` may be text or any element (chip, link...).
export function DetailFact({ label, children }) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography
                variant="caption"
                component="p"
                sx={(theme) => ({ color: theme.palette.text.secondary })}
            >
                {label}
            </Typography>

            {typeof children === "string" || typeof children === "number" ? (
                <Typography variant="body2" sx={{ mt: 0.25, overflowWrap: "anywhere" }}>
                    {children}
                </Typography>
            ) : (
                <Box sx={{ mt: 0.5 }}>{children}</Box>
            )}
        </Box>
    );
}

// Two-column grid of DetailFacts.
export function DetailGrid({ children }) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 2,
            }}
        >
            {children}
        </Box>
    );
}
