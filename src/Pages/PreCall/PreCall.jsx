import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { Box, Button, Collapse, IconButton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    ArrowDownwardRounded,
    ArrowUpwardRounded,
    AssignmentTurnedInRounded,
    CheckCircleRounded,
    ChevronLeftRounded,
    ChevronRightRounded,
    EventBusyRounded,
    EventRepeatRounded,
    ExpandMoreRounded,
    GroupsRounded,
    MapRounded,
    PlaceRounded,
    PriorityHighRounded,
} from "@mui/icons-material";

import useActingUser from "../../components/ActingUserSelect/useActingUser";
import EmptyState from "../../components/EmptyState/EmptyState";
import LoadError from "../../components/LoadError/LoadError";
import PageHeader from "../../components/PageHeader/PageHeader";
import StatCard from "../../components/StatCard/StatCard";
import TeamViewSelect, { useTeamView } from "../../components/TeamViewSelect/TeamViewSelect";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import DoctorBriefCard from "./DoctorBriefCard";
import PlanCallDialog from "./PlanCallDialog";
import {
    addDays,
    deletePreCallPlan,
    errorMessage,
    formatDayHeading,
    getPreCallDay,
    planToVisitNotes,
    reorderPreCallPlan,
    savePreCallPlan,
    todayKey,
} from "./index";

function Section({ title, subtitle, count, children, collapsible = false, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Box sx={(theme) => ({ mb: theme.pageHeader.marginBottom })}>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5, gap: 1 }}>
                <Box>
                    <Typography variant="h5" component="h2">
                        {title}
                        <Typography component="span" variant="h5" sx={(theme) => ({ ml: 1, color: theme.palette.text.disabled })}>
                            {count}
                        </Typography>
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {collapsible && (
                    <Button
                        size="small"
                        endIcon={<ExpandMoreRounded sx={(theme) => ({ transform: open ? "rotate(180deg)" : "none", transition: theme.sidebarLayout.chevronTransition })} />}
                        onClick={() => setOpen((value) => !value)}
                    >
                        {open ? "Hide" : "Show"}
                    </Button>
                )}
            </Stack>
            <Collapse in={open}>
                <Stack spacing={1.5}>{children}</Stack>
            </Collapse>
        </Box>
    );
}

// The rep's own ordered plan for the day: who, why, and in what sequence.
function CallPlanList({ doctors, canPlan, canLog, busy, onMove, onPlan, onLogVisit }) {
    return (
        <Stack spacing={1}>
            {doctors.map((doctor, index) => {
                const plan = doctor.callPlan;
                const visited = plan.status === "VISITED";

                return (
                    <Stack
                        key={plan.PreCallId}
                        direction={{ xs: "column", md: "row" }}
                        sx={(theme) => ({
                            gap: 2,
                            p: 1.75,
                            alignItems: { xs: "stretch", md: "center" },
                            borderRadius: theme.panel.radius,
                            border: "1px solid",
                            borderColor: visited ? theme.palette.border.default : alpha(theme.palette.submitted.main, theme.tint.border),
                            backgroundColor: visited ? theme.palette.surface.subtle : theme.palette.background.paper,
                            boxShadow: visited ? "none" : theme.elevation.sm,
                        })}
                    >
                        <Stack direction="row" spacing={1.75} sx={{ flex: 1, minWidth: 0, alignItems: "center" }}>
                            <Box
                                sx={(theme) => ({
                                    width: theme.avatar.sizeSmall,
                                    height: theme.avatar.sizeSmall,
                                    flexShrink: 0,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: "50%",
                                    ...theme.typography.subtitle2,
                                    color: visited ? theme.palette.success.contrastText : theme.palette.submitted.contrastText,
                                    backgroundColor: visited ? theme.palette.success.main : theme.palette.submitted.main,
                                })}
                            >
                                {visited ? <CheckCircleRounded fontSize="small" /> : index + 1}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle2" noWrap>
                                    Dr. {doctor.DoctorName}
                                    <Typography component="span" variant="caption" sx={(theme) => ({ ml: 1, color: theme.palette.text.secondary })}>
                                        {doctor.AreaName || doctor.HospitalName || ""}
                                    </Typography>
                                </Typography>
                                <Typography variant="body2" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    {plan.objective}
                                </Typography>
                                {plan.productNames && (
                                    <Typography variant="caption" noWrap component="p" sx={(theme) => ({ color: theme.palette.submitted.dark })}>
                                        {plan.productNames}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                            {canPlan && !visited && (
                                <>
                                    <IconButton size="small" aria-label="Move earlier" disabled={busy || index === 0} onClick={() => onMove(index, -1)}>
                                        <ArrowUpwardRounded fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        aria-label="Move later"
                                        disabled={busy || index === doctors.length - 1}
                                        onClick={() => onMove(index, 1)}
                                    >
                                        <ArrowDownwardRounded fontSize="small" />
                                    </IconButton>
                                    <Button size="small" onClick={() => onPlan(doctor)}>
                                        Edit
                                    </Button>
                                </>
                            )}
                            {visited ? (
                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.success.dark, fontWeight: 600 })}>
                                    Visited
                                </Typography>
                            ) : (
                                canLog && (
                                    <Button size="small" variant="contained" onClick={() => onLogVisit(doctor)}>
                                        Log visit
                                    </Button>
                                )
                            )}
                        </Stack>
                    </Stack>
                );
            })}
        </Stack>
    );
}

