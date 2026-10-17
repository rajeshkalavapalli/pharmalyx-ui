import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AssignmentTurnedInRounded,
    CheckCircleRounded,
    CloseRounded,
    EventNoteRounded,
    FactCheckRounded,
    HourglassTopRounded,
    MapRounded,
    OpenInNewRounded,
    PaymentsRounded,
    ReceiptLongRounded,
    RouteRounded,
    TaskAltRounded,
    TrendingUpRounded,
} from "@mui/icons-material";

import api from "../../configurations/api-config";
import ConfirmActionDialog from "../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../components/EmptyState/EmptyState";
import LoadError from "../../components/LoadError/LoadError";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../components/StatCard/StatCard";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { errorMessage } from "../Engagement/index";

const getInbox = async () => (await api.get("/app/approvals")).data;
const decide = async (item, decision, remarks) => (await api.post(`/app/approvals/${item.type}/${item.id}/${decision}`, { Remarks: remarks || null })).data;

const TYPE_ICON = {
    TOUR_PLAN: MapRounded,
    DEVIATION: RouteRounded,
    DCR: AssignmentTurnedInRounded,
    STATEMENT: TrendingUpRounded,
    DOCTOR_PLAN: EventNoteRounded,
    CLAIM: ReceiptLongRounded,
    PAYMENT: PaymentsRounded,
};

const ageText = (days) => (days == null ? "" : days === 0 ? "Submitted today" : `Waiting ${days} day${days === 1 ? "" : "s"}`);

function ApprovalRow({ item, onDecide }) {
    const Icon = TYPE_ICON[item.type] || FactCheckRounded;

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
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft),
                    })}
                >
                    <Icon />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                        <Typography variant="subtitle2">{item.userName}</Typography>
                        <Tag label={item.typeLabel} color="secondary" />
                        {item.overdue && <Tag icon={HourglassTopRounded} label="Overdue" color="error" />}
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 0.25 }}>
                        {item.period} · {item.summary}
                    </Typography>
                    <Typography variant="caption" sx={(theme) => ({ color: item.overdue ? theme.palette.error.main : theme.palette.text.secondary })}>
                        {ageText(item.ageDays)}
                    </Typography>
                </Box>
            </Stack>

            <Stack direction="row" sx={{ gap: 1, flexShrink: 0 }}>
                {item.inline ? (
                    <>
                        <Button size="small" component={RouterLink} to={item.link}>
                            Details
                        </Button>
                        <Button size="small" variant="outlined" color="error" startIcon={<CloseRounded />} onClick={() => onDecide(item, "return")}>
                            {item.returnLabel}
                        </Button>
                        <Button size="small" variant="contained" color="success" startIcon={<CheckCircleRounded />} onClick={() => onDecide(item, "approve")}>
                            Approve
                        </Button>
                    </>
                ) : (
                    <Button size="small" variant="contained" endIcon={<OpenInNewRounded />} component={RouterLink} to={item.link}>
                        Review
                    </Button>
                )}
            </Stack>
        </Stack>
    );
}

// One inbox for everything waiting on you: tour plans, deviations, DCRs, statements, plans, claims and payments.
function Approvals() {
    const { showSnackbar } = useSnackbar();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [type, setType] = useState("ALL");
    const [pending, setPending] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            setData(await getInbox());
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load approvals"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const items = useMemo(() => (data?.items || []).filter((item) => type === "ALL" || item.type === type), [data, type]);

    const handleDecide = async (remarks) => {
        setSaving(true);

        try {
            const response = await decide(pending.item, pending.decision, remarks);
            showSnackbar(response?.message || "Done", "success");
            setPending(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to update"), "error");
        } finally {
            setSaving(false);
        }
    };

    const types = (data?.types || []).filter((row) => row.count > 0);
    const inlineCount = (data?.items || []).filter((item) => item.inline).length;

    return (
        <Box>
            <PageHeader
                eyebrow="Administration"
                title="Approvals"
                subtitle="Everything waiting for your decision, oldest first. Quick items can be approved here; larger ones open their review screen."
            />

            {error ? (
                <LoadError title="Couldn't load approvals" message={error} onRetry={load} />
            ) : (
                <Box sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1, transition: theme.calendar.transition })}>
                    <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                        <StatCard icon={FactCheckRounded} label="Waiting for you" value={data?.total ?? "—"} caption={`${types.length} type(s)`} color="primary" />
                        <StatCard icon={HourglassTopRounded} label="Overdue" value={data?.overdue ?? "—"} caption={data ? `Waiting more than ${data.overdueDays} days` : "—"} color={data?.overdue ? "error" : "success"} />
                        <StatCard icon={TaskAltRounded} label="Quick approvals" value={data ? inlineCount : "—"} caption="Tour plans, deviations and DCRs" color="info" />
                        <StatCard icon={OpenInNewRounded} label="Need a full review" value={data ? (data.total - inlineCount) : "—"} caption="Statements, plans and claims" color="warning" />
                    </Box>

                    <Panel
                        title="Inbox"
                        subtitle={`${items.length} item(s)`}
                        actions={
                            types.length > 1 && (
                                <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                                    <SegmentedControl
                                        value={type}
                                        onChange={setType}
                                        options={[{ value: "ALL", label: `All · ${data.total}` }, ...types.map((row) => ({ value: row.type, label: `${row.label} · ${row.count}` }))]}
                                    />
                                </Box>
                            )
                        }
                    >
                        {items.length ? (
                            <Stack divider={<Divider />}>
                                {items.map((item) => (
                                    <ApprovalRow key={item.key} item={item} onDecide={(target, decision) => setPending({ item: target, decision })} />
                                ))}
                            </Stack>
                        ) : (
                            <EmptyState icon={TaskAltRounded} title={loading ? "Loading…" : "All caught up"} message={loading ? "" : "Nothing is waiting for your approval."} />
                        )}
                    </Panel>
                </Box>
            )}

            {pending && (
                <ConfirmActionDialog
                    icon={pending.decision === "approve" ? CheckCircleRounded : CloseRounded}
                    color={pending.decision === "approve" ? "success" : "error"}
                    title={`${pending.decision === "approve" ? "Approve" : pending.item.returnLabel} this ${pending.item.typeLabel.toLowerCase()}?`}
                    message={`${pending.item.userName} · ${pending.item.period} · ${pending.item.summary}`}
                    confirmLabel={pending.decision === "approve" ? "Approve" : pending.item.returnLabel}
                    remarks={pending.decision === "approve" ? "optional" : "required"}
                    remarksLabel={pending.decision === "approve" ? "Comment (optional)" : "Reason"}
                    remarksLimit={1000}
                    busy={saving}
                    onClose={() => setPending(null)}
                    onConfirm={handleDecide}
                />
            )}
        </Box>
    );
}

export default Approvals;
