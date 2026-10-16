import { useCallback, useEffect, useState } from "react";

import {
    Box,
    Button,
    LinearProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import {
    CurrencyRupeeRounded,
    EditRounded,
    EmojiEventsRounded,
    QueryStatsRounded,
    TrendingUpRounded,
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
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import CategoryBadge from "../../MyDoctors/components/CategoryBadge";
import { errorMessage, formatMoney, formatMoneyCompact, getDoctorBusiness, monthKey, saveDoctorBusiness } from "../index";
import BusinessEntryDialog from "./BusinessEntryDialog";
import BusinessTrendChart from "./BusinessTrendChart";

const achievementColor = (pct) => (pct == null ? "info" : pct >= 100 ? "success" : pct >= 75 ? "warning" : "error");

function DoctorBusiness() {
    const { showSnackbar } = useSnackbar();
    const { actingUserId, setActingUserId, users } = useActingUser();
    const { team, viewUserId, setViewUserId, viewing } = useTeamView(actingUserId);

    const [month, setMonth] = useState(monthKey());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        if (!viewUserId) return;

        setLoading(true);
        setError("");

        try {
            setData(await getDoctorBusiness(viewUserId, month));
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load doctor business"));
        } finally {
            setLoading(false);
        }
    }, [viewUserId, month]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSave = async (payload) => {
        setSaving(true);

        try {
            const response = await saveDoctorBusiness(payload);
            showSnackbar(response?.message || "Saved", "success");
            setEditing(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to save"), "error");
        } finally {
            setSaving(false);
        }
    };

    const s = data?.summary;
    const growth = s && s.previousActual ? Math.round(((s.actual - s.previousActual) / s.previousActual) * 100) : null;
    const isFuture = month > monthKey();

    return (
        <Box>
            <PageHeader
                eyebrow="Doctor engagement · Doctor business"
                title={viewing && !viewing.IsSelf ? `${viewing.Name}'s doctor business` : "Doctor business"}
                subtitle="Expected and actual prescription value per doctor each month, so effort goes where the business is."
                actions={
                    <>
                        <ActingUserSelect users={users} value={actingUserId} onChange={setActingUserId} />
                        <TeamViewSelect team={team} value={viewUserId} onChange={setViewUserId} />
                    </>
                }
            />

            {!actingUserId ? (
                <Panel>
                    <EmptyState icon={CurrencyRupeeRounded} title="Choose a user to continue" message="Pick who you are acting as from the header." />
                </Panel>
            ) : error ? (
                <LoadError title="Couldn't load doctor business" message={error} onRetry={load} />
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
                        <StatCard icon={QueryStatsRounded} label="Expected" value={formatMoneyCompact(s?.expected ?? 0)} caption={`${s?.planned ?? 0} of ${s?.doctors ?? 0} doctors planned`} color="primary" />
                        <StatCard icon={CurrencyRupeeRounded} label="Actual" value={formatMoneyCompact(s?.actual ?? 0)} caption="Achieved so far" color="success" />
                        <StatCard
                            icon={EmojiEventsRounded}
                            label="Achievement"
                            value={s?.achievement == null ? "—" : `${s.achievement}%`}
                            caption="Actual vs expected"
                            color={achievementColor(s?.achievement)}
                            progress={Math.min(100, s?.achievement ?? 0)}
                        />
                        <StatCard
                            icon={TrendingUpRounded}
                            label="vs last month"
                            value={growth == null ? "—" : `${growth > 0 ? "+" : ""}${growth}%`}
                            caption={s?.previousActual ? `Last month ${formatMoneyCompact(s.previousActual)}` : "No business last month"}
                            color={growth == null ? "info" : growth >= 0 ? "success" : "error"}
                        />
                    </Box>

                    <Stack spacing={2}>
                        <Panel title="Last 6 months" actions={<MonthSwitcher month={month} onChange={setMonth} allowFuture />}>
                            {data?.trend?.some((row) => row.expected || row.actual) ? (
                                <BusinessTrendChart data={data.trend} />
                            ) : (
                                <EmptyState icon={QueryStatsRounded} title={loading ? "Loading…" : "No business recorded yet"} message={loading ? "" : "Set an expected value for your doctors below to start tracking."} />
                            )}
                        </Panel>

                        <Panel title="Doctors" subtitle="Class A first" disablePadding>
                            {data?.doctors?.length ? (
                                <Box sx={{ overflowX: "auto" }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Doctor</TableCell>
                                                <TableCell align="right">Expected</TableCell>
                                                <TableCell align="right">Actual</TableCell>
                                                <TableCell>Achievement</TableCell>
                                                <TableCell align="right">Last month</TableCell>
                                                {data.editable && <TableCell align="right" />}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.doctors.map((doctor) => {
                                                const pct = doctor.ExpectedValue ? Math.round(((doctor.ActualValue || 0) / doctor.ExpectedValue) * 100) : null;

                                                return (
                                                    <TableRow key={doctor.DoctorId} hover>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                                <Typography variant="subtitle2">{doctor.DoctorName}</Typography>
                                                                <CategoryBadge category={doctor.Category} />
                                                            </Stack>
                                                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                {[doctor.Speciality, doctor.HospitalName].filter(Boolean).join(" · ")}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">{formatMoney(doctor.ExpectedValue)}</TableCell>
                                                        <TableCell align="right">{formatMoney(doctor.ActualValue)}</TableCell>
                                                        <TableCell sx={(theme) => ({ minWidth: theme.spacing(18) })}>
                                                            {pct == null ? (
                                                                <Tag label="Not planned" color="secondary" />
                                                            ) : (
                                                                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={Math.min(100, pct)}
                                                                        sx={(theme) => ({ flex: 1, height: theme.stat.progressHeight })}
                                                                    />
                                                                    <Typography variant="caption" sx={(theme) => ({ minWidth: theme.engagement.percentColumn, textAlign: "right" })}>
                                                                        {pct}%
                                                                    </Typography>
                                                                </Stack>
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">{formatMoney(doctor.PreviousActual)}</TableCell>
                                                        {data.editable && (
                                                            <TableCell align="right">
                                                                <Button size="small" startIcon={<EditRounded />} onClick={() => setEditing(doctor)}>
                                                                    {doctor.EntryId ? "Edit" : "Plan"}
                                                                </Button>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <EmptyState icon={CurrencyRupeeRounded} title="No doctors assigned" message="Doctors mapped to this user appear here." />
                            )}
                        </Panel>
                    </Stack>
                </Box>
            )}

            {editing && (
                <BusinessEntryDialog
                    key={editing.DoctorId}
                    doctor={editing}
                    month={`${month}-01`}
                    isFuture={isFuture}
                    saving={saving}
                    onClose={() => setEditing(null)}
                    onSave={handleSave}
                />
            )}
        </Box>
    );
}

export default DoctorBusiness;
