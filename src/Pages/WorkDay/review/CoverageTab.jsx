import { useEffect, useState } from "react";

import { Box, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AssignmentTurnedInRounded, CheckCircleRounded, HighlightOffRounded, PercentRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import { errorMessage, getCoverage, thisMonth } from "../index";

const STATUS = { MET: { label: "Met", color: "success" }, PARTIAL: { label: "Partly", color: "warning" }, MISSED: { label: "Missed", color: "error" } };

// Required visits (by class) vs actual valid visits, per doctor, for a month.
function CoverageTab({ people }) {
    const [month, setMonth] = useState(thisMonth());
    const [userId, setUserId] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        setData(null);
        getCoverage(month, userId || undefined)
            .then((result) => {
                setData(result);
                setError("");
            })
            .catch((err) => setError(errorMessage(err, "Couldn't load coverage")));
    }, [month, userId]);

    const s = data?.summary;

    return (
        <Stack spacing={2}>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <TextField size="small" type="month" label="Month" value={month} onChange={(e) => setMonth(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField select size="small" label="Employee" value={userId} onChange={(e) => setUserId(e.target.value)} sx={(theme) => ({ minWidth: theme.spacing(26) })}>
                    <MenuItem value="">Me</MenuItem>
                    {people.map((person) => (
                        <MenuItem key={person.UserId} value={person.UserId}>
                            {person.Name}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            {s && (
                <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                    <StatCard icon={PercentRounded} label="Coverage" value={s.percent == null ? "—" : `${s.percent}%`} caption={`${s.valid} of ${s.required} required visits`} color="primary" progress={s.percent || 0} />
                    <StatCard icon={CheckCircleRounded} label="Doctors met" value={s.met} caption={`of ${s.doctors}`} color="success" />
                    <StatCard icon={AssignmentTurnedInRounded} label="Not visited" value={s.missed} caption="No valid visit yet" color="warning" />
                    <StatCard icon={HighlightOffRounded} label="Not counted visits" value={s.notCounted} caption="Logged but invalid" color="error" />
                </Box>
            )}

            <Panel title="Doctors" subtitle="Required per month: class A 3, B 2, C 1 (or the doctor's own target). Only valid visits count.">
                {error ? (
                    <Typography color="error">{error}</Typography>
                ) : data?.rows?.length ? (
                    <Stack divider={<Divider />}>
                        {data.rows.map((row) => (
                            <Stack key={row.DoctorId} direction="row" sx={{ py: 1, gap: 1.5, alignItems: "center" }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2">Dr. {row.DoctorName}</Typography>
                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {[row.Category ? `Class ${row.Category}` : null, row.AreaName, row.timing.label].filter(Boolean).join(" · ")}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ flexShrink: 0 }}>
                                    {row.valid} / {row.required}
                                </Typography>
                                <Tag label={STATUS[row.status].label} color={STATUS[row.status].color} />
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={AssignmentTurnedInRounded} title={data ? "No doctors assigned" : "Loading…"} />
                )}
            </Panel>
        </Stack>
    );
}

export default CoverageTab;
