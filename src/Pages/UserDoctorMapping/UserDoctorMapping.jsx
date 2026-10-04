import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import KeyboardDoubleArrowLeftRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";

import {
    getUsers,
    getDoctors,
    getUserDoctorMappings,
    userDoctorMapping,
} from "./index.js";
import { getcountry, getstates, getTerritorie } from "../Territory/index";
import { getAreasByTerritory } from "../Doctors/index";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";

function getInitials(name = "") {
    return name
        .trim()
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

const WORKFLOW_STEPS = [
    {
        step: 1,
        title: "Select User",
        description: "Choose a user to map doctors.",
    },
    {
        step: 2,
        title: "Select Location",
        description: "Filter doctors by location.",
    },
    {
        step: 3,
        title: "Select Speciality",
        description: "Filter doctors by speciality.",
    },
    {
        step: 4,
        title: "Map Doctors",
        description: "Select doctors to assign.",
    },
];

function UserDoctorMapping() {
    const { showSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [territories, setTerritories] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedTerritory, setSelectedTerritory] = useState("");
    const [selectedArea, setSelectedArea] = useState("");
    const [selectedSpeciality, setSelectedSpeciality] = useState("");

    const [doctors, setDoctors] = useState([]);
    const [doctorsLoading, setDoctorsLoading] = useState(false);
    const [mappings, setMappings] = useState([]);
    const [mappingsLoading, setMappingsLoading] = useState(false);
    const [assignedDoctorIds, setAssignedDoctorIds] = useState([]);

    const [availableSearch, setAvailableSearch] = useState("");
    const [assignedSearch, setAssignedSearch] = useState("");
    const [highlightedAvailable, setHighlightedAvailable] = useState([]);
    const [highlightedAssigned, setHighlightedAssigned] = useState([]);

    const selectedUser = users.find((user) => user.userId === selectedUserId);

    const locationFiltersComplete = Boolean(
        selectedCountry && selectedState && selectedTerritory && selectedArea
    );
    const allFiltersComplete = Boolean(locationFiltersComplete && selectedSpeciality);

    // =========================================================
    // INITIAL LOAD — only the reference lists needed up front.
    // No doctor or mapping data is fetched until a user is selected.
    // =========================================================
    useEffect(() => {
        const loadInitialData = async () => {
            const [usersResult, countriesResult] = await Promise.allSettled([
                getUsers(),
                getcountry(),
            ]);

            if (usersResult.status === "fulfilled") {
                setUsers(Array.isArray(usersResult.value?.result) ? usersResult.value.result : []);
            } else {
                console.error("Error loading users", usersResult.reason);
            }

            if (countriesResult.status === "fulfilled") {
                setCountries(Array.isArray(countriesResult.value?.country) ? countriesResult.value.country : []);
            } else {
                console.error("Error loading countries", countriesResult.reason);
            }

            if (usersResult.status === "rejected" || countriesResult.status === "rejected") {
                showSnackbar("Unable to load users or countries", "error");
            }
        };

        loadInitialData();
        // showSnackbar is intentionally excluded — it is not memoized by
        // SnackbarProvider, so including it would re-run this effect (and
        // reset in-progress selections) every time any snackbar fires.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =========================================================
    // Doctors + mappings are only fetched once a user is selected —
    // never automatically on page load.
    // =========================================================
    useEffect(() => {
        setHighlightedAvailable([]);
        setHighlightedAssigned([]);

        if (!selectedUserId) {
            setDoctors([]);
            setMappings([]);
            setAssignedDoctorIds([]);
            return;
        }

        const loadUserScopedData = async () => {
            setDoctorsLoading(true);
            setMappingsLoading(true);

            const [doctorsResult, mappingsResult] = await Promise.allSettled([
                getDoctors(),
                getUserDoctorMappings(),
            ]);

            if (doctorsResult.status === "fulfilled") {
                const list = doctorsResult.value?.doctors || doctorsResult.value?.result || doctorsResult.value;
                setDoctors(Array.isArray(list) ? list : []);
            } else {
                console.error("Error loading doctors", doctorsResult.reason);
                setDoctors([]);
                showSnackbar(
                    doctorsResult.reason?.response?.data?.message ||
                        doctorsResult.reason?.message ||
                        "Failed to load doctors",
                    "error"
                );
            }
            setDoctorsLoading(false);

            if (mappingsResult.status === "fulfilled") {
                setMappings(Array.isArray(mappingsResult.value?.result) ? mappingsResult.value.result : []);
            } else {
                console.error("Error loading user doctor mappings", mappingsResult.reason);
                setMappings([]);
                showSnackbar(
                    mappingsResult.reason?.response?.data?.message ||
                        mappingsResult.reason?.message ||
                        "Failed to load assigned doctors",
                    "error"
                );
            }
            setMappingsLoading(false);
        };

        loadUserScopedData();
        // showSnackbar is intentionally excluded — see note above.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUserId]);

    useEffect(() => {
        setAssignedDoctorIds(
            mappings
                .filter((mapping) => mapping.UserId === selectedUserId)
                .map((mapping) => mapping.DoctorId)
        );
    }, [selectedUserId, mappings]);

    useEffect(() => {
        const loadStates = async () => {
            if (!selectedCountry) {
                setStates([]);
                return;
            }
            const data = await getstates(selectedCountry);
            setStates(Array.isArray(data?.states) ? data.states : []);
        };
        loadStates();
        setSelectedState("");
    }, [selectedCountry]);

    useEffect(() => {
        const loadTerritories = async () => {
            if (!selectedState) {
                setTerritories([]);
                return;
            }
            const data = await getTerritorie(selectedState);
            setTerritories(Array.isArray(data?.territories) ? data.territories : []);
        };
        loadTerritories();
        setSelectedTerritory("");
    }, [selectedState]);

    useEffect(() => {
        const loadAreas = async () => {
            if (!selectedTerritory) {
                setAreas([]);
                return;
            }
            const data = await getAreasByTerritory(selectedTerritory);
            setAreas(Array.isArray(data) ? data : []);
        };
        loadAreas();
        setSelectedArea("");
    }, [selectedTerritory]);

    const isDoctorActive = (doctor) =>
        doctor.IsActive === true ||
        doctor.IsActive === 1 ||
        doctor.IsActive === "Yes" ||
        doctor.IsActive === "YES";

    // Doctors already mapped to a DIFFERENT user must never appear as available.
    const doctorIdsAssignedElsewhere = useMemo(() => {
        return new Set(
            mappings
                .filter((mapping) => mapping.UserId !== selectedUserId)
                .map((mapping) => mapping.DoctorId)
        );
    }, [mappings, selectedUserId]);

    // Specialities are scoped to the currently selected location so the
    // dropdown only ever shows relevant options.
    const specialities = useMemo(() => {
        if (!locationFiltersComplete) return [];

        return Array.from(
            new Set(
                doctors
                    .filter(
                        (doctor) =>
                            isDoctorActive(doctor) &&
                            doctor.CountryId === selectedCountry &&
                            doctor.StateId === selectedState &&
                            doctor.TerritoryId === selectedTerritory &&
                            doctor.AreaId === selectedArea
                    )
                    .map((doctor) => doctor.Speciality)
                    .filter(Boolean)
            )
        );
    }, [doctors, locationFiltersComplete, selectedCountry, selectedState, selectedTerritory, selectedArea]);

    const availableDoctors = useMemo(() => {
        if (!selectedUserId || !allFiltersComplete) return [];

        return doctors.filter((doctor) => {
            const matchesLocation =
                doctor.CountryId === selectedCountry &&
                doctor.StateId === selectedState &&
                doctor.TerritoryId === selectedTerritory &&
                doctor.AreaId === selectedArea;
            const matchesSpeciality = doctor.Speciality === selectedSpeciality;
            const matchesSearch = `${doctor.DoctorName || ""} ${doctor.HospitalName || ""} ${doctor.Speciality || ""}`
                .toLowerCase()
                .includes(availableSearch.trim().toLowerCase());

            return (
                isDoctorActive(doctor) &&
                matchesLocation &&
                matchesSpeciality &&
                matchesSearch &&
                !assignedDoctorIds.includes(doctor.DoctorId) &&
                !doctorIdsAssignedElsewhere.has(doctor.DoctorId)
            );
        });
    }, [
        doctors,
        selectedUserId,
        allFiltersComplete,
        selectedCountry,
        selectedState,
        selectedTerritory,
        selectedArea,
        selectedSpeciality,
        availableSearch,
        assignedDoctorIds,
        doctorIdsAssignedElsewhere,
    ]);

    const assignedDoctors = useMemo(() => {
        if (!selectedUserId) return [];

        return doctors.filter((doctor) =>
            assignedDoctorIds.includes(doctor.DoctorId) &&
            `${doctor.DoctorName || ""} ${doctor.HospitalName || ""} ${doctor.Speciality || ""}`
                .toLowerCase()
                .includes(assignedSearch.trim().toLowerCase())
        );
    }, [doctors, selectedUserId, assignedDoctorIds, assignedSearch]);


    const toggleHighlight = (list, setList, doctorId) => {
        setList((current) =>
            current.includes(doctorId)
                ? current.filter((id) => id !== doctorId)
                : [...current, doctorId]
        );
    };

    const moveToAssigned = () => {
        setAssignedDoctorIds((current) => Array.from(new Set([...current, ...highlightedAvailable])));
        setHighlightedAvailable([]);
    };

    const moveAllToAssigned = () => {
        setAssignedDoctorIds((current) =>
            Array.from(new Set([...current, ...availableDoctors.map((doctor) => doctor.DoctorId)]))
        );
        setHighlightedAvailable([]);
    };

    const moveToAvailable = () => {
        setAssignedDoctorIds((current) => current.filter((id) => !highlightedAssigned.includes(id)));
        setHighlightedAssigned([]);
    };

    const moveAllToAvailable = () => {
        setAssignedDoctorIds([]);
        setHighlightedAssigned([]);
    };

    const handleClearFilters = () => {
        setSelectedCountry("");
        setSelectedState("");
        setSelectedTerritory("");
        setSelectedArea("");
        setSelectedSpeciality("");
    };

    const handleReset = () => {
        setAssignedDoctorIds(
            mappings
                .filter((mapping) => mapping.UserId === selectedUserId)
                .map((mapping) => mapping.DoctorId)
        );
        setHighlightedAvailable([]);
        setHighlightedAssigned([]);
        setAvailableSearch("");
        setAssignedSearch("");
    };

    const handleSaveMapping = async () => {
        if (!selectedUserId) {
            showSnackbar("Select a user first", "error");
            return;
        }

        const payload = {
            userId: selectedUserId,
            mappings: assignedDoctorIds.map((doctorId) => ({ doctorId })),
        };

        try {
            const response = await userDoctorMapping(payload);
            showSnackbar(response?.message || "Mapping saved successfully", "success");

            // Fresh page for the next mapping — clear user, filters and selections.
            setSelectedUserId("");
            setSelectedCountry("");
            setSelectedState("");
            setSelectedTerritory("");
            setSelectedArea("");
            setSelectedSpeciality("");
            setAvailableSearch("");
            setAssignedSearch("");
            setHighlightedAvailable([]);
            setHighlightedAssigned([]);

            navigate("/admin/UserDoctorMapping/list");
        } catch (error) {
            console.error("Error saving user doctor mapping", error);
            showSnackbar(
                error.response?.data?.message || "Failed to save user doctor mapping",
                "error"
            );
        }
    };

    const newDoctorsToAssign = assignedDoctorIds.filter(
        (id) => !mappings.some((mapping) => mapping.UserId === selectedUserId && mapping.DoctorId === id)
    ).length;

    return (
        <Box>
            {/* ================================================= */}
            {/* PAGE HEADER */}
            {/* ================================================= */}

            <Box
                sx={{
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1.5,
                    mb: 2.5,
                }}
            >
                <Box>
                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: "text.primary" }}>
                        User Doctor Mapping
                    </Typography>
                    <Typography sx={{ mt: 0.35, fontSize: 13, color: "text.secondary" }}>
                        Assign and manage doctors for field users
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            fontSize: 12.5,
                            color: "text.secondary",
                        }}
                    >
                        <HomeRoundedIcon sx={{ fontSize: 16 }} />
                        <ChevronRightRounded sx={{ fontSize: 15 }} />
                        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                            Masters
                        </Typography>
                        <ChevronRightRounded sx={{ fontSize: 15 }} />
                        <Typography sx={{ fontSize: 12.5, color: "primary.main", fontWeight: 700 }}>
                            User Doctor Mapping
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<HelpOutlineRoundedIcon sx={{ fontSize: 17 }} />}
                        sx={{
                            textTransform: "none",
                            borderRadius: 999,
                            borderColor: "divider",
                            color: "text.secondary",
                        }}
                    >
                        Help
                    </Button>
                </Box>
            </Box>

            {/* ================================================= */}
            {/* FOUR-STEP WORKFLOW BAR */}
            {/* ================================================= */}

            <Paper
                elevation={0}
                sx={(theme) => ({
                    display: "flex",
                    alignItems: "stretch",
                    border: "1px solid",
                    borderColor: theme.palette.border.default,
                    borderRadius: theme.card.radius,
                    mb: 2.5,
                    overflow: "hidden",
                })}
            >
                {WORKFLOW_STEPS.map((item, index) => (
                    <Box
                        key={item.step}
                        sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.5,
                            px: { xs: 2, sm: 3 },
                            py: 2.5,
                            borderRight: index < WORKFLOW_STEPS.length - 1 ? "1px solid" : "none",
                            borderColor: "divider",
                        }}
                    >
                        <Box
                            sx={(theme) => ({
                                width: 34,
                                height: 34,
                                flexShrink: 0,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                                fontWeight: 700,
                                backgroundColor:
                                    item.step === 1
                                        ? theme.palette.primary.main
                                        : theme.palette.surface.muted,
                                color:
                                    item.step === 1
                                        ? theme.palette.primary.contrastText
                                        : theme.palette.text.secondary,
                            })}
                        >
                            {item.step}
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                                {item.title}
                            </Typography>
                            <Typography sx={{ mt: 0.25, fontSize: 12, color: "text.secondary" }}>
                                {item.description}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Paper>

            {/* ================================================= */}
            {/* USER INFORMATION CARD */}
            {/* ================================================= */}

            <Paper
                elevation={0}
                sx={(theme) => ({
                    border: "1px solid",
                    borderColor: theme.palette.border.default,
                    borderRadius: theme.card.radius,
                    p: { xs: 2, sm: 3 },
                    mb: 2.5,
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 3,
                })}
            >
                <Box sx={{ minWidth: 260 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Select User *</InputLabel>
                        <Select
                            label="Select User *"
                            value={selectedUserId}
                            onChange={(event) => setSelectedUserId(event.target.value)}
                        >
                            {users.map((user) => (
                                <MenuItem key={user.userId} value={user.userId}>
                                    {user.UserName} {user.SldName ? `(${user.SldName})` : ""}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

                {selectedUser && (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box
                                sx={(theme) => ({
                                    width: 46,
                                    height: 46,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    backgroundColor: theme.palette.brand.terracottaSoft,
                                    color: theme.palette.primary.main,
                                    flexShrink: 0,
                                })}
                            >
                                {getInitials(selectedUser.UserName)}
                            </Box>

                            <Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "text.primary" }}>
                                        {selectedUser.UserName}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label="Active"
                                        color="success"
                                        sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>Designation</Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>
                                {selectedUser.SldName || "-"}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>Division</Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>
                                {selectedUser.DivisionName || "-"}
                            </Typography>
                        </Box>
                    </>
                )}
            </Paper>

            {/* ================================================= */}
            {/* LOCATION + SPECIALITY FILTER CARD */}
            {/* ================================================= */}

            <Paper
                elevation={0}
                sx={(theme) => ({
                    border: "1px solid",
                    borderColor: theme.palette.border.default,
                    borderRadius: theme.card.radius,
                    p: { xs: 2, sm: 3 },
                    mb: 2.5,
                })}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                        flexWrap: "wrap",
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FilterAltRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                            Location & Speciality Filters
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RestartAltRoundedIcon sx={{ fontSize: 17 }} />}
                        onClick={handleClearFilters}
                        sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary" }}
                    >
                        Clear Filters
                    </Button>
                </Box>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                            md: "repeat(5, minmax(0, 1fr))",
                        },
                        gap: 1.5,
                    }}
                >
                    <FormControl fullWidth size="small">
                        <InputLabel>Country</InputLabel>
                        <Select
                            label="Country"
                            value={selectedCountry}
                            onChange={(event) => setSelectedCountry(event.target.value)}
                        >
                            {countries.map((item) => (
                                <MenuItem key={item.CountryId} value={item.CountryId}>{item.CountryName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" disabled={!selectedCountry}>
                        <InputLabel>State</InputLabel>
                        <Select
                            label="State"
                            value={selectedState}
                            onChange={(event) => setSelectedState(event.target.value)}
                        >
                            {states.map((item) => (
                                <MenuItem key={item.StateId} value={item.StateId}>{item.StateName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" disabled={!selectedState}>
                        <InputLabel>Territory</InputLabel>
                        <Select
                            label="Territory"
                            value={selectedTerritory}
                            onChange={(event) => setSelectedTerritory(event.target.value)}
                        >
                            {territories.map((item) => (
                                <MenuItem key={item.TerritoryId} value={item.TerritoryId}>{item.TerritoryName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" disabled={!selectedTerritory}>
                        <InputLabel>Area</InputLabel>
                        <Select
                            label="Area"
                            value={selectedArea}
                            onChange={(event) => setSelectedArea(event.target.value)}
                        >
                            {areas.map((item) => (
                                <MenuItem key={item.AreaId} value={item.AreaId}>{item.AreaName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" disabled={!locationFiltersComplete}>
                        <InputLabel>Speciality</InputLabel>
                        <Select
                            label="Speciality"
                            value={selectedSpeciality}
                            onChange={(event) => setSelectedSpeciality(event.target.value)}
                        >
                            {specialities.map((item) => (
                                <MenuItem key={item} value={item}>{item}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* ================================================= */}
            {/* DOCTOR MAPPING AREA */}
            {/* ================================================= */}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 1.5,
                    flexDirection: { xs: "column", lg: "row" },
                    mb: 2.5,
                }}
            >
                {/* AVAILABLE DOCTORS */}
                <Paper
                    elevation={0}
                    sx={(theme) => ({
                        flex: 1,
                        minWidth: 0,
                        border: "1px solid",
                        borderColor: theme.palette.border.default,
                        borderRadius: theme.card.radius,
                        overflow: "hidden",
                    })}
                >
                    <Box
                        sx={(theme) => ({
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 2,
                            py: 1.5,
                            backgroundColor: theme.palette.brand.terracottaMuted,
                            borderBottom: "1px solid",
                            borderColor: theme.palette.border.subtle,
                        })}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                            <PeopleAltRoundedIcon sx={{ fontSize: 19, color: "primary.main" }} />
                            <Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                                    Available Doctors
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                    Doctors available for mapping (not assigned to this user)
                                </Typography>
                            </Box>
                        </Box>

                        <Chip
                            size="small"
                            label={`${availableDoctors.length} Doctors`}
                            sx={{ fontWeight: 700, backgroundColor: "background.paper" }}
                        />
                    </Box>

                    <Box sx={{ p: 1.5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by doctor name, hospital or speciality..."
                            value={availableSearch}
                            onChange={(event) => setAvailableSearch(event.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                                ),
                            }}
                        />
                    </Box>

                    <TableContainer sx={{ maxHeight: 300 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox" />
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Doctor Name</TableCell>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Speciality</TableCell>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Hospital / Clinic</TableCell>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Location</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {availableDoctors.map((doctor) => (
                                    <TableRow key={doctor.DoctorId} hover selected={highlightedAvailable.includes(doctor.DoctorId)}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                size="small"
                                                checked={highlightedAvailable.includes(doctor.DoctorId)}
                                                onChange={() => toggleHighlight(highlightedAvailable, setHighlightedAvailable, doctor.DoctorId)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}>
                                                {doctor.DoctorName}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                                {doctor.Qualification}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {doctor.Speciality && (
                                                <Chip
                                                    size="small"
                                                    label={doctor.Speciality}
                                                    sx={(theme) => ({
                                                        height: 20,
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        backgroundColor: theme.palette.brand.terracottaSoft,
                                                        color: theme.palette.primary.main,
                                                    })}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 12.5 }}>{doctor.HospitalName || "-"}</TableCell>
                                        <TableCell sx={{ fontSize: 12.5 }}>
                                            {[doctor.AreaName, doctor.TerritoryName].filter(Boolean).join(" / ") || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {availableDoctors.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                            {!selectedUserId
                                                ? "Select a user to continue."
                                                : doctorsLoading
                                                    ? "Loading doctors..."
                                                    : !allFiltersComplete
                                                        ? "Select location and speciality to view available doctors."
                                                        : "No doctors found for the selected filters."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box
                        sx={(theme) => ({
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 2,
                            py: 1.25,
                            borderTop: "1px solid",
                            borderColor: theme.palette.border.subtle,
                        })}
                    >
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "primary.main" }}>
                            {highlightedAvailable.length} doctor(s) selected
                        </Typography>
                    </Box>
                </Paper>

                {/* TRANSFER CONTROLS */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "row", lg: "column" },
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        px: { xs: 0, lg: 1 },
                        py: { xs: 1, lg: 0 },
                    }}
                >
                    <Tooltip title="Move selected to assigned">
                        <IconButton
                            onClick={moveToAssigned}
                            disabled={highlightedAvailable.length === 0}
                            sx={(theme) => ({
                                border: "1px solid",
                                borderColor: theme.palette.primary.main,
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                borderRadius: 1.5,
                                "&:hover": { backgroundColor: theme.palette.primary.dark },
                            })}
                        >
                            <ChevronRightRounded />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Move all to assigned">
                        <IconButton
                            onClick={moveAllToAssigned}
                            disabled={availableDoctors.length === 0}
                            sx={(theme) => ({
                                border: "1px solid",
                                borderColor: theme.palette.border.default,
                                borderRadius: 1.5,
                                color: "text.secondary",
                            })}
                        >
                            <KeyboardDoubleArrowRightRoundedIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Move selected to available">
                        <IconButton
                            onClick={moveToAvailable}
                            disabled={highlightedAssigned.length === 0}
                            sx={(theme) => ({
                                border: "1px solid",
                                borderColor: theme.palette.border.default,
                                borderRadius: 1.5,
                                color: "text.secondary",
                            })}
                        >
                            <ChevronLeftRounded />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Move all to available">
                        <IconButton
                            onClick={moveAllToAvailable}
                            disabled={assignedDoctorIds.length === 0}
                            sx={(theme) => ({
                                border: "1px solid",
                                borderColor: theme.palette.border.default,
                                borderRadius: 1.5,
                                color: "text.secondary",
                            })}
                        >
                            <KeyboardDoubleArrowLeftRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* ASSIGNED DOCTORS */}
                <Paper
                    elevation={0}
                    sx={(theme) => ({
                        flex: 1,
                        minWidth: 0,
                        border: "1px solid",
                        borderColor: theme.palette.border.default,
                        borderRadius: theme.card.radius,
                        overflow: "hidden",
                    })}
                >
                    <Box
                        sx={(theme) => ({
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 2,
                            py: 1.5,
                            backgroundColor: theme.palette.brand.sageSoft,
                            borderBottom: "1px solid",
                            borderColor: theme.palette.border.subtle,
                        })}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                            <GroupRoundedIcon sx={{ fontSize: 19, color: "brand.sageDark" }} />
                            <Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                                    Assigned Doctors
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                    Doctors already assigned to {selectedUser?.UserName || "this user"}
                                </Typography>
                            </Box>
                        </Box>

                        <Chip
                            size="small"
                            label={`${assignedDoctors.length} Doctors`}
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 700, backgroundColor: "background.paper" }}
                        />
                    </Box>

                    <Box sx={{ p: 1.5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search assigned doctors..."
                            value={assignedSearch}
                            onChange={(event) => setAssignedSearch(event.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                                ),
                            }}
                        />
                    </Box>

                    <TableContainer sx={{ maxHeight: 300 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox" />
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Doctor Name</TableCell>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Speciality</TableCell>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Hospital / Clinic</TableCell>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Location</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assignedDoctors.map((doctor) => (
                                    <TableRow key={doctor.DoctorId} hover selected={highlightedAssigned.includes(doctor.DoctorId)}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                size="small"
                                                checked={highlightedAssigned.includes(doctor.DoctorId)}
                                                onChange={() => toggleHighlight(highlightedAssigned, setHighlightedAssigned, doctor.DoctorId)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}>
                                                {doctor.DoctorName}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                                {doctor.Qualification}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {doctor.Speciality && (
                                                <Chip
                                                    size="small"
                                                    label={doctor.Speciality}
                                                    sx={(theme) => ({
                                                        height: 20,
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        backgroundColor: theme.palette.brand.terracottaSoft,
                                                        color: theme.palette.primary.main,
                                                    })}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 12.5 }}>{doctor.HospitalName || "-"}</TableCell>
                                        <TableCell sx={{ fontSize: 12.5 }}>
                                            {[doctor.AreaName, doctor.TerritoryName].filter(Boolean).join(" / ") || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {assignedDoctors.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                            {!selectedUserId
                                                ? "Select a user to continue."
                                                : mappingsLoading
                                                    ? "Loading assigned doctors..."
                                                    : "No doctors assigned yet."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            {/* ================================================= */}
            {/* MAPPING SUMMARY */}
            {/* ================================================= */}

            <Paper
                elevation={0}
                sx={(theme) => ({
                    border: "1px solid",
                    borderColor: theme.palette.border.default,
                    borderRadius: theme.card.radius,
                    p: { xs: 2, sm: 2.5 },
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 3,
                })}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 200 }}>
                    <Box
                        sx={(theme) => ({
                            width: 38,
                            height: 38,
                            flexShrink: 0,
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: theme.palette.brand.terracottaSoft,
                            color: theme.palette.primary.main,
                        })}
                    >
                        <AssignmentRoundedIcon sx={{ fontSize: 19 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>
                            Mapping Summary
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                            Review your selections before saving.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, flex: 1 }}>
                    <Box>
                        <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>User</Typography>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}>
                            {selectedUser?.UserName || "-"}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>Territory</Typography>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}>
                            {territories.find((item) => item.TerritoryId === selectedTerritory)?.TerritoryName || "-"}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>Area</Typography>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}>
                            {areas.find((item) => item.AreaId === selectedArea)?.AreaName || "-"}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>Speciality</Typography>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}>
                            {selectedSpeciality || "-"}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>New Doctors to Assign</Typography>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}>
                            {newDoctorsToAssign}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1.25, ml: "auto" }}>
                    <Button
                        variant="outlined"
                        onClick={handleReset}
                        startIcon={<RestartAltRoundedIcon sx={{ fontSize: 17 }} />}
                        sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary" }}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveMapping}
                        sx={{ textTransform: "none" }}
                    >
                        Save Mapping
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default UserDoctorMapping;


