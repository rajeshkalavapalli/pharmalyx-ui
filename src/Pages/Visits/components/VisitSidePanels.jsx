import { Box, Button, Stack, Typography } from "@mui/material";
import { AddRounded, CheckCircleOutlineRounded } from "@mui/icons-material";

import Panel from "../../../components/Panel/Panel";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import { FOLLOW_UP_SOON_DAYS, daysUntil, formatDueLabel } from "../index";

const truncate = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

function DoctorLine({ doctor, caption, captionColor, canLog, onLog }) {
    return (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0 }}>
            <CategoryBadge category={doctor.Category} />

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={truncate}>
                    {doctor.DoctorName}
                </Typography>
                <Typography
                    variant="caption"
                    component="p"
                    sx={(theme) => ({
                        ...truncate,
                        color: captionColor ? captionColor(theme) : theme.palette.text.secondary,
                    })}
                >
                    {caption}
                </Typography>
            </Box>

            {canLog && (
                <Button size="small" startIcon={<AddRounded />} onClick={() => onLog(doctor.DoctorId)}>
                    Log
                </Button>
            )}
        </Stack>
    );
}

function AllClear({ message }) {
    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <CheckCircleOutlineRounded
                fontSize="small"
                sx={(theme) => ({ color: theme.palette.success.main })}
            />
            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                {message}
            </Typography>
        </Stack>
    );
}

const scrollList = (theme) => ({
    maxHeight: theme.visitList.sideListMaxHeight,
    overflowY: "auto",
});

export function FollowUpsPanel({ followUps, canLog, onLog }) {
    return (
        <Panel title="Follow-ups" subtitle="Open follow-ups from your last visit to each doctor">
            {followUps.length === 0 ? (
                <AllClear message="No follow-ups pending." />
            ) : (
                <Stack spacing={1.75} sx={scrollList}>
                    {followUps.map((item) => {
                        const days = daysUntil(item.FollowUpDate);

                        return (
                            <DoctorLine
                                key={item.VisitId}
                                doctor={item}
                                caption={formatDueLabel(item.FollowUpDate)}
                                captionColor={(theme) =>
                                    days < 0
                                        ? theme.palette.error.dark
                                        : days <= FOLLOW_UP_SOON_DAYS
                                          ? theme.palette.warning.dark
                                          : theme.palette.text.secondary
                                }
                                canLog={canLog}
                                onLog={onLog}
                            />
                        );
                    })}
                </Stack>
            )}
        </Panel>
    );
}

export function NotVisitedPanel({ doctors, isCurrentMonth, canLog, onLog }) {
    return (
        <Panel
            title="Not visited yet"
            subtitle={isCurrentMonth ? "Assigned doctors with no visit this month" : "No visit in this month"}
        >
            {doctors.length === 0 ? (
                <AllClear message="Every assigned doctor has been visited." />
            ) : (
                <Stack spacing={1.75} sx={scrollList}>
                    {doctors.map((doctor) => (
                        <DoctorLine
                            key={doctor.DoctorId}
                            doctor={doctor}
                            caption={
                                doctor.VisitsPerMonth != null
                                    ? `Target ${doctor.VisitsPerMonth} visit${doctor.VisitsPerMonth === 1 ? "" : "s"} a month`
                                    : doctor.HospitalName || ""
                            }
                            canLog={canLog && isCurrentMonth}
                            onLog={onLog}
                        />
                    ))}
                </Stack>
            )}
        </Panel>
    );
}
