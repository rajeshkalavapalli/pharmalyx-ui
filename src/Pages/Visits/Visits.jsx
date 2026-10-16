import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
    Alert,
    AlertTitle,
    Box,
    Button,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    AddRounded,
    ChevronLeftRounded,
    ChevronRightRounded,
    CloudDoneRounded,
    CloudOffRounded,
    EventNoteRounded,
    EventRepeatRounded,
    LocationOnRounded,
    RefreshRounded,
    SyncRounded,
    TimerRounded,
    TrackChangesRounded,
} from "@mui/icons-material";

import ActingUserSelect from "../../components/ActingUserSelect/ActingUserSelect";
import useActingUser from "../../components/ActingUserSelect/useActingUser";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import StatCard from "../../components/StatCard/StatCard";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";

import LogVisitDialog from "./components/LogVisitDialog";
import VisitDetailsDrawer from "./components/VisitDetailsDrawer";
import VisitList from "./components/VisitList";
import { FollowUpsPanel, NotVisitedPanel } from "./components/VisitSidePanels";
import useVisitSync from "./useVisitSync";
import { cacheBalances, getStockBalances, readCachedBalances } from "../Engagement/index";
import {
    FOLLOW_UP_SOON_DAYS,
    addMonths,
    cacheDoctors,
    createVisit,
    daysUntil,
    formatDuration,
    formatMonthLabel,
    getFollowUps,
    getMyDoctors,
    getMyTeam,
    getVisits,
    minutesBetween,
    monthEndOf,
    monthStartOf,
    readCachedDoctors,
    todayKey,
} from "./index";

const CATEGORY_ORDER = { A: 0, B: 1, C: 2 };

const errorMessage = (error, fallback) => {
    const data = error.response?.data;
    const message = data?.message || error.message || fallback;

    return data?.error && data.error !== message ? `${message} (${data.error})` : message;
};

const compactSelectSx = (theme) => ({
    minWidth: theme.search.minWidth,
    "& .MuiOutlinedInput-root": { minHeight: theme.field.compactHeight },
    "& .MuiSelect-select": { py: 0 },
});

// Visits saved on the device, shaped like server rows for the list and drawer.
const pendingRows = (queue, userId, month, users) =>
    queue
        .filter((item) => item.userId === userId && item.payload.VisitDate.startsWith(month.slice(0, 7)))
        .map(({ payload, doctor, error }) => ({
            ...payload,
            pending: true,
            syncError: error,
            DoctorName: doctor?.DoctorName || "Doctor",
            Category: doctor?.Category,
            Speciality: doctor?.Speciality,
            HospitalName: doctor?.HospitalName,
            TerritoryName: doctor?.TerritoryName,
            AreaName: doctor?.AreaName,
            JointWorkUserName: users.find((user) => user.id === payload.JointWorkUserId)?.name || null,
            LocationStatus: payload.Location?.status || "NOT_CAPTURED",
            Latitude: payload.Location?.latitude,
            Longitude: payload.Location?.longitude,
            LocationAccuracy: payload.Location?.accuracy,
            RecordedAt: payload.RecordedAt,
        }));

function ConnectionStatus({ online, pending, syncing, onSync }) {
    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Tag
                icon={online ? CloudDoneRounded : CloudOffRounded}
                label={
                    online
                        ? pending
                            ? `Online · ${pending} to sync`
                            : "Online"
                        : `Offline${pending ? ` · ${pending} saved on device` : ""}`
                }
                color={online ? (pending ? "warning" : "success") : "warning"}
            />

            {online && pending > 0 && (
                <Button size="small" startIcon={<SyncRounded />} disabled={syncing} onClick={onSync}>
                    {syncing ? "Syncing…" : "Sync now"}
                </Button>
            )}
        </Stack>
    );
}