// Plan strip: where the rep is working that day, per the tour plan.
function PlanBanner({ data }) {
    const plan = data.plan;
    const working = plan?.dayType === "working";
    const tone = !plan ? "warning" : working ? "primary" : "secondary";
    const Icon = !plan ? MapRounded : working ? PlaceRounded : EventBusyRounded;

    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={(theme) => ({
                gap: 2,
                p: theme.entityCard.padding,
                mb: theme.pageHeader.marginBottom,
                alignItems: { xs: "flex-start", sm: "center" },
                borderRadius: theme.panel.radius,
                border: "1px solid",
                borderColor: alpha(theme.palette[tone].main, theme.tint.border),
                backgroundColor: alpha(theme.palette[tone].main, theme.tint.hover),
            })}
        >
            <Box
                sx={(theme) => ({
                    width: theme.stat.iconSize,
                    height: theme.stat.iconSize,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: theme.stat.iconRadius,
                    color: theme.palette[tone].contrastText,
                    backgroundColor: theme.palette[tone].main,
                })}
            >
                <Icon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette[tone].dark })}>
                    {formatDayHeading(data.date)}
                </Typography>
                <Typography variant="subtitle1">
                    {!plan
                        ? "No tour plan for this day"
                        : working
                          ? `Working in ${[plan.territoryName, plan.areaName].filter(Boolean).join(" · ") || "the planned area"}`
                          : "Planned as an off day"}
                </Typography>
                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {!plan
                        ? "Showing all your doctors, ranked by priority. Plan your month to focus this list."
                        : plan.status === "APPROVED"
                          ? "Tour plan approved."
                          : plan.status === "SUBMITTED"
                            ? "Tour plan waiting for approval."
                            : "Tour plan not yet approved."}
                    {plan?.remarks ? ` Note: ${plan.remarks}` : ""}
                </Typography>
            </Box>
            {!plan && (
                <Button variant="outlined" component={RouterLink} to="/field-operation/tour-plan">
                    Open tour plan
                </Button>
            )}
        </Stack>
    );
}

