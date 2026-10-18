import { useCallback, useEffect, useState } from "react";

import { Alert, Box, Button, Divider, Stack, Typography } from "@mui/material";
import { CheckCircleRounded, FlagRounded, VisibilityRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { FLAG_LABEL, actOnFlag, errorMessage, getFlags } from "../index";

const SEVERITY = { HIGH: "error", MEDIUM: "warning", LOW: "info" };

// Red flags go to head office (everyone) as well as managers (their team). Flags lead to review, not punishment.
function FlagsTab({ canAct }) {
    const { showSnackbar } = useSnackbar();
    const [status, setStatus] = useState("OPEN");
    const [data, setData] = useState(null);
    const [pending, setPending] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        getFlags(status)
            .then(setData)
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load flags"), "error"));
    }, [status, showSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    const confirm = async (note) => {
        setBusy(true);
        try {
            await actOnFlag(pending.flag.FlagId, pending.status, note);
            setPending(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Update failed"), "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack spacing={2}>
            {data?.sharedDoctors?.length > 0 && (
                <Alert severity="warning" variant="outlined">
                    {data.sharedDoctors.length} doctor(s) are assigned to more than one person (each doctor should belong to exactly one MR):{" "}
                    {data.sharedDoctors.slice(0, 5).map((row) => `${row.DoctorName} (${row.AssignedTo})`).join("; ")}
                    {data.sharedDoctors.length > 5 ? "…" : ""}
                </Alert>
            )}

            <Panel
                title="Red flags"
                subtitle="Day starts and visits outside the territory, drive-bys, fake GPS and other GPS checks."
                actions={
                    <SegmentedControl
                        value={status}
                        onChange={setStatus}
                        options={[
                            { value: "OPEN", label: "Open" },
                            { value: "ACKNOWLEDGED", label: "Acknowledged" },
                            { value: "RESOLVED", label: "Resolved" },
                        ]}
                    />
                }
            >
                {data?.flags?.length ? (
                    <Stack divider={<Divider />}>
                        {data.flags.map((flag) => (
                            <Stack key={flag.FlagId} direction={{ xs: "column", md: "row" }} sx={{ py: 1.25, gap: 1, alignItems: { md: "center" } }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                                        <Typography variant="subtitle2">{flag.EmployeeName}</Typography>
                                        <Tag label={FLAG_LABEL[flag.FlagType] || flag.FlagType} color={SEVERITY[flag.Severity] || "secondary"} />
                                        <Tag label={flag.Severity} color={SEVERITY[flag.Severity] || "secondary"} />
                                    </Stack>
                                    <Typography variant="body2">{flag.Details}</Typography>
                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {new Date(flag.CreatedOn).toLocaleString("en-IN")}
                                        {flag.ActedByName ? ` · ${flag.ActedByName}${flag.Note ? `: ${flag.Note}` : ""}` : ""}
                                    </Typography>
                                </Box>
                                {canAct && (
                                    <Stack direction="row" sx={{ gap: 1, flexShrink: 0 }}>
                                        {flag.Status === "OPEN" && (
                                            <Button size="small" startIcon={<VisibilityRounded />} onClick={() => setPending({ flag, status: "ACKNOWLEDGED" })}>
                                                Acknowledge
                                            </Button>
                                        )}
                                        {flag.Status !== "RESOLVED" && (
                                            <Button size="small" variant="contained" color="success" startIcon={<CheckCircleRounded />} onClick={() => setPending({ flag, status: "RESOLVED" })}>
                                                Resolve
                                            </Button>
                                        )}
                                    </Stack>
                                )}
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={FlagRounded} title={data ? "No flags here" : "Loading…"} />
                )}
            </Panel>

            {pending && (
                <ConfirmActionDialog
                    icon={pending.status === "RESOLVED" ? CheckCircleRounded : VisibilityRounded}
                    color={pending.status === "RESOLVED" ? "success" : "info"}
                    title={pending.status === "RESOLVED" ? "Resolve this flag?" : "Acknowledge this flag?"}
                    message={pending.flag.Details}
                    confirmLabel={pending.status === "RESOLVED" ? "Resolve" : "Acknowledge"}
                    remarks={pending.status === "RESOLVED" ? "required" : "optional"}
                    remarksLabel={pending.status === "RESOLVED" ? "What did you find?" : "Note (optional)"}
                    remarksLimit={500}
                    busy={busy}
                    onClose={() => setPending(null)}
                    onConfirm={confirm}
                />
            )}
        </Stack>
    );
}

export default FlagsTab;
