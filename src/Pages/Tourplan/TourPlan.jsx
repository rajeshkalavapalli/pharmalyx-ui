import { useEffect, useMemo, useRef, useState } from "react";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { alpha, useTheme } from "@mui/material/styles";

import {
    CalendarMonthRounded,
    CheckCircleOutlineRounded,
    CloseRounded,
    DescriptionOutlined,
    SaveOutlined,
    SendRounded,
} from "@mui/icons-material";

import { getTerritories } from "../Territory/index";
import { getAreasByTerritory } from "../Doctors/index";
import {
    approveTourPlan,
    getCurrentUserId,
    getTourPlan,
    rejectTourPlan,
    saveTourPlan,
} from "./index";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { useSearchParams } from "react-router-dom";
import { getUsers } from "../Users/service/index";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import themePlugin from "@fullcalendar/react/themes/classic";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";

function TourPlan() {
    const theme = useTheme();

    const calendarRef = useRef(null);

    // =========================================================
    // PLAN STATUS
    // =========================================================

    const { showSnackbar } = useSnackbar();

    // A manager opens a team member's plan with ?userId=<member>.
    const [searchParams] = useSearchParams();
    const viewUserId = searchParams.get("userId") || undefined;

    const [planStatus, setPlanStatus] = useState("draft");

    const [visibleMonth, setVisibleMonth] = useState(null);

    const [planId, setPlanId] = useState(null);

    const [canEdit, setCanEdit] = useState(true);

    const [canApprove, setCanApprove] = useState(false);

    const [busy, setBusy] = useState(false);

    // Temporary until login stores the user: picks who the API acts as.
    const [users, setUsers] = useState([]);

    const [actingUserId, setActingUserId] = useState(() => {
        const stored = getCurrentUserId();

        if (stored === "undefined") {
            localStorage.removeItem("userId");
            return "";
        }

        return stored || "";
    });

    useEffect(() => {
        getUsers()
            .then((response) => {
                const data = response?.result || response || [];

                setUsers(
                    (Array.isArray(data) ? data : []).map((user) => ({
                        id: user.userId || user.UserId,
                        name:
                            [user.FirstName, user.LastName]
                                .filter(Boolean)
                                .join(" ") || user.UserName,
                    }))
                );
            })
            .catch(() => setUsers([]));
    }, []);

    const handleActingUserChange = (event) => {
        const value = event.target.value;

        localStorage.setItem("userId", value);
        setActingUserId(value);
    };

    // =========================================================
    // TOUR PLAN DATA
    // =========================================================

    const [tourPlans, setTourPlans] = useState({});

    // =========================================================
    // DIALOG
    // =========================================================

    const [dialogOpen, setDialogOpen] = useState(false);

    const [selectedDate, setSelectedDate] = useState(null);

    // =========================================================
    // FORM
    // =========================================================

    const [dayType, setDayType] = useState("working");

    const [territory, setTerritory] = useState("");

    const [area, setArea] = useState("");

    const [territories, setTerritories] = useState([]);

    const [areas, setAreas] = useState([]);

    const pendingAreaId = useRef("");

    const [remarks, setRemarks] = useState("");

    // =========================================================
    // LOAD TERRITORIES
    // =========================================================

    useEffect(() => {
        const loadTerritories = async () => {
            try {
                const response = await getTerritories();

                setTerritories(
                    Array.isArray(response?.territories)
                        ? response.territories
                        : []
                );
            } catch (error) {
                console.error(
                    "Error loading territories",
                    error
                );

                setTerritories([]);
            }
        };

        loadTerritories();
    }, []);

    // =========================================================
    // LOAD AREAS BASED ON TERRITORY
    // =========================================================

    useEffect(() => {
        if (!territory) {
            setAreas([]);
            return;
        }

        let active = true;

        const areaIdToRestore = pendingAreaId.current;

        pendingAreaId.current = "";

        const loadAreas = async () => {
            try {
                const response =
                    await getAreasByTerritory(territory);

                const list = Array.isArray(response)
                    ? response
                    : [];

                if (!active) {
                    return;
                }

                setAreas(list);

                setArea(
                    list.some(
                        (item) =>
                            item.AreaId ===
                            areaIdToRestore
                    )
                        ? areaIdToRestore
                        : ""
                );
            } catch (error) {
                if (!active) {
                    return;
                }

                console.error(
                    "Error loading areas",
                    error
                );

                setAreas([]);
                setArea("");
            }
        };

        loadAreas();

        return () => {
            active = false;
        };
    }, [territory]);

    // =========================================================
    // INITIAL CALENDAR DATE
    // =========================================================

    const initialCalendarDate = useMemo(() => {
        const date = new Date();

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        return `${year}-${month}-01`;
    }, []);

    // =========================================================
    // SELECTED DATE LABEL
    // =========================================================

    const selectedDateLabel = useMemo(() => {
        if (!selectedDate) {
            return "";
        }

        const date = new Date(
            `${selectedDate}T00:00:00`
        );

        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    }, [selectedDate]);

    // =========================================================
    // SELECTED DAY NAME
    // =========================================================

    const selectedDayName = useMemo(() => {
        if (!selectedDate) {
            return "";
        }

        const date = new Date(
            `${selectedDate}T00:00:00`
        );

        return date.toLocaleDateString("en-US", {
            weekday: "long",
        });
    }, [selectedDate]);

    // =========================================================
    // CALENDAR EVENTS
    // =========================================================

    const calendarEvents = useMemo(() => {
        return Object.entries(tourPlans).map(
            ([date, plan]) => ({
                id: date,
                start: date,
                allDay: true,

                extendedProps: {
                    dayType: plan.dayType,
                    territory:
                        plan.territoryName || "",
                    area:
                        plan.areaName || "",
                    remarks:
                        plan.remarks || "",
                },
            })
        );
    }, [tourPlans]);

    // =========================================================
    // DATE CLICK
    // =========================================================

    const handleDateClick = (info) => {
        const date = info.dateStr;

        if (!canEdit || !visibleMonth || !date.startsWith(visibleMonth.slice(0, 7))) {
            return;
        }

        setSelectedDate(date);

        const existingPlan = tourPlans[date];

        if (existingPlan) {
            setDayType(existingPlan.dayType);

            const existingTerritory =
                existingPlan.territory || "";

            pendingAreaId.current =
                existingTerritory === territory
                    ? ""
                    : existingPlan.area || "";

            setTerritory(existingTerritory);

            setArea(
                existingTerritory === territory
                    ? existingPlan.area || ""
                    : ""
            );

            setRemarks(existingPlan.remarks || "");
        } else {
            setDayType("working");
            setTerritory("");
            setArea("");
            pendingAreaId.current = "";
            setRemarks("");
        }

        setDialogOpen(true);
    };

    // =========================================================
    // DAY TYPE
    // =========================================================

    const handleDayTypeChange = (value) => {
        setDayType(value);

        if (value === "non-working") {
            pendingAreaId.current = "";
            setTerritory("");
            setArea("");
        }
    };

    // =========================================================
    // TERRITORY CHANGE
    // =========================================================

    const handleTerritoryChange = (event) => {
        const value = event.target.value;

        pendingAreaId.current = "";

        setTerritory(value);
        setArea("");
    };

    // =========================================================
    // SAVE DATE
    // =========================================================

    const handleSaveDate = () => {
        if (!selectedDate) {
            return;
        }

        const selectedTerritory =
            territories.find(
                (item) =>
                    item.TerritoryId ===
                    territory
            );

        const selectedArea = areas.find(
            (item) =>
                item.AreaId === area
        );

        setTourPlans((previous) => ({
            ...previous,

            [selectedDate]: {
                dayType,

                territory:
                    dayType === "working"
                        ? territory
                        : "",

                area:
                    dayType === "working"
                        ? area
                        : "",

                territoryName:
                    dayType === "working"
                        ? selectedTerritory
                              ?.TerritoryName || ""
                        : "",

                areaName:
                    dayType === "working"
                        ? selectedArea
                              ?.AreaName || ""
                        : "",

                remarks,
            },
        }));

        setDialogOpen(false);
    };

    // =========================================================
    // CANCEL
    // =========================================================

    const handleCancel = () => {
        setDialogOpen(false);
    };

    // =========================================================
    // SUBMIT
    // =========================================================

    const buildPayload = (submit) => ({
        PlanMonth: visibleMonth,
        Submit: submit,
        details: Object.entries(tourPlans)
            .filter(([date]) => date.startsWith(visibleMonth.slice(0, 7)))
            .map(([date, plan]) => ({
                PlanDate: date,
                DayType: plan.dayType,
                TerritoryId: plan.territory || null,
                AreaId: plan.area || null,
            })),
    });

    const runAction = async (action, fallbackMessage) => {
        setBusy(true);

        try {
            const response = await action();

            showSnackbar(response?.message || fallbackMessage, "success");

            await loadPlan(visibleMonth);
        } catch (error) {
            showSnackbar(
                error.response?.data?.error ||
                    error.response?.data?.message ||
                    error.message ||
                    "Tour plan action failed",
                "error"
            );
        } finally {
            setBusy(false);
        }
    };

    const isPlanComplete = (() => {
        if (!visibleMonth) {
            return false;
        }

        const prefix = visibleMonth.slice(0, 7);
        const [year, month] = prefix.split("-").map(Number);
        const totalDays = new Date(year, month, 0).getDate();

        for (let day = 1; day <= totalDays; day += 1) {
            const plan =
                tourPlans[`${prefix}-${String(day).padStart(2, "0")}`];

            if (
                !plan ||
                (plan.dayType === "working" &&
                    (!plan.territory || !plan.area))
            ) {
                return false;
            }
        }

        return true;
    })();

    const handleSaveDraft = () =>
        runAction(
            () => saveTourPlan(buildPayload(false)),
            "Tour plan saved as draft"
        );

    const handleSubmit = () => {
        const monthPrefix = visibleMonth.slice(0, 7);
        const [year, month] = monthPrefix.split("-").map(Number);
        const totalDays = new Date(year, month, 0).getDate();

        for (let day = 1; day <= totalDays; day += 1) {
            const date = `${monthPrefix}-${String(day).padStart(2, "0")}`;
            const plan = tourPlans[date];

            if (
                !plan ||
                (plan.dayType === "working" &&
                    (!plan.territory || !plan.area))
            ) {
                showSnackbar(
                    `Complete the plan for ${date} before submitting`,
                    "error"
                );
                return;
            }
        }

        runAction(
            () => saveTourPlan(buildPayload(true)),
            "Tour plan submitted for approval"
        );
    };

    const handleApprove = () =>
        runAction(() => approveTourPlan(planId), "Tour plan approved");

    const handleReject = () =>
        runAction(() => rejectTourPlan(planId), "Tour plan rejected");

    const handleDatesSet = (info) => {
        const start = info.view.currentStart;

        const next = `${start.getFullYear()}-${String(
            start.getMonth() + 1
        ).padStart(2, "0")}-01`;

        setVisibleMonth((previous) =>
            previous === next ? previous : next
        );
    };

    const loadPlan = async (month) => {
        try {
            const { plan } = await getTourPlan(month, viewUserId);

            if (!plan) {
                setTourPlans({});
                setPlanId(null);
                setPlanStatus("draft");
                setCanEdit(
                    !viewUserId ||
                        viewUserId === getCurrentUserId()
                );
                setCanApprove(false);
                return;
            }

            const loaded = {};

            plan.details.forEach((detail) => {
                loaded[detail.PlanDate] = {
                    dayType: detail.DayType,
                    territory: detail.TerritoryId || "",
                    area: detail.AreaId || "",
                    territoryName: detail.TerritoryName || "",
                    areaName: detail.AreaName || "",
                    remarks: "",
                };
            });

            setTourPlans(loaded);
            setPlanId(plan.TourPlanId);
            setPlanStatus(plan.Status.toLowerCase());
            setCanEdit(plan.canEdit);
            setCanApprove(plan.canApprove);
        } catch (error) {
            setTourPlans({});
            setPlanId(null);
            setCanEdit(error.response?.status !== 403);
            setCanApprove(false);
            showSnackbar(
                error.response?.data?.message ||
                    "Unable to load tour plan",
                "error"
            );
        }
    };

    useEffect(() => {
        if (visibleMonth) {
            loadPlan(visibleMonth);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleMonth, viewUserId, actingUserId]);

    // =========================================================
    // STATUS CONFIG
    // =========================================================

    const statusConfig = {
        draft: {
            label: "Draft",
            color:
                theme.palette.primary.main,
        },

        submitted: {
            label:
                "Pending Approval",
            color:
                theme.palette.info.main,
        },

        approved: {
            label: "Approved",
            color:
                theme.palette.success.main,
        },

        rejected: {
            label: "Rejected",
            color:
                theme.palette.error.main,
        },
    };

    const currentStatus =
        statusConfig[planStatus];

    // =========================================================
    // APPROVAL HISTORY
    // =========================================================

    const getHistoryState = (step) => {
        if (step === "draft") {
            return {
                completed:
                    planStatus !== "draft",

                active:
                    planStatus === "draft",
            };
        }

        if (step === "submitted") {
            return {
                completed:
                    planStatus === "approved" ||
                    planStatus === "rejected",

                active:
                    planStatus === "submitted",
            };
        }

        if (step === "approved") {
            return {
                completed: false,

                active:
                    planStatus === "approved",
            };
        }

        if (step === "rejected") {
            return {
                completed: false,

                active:
                    planStatus === "rejected",
            };
        }

        return {
            completed: false,
            active: false,
        };
    };

    // =========================================================
    // APPROVAL STEP
    // =========================================================

    const ApprovalStep = ({
        icon,
        title,
        description,
        step,
    }) => {
        const state =
            getHistoryState(step);

        const isActive =
            state.active ||
            state.completed;

        return (
            <Stack
                direction="row"
                alignItems="center"
                spacing={1.25}
                sx={{
                    flex: 1,
                    minWidth: 0,
                }}
            >
                <Box
                    sx={{
                        width: 38,
                        height: 38,

                        flexShrink: 0,

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        borderRadius: "50%",

                        backgroundColor:
                            isActive
                                ? alpha(
                                      currentStatus.color,
                                      0.1
                                  )
                                : theme.palette
                                      .surface
                                      .muted,

                        color:
                            isActive
                                ? currentStatus.color
                                : theme.palette
                                      .text
                                      .secondary,
                    }}
                >
                    {icon}
                </Box>

                <Box
                    sx={{
                        minWidth: 0,
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 700,

                            color:
                                theme.palette
                                    .text.primary,

                            whiteSpace:
                                "nowrap",

                            overflow:
                                "hidden",

                            textOverflow:
                                "ellipsis",
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",

                            mt: 0.15,

                            color:
                                theme.palette
                                    .text.secondary,

                            whiteSpace:
                                "nowrap",

                            overflow:
                                "hidden",

                            textOverflow:
                                "ellipsis",
                        }}
                    >
                        {description}
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",

                            mt: 0.2,

                            color: isActive
                                ? currentStatus.color
                                : theme.palette
                                      .text.disabled,

                            fontWeight:
                                isActive
                                    ? 650
                                    : 500,
                        }}
                    >
                        {state.active
                            ? "Current"
                            : state.completed
                              ? "Completed"
                              : "Pending"}
                    </Typography>
                </Box>
            </Stack>
        );
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <Box
            sx={{
                minHeight: "100%",

                px: {
                    xs: 1.5,
                    sm: 2.5,
                    md: 3,
                },

                py: {
                    xs: 2,
                    md: 2.5,
                },

                backgroundColor:
                    theme.palette
                        .background.default,
            }}
        >
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <Stack
                direction={{
                    xs: "column",
                    lg: "row",
                }}
                alignItems={{
                    xs: "flex-start",
                    lg: "center",
                }}
                justifyContent="space-between"
                spacing={2}
                sx={{
                    mb: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            color:
                                theme.palette
                                    .text.primary,

                            fontWeight: 750,

                            letterSpacing:
                                "-0.025em",
                        }}
                    >
                        Monthly Tour Plan
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            mt: 0.5,

                            color:
                                theme.palette
                                    .text.secondary,
                        }}
                    >
                        Plan your working
                        days and locations.
                        Submit to your manager
                        for approval.
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        width: {
                            xs: "100%",
                            lg: "auto",
                        },
                    }}
                >
                    <Box
                        sx={{
                            minHeight: 40,

                            px: 1.75,

                            display: "flex",
                            alignItems:
                                "center",

                            borderRadius:
                                theme.shape
                                    .borderRadius,

                            backgroundColor:
                                alpha(
                                    currentStatus.color,
                                    0.07
                                ),

                            border:
                                `1px solid ${alpha(
                                    currentStatus.color,
                                    0.14
                                )}`,
                        }}
                    >
                        <Box
                            sx={{
                                width: 7,
                                height: 7,

                                borderRadius:
                                    "50%",

                                backgroundColor:
                                    currentStatus.color,

                                mr: 0.9,
                            }}
                        />

                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight:
                                    650,

                                color:
                                    theme.palette
                                        .text.primary,
                            }}
                        >
                            {
                                currentStatus.label
                            }
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={
                            <SaveOutlined />
                        }
                        onClick={handleSaveDraft}
                        disabled={!canEdit || busy}
                        sx={{
                            minHeight: 40,
                            px: 2,
                        }}
                    >
                        Save Draft
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={
                            <SendRounded />
                        }
                        onClick={
                            handleSubmit
                        }
                        disabled={!canEdit || busy || !isPlanComplete}
                        sx={{
                            minHeight: 40,
                            px: 2,
                        }}
                    >
                        {planStatus === "rejected"
                            ? "Resubmit for Approval"
                            : "Submit for Approval"}
                    </Button>

                    {canApprove && (
                        <>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleApprove}
                                disabled={busy}
                                sx={{ minHeight: 40, px: 2 }}
                            >
                                Approve
                            </Button>

                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleReject}
                                disabled={busy}
                                sx={{ minHeight: 40, px: 2 }}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </Stack>
            </Stack>

            <FormControl size="small" sx={{ minWidth: 260, mb: 2 }}>
                <InputLabel>Acting user (temporary)</InputLabel>

                <Select
                    label="Acting user (temporary)"
                    value={
                        users.some((u) => u.id === actingUserId)
                            ? actingUserId
                            : ""
                    }
                    onChange={handleActingUserChange}
                >
                    {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                            {user.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* =================================================
                APPROVAL HISTORY
            ================================================= */}

            <Box
                sx={{
                    backgroundColor:
                        theme.palette
                            .background.paper,

                    border:
                        `1px solid ${alpha(
                            theme.palette
                                .divider,
                            0.65
                        )}`,

                    borderRadius:
                        theme.card.radius,

                    boxShadow:
                        theme.card.shadow,

                    mb: 2,

                    p: {
                        xs: 1.75,
                        md: 2,
                    },
                }}
            >
                <Stack
                    direction={{
                        xs: "column",
                        md: "row",
                    }}
                    alignItems={{
                        xs: "flex-start",
                        md: "center",
                    }}
                    spacing={{
                        xs: 1.75,
                        md: 0,
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 750,

                            color:
                                theme.palette
                                    .text.primary,

                            mr: {
                                md: 2.5,
                            },

                            whiteSpace:
                                "nowrap",
                        }}
                    >
                        Approval History
                    </Typography>

                    <Stack
                        direction={{
                            xs: "column",
                            md: "row",
                        }}
                        alignItems={{
                            xs: "flex-start",
                            md: "center",
                        }}
                        spacing={{
                            xs: 1.5,
                            md: 0,
                        }}
                        sx={{
                            flex: 1,
                            width: "100%",
                        }}
                    >
                        <ApprovalStep
                            step="draft"
                            icon={
                                <DescriptionOutlined
                                    sx={{
                                        fontSize: 19,
                                    }}
                                />
                            }
                            title="Draft"
                            description="Plan saved as draft"
                        />

                        <Typography
                            sx={{
                                display: {
                                    xs: "none",
                                    md: "block",
                                },

                                px: 1.5,

                                color:
                                    theme.palette
                                        .divider,

                                fontSize: 18,
                            }}
                        >
                            →
                        </Typography>

                        <ApprovalStep
                            step="submitted"
                            icon={
                                <SendRounded
                                    sx={{
                                        fontSize: 18,
                                    }}
                                />
                            }
                            title="Submitted"
                            description="Sent to manager"
                        />

                        <Typography
                            sx={{
                                display: {
                                    xs: "none",
                                    md: "block",
                                },

                                px: 1.5,

                                color:
                                    theme.palette
                                        .divider,

                                fontSize: 18,
                            }}
                        >
                            →
                        </Typography>

                        <ApprovalStep
                            step="approved"
                            icon={
                                <CheckCircleOutlineRounded
                                    sx={{
                                        fontSize: 19,
                                    }}
                                />
                            }
                            title="Approved"
                            description="Plan approved"
                        />

                        <Typography
                            sx={{
                                display: {
                                    xs: "none",
                                    md: "block",
                                },

                                px: 1.5,

                                color:
                                    theme.palette
                                        .divider,

                                fontSize: 18,
                            }}
                        >
                            /
                        </Typography>

                        <ApprovalStep
                            step="rejected"
                            icon={
                                <CloseRounded
                                    sx={{
                                        fontSize: 19,
                                    }}
                                />
                            }
                            title="Rejected"
                            description="Returned for revision"
                        />
                    </Stack>
                </Stack>
            </Box>

            {/* =================================================
                CALENDAR
            ================================================= */}

            <Box
                sx={{
                    backgroundColor:
                        theme.palette
                            .background.paper,

                    border:
                        `1px solid ${alpha(
                            theme.palette
                                .primary.main,
                            0.12
                        )}`,

                    borderRadius:
                        theme.card.radius,

                    boxShadow:
                        theme.card.shadow,

                    overflow: "hidden",
                }}
            >
                {/* =================================================
                    CALENDAR TITLE HEADER
                    WHITE / CLEAN
                ================================================= */}

                <Box
                    sx={{
                        px: {
                            xs: 1.75,
                            sm: 2.5,
                            md: 3,
                        },

                        py: {
                            xs: 1.5,
                            md: 1.75,
                        },

                        backgroundColor:
                            theme.palette
                                .background.paper,

                        borderBottom:
                            `1px solid ${alpha(
                                theme.palette
                                    .divider,
                                0.7
                            )}`,
                    }}
                >
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        alignItems={{
                            xs: "flex-start",
                            sm: "center",
                        }}
                        justifyContent="space-between"
                        spacing={1.5}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight:
                                        750,

                                    color:
                                        theme
                                            .palette
                                            .primary
                                            .main,

                                    letterSpacing:
                                        "-0.02em",
                                }}
                            >
                                Monthly Tour Plan
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 0.25,

                                    color:
                                        theme
                                            .palette
                                            .text
                                            .secondary,

                                    fontSize:
                                        "0.8rem",
                                }}
                            >
                                Click any date to
                                plan your working
                                location.
                            </Typography>
                        </Box>

                        {/* MONTH NAVIGATION */}

                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                        >
                            <IconButton
                                size="small"
                                onClick={() =>
                                    calendarRef.current
                                        ?.getApi()
                                        .prev()
                                }
                                sx={{
                                    width: 34,
                                    height: 34,

                                    border:
                                        `1px solid ${alpha(
                                            theme
                                                .palette
                                                .primary
                                                .main,
                                            0.14
                                        )}`,

                                    borderRadius:
                                        theme
                                            .shape
                                            .borderRadius,

                                    color:
                                        theme
                                            .palette
                                            .text
                                            .secondary,

                                    backgroundColor:
                                        theme
                                            .palette
                                            .background
                                            .paper,

                                    "&:hover": {
                                        color:
                                            theme
                                                .palette
                                                .primary
                                                .main,

                                        backgroundColor:
                                            alpha(
                                                theme
                                                    .palette
                                                    .primary
                                                    .main,
                                                0.06
                                            ),
                                    },
                                }}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        fontSize: 20,
                                        lineHeight: 1,
                                    }}
                                >
                                    ‹
                                </Box>
                            </IconButton>

                            <Button
                                variant="outlined"
                                onClick={() =>
                                    calendarRef.current
                                        ?.getApi()
                                        .today()
                                }
                                sx={{
                                    minWidth: 64,
                                    height: 34,

                                    px: 1.5,

                                    borderColor:
                                        alpha(
                                            theme
                                                .palette
                                                .primary
                                                .main,
                                            0.14
                                        ),

                                    color:
                                        theme
                                            .palette
                                            .text
                                            .primary,

                                    backgroundColor:
                                        theme
                                            .palette
                                            .background
                                            .paper,

                                    fontSize:
                                        "0.75rem",

                                    fontWeight: 700,

                                    textTransform:
                                        "none",
                                }}
                            >
                                Today
                            </Button>

                            <IconButton
                                size="small"
                                onClick={() =>
                                    calendarRef.current
                                        ?.getApi()
                                        .next()
                                }
                                sx={{
                                    width: 34,
                                    height: 34,

                                    border:
                                        `1px solid ${alpha(
                                            theme
                                                .palette
                                                .primary
                                                .main,
                                            0.14
                                        )}`,

                                    borderRadius:
                                        theme
                                            .shape
                                            .borderRadius,

                                    color:
                                        theme
                                            .palette
                                            .text
                                            .secondary,

                                    backgroundColor:
                                        theme
                                            .palette
                                            .background
                                            .paper,

                                    "&:hover": {
                                        color:
                                            theme
                                                .palette
                                                .primary
                                                .main,

                                        backgroundColor:
                                            alpha(
                                                theme
                                                    .palette
                                                    .primary
                                                    .main,
                                                0.06
                                            ),
                                    },
                                }}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        fontSize: 20,
                                        lineHeight: 1,
                                    }}
                                >
                                    ›
                                </Box>
                            </IconButton>
                        </Stack>
                    </Stack>
                </Box>

                {/* =================================================
                    CALENDAR GRID
                ================================================= */}

                <Box
                    sx={{
                        px: {
                            xs: 0.75,
                            sm: 1.25,
                            md: 1.5,
                        },

                        pb: 1.5,
                        pt: 0.75,

                        backgroundColor:
                            theme.palette
                                .background.paper,

                        "& .fc": {
                            fontFamily:
                                theme.typography
                                    .fontFamily,
                        },

                        "& .fc-toolbar": {
                            display: "none",
                        },

                        "& .fc-scrollgrid": {
                            border:
                                "none !important",
                        },

                        "& .fc-scrollgrid td, & .fc-scrollgrid th":
                            {
                                borderColor:
                                    alpha(
                                        theme
                                            .palette
                                            .primary
                                            .main,
                                        0.08
                                    ),
                            },

                        /* =================================================
                           MONDAY - SUNDAY HEADER
                           THEME PRIMARY COLOR
                        ================================================= */

                        "& .fc-col-header-cell":
                            {
                                backgroundColor:
                                    theme
                                        .palette
                                        .primary
                                        .main,

                                borderColor:
                                    alpha(
                                        theme
                                            .palette
                                            .primary
                                            .dark,
                                        0.25
                                    ),
                            },

                        "& .fc-col-header-cell-cushion":
                            {
                                display:
                                    "block",

                                padding:
                                    "9px 6px 10px",

                                color:
                                    theme
                                        .palette
                                        .primary
                                        .contrastText,

                                fontSize:
                                    "0.68rem",

                                fontWeight: 750,

                                letterSpacing:
                                    "0.08em",

                                textTransform:
                                    "uppercase",

                                textDecoration:
                                    "none",
                            },

                        /* =================================================
                           DAY CELLS
                        ================================================= */

                        "& .fc-daygrid-day": {
                            backgroundColor:
                                theme
                                    .palette
                                    .background
                                    .paper,

                            borderColor:
                                alpha(
                                    theme
                                        .palette
                                        .primary
                                        .main,
                                    0.09
                                ),

                            cursor: "pointer",

                            transition:
                                "background-color 160ms ease",
                        },

                        "& .fc-daygrid-day-frame":
                            {
                                minHeight: {
                                    xs: 88,
                                    sm: 96,
                                    md: 104,
                                },

                                padding: {
                                    xs: "4px",
                                    sm: "5px",
                                },
                            },

                        "& .fc-daygrid-day:hover":
                            {
                                backgroundColor:
                                    `${alpha(
                                        theme
                                            .palette
                                            .primary
                                            .main,
                                        0.035
                                    )} !important`,
                            },

                        /* =================================================
                           DATE NUMBER
                        ================================================= */

                        "& .fc-daygrid-day-top":
                            {
                                display: "flex",

                                justifyContent:
                                    "flex-end",
                            },

                        "& .fc-daygrid-day-number":
                            {
                                display: "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                width: 28,
                                height: 28,

                                margin:
                                    "4px 4px 2px 0",

                                padding: 0,

                                borderRadius:
                                    "50%",

                                color:
                                    theme
                                        .palette
                                        .text
                                        .primary,

                                fontSize:
                                    "0.72rem",

                                fontWeight: 700,

                                textDecoration:
                                    "none",
                            },

                        /* =================================================
                           OTHER MONTH
                        ================================================= */

                        "& .fc-day-other": {
                            backgroundColor:
                                alpha(
                                    theme
                                        .palette
                                        .surface
                                        .muted,
                                    0.3
                                ),
                        },

                        "& .fc-day-other .fc-daygrid-day-number":
                            {
                                color:
                                    theme
                                        .palette
                                        .text
                                        .disabled,

                                fontWeight: 550,
                            },

                        /* =================================================
                           TODAY
                        ================================================= */

                        "& .fc-day-today": {
                            backgroundColor:
                                `${alpha(
                                    theme
                                        .palette
                                        .primary
                                        .main,
                                    0.045
                                )} !important`,
                        },

                        "& .fc-day-today .fc-daygrid-day-number":
                            {
                                backgroundColor:
                                    theme
                                        .palette
                                        .primary
                                        .main,

                                color:
                                    theme
                                        .palette
                                        .primary
                                        .contrastText,

                                boxShadow:
                                    `0 3px 9px ${alpha(
                                        theme
                                            .palette
                                            .primary
                                            .main,
                                        0.22
                                    )}`,
                            },

                        /* =================================================
                           WEEKENDS
                        ================================================= */

                        "& .fc-day-sat, & .fc-day-sun":
                            {
                                backgroundColor:
                                    alpha(
                                        theme
                                            .palette
                                            .surface
                                            .muted,
                                        0.35
                                    ),
                            },

                        /* =================================================
                           EVENTS
                        ================================================= */

                        "& .fc-daygrid-event":
                            {
                                margin:
                                    "3px 3px 0",

                                padding: 0,

                                border: "none",

                                backgroundColor:
                                    "transparent !important",
                            },

                        "& .fc-event-main": {
                            padding: 0,
                        },

                        "& .tour-plan-event": {
                            width: "100%",

                            overflow:
                                "hidden",
                        },
                    }}
                >
                    <FullCalendar
                        ref={calendarRef}

                        plugins={[
                            themePlugin,
                            dayGridPlugin,
                            interactionPlugin,
                        ]}

                        initialView="dayGridMonth"

                        initialDate={
                            initialCalendarDate
                        }

                        firstDay={1}

                        headerToolbar={false}

                        events={calendarEvents}

                        dateClick={
                            handleDateClick
                        }

                        datesSet={handleDatesSet}

                        fixedWeekCount={false}

                        showNonCurrentDates={
                            true
                        }

                        height="auto"

                        contentHeight="auto"

                        dayMaxEvents={false}

                        eventDisplay="block"

                        eventContent={(
                            eventInfo
                        ) => {
                            const {
                                dayType,
                                territory,
                                area,
                            } =
                                eventInfo
                                    .event
                                    .extendedProps;

                            if (
                                dayType ===
                                "non-working"
                            ) {
                                return (
                                    <Box
                                        className="tour-plan-event"
                                        sx={{
                                            px: 0.8,
                                            py: 0.6,

                                            borderRadius:
                                                1.5,

                                            backgroundColor:
                                                alpha(
                                                    theme
                                                        .palette
                                                        .error
                                                        .main,
                                                    0.07
                                                ),

                                            border:
                                                `1px solid ${alpha(
                                                    theme
                                                        .palette
                                                        .error
                                                        .main,
                                                    0.12
                                                )}`,
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={
                                                0.65
                                            }
                                            alignItems="center"
                                        >
                                            <Box
                                                sx={{
                                                    width: 6,
                                                    height: 6,

                                                    flexShrink: 0,

                                                    borderRadius:
                                                        "50%",

                                                    backgroundColor:
                                                        theme
                                                            .palette
                                                            .error
                                                            .main,
                                                }}
                                            />

                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize:
                                                        "0.66rem",

                                                    lineHeight:
                                                        1.2,

                                                    fontWeight:
                                                        700,

                                                    color:
                                                        theme
                                                            .palette
                                                            .error
                                                            .main,

                                                    whiteSpace:
                                                        "nowrap",

                                                    overflow:
                                                        "hidden",

                                                    textOverflow:
                                                        "ellipsis",
                                                }}
                                            >
                                                Non-Working
                                            </Typography>
                                        </Stack>
                                    </Box>
                                );
                            }

                            return (
                                <Box
                                    className="tour-plan-event"
                                    sx={{
                                        px: 0.8,
                                        py: 0.6,

                                        borderRadius:
                                            1.5,

                                        backgroundColor:
                                            alpha(
                                                theme
                                                    .palette
                                                    .success
                                                    .main,
                                                0.065
                                            ),

                                        border:
                                            `1px solid ${alpha(
                                                theme
                                                    .palette
                                                    .success
                                                    .main,
                                                0.12
                                            )}`,
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={
                                            0.65
                                        }
                                        alignItems="center"
                                    >
                                        <Box
                                            sx={{
                                                width: 6,
                                                height: 6,

                                                flexShrink: 0,

                                                borderRadius:
                                                    "50%",

                                                backgroundColor:
                                                    theme
                                                        .palette
                                                        .success
                                                        .main,
                                            }}
                                        />

                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontSize:
                                                    "0.66rem",

                                                lineHeight:
                                                    1.2,

                                                fontWeight:
                                                    700,

                                                color:
                                                    theme
                                                        .palette
                                                        .success
                                                        .main,

                                                whiteSpace:
                                                    "nowrap",

                                                overflow:
                                                    "hidden",

                                                textOverflow:
                                                    "ellipsis",
                                            }}
                                        >
                                            Working
                                        </Typography>
                                    </Stack>

                                    {(territory ||
                                        area) && (
                                        <Stack
                                            direction="row"
                                            spacing={
                                                0.4
                                            }
                                            alignItems="flex-start"
                                            sx={{
                                                mt: 0.45,
                                                minWidth: 0,
                                            }}
                                        >
                                            <CalendarMonthRounded
                                                sx={{
                                                    fontSize: 11,

                                                    flexShrink: 0,

                                                    mt: "1px",

                                                    color:
                                                        theme
                                                            .palette
                                                            .text
                                                            .secondary,
                                                }}
                                            />

                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize:
                                                        "0.63rem",

                                                    lineHeight:
                                                        1.25,

                                                    color:
                                                        theme
                                                            .palette
                                                            .text
                                                            .secondary,

                                                    overflow:
                                                        "hidden",

                                                    textOverflow:
                                                        "ellipsis",

                                                    display:
                                                        "-webkit-box",

                                                    WebkitLineClamp:
                                                        2,

                                                    WebkitBoxOrient:
                                                        "vertical",
                                                }}
                                            >
                                                {
                                                    territory
                                                }

                                                {territory &&
                                                    area &&
                                                    " · "}

                                                {area}
                                            </Typography>
                                        </Stack>
                                    )}
                                </Box>
                            );
                        }}
                    />
                </Box>
            </Box>

            {/* =================================================
                COMPACT DATE DIALOG
            ================================================= */}

            <Dialog
                open={dialogOpen}
                onClose={() =>
                    setDialogOpen(false)
                }
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        width: "520px",

                        maxWidth:
                            "calc(100vw - 32px)",

                        margin: "16px",

                        borderRadius:
                            theme.card.radius,

                        boxShadow:
                            theme.card.shadow,

                        backgroundColor:
                            theme.palette
                                .background
                                .paper,

                        backgroundImage:
                            "none",

                        overflow: "hidden",
                    },
                }}
            >
                {/* DIALOG HEADER */}

                <DialogTitle
                    sx={{
                        px: 2.75,
                        pt: 2.25,
                        pb: 1.5,

                        borderBottom:
                            `1px solid ${alpha(
                                theme.palette
                                    .divider,
                                0.5
                            )}`,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 750,

                            color:
                                theme.palette
                                    .primary
                                    .main,

                            letterSpacing:
                                "-0.015em",
                        }}
                    >
                        Plan for{" "}
                        {selectedDateLabel}
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            mt: 0.25,

                            color:
                                theme.palette
                                    .text
                                    .secondary,

                            fontSize:
                                "0.78rem",
                        }}
                    >
                        {selectedDayName}
                    </Typography>
                </DialogTitle>

                {/* DIALOG CONTENT */}

                <DialogContent
                    sx={{
                        px: 2.75,
                        py: 2,
                    }}
                >
                    <Stack spacing={1.75}>
                        {/* DAY TYPE */}

                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    mb: 0.7,

                                    fontWeight: 700,

                                    color:
                                        theme
                                            .palette
                                            .text
                                            .primary,

                                    fontSize:
                                        "0.8rem",
                                }}
                            >
                                Day Type
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={1}
                            >
                                <Button
                                    fullWidth
                                    variant={
                                        dayType ===
                                        "working"
                                            ? "contained"
                                            : "outlined"
                                    }
                                    startIcon={
                                        <CheckCircleOutlineRounded />
                                    }
                                    onClick={() =>
                                        handleDayTypeChange(
                                            "working"
                                        )
                                    }
                                    sx={{
                                        height: 40,

                                        fontSize:
                                            "0.78rem",

                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Working Day
                                </Button>

                                <Button
                                    fullWidth
                                    variant={
                                        dayType ===
                                        "non-working"
                                            ? "contained"
                                            : "outlined"
                                    }
                                    startIcon={
                                        <CloseRounded />
                                    }
                                    onClick={() =>
                                        handleDayTypeChange(
                                            "non-working"
                                        )
                                    }
                                    sx={{
                                        height: 40,

                                        fontSize:
                                            "0.78rem",

                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Non-Working Day
                                </Button>
                            </Stack>
                        </Box>

                        {/* TERRITORY + AREA */}

                        {dayType ===
                            "working" && (
                            <>
                                <FormControl
                                    fullWidth
                                    required
                                    disabled={
                                        territories.length ===
                                        0
                                    }
                                    size="small"
                                >
                                    <InputLabel>
                                        Territory
                                    </InputLabel>

                                    <Select
                                        value={
                                            territory
                                        }
                                        label="Territory"
                                        onChange={
                                            handleTerritoryChange
                                        }
                                    >
                                        {territories.map(
                                            (
                                                item
                                            ) => (
                                                <MenuItem
                                                    key={
                                                        item.TerritoryId
                                                    }
                                                    value={
                                                        item.TerritoryId
                                                    }
                                                >
                                                    {
                                                        item.TerritoryName
                                                    }
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>
                                </FormControl>

                                <FormControl
                                    fullWidth
                                    required
                                    disabled={
                                        !territory ||
                                        areas.length ===
                                            0
                                    }
                                    size="small"
                                >
                                    <InputLabel>
                                        Area
                                    </InputLabel>

                                    <Select
                                        value={area}
                                        label="Area"
                                        onChange={(
                                            event
                                        ) =>
                                            setArea(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        {areas.map(
                                            (
                                                item
                                            ) => (
                                                <MenuItem
                                                    key={
                                                        item.AreaId
                                                    }
                                                    value={
                                                        item.AreaId
                                                    }
                                                >
                                                    {
                                                        item.AreaName
                                                    }
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>
                                </FormControl>
                            </>
                        )}

                        {/* REMARKS */}

                        <Box>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                maxRows={3}
                                size="small"
                                label="Remarks (Optional)"
                                value={remarks}
                                onChange={(
                                    event
                                ) =>
                                    setRemarks(
                                        event.target.value.slice(
                                            0,
                                            200
                                        )
                                    )
                                }
                                placeholder="Add any remarks for this day..."
                            />

                            <Typography
                                variant="caption"
                                sx={{
                                    display:
                                        "block",

                                    textAlign:
                                        "right",

                                    mt: 0.35,

                                    color:
                                        theme
                                            .palette
                                            .text
                                            .disabled,

                                    fontSize:
                                        "0.68rem",
                                }}
                            >
                                {remarks.length}/200
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>

                {/* DIALOG ACTIONS */}

                <DialogActions
                    sx={{
                        px: 2.75,
                        py: 1.75,

                        gap: 1,

                        borderTop:
                            `1px solid ${alpha(
                                theme.palette
                                    .divider,
                                0.5
                            )}`,
                    }}
                >
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={
                            handleCancel
                        }
                        sx={{
                            height: 40,

                            fontSize:
                                "0.78rem",

                            fontWeight:
                                650,
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={
                            <SaveOutlined />
                        }
                        onClick={
                            handleSaveDate
                        }
                        disabled={
                            dayType ===
                                "working" &&
                            (!territory ||
                                !area)
                        }
                        sx={{
                            height: 40,

                            fontSize:
                                "0.78rem",

                            fontWeight: 700,
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default TourPlan;