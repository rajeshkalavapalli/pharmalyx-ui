import { useCallback, useEffect, useState } from "react";

import {
    Box,
    Divider,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    FeedbackRounded,
    SentimentDissatisfiedRounded,
    SentimentNeutralRounded,
    SentimentSatisfiedAltRounded,
    SpeedRounded,
} from "@mui/icons-material";

import ActingUserSelect from "../../../components/ActingUserSelect/ActingUserSelect";
import useActingUser from "../../../components/ActingUserSelect/useActingUser";
import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import MonthSwitcher from "../../../components/MonthSwitcher/MonthSwitcher";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import TeamViewSelect, { useTeamView } from "../../../components/TeamViewSelect/TeamViewSelect";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import { FEEDBACK, errorMessage, formatDate, getFeedback, monthKey } from "../index";

const ORDER = ["POSITIVE", "NEUTRAL", "NEGATIVE"];

// 100% bar of responses; segments carry status colors with labels, never color alone.
function SentimentBar({ counts, total, height }) {
    return (
        <Box
            role="img"
            aria-label={ORDER.map((key) => `${FEEDBACK[key].label} ${counts[key]}`).join(", ")}
            sx={(theme) => ({
                display: "flex",
                gap: `${theme.dashboard.barGap}px`,
                height: theme.spacing(height),
                borderRadius: `${theme.dashboard.barRadius}px`,
                overflow: "hidden",
                backgroundColor: theme.palette.surface.muted,
            })}
        >
            {ORDER.filter((key) => counts[key] > 0).map((key) => (
                <Tooltip key={key} title={`${FEEDBACK[key].label}: ${counts[key]}`} placement="top">
                    <Box sx={(theme) => ({ width: `${(counts[key] / total) * 100}%`, backgroundColor: theme.palette[FEEDBACK[key].color].main })} />
                </Tooltip>
            ))}
        </Box>
    );
}

