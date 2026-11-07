import { useCallback, useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LinearProgress,
    MenuItem,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { FactCheckRounded, GppGoodRounded, GppMaybeRounded, PolicyRounded, SchoolRounded, ShuffleRounded } from "@mui/icons-material";

import LoadError from "../../../components/LoadError/LoadError";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { getMyTeam } from "../../MyDoctors/index";
import { assignCrossAudit, errorMessage, formatDate, getAudits, getTruthScores } from "../index";

// Field Truth Score (team) and joint / cross audits. Built only from our own signals - doctors are never asked.

const BAND = {
    TRUSTED: { label: "Trusted", color: "success" },
    WATCH: { label: "Watch", color: "warning" },
    RISK: { label: "Risk", color: "error" },
    NO_DATA: { label: "No visits", color: "secondary" },
};

const STATUS = {
    ASSIGNED: { label: "To do", color: "info" },
    PASSED: { label: "Passed", color: "success" },
    DOCTOR_NOT_FOUND: { label: "Doctor not found", color: "error" },
    CLINIC_NOT_FOUND: { label: "Clinic not found", color: "error" },
    NOT_RECOGNISED: { label: "Didn't know the rep", color: "error" },
};

const REASON = { NOT_VERIFIED: "Not verified", NO_RX: "Visits, no Rx", SHORT_VISITS: "Short visits", NEW_DOCTOR: "New doctor", RANDOM: "Random" };

const PARTS = [
    { key: "presence", label: "Presence" },
    { key: "pattern", label: "Pattern" },
    { key: "audits", label: "Audits" },
    { key: "outcome", label: "Outcome" },
];

const monthNow = () => new Date().toISOString().slice(0, 7);

function PartBar({ part, label }) {
    const value = part?.value;
    const share = value == null ? 0 : Math.round((value / part.max) * 100);
    const color = value == null ? "secondary" : share >= 75 ? "success" : share >= 50 ? "warning" : "error";
    return (
        <Tooltip title={`${label}: ${value ?? "—"} of ${part?.max}`}>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
                    {label} · {value ?? "—"}/{part?.max}
                </Typography>
                <LinearProgress variant="determinate" value={share} color={color} sx={(theme) => ({ height: theme.stat.progressHeight, borderRadius: theme.stat.progressHeight })} />
            </Box>
        </Tooltip>
    );
}

function ScoreBadge({ score, band }) {
    const b = BAND[band] || BAND.NO_DATA;
    return (
        <Box
            sx={(theme) => ({
                width: theme.stat.iconSize,
                height: theme.stat.iconSize,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                ...theme.typography.subtitle2,
                color: b.color === "secondary" ? theme.palette.text.secondary : theme.palette[b.color].dark,
                backgroundColor: alpha(b.color === "secondary" ? theme.palette.text.secondary : theme.palette[b.color].main, theme.tint.soft),
            })}
        >
            {score ?? "—"}
        </Box>
    );
}

function Scores({ month }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setError("");
        setData(null);
        try {
            setData(await getTruthScores(month));
        } catch (err) {
            setError(errorMessage(err, "Couldn't load the scores"));
        }
    }, [month]);

    useEffect(() => {
        load();
    }, [load]);

    if (error) return <LoadError title="Couldn't load the scores" message={error} onRetry={load} />;
    if (!data) return <Skeleton variant="rounded" sx={(theme) => ({ height: theme.dashboard.skeleton.chart })} />;
    const scores = data.scores || [];
    const count = (band) => scores.filter((s) => s.band === band).length;

    return (
        <Stack spacing={2}>
            {data.learningMode && (
                <Alert severity="info" icon={<SchoolRounded />}>
                    Learning mode until {data.learningUntil?.replace(/(\d{4})(\d{2})(\d{2})/, "$3-$2-$1")}: scores are for coaching only, not for DA or incentives.
                </Alert>
            )}
            <Box sx={(theme) => ({ display: "grid", gap: theme.stat.gap, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } })}>
                <StatCard icon={GppGoodRounded} label="Trusted (80+)" value={count("TRUSTED")} color="success" />
                <StatCard icon={GppMaybeRounded} label="Watch (60–79)" value={count("WATCH")} color="warning" />
                <StatCard icon={PolicyRounded} label="Risk (below 60)" value={count("RISK")} color="error" />
                <StatCard icon={FactCheckRounded} label="Team Rx share" value={data.teamShare == null ? "—" : `${data.teamShare}%`} caption="Visited doctors prescribing" color="info" />
            </Box>
            <Panel title="Field Truth Score" subtitle="Lowest first · presence 40 + pattern 20 + audits 25 + outcome 15" disablePadding>
                {scores.length === 0 ? (
                    <Typography variant="body2" sx={{ color: "text.secondary", p: 3, textAlign: "center" }}>
                        No team members yet.
                    </Typography>
                ) : (
                    <Stack>
                        {scores.map((s) => (
                            <Box key={s.userId} sx={(theme) => ({ px: theme.panel.padding, py: 1.75, borderTop: `1px solid ${theme.palette.divider}` })}>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "center" } }}>
                                    <Stack direction="row" spacing={1.5} sx={(theme) => ({ alignItems: "center", minWidth: { md: theme.dashboard.leaderboard.nameMinWidth * 1.6 } })}>
                                        <ScoreBadge score={s.score} band={s.band} />
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="subtitle2" noWrap>
                                                {s.name}
                                            </Typography>
                                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                    {[s.designation, `${s.visits} visits`].filter(Boolean).join(" · ")}
                                                </Typography>
                                                <Tag label={BAND[s.band]?.label} color={BAND[s.band]?.color} />
                                            </Stack>
                                        </Box>
                                    </Stack>
                                    <Box sx={{ flex: 1, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, minmax(0, 1fr))" } }}>
                                        {PARTS.map((p) => (
                                            <PartBar key={p.key} part={s.parts[p.key]} label={p.label} />
                                        ))}
                                    </Box>
                                </Stack>
                                {s.notes?.length > 0 && (
                                    <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
                                        {s.notes.join(" · ")}
                                    </Typography>
                                )}
                            </Box>
                        ))}
                    </Stack>
                )}
            </Panel>
        </Stack>
    );
}