function Visits() {
    const { showSnackbar } = useSnackbar();
    const { actingUserId, setActingUserId, users } = useActingUser();

    const [team, setTeam] = useState([]);
    const [viewUserId, setViewUserId] = useState("");
    const [month, setMonth] = useState(() => monthStartOf(todayKey()));

    const [visits, setVisits] = useState([]);
    const [followUps, setFollowUps] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [offlineData, setOfflineData] = useState(false);

    const [logDoctorId, setLogDoctorId] = useState(null); // null = closed, "" = no preset
    const [stock, setStock] = useState([]);

    // The user's sample & gift balances for the visit form (cached for offline use).
    useEffect(() => {
        if (logDoctorId === null || !actingUserId) return;

        getStockBalances(actingUserId)
            .then((response) => {
                const balances = response?.balances || [];
                setStock(balances);
                cacheBalances(actingUserId, balances);
            })
            .catch(() => setStock(readCachedBalances(actingUserId)));
    }, [logDoctorId, actingUserId]);
    const [selectedVisit, setSelectedVisit] = useState(null);

    // =========================================================
    // LOADING
    // =========================================================

    const requestRef = useRef(0);

    const load = useCallback(async () => {
        if (!viewUserId) return;

        const requestId = ++requestRef.current;
        const isCurrent = () => requestId === requestRef.current;

        setLoading(true);
        setLoadError("");

        try {
            const [visitsResponse, followUpsResponse, doctorsResponse] = await Promise.all([
                getVisits({ userId: viewUserId, from: month, to: monthEndOf(month) }),
                getFollowUps(viewUserId),
                getMyDoctors(viewUserId),
            ]);

            if (!isCurrent()) return;

            const doctorList = doctorsResponse?.doctors || [];

            setVisits(visitsResponse?.visits || []);
            setFollowUps(followUpsResponse?.followUps || []);
            setDoctors(doctorList);
            setOfflineData(false);
            cacheDoctors(viewUserId, doctorList);
        } catch (error) {
            if (!isCurrent()) return;

            setVisits([]);
            setFollowUps([]);

            if (!error.response) {
                // Offline: keep working from the cached doctor list.
                setDoctors(readCachedDoctors(viewUserId));
                setOfflineData(true);
            } else {
                setDoctors([]);
                setLoadError(errorMessage(error, "Failed to load visits"));
            }
        } finally {
            if (isCurrent()) setLoading(false);
        }
    }, [viewUserId, month]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        setViewUserId(actingUserId);
        setTeam([]);

        if (!actingUserId) return;

        getMyTeam()
            .then((response) => setTeam(response?.team || []))
            .catch(() => setTeam([]));
    }, [actingUserId]);

    const sync = useVisitSync({
        onSynced: (count) => {
            showSnackbar(`${count} offline visit${count === 1 ? "" : "s"} synced`, "success");
            load();
        },
    });

    // =========================================================
    // SAVE (online, or queued on the device)
    // =========================================================

    const handleSave = async (payload, doctor) => {
        const queueIt = () => {
            sync.enqueue({ userId: actingUserId, payload, doctor });
            showSnackbar("Saved on this device. It will sync when you're back online.", "info");
            return true;
        };

        if (!navigator.onLine) return queueIt();

        try {
            const response = await createVisit(payload);

            showSnackbar(
                response?.message || "Visit logged",
                response?.data?.deviationCreated ? "warning" : "success"
            );
            load();
            return true;
        } catch (error) {
            if (!error.response) return queueIt();

            showSnackbar(errorMessage(error, "Failed to log visit"), "error");
            return false;
        }
    };

    // =========================================================
    // DERIVED
    // =========================================================

    const viewingSelf = viewUserId === actingUserId;
    const viewing = team.find((member) => member.UserId === viewUserId);
    const isCurrentMonth = month === monthStartOf(todayKey());

    const rows = useMemo(() => {
        const saved = new Set(visits.map((visit) => visit.VisitId));
        const pending = pendingRows(sync.queue, viewUserId, month, users).filter(
            (row) => !saved.has(row.VisitId)
        );

        return [...pending, ...visits].sort(
            (a, b) =>
                b.VisitDate.localeCompare(a.VisitDate) ||
                String(b.StartTime || "").localeCompare(String(a.StartTime || ""))
        );
    }, [visits, sync.queue, viewUserId, month, users]);

    const stats = useMemo(() => {
        const visitedIds = new Set(rows.map((row) => row.DoctorId));
        const durations = rows
            .map((row) => minutesBetween(row.StartTime, row.EndTime))
            .filter(Boolean);
        const due = followUps.filter((item) => daysUntil(item.FollowUpDate) <= FOLLOW_UP_SOON_DAYS);

        return {
            visits: rows.length,
            covered: doctors.filter((doctor) => visitedIds.has(doctor.DoctorId)).length,
            averageMinutes: durations.length
                ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
                : null,
            due: due.length,
            overdue: due.filter((item) => daysUntil(item.FollowUpDate) < 0).length,
        };
    }, [rows, doctors, followUps]);

    const notVisited = useMemo(() => {
        const visitedIds = new Set(rows.map((row) => row.DoctorId));

        return doctors
            .filter((doctor) => !visitedIds.has(doctor.DoctorId))
            .sort(
                (a, b) =>
                    (CATEGORY_ORDER[a.Category] ?? 3) - (CATEGORY_ORDER[b.Category] ?? 3) ||
                    a.DoctorName.localeCompare(b.DoctorName)
            );
    }, [rows, doctors]);

    const myQueue = sync.queue.filter((item) => item.userId === actingUserId);

    // What can still be given: held stock minus items in visits waiting to sync.
    const availableStock = useMemo(() => {
        const queued = {};

        myQueue.forEach((entry) =>
            (entry.payload.Items || []).forEach((item) => {
                const key = `${item.ItemType}:${item.ItemId}`;
                queued[key] = (queued[key] || 0) + item.Quantity;
            })
        );

        return stock.map((row) => ({
            ...row,
            Balance: Math.max(0, row.Balance - (queued[`${row.ItemType}:${row.ItemId}`] || 0)),
        }));
    }, [stock, myQueue]);
    const failedSyncs = myQueue.filter((item) => item.error).length;
    const colleagues = users.filter((user) => user.id !== actingUserId);

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <Box>
            <PageHeader
                eyebrow="Field operations · Visits"
                title={viewing && !viewing.IsSelf ? `${viewing.Name}'s visits` : "Visits"}
                status={
                    <ConnectionStatus
                        online={sync.online}
                        pending={myQueue.filter((item) => !item.error).length}
                        syncing={sync.syncing}
                        onSync={sync.syncNow}
                    />
                }
                subtitle="Log every doctor call with GPS check-in. Works offline and syncs when you reconnect."
                actions={
                    <>
                        <ActingUserSelect users={users} value={actingUserId} onChange={setActingUserId} />

                        {team.length > 1 && (
                            <TextField
                                select
                                size="small"
                                label="Viewing"
                                value={viewUserId}
                                onChange={(event) => setViewUserId(event.target.value)}
                                sx={compactSelectSx}
                            >
                                {team.map((member) => (
                                    <MenuItem key={member.UserId} value={member.UserId}>
                                        {member.IsSelf ? "Me" : member.Name}
                                        {member.DesignationName ? ` · ${member.DesignationName}` : ""}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        {viewingSelf && (
                            <Button
                                variant="contained"
                                startIcon={<AddRounded />}
                                disabled={!actingUserId}
                                onClick={() => setLogDoctorId("")}
                            >
                                Log visit
                            </Button>
                        )}
                    </>
                }
            />

            {!actingUserId ? (
                <Panel>
                    <Box sx={{ py: 6, textAlign: "center" }}>
                        <Typography variant="h5" component="p">
                            Choose a user to continue
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={(theme) => ({ mt: 1, color: theme.palette.text.secondary })}
                        >
                            Sign-in is not connected yet. Pick who you are acting as from the header.
                        </Typography>
                    </Box>
                </Panel>
            ) : (
                <>
                    {failedSyncs > 0 && (
                        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
                            <AlertTitle>
                                {failedSyncs} offline visit{failedSyncs === 1 ? "" : "s"} could not be saved
                            </AlertTitle>
                            Open the visits marked "Sync failed" below to see why, then retry or discard them.
                        </Alert>
                    )}

                    {offlineData && (
                        <Alert severity="warning" variant="outlined" icon={<CloudOffRounded />} sx={{ mb: 2 }}>
                            You're offline. Showing visits saved on this device; synced history appears
                            when you reconnect.
                        </Alert>
                    )}

                    {/* SUMMARY */}

                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "repeat(2, minmax(0, 1fr))",
                                lg: "repeat(4, minmax(0, 1fr))",
                            },
                            gap: theme.stat.gap,
                            mb: theme.pageHeader.marginBottom,
                        })}
                    >
                        <StatCard
                            icon={LocationOnRounded}
                            label="Visits"
                            value={stats.visits}
                            caption={formatMonthLabel(month)}
                            color="primary"
                        />
                        <StatCard
                            icon={TrackChangesRounded}
                            label="Doctor coverage"
                            value={`${stats.covered} / ${doctors.length}`}
                            caption="Assigned doctors visited"
                            color="success"
                            progress={doctors.length ? (stats.covered / doctors.length) * 100 : 0}
                        />
                        <StatCard
                            icon={TimerRounded}
                            label="Average call"
                            value={stats.averageMinutes ? formatDuration(stats.averageMinutes) : "—"}
                            caption="Based on start and end times"
                            color="info"
                        />
                        <StatCard
                            icon={EventRepeatRounded}
                            label="Follow-ups due"
                            value={stats.due}
                            caption={stats.overdue ? `${stats.overdue} overdue` : `Within ${FOLLOW_UP_SOON_DAYS} days`}
                            color={stats.overdue ? "error" : "warning"}
                        />
                    </Box>

                    {/* MAIN */}

                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "minmax(0, 1fr)",
                                lg: `minmax(0, 1fr) ${theme.spacing(theme.visitList.sidePanelWidth)}`,
                            },
                            gap: theme.stat.gap,
                            alignItems: "start",
                        })}
                    >
                        <Panel
                            actions={
                                <Stack
                                    direction="row"
                                    sx={{
                                        width: "100%",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        flexWrap: "wrap",
                                        gap: 1.5,
                                    }}
                                >
                                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                                        <IconButton
                                            aria-label="Previous month"
                                            onClick={() => setMonth(addMonths(month, -1))}
                                        >
                                            <ChevronLeftRounded />
                                        </IconButton>
                                        <Typography
                                            variant="h5"
                                            component="h2"
                                            sx={(theme) => ({ minWidth: theme.spacing(20), textAlign: "center" })}
                                        >
                                            {formatMonthLabel(month)}
                                        </Typography>
                                        <IconButton
                                            aria-label="Next month"
                                            disabled={isCurrentMonth}
                                            onClick={() => setMonth(addMonths(month, 1))}
                                        >
                                            <ChevronRightRounded />
                                        </IconButton>
                                        {!isCurrentMonth && (
                                            <Button size="small" onClick={() => setMonth(monthStartOf(todayKey()))}>
                                                This month
                                            </Button>
                                        )}
                                    </Stack>

                                    <Typography
                                        variant="caption"
                                        sx={(theme) => ({ color: theme.palette.text.secondary })}
                                    >
                                        {rows.length} visit{rows.length === 1 ? "" : "s"}
                                    </Typography>
                                </Stack>
                            }
                        >
                            <Box
                                sx={(theme) => ({
                                    opacity: loading ? theme.table.loadingOpacity : 1,
                                    transition: theme.calendar.transition,
                                })}
                            >
                                {loadError ? (
                                    <Alert
                                        severity="error"
                                        variant="outlined"
                                        action={
                                            <Button
                                                color="error"
                                                size="small"
                                                startIcon={<RefreshRounded />}
                                                onClick={load}
                                            >
                                                Retry
                                            </Button>
                                        }
                                    >
                                        <AlertTitle>Couldn't load visits</AlertTitle>
                                        {loadError}
                                    </Alert>
                                ) : rows.length === 0 ? (
                                    <Box sx={(theme) => ({ py: theme.table.emptyPaddingY, textAlign: "center" })}>
                                        <EventNoteRounded
                                            sx={(theme) => ({
                                                fontSize: theme.table.emptyIconSize,
                                                color: theme.palette.text.disabled,
                                            })}
                                        />
                                        <Typography variant="subtitle1" sx={{ mt: 1 }}>
                                            {loading ? "Loading visits…" : "No visits this month"}
                                        </Typography>
                                        {!loading && viewingSelf && isCurrentMonth && (
                                            <Button
                                                variant="outlined"
                                                startIcon={<AddRounded />}
                                                onClick={() => setLogDoctorId("")}
                                                sx={{ mt: 2 }}
                                            >
                                                Log your first visit
                                            </Button>
                                        )}
                                    </Box>
                                ) : (
                                    <VisitList visits={rows} onOpen={setSelectedVisit} />
                                )}
                            </Box>
                        </Panel>

                        <Stack spacing={2}>
                            <FollowUpsPanel
                                followUps={followUps}
                                canLog={viewingSelf}
                                onLog={setLogDoctorId}
                            />
                            <NotVisitedPanel
                                doctors={notVisited}
                                isCurrentMonth={isCurrentMonth}
                                canLog={viewingSelf}
                                onLog={setLogDoctorId}
                            />
                        </Stack>
                    </Box>
                </>
            )}

            {logDoctorId !== null && (
                <LogVisitDialog
                    doctors={doctors}
                    colleagues={colleagues}
                    stock={availableStock}
                    initialDoctorId={logDoctorId}
                    online={sync.online}
                    onClose={() => setLogDoctorId(null)}
                    onSave={handleSave}
                />
            )}

            <VisitDetailsDrawer
                visit={selectedVisit}
                onClose={() => setSelectedVisit(null)}
                onDiscard={(visitId) => {
                    sync.discard(visitId);
                    setSelectedVisit(null);
                }}
                onRetry={(visitId) => {
                    sync.retry(visitId);
                    setSelectedVisit(null);
                }}
            />
        </Box>
    );
}

export default Visits;
