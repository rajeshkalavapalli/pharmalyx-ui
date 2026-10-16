import { useCallback, useEffect, useRef, useState } from "react";

import {
    Alert,
    AlertTitle,
    Box,
    Button,
    CircularProgress,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    AssignmentTurnedInRounded,
    ChevronLeftRounded,
    ChevronRightRounded,
    DirectionsBikeRounded,
    EventBusyRounded,
    PendingActionsRounded,
    RefreshRounded,
} from "@mui/icons-material";

import ActingUserSelect from "../../components/ActingUserSelect/ActingUserSelect";
import useActingUser from "../../components/ActingUserSelect/useActingUser";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import StatCard from "../../components/StatCard/StatCard";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";

import DayReportPanel from "./components/DayReportPanel";
import DcrCalendar from "./components/DcrCalendar";
import ReviewQueue from "./components/ReviewQueue";
import {
    addMonths,
    approveDcr,
    formatMonthLabel,
    getDcrDay,
    getDcrMonth,
    getDcrReviews,
    getMyTeam,
    monthStartOf,
    readQueue,
    returnDcr,
    submitDcr,
    todayKey,
} from "./index";

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

// Picks the most useful day to open: today if it's in the month, else the first one needing action.
const defaultDateFor = (month, days) => {
    const today = todayKey();

    if (today.startsWith(month.slice(0, 7))) return today;

    return (
        days.find((day) => ["RETURNED", "DUE", "SUBMITTED"].includes(day.status))?.date ||
        days.find((day) => day.visitCount > 0)?.date ||
        month
    );
};