function CrossAuditDialog({ team, onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();
    const [rep, setRep] = useState("");
    const [auditor, setAuditor] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const people = team.filter((m) => !m.IsSelf);

    const save = async () => {
        setSaving(true);
        setError("");
        try {
            const r = await assignCrossAudit({ UserId: rep, AuditorId: auditor, AuditDate: date });
            showSnackbar(r.message || "Cross-audit assigned", "success");
            onSaved();
        } catch (err) {
            setError(errorMessage(err, "Couldn't assign the cross-audit"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Assign a cross-audit</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                    Another manager visits two of the rep's doctors on that day. The system picks the doctors; only the auditor sees them, on the day.
                </Typography>
                <Stack spacing={2}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField select label="Rep to audit" value={rep} onChange={(e) => setRep(e.target.value)} fullWidth>
                        {people.map((m) => (
                            <MenuItem key={m.UserId} value={m.UserId}>
                                {m.Name}
                                {m.DesignationName ? ` · ${m.DesignationName}` : ""}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField select label="Auditor (not the rep's own manager)" value={auditor} onChange={(e) => setAuditor(e.target.value)} fullWidth>
                        {team.filter((m) => m.UserId !== rep).map((m) => (
                            <MenuItem key={m.UserId} value={m.UserId}>
                                {m.Name}
                                {m.DesignationName ? ` · ${m.DesignationName}` : ""}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" disabled={!rep || !auditor || !date || saving} onClick={save}>
                    Assign
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function Audits({ month }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [team, setTeam] = useState([]);
    const [assigning, setAssigning] = useState(false);

    const load = useCallback(async () => {
        setError("");
        setData(null);
        try {
            setData(await getAudits(month));
        } catch (err) {
            setError(errorMessage(err, "Couldn't load the audits"));
        }
    }, [month]);

    useEffect(() => {
        load();
        getMyTeam()
            .then((r) => setTeam(r?.team || []))
            .catch(() => setTeam([]));
    }, [load]);

    if (error) return <LoadError title="Couldn't load the audits" message={error} onRetry={load} />;
    if (!data) return <Skeleton variant="rounded" sx={(theme) => ({ height: theme.dashboard.skeleton.chart })} />;
    const s = data.summary;

    return (
        <Stack spacing={2}>
            <Box sx={(theme) => ({ display: "grid", gap: theme.stat.gap, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } })}>
                <StatCard icon={FactCheckRounded} label="Audits" value={s.total} caption={`${s.pending} to do`} color="primary" />
                <StatCard icon={GppGoodRounded} label="Passed" value={s.passed} color="success" />
                <StatCard icon={GppMaybeRounded} label="Failed" value={s.failed} color="error" />
                <StatCard icon={PolicyRounded} label="Skipped" value={s.skipped} caption="Assigned, not done" color="warning" />
            </Box>
            <Panel
                title="Joint & cross audits"
                subtitle="Doctors picked by risk plus one at random · the rep never sees these"
                actions={
                    data.headOffice && (
                        <Button variant="contained" startIcon={<ShuffleRounded />} onClick={() => setAssigning(true)}>
                            Cross-audit
                        </Button>
                    )
                }
                disablePadding
            >
                {data.audits.length === 0 ? (
                    <Typography variant="body2" sx={{ color: "text.secondary", p: 3, textAlign: "center" }}>
                        No audits this month. They are created on confirmed joint work days, or assign a cross-audit.
                    </Typography>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Rep</TableCell>
                                    <TableCell>Doctor</TableCell>
                                    <TableCell>Why picked</TableCell>
                                    <TableCell>Auditor</TableCell>
                                    <TableCell>Result</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.audits.map((a) => (
                                    <TableRow key={a.auditId} hover>
                                        <TableCell>{formatDate(a.auditDate)}</TableCell>
                                        <TableCell>{a.repName}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">Dr. {a.doctorName}</Typography>
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                {[a.areaName, a.distanceM != null && `${a.distanceM} m from clinic`, a.repMatched === false && "rep not checked in there"].filter(Boolean).join(" · ")}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{REASON[a.reason] || a.reason}</TableCell>
                                        <TableCell>
                                            {a.auditorName}
                                            {a.kind === "CROSS" && (
                                                <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                                                    Cross-audit
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Tag label={(a.status === "ASSIGNED" && a.auditDate < new Date().toISOString().slice(0, 10) ? "Skipped" : STATUS[a.status]?.label) || a.status} color={a.status === "ASSIGNED" && a.auditDate < new Date().toISOString().slice(0, 10) ? "warning" : STATUS[a.status]?.color} />
                                            {a.notes && (
                                                <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                                                    {a.notes}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Panel>
            {assigning && (
                <CrossAuditDialog
                    team={team}
                    onClose={() => setAssigning(false)}
                    onSaved={() => {
                        setAssigning(false);
                        load();
                    }}
                />
            )}
        </Stack>
    );
}

function FieldTruth() {
    const [tab, setTab] = useState("scores");
    const [month, setMonth] = useState(monthNow());

    return (
        <Box>
            <PageHeader
                eyebrow="Insights"
                title="Field truth"
                subtitle="Is the field work real? Built only from our own signals: GPS presence, visit patterns, joint audits and prescriptions. Doctors are never asked."
                actions={<TextField type="month" size="small" label="Month" value={month} onChange={(e) => setMonth(e.target.value || monthNow())} slotProps={{ inputLabel: { shrink: true } }} />}
            />
            <Box sx={(theme) => ({ mb: theme.stat.gap })}>
                <SegmentedControl
                    value={tab}
                    onChange={setTab}
                    options={[
                        { value: "scores", label: "Truth Score", icon: GppGoodRounded },
                        { value: "audits", label: "Audits", icon: FactCheckRounded },
                    ]}
                />
            </Box>
            {tab === "scores" ? <Scores month={month} /> : <Audits month={month} />}
        </Box>
    );
}

export default FieldTruth;
