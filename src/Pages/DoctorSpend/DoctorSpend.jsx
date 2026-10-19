import { useCallback, useEffect, useState } from "react";

import { Box, Button, ButtonBase, Divider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { AddRounded, ReceiptLongRounded, WarningAmberRounded } from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import ReportsTab from "./ReportsTab";
import RequestDialog from "./RequestDialog";
import RequestDrawer from "./RequestDrawer";
import TypesTab from "./TypesTab";
import { OUTCOME, STATUS, dayLabel, errorMessage, getConfig, getRequests, rupees, scoreText } from "./index";

const FILTERS = [
    { value: "action", label: "Needs my action" },
    { value: "open", label: "Open" },
    { value: "paid", label: "Paid" },
    { value: "all", label: "All" },
];

// Doctor-related spend: MR requests an allowed activity and states the business expected; the manager
// recommends; head office approves with a compliance check and pays; the outcome is tracked.
function DoctorSpend() {
    const { showSnackbar } = useSnackbar();
    const [config, setConfig] = useState(null);
    const [tab, setTab] = useState("requests");
    const [filter, setFilter] = useState("action");
    const [rows, setRows] = useState(null);
    const [openId, setOpenId] = useState(null);
    const [creating, setCreating] = useState(false);

    const loadConfig = useCallback(() => {
        getConfig()
            .then(setConfig)
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load"), "error"));
    }, [showSnackbar]);

    const load = useCallback(() => {
        getRequests(filter)
            .then((r) => setRows(r.requests))
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load requests"), "error"));
    }, [filter, showSnackbar]);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    useEffect(() => {
        setRows(null);
        load();
    }, [load]);

    const tabs = [{ value: "requests", label: "Requests" }, { value: "reports", label: "Spend & outcomes" }, ...(config?.headOffice ? [{ value: "types", label: "Allowed activities" }] : [])];
    const open = rows?.find((r) => r.RequestId === openId) || null;

    return (
        <Box>
            <PageHeader
                eyebrow="Doctor engagement · Doctor spend"
                title="Doctor spend"
                subtitle="Only allowed activities, with the business the MR expects. Managers recommend; head office approves and pays; every claim is checked against actual net sales."
                actions={
                    config?.canRequest && (
                        <Button variant="contained" startIcon={<AddRounded />} onClick={() => setCreating(true)}>
                            New request
                        </Button>
                    )
                }
            />
            <Box sx={(theme) => ({ mb: theme.stat.gap, overflowX: "auto" })}>
                <SegmentedControl value={tab} onChange={setTab} options={tabs} />
            </Box>

            {tab === "requests" && (
                <Stack spacing={2}>
                    <Box sx={{ overflowX: "auto" }}>
                        <SegmentedControl value={filter} onChange={setFilter} options={FILTERS} />
                    </Box>
                    <Panel title="Requests" subtitle="Open one to see the track record, decisions and outcome">
                        {rows?.length ? (
                            <Stack divider={<Divider />}>
                                {rows.map((r) => {
                                    const status = STATUS[r.Status];
                                    return (
                                        <ButtonBase
                                            key={r.RequestId}
                                            onClick={() => setOpenId(r.RequestId)}
                                            sx={(theme) => ({ py: 1.25, px: 1, gap: 1.5, display: "flex", justifyContent: "flex-start", textAlign: "left", borderRadius: theme.calendar.cell.radius, "&:hover": { backgroundColor: alpha(theme.palette.primary.main, theme.tint.hover) } })}
                                        >
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
                                                    <Typography variant="subtitle2">
                                                        Dr. {r.DoctorName} · {r.TypeName}
                                                    </Typography>
                                                    <Tag label={status.label} color={status.color} />
                                                    {r.outcome && <Tag label={OUTCOME[r.outcome.status].label} color={OUTCOME[r.outcome.status].color} />}
                                                    {r.priorFailed.length > 0 && <Tag icon={WarningAmberRounded} label="Earlier claim failed" color="error" />}
                                                </Stack>
                                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                    {r.RequestNumber} · {r.UserName} · {dayLabel(r.CreatedOn)} · expects {rupees(r.ExpectedBusiness)} in {r.PeriodMonths} months · MR score: {scoreText(r.requesterScore)}
                                                </Typography>
                                            </Box>
                                            <Typography variant="subtitle1" sx={{ fontVariantNumeric: "tabular-nums" }}>
                                                {rupees(r.DisbursedAmount ?? r.Amount)}
                                            </Typography>
                                        </ButtonBase>
                                    );
                                })}
                            </Stack>
                        ) : (
                            <EmptyState icon={ReceiptLongRounded} title={rows ? "No requests here" : "Loading…"} />
                        )}
                    </Panel>
                </Stack>
            )}
            {tab === "reports" && <ReportsTab />}
            {tab === "types" && config?.headOffice && <TypesTab config={config} onChanged={loadConfig} />}

            <RequestDialog
                open={creating}
                config={config}
                onClose={() => setCreating(false)}
                onSaved={(message) => {
                    showSnackbar(message, "success");
                    setCreating(false);
                    load();
                }}
            />
            {open && (
                <RequestDrawer
                    key={`${open.RequestId}-${open.Status}`}
                    request={open}
                    methods={config?.methods || []}
                    onClose={() => setOpenId(null)}
                    onChanged={load}
                />
            )}
        </Box>
    );
}

export default DoctorSpend;
