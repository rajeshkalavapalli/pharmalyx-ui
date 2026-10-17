import { useCallback, useEffect, useState } from "react";

import { Box, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AssignmentTurnedInRounded,
    BeachAccessRounded,
    EventAvailableRounded,
    FactCheckRounded,
    LocationOnRounded,
    LoginRounded,
    LogoutRounded,
    MapRounded,
    ReceiptLongRounded,
    ShoppingCartRounded,
    TimelineRounded,
} from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import { EmployeePicker } from "../../Insights/components/InsightsLayout";
import { errorMessage, getActivity, shiftKey, todayKey } from "../index";

const EVENT = {
    CHECK_IN: { icon: LoginRounded, color: "success" },
    CHECK_OUT: { icon: LogoutRounded, color: "secondary" },
    VISIT: { icon: LocationOnRounded, color: "primary" },
    DCR: { icon: AssignmentTurnedInRounded, color: "info" },
    ORDER: { icon: ShoppingCartRounded, color: "success" },
    RCPA: { icon: FactCheckRounded, color: "warning" },
    LEAVE: { icon: BeachAccessRounded, color: "info" },
    EXPENSE: { icon: ReceiptLongRounded, color: "warning" },
    TOUR_PLAN: { icon: MapRounded, color: "primary" },
};

const dayTitle = (key) => new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });

// Day-by-day feed of everything an employee did.
function Activity() {
    const [userId, setUserId] = useState("");
    const [from, setFrom] = useState(shiftKey(todayKey(), -6));
    const [to, setTo] = useState(todayKey());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        if (!from || !to || from > to) return;
        setLoading(true);
        setError("");

        try {
            setData(await getActivity(userId, from, to));
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load activity"));
        } finally {
            setLoading(false);
        }
    }, [userId, from, to]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <Box>
            <PageHeader
                eyebrow="HR / Employee"
                title={data?.user && userId ? `${data.user.Name}'s activity` : "Activity"}
                subtitle="Everything done in the field, day by day: check-ins, visits, DCRs, orders, RCPA, leave and claims."
                actions={
                    <>
                        <EmployeePicker value={userId} onChange={setUserId} />
                        <TextField size="small" type="date" label="From" value={from} onChange={(event) => setFrom(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: to } }} />
                        <TextField size="small" type="date" label="To" value={to} onChange={(event) => setTo(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: from, max: todayKey() } }} />
                    </>
                }
            />

            {error ? (
                <LoadError title="Couldn't load activity" message={error} onRetry={load} />
            ) : (
                <Box sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1, transition: theme.calendar.transition })}>
                    <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                        <StatCard icon={TimelineRounded} label="Activities" value={data?.totals.events ?? "—"} caption={data?.user ? data.user.Name : "—"} color="primary" />
                        <StatCard icon={EventAvailableRounded} label="Active days" value={data ? `${data.totals.activeDays}/${data.days.length}` : "—"} caption="Days with any activity" color="success" />
                        <StatCard icon={LocationOnRounded} label="Visits" value={data?.totals.visits ?? "—"} caption="Doctor calls" color="info" />
                        <StatCard icon={ShoppingCartRounded} label="Orders" value={data?.totals.orders ?? "—"} caption="POB booked" color="warning" />
                    </Box>

                    {data && (
                        <Stack spacing={2}>
                            {data.days.map((day) => (
                                <Panel
                                    key={day.day}
                                    title={dayTitle(day.day)}
                                    subtitle={day.events.length ? [day.summary.checkIn ? `In ${day.summary.checkIn}` : null, day.summary.checkOut ? `Out ${day.summary.checkOut}` : null, `${day.summary.visits} visit(s)`].filter(Boolean).join(" · ") : "No activity"}
                                    actions={day.summary.dcr ? <Tag label="DCR sent" color="info" /> : null}
                                >
                                    {day.events.length ? (
                                        <Stack>
                                            {day.events.map((event, index) => {
                                                const { icon: Icon, color } = EVENT[event.type] || EVENT.VISIT;
                                                const last = index === day.events.length - 1;

                                                return (
                                                    <Stack key={`${event.type}-${index}`} direction="row" sx={{ gap: 1.5 }}>
                                                        <Typography variant="caption" sx={(theme) => ({ width: theme.dashboard.scheduleTimeWidth, flexShrink: 0, pt: 0.75, color: theme.palette.text.secondary, fontVariantNumeric: "tabular-nums" })}>
                                                            {event.time || "—"}
                                                        </Typography>
                                                        <Stack sx={{ alignItems: "center" }}>
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
                                                            {!last && <Box sx={(theme) => ({ flex: 1, width: "1px", my: 0.5, backgroundColor: theme.palette.border.default })} />}
                                                        </Stack>
                                                        <Box sx={{ pb: last ? 0 : 2, pt: 0.5, minWidth: 0 }}>
                                                            <Typography variant="subtitle2">{event.title}</Typography>
                                                            {event.detail && (
                                                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                    {event.detail}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Stack>
                                                );
                                            })}
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            Nothing recorded on this day.
                                        </Typography>
                                    )}
                                </Panel>
                            ))}
                        </Stack>
                    )}

                    {data && !data.totals.events && <EmptyState icon={TimelineRounded} title="No activity in this range" message="Pick another range or employee." />}
                </Box>
            )}
        </Box>
    );
}

export default Activity;
