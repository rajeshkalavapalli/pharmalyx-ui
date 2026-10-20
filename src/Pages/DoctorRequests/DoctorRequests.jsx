import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AddRounded,
    CheckCircleRounded,
    ContentCopyRounded,
    EditNoteRounded,
    HourglassTopRounded,
    PersonAddAlt1Rounded,
    PersonRemoveRounded,
    ReportProblemRounded,
    TravelExploreRounded,
    VerifiedRounded,
} from "@mui/icons-material";

import ConfirmActionDialog from "../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../components/EmptyState/EmptyState";
import LoadError from "../../components/LoadError/LoadError";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../components/StatCard/StatCard";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { DoctorSummary } from "./components/DuplicateMatches";
import RequestDetailDialog from "./components/RequestDetailDialog";
import VerificationTab from "./components/VerificationTab";
import {
    DUPLICATE_REASON,
    REQUEST_STATUS,
    REQUEST_TYPE,
    describeReason,
    errorMessage,
    formatDate,
    getMyPermissions,
    listDuplicateFlags,
    listRequests,
    resolveDuplicateFlag,
    scanDuplicates,
} from "./index";

const TYPE_ICON = { CREATE: PersonAddAlt1Rounded, EDIT: EditNoteRounded, DELETE: PersonRemoveRounded };

function RequestRow({ row, onOpen }) {
    const Icon = TYPE_ICON[row.RequestType];
    const type = REQUEST_TYPE[row.RequestType];
    const status = REQUEST_STATUS[row.Status];

    return (
        <Stack direction={{ xs: "column", md: "row" }} sx={{ py: 1.5, gap: 1.5, alignItems: { md: "center" } }}>
            <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0, alignItems: "flex-start" }}>
                <Box
                    sx={(theme) => ({
                        width: theme.avatar.size,
                        height: theme.avatar.size,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: theme.stat.iconRadius,
                        color: theme.palette[type.color].main,
                        backgroundColor: alpha(theme.palette[type.color].main, theme.tint.soft),
                    })}
                >
                    <Icon />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                        <Typography variant="subtitle2">Dr. {String(row.DoctorName).replace(/^dr\.?\s*/i, "")}</Typography>
                        <Tag label={type.label} color={type.color} />
                        <Tag label={status.label} color={status.color} />
                        {row.isResubmit && <Tag label="Sent again" color="info" />}
                        {row.duplicateCount > 0 && <Tag icon={ContentCopyRounded} label={`${row.duplicateCount} possible duplicate(s)`} color="error" />}
                        {row.warningCount > 0 && <Tag icon={ReportProblemRounded} label="GPS / location note" color="warning" />}
                    </Stack>
                    <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {[row.Speciality, row.AreaName, `by ${row.isMine ? "you" : row.RequestedByName}`, formatDate(row.CreatedOn), row.ApproverName ? `approver ${row.ApproverName}` : "approver: admin"].filter(Boolean).join(" · ")}
                    </Typography>
                    {row.Comment && (
                        <Typography variant="body2" sx={{ mt: 0.25 }} noWrap>
                            “{row.Comment}”
                        </Typography>
                    )}
                </Box>
            </Stack>
            <Button size="small" variant={row.canReview ? "contained" : "outlined"} onClick={onOpen} sx={{ flexShrink: 0 }}>
                {row.canReview ? "Review" : "Open"}
            </Button>
        </Stack>
    );
}

function DuplicateFlagRow({ flag, onResolve }) {
    return (
        <Box sx={{ py: 2 }}>
            <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center", mb: 1.5 }}>
                <Tag label={describeReason({ reason: flag.Reason, score: flag.Score, distanceM: flag.distanceM })} color={DUPLICATE_REASON[flag.Reason]?.color || "warning"} />
                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    Found {formatDate(flag.CreatedOn)}
                </Typography>
                {flag.Status !== "OPEN" && <Tag label={flag.Status === "CONFIRMED" ? "Confirmed duplicate" : "Not a duplicate"} color={flag.Status === "CONFIRMED" ? "error" : "success"} />}
            </Stack>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
                {flag.doctor && <DoctorSummary title="Doctor" doctor={flag.doctor} photoId={flag.doctor.SignboardId || null} />}
                {flag.match && <DoctorSummary title="Possible duplicate" doctor={flag.match} photoId={flag.match.SignboardId || null} highlight />}
            </Box>
            {flag.Status === "OPEN" ? (
                <Stack direction="row" sx={{ gap: 1, mt: 1.5, justifyContent: "flex-end" }}>
                    <Button size="small" variant="outlined" color="success" onClick={() => onResolve(flag, "DISMISSED")}>
                        Not a duplicate
                    </Button>
                    <Button size="small" variant="contained" color="error" onClick={() => onResolve(flag, "CONFIRMED")}>
                        Is a duplicate
                    </Button>
                </Stack>
            ) : (
                flag.ResolutionNote && (
                    <Typography variant="caption" component="p" sx={(theme) => ({ mt: 1, color: theme.palette.text.secondary })}>
                        {flag.ResolvedByName}: {flag.ResolutionNote}
                    </Typography>
                )
            )}
        </Box>
    );
}

