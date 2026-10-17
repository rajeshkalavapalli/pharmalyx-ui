import { useCallback, useEffect, useState } from "react";

import { Box, Button, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ArrowBackRounded, FlagRounded, GroupsRounded, LocalShippingRounded, TaskAltRounded, TrendingUpRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import MonthSwitcher from "../../../components/MonthSwitcher/MonthSwitcher";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../../components/StatCard/StatCard";
import Achievement from "../Achievement";
import { errorMessage, formatDate, formatMoneyCompact, formatUnits, getSalesPlan, getSalesTeam, monthKey } from "../index";
import TargetDialog from "./TargetDialog";

function PlanView({ data, loading, onSetTargets }) {
    const summary = data?.summary;

    return (
        <Stack spacing={2} sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}>
            <Box
                sx={(theme) => ({
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                    gap: theme.stat.gap,
                })}
            >
                <StatCard icon={FlagRounded} label="Target" value={summary ? formatMoneyCompact(summary.targetValue) : "—"} caption={`${summary?.targetedProducts ?? 0} product(s)`} color="primary" />
                <StatCard
                    icon={TrendingUpRounded}
                    label="Secondary sales"
                    value={summary ? formatMoneyCompact(summary.secondaryValue) : "—"}
                    caption={summary?.secondaryPercent == null ? "No target set" : `${summary.secondaryPercent}% of target`}
                    color="success"
                    progress={Math.min(100, summary?.secondaryPercent ?? 0)}
                />
                <StatCard
                    icon={LocalShippingRounded}
                    label="POB supplied"
                    value={summary ? formatMoneyCompact(summary.pobValue) : "—"}
                    caption={summary?.pobPercent == null ? "No target set" : `${summary.pobPercent}% of target`}
                    color="info"
                    progress={Math.min(100, summary?.pobPercent ?? 0)}
                />
                <StatCard icon={TaskAltRounded} label="Products on track" value={summary ? `${summary.onTrack}/${summary.targetedProducts}` : "—"} caption="Secondary units at or above target" color="warning" />
            </Box>

            <Panel
                title="Target vs achievement"
                subtitle={
                    data?.setBy
                        ? `Set by ${data.setBy}${data.setOn ? ` on ${formatDate(data.setOn)}` : ""} · achievement in units`
                        : data?.editableReason || "Achievement in units: secondary from stockist statements, POB from supplied orders."
                }
                actions={
                    data?.canEdit && (
                        <Button variant="contained" startIcon={<FlagRounded />} onClick={onSetTargets}>
                            {data.summary.targetedProducts ? "Edit targets" : "Set targets"}
                        </Button>
                    )
                }
            >
                {data?.products?.length ? (
                    <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="right">Target</TableCell>
                                    <TableCell>Secondary sales</TableCell>
                                    <TableCell>POB supplied</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.products.map((product) => (
                                    <TableRow key={product.ProductId} hover>
                                        <TableCell>
                                            <Typography variant="subtitle2">{product.ProductName}</Typography>
                                            {product.PackSize && (
                                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                    {product.PackSize}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="subtitle2">{product.targetQty ? formatUnits(product.targetQty) : "—"}</Typography>
                                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                {product.targetValue ? formatMoneyCompact(product.targetValue) : "No target"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Achievement actual={product.secondaryQty} planned={product.targetQty} percent={product.secondaryPercent} format={formatUnits} />
                                        </TableCell>
                                        <TableCell>
                                            <Achievement actual={product.pobQty} planned={product.targetQty} percent={product.pobPercent} format={formatUnits} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                ) : (
                    <EmptyState
                        icon={FlagRounded}
                        title={loading ? "Loading…" : "No targets this month"}
                        message={loading ? "" : data?.canEdit ? "Set product targets for this team member." : "Your manager hasn't set targets for this month yet."}
                    />
                )}
            </Panel>
        </Stack>
    );
}

// Monthly product targets set by the manager, with achievement on secondary sales and POB supplied.
function SalesPlan() {
    const [month, setMonth] = useState(monthKey());
    const [tab, setTab] = useState("mine");
    const [memberId, setMemberId] = useState(null);

    const [plan, setPlan] = useState(null);
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);

    const showTeam = tab === "team" && !memberId;

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [teamResponse, planResponse] = await Promise.all([
                getSalesTeam(month).catch(() => null),
                showTeam ? Promise.resolve(null) : getSalesPlan(month, tab === "team" ? memberId : undefined),
            ]);

            setTeam(teamResponse);
            setPlan(planResponse);
        } catch (err) {
            setPlan(null);
            setError(errorMessage(err, "Failed to load the sales plan"));
        } finally {
            setLoading(false);
        }
    }, [month, tab, memberId, showTeam]);

    useEffect(() => {
        load();
    }, [load]);

    const hasTeam = Boolean(team?.team?.length);
    const member = memberId ? team?.team?.find((item) => item.UserId === memberId) : null;

    return (
        <Box>
            <PageHeader
                eyebrow="Planning · Sales plan"
                title={member ? `${member.Name}'s targets` : tab === "team" ? "Team targets" : "My targets"}
                subtitle="Monthly product targets set by the manager. Achievement is shown on secondary sales and on POB supplied."
                actions={
                    <>
                        {hasTeam && (
                            <SegmentedControl
                                value={tab}
                                onChange={(next) => {
                                    setTab(next);
                                    setMemberId(null);
                                }}
                                options={[
                                    { value: "mine", label: "My targets" },
                                    { value: "team", label: `Team · ${team.team.length}` },
                                ]}
                            />
                        )}
                        <MonthSwitcher month={month} onChange={setMonth} allowFuture />
                    </>
                }
            />

            {member && (
                <Button startIcon={<ArrowBackRounded />} onClick={() => setMemberId(null)} sx={{ mb: 2 }}>
                    All team members
                </Button>
            )}

            {error ? (
                <LoadError title="Couldn't load the sales plan" message={error} onRetry={load} />
            ) : showTeam ? (
                <Stack spacing={2} sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}>
                    <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                        <StatCard icon={GroupsRounded} label="Team members" value={team?.summary.members ?? "—"} caption={`${team?.summary.withTargets ?? 0} with targets`} color="primary" />
                        <StatCard icon={FlagRounded} label="Team target" value={team ? formatMoneyCompact(team.summary.targetValue) : "—"} caption="This month" color="info" />
                        <StatCard
                            icon={TrendingUpRounded}
                            label="Secondary sales"
                            value={team ? formatMoneyCompact(team.summary.secondaryValue) : "—"}
                            caption={team?.summary.secondaryPercent == null ? "No targets set" : `${team.summary.secondaryPercent}% of target`}
                            color="success"
                            progress={Math.min(100, team?.summary.secondaryPercent ?? 0)}
                        />
                        <StatCard icon={LocalShippingRounded} label="POB supplied" value={team ? formatMoneyCompact(team.summary.pobValue) : "—"} caption="This month" color="warning" />
                    </Box>

                    <Panel title="Team" subtitle="Open a team member to see product detail or set targets">
                        <Stack divider={<Divider />}>
                            {(team?.team || []).map((item) => (
                                <Stack key={item.UserId} direction={{ xs: "column", md: "row" }} sx={{ py: 1.5, gap: 2, alignItems: { md: "center" } }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="subtitle2">{item.Name}</Typography>
                                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {[item.DesignationName, item.targetValue ? `Target ${formatMoneyCompact(item.targetValue)}` : "No target yet"].filter(Boolean).join(" · ")}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            Secondary
                                        </Typography>
                                        <Achievement actual={item.secondaryValue} planned={item.targetValue} percent={item.secondaryPercent} format={formatMoneyCompact} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            POB supplied
                                        </Typography>
                                        <Achievement actual={item.pobValue} planned={item.targetValue} percent={item.pobPercent} format={formatMoneyCompact} />
                                    </Box>
                                    <Button variant="outlined" size="small" onClick={() => setMemberId(item.UserId)}>
                                        Open
                                    </Button>
                                </Stack>
                            ))}
                        </Stack>
                    </Panel>
                </Stack>
            ) : (
                <PlanView data={plan} loading={loading} onSetTargets={() => setEditing(true)} />
            )}

            {editing && plan && (
                <TargetDialog
                    userId={plan.user.UserId}
                    month={month}
                    onClose={() => setEditing(false)}
                    onSaved={() => {
                        setEditing(false);
                        load();
                    }}
                />
            )}
        </Box>
    );
}

export default SalesPlan;
