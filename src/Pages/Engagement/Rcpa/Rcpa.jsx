import { useCallback, useEffect, useState } from "react";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import {
    AddRounded,
    FactCheckRounded,
    LocalPharmacyRounded,
    PieChartRounded,
    StorefrontRounded,
    TrendingDownRounded,
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
import { createRcpa, errorMessage, formatDate, getRcpa, monthKey } from "../index";
import RcpaDialog from "./RcpaDialog";
import ShareBars from "./ShareBars";

function Rcpa() {
    const { showSnackbar } = useSnackbar();
    const { actingUserId, setActingUserId, users } = useActingUser();
    const { team, viewUserId, setViewUserId, viewing, viewingSelf } = useTeamView(actingUserId);

    const [month, setMonth] = useState(monthKey());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        if (!viewUserId) return;

        setLoading(true);
        setError("");

        try {
            setData(await getRcpa(viewUserId, month));
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load RCPA"));
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
            const response = await createRcpa(payload);
            showSnackbar(response?.message || "RCPA saved", "success");
            setDialogOpen(false);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to save RCPA"), "error");
        } finally {
            setSaving(false);
        }
    };

    const summary = data?.summary;

    return (
        <Box>
            <PageHeader
                eyebrow="Doctor engagement · RCPA"
                title={viewing && !viewing.IsSelf ? `${viewing.Name}'s RCPA` : "Retail chemist audit"}
                subtitle="How much of each doctor's prescribing reaches our brands versus competitors, checked at the chemist."
                actions={
                    <>
                        <ActingUserSelect users={users} value={actingUserId} onChange={setActingUserId} />
                        <TeamViewSelect team={team} value={viewUserId} onChange={setViewUserId} />
                        {viewingSelf && actingUserId && (
                            <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialogOpen(true)}>
                                New RCPA
                            </Button>
                        )}
                    </>
                }
            />

            {!actingUserId ? (
                <Panel>
                    <EmptyState icon={FactCheckRounded} title="Choose a user to continue" message="Pick who you are acting as from the header." />
                </Panel>
            ) : (
                <>
                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                            gap: theme.stat.gap,
                            mb: theme.pageHeader.marginBottom,
                        })}
                    >
                        <StatCard icon={FactCheckRounded} label="Audits" value={summary?.audits ?? "—"} caption={`${summary?.doctors ?? 0} doctor(s) covered`} color="primary" />
                        <StatCard icon={StorefrontRounded} label="Chemists audited" value={summary?.chemists ?? "—"} caption="This month" color="info" />
                        <StatCard
                            icon={PieChartRounded}
                            label="Our share"
                            value={summary?.share == null ? "—" : `${summary.share}%`}
                            caption={`${summary?.ourQuantity ?? 0} of ${(summary?.ourQuantity ?? 0) + (summary?.competitorQuantity ?? 0)} units`}
                            color="success"
                            progress={summary?.share ?? 0}
                        />
                        <StatCard icon={TrendingDownRounded} label="Competitor units" value={summary?.competitorQuantity ?? "—"} caption="Business to win back" color="warning" />
                    </Box>

                    {error ? (
                        <LoadError title="Couldn't load RCPA" message={error} onRetry={load} />
                    ) : (
                        <Stack spacing={2} sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}>
                            <Box
                                sx={(theme) => ({
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "minmax(0, 1fr)",
                                        lg: `minmax(0, 1fr) ${theme.spacing(theme.dashboard.sideColumnWidth)}`,
                                    },
                                    gap: theme.stat.gap,
                                    alignItems: "start",
                                })}
                            >
                                <Panel title="Brand share by product" actions={<MonthSwitcher month={month} onChange={setMonth} />}>
                                    {data?.products?.length ? (
                                        <ShareBars products={data.products} />
                                    ) : (
                                        <EmptyState icon={PieChartRounded} title={loading ? "Loading…" : "No audits this month"} message={loading ? "" : "Record an RCPA at a chemist to see brand share."} />
                                    )}
                                </Panel>

                                <Panel title="Top competitor brands" subtitle="Units taking share from us">
                                    {data?.competitors?.length ? (
                                        <Stack divider={<Divider />}>
                                            {data.competitors.map((brand, index) => (
                                                <Stack key={brand.brand} direction="row" spacing={1.5} sx={{ py: 1.25, alignItems: "center" }}>
                                                    <Typography variant="subtitle2" sx={(theme) => ({ width: theme.spacing(2.5), color: theme.palette.text.disabled })}>
                                                        {index + 1}
                                                    </Typography>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="subtitle2" noWrap>
                                                            {brand.brand}
                                                        </Typography>
                                                        <Typography variant="caption" noWrap component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                            {[brand.company, `vs ${brand.againstProducts.join(", ")}`].filter(Boolean).join(" · ")}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="subtitle2">{brand.quantity}</Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            No competitor units recorded this month.
                                        </Typography>
                                    )}
                                </Panel>
                            </Box>

                            <Panel title="Audits" subtitle={`${data?.entries?.length ?? 0} this month`}>
                                {data?.entries?.length ? (
                                    <Stack divider={<Divider />}>
                                        {data.entries.map((entry) => (
                                            <Box key={entry.RcpaId} sx={{ py: 1.5 }}>
                                                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
                                                    <LocalPharmacyRounded fontSize="small" sx={(theme) => ({ color: theme.palette.primary.main })} />
                                                    <Typography variant="subtitle2">{entry.PharmacyName}</Typography>
                                                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                        · Dr. {entry.DoctorName}
                                                    </Typography>
                                                    <CategoryBadge category={entry.Category} />
                                                    <Typography variant="caption" sx={(theme) => ({ ml: "auto !important", color: theme.palette.text.secondary })}>
                                                        {formatDate(entry.AuditDate)}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" sx={{ mt: 1, gap: 0.75, flexWrap: "wrap" }}>
                                                    {entry.lines.map((line) => (
                                                        <Tag
                                                            key={line.LineId}
                                                            label={`${line.ProductName} ${line.OurQuantity}${line.CompetitorBrand ? ` vs ${line.CompetitorBrand} ${line.CompetitorQuantity}` : ""}`}
                                                            color={line.OurQuantity >= line.CompetitorQuantity ? "success" : "warning"}
                                                        />
                                                    ))}
                                                </Stack>
                                                {entry.Remarks && (
                                                    <Typography variant="body2" sx={(theme) => ({ mt: 1, color: theme.palette.text.secondary })}>
                                                        {entry.Remarks}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (
                                    <EmptyState icon={FactCheckRounded} title="No audits yet" />
                                )}
                            </Panel>
                        </Stack>
                    )}
                </>
            )}

            {dialogOpen && <RcpaDialog actingUserId={actingUserId} saving={saving} onClose={() => setDialogOpen(false)} onSave={handleSave} />}
        </Box>
    );
}

export default Rcpa;