// Doctor requests: add doctors from the field, edit / delete with a reason, manager review and duplicate checks.
function DoctorRequests() {
    const { showSnackbar } = useSnackbar();

    // ?tab=verification opens that tab (links from the Approvals inbox).
    const [searchParams] = useSearchParams();
    const [tab, setTab] = useState(() => (["requests", "verification", "duplicates"].includes(searchParams.get("tab")) ? searchParams.get("tab") : "requests"));
    const [status, setStatus] = useState("PENDING");
    const [permissions, setPermissions] = useState(new Set());
    const [requests, setRequests] = useState(null);
    const [flags, setFlags] = useState(null);
    const [flagStatus, setFlagStatus] = useState("OPEN");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const [openId, setOpenId] = useState(null);
    const [resolving, setResolving] = useState(null);
    const [verifySummary, setVerifySummary] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const perms = await getMyPermissions();
            setPermissions(perms);
            setRequests((await listRequests(status === "ALL" ? null : status)).requests);
            if (perms.has("fraudflags.view")) setFlags((await listDuplicateFlags(flagStatus)).flags);
        } catch (err) {
            setError(errorMessage(err, "Failed to load doctor requests"));
        } finally {
            setLoading(false);
        }
    }, [status, flagStatus]);

    useEffect(() => {
        load();
    }, [load]);

    const runScan = async () => {
        setBusy(true);
        try {
            const response = await scanDuplicates();
            showSnackbar(response?.message || "Scan complete", "success");
            setTab("duplicates");
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Scan failed"), "error");
        } finally {
            setBusy(false);
        }
    };

    const resolve = async (note) => {
        setBusy(true);
        try {
            const response = await resolveDuplicateFlag(resolving.flag.FlagId, resolving.status, note);
            showSnackbar(response?.message || "Saved", "success");
            setResolving(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to save"), "error");
        } finally {
            setBusy(false);
        }
    };

    const all = requests || [];
    const toReview = all.filter((row) => row.canReview).length;
    const mine = all.filter((row) => row.isMine && row.Status === "PENDING").length;
    const canSeeFlags = permissions.has("fraudflags.view");

    return (
        <Box>
            <PageHeader
                eyebrow="Field operations · Doctors"
                title="Doctor requests"
                subtitle="Add doctors from the clinic, and ask to edit or remove them with a reason. Your manager approves every change; possible duplicates are shown side by side."
                actions={
                    <>
                        {permissions.has("masters.edit") && (
                            <Button variant="outlined" startIcon={<TravelExploreRounded />} onClick={runScan} disabled={busy}>
                                Scan all doctors
                            </Button>
                        )}
                        <Button variant="contained" startIcon={<AddRounded />} onClick={() => navigate("/admin/Doctors/add", { state: { returnTo: "/field-operation/doctor-requests" } })}>
                            Add doctor
                        </Button>
                    </>
                }
            />

            <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                <StatCard icon={HourglassTopRounded} label="Waiting for you" value={toReview} caption="Requests from your team" color={toReview ? "warning" : "success"} />
                <StatCard icon={PersonAddAlt1Rounded} label="My pending requests" value={mine} caption="With your manager" color="primary" />
                <StatCard icon={ContentCopyRounded} label="Possible duplicates" value={canSeeFlags ? (flags || []).filter((flag) => flag.Status === "OPEN").length : "—"} caption={canSeeFlags ? "Open flags in your team" : "Managers see these"} color="error" />
                <StatCard
                    icon={VerifiedRounded}
                    label="Provisional doctors"
                    value={verifySummary ? verifySummary.provisional : "—"}
                    caption={verifySummary ? `${verifySummary.overdue} overdue · ${verifySummary.toReview} proof(s) to review` : "Open the Verification tab"}
                    color={verifySummary?.overdue ? "error" : "info"}
                />
            </Box>

            {error ? (
                <LoadError title="Couldn't load doctor requests" message={error} onRetry={load} />
            ) : (
                <Panel
                    title={{ requests: "Requests", verification: "Verification", duplicates: "Possible duplicates" }[tab]}
                    subtitle={
                        {
                            requests: "Every add / edit / delete request is kept with its reason and the decision.",
                            verification: "Doctors stay provisional until one proof is accepted: registration no., phone, pad / card photo, or the manager's joint visit.",
                            duplicates: "Found when doctors are added, and by the scan of all doctors.",
                        }[tab]
                    }
                    actions={
                        <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                            <SegmentedControl
                                value={tab}
                                onChange={setTab}
                                options={[
                                    { value: "requests", label: "Requests" },
                                    { value: "verification", label: "Verification" },
                                    ...(canSeeFlags ? [{ value: "duplicates", label: "Duplicates" }] : []),
                                ]}
                            />
                            {tab === "verification" ? null : tab === "requests" ? (
                                <SegmentedControl
                                    value={status}
                                    onChange={setStatus}
                                    options={[
                                        { value: "PENDING", label: "Pending" },
                                        { value: "ALL", label: "All" },
                                    ]}
                                />
                            ) : (
                                <SegmentedControl
                                    value={flagStatus}
                                    onChange={setFlagStatus}
                                    options={[
                                        { value: "OPEN", label: "Open" },
                                        { value: "CONFIRMED", label: "Confirmed" },
                                        { value: "DISMISSED", label: "Dismissed" },
                                    ]}
                                />
                            )}
                        </Stack>
                    }
                    sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}
                >
                    {tab === "verification" ? (
                        <VerificationTab initialView={searchParams.get("view")} permissions={permissions} onCounts={setVerifySummary} />
                    ) : tab === "requests" ? (
                        all.length ? (
                            <Stack divider={<Divider />}>
                                {all.map((row) => (
                                    <RequestRow key={row.RequestId} row={row} onOpen={() => setOpenId(row.RequestId)} />
                                ))}
                            </Stack>
                        ) : (
                            <EmptyState icon={PersonAddAlt1Rounded} title={loading ? "Loading…" : "No requests"} message={loading ? "" : "Add a doctor from the clinic, or open a doctor in My Doctors to request a change."} />
                        )
                    ) : (flags || []).length ? (
                        <Stack divider={<Divider />}>
                            {flags.map((flag) => (
                                <DuplicateFlagRow key={flag.FlagId} flag={flag} onResolve={(item, next) => setResolving({ flag: item, status: next })} />
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState icon={ContentCopyRounded} title={loading ? "Loading…" : "No possible duplicates"} message={loading ? "" : "Nothing flagged here."} />
                    )}
                </Panel>
            )}

            {openId && (
                <RequestDetailDialog
                    requestId={openId}
                    onClose={() => setOpenId(null)}
                    onChanged={() => {
                        setOpenId(null);
                        load();
                    }}
                />
            )}

            {resolving && (
                <ConfirmActionDialog
                    icon={resolving.status === "CONFIRMED" ? ContentCopyRounded : CheckCircleRounded}
                    color={resolving.status === "CONFIRMED" ? "error" : "success"}
                    title={resolving.status === "CONFIRMED" ? "Confirm these are the same doctor?" : "Mark as two different doctors?"}
                    message={`Dr. ${resolving.flag.doctor?.DoctorName} and Dr. ${resolving.flag.match?.DoctorName}. Your note is saved in the audit log.`}
                    confirmLabel={resolving.status === "CONFIRMED" ? "Is a duplicate" : "Not a duplicate"}
                    remarks="required"
                    remarksLabel="How did you check?"
                    remarksLimit={500}
                    busy={busy}
                    onClose={() => setResolving(null)}
                    onConfirm={resolve}
                />
            )}
        </Box>
    );
}

export default DoctorRequests;
