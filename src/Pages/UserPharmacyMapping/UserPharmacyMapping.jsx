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
    getPharmacy,
    getUserPharmacyMappings,
    userPharmacyMapping,
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
        description: "Choose a user to map pharmacies.",
    },
    {
        step: 2,
        title: "Select Location",
        description: "Filter pharmacies by location.",
    },
    {
        step: 3,
        title: "Select Pharmacies",
        description: "Select pharmacies to assign.",
    },
    {
        step: 4,
        title: "Map Pharmacies",
        description: "Review and save the assignment.",
    },
];

function UserPharmacyMapping() {
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

    const [pharmacy, setPharmacy] = useState([]);
    const [pharmacyLoading, setPharmacyLoading] = useState(false);
    const [mappings, setMappings] = useState([]);
    const [mappingsLoading, setMappingsLoading] = useState(false);
    const [assignedPharmacyIds, setAssignedPharmacyIds] = useState([]);

    const [availableSearch, setAvailableSearch] = useState("");
    const [assignedSearch, setAssignedSearch] = useState("");
    const [highlightedAvailable, setHighlightedAvailable] = useState([]);
    const [highlightedAssigned, setHighlightedAssigned] = useState([]);

    const selectedUser = users.find((user) => user.userId === selectedUserId);

    const locationFiltersComplete = Boolean(
        selectedCountry && selectedState && selectedTerritory && selectedArea
    );

    useEffect(() => {
        const loadInitialData = async () => {
            const [usersResult, countriesResult] = await Promise.allSettled([
                getUsers(),
                getcountry(),
            ]);

            if (usersResult.status === "fulfilled") {
                setUsers(
                    Array.isArray(usersResult.value?.result)
                        ? usersResult.value.result
                        : []
                );
            } else {
                console.error("Error loading users", usersResult.reason);
            }

            if (countriesResult.status === "fulfilled") {
                setCountries(
                    Array.isArray(countriesResult.value?.country)
                        ? countriesResult.value.country
                        : []
                );
            } else {
                console.error("Error loading countries", countriesResult.reason);
            }

            if (
                usersResult.status === "rejected" ||
                countriesResult.status === "rejected"
            ) {
                showSnackbar("Unable to load users or countries", "error");
            }
        };

        loadInitialData();
        // showSnackbar is intentionally excluded because it is not memoized.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setHighlightedAvailable([]);
        setHighlightedAssigned([]);

        if (!selectedUserId) {
            setPharmacy([]);
            setMappings([]);
            setAssignedPharmacyIds([]);
            return;
        }

        const loadUserScopedData = async () => {
            setPharmacyLoading(true);
            setMappingsLoading(true);

            const [pharmacyResult, mappingsResult] = await Promise.allSettled([
                getPharmacy(),
                getUserPharmacyMappings(),
            ]);

            if (pharmacyResult.status === "fulfilled") {
                const list =
                    pharmacyResult.value?.pharmacy ||
                    pharmacyResult.value?.result ||
                    pharmacyResult.value;

                setPharmacy(Array.isArray(list) ? list : []);
            } else {
                console.error("Error loading pharmacy", pharmacyResult.reason);
                setPharmacy([]);
                showSnackbar(
                    pharmacyResult.reason?.response?.data?.message ||
                        pharmacyResult.reason?.message ||
                        "Failed to load pharmacy",
                    "error"
                );
            }

            setPharmacyLoading(false);

            if (mappingsResult.status === "fulfilled") {
                setMappings(
                    Array.isArray(mappingsResult.value?.result)
                        ? mappingsResult.value.result
                        : []
                );
            } else {
                console.error(
                    "Error loading user pharmacy mappings",
                    mappingsResult.reason
                );
                setMappings([]);
                showSnackbar(
                    mappingsResult.reason?.response?.data?.message ||
                        mappingsResult.reason?.message ||
                        "Failed to load assigned pharmacies",
                    "error"
                );
            }

            setMappingsLoading(false);
        };

        loadUserScopedData();
        // showSnackbar is intentionally excluded because it is not memoized.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUserId]);

    useEffect(() => {
        setAssignedPharmacyIds(
            mappings
                .filter((mapping) => mapping.UserId === selectedUserId)
                .map((mapping) => mapping.PharmacyId)
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
            setTerritories(
                Array.isArray(data?.territories) ? data.territories : []
            );
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

    const isPharmacyActive = (item) =>
        item.IsActive === true ||
        item.IsActive === 1 ||
        item.IsActive === "Yes" ||
        item.IsActive === "YES";

    const pharmacyIdsAssignedElsewhere = useMemo(() => {
        return new Set(
            mappings
                .filter((mapping) => mapping.UserId !== selectedUserId)
                .map((mapping) => mapping.PharmacyId)
        );
    }, [mappings, selectedUserId]);

    const availablePharmacies = useMemo(() => {
        if (!selectedUserId || !locationFiltersComplete) return [];

        return pharmacy.filter((item) => {
            const matchesLocation =
                item.CountryId === selectedCountry &&
                item.StateId === selectedState &&
                item.TerritoryId === selectedTerritory &&
                item.AreaId === selectedArea;

            const matchesSearch = `${item.PharmacyName || ""} ${
                item.OwnerName || ""
            } ${item.ContactNumber || ""}`
                .toLowerCase()
                .includes(availableSearch.trim().toLowerCase());

            return (
                isPharmacyActive(item) &&
                matchesLocation &&
                matchesSearch &&
                !assignedPharmacyIds.includes(item.PharmacyId) &&
                !pharmacyIdsAssignedElsewhere.has(item.PharmacyId)
            );
        });
    }, [
        pharmacy,
        selectedUserId,
        locationFiltersComplete,
        selectedCountry,
        selectedState,
        selectedTerritory,
        selectedArea,
        availableSearch,
        assignedPharmacyIds,
        pharmacyIdsAssignedElsewhere,
    ]);

    const assignedPharmacies = useMemo(() => {
        if (!selectedUserId) return [];

        return pharmacy.filter(
            (item) =>
                assignedPharmacyIds.includes(item.PharmacyId) &&
                `${item.PharmacyName || ""} ${item.OwnerName || ""} ${
                    item.ContactNumber || ""
                }`
                    .toLowerCase()
                    .includes(assignedSearch.trim().toLowerCase())
        );
    }, [pharmacy, selectedUserId, assignedPharmacyIds, assignedSearch]);

    const toggleHighlight = (list, setList, pharmacyId) => {
        setList((current) =>
            current.includes(pharmacyId)
                ? current.filter((id) => id !== pharmacyId)
                : [...current, pharmacyId]
        );
    };

    const moveToAssigned = () => {
        setAssignedPharmacyIds((current) =>
            Array.from(new Set([...current, ...highlightedAvailable]))
        );
        setHighlightedAvailable([]);
    };

    const moveAllToAssigned = () => {
        setAssignedPharmacyIds((current) =>
            Array.from(
                new Set([
                    ...current,
                    ...availablePharmacies.map((item) => item.PharmacyId),
                ])
            )
        );
        setHighlightedAvailable([]);
    };

    const moveToAvailable = () => {
        setAssignedPharmacyIds((current) =>
            current.filter((id) => !highlightedAssigned.includes(id))
        );
        setHighlightedAssigned([]);
    };

    const moveAllToAvailable = () => {
        setAssignedPharmacyIds([]);
        setHighlightedAssigned([]);
    };

    const handleClearFilters = () => {
        setSelectedCountry("");
        setSelectedState("");
        setSelectedTerritory("");
        setSelectedArea("");
    };

    const handleReset = () => {
        setAssignedPharmacyIds(
            mappings
                .filter((mapping) => mapping.UserId === selectedUserId)
                .map((mapping) => mapping.PharmacyId)
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
            mappings: assignedPharmacyIds.map((pharmacyId) => ({ pharmacyId })),
        };

        try {
            const response = await userPharmacyMapping(payload);
            showSnackbar(
                response?.message || "Mapping saved successfully",
                "success"
            );

            setSelectedUserId("");
            setSelectedCountry("");
            setSelectedState("");
            setSelectedTerritory("");
            setSelectedArea("");
            setAvailableSearch("");
            setAssignedSearch("");
            setHighlightedAvailable([]);
            setHighlightedAssigned([]);

            navigate("/admin/UserPharmacyMapping/list");
        } catch (error) {
            console.error("Error saving user pharmacy mapping", error);
            showSnackbar(
                error.response?.data?.message ||
                    "Failed to save user pharmacy mapping",
                "error"
            );
        }
    };

    const newPharmaciesToAssign = assignedPharmacyIds.filter(
        (id) =>
            !mappings.some(
                (mapping) =>
                    mapping.UserId === selectedUserId &&
                    mapping.PharmacyId === id
            )
    ).length;

    return (
        <Box>
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
                        User Pharmacy Mapping
                    </Typography>
                    <Typography sx={{ mt: 0.35, fontSize: 13, color: "text.secondary" }}>
                        Assign and manage pharmacies for field users
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <HomeRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <ChevronRightRounded sx={{ fontSize: 15, color: "text.secondary" }} />
                        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                            Masters
                        </Typography>
                        <ChevronRightRounded sx={{ fontSize: 15, color: "text.secondary" }} />
                        <Typography sx={{ fontSize: 12.5, color: "primary.main", fontWeight: 700 }}>
                            User Pharmacy Mapping
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
                            Location Filters
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
                            md: "repeat(4, minmax(0, 1fr))",
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
                                <MenuItem key={item.CountryId} value={item.CountryId}>
                                    {item.CountryName}
                                </MenuItem>
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
                                <MenuItem key={item.StateId} value={item.StateId}>
                                    {item.StateName}
                                </MenuItem>
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
                                <MenuItem key={item.TerritoryId} value={item.TerritoryId}>
                                    {item.TerritoryName}
                                </MenuItem>
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
                                <MenuItem key={item.AreaId} value={item.AreaId}>
                                    {item.AreaName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 1.5,
                    flexDirection: { xs: "column", lg: "row" },
                    mb: 2.5,
                }}
            >
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
                                    Available Pharmacies
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                    Pharmacies available for mapping
                                </Typography>
                            </Box>
                        </Box>

                        <Chip
                            size="small"
                            label={`${availablePharmacies.length} Pharmacies`}
                            sx={{ fontWeight: 700, backgroundColor: "background.paper" }}
                        />
                    </Box>

                    <Box sx={{ p: 1.5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by pharmacy name, owner or contact..."
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
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Pharmacy Name</TableCell>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Owner</TableCell>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Contact</TableCell>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Location</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {availablePharmacies.map((item) => (
                                    <TableRow
                                        key={item.PharmacyId}
                                        hover
                                        selected={highlightedAvailable.includes(item.PharmacyId)}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                size="small"
                                                checked={highlightedAvailable.includes(item.PharmacyId)}
                                                onChange={() =>
                                                    toggleHighlight(
                                                        highlightedAvailable,
                                                        setHighlightedAvailable,
                                                        item.PharmacyId
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}>
                                                {item.PharmacyName}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                                {item.Address || "-"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 12.5 }}>{item.OwnerName || "-"}</TableCell>
                                        <TableCell sx={{ fontSize: 12.5 }}>{item.ContactNumber || "-"}</TableCell>
                                        <TableCell sx={{ fontSize: 12.5 }}>
                                            {[item.AreaName, item.TerritoryName].filter(Boolean).join(" / ") || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {availablePharmacies.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                            {!selectedUserId
                                                ? "Select a user to continue."
                                                : pharmacyLoading
                                                    ? "Loading pharmacies..."
                                                    : !locationFiltersComplete
                                                        ? "Select country, state, territory and area to view pharmacies."
                                                        : "No pharmacies found for the selected filters."}
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
                            {highlightedAvailable.length} pharmacy(s) selected
                        </Typography>
                    </Box>
                </Paper>

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
                            disabled={availablePharmacies.length === 0}
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
                            disabled={assignedPharmacyIds.length === 0}
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
                                    Assigned Pharmacies
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                    Pharmacies already assigned to {selectedUser?.UserName || "this user"}
                                </Typography>
                            </Box>
                        </Box>

                        <Chip
                            size="small"
                            label={`${assignedPharmacies.length} Pharmacies`}
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 700, backgroundColor: "background.paper" }}
                        />
                    </Box>

                    <Box sx={{ p: 1.5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search assigned pharmacies..."
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
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Pharmacy Name</TableCell>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Owner</TableCell>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Contact</TableCell>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Location</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assignedPharmacies.map((item) => (
                                    <TableRow
                                        key={item.PharmacyId}
                                        hover
                                        selected={highlightedAssigned.includes(item.PharmacyId)}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                size="small"
                                                checked={highlightedAssigned.includes(item.PharmacyId)}
                                                onChange={() =>
                                                    toggleHighlight(
                                                        highlightedAssigned,
                                                        setHighlightedAssigned,
                                                        item.PharmacyId
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}>
                                                {item.PharmacyName}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                                {item.Address || "-"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 12.5 }}>{item.OwnerName || "-"}</TableCell>
                                        <TableCell sx={{ fontSize: 12.5 }}>{item.ContactNumber || "-"}</TableCell>
                                        <TableCell sx={{ fontSize: 12.5 }}>
                                            {[item.AreaName, item.TerritoryName].filter(Boolean).join(" / ") || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {assignedPharmacies.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                            {!selectedUserId
                                                ? "Select a user to continue."
                                                : mappingsLoading
                                                    ? "Loading assigned pharmacies..."
                                                    : "No pharmacies assigned yet."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

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
                        <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>New Pharmacies to Assign</Typography>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}>
                            {newPharmaciesToAssign}
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

export default UserPharmacyMapping;
