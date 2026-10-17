import { useCallback, useEffect, useState } from "react";

import { Box, Button, Stack, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AccessTimeRounded,
    EventAvailableRounded,
    EventBusyRounded,
    GpsFixedRounded,
    LoginRounded,
    LogoutRounded,
    BeachAccessRounded,
    TimerRounded,
} from "@mui/icons-material";

import LoadError from "../../../components/LoadError/LoadError";
import MonthSwitcher from "../../../components/MonthSwitcher/MonthSwitcher";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import ReportTable from "../../Reports/components/ReportTable";
import { EmployeePicker } from "../../Insights/components/InsightsLayout";
import { DAY_STATUS, captureLocation, checkIn, checkOut, errorMessage, getAttendanceMonth, getToday, todayKey } from "../index";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Check in / out for today, with GPS.
function TodayCard({ today, onDone }) {
    const { showSnackbar } = useSnackbar();
    const [busy, setBusy] = useState(false);

    const act = async (kind) => {
        setBusy(true);

        try {
            const location = await captureLocation();
            const response = await (kind === "in" ? checkIn(location) : checkOut(location));
            showSnackbar(`${response?.message || "Saved"}${location.LocationStatus === "CAPTURED" ? "" : " (location not available)"}`, "success");
            onDone();
        } catch (err) {
            showSnackbar(errorMessage(err, kind === "in" ? "Failed to check in" : "Failed to check out"), "error");
        } finally {
            setBusy(false);
        }
    };

    const late = today.checkIn && today.checkIn.time > today.lateAfter;

    return (
        <Panel
            title="Today"
            subtitle={new Date(`${today.date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            actions={
                !today.checkIn ? (
                    <Button variant="contained" startIcon={<LoginRounded />} disabled={busy} onClick={() => act("in")}>
                        {busy ? "Getting location…" : "Check in"}
                    </Button>
                ) : !today.checkOut ? (
                    <Button variant="outlined" startIcon={<LogoutRounded />} disabled={busy} onClick={() => act("out")}>
                        {busy ? "Getting location…" : "Check out"}
                    </Button>
                ) : (
                    <Tag label="Day complete" color="success" />
                )
            }
            sx={(theme) => ({ mb: theme.stat.gap })}
        >
            <Stack direction="row" sx={{ gap: 4, flexWrap: "wrap" }}>
                {[
                    { label: "Checked in", value: today.checkIn?.time, location: today.checkIn?.location, extra: late ? <Tag label="Late" color="warning" /> : null },
                    { label: "Checked out", value: today.checkOut?.time, location: today.checkOut?.location },
                ].map((item) => (
                    <Box key={item.label}>
                        <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            {item.label}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <Typography variant="metric">{item.value || "—"}</Typography>
                            {item.extra}
                        </Stack>
                        {item.location && (
                            <Typography variant="caption" sx={(theme) => ({ color: item.location === "CAPTURED" ? theme.palette.success.dark : theme.palette.warning.dark })}>
                                {item.location === "CAPTURED" ? "GPS captured" : "No GPS"}
                            </Typography>
                        )}
                    </Box>
                ))}
                <Typography variant="body2" sx={(theme) => ({ alignSelf: "center", color: theme.palette.text.secondary, maxWidth: theme.table.emptyMessageMaxWidth })}>
                    Check in when you start your field day and check out when you finish. Check-ins after {today.lateAfter} are marked late.
                </Typography>
            </Stack>
        </Panel>
    );
}

// One person's month as a calendar grid.
function MonthCalendar({ person }) {
    const firstWeekday = (new Date(`${person.days[0].day}T00:00:00`).getDay() + 6) % 7; // Monday = 0

    return (
        <Box>
            <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: theme.calendar.gridGap })}>
                {WEEKDAYS.map((day) => (
                    <Typography key={day} variant="caption" sx={(theme) => ({ textAlign: "center", py: theme.calendar.weekdayPaddingY, color: theme.palette.text.secondary, fontWeight: 600 })}>
                        {day}
                    </Typography>
                ))}
                {Array.from({ length: firstWeekday }, (_, index) => (
                    <Box key={`blank-${index}`} />
                ))}
                {person.days.map((day) => {
                    const status = DAY_STATUS[day.status];
                    const tip = [status.label, day.leave, day.checkIn ? `In ${day.checkIn}` : null, day.checkOut ? `Out ${day.checkOut}` : null, day.hours != null ? `${day.hours} h` : null, day.visits ? `${day.visits} visit(s)` : null].filter(Boolean).join(" · ");

                    return (
                        <Tooltip key={day.day} title={tip}>
                            <Box
                                sx={(theme) => ({
                                    minHeight: theme.calendar.cell.minHeight,
                                    p: theme.calendar.cell.padding,
                                    borderRadius: theme.calendar.cell.radius,
                                    border: "1px solid",
                                    borderColor: day.status === "TODAY" ? theme.palette.primary.main : theme.palette.border.subtle,
                                    backgroundColor: day.status === "UPCOMING" ? "transparent" : alpha(theme.palette[status.color].main, theme.tint.selected),
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.25,
                                })}
                            >
                                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                        {Number(day.day.slice(8))}
                                    </Typography>
                                    {status.short && (
                                        <Typography variant="micro" sx={(theme) => ({ fontWeight: 700, color: theme.palette[status.color].dark })}>
                                            {status.short}
                                        </Typography>
                                    )}
                                </Stack>
                                {day.checkIn && (
                                    <Typography variant="micro" sx={(theme) => ({ display: { xs: "none", sm: "block" }, color: day.late ? theme.palette.warning.dark : theme.palette.text.secondary })}>
                                        {day.checkIn}
                                        {day.checkOut ? `–${day.checkOut}` : ""}
                                    </Typography>
                                )}
                                {day.visits > 0 && (
                                    <Typography variant="micro" sx={(theme) => ({ display: { xs: "none", sm: "block" }, color: theme.palette.text.secondary })}>
                                        {day.visits} visit(s)
                                    </Typography>
                                )}
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>

            <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", mt: 2 }}>
                {["PRESENT", "ABSENT", "LEAVE", "WEEK_OFF"].map((key) => (
                    <Tag key={key} label={`${DAY_STATUS[key].short} ${DAY_STATUS[key].label}`} color={DAY_STATUS[key].color} />
                ))}
            </Stack>
        </Box>
    );
}

const TEAM_COLUMNS = [
    { key: "name", label: "Employee", csv: (row) => row.Name, render: (row) => <Typography variant="subtitle2">{row.IsSelf ? `${row.Name} (me)` : row.Name}</Typography> },
    { key: "present", label: "Present", align: "right", csv: (row) => row.summary.present },
    { key: "absent", label: "Absent", align: "right", csv: (row) => row.summary.absent, render: (row) => (row.summary.absent ? <Tag label={`${row.summary.absent}`} color="error" /> : "0") },
    { key: "leave", label: "Leave", align: "right", csv: (row) => row.summary.leave },
    { key: "weekOff", label: "Week off", align: "right", csv: (row) => row.summary.weekOff },
    { key: "late", label: "Late", align: "right", csv: (row) => row.summary.late, render: (row) => (row.summary.late ? <Tag label={`${row.summary.late}`} color="warning" /> : "0") },
    { key: "checkedIn", label: "Checked in", align: "right", csv: (row) => row.summary.checkedIn },
    { key: "avgHours", label: "Avg hours", align: "right", csv: (row) => row.summary.avgHours ?? "", render: (row) => row.summary.avgHours ?? "—" },
];

function Attendance() {
    const [month, setMonth] = useState(todayKey().slice(0, 7));
    const [userId, setUserId] = useState("");
    const [today, setToday] = useState(null);
    const [data, setData] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [todayResponse, monthResponse] = await Promise.all([getToday(), getAttendanceMonth(month, userId)]);
            setToday(todayResponse);
            setData(monthResponse);
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load attendance"));
        } finally {
            setLoading(false);
        }
    }, [month, userId]);

    useEffect(() => {
        load();
    }, [load]);

    const people = data?.people || [];
    const focus = people.length === 1 ? people[0] : people.find((person) => person.UserId === selectedId) || null;
    const totals = people.reduce(
        (acc, person) => ({ present: acc.present + person.summary.present, absent: acc.absent + person.summary.absent, leave: acc.leave + person.summary.leave, late: acc.late + person.summary.late }),
        { present: 0, absent: 0, leave: 0, late: 0 }
    );
    const shown = focus ? focus.summary : totals;

    return (
        <Box>
            <PageHeader
                eyebrow="HR / Employee"
                title="Attendance"
                subtitle="Check in and out each field day. Days are also marked from visits, DCRs, approved leave and week offs."
                actions={
                    <>
                        <EmployeePicker
                            value={userId}
                            onChange={(next) => {
                                setUserId(next);
                                setSelectedId(null);
                            }}
                        />
                        <MonthSwitcher month={month} onChange={setMonth} />
                    </>
                }
            />

            {error ? (
                <LoadError title="Couldn't load attendance" message={error} onRetry={load} />
            ) : (
                <Box sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1, transition: theme.calendar.transition })}>
                    {today && month === todayKey().slice(0, 7) && !userId && <TodayCard today={today} onDone={load} />}

                    <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                        <StatCard icon={EventAvailableRounded} label="Present days" value={shown.present} caption={focus ? focus.Name : `${people.length} people`} color="success" />
                        <StatCard icon={EventBusyRounded} label="Absent days" value={shown.absent} caption="Past working days with no activity" color={shown.absent ? "error" : "info"} />
                        <StatCard icon={BeachAccessRounded} label="Leave days" value={shown.leave} caption="Approved leave" color="info" />
                        <StatCard icon={AccessTimeRounded} label="Late check-ins" value={shown.late} caption={data ? `After ${data.lateAfter}` : "—"} color="warning" />
                    </Box>

                    {focus ? (
                        <Panel
                            title={people.length > 1 ? focus.Name : "My month"}
                            subtitle={[focus.DesignationName, focus.summary.avgHours != null ? `${focus.summary.avgHours} h average day` : null, `${focus.summary.checkedIn} check-in(s)`].filter(Boolean).join(" · ")}
                            actions={
                                people.length > 1 && (
                                    <Button size="small" onClick={() => setSelectedId(null)}>
                                        Back to team
                                    </Button>
                                )
                            }
                        >
                            <MonthCalendar person={focus} />
                        </Panel>
                    ) : (
                        <Panel title="Team attendance" subtitle="Select a person to see their calendar" disablePadding>
                            <ReportTable
                                columns={[
                                    ...TEAM_COLUMNS,
                                    {
                                        key: "open",
                                        label: "",
                                        csv: () => "",
                                        render: (row) => (
                                            <Button size="small" startIcon={<TimerRounded />} onClick={() => setSelectedId(row.UserId)}>
                                                Calendar
                                            </Button>
                                        ),
                                    },
                                ]}
                                rows={people}
                                rowKey={(row) => row.UserId}
                                empty="No one in view."
                            />
                        </Panel>
                    )}

                    {focus && (
                        <Typography variant="caption" component="p" sx={(theme) => ({ mt: 1, color: theme.palette.text.secondary })}>
                            <GpsFixedRounded sx={{ fontSize: "inherit", verticalAlign: "middle", mr: 0.5 }} />
                            Hover a day for check-in / out times, hours and visits.
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}

export default Attendance;