function PreCall() {
    const navigate = useNavigate();
    const { actingUserId } = useActingUser();
    const { team, viewUserId, setViewUserId, viewing, viewingSelf } = useTeamView(actingUserId);

    const [date, setDate] = useState(todayKey());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [planning, setPlanning] = useState(null); // doctor being planned
    const [busy, setBusy] = useState(false);
    const { showSnackbar } = useSnackbar();

    const load = useCallback(async () => {
        if (!viewUserId) return;

        setLoading(true);
        setError("");

        try {
            setData(await getPreCallDay(date, viewUserId));
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load the pre-call plan"));
        } finally {
            setLoading(false);
        }
    }, [date, viewUserId]);

    useEffect(() => {
        load();
    }, [load]);

    const isToday = date === todayKey();
    // Visits can be logged for today or recent days, not the future.
    const canLog = viewingSelf && date <= todayKey();

    // Opens the visit form for the doctor; a planned call pre-fills the notes.
    const logVisit = (doctor) =>
        navigate(`/field-operation/visits?doctorId=${encodeURIComponent(doctor.DoctorId)}&date=${date}`, {
            state: doctor.callPlan ? { notes: planToVisitNotes(doctor.callPlan) } : undefined,
        });

    const run = async (action, fallback) => {
        setBusy(true);

        try {
            const response = await action();
            showSnackbar(response?.message || fallback, "success");
            await load();
            return true;
        } catch (err) {
            showSnackbar(errorMessage(err, "Action failed"), "error");
            return false;
        } finally {
            setBusy(false);
        }
    };

    const handleSavePlan = async (payload) => {
        if (await run(() => savePreCallPlan(payload), "Call planned")) setPlanning(null);
    };

    const handleRemovePlan = (doctor) => run(() => deletePreCallPlan(doctor.callPlan.PreCallId), "Removed from plan");

    const handleMove = (index, direction) => {
        const ids = data.myPlan.map((doctor) => doctor.callPlan.PreCallId);
        const target = index + direction;
        [ids[index], ids[target]] = [ids[target], ids[index]];
        run(() => reorderPreCallPlan(date, ids), "Order saved");
    };

    const s = data?.summary;
    const canPlan = Boolean(data?.canPlan && data?.plansEnabled);
    const cardProps = { canLog, canPlan, onLogVisit: logVisit, onPlan: setPlanning, onRemovePlan: handleRemovePlan };

    return (
        <Box>
            <PageHeader
                eyebrow="Field operations · Pre-call planning"
                title={viewing && !viewing.IsSelf ? `${viewing.Name}'s day` : isToday ? "Today's calls" : "Call plan"}
                subtitle="Who to meet, in what order, and what to say: built from your tour plan and each doctor's history."
                actions={
                    <>
                        <TeamViewSelect team={team} value={viewUserId} onChange={setViewUserId} />
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                            <IconButton aria-label="Previous day" onClick={() => setDate(addDays(date, -1))}>
                                <ChevronLeftRounded />
                            </IconButton>
                            <Button variant={isToday ? "contained" : "outlined"} onClick={() => setDate(todayKey())}>
                                Today
                            </Button>
                            <IconButton aria-label="Next day" onClick={() => setDate(addDays(date, 1))}>
                                <ChevronRightRounded />
                            </IconButton>
                        </Stack>
                    </>
                }
            />

            {error ? (
                <LoadError title="Couldn't load the pre-call plan" message={error} onRetry={load} />
            ) : !data ? (
                <EmptyState icon={GroupsRounded} title="Loading your day…" />
            ) : (
                <Box sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1, transition: theme.calendar.transition })}>
                    <PlanBanner data={data} />

                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                            gap: theme.stat.gap,
                            mb: theme.pageHeader.marginBottom,
                        })}
                    >
                        <StatCard
                            icon={AssignmentTurnedInRounded}
                            label="Planned calls"
                            value={s.plannedCalls ?? 0}
                            caption={`${s.plannedVisited ?? 0} visited · ${s.toMeet} doctors in today's area`}
                            color="primary"
                            progress={s.plannedCalls ? (s.plannedVisited / s.plannedCalls) * 100 : 0}
                        />
                        <StatCard icon={PriorityHighRounded} label="Must meet" value={s.mustMeet} caption="Follow-ups and priority doctors" color="error" />
                        <StatCard icon={EventRepeatRounded} label="Follow-ups due" value={s.followUpsDue} caption="Across all your doctors" color="warning" />
                        <StatCard
                            icon={CheckCircleRounded}
                            label="Visited"
                            value={s.visited}
                            caption={s.toMeet ? `${Math.round((s.visited / s.toMeet) * 100)}% of today's area` : "On this day"}
                            color="success"
                            progress={s.toMeet ? (s.visited / s.toMeet) * 100 : 0}
                        />
                    </Box>

                    {data.plansEnabled === false && (
                        <EmptyState
                            icon={AssignmentTurnedInRounded}
                            title="Call planning isn't set up yet"
                            message="Ask your administrator to run the pre-call planning database script. The briefings below still work."
                        />
                    )}

                    {data.plansEnabled && (
                        <Section
                            title="My call plan"
                            subtitle={
                                data.myPlan.length
                                    ? "Your calls for the day in visiting order. Log each visit from here."
                                    : canPlan
                                      ? "Choose “Plan call” on a doctor below to add them, with your objective and products."
                                      : "No calls were planned for this day."
                            }
                            count={data.myPlan.length}
                        >
                            {data.myPlan.length > 0 && (
                                <CallPlanList
                                    doctors={data.myPlan}
                                    canPlan={canPlan}
                                    canLog={canLog}
                                    busy={busy}
                                    onMove={handleMove}
                                    onPlan={setPlanning}
                                    onLogVisit={logVisit}
                                />
                            )}
                        </Section>
                    )}

                    {data.plan?.dayType === "working" && (
                        <Section title="Planned area" subtitle="Ranked by priority. Visited doctors move to the bottom." count={data.planned.length}>
                            {data.planned.length === 0 ? (
                                <EmptyState icon={PlaceRounded} title="No assigned doctors in this area" message="Ask your admin to assign doctors for this area, or check the doctors below." />
                            ) : (
                                data.planned.map((doctor) => (
                                    <DoctorBriefCard key={doctor.DoctorId} doctor={doctor} {...cardProps} />
                                ))
                            )}
                        </Section>
                    )}

                    {data.followUpsElsewhere.length > 0 && (
                        <Section title="Follow-ups outside this area" subtitle="Due or overdue: plan a deviation or another day." count={data.followUpsElsewhere.length}>
                            {data.followUpsElsewhere.map((doctor) => (
                                <DoctorBriefCard key={doctor.DoctorId} doctor={doctor} {...cardProps} />
                            ))}
                        </Section>
                    )}

                    {data.others.length > 0 && (
                        <Section
                            title={data.plan?.dayType === "working" ? "Other assigned doctors" : "Your doctors"}
                            subtitle="Ranked by priority"
                            count={data.others.length}
                            collapsible={data.plan?.dayType === "working"}
                            defaultOpen={data.plan?.dayType !== "working"}
                        >
                            {data.others.map((doctor) => (
                                <DoctorBriefCard key={doctor.DoctorId} doctor={doctor} {...cardProps} />
                            ))}
                        </Section>
                    )}

                    {s.assignedDoctors === 0 && (
                        <EmptyState icon={GroupsRounded} title="No doctors assigned yet" message="Doctors assigned to you in Configuration appear here." />
                    )}
                </Box>
            )}

            {planning && (
                <PlanCallDialog
                    key={planning.DoctorId}
                    doctor={planning}
                    date={date}
                    saving={busy}
                    onClose={() => setPlanning(null)}
                    onSave={handleSavePlan}
                />
            )}
        </Box>
    );
}

export default PreCall;