function Feedback() {
    const { actingUserId, setActingUserId, users } = useActingUser();
    const { team, viewUserId, setViewUserId, viewing } = useTeamView(actingUserId);

    const [month, setMonth] = useState(monthKey());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        if (!viewUserId) return;

        setLoading(true);
        setError("");

        try {
            setData(await getFeedback(viewUserId, month));
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load feedback"));
        } finally {
            setLoading(false);
        }
    }, [viewUserId, month]);

    useEffect(() => {
        load();
    }, [load]);

    const s = data?.summary;
    const counts = { POSITIVE: s?.positive || 0, NEUTRAL: s?.neutral || 0, NEGATIVE: s?.negative || 0 };

    return (
        <Box>
            <PageHeader
                eyebrow="Doctor engagement · Feedback"
                title={viewing && !viewing.IsSelf ? `${viewing.Name}'s feedback` : "Doctor feedback"}
                subtitle="How doctors responded on calls, who needs attention, and where relationships are strongest. Captured when logging visits."
                actions={
                    <>
                        <ActingUserSelect users={users} value={actingUserId} onChange={setActingUserId} />
                        <TeamViewSelect team={team} value={viewUserId} onChange={setViewUserId} />
                    </>
                }
            />

            {!actingUserId ? (
                <Panel>
                    <EmptyState icon={FeedbackRounded} title="Choose a user to continue" message="Pick who you are acting as from the header." />
                </Panel>
            ) : error ? (
                <LoadError title="Couldn't load feedback" message={error} onRetry={load} />
            ) : (
                <Box sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}>
                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                            gap: theme.stat.gap,
                            mb: theme.pageHeader.marginBottom,
                        })}
                    >
                        <StatCard
                            icon={SpeedRounded}
                            label="Net sentiment"
                            value={s?.netScore == null ? "—" : `${s.netScore > 0 ? "+" : ""}${s.netScore}`}
                            caption="% positive minus % negative"
                            color={s?.netScore == null ? "info" : s.netScore >= 0 ? "success" : "error"}
                        />
                        <StatCard icon={SentimentSatisfiedAltRounded} label="Positive" value={counts.POSITIVE} caption={`of ${s?.rated ?? 0} rated calls`} color="success" />
                        <StatCard icon={SentimentNeutralRounded} label="Neutral" value={counts.NEUTRAL} caption="Room to convince" color="info" />
                        <StatCard
                            icon={SentimentDissatisfiedRounded}
                            label="Negative"
                            value={counts.NEGATIVE}
                            caption={s?.unrated ? `${s.unrated} call(s) without a response` : "Every call rated"}
                            color="error"
                        />
                    </Box>

                    <Stack spacing={2}>
                        <Panel title="Response mix" actions={<MonthSwitcher month={month} onChange={setMonth} />}>
                            {s?.rated ? (
                                <>
                                    <SentimentBar counts={counts} total={s.rated} height={2} />
                                    <Stack direction="row" sx={{ mt: 1.5, gap: 2.5, flexWrap: "wrap" }}>
                                        {ORDER.map((key) => (
                                            <Stack key={key} direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                                                <Box sx={(theme) => ({ width: theme.calendar.legendSwatch, height: theme.calendar.legendSwatch, borderRadius: theme.engagement.swatchRadius, backgroundColor: theme.palette[FEEDBACK[key].color].main })} />
                                                <Typography variant="caption">
                                                    {FEEDBACK[key].label} · {Math.round((counts[key] / s.rated) * 100)}%
                                                </Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </>
                            ) : (
                                <EmptyState icon={FeedbackRounded} title={loading ? "Loading…" : "No rated calls this month"} message={loading ? "" : "Pick the doctor's response when you log a visit."} />
                            )}
                        </Panel>

                        <Box
                            sx={(theme) => ({
                                display: "grid",
                                gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1.3fr) minmax(0, 1fr)" },
                                gap: theme.stat.gap,
                                alignItems: "start",
                            })}
                        >
                            <Panel title="By doctor" subtitle="Doctors with negative responses first" disablePadding>
                                {data?.doctors?.length ? (
                                    <Box sx={{ overflowX: "auto" }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Doctor</TableCell>
                                                    <TableCell>Responses</TableCell>
                                                    <TableCell>Latest</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.doctors.map((doctor) => {
                                                    const rated = doctor.Positive + doctor.Neutral + doctor.Negative;
                                                    const latest = FEEDBACK[doctor.LatestFeedback];

                                                    return (
                                                        <TableRow key={doctor.DoctorId} hover>
                                                            <TableCell>
                                                                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                                    <Typography variant="subtitle2">{doctor.DoctorName}</Typography>
                                                                    <CategoryBadge category={doctor.Category} />
                                                                </Stack>
                                                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                    {doctor.Visits} call(s) · {doctor.Speciality || "—"}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={(theme) => ({ minWidth: theme.spacing(18) })}>
                                                                {rated ? (
                                                                    <SentimentBar counts={{ POSITIVE: doctor.Positive, NEUTRAL: doctor.Neutral, NEGATIVE: doctor.Negative }} total={rated} height={1} />
                                                                ) : (
                                                                    "Not rated"
                                                                )}
                                                            </TableCell>
                                                            <TableCell>{latest ? <Tag label={latest.label} color={latest.color} /> : "—"}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                ) : (
                                    <EmptyState icon={FeedbackRounded} title="No calls this month" />
                                )}
                            </Panel>

                            <Panel title="Needs attention" subtitle="Negative and neutral calls">
                                {data?.attention?.length ? (
                                    <Stack divider={<Divider />}>
                                        {data.attention.map((item) => (
                                            <Box key={item.VisitId} sx={{ py: 1.25 }}>
                                                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                    <Typography variant="subtitle2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                                                        {item.DoctorName}
                                                    </Typography>
                                                    <Tag label={FEEDBACK[item.Feedback].label} color={FEEDBACK[item.Feedback].color} />
                                                </Stack>
                                                <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                    {formatDate(item.VisitDate)}
                                                    {item.FollowUpDate ? ` · follow-up ${formatDate(item.FollowUpDate)}` : " · no follow-up set"}
                                                </Typography>
                                                {item.Notes && (
                                                    <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                                                        {item.Notes}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        Nothing needs attention this month.
                                    </Typography>
                                )}
                            </Panel>
                        </Box>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}

export default Feedback;
