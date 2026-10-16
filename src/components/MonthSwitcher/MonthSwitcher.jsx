import { Button, IconButton, Stack, Typography } from "@mui/material";
import { ChevronLeftRounded, ChevronRightRounded } from "@mui/icons-material";

const pad = (value) => String(value).padStart(2, "0");

const currentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
};

const shift = (month, delta) => {
    const [year, mon] = month.split("-").map(Number);
    const date = new Date(year, mon - 1 + delta, 1);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
};

const label = (month) =>
    new Date(`${month}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

// ‹ October 2026 › with a "This month" shortcut. `month` is YYYY-MM.
function MonthSwitcher({ month, onChange, allowFuture = false }) {
    const isCurrent = month === currentMonth();

    return (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <IconButton aria-label="Previous month" onClick={() => onChange(shift(month, -1))}>
                <ChevronLeftRounded />
            </IconButton>
            <Typography
                variant="h5"
                component="h2"
                sx={(theme) => ({ minWidth: theme.spacing(20), textAlign: "center" })}
            >
                {label(month)}
            </Typography>
            <IconButton
                aria-label="Next month"
                disabled={!allowFuture && month >= currentMonth()}
                onClick={() => onChange(shift(month, 1))}
            >
                <ChevronRightRounded />
            </IconButton>
            {!isCurrent && (
                <Button size="small" onClick={() => onChange(currentMonth())}>
                    This month
                </Button>
            )}
        </Stack>
    );
}

export default MonthSwitcher;
