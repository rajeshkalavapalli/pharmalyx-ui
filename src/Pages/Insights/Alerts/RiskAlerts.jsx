import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    CheckCircleRounded,
    DoneAllRounded,
    DownloadRounded,
    GpsOffRounded,
    InventoryRounded,
    MedicalServicesRounded,
    NotificationsActiveRounded,
    PersonRounded,
    PriorityHighRounded,
    UndoRounded,
    VisibilityRounded,
} from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { InsightsLayout } from "../components/InsightsLayout";
import useInsight from "../components/useInsight";
import { GROUPS, SEVERITY, actOnAlert, downloadCsv, errorMessage, formatDate, getAlerts } from "../index";

const GROUP_ICON = { DOCTOR: MedicalServicesRounded, REP: PersonRounded, STOCK: InventoryRounded, GPS: GpsOffRounded };

const ACTIONS = {
    ACKNOWLEDGED: { label: "Acknowledge", title: "Acknowledge this alert?", color: "info", icon: VisibilityRounded, remarks: "optional", remarksLabel: "Note (optional)" },
    RESOLVED: { label: "Resolve", title: "Resolve this alert?", color: "success", icon: CheckCircleRounded, remarks: "required", remarksLabel: "How was it resolved?" },
    REOPEN: { label: "Reopen", title: "Reopen this alert?", color: "warning", icon: UndoRounded, remarks: "none" },
};

function AlertRow({ item, canAct, onAct }) {
    const severity = SEVERITY[item.severity];
    const Icon = GROUP_ICON[item.group];

    return (
        <Stack direction={{ xs: "column", md: "row" }} sx={{ py: 1.75, gap: 1.5, alignItems: { md: "center" } }}>
            <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0, alignItems: "flex-start" }}>
                <Box
                    sx={(theme) => ({
                        width: theme.avatar.size,
                        height: theme.avatar.size,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: theme.stat.iconRadius,
                        color: theme.palette[severity.color].main,
                        backgroundColor: alpha(theme.palette[severity.color].main, theme.tint.soft),
                    })}
                >
                    <Icon />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                        <Typography variant="subtitle2">{item.subject}</Typography>
                        <Tag label={severity.label} color={severity.color} />
                        <Tag label={item.title} color="secondary" />
                        {item.status === "ACKNOWLEDGED" && <Tag icon={VisibilityRounded} label="Acknowledged" color="info" />}
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {item.detail}
                    </Typography>
                    <Typography variant="caption" component="p" sx={(theme) => ({ mt: 0.25, color: theme.palette.text.secondary })}>
                        {[item.employee ? `Rep: ${item.employee}` : null, item.since ? `Since ${formatDate(item.since)}` : null].filter(Boolean).join(" · ")}
                    </Typography>
                    {item.status === "ACKNOWLEDGED" && (
                        <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.info.dark })}>
                            {item.actedBy} acknowledged{item.note ? `: ${item.note}` : ""}
                        </Typography>
                    )}
                </Box>
            </Stack>

            <Stack direction="row" sx={{ gap: 1, flexShrink: 0, ml: { md: 2 } }}>
                <Button size="small" component={RouterLink} to={item.link}>
                    Open
                </Button>
                {canAct && item.status === "OPEN" && (
                    <Button size="small" variant="outlined" onClick={() => onAct(item, "ACKNOWLEDGED")}>
                        Acknowledge
                    </Button>
                )}
                {canAct && item.status === "ACKNOWLEDGED" && (
                    <Button size="small" onClick={() => onAct(item, "REOPEN")}>
                        Reopen
                    </Button>
                )}
                {canAct && (
                    <Button size="small" variant="contained" color="success" startIcon={<DoneAllRounded />} onClick={() => onAct(item, "RESOLVED")}>
                        Resolve
                    </Button>
                )}
            </Stack>
        </Stack>
    );
}