function Dcr() {
    const { showSnackbar } = useSnackbar();
    const { actingUserId, setActingUserId, users } = useActingUser();

    const [team, setTeam] = useState([]);
    const [viewUserId, setViewUserId] = useState("");
    const [month, setMonth] = useState(() => monthStartOf(todayKey()));
    const [selectedDate, setSelectedDate] = useState(null);

    const [monthData, setMonthData] = useState(null);
    const [monthError, setMonthError] = useState("");
    const [dayData, setDayData] = useState(null);
    const [dayLoading, setDayLoading] = useState(false);
    const [dayError, setDayError] = useState("");
    const [reviews, setReviews] = useState([]);
    const [busy, setBusy] = useState(false);

    // =========================================================
    // TEAM + REVIEW QUEUE
    // =========================================================

    const loadReviews = useCallback(() => {
        if (!actingUserId) return;

        getDcrReviews()
            .then((response) => setReviews(response?.reviews || []))
            .catch(() => setReviews([]));
    }, [actingUserId]);

    useEffect(() => {
        setViewUserId(actingUserId);
        setTeam([]);
        setReviews([]);

        if (!actingUserId) return;

        getMyTeam()
            .then((response) => setTeam(response?.team || []))
            .catch(() => setTeam([]));

        loadReviews();
    }, [actingUserId, loadReviews]);

    // =========================================================
    // MONTH
    // =========================================================

    const monthRequest = useRef(0);

    const loadMonth = useCallback(async () => {
        if (!viewUserId) return;

        const requestId = ++monthRequest.current;

        setMonthError("");

        try {
            const response = await getDcrMonth(month, viewUserId);

            if (requestId !== monthRequest.current) return;

            setMonthData(response);
            setSelectedDate((current) =>
                current && current.startsWith(month.slice(0, 7)) ? current : defaultDateFor(month, response.days)
            );
        } catch (error) {
            if (requestId !== monthRequest.current) return;

            setMonthData(null);
            setMonthError(errorMessage(error, "Failed to load DCRs"));
        }
    }, [month, viewUserId]);

    useEffect(() => {
        loadMonth();
    }, [loadMonth]);

    // =========================================================
    // DAY
    // =========================================================

    const dayRequest = useRef(0);

    const loadDay = useCallback(async () => {
        if (!viewUserId || !selectedDate) return;

        const requestId = ++dayRequest.current;

        setDayLoading(true);
        setDayError("");

        try {
            const response = await getDcrDay(selectedDate, viewUserId);

            if (requestId === dayRequest.current) setDayData(response);
        } catch (error) {
            if (requestId !== dayRequest.current) return;

            setDayData(null);
            setDayError(errorMessage(error, "Failed to load the day"));
        } finally {
            if (requestId === dayRequest.current) setDayLoading(false);
        }
    }, [selectedDate, viewUserId]);

    useEffect(() => {
        loadDay();
    }, [loadDay]);

    const refreshAll = () => {
        loadMonth();
        loadDay();
        loadReviews();
    };

    // =========================================================
    // ACTIONS
    // =========================================================

    const run = async (action, fallback) => {
        setBusy(true);

        try {
            const response = await action();

            showSnackbar(response?.message || fallback, "success");
            refreshAll();
            return true;
        } catch (error) {
            showSnackbar(errorMessage(error, "Action failed"), "error");
            return false;
        } finally {
            setBusy(false);
        }
    };

    const handleSubmit = (payload) => run(() => submitDcr(payload), "DCR sent for review");

    const handleReview = (action, dcrId, remarks) =>
        run(
            () => (action === "approve" ? approveDcr(dcrId, remarks) : returnDcr(dcrId, remarks)),
            action === "approve" ? "DCR approved" : "DCR returned"
        );

    const openReview = (review) => {
        setViewUserId(review.UserId);
        setMonth(monthStartOf(review.ReportDate));
        setSelectedDate(review.ReportDate);
    };

    // =========================================================
    // RENDER
    // =========================================================

    const viewing = team.find((member) => member.UserId === viewUserId);
    const viewingSelf = viewUserId === actingUserId;
    const isCurrentMonth = month === monthStartOf(todayKey());
    const summary = monthData?.summary;

    const pendingSyncCount = selectedDate
        ? readQueue().filter(
              (item) => item.userId === viewUserId && item.payload.VisitDate === selectedDate && !item.error
          ).length
        : 0;

    return (
        <Box>
            <PageHeader
                eyebrow="Field operations · DCR"
                title={viewing && !viewing.IsSelf ? `${viewing.Name}'s daily reports` : "Daily call reports"}
                subtitle={`Send each field day's report to your manager by the end of the next day.`}
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
                            icon={AssignmentTurnedInRounded}
                            label="Sent"
                            value={summary ? summary.submitted + summary.approved : "—"}
                            caption={summary ? `${summary.approved} approved` : formatMonthLabel(month)}
                            color="success"
                        />
                        <StatCard
                            icon={PendingActionsRounded}
                            label="Needs action"
                            value={summary ? summary.due + summary.returned : "—"}
                            caption={summary?.returned ? `${summary.returned} returned to fix` : "Due within the deadline"}
                            color="primary"
                        />
                        <StatCard
                            icon={EventBusyRounded}
                            label="Missed"
                            value={summary ? summary.missed : "—"}
                            caption="Field days with no DCR"
                            color="error"
                        />
                        <StatCard
                            icon={DirectionsBikeRounded}
                            label="Distance travelled"
                            value={summary ? `${Math.round(summary.distanceKm)} km` : "—"}
                            caption="From sent DCRs"
                            color="info"
                        />
                    </Box>

                    {viewingSelf && <ReviewQueue reviews={reviews} onOpen={openReview} />}

                    {/* CALENDAR + DAY */}

                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "minmax(0, 1fr)",
                                lg: `${theme.spacing(theme.dcr.calendarWidth)} minmax(0, 1fr)`,
                            },
                            gap: theme.stat.gap,
                            alignItems: "start",
                        })}
                    >
                        <Panel
                            actions={
                                <Stack
                                    direction="row"
                                    sx={{ width: "100%", alignItems: "center", justifyContent: "space-between" }}
                                >
                                    <IconButton aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))}>
                                        <ChevronLeftRounded />
                                    </IconButton>
                                    <Typography variant="h5" component="h2">
                                        {formatMonthLabel(month)}
                                    </Typography>
                                    <IconButton
                                        aria-label="Next month"
                                        disabled={isCurrentMonth}
                                        onClick={() => setMonth(addMonths(month, 1))}
                                    >
                                        <ChevronRightRounded />
                                    </IconButton>
                                </Stack>
                            }
                        >
                            {monthError ? (
                                <Alert
                                    severity="error"
                                    variant="outlined"
                                    action={
                                        <Button color="error" size="small" startIcon={<RefreshRounded />} onClick={loadMonth}>
                                            Retry
                                        </Button>
                                    }
                                >
                                    <AlertTitle>Couldn't load DCRs</AlertTitle>
                                    {monthError}
                                </Alert>
                            ) : (
                                <DcrCalendar
                                    month={month}
                                    days={monthData?.days || []}
                                    selectedDate={selectedDate}
                                    onSelect={setSelectedDate}
                                />
                            )}
                        </Panel>

                        <Box sx={{ minWidth: 0 }}>
                            {dayError ? (
                                <Panel>
                                    <Alert
                                        severity="error"
                                        variant="outlined"
                                        action={
                                            <Button color="error" size="small" startIcon={<RefreshRounded />} onClick={loadDay}>
                                                Retry
                                            </Button>
                                        }
                                    >
                                        <AlertTitle>Couldn't load this day</AlertTitle>
                                        {dayError}
                                    </Alert>
                                </Panel>
                            ) : dayData && (!dayLoading || dayData.date === selectedDate) ? (
                                <DayReportPanel
                                    key={`${viewUserId}-${dayData.date}-${dayData.dcr?.Status || "none"}`}
                                    data={dayData}
                                    viewingSelf={viewingSelf}
                                    pendingSyncCount={pendingSyncCount}
                                    busy={busy}
                                    onSubmit={handleSubmit}
                                    onReview={handleReview}
                                />
                            ) : (
                                <Panel>
                                    <Box sx={{ py: 8, display: "grid", placeItems: "center" }}>
                                        <CircularProgress />
                                    </Box>
                                </Panel>
                            )}
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
}

export default Dcr;
