import { Box, Divider, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    CakeRounded,
    CallRounded,
    EventRepeatRounded,
    FavoriteRounded,
    LocalHospitalRounded,
    MailOutlineRounded,
    MedicalServicesRounded,
    PlaceRounded,
} from "@mui/icons-material";

import CategoryBadge from "./CategoryBadge";
import DoctorAvatar from "./DoctorAvatar";
import { OCCASION_SOON_DAYS, OCCASION_TYPE, formatCountdown, nearestOccasion } from "../index";

const truncate = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

function InfoLine({ icon: Icon, children }) {
    return (
        <Typography
            variant="body2"
            sx={(theme) => ({
                ...truncate,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: theme.palette.text.secondary,
            })}
        >
            <Icon fontSize="inherit" sx={{ flexShrink: 0 }} />
            <Box component="span" sx={truncate}>
                {children}
            </Box>
        </Typography>
    );
}

function OccasionTag({ occasion }) {
    const Icon = occasion.type === "birthday" ? CakeRounded : FavoriteRounded;
    const color = occasion.days <= OCCASION_SOON_DAYS ? "error" : "secondary";

    return (
        <Typography
            variant="micro"
            sx={(theme) => ({
                ...truncate,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: theme.statusChip.radius,
                fontWeight: theme.typography.subtitle2.fontWeight,
                color: theme.palette[color].dark,
                backgroundColor: alpha(theme.palette[color].main, theme.tint.selected),
            })}
        >
            <Icon fontSize="inherit" />
            {OCCASION_TYPE[occasion.type].label} · {formatCountdown(occasion.days).toLowerCase()}
        </Typography>
    );
}

// Contact buttons must not also open the profile.
const stop = (event) => event.stopPropagation();

function DoctorCard({ doctor, onOpen }) {
    const occasion = nearestOccasion(doctor);
    const location = [doctor.TerritoryName, doctor.AreaName].filter(Boolean).join(" · ");

    return (
        <Paper
            elevation={0}
            role="button"
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen();
                }
            }}
            sx={(theme) => ({
                p: theme.entityCard.padding,
                display: "flex",
                flexDirection: "column",
                gap: theme.entityCard.gap,
                minWidth: 0,
                cursor: "pointer",
                borderRadius: theme.panel.radius,
                backgroundColor: theme.palette.background.paper,
                boxShadow: "none",
                transition: theme.calendar.transition,

                "&:hover": {
                    borderColor: theme.palette.border.strong,
                    boxShadow: theme.card.shadow,
                    transform: theme.entityCard.hoverLift,
                },

                "&:focus-visible": {
                    outline: "none",
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, theme.tint.border)}`,
                },
            })}
        >
            {/* IDENTITY */}

            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                <DoctorAvatar doctor={doctor} />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={truncate}>
                        {doctor.DoctorName}
                    </Typography>
                    <Typography
                        variant="caption"
                        component="p"
                        sx={(theme) => ({ ...truncate, color: theme.palette.text.secondary })}
                    >
                        {doctor.Qualification || "—"}
                    </Typography>
                </Box>

                <CategoryBadge category={doctor.Category} />
            </Stack>

            {/* PRACTICE */}

            <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                <InfoLine icon={MedicalServicesRounded}>{doctor.Speciality || "—"}</InfoLine>
                <InfoLine icon={LocalHospitalRounded}>{doctor.HospitalName || "—"}</InfoLine>
                <InfoLine icon={PlaceRounded}>{location || "No location set"}</InfoLine>
            </Stack>

            <Divider />

            {/* FOOTER */}

            <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1 }}>
                    {occasion ? (
                        <OccasionTag occasion={occasion} />
                    ) : (
                        <Typography
                            variant="caption"
                            sx={(theme) => ({
                                ...truncate,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                color: theme.palette.text.secondary,
                            })}
                        >
                            <EventRepeatRounded fontSize="inherit" />
                            {doctor.VisitsPerMonth != null
                                ? `${doctor.VisitsPerMonth} visits / month`
                                : "No visit target"}
                        </Typography>
                    )}
                </Box>

                <Tooltip title={doctor.MobileNumber ? `Call ${doctor.MobileNumber}` : "No mobile number"}>
                    <span>
                        <IconButton
                            size="small"
                            component={doctor.MobileNumber ? "a" : "button"}
                            href={doctor.MobileNumber ? `tel:${doctor.MobileNumber}` : undefined}
                            disabled={!doctor.MobileNumber}
                            onClick={stop}
                            aria-label="Call"
                        >
                            <CallRounded fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title={doctor.EmailId ? `Email ${doctor.EmailId}` : "No email"}>
                    <span>
                        <IconButton
                            size="small"
                            component={doctor.EmailId ? "a" : "button"}
                            href={doctor.EmailId ? `mailto:${doctor.EmailId}` : undefined}
                            disabled={!doctor.EmailId}
                            onClick={stop}
                            aria-label="Email"
                        >
                            <MailOutlineRounded fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </Stack>
        </Paper>
    );
}

export default DoctorCard;
