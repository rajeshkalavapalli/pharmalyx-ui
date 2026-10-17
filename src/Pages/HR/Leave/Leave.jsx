import { useCallback, useEffect, useState } from "react";

import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    LinearProgress,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { AddRounded, CheckCircleRounded, CloseRounded, EditRounded, EventBusyRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import LoadError from "../../../components/LoadError/LoadError";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import ReportTable from "../../Reports/components/ReportTable";
import { EmployeePicker } from "../../Insights/components/InsightsLayout";
import {
    LEAVE_STATUS,
    applyLeave,
    cancelLeave,
    errorMessage,
    formatDate,
    getLeave,
    getLeaveTypes,
    getMyPermissions,
    reviewLeave,
    saveLeaveType,
    shiftKey,
    todayKey,
} from "../index";

// ---------------------------------------------------------------
// Apply
// ---------------------------------------------------------------

function ApplyDialog({ balances, onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();
    const [typeId, setTypeId] = useState(balances[0]?.LeaveTypeId || "");
    const [from, setFrom] = useState(todayKey());
    const [to, setTo] = useState(todayKey());
    const [halfDay, setHalfDay] = useState(false);
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);

    const type = balances.find((item) => item.LeaveTypeId === typeId);
    const canHalf = type?.AllowHalfDay && from === to;

    const submit = async () => {
        setSaving(true);

        try {
            const response = await applyLeave({ LeaveTypeId: typeId, FromDate: from, ToDate: to, HalfDay: canHalf && halfDay, Reason: reason.trim() });
            showSnackbar(response?.message || "Leave applied", "success");
            onSaved();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to apply"), "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2 })}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        Leave
                    </Typography>
                    <Typography variant="h5" component="h2">
                        Apply for leave
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <TextField select label="Leave type" value={typeId} onChange={(event) => setTypeId(event.target.value)} helperText={type ? (type.IsPaid ? `${type.available} day(s) available this year` : "Unpaid, no balance needed") : " "}>
                        {balances.map((item) => (
                            <MenuItem key={item.LeaveTypeId} value={item.LeaveTypeId}>
                                {item.Name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 2 }}>
                        <TextField
                            type="date"
                            label="From"
                            value={from}
                            onChange={(event) => {
                                setFrom(event.target.value);
                                if (event.target.value > to) setTo(event.target.value);
                            }}
                            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: shiftKey(todayKey(), -30) } }}
                        />
                        <TextField type="date" label="To" value={to} onChange={(event) => setTo(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: from } }} />
                    </Box>
                    {canHalf && <FormControlLabel control={<Checkbox checked={halfDay} onChange={(event) => setHalfDay(event.target.checked)} />} label="Half day" />}
                    <TextField multiline minRows={2} label="Reason" required value={reason} onChange={(event) => setReason(event.target.value.slice(0, 500))} helperText={`${reason.length}/500 · Sundays are not counted`} />
                </Stack>
            </DialogContent>
            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={saving || !typeId || !from || !to || to < from || !reason.trim()}>
                    Send to manager
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ---------------------------------------------------------------
// Admin: leave types
// ---------------------------------------------------------------

