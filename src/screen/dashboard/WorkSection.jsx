import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { CheckCircleRounded, ChevronRightRounded, FlagRounded, HighlightOffRounded, PercentRounded, TodayRounded } from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import Panel from "../../components/Panel/Panel";
import StatCard from "../../components/StatCard/StatCard";
import Tag from "../../components/Tag/Tag";
import { formatClock, getCoverage, getFlags, getToday, getWorkVisits } from "../../Pages/WorkDay/index";

const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);
const todayKey = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
const range = () => ({ from: `${todayKey().slice(0, 8)}01`, to: todayKey() });

const grid = (theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap });
const panels = (theme) => ({ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" }, gap: theme.stat.gap });

// Most common reasons visits were not counted.
const topReasons = (visits) => {
    const counts = new Map();
    visits.forEach((visit) => (visit.reasons || []).forEach((reason) => counts.set(reason.text, (counts.get(reason.text) || 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
};

function ReasonsPanel({ visits }) {
    const reasons = topReasons(visits.filter((v) => v.FinalValidity === "INVALID"));
    return (
        <Panel title="Why visits were not counted" subtitle="This month">
            {reasons.length ? (
                <Stack divider={<Divider />}>
                    {reasons.map(([text, count]) => (
                        <Stack key={text} direction="row" sx={{ py: 1, gap: 1.5, alignItems: "center" }}>
                            <Typography variant="body2" sx={{ flex: 1 }}>
                                {text}
                            </Typography>
                            <Tag label={String(count)} color="error" />
                        </Stack>
                    ))}
                </Stack>
            ) : (
                <EmptyState icon={CheckCircleRounded} title="Every visit counted" />
            )}
        </Panel>
    );
}

// Manager: valid vs not counted for the team, per rep, and open red flags.
function TeamWork() {
    const [visits, setVisits] = useState(null);
    const [flags, setFlags] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        Promise.all([getWorkVisits(range()), getFlags("OPEN")])
            .then(([v, f]) => {
                setVisits(v);
                setFlags(f);
            })
            .catch(() => setFailed(true));
    }, []);

    const perRep = useMemo(() => {
        const map = new Map();
        (visits?.visits || []).forEach((v) => {
            const row = map.get(v.EmployeeName) || { name: v.EmployeeName, valid: 0, invalid: 0 };
            if (v.FinalValidity === "VALID") row.valid++;
            if (v.FinalValidity === "INVALID") row.invalid++;
            map.set(v.EmployeeName, row);
        });
        return [...map.values()].sort((a, b) => b.invalid - a.invalid || a.name.localeCompare(b.name));
    }, [visits]);

    if (failed) return <EmptyState icon={CheckCircleRounded} title="Verified work isn't available" />;
    if (!visits || !flags) return <EmptyState icon={CheckCircleRounded} title="Loading…" />;

    const s = visits.summary;
    const checked = s.valid + s.invalid;

    return (
        <>
            <Box sx={grid}>
                <StatCard icon={CheckCircleRounded} label="Valid visits" value={s.valid} caption={`${percent(s.valid, checked)}% of checked visits`} color="success" progress={percent(s.valid, checked)} />
                <StatCard icon={HighlightOffRounded} label="Not counted" value={s.invalid} caption="Drive-by, outside territory, typed later…" color="error" />
                <StatCard icon={FlagRounded} label="Open red flags" value={flags.flags.length} caption="Reviewed by head office" color={flags.flags.length ? "warning" : "secondary"} />
                <StatCard icon={PercentRounded} label="Head office changes" value={s.overridden} caption="Overrides, all in the audit log" color="info" />
            </Box>
            <Box sx={panels}>
                <Panel
                    title="By representative"
                    subtitle="This month · managers can view, not change"
                    actions={
                        <Button size="small" endIcon={<ChevronRightRounded />} component={RouterLink} to="/field-operation/verified-work">
                            Verified work
                        </Button>
                    }
                >
                    {perRep.length ? (
                        <Stack divider={<Divider />}>
                            {perRep.map((rep) => (
                                <Stack key={rep.name} direction="row" sx={{ py: 1, gap: 1, alignItems: "center" }}>
                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                        {rep.name}
                                    </Typography>
                                    <Tag label={`${rep.valid} valid`} color="success" />
                                    {rep.invalid > 0 && <Tag label={`${rep.invalid} not counted`} color="error" />}
                                </Stack>
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState icon={CheckCircleRounded} title="No visits yet this month" />
                    )}
                </Panel>
                <ReasonsPanel visits={visits.visits} />
            </Box>
        </>
    );
}

// The MR: today's valid visits against the DA rule, the month and coverage.
function MyWork({ userId }) {
    const [today, setToday] = useState(null);
    const [visits, setVisits] = useState(null);
    const [coverage, setCoverage] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        Promise.all([getToday(), getWorkVisits({ ...range(), userId }), getCoverage(todayKey().slice(0, 7))])
            .then(([t, v, c]) => {
                setToday(t);
                setVisits(v);
                setCoverage(c);
            })
            .catch(() => setFailed(true));
    }, [userId]);

    if (failed) return <EmptyState icon={TodayRounded} title="Verified work isn't available" />;
    if (!today || !visits || !coverage) return <EmptyState icon={TodayRounded} title="Loading…" />;

    const s = visits.summary;
    const da = today.rules.daMinValidVisits;

    return (
        <>
            <Box sx={grid}>
                <StatCard icon={TodayRounded} label="Valid visits today" value={today.validToday} caption={`DA needs ${da}`} color={today.validToday >= da ? "success" : "warning"} progress={percent(Math.min(today.validToday, da), da)} />
                <StatCard icon={CheckCircleRounded} label="Valid this month" value={s.valid} caption={`${s.invalid} not counted`} color="success" />
                <StatCard icon={PercentRounded} label="Doctor coverage" value={coverage.summary.percent == null ? "—" : `${coverage.summary.percent}%`} caption={`${coverage.summary.valid} of ${coverage.summary.required} required visits`} color="primary" progress={coverage.summary.percent || 0} />
                <StatCard icon={FlagRounded} label="Day started" value={today.workDay ? formatClock(today.workDay.StartedAt) : "—"} caption={today.planned?.areaName ? `Patch: ${today.planned.areaName}` : "No plan for today"} color="info" />
            </Box>
            <Box sx={panels}>
                <Panel
                    title="Today's visits"
                    subtitle="Valid when you stay the minimum time at the clinic, inside your territory"
                    actions={
                        <Button size="small" endIcon={<ChevronRightRounded />} component={RouterLink} to="/field-operation/my-day">
                            My day
                        </Button>
                    }
                >
                    {today.visits.length ? (
                        <Stack divider={<Divider />}>
                            {today.visits.map((visit) => (
                                <Stack key={visit.VisitId} direction="row" sx={{ py: 1, gap: 1, alignItems: "center" }}>
                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                        Dr. {visit.DoctorName}
                                    </Typography>
                                    <Tag label={visit.FinalValidity === "VALID" ? "Valid" : visit.FinalValidity === "INVALID" ? "Not counted" : "Before verification"} color={visit.FinalValidity === "VALID" ? "success" : visit.FinalValidity === "INVALID" ? "error" : "secondary"} />
                                </Stack>
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState icon={TodayRounded} title="No visits yet today" />
                    )}
                </Panel>
                <ReasonsPanel visits={visits.visits} />
            </Box>
        </>
    );
}

function WorkSection({ team, userId }) {
    return team ? <TeamWork /> : <MyWork userId={userId} />;
}

export default WorkSection;