// Rule-based alerts on doctors, reps and stock, with acknowledge / resolve.
function RiskAlerts() {
    const { showSnackbar } = useSnackbar();
    const state = useInsight(getAlerts);

    const [group, setGroup] = useState("ALL");
    const [status, setStatus] = useState("OPEN");
    const [pending, setPending] = useState(null);
    const [saving, setSaving] = useState(false);

    const alerts = useMemo(
        () => (state.data?.alerts || []).filter((item) => (group === "ALL" || item.group === group) && item.status === status),
        [state.data, group, status]
    );

    const handleAct = async (note) => {
        setSaving(true);

        try {
            const response = await actOnAlert(pending.item.key, pending.status, note);
            showSnackbar(response?.message || "Alert updated", "success");
            setPending(null);
            state.reload();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to update the alert"), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleExport = () =>
        downloadCsv(
            `alerts-${new Date().toISOString().slice(0, 10)}.csv`,
            [
                { label: "Severity", value: (row) => SEVERITY[row.severity].label },
                { label: "Area", value: (row) => row.groupLabel },
                { label: "Rule", value: (row) => row.title },
                { label: "Subject", value: (row) => row.subject },
                { label: "Detail", value: (row) => row.detail },
                { label: "Rep", value: (row) => row.employee },
                { label: "Since", value: (row) => row.since },
                { label: "Status", value: (row) => row.status },
                { label: "Note", value: (row) => row.note },
            ],
            state.data?.alerts || []
        );

    const counts = state.data?.summary;
    const byGroup = Object.fromEntries((counts?.byGroup || []).map((row) => [row.group, row.open]));

    return (
        <InsightsLayout
            title="Risk & alerts"
            subtitle="Doctors slipping, reps falling behind, and stock or orders needing attention. Rules and thresholds are set in Insight rules."
            state={state}
            actions={
                <Button variant="outlined" startIcon={<DownloadRounded />} onClick={handleExport} disabled={!state.data}>
                    Download CSV
                </Button>
            }
        >
            {(data) => (
                <>
                    <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                        <StatCard icon={NotificationsActiveRounded} label="Open alerts" value={counts.open} caption={`${byGroup.DOCTOR || 0} doctor · ${byGroup.REP || 0} rep · ${byGroup.STOCK || 0} stock · ${byGroup.GPS || 0} GPS`} color="primary" />
                        <StatCard icon={PriorityHighRounded} label="High priority" value={counts.high} caption="Open and marked high" color={counts.high ? "error" : "success"} />
                        <StatCard icon={VisibilityRounded} label="Acknowledged" value={counts.acknowledged} caption="Being worked on" color="info" />
                        <StatCard icon={CheckCircleRounded} label="Resolved" value={counts.resolved} caption="Hidden until the condition happens again" color="success" />
                    </Box>

                    <Panel
                        title="Alerts"
                        subtitle={data.canAct ? "Acknowledge to show you're on it; resolve with a note when done." : "Your manager can acknowledge and resolve these."}
                        actions={
                            <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                                <SegmentedControl value={group} onChange={setGroup} options={GROUPS.map((item) => ({ value: item.value, label: item.value === "ALL" ? "All" : `${item.label} · ${byGroup[item.value] || 0}` }))} />
                                <SegmentedControl
                                    value={status}
                                    onChange={setStatus}
                                    options={[
                                        { value: "OPEN", label: "Open" },
                                        { value: "ACKNOWLEDGED", label: "Acknowledged" },
                                    ]}
                                />
                            </Stack>
                        }
                    >
                        {alerts.length ? (
                            <Stack divider={<Divider />}>
                                {alerts.map((item) => (
                                    <AlertRow key={item.key} item={item} canAct={data.canAct} onAct={(alertItem, next) => setPending({ item: alertItem, status: next })} />
                                ))}
                            </Stack>
                        ) : (
                            <EmptyState icon={CheckCircleRounded} title="Nothing to worry about" message={status === "OPEN" ? "No open alerts here. Rules keep checking as data comes in." : "No acknowledged alerts."} />
                        )}
                    </Panel>

                    {pending && (
                        <ConfirmActionDialog
                            icon={ACTIONS[pending.status].icon}
                            color={ACTIONS[pending.status].color}
                            title={ACTIONS[pending.status].title}
                            message={`${pending.item.subject}: ${pending.item.detail}`}
                            confirmLabel={ACTIONS[pending.status].label}
                            remarks={ACTIONS[pending.status].remarks}
                            remarksLabel={ACTIONS[pending.status].remarksLabel}
                            remarksLimit={500}
                            busy={saving}
                            onClose={() => setPending(null)}
                            onConfirm={handleAct}
                        />
                    )}
                </>
            )}
        </InsightsLayout>
    );
}

export default RiskAlerts;