function TypeDialog({ type, onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();
    const [form, setForm] = useState({
        Code: type?.Code || "",
        Name: type?.Name || "",
        AnnualQuota: type ? String(type.AnnualQuota) : "12",
        AllowHalfDay: type ? type.AllowHalfDay : true,
        IsPaid: type ? type.IsPaid : true,
        IsActive: type ? type.IsActive : true,
    });
    const [saving, setSaving] = useState(false);
    const set = (patch) => setForm((current) => ({ ...current, ...patch }));

    const submit = async () => {
        setSaving(true);

        try {
            const response = await saveLeaveType(type?.LeaveTypeId, { ...form, AnnualQuota: Number(form.AnnualQuota || 0) });
            showSnackbar(response?.message || "Saved", "success");
            onSaved();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to save"), "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
            <DialogTitle>{type ? `Edit ${type.Name}` : "New leave type"}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 2 }}>
                        <TextField label="Code" value={form.Code} onChange={(event) => set({ Code: event.target.value.toUpperCase().slice(0, 10) })} />
                        <TextField label="Name" value={form.Name} onChange={(event) => set({ Name: event.target.value.slice(0, 60) })} />
                    </Box>
                    <TextField type="number" label="Days per year" value={form.AnnualQuota} disabled={!form.IsPaid} onChange={(event) => set({ AnnualQuota: event.target.value })} slotProps={{ htmlInput: { min: 0, step: 0.5 } }} />
                    <FormControlLabel control={<Checkbox checked={form.IsPaid} onChange={(event) => set({ IsPaid: event.target.checked })} />} label="Paid (counts against a yearly balance)" />
                    <FormControlLabel control={<Checkbox checked={form.AllowHalfDay} onChange={(event) => set({ AllowHalfDay: event.target.checked })} />} label="Half day allowed" />
                    <FormControlLabel control={<Checkbox checked={form.IsActive} onChange={(event) => set({ IsActive: event.target.checked })} />} label="Active" />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={saving || !form.Code || !form.Name.trim()}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ---------------------------------------------------------------
// Page
// ---------------------------------------------------------------

function Leave() {
    const { showSnackbar } = useSnackbar();

    const [tab, setTab] = useState("requests");
    const [year, setYear] = useState(new Date().getFullYear());
    const [userId, setUserId] = useState("");
    const [data, setData] = useState(null);
    const [types, setTypes] = useState([]);
    const [permissions, setPermissions] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [applying, setApplying] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [pending, setPending] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [leave, typeList, perms] = await Promise.all([getLeave(year, userId), getLeaveTypes(), getMyPermissions()]);
            setData(leave);
            setTypes(typeList.types || []);
            setPermissions(perms);
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load leave"));
        } finally {
            setLoading(false);
        }
    }, [year, userId]);

    useEffect(() => {
        load();
    }, [load]);

    const act = async (remarks) => {
        setBusy(true);

        try {
            const response = pending.action === "cancel" ? await cancelLeave(pending.row.LeaveId) : await reviewLeave(pending.row.LeaveId, pending.action === "approve", remarks);
            showSnackbar(response?.message || "Done", "success");
            setPending(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to update leave"), "error");
        } finally {
            setBusy(false);
        }
    };

    const isAdmin = permissions.has("hrsettings.edit");
    const requests = data?.requests || [];
    const anyTeam = requests.some((row) => !row.isOwn);

    const columns = [
        ...(anyTeam ? [{ key: "user", label: "Employee", csv: (row) => row.UserName, render: (row) => <Typography variant="subtitle2">{row.UserName}</Typography> }] : []),
        { key: "type", label: "Type", csv: (row) => row.LeaveName, render: (row) => row.LeaveName },
        { key: "dates", label: "Dates", csv: (row) => `${row.FromDate} - ${row.ToDate}`, render: (row) => (row.FromDate === row.ToDate ? formatDate(row.FromDate) : `${formatDate(row.FromDate)} – ${formatDate(row.ToDate)}`) },
        { key: "days", label: "Days", align: "right", csv: (row) => row.Days, render: (row) => (row.HalfDay ? "½" : row.Days) },
        { key: "reason", label: "Reason", csv: (row) => row.Reason, render: (row) => <Typography variant="body2" sx={(theme) => ({ maxWidth: theme.table.textMaxWidth, whiteSpace: "normal" })}>{row.Reason}</Typography> },
        {
            key: "status",
            label: "Status",
            csv: (row) => row.Status,
            render: (row) => (
                <Box>
                    <Tag label={LEAVE_STATUS[row.Status].label} color={LEAVE_STATUS[row.Status].color} />
                    {row.ReviewRemarks && row.Status !== "CANCELLED" && (
                        <Typography variant="caption" component="p" sx={(theme) => ({ mt: 0.25, color: theme.palette.text.secondary, whiteSpace: "normal" })}>
                            {row.ReviewedByName}: {row.ReviewRemarks}
                        </Typography>
                    )}
                </Box>
            ),
        },
        {
            key: "actions",
            label: "",
            csv: () => "",
            render: (row) => (
                <Stack direction="row" sx={{ gap: 0.5, justifyContent: "flex-end" }}>
                    {row.canReview && (
                        <>
                            <Button size="small" color="error" onClick={() => setPending({ row, action: "reject" })}>
                                Reject
                            </Button>
                            <Button size="small" variant="contained" color="success" onClick={() => setPending({ row, action: "approve" })}>
                                Approve
                            </Button>
                        </>
                    )}
                    {row.canCancel && (
                        <Button size="small" onClick={() => setPending({ row, action: "cancel" })}>
                            Cancel
                        </Button>
                    )}
                </Stack>
            ),
        },
    ];

    return (
        <Box>
            <PageHeader
                eyebrow="HR / Employee"
                title="Leave"
                subtitle="Apply for leave, see your balance, and approve your team's requests."
                actions={
                    <>
                        <EmployeePicker value={userId} onChange={setUserId} />
                        <TextField select size="small" label="Year" value={year} onChange={(event) => setYear(event.target.value)}>
                            {[0, -1, -2].map((offset) => {
                                const value = new Date().getFullYear() + offset;
                                return (
                                    <MenuItem key={value} value={value}>
                                        {value}
                                    </MenuItem>
                                );
                            })}
                        </TextField>
                        {!userId && (
                            <Button variant="contained" startIcon={<AddRounded />} onClick={() => setApplying(true)} disabled={!data?.balances?.length}>
                                Apply leave
                            </Button>
                        )}
                    </>
                }
            />

            {error ? (
                <LoadError title="Couldn't load leave" message={error} onRetry={load} />
            ) : (
                <Box sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1, transition: theme.calendar.transition })}>
                    <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                        {(data?.balances || []).map((balance) => (
                            <Panel key={balance.LeaveTypeId} sx={{ height: "100%" }}>
                                <Typography variant="subtitle2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    {balance.Name}
                                </Typography>
                                <Typography variant="metric" component="p">
                                    {balance.IsPaid ? balance.available : "—"}
                                    {balance.IsPaid && (
                                        <Typography component="span" variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {" "}/ {balance.AnnualQuota} left
                                        </Typography>
                                    )}
                                </Typography>
                                {balance.IsPaid ? (
                                    <LinearProgress variant="determinate" value={balance.AnnualQuota ? Math.min(100, ((balance.approved + balance.pending) / balance.AnnualQuota) * 100) : 0} sx={{ my: 1 }} />
                                ) : null}
                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    {balance.approved} taken · {balance.pending} pending{balance.IsPaid ? "" : " · unpaid"}
                                </Typography>
                            </Panel>
                        ))}
                    </Box>

                    <Panel
                        title={tab === "requests" ? "Requests" : "Leave types"}
                        subtitle={tab === "requests" ? `${requests.length} in ${data?.year ?? year}${anyTeam ? " · yours and your team's" : ""}` : "Yearly quota per type. Balances reset every calendar year."}
                        actions={
                            <Stack direction="row" sx={{ gap: 1 }}>
                                {isAdmin && (
                                    <SegmentedControl
                                        value={tab}
                                        onChange={setTab}
                                        options={[
                                            { value: "requests", label: "Requests" },
                                            { value: "types", label: "Leave types" },
                                        ]}
                                    />
                                )}
                                {tab === "types" && (
                                    <Button size="small" variant="contained" startIcon={<AddRounded />} onClick={() => setEditingType({})}>
                                        New type
                                    </Button>
                                )}
                            </Stack>
                        }
                        disablePadding
                    >
                        {tab === "requests" ? (
                            <ReportTable columns={columns} rows={requests} rowKey={(row) => row.LeaveId} empty="No leave requests this year." />
                        ) : (
                            <ReportTable
                                columns={[
                                    { key: "code", label: "Code", csv: (row) => row.Code, render: (row) => <Typography variant="subtitle2">{row.Code}</Typography> },
                                    { key: "name", label: "Name", csv: (row) => row.Name },
                                    { key: "quota", label: "Days / year", align: "right", csv: (row) => row.AnnualQuota, render: (row) => (row.IsPaid ? Number(row.AnnualQuota) : "Unpaid") },
                                    { key: "half", label: "Half day", csv: (row) => row.AllowHalfDay, render: (row) => (row.AllowHalfDay ? "Yes" : "No") },
                                    { key: "active", label: "Status", csv: (row) => row.IsActive, render: (row) => <Tag label={row.IsActive ? "Active" : "Inactive"} color={row.IsActive ? "success" : "secondary"} /> },
                                    { key: "edit", label: "", csv: () => "", render: (row) => <Button size="small" startIcon={<EditRounded />} onClick={() => setEditingType(row)}>Edit</Button> },
                                ]}
                                rows={types}
                                rowKey={(row) => row.LeaveTypeId}
                            />
                        )}
                    </Panel>
                </Box>
            )}

            {applying && data && (
                <ApplyDialog
                    balances={data.balances}
                    onClose={() => setApplying(false)}
                    onSaved={() => {
                        setApplying(false);
                        load();
                    }}
                />
            )}

            {editingType && (
                <TypeDialog
                    type={editingType.LeaveTypeId ? editingType : null}
                    onClose={() => setEditingType(null)}
                    onSaved={() => {
                        setEditingType(null);
                        load();
                    }}
                />
            )}

            {pending && (
                <ConfirmActionDialog
                    icon={pending.action === "approve" ? CheckCircleRounded : pending.action === "reject" ? CloseRounded : EventBusyRounded}
                    color={pending.action === "approve" ? "success" : pending.action === "reject" ? "error" : "warning"}
                    title={pending.action === "approve" ? "Approve this leave?" : pending.action === "reject" ? "Reject this leave?" : "Cancel this leave?"}
                    message={`${pending.row.UserName} · ${pending.row.LeaveName} · ${pending.row.Days} day(s) · ${pending.row.FromDate}${pending.row.ToDate !== pending.row.FromDate ? ` to ${pending.row.ToDate}` : ""}`}
                    confirmLabel={pending.action === "approve" ? "Approve" : pending.action === "reject" ? "Reject" : "Cancel leave"}
                    remarks={pending.action === "reject" ? "required" : pending.action === "approve" ? "optional" : "none"}
                    remarksLabel={pending.action === "reject" ? "Reason" : "Comment (optional)"}
                    remarksLimit={500}
                    busy={busy}
                    onClose={() => setPending(null)}
                    onConfirm={act}
                />
            )}
        </Box>
    );
}

export default Leave;
