import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Alert, Box, Button, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AutoFixHighRounded,
    CheckCircleRounded,
    ContentCopyRounded,
    DirectionsCarRounded,
    EditRounded,
    HomeRounded,
    LuggageRounded,
    NightsStayRounded,
    SaveRounded,
    SendRounded,
    UndoRounded,
    VisibilityRounded,
    WeekendRounded,
} from "@mui/icons-material";

import ConfirmActionDialog from "../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../components/EmptyState/EmptyState";
import LoadError from "../../components/LoadError/LoadError";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import StatusChip from "../../components/StatusChip/StatusChip";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { getMyPermissions } from "../DoctorRequests/index";
import { PATCH_TYPES, WEEKDAYS, decideStp, errorMessage, generateMonth, getStp, getSubmittedStps, patchLabel, saveStp, submitStp, withdrawStp } from "./index";

const STATUS = {
    DRAFT: { label: "Draft", color: "secondary" },
    SUBMITTED: { label: "With head office", color: "warning" },
    RETURNED: { label: "Returned", color: "error" },
    APPROVED: { label: "Approved", color: "success" },
};

const REPEAT = [
    { value: 1, label: "Every week" },
    { value: 2, label: "2 weeks" },
    { value: 4, label: "4 weeks" },
];

const TYPE_ICON = { HQ: HomeRounded, EX_HQ: DirectionsCarRounded, OUTSTATION: LuggageRounded };
const FULL_DAY = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const lower = (value) => String(value || "").toLowerCase();
const typeColor = (type) => PATCH_TYPES.find((item) => item.value === type)?.color || "secondary";

// Form: cycle length, area per "week:weekday", and the type of each area used.
const toForm = (stp) => ({
    cycleWeeks: stp?.CycleWeeks || 1,
    types: Object.fromEntries((stp?.patches || []).map((patch) => [lower(patch.AreaId), patch.PatchType])),
    days: Object.fromEntries((stp?.days || []).filter((day) => day.AreaId).map((day) => [`${day.CycleWeek}:${day.Weekday}`, lower(day.AreaId)])),
});

