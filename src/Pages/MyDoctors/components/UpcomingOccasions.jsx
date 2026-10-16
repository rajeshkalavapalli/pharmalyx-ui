import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { CakeRounded, FavoriteRounded } from "@mui/icons-material";

import Panel from "../../../components/Panel/Panel";
import {
    OCCASION_SOON_DAYS,
    OCCASION_TYPE,
    OCCASION_WINDOW_DAYS,
    formatCountdown,
    formatDayMonth,
} from "../index";

// Horizontal strip of birthdays/anniversaries coming up for the doctors in view.
function UpcomingOccasions({ occasions, onOpen }) {
    if (occasions.length === 0) return null;

    return (
        <Panel
            title="Upcoming occasions"
            subtitle={`Birthdays and anniversaries in the next ${OCCASION_WINDOW_DAYS} days`}
            sx={(theme) => ({ mb: theme.pageHeader.marginBottom })}
        >
            <Stack direction="row" spacing={1.5} sx={{ overflowX: "auto", pb: 0.5 }}>
                {occasions.map((occasion) => {
                    const Icon = occasion.type === "birthday" ? CakeRounded : FavoriteRounded;
                    const soon = occasion.days <= OCCASION_SOON_DAYS;
                    const color = soon ? "error" : "secondary";

                    return (
                        <ButtonBase
                            key={`${occasion.doctor.DoctorId}-${occasion.type}`}
                            onClick={() => onOpen(occasion.doctor)}
                            sx={(theme) => ({
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: 1.25,
                                px: 1.5,
                                py: 1.25,
                                textAlign: "left",
                                borderRadius: theme.calendar.cell.radius,
                                border: "1px solid",
                                borderColor: theme.palette.border.default,
                                backgroundColor: theme.palette.surface.subtle,
                                transition: theme.calendar.transition,

                                "&:hover": {
                                    borderColor: theme.palette.border.strong,
                                    backgroundColor: theme.palette.background.paper,
                                },
                            })}
                        >
                            <Box
                                sx={(theme) => ({
                                    width: theme.avatar.sizeSmall,
                                    height: theme.avatar.sizeSmall,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: "50%",
                                    color: theme.palette[color].main,
                                    backgroundColor: alpha(theme.palette[color].main, theme.tint.soft),
                                })}
                            >
                                <Icon fontSize="small" />
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap" }}>
                                    {occasion.doctor.DoctorName}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    component="p"
                                    sx={(theme) => ({
                                        whiteSpace: "nowrap",
                                        color: soon
                                            ? theme.palette.error.dark
                                            : theme.palette.text.secondary,
                                    })}
                                >
                                    {OCCASION_TYPE[occasion.type].label} · {formatDayMonth(occasion.date)} ·{" "}
                                    {formatCountdown(occasion.days)}
                                </Typography>
                            </Box>
                        </ButtonBase>
                    );
                })}
            </Stack>
        </Panel>
    );
}

export default UpcomingOccasions;
