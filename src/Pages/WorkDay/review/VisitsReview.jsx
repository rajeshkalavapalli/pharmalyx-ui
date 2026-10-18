import { useCallback, useEffect, useState } from "react";

import { Box, Button, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { CheckCircleRounded, GavelRounded, HighlightOffRounded, RuleRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { errorMessage, formatClock, formatDay, formatDwell, getWorkVisits, overrideVisit, validityOf } from "../index";

const today = () => new Date().toISOString().slice(0, 10);
const monthStart = () => `${today().slice(0, 8)}01`;

// Managers see results and reasons; only head office (verifiedwork.approve) can override, with a reason.
function VisitsReview({ people, canOverride }) {
    const { showSnackbar } = useSnackbar();
    const [filters, setFilters] = useState({ from: monthStart(), to: today(), userId: "", validity: "" });
    const [data, setData] = useState(null);
    const [pending, setPending] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        getWorkVisits({ from: filters.from, to: filters.to, userId: filters.userId || undefined, validity: filters.validity || undefined })
            .then(setData)
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load visits"), "error"));
    }, [filters, showSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    const set = (patch) => setFilters((current) => ({ ...current, ...patch }));

    const confirm = async (reason) => {
        setBusy(true);
        try {
            const result = await overrideVisit(pending.visit.VisitId, pending.validity, reason);
            showSnackbar(result.message, "success");
            setPending(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Override failed"), "error");
        } finally {
            setBusy(false);
        }
    };

    const summary = data?.summary;

    return (
        <Stack spacing={2}>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <TextField size="small" type="date" label="From" value={filters.from} onChange={(e) => set({ from: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField size="small" type="date" label="To" value={filters.to} onChange={(e) => set({ to: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField select size="small" label="Employee" value={filters.userId} onChange={(e) => set({ userId: e.target.value })} sx={(theme) => ({ minWidth: theme.spacing(26) })}>
                    <MenuItem value="">Everyone</MenuItem>
                    {people.map((person) => (
                        <MenuItem key={person.UserId} value={person.UserId}>
                            {person.Name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField select size="small" label="Result" value={filters.validity} onChange={(e) => set({ validity: e.target.value })} sx={(theme) => ({ minWidth: theme.spacing(20) })}>
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="VALID">Valid</MenuItem>
                    <MenuItem value="INVALID">Not counted</MenuItem>
                    <MenuItem value="UNCHECKED">Before verification</MenuItem>
                </TextField>
            </Box>

            {summary && (
                <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                    <StatCard icon={RuleRounded} label="Visits" value={summary.total} caption={`${summary.unchecked} before verification`} color="primary" />
                    <StatCard icon={CheckCircleRounded} label="Valid" value={summary.valid} caption="Counted as work" color="success" />
                    <StatCard icon={HighlightOffRounded} label="Not counted" value={summary.invalid} caption="With the reason" color="error" />
                    <StatCard icon={GavelRounded} label="Head office overrides" value={summary.overridden} caption="Every change is in the audit log" color="warning" />
                </Box>
            )}

            <Panel title="Visits" subtitle={canOverride ? "Override only with a reason; old and new results are logged." : "View only. Results are decided by the system; only head office can change them."}>
                {data?.visits?.length ? (
                    <Stack divider={<Divider />}>
                        {data.visits.map((visit) => (
                            <Stack key={visit.VisitId} direction={{ xs: "column", md: "row" }} sx={{ py: 1.25, gap: 1.25, alignItems: { md: "center" } }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                                        <Typography variant="subtitle2">{visit.EmployeeName}</Typography>
                                        <Typography variant="body2">→ Dr. {visit.DoctorName}</Typography>
                                        <Tag label={validityOf(visit).label} color={validityOf(visit).color} />
                                        {visit.ValidityOverride && <Tag icon={GavelRounded} label="Head office" color="warning" title={visit.OverrideReason} />}
                                    </Stack>
                                    <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {[
                                            formatDay(visit.VisitDate),
                                            visit.AreaName,
                                            visit.CheckInAt ? `${formatClock(visit.CheckInAt)} – ${formatClock(visit.CheckOutAt)} (${formatDwell(visit.DwellSeconds)})` : "no live check-in",
                                            visit.DistanceFromClinicM != null ? `${visit.DistanceFromClinicM} m from clinic` : null,
                                            visit.InsideBoundary === false ? "outside territory" : null,
                                        ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </Typography>
                                    {visit.reasons.map((reason) => (
                                        <Typography key={reason.code} variant="caption" component="p" sx={(theme) => ({ color: theme.palette.error.main })}>
                                            • {reason.text}
                                        </Typography>
                                    ))}
                                    {visit.ValidityOverride && (
                                        <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {visit.OverrideByName}: {visit.OverrideReason}
                                        </Typography>
                                    )}
                                </Box>
                                {canOverride && (
                                    <Stack direction="row" sx={{ gap: 1, flexShrink: 0 }}>
                                        {visit.FinalValidity !== "VALID" && (
                                            <Button size="small" color="success" onClick={() => setPending({ visit, validity: "VALID" })}>
                                                Mark valid
                                            </Button>
                                        )}
                                        {visit.FinalValidity === "VALID" && (
                                            <Button size="small" color="error" onClick={() => setPending({ visit, validity: "INVALID" })}>
                                                Mark not counted
                                            </Button>
                                        )}
                                        {visit.ValidityOverride && (
                                            <Button size="small" onClick={() => setPending({ visit, validity: null })}>
                                                Clear override
                                            </Button>
                                        )}
                                    </Stack>
                                )}
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={RuleRounded} title={data ? "No visits in this range" : "Loading…"} />
                )}
            </Panel>

            {pending && (
                <ConfirmActionDialog
                    icon={GavelRounded}
                    color="warning"
                    title={pending.validity === "VALID" ? "Count this visit as valid?" : pending.validity === "INVALID" ? "Mark this visit as not counted?" : "Clear the head office override?"}
                    message={`${pending.visit.EmployeeName} → Dr. ${pending.visit.DoctorName} on ${formatDay(pending.visit.VisitDate)}. Your name, the time, the reason and the old and new result are saved in the audit log.`}
                    confirmLabel="Confirm"
                    remarks="required"
                    remarksLabel="Reason (required)"
                    remarksLimit={500}
                    busy={busy}
                    onClose={() => setPending(null)}
                    onConfirm={confirm}
                />
            )}
        </Stack>
    );
}

export default VisitsReview;