const monthKey = (offset) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const monthName = (key) => new Date(`${key}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

// An outstation area on the next day too = the MR stays the night.
const nightStay = (days, types, week, weekday) => {
    const area = days[`${week}:${weekday}`];
    return Boolean(area && types[area] === "OUTSTATION" && days[`${week}:${weekday + 1}`] === area);
};

// Read-only: the week as a strip of day cards, coloured by HQ / Ex-HQ / Outstation.
function StpSummary({ stp }) {
    const form = toForm(stp);
    const names = new Map(stp.patches.map((patch) => [lower(patch.AreaId), patch.AreaName]));
    const weeks = Array.from({ length: form.cycleWeeks }, (_, i) => i + 1);

    return (
        <Stack spacing={3}>
            {weeks.map((week) => {
                const areas = WEEKDAYS.map((_, index) => form.days[`${week}:${index + 1}`] || null);
                const count = (type) => areas.filter((area) => area && form.types[area] === type).length;
                const nights = WEEKDAYS.filter((_, index) => nightStay(form.days, form.types, week, index + 1)).length;
                const off = areas.filter((area) => !area).length;

                return (
                    <Box key={week}>
                        <Stack direction="row" sx={{ mb: 1.5, gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                            {form.cycleWeeks > 1 && (
                                <Typography variant="subtitle2" sx={{ mr: 1 }}>
                                    Week {week}
                                </Typography>
                            )}
                            {PATCH_TYPES.map((type) =>
                                count(type.value) ? <Tag key={type.value} label={`${count(type.value)} ${type.label}`} color={type.color} /> : null
                            )}
                            {nights > 0 && <Tag icon={NightsStayRounded} label={`${nights} night stay${nights > 1 ? "s" : ""}`} color="warning" />}
                            {off > 0 && <Tag label={`${off} day${off > 1 ? "s" : ""} off`} color="secondary" />}
                        </Stack>

                        <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))", lg: "repeat(7, minmax(0, 1fr))" }, gap: theme.stat.gap })}>
                            {areas.map((area, index) => {
                                const type = area ? form.types[area] : null;
                                const color = type ? typeColor(type) : null;
                                const Icon = type ? TYPE_ICON[type] : WeekendRounded;
                                const night = nightStay(form.days, form.types, week, index + 1);

                                return (
                                    <Box
                                        key={WEEKDAYS[index]}
                                        title={FULL_DAY[index]}
                                        sx={(theme) => ({
                                            p: 1.75,
                                            minHeight: theme.spacing(16),
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1,
                                            borderRadius: theme.card.radius,
                                            border: area ? `1px solid ${alpha(theme.palette[color].main, theme.tint.border)}` : `1px dashed ${theme.palette.divider}`,
                                            backgroundColor: area ? alpha(theme.palette[color].main, theme.tint.soft / 2) : "transparent",
                                        })}
                                    >
                                        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                                            <Typography variant="overline" sx={(theme) => ({ lineHeight: 1.2, color: theme.palette.text.secondary })}>
                                                {WEEKDAYS[index]}
                                            </Typography>
                                            <Box
                                                sx={(theme) => ({
                                                    width: theme.spacing(4),
                                                    height: theme.spacing(4),
                                                    display: "grid",
                                                    placeItems: "center",
                                                    borderRadius: theme.stat.iconRadius,
                                                    color: area ? theme.palette[color].main : theme.palette.text.disabled,
                                                    backgroundColor: area ? alpha(theme.palette[color].main, theme.tint.soft) : theme.palette.action.hover,
                                                })}
                                            >
                                                <Icon fontSize="small" />
                                            </Box>
                                        </Stack>
                                        <Typography variant="subtitle1" sx={(theme) => ({ fontWeight: "fontWeightSemibold", textTransform: "capitalize", color: area ? theme.palette.text.primary : theme.palette.text.disabled })}>
                                            {area ? names.get(area) : "Day off"}
                                        </Typography>
                                        <Box sx={{ mt: "auto" }}>
                                            {area && (
                                                <Typography variant="caption" sx={(theme) => ({ fontWeight: "fontWeightSemibold", color: theme.palette[color].main })}>
                                                    {patchLabel(type)}
                                                    {night ? " · night stay" : ""}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                );
            })}
        </Stack>
    );
}

// Edit: for each weekday pick the area, then whether it is HQ, Ex-HQ or Outstation.
function StpEditor({ form, setForm, areas }) {
    const [week, setWeek] = useState(1);
    const visibleWeek = Math.min(week, form.cycleWeeks);

    const setDay = (weekday, areaId) =>
        setForm((current) => {
            const days = { ...current.days };
            if (areaId) days[`${visibleWeek}:${weekday}`] = areaId;
            else delete days[`${visibleWeek}:${weekday}`];
            return { ...current, days, types: areaId && !current.types[areaId] ? { ...current.types, [areaId]: "HQ" } : current.types };
        });

    const setType = (areaId, type) => setForm((current) => ({ ...current, types: { ...current.types, [areaId]: type } }));

    const copyWeekOne = () =>
        setForm((current) => {
            const days = Object.fromEntries(Object.entries(current.days).filter(([key]) => !key.startsWith(`${visibleWeek}:`)));
            Object.entries(current.days)
                .filter(([key]) => key.startsWith("1:"))
                .forEach(([key, area]) => {
                    days[`${visibleWeek}:${key.split(":")[1]}`] = area;
                });
            return { ...current, days };
        });

    return (
        <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 2, alignItems: { sm: "center" }, justifyContent: "space-between" }}>
                <Stack direction="row" sx={{ gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Repeats
                    </Typography>
                    <SegmentedControl
                        value={REPEAT.some((item) => item.value === form.cycleWeeks) ? form.cycleWeeks : 4}
                        onChange={(value) => {
                            setForm((current) => ({ ...current, cycleWeeks: value }));
                            setWeek(1);
                        }}
                        options={REPEAT}
                    />
                </Stack>
                {form.cycleWeeks > 1 && (
                    <SegmentedControl
                        value={visibleWeek}
                        onChange={setWeek}
                        options={Array.from({ length: form.cycleWeeks }, (_, i) => ({ value: i + 1, label: `Week ${i + 1}` }))}
                    />
                )}
            </Stack>

            {visibleWeek > 1 && (
                <Button size="small" startIcon={<ContentCopyRounded />} onClick={copyWeekOne} sx={{ alignSelf: "flex-start" }}>
                    Same as week 1
                </Button>
            )}

            <Stack divider={<Divider />}>
                {WEEKDAYS.map((label, index) => {
                    const weekday = index + 1;
                    const area = form.days[`${visibleWeek}:${weekday}`] || "";
                    return (
                        <Stack key={label} direction={{ xs: "column", md: "row" }} sx={{ py: 1.25, gap: 1.5, alignItems: { md: "center" } }}>
                            <Typography variant="subtitle2" sx={(theme) => ({ width: { md: theme.spacing(7) } })}>
                                {label}
                            </Typography>
                            <TextField select size="small" value={area} onChange={(event) => setDay(weekday, event.target.value)} sx={(theme) => ({ flex: 1, minWidth: theme.spacing(28) })}>
                                <MenuItem value="">No field work</MenuItem>
                                {areas.map((item) => (
                                    <MenuItem key={item.AreaId} value={lower(item.AreaId)}>
                                        {item.AreaName}
                                        {item.TerritoryName ? ` · ${item.TerritoryName}` : ""}
                                    </MenuItem>
                                ))}
                            </TextField>
                            {area ? (
                                <Stack direction="row" sx={{ gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                                    <SegmentedControl value={form.types[area] || "HQ"} onChange={(type) => setType(area, type)} options={PATCH_TYPES.map(({ value, label: text }) => ({ value, label: text }))} />
                                    {nightStay(form.days, form.types, visibleWeek, weekday) && <Tag icon={NightsStayRounded} label="Night stay" color="warning" />}
                                </Stack>
                            ) : (
                                <Box sx={(theme) => ({ display: { xs: "none", md: "block" }, width: theme.spacing(38) })} />
                            )}
                        </Stack>
                    );
                })}
            </Stack>

            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                The same area on two days in a row as Outstation means a night stay. Changing HQ / Ex-HQ / Outstation changes it for every day that area is used.
            </Typography>
        </Stack>
    );
}

function Stp() {
    const { showSnackbar } = useSnackbar();
    const [permissions, setPermissions] = useState(new Set());
    // Set only when head office opens someone's plan (from the queue, or ?user= from the Approvals inbox).
    const [searchParams] = useSearchParams();
    const [userId, setUserId] = useState(() => (/^[0-9a-f-]{36}$/i.test(searchParams.get("user") || "") ? searchParams.get("user") : ""));
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [form, setForm] = useState(toForm(null));
    const [mode, setMode] = useState(null); // "view" | "edit"
    const [busy, setBusy] = useState(false);
    const [queue, setQueue] = useState([]);
    const [reviewing, setReviewing] = useState(null);
    const [withdrawing, setWithdrawing] = useState(false);

    const load = useCallback(async () => {
        try {
            const result = await getStp(userId || undefined);
            setData(result);
            setForm(toForm(result.open || result.approved));
            setError("");
            // No plan yet: start in Create. Otherwise show the plan first.
            setMode((current) => current || (!result.open && !result.approved && result.canEdit ? "edit" : "view"));
        } catch (err) {
            setError(errorMessage(err, "Couldn't load the standard tour plan"));
        }
    }, [userId]);

    useEffect(() => {
        getMyPermissions().then(setPermissions).catch(() => {});
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (permissions.has("stp.approve"))
            getSubmittedStps()
                .then((result) => setQueue(result.plans || []))
                .catch(() => {});
    }, [permissions, data]);

    // Patches = the areas actually used on some day, with their type.
    const payload = useMemo(() => {
        const days = Object.entries(form.days).filter(([key]) => Number(key.split(":")[0]) <= form.cycleWeeks);
        const used = [...new Set(days.map(([, area]) => area))];
        return {
            UserId: userId || undefined,
            CycleWeeks: form.cycleWeeks,
            Patches: used.map((AreaId) => ({ AreaId, PatchType: form.types[AreaId] || "HQ" })),
            Days: days.map(([key, AreaId]) => ({ CycleWeek: Number(key.split(":")[0]), Weekday: Number(key.split(":")[1]), AreaId })),
        };
    }, [form, userId]);

    const run = async (work, after) => {
        setBusy(true);
        try {
            const result = await work();
            showSnackbar(result?.message || "Done", "success");
            if (after) after();
            await load();
            return true;
        } catch (err) {
            showSnackbar(errorMessage(err, "Something went wrong"), "error");
            return false;
        } finally {
            setBusy(false);
        }
    };

    if (error) return <LoadError title="Couldn't load the plan" message={error} onRetry={load} />;
    if (!data || !mode) return <EmptyState icon={AutoFixHighRounded} title="Loading…" />;

    const open = data.open;
    const viewingOther = Boolean(userId);
    const hasPlan = Boolean(open || data.approved);
    const editing = mode === "edit" && data.canEdit && !viewingOther;

    return (
        <Box>
            <PageHeader
                eyebrow="Field operations · Standard tour plan"
                title={viewingOther ? `${data.user?.Name || "Employee"}'s standard tour plan` : "Standard tour plan"}
                status={open ? <StatusChip label={STATUS[open.Status].label} color={STATUS[open.Status].color} /> : data.approved ? <StatusChip label="Approved" color="success" /> : null}
                subtitle="Which area you work in on each weekday. Head office approves it once; every month's tour plan is then made from it."
                actions={
                    viewingOther ? (
                        <Button variant="outlined" startIcon={<UndoRounded />} onClick={() => setUserId("")}>
                            Back to my plan
                        </Button>
                    ) : (
                        <SegmentedControl
                            value={editing ? "edit" : "view"}
                            onChange={(next) => (next === "edit" && open?.Status === "SUBMITTED" ? setWithdrawing(true) : setMode(next))}
                            options={[
                                { value: "view", label: "View plan", icon: VisibilityRounded },
                                { value: "edit", label: hasPlan ? "Edit plan" : "Create plan", icon: EditRounded },
                            ]}
                        />
                    )
                }
            />

            <Stack spacing={2}>
                {open?.Status === "RETURNED" && open.ReviewRemarks && (
                    <Alert severity="warning" variant="outlined">
                        Returned by {open.ReviewedByName}: {open.ReviewRemarks}
                    </Alert>
                )}

                {editing ? (
                    <Panel
                        title={hasPlan ? "Edit your plan" : "Create your plan"}
                        subtitle="Pick the area for each day, then HQ, Ex-HQ or Outstation."
                        actions={
                            <Stack direction="row" sx={{ gap: 1 }}>
                                <Button variant="outlined" startIcon={<SaveRounded />} disabled={busy} onClick={() => run(() => saveStp(payload))}>
                                    Save draft
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<SendRounded />}
                                    disabled={busy || !payload.Days.length}
                                    onClick={() =>
                                        run(
                                            async () => {
                                                const saved = await saveStp(payload);
                                                return submitStp(saved.StpId);
                                            },
                                            () => setMode("view")
                                        )
                                    }
                                >
                                    Send to head office
                                </Button>
                            </Stack>
                        }
                    >
                        {data.areas.length ? (
                            <StpEditor form={form} setForm={setForm} areas={data.areas} />
                        ) : (
                            <Alert severity="info" variant="outlined">
                                No areas found for your territory. Ask head office to map your territory and its areas to you.
                            </Alert>
                        )}
                    </Panel>
                ) : (
                    <>
                        {data.approved && !viewingOther && (
                            <Panel title="Make the month's tour plan" subtitle="From the approved plan. Days already past are kept. No manager approval is needed inside your territory.">
                                <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                                    {[0, 1].map((offset) => (
                                        <Button key={offset} variant={offset ? "outlined" : "contained"} startIcon={<AutoFixHighRounded />} disabled={busy} onClick={() => run(() => generateMonth(monthKey(offset)))}>
                                            {monthName(monthKey(offset))}
                                        </Button>
                                    ))}
                                </Stack>
                            </Panel>
                        )}

                        {open && (
                            <Panel
                                title={open.Status === "SUBMITTED" ? "Waiting for head office" : open.Status === "RETURNED" ? "Sent back for changes" : "Draft (not sent yet)"}
                                subtitle={open.SubmittedByName ? `Sent by ${open.SubmittedByName}` : "Open Edit plan to finish it and send it to head office."}
                            >
                                <StpSummary stp={open} />
                            </Panel>
                        )}

                        {data.approved && (
                            <Panel title="Approved plan" subtitle={`Approved by ${data.approved.ReviewedByName || "head office"}`}>
                                <StpSummary stp={data.approved} />
                            </Panel>
                        )}

                        {!hasPlan && (
                            <Panel>
                                <EmptyState
                                    icon={AutoFixHighRounded}
                                    title="No standard tour plan yet"
                                    message={viewingOther ? "Nothing has been prepared yet." : "Create it once: pick the area for each weekday."}
                                    action={
                                        !viewingOther &&
                                        data.canEdit && (
                                            <Button variant="contained" startIcon={<EditRounded />} onClick={() => setMode("edit")}>
                                                Create plan
                                            </Button>
                                        )
                                    }
                                />
                            </Panel>
                        )}
                    </>
                )}

                {permissions.has("stp.approve") && !editing && (
                    <Panel title="Waiting for your approval" subtitle="Plans sent by MRs and managers.">
                        {queue.length ? (
                            <Stack divider={<Divider />}>
                                {queue.map((plan) => (
                                    <Stack key={plan.StpId} direction={{ xs: "column", sm: "row" }} sx={{ py: 1.25, gap: 1, alignItems: { sm: "center" } }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2">{plan.UserName}</Typography>
                                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                {plan.Patches} area(s) · {plan.CycleWeeks === 1 ? "same every week" : `repeats every ${plan.CycleWeeks} weeks`} · manager {plan.ManagerName || "—"}
                                            </Typography>
                                        </Box>
                                        <Button size="small" startIcon={<VisibilityRounded />} onClick={() => setUserId(plan.UserId)}>
                                            View
                                        </Button>
                                        <Button size="small" color="warning" startIcon={<UndoRounded />} onClick={() => setReviewing({ plan, approve: false })}>
                                            Return
                                        </Button>
                                        <Button size="small" variant="contained" color="success" startIcon={<CheckCircleRounded />} onClick={() => setReviewing({ plan, approve: true })}>
                                            Approve
                                        </Button>
                                    </Stack>
                                ))}
                            </Stack>
                        ) : (
                            <EmptyState icon={CheckCircleRounded} title="Nothing waiting" />
                        )}
                    </Panel>
                )}
            </Stack>

            {withdrawing && open && (
                <ConfirmActionDialog
                    icon={EditRounded}
                    color="warning"
                    title="Take the plan back to edit?"
                    message="It is waiting for head office. Taking it back turns it into a draft; make your changes and send it again."
                    confirmLabel="Take back and edit"
                    remarks="none"
                    busy={busy}
                    onClose={() => setWithdrawing(false)}
                    onConfirm={async () => {
                        if (await run(() => withdrawStp(open.StpId), () => setMode("edit"))) setWithdrawing(false);
                    }}
                />
            )}

            {reviewing && (
                <ConfirmActionDialog
                    icon={reviewing.approve ? CheckCircleRounded : UndoRounded}
                    color={reviewing.approve ? "success" : "warning"}
                    title={reviewing.approve ? "Approve this plan?" : "Send this plan back?"}
                    message={`${reviewing.plan.UserName}: ${reviewing.plan.Patches} area(s).`}
                    confirmLabel={reviewing.approve ? "Approve" : "Send back"}
                    remarks={reviewing.approve ? "optional" : "required"}
                    remarksLabel={reviewing.approve ? "Remarks (optional)" : "What needs to change?"}
                    remarksLimit={500}
                    busy={busy}
                    onClose={() => setReviewing(null)}
                    onConfirm={async (remarks) => {
                        if (await run(() => decideStp(reviewing.plan.StpId, reviewing.approve, remarks))) setReviewing(null);
                    }}
                />
            )}
        </Box>
    );
}

export default Stp;
