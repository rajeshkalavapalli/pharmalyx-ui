import { useCallback, useEffect, useState } from "react";

import { Box, LinearProgress, MenuItem, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

import LoadError from "../../../components/LoadError/LoadError";
import Panel from "../../../components/Panel/Panel";
import Tag from "../../../components/Tag/Tag";
import { getMyTeam } from "../../MyDoctors/index";
import { errorMessage, formatDate, getBrandComparison, getDoctorJourney, getShelfAvailability } from "../index";

// Market truth: doctor journey stages for one person, and brand x rep prescription conversion.

const STAGE_COLOR = { NOT_VISITED: "secondary", VISITED: "info", SAMPLED: "primary", FIRST_RX: "warning", REGULAR: "success", STALLED: "error" };

export function DoctorJourney() {
    const [team, setTeam] = useState([]);
    const [userId, setUserId] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [stage, setStage] = useState("ALL");

    useEffect(() => {
        getMyTeam()
            .then((r) => {
                const list = r?.team || [];
                setTeam(list);
                const first = list.find((m) => !m.IsSelf) || list[0];
                if (first) setUserId(first.UserId);
            })
            .catch(() => setTeam([]));
    }, []);

    const load = useCallback(async () => {
        if (!userId) return;
        setError("");
        setData(null);
        try {
            setData(await getDoctorJourney(userId));
        } catch (err) {
            setError(errorMessage(err, "Couldn't load the doctor journey"));
        }
    }, [userId]);

    useEffect(() => {
        load();
    }, [load]);

    const total = data ? data.stages.reduce((s, x) => s + x.count, 0) : 0;
    const shown = data ? data.doctors.filter((d) => stage === "ALL" || d.stage === stage) : [];

    return (
        <Stack spacing={2}>
            <Panel
                title="Doctor journey"
                subtitle="Last 90 days · from first visit to regular prescriber · stalled = many visits, no prescriptions"
                actions={
                    <TextField select size="small" label="Person" value={userId} onChange={(e) => setUserId(e.target.value)} sx={(theme) => ({ minWidth: theme.dashboard.leaderboard.nameMinWidth * 1.5 })}>
                        {team.map((m) => (
                            <MenuItem key={m.UserId} value={m.UserId}>
                                {m.Name}
                                {m.DesignationName ? ` · ${m.DesignationName}` : ""}
                            </MenuItem>
                        ))}
                    </TextField>
                }
            >
                {error ? (
                    <LoadError title="Couldn't load the doctor journey" message={error} onRetry={load} />
                ) : !data ? (
                    <Skeleton variant="rounded" sx={(theme) => ({ height: theme.dashboard.skeleton.stat })} />
                ) : (
                    <Box sx={(theme) => ({ display: "grid", gap: theme.stat.gap, gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(6, minmax(0, 1fr))" } })}>
                        {data.stages.map((s) => {
                            const active = stage === s.key;
                            const color = STAGE_COLOR[s.key];
                            return (
                                <Box
                                    key={s.key}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setStage(active ? "ALL" : s.key)}
                                    sx={(theme) => {
                                        const main = color === "secondary" ? theme.palette.text.secondary : theme.palette[color].main;
                                        return {
                                            p: 1.75,
                                            cursor: "pointer",
                                            borderRadius: theme.card.radius,
                                            border: `1px solid ${active ? main : theme.palette.divider}`,
                                            backgroundColor: active ? alpha(main, theme.tint.soft) : theme.palette.background.paper,
                                        };
                                    }}
                                >
                                    <Typography variant="h5" component="p">
                                        {s.count}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                        {s.label}
                                    </Typography>
                                    <LinearProgress variant="determinate" value={total ? Math.round((s.count / total) * 100) : 0} color={color} sx={(theme) => ({ mt: 1, height: theme.stat.progressHeight, borderRadius: theme.stat.progressHeight })} />
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Panel>

            {data && (
                <Panel title={stage === "ALL" ? "All doctors" : data.stages.find((s) => s.key === stage)?.label} subtitle={`${shown.length} doctor(s)`} disablePadding>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Doctor</TableCell>
                                    <TableCell>Stage</TableCell>
                                    <TableCell align="right">Visits (90 d)</TableCell>
                                    <TableCell align="right">Samples</TableCell>
                                    <TableCell align="right">Rx months</TableCell>
                                    <TableCell>Last visit</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {shown.map((d) => (
                                    <TableRow key={d.doctorId} hover>
                                        <TableCell>
                                            <Typography variant="body2">Dr. {d.doctorName}</Typography>
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                {[d.category && `Class ${d.category}`, d.speciality, d.areaName].filter(Boolean).join(" · ")}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Tag label={data.stages.find((s) => s.key === d.stage)?.label} color={STAGE_COLOR[d.stage]} />
                                        </TableCell>
                                        <TableCell align="right">{d.visits}</TableCell>
                                        <TableCell align="right">{d.samplesGiven}</TableCell>
                                        <TableCell align="right">{d.rxMonths}</TableCell>
                                        <TableCell>{d.lastVisit ? formatDate(d.lastVisit) : "—"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Panel>
            )}
        </Stack>
    );
}

const VERDICT = {
    BRAND_WEAK: { label: "Brand weak for everyone", color: "error", hint: "Look at price, competition or the message, not the reps." },
    REPS_BEHIND: { label: "Some reps behind peers", color: "warning", hint: "Same brand converts for others - coach these reps." },
    OK: { label: "On track", color: "success", hint: "" },
};

export function BrandComparison() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setError("");
        try {
            setData(await getBrandComparison());
        } catch (err) {
            setError(errorMessage(err, "Couldn't load the brand comparison"));
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (error) return <LoadError title="Couldn't load the brand comparison" message={error} onRetry={load} />;
    if (!data) return <Skeleton variant="rounded" sx={(theme) => ({ height: theme.dashboard.skeleton.chart })} />;

    return (
        <Panel title="Brand vs rep" subtitle="Last 90 days · of the visited doctors checked in RCPA, how many prescribe each brand" disablePadding>
            {data.products.length === 0 ? (
                <Typography variant="body2" sx={{ color: "text.secondary", p: 3, textAlign: "center" }}>
                    No RCPA audits yet. Brand conversion appears once reps record RCPA at chemists.
                </Typography>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Brand</TableCell>
                                <TableCell align="right">Team conversion</TableCell>
                                <TableCell>Verdict</TableCell>
                                <TableCell>By rep (prescribing / checked)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.products.map((p) => (
                                <TableRow key={p.productId} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2">{p.productName}</Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                            {p.prescribingDoctors} of {p.auditedDoctors} doctors
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="subtitle2">{p.teamConversion == null ? "—" : `${p.teamConversion}%`}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Tag label={VERDICT[p.verdict].label} color={VERDICT[p.verdict].color} />
                                        {VERDICT[p.verdict].hint && (
                                            <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mt: 0.5 }}>
                                                {VERDICT[p.verdict].hint}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75 }}>
                                            {p.reps.map((r) => (
                                                <Tag
                                                    key={r.userId}
                                                    label={`${r.name}: ${r.prescribing}/${r.audited}${r.conversion != null ? ` (${r.conversion}%)` : ""}`}
                                                    color={r.vsTeam != null && r.vsTeam <= -20 ? "error" : r.vsTeam != null && r.vsTeam >= 10 ? "success" : "secondary"}
                                                />
                                            ))}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Panel>
    );
}

// Chemist shelf checks by reps: products missing at chemists lose prescriptions to competitors.
export function ShelfAvailability() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setError("");
        try {
            setData(await getShelfAvailability());
        } catch (err) {
            setError(errorMessage(err, "Couldn't load chemist availability"));
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (error) return <LoadError title="Couldn't load chemist availability" message={error} onRetry={load} />;
    if (!data) return <Skeleton variant="rounded" sx={(theme) => ({ height: theme.dashboard.skeleton.stat })} />;

    return (
        <Panel title="On the shelf" subtitle={`Latest rep checks at ${data.chemistsChecked} chemist(s) · last ${data.days} days`} disablePadding>
            {data.products.length === 0 ? (
                <Typography variant="body2" sx={{ color: "text.secondary", p: 3, textAlign: "center" }}>
                    No chemist checks yet. Reps record them in the app under Chemist Check.
                </Typography>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell align="right">On the shelf</TableCell>
                                <TableCell>Missing at</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.products.map((p) => (
                                <TableRow key={p.productId} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2">{p.productName}</Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                            {p.checked} chemist(s) checked
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tag label={p.availability == null ? "—" : `${p.availability}%`} color={p.availability >= 90 ? "success" : p.availability >= 60 ? "warning" : "error"} />
                                    </TableCell>
                                    <TableCell>
                                        {p.missing.length === 0 ? (
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                Everywhere checked
                                            </Typography>
                                        ) : (
                                            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75 }}>
                                                {p.missing.map((m) => (
                                                    <Tag key={m.pharmacyId} label={`${m.pharmacyName}${m.areaName ? ` · ${m.areaName}` : ""}`} color="error" />
                                                ))}
                                            </Stack>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Panel>
    );
}
