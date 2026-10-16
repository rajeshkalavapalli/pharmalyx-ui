import { Box, Button, Chip, Divider, Drawer, IconButton, Stack, Typography } from "@mui/material";
import {
    CallRounded,
    CloseRounded,
    MailOutlineRounded,
} from "@mui/icons-material";

import {
    DetailFact,
    DetailGrid,
    DetailSection,
} from "../../../components/DetailSection/DetailSection";
import StatusChip from "../../../components/StatusChip/StatusChip";
import DoctorAvatar from "./DoctorAvatar";
import RecentVisits from "./RecentVisits";
import {
    DOCTOR_CATEGORY,
    OCCASION_SOON_DAYS,
    formatCountdown,
    formatLongDate,
    nextOccurrence,
} from "../index";

function OccasionFact({ label, value }) {
    if (!value) {
        return <DetailFact label={label}>Not recorded</DetailFact>;
    }

    const next = nextOccurrence(value);

    return (
        <DetailFact label={label}>
            <Typography variant="body2">{formatLongDate(value)}</Typography>
            {next && (
                <Typography
                    variant="caption"
                    component="p"
                    sx={(theme) => ({
                        color: next.days <= OCCASION_SOON_DAYS ? theme.palette.error.dark : theme.palette.text.secondary,
                        fontWeight: next.days <= OCCASION_SOON_DAYS ? theme.typography.subtitle2.fontWeight : undefined,
                    })}
                >
                    Next: {formatCountdown(next.days).toLowerCase()}
                </Typography>
            )}
        </DetailFact>
    );
}

function DoctorProfileDrawer({ doctor, userId, onClose }) {
    const category = doctor ? DOCTOR_CATEGORY[doctor.Category] : null;

    return (
        <Drawer
            anchor="right"
            open={Boolean(doctor)}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: (theme) => ({
                        width: theme.drawer.width,
                        backgroundColor: theme.palette.background.paper,
                        display: "flex",
                        flexDirection: "column",
                    }),
                },
            }}
        >
            {doctor && (
                <>
                    {/* HEADER */}

                    <Stack
                        direction="row"
                        sx={(theme) => ({
                            alignItems: "flex-start",
                            gap: 2,
                            px: theme.drawer.paddingX,
                            py: theme.drawer.paddingY,
                        })}
                    >
                        <DoctorAvatar doctor={doctor} />

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h4" component="h2" sx={{ overflowWrap: "anywhere" }}>
                                {doctor.DoctorName}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={(theme) => ({ color: theme.palette.text.secondary })}
                            >
                                {[doctor.Qualification, doctor.Speciality].filter(Boolean).join(" · ")}
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ mt: 1.25, alignItems: "center", flexWrap: "wrap" }}
                            >
                                {category ? (
                                    <StatusChip label={category.label} color={category.color} />
                                ) : (
                                    <Chip size="small" variant="outlined" label="No category" />
                                )}
                            </Stack>
                        </Box>

                        <IconButton aria-label="Close" onClick={onClose}>
                            <CloseRounded />
                        </IconButton>
                    </Stack>

                    {/* QUICK CONTACT */}

                    <Stack
                        direction="row"
                        spacing={1.25}
                        sx={(theme) => ({ px: theme.drawer.paddingX, pb: theme.drawer.paddingY })}
                    >
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<CallRounded />}
                            disabled={!doctor.MobileNumber}
                            href={doctor.MobileNumber ? `tel:${doctor.MobileNumber}` : undefined}
                        >
                            Call
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<MailOutlineRounded />}
                            disabled={!doctor.EmailId}
                            href={doctor.EmailId ? `mailto:${doctor.EmailId}` : undefined}
                        >
                            Email
                        </Button>
                    </Stack>

                    <Divider />

                    {/* BODY */}

                    <Box
                        sx={(theme) => ({
                            flex: 1,
                            overflowY: "auto",
                            px: theme.drawer.paddingX,
                            py: theme.drawer.paddingY,
                        })}
                    >
                        <Stack sx={(theme) => ({ gap: theme.drawer.sectionGap })}>
                            <DetailSection title="Contact">
                                <DetailGrid>
                                    <DetailFact label="Mobile">{doctor.MobileNumber || "Not recorded"}</DetailFact>
                                    <DetailFact label="Email">{doctor.EmailId || "Not recorded"}</DetailFact>
                                </DetailGrid>
                            </DetailSection>

                            <DetailSection title="Practice">
                                <DetailGrid>
                                    <DetailFact label="Hospital / clinic">{doctor.HospitalName || "—"}</DetailFact>
                                    <DetailFact label="Speciality">{doctor.Speciality || "—"}</DetailFact>
                                    <DetailFact label="Territory">{doctor.TerritoryName || "—"}</DetailFact>
                                    <DetailFact label="Area">{doctor.AreaName || "—"}</DetailFact>
                                </DetailGrid>
                            </DetailSection>

                            <DetailSection title="Engagement">
                                <DetailGrid>
                                    <DetailFact label="Category">
                                        {category ? `${category.label} · ${category.hint}` : "Not set"}
                                    </DetailFact>
                                    <DetailFact label="Visit target">
                                        {doctor.VisitsPerMonth != null
                                            ? `${doctor.VisitsPerMonth} visits a month`
                                            : "Not set"}
                                    </DetailFact>
                                    <OccasionFact label="Birthday" value={doctor.DateOfBirth} />
                                    <OccasionFact label="Anniversary" value={doctor.AnniversaryDate} />
                                </DetailGrid>
                            </DetailSection>

                            <DetailSection title="Recent visits">
                                <RecentVisits doctorId={doctor.DoctorId} userId={userId} />
                            </DetailSection>
                        </Stack>
                    </Box>
                </>
            )}
        </Drawer>
    );
}

export default DoctorProfileDrawer;
