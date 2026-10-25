import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { Alert, Box, Button, Divider, Stack, Typography } from "@mui/material";
import {
    AccessTimeRounded,
    CheckCircleRounded,
    EventNoteRounded,
    HowToRegRounded,
    MapRounded,
    MedicalServicesRounded,
    PlaceRounded,
    TodayRounded,
} from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import LoadError from "../../components/LoadError/LoadError";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import StatCard from "../../components/StatCard/StatCard";
import Tag from "../../components/Tag/Tag";
import { captureLocation, errorMessage, formatClock, formatDay, getToday, patchLabel, startDay, validityOf } from "./index";

function DoctorRow({ doctor, onCheckIn }) {
    return (
        <Stack direction={{ xs: "column", sm: "row" }} sx={{ py: 1.5, gap: 1.25, alignItems: { sm: "center" } }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                    <Typography variant="subtitle2">Dr. {String(doctor.DoctorName).replace(/^dr\.?\s*/i, "")}</Typography>
                    {doctor.Category && <Tag label={`Class ${doctor.Category}`} color="primary" />}
                    <Tag icon={AccessTimeRounded} label={doctor.timing.label} color={doctor.timing.slot ? "info" : "secondary"} />
                    {!doctor.clinicPinned && <Tag label="Clinic not pinned" color="warning" title="Visits can't be verified until the clinic is pinned" />}
                </Stack>
                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {[doctor.Speciality, doctor.HospitalName, doctor.AreaName, `${doctor.valid} of ${doctor.required} valid visits this month`].filter(Boolean).join(" · ")}
                </Typography>
            </Box>
            <Button variant="contained" size="small" startIcon={<HowToRegRounded />} onClick={() => onCheckIn(doctor)} sx={{ flexShrink: 0 }}>
                Check in
            </Button>
        </Stack>
    );
}

// The MR's day: today's patch and the doctors due, ordered by when they are usually available.
// Opening this page starts the work day silently (GPS + time); there is no separate day-start step.
function MyDay() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    const load = useCallback(() => {
        getToday()
            .then((result) => {
                setData(result);
                setError("");
            })
            .catch((err) => setError(errorMessage(err, "Couldn't load today's plan")));
    }, []);

    useEffect(() => {
        load();
        // Silent day start: the first activity of the day records where and when work began.
        captureLocation()
            .then((location) => startDay(location))
            .then((result) => result?.started && load())
            .catch(() => {});
    }, [load]);

    const checkIn = (doctor) => navigate(`/field-operation/visits?doctorId=${doctor.DoctorId}`);

    if (error) return <LoadError title="Couldn't load your day" message={error} onRetry={load} />;
    if (!data) return <EmptyState icon={TodayRounded} title="Loading your day…" />;

    const planned = data.planned;
    const offDay = planned?.dayType === "non-working";

    return (
        <Box>
            <PageHeader
                eyebrow="Field operations · My day"
                title={formatDay(data.date)}
                status={data.workDay ? <Tag icon={CheckCircleRounded} label={`Day started ${formatClock(data.workDay.StartedAt)}`} color="success" /> : null}
                subtitle="Check in when you reach each clinic. A visit counts when you stay at least the minimum time inside the clinic radius and your territory."
                actions={
                    <Button variant="outlined" component={RouterLink} to="/field-operation/tour-plan" startIcon={<EventNoteRounded />}>
                        Month plan
                    </Button>
                }
            />

            <Stack spacing={1.5} sx={(theme) => ({ mb: theme.stat.gap })}>
                {data.workDay && data.workDay.StartInside === false && (
                    <Alert severity="warning" variant="outlined">
                        Your day started outside your territory. Head office has been notified for review. Visits outside the territory do not count.
                    </Alert>
                )}
                {!data.territory.hasBoundary && (
                    <Alert severity="info" variant="outlined">
                        Your territory boundary is not approved by head office yet, so the territory check is not applied to your visits.
                    </Alert>
                )}
                {data.territory.specialDuty && (
                    <Alert severity="info" variant="outlined">
                        Head office has given you special duty today: visits outside your territory count.
                    </Alert>
                )}
            </Stack>

            <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                <StatCard
                    icon={CheckCircleRounded}
                    label="Counted today"
                    value={data.validToday}
                    caption={
                        data.validToday >= data.rules.daMinValidVisits
                            ? "DA earned for today"
                            : `${data.rules.daMinValidVisits - data.validToday} more for today's DA${data.today?.review ? ` · ${data.today.review} need a look` : ""}`
                    }
                    color={data.validToday >= data.rules.daMinValidVisits ? "success" : "warning"}
                    progress={Math.min(100, (data.validToday / Math.max(1, data.rules.daMinValidVisits)) * 100)}
                />
                <StatCard icon={MapRounded} label="Today's patch" value={offDay ? "Off" : planned?.areaName || "—"} caption={planned?.patchType ? patchLabel(planned.patchType) : "No plan for today"} color="primary" />
                <StatCard icon={MedicalServicesRounded} label="Due in this patch" value={data.plan.length} caption={`${data.otherDue.length} more due in your territory`} color="info" />
                <StatCard icon={PlaceRounded} label="Minimum stay" value={`${data.rules.minDwellMinutes} min`} caption={`Within ${data.rules.clinicRadius} m of the clinic`} color="secondary" />
            </Box>

            <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 3fr) minmax(0, 2fr)" }, gap: theme.stat.gap })}>
                <Stack spacing={2}>
                    <Panel
                        title={planned?.areaName ? `Today's plan · ${planned.areaName}` : "Today's plan"}
                        subtitle="Order follows when each doctor is usually available (a suggestion only)."
                    >
                        {data.plan.length ? (
                            <Stack divider={<Divider />}>
                                {data.plan.map((doctor) => (
                                    <DoctorRow key={doctor.DoctorId} doctor={doctor} onCheckIn={checkIn} />
                                ))}
                            </Stack>
                        ) : (
                            <EmptyState
                                icon={EventNoteRounded}
                                title={planned ? (offDay ? "No field work planned today" : "Nobody due in this patch") : "No plan for today"}
                                message={planned ? "You can visit any doctor of your territory below; no approval is needed." : "Generate this month's plan from your standard tour plan."}
                                action={
                                    !planned && (
                                        <Button component={RouterLink} to="/field-operation/stp">
                                            Standard tour plan
                                        </Button>
                                    )
                                }
                            />
                        )}
                    </Panel>

                    {data.otherDue.length > 0 && (
                        <Panel title="Also due in your territory" subtitle="Swap days or visit any of these: no approval needed.">
                            <Stack divider={<Divider />}>
                                {data.otherDue.slice(0, 30).map((doctor) => (
                                    <DoctorRow key={doctor.DoctorId} doctor={doctor} onCheckIn={checkIn} />
                                ))}
                            </Stack>
                        </Panel>
                    )}
                </Stack>

                <Panel title="Today's visits" subtitle="Counted, needs a look (still counts) or not counted. Open a visit in Visits to explain it.">
                    {data.today && data.visits.length > 0 && (
                        <Alert
                            severity={data.validToday >= data.rules.daMinValidVisits ? "success" : "info"}
                            variant="outlined"
                            sx={{ mb: 1.5 }}
                        >
                            Today: <b>{data.today.counted}</b> counted
                            {data.today.review ? <>, <b>{data.today.review}</b> need a look (they still count)</> : null}
                            {data.today.notCounted ? <>, <b>{data.today.notCounted}</b> not counted</> : null}.{" "}
                            {data.validToday >= data.rules.daMinValidVisits
                                ? "Today's DA is earned."
                                : `${data.rules.daMinValidVisits - data.validToday} more counted visit${data.rules.daMinValidVisits - data.validToday === 1 ? "" : "s"} for today's DA.`}
                        </Alert>
                    )}
                    {data.visits.length ? (
                        <Stack divider={<Divider />}>
                            {data.visits.map((visit) => (
                                <Box key={visit.VisitId} sx={{ py: 1.25 }}>
                                    <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
                                        <Typography variant="subtitle2">Dr. {visit.DoctorName}</Typography>
                                        <Tag label={validityOf(visit).label} color={validityOf(visit).color} />
                                    </Stack>
                                    <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {visit.CheckInAt ? `${formatClock(visit.CheckInAt)} – ${formatClock(visit.CheckOutAt)}` : "No live check-in"}
                                    </Typography>
                                    {visit.reasons.map((reason) => (
                                        <Typography key={reason.code} variant="caption" component="p" sx={(theme) => ({ color: reason.hard ? theme.palette.error.main : theme.palette.warning.dark })}>
                                            • {reason.text}
                                        </Typography>
                                    ))}
                                </Box>
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState icon={HowToRegRounded} title="No visits yet" message="Tap Check in when you reach a clinic." />
                    )}
                </Panel>
            </Box>
        </Box>
    );
}

export default MyDay;
