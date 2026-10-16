import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import {
    CloudUploadRounded,
    EventRounded,
    GroupsRounded,
    LocationOffRounded,
    PlaceRounded,
    ReportProblemRounded,
} from "@mui/icons-material";

import Tag from "../../../components/Tag/Tag";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import DoctorAvatar from "../../MyDoctors/components/DoctorAvatar";
import {
    FEEDBACK,
    PLAN_STATUS,
    formatDayHeading,
    formatDuration,
    formatTimeRange,
    minutesBetween,
} from "../index";

const truncate = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

const groupByDay = (visits) =>
    visits.reduce((groups, visit) => {
        const last = groups[groups.length - 1];

        if (last && last.date === visit.VisitDate) {
            last.visits.push(visit);
        } else {
            groups.push({ date: visit.VisitDate, visits: [visit] });
        }

        return groups;
    }, []);

function VisitRow({ visit, onOpen }) {
    const duration = minutesBetween(visit.StartTime, visit.EndTime);
    const feedback = FEEDBACK[visit.Feedback];
    const plan = PLAN_STATUS[visit.PlanStatus];
    const outOfPlan = visit.PlanStatus === "OUT_OF_PLAN" || visit.PlanStatus === "OFF_DAY";

    return (
        <ButtonBase
            onClick={() => onOpen(visit)}
            sx={(theme) => ({
                width: "100%",
                display: "grid",
                gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    sm: `${theme.visitList.timeColumnWidth}px minmax(0, 1fr)`,
                },
                gap: { xs: 1, sm: 2 },
                alignItems: "center",
                p: 1.5,
                textAlign: "left",
                borderRadius: theme.calendar.cell.radius,
                border: "1px solid",
                borderColor: visit.pending ? theme.palette.warning.light : theme.palette.border.subtle,
                borderStyle: visit.pending ? "dashed" : "solid",
                backgroundColor: theme.palette.background.paper,
                transition: theme.calendar.transition,

                "&:hover": {
                    borderColor: theme.palette.border.strong,
                    boxShadow: theme.card.shadow,
                },
            })}
        >
            {/* TIME */}

            <Box>
                <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap" }}>
                    {formatTimeRange(visit.StartTime, visit.EndTime)}
                </Typography>
                {duration && (
                    <Typography
                        variant="caption"
                        sx={(theme) => ({ color: theme.palette.text.secondary })}
                    >
                        {formatDuration(duration)}
                    </Typography>
                )}
            </Box>

            {/* DOCTOR + TAGS */}

            <Stack
                direction={{ xs: "column", md: "row" }}
                sx={{ gap: 1.5, alignItems: { xs: "flex-start", md: "center" }, minWidth: 0 }}
            >
                <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0, flex: 1 }}>
                    <DoctorAvatar doctor={visit} size="sizeSmall" />

                    <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <Typography variant="subtitle2" sx={truncate}>
                                {visit.DoctorName}
                            </Typography>
                            <CategoryBadge category={visit.Category} />
                        </Stack>
                        <Typography
                            variant="caption"
                            component="p"
                            sx={(theme) => ({ ...truncate, color: theme.palette.text.secondary })}
                        >
                            {[visit.HospitalName, visit.AreaName].filter(Boolean).join(" · ")}
                        </Typography>
                    </Box>
                </Stack>

                <Stack
                    direction="row"
                    sx={{ gap: 0.75, flexWrap: "wrap", justifyContent: { md: "flex-end" } }}
                >
                    {visit.pending && (
                        <Tag
                            icon={CloudUploadRounded}
                            label={visit.syncError ? "Sync failed" : "Waiting to sync"}
                            color={visit.syncError ? "error" : "warning"}
                        />
                    )}

                    {feedback && <Tag label={feedback.label} color={feedback.color} />}

                    {visit.JointWorkUserName && (
                        <Tag icon={GroupsRounded} label={`With ${visit.JointWorkUserName}`} color="secondary" />
                    )}

                    {outOfPlan && plan && (
                        <Tag icon={ReportProblemRounded} label={plan.label} color={plan.color} />
                    )}

                    {visit.FollowUpDate && (
                        <Tag icon={EventRounded} label="Follow-up" color="primary" />
                    )}

                    {visit.LocationStatus === "CAPTURED" ? (
                        <Tag icon={PlaceRounded} label="GPS" color="success" title="Location captured" />
                    ) : (
                        <Tag icon={LocationOffRounded} label="No GPS" color="info" title="No location" />
                    )}
                </Stack>
            </Stack>
        </ButtonBase>
    );
}

function VisitList({ visits, onOpen }) {
    return (
        <Stack spacing={3}>
            {groupByDay(visits).map((group) => {
                const minutes = group.visits.reduce(
                    (sum, visit) => sum + (minutesBetween(visit.StartTime, visit.EndTime) || 0),
                    0
                );

                return (
                    <Box key={group.date}>
                        <Stack
                            direction="row"
                            sx={{ alignItems: "baseline", justifyContent: "space-between", mb: 1.25, gap: 1 }}
                        >
                            <Typography variant="subtitle1" component="h3">
                                {formatDayHeading(group.date)}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={(theme) => ({ color: theme.palette.text.secondary, whiteSpace: "nowrap" })}
                            >
                                {group.visits.length} visit{group.visits.length === 1 ? "" : "s"}
                                {minutes ? ` · ${formatDuration(minutes)} in calls` : ""}
                            </Typography>
                        </Stack>

                        <Stack spacing={1}>
                            {group.visits.map((visit) => (
                                <VisitRow key={visit.VisitId} visit={visit} onOpen={onOpen} />
                            ))}
                        </Stack>
                    </Box>
                );
            })}
        </Stack>
    );
}

export default VisitList;
