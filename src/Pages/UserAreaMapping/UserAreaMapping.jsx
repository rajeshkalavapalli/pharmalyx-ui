import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import {
    getAreas,
    getTerritories,
    getUserAreaMappings,
    getUsers,
    userAreaMaping,
} from "./index.js";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";


function UserAreaMapping() {
    const navigate = useNavigate();
    const location = useLocation();

    const mode = location.state?.mode || "create";

    const isViewMode = mode === "view";
    const isEditMode = mode === "edit";

    const toIdArray = (value) => {
        if (Array.isArray(value)) {
            return value;
        }

        if (typeof value === "string") {
            return value
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean);
        }

        return [];
    };

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [territories, setTerritories] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedTerritories, setSelectedTerritories] = useState([]);
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [territorySearch, setTerritorySearch] = useState("");
    const [areaSearch, setAreaSearch] = useState("");

    const { showSnackbar } = useSnackbar();

    const selectedUserDetails = users.find(
        (user) => user.userId === selectedUser
    );


    useEffect(() => {
        const activeUserId =
            selectedUser || location.state?.userId;

        if (!selectedUser && location.state?.userId) {
            setSelectedUser(location.state.userId);
        }

        const getusers = async () => {
            try {
                const [
                    usersList,
                    territoriesList,
                    areasList,
                    mappingsList,
                ] = await Promise.all([
                    getUsers(),
                    getTerritories(),
                    getAreas(),
                    getUserAreaMappings(),
                ]);

                const userMappings = (
                    mappingsList?.result || []
                ).filter(
                    (mapping) =>
                        mapping.UserId === activeUserId
                );

                setUsers(
                    Array.isArray(usersList?.result)
                        ? usersList.result
                        : []
                );

                setSelectedTerritories([
                    ...new Set(
                        userMappings.map(
                            (mapping) =>
                                mapping.TerritoryId
                        )
                    ),
                ]);

                setSelectedAreas([
                    ...new Set(
                        userMappings.map(
                            (mapping) =>
                                mapping.AreaId
                        )
                    ),
                ]);

                setTerritories(
                    Array.isArray(
                        territoriesList?.territories
                    )
                        ? territoriesList.territories
                        : Array.isArray(
                            territoriesList
                        )
                            ? territoriesList
                            : []
                );

                setAreas(
                    Array.isArray(areasList?.result)
                        ? areasList.result
                        : Array.isArray(areasList)
                            ? areasList
                            : []
                );

            } catch (error) {
                console.error(
                    "Error loading user area mapping data",
                    error
                );

                showSnackbar(
                    "Unable to load mapping data",
                    "error"
                );
            }
        };

        getusers();

    }, [
        showSnackbar,
        location.state?.userId,
        selectedUser,
    ]);


    const mappedTerritoryIds = toIdArray(
        selectedUserDetails?.TerritoryIds
    );


    const availableTerritories = useMemo(() => {

        const byUser =
            mappedTerritoryIds.length > 0
                ? territories.filter((territory) =>
                    mappedTerritoryIds.includes(
                        territory.TerritoryId
                    )
                )
                : [];

        return byUser.filter((territory) =>
            (territory.TerritoryName || "")
                .toLowerCase()
                .includes(
                    territorySearch
                        .trim()
                        .toLowerCase()
                )
        );

    }, [
        mappedTerritoryIds,
        territories,
        territorySearch,
    ]);


    const availableAreas = useMemo(() => {

        const selectedTerritorySet =
            new Set(selectedTerritories);

        return areas.filter(
            (area) =>
                selectedTerritorySet.has(
                    area.TerritoryId
                ) &&
                (area.AreaName || "")
                    .toLowerCase()
                    .includes(
                        areaSearch
                            .trim()
                            .toLowerCase()
                    )
        );

    }, [
        areas,
        selectedTerritories,
        areaSearch,
    ]);


    const handleUserChange = (event) => {

        if (isViewMode) {
            return;
        }

        const userId = event.target.value;

        setSelectedUser(userId);

        setSelectedTerritories([]);
        setSelectedAreas([]);

        setTerritorySearch("");
        setAreaSearch("");
    };


    const toggleTerritory = (territoryId) => {

        if (isViewMode) {
            return;
        }

        const isSelected =
            selectedTerritories.includes(
                territoryId
            );

        setSelectedTerritories((current) =>
            isSelected
                ? current.filter(
                    (id) =>
                        id !== territoryId
                )
                : [
                    ...current,
                    territoryId,
                ]
        );

        if (isSelected) {

            setSelectedAreas((current) =>
                current.filter((areaId) => {

                    const area =
                        areas.find(
                            (item) =>
                                item.AreaId ===
                                areaId
                        );

                    return (
                        area?.TerritoryId !==
                        territoryId
                    );
                })
            );
        }
    };


    const toggleArea = (areaId) => {

        if (isViewMode) {
            return;
        }

        setSelectedAreas((current) =>
            current.includes(areaId)
                ? current.filter(
                    (id) =>
                        id !== areaId
                )
                : [
                    ...current,
                    areaId,
                ]
        );
    };


    const handleReset = () => {

        if (isViewMode) {
            return;
        }

        setSelectedTerritories([]);
        setSelectedAreas([]);

        setTerritorySearch("");
        setAreaSearch("");
    };


    const handleSave = async () => {

        if (isViewMode) {
            return;
        }

        if (!selectedUser) {
            showSnackbar(
                "Select a user first",
                "error"
            );
            return;
        }

        if (
            selectedTerritories.length === 0 ||
            selectedAreas.length === 0
        ) {
            showSnackbar(
                "Select at least one territory and area",
                "error"
            );
            return;
        }

        const mappings =
            selectedAreas.map((areaId) => {

                const area = areas.find(
                    (item) =>
                        item.AreaId === areaId
                );

                return {
                    territoryId:
                        area.TerritoryId,

                    areaId:
                        area.AreaId,
                };
            });


        const payload = {
            userId: selectedUser,
            mappings,
        };


        try {

            const response =
                await userAreaMaping(
                    payload
                );

            showSnackbar(
                response?.message ||
                    "Mapping saved successfully",
                "success"
            );

            navigate(
                "/admin/UserAreaMapping/list"
            );

        } catch (error) {

            console.error(
                "Error saving user area mapping",
                error
            );

            showSnackbar(
                error.response?.data?.message ||
                    "Failed to save user area mapping",
                "error"
            );
        }
    };


    return (
        <Box>

            {/* Main Mapping Card */}

            <Box
                sx={(theme) => ({
                    border: "1px solid",
                    borderColor:
                        theme.palette.border.default,
                    borderRadius: 2.5,
                    p: 3,
                    display: "flex",
                    backgroundColor:
                        theme.palette.background.paper,
                    boxShadow: theme.card.shadow,
                    overflow: "hidden",
                    flexWrap: "wrap",
                    gap: 0,
                })}
            >

                {/* User */}

                <Box
                    sx={(theme) => ({
                        flex: 1,
                        pr: 3,
                        borderRight: "1px solid",
                        borderColor:
                            theme.palette.border.subtle,
                    })}
                >

                    {/* Step Header */}

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 1,
                        }}
                    >

                        <Box
                            sx={(theme) => ({
                                width: 34,
                                height: 34,
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    "center",
                                borderRadius: "50%",
                                backgroundColor:
                                    theme.palette
                                        .primary.main,
                                color:
                                    theme.palette
                                        .primary
                                        .contrastText,
                                fontSize: 14,
                                fontWeight: 700,
                            })}
                        >
                            1
                        </Box>


                        <Typography
                            variant="h6"
                            sx={(theme) => ({
                                color:
                                    theme.palette
                                        .text.primary,
                                fontWeight: 700,
                            })}
                        >
                            Select User
                        </Typography>

                    </Box>


                    <Typography
                        variant="body2"
                        sx={(theme) => ({
                            color:
                                theme.palette
                                    .text.secondary,
                            mb: 2.5,
                        })}
                    >
                        Choose a user to map territories
                        and areas.
                    </Typography>


                    {/* User Select */}

                    <FormControl fullWidth>

                        <InputLabel>
                            Select User
                        </InputLabel>

                        <Select
                            label="Select User"
                            value={selectedUser}
                            onChange={
                                handleUserChange
                            }
                            disabled={isViewMode}
                        >

                            {users.map((user) => (

                                <MenuItem
                                    key={user.userId}
                                    value={user.userId}
                                >
                                    {user.UserName}
                                </MenuItem>

                            ))}

                        </Select>

                    </FormControl>


                    {/* User Details */}

                    <Box
                        sx={(theme) => ({
                            mt: 3,
                            p: 2.25,
                            border: "1px solid",
                            borderColor:
                                theme.palette
                                    .border.subtle,
                            borderRadius: 2,
                            backgroundColor:
                                theme.palette
                                    .surface.subtle,
                        })}
                    >

                        <Typography
                            variant="body2"
                            sx={(theme) => ({
                                color:
                                    theme.palette
                                        .text.secondary,
                                mb: 0.5,
                            })}
                        >
                            Division
                        </Typography>


                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 600,
                                mb: 1.5,
                            }}
                        >
                            {selectedUserDetails
                                ?.DivisionName ||
                                "-"}
                        </Typography>


                        <Typography
                            variant="body2"
                            sx={(theme) => ({
                                color:
                                    theme.palette
                                        .text.secondary,
                                mb: 0.5,
                            })}
                        >
                            Designation
                        </Typography>


                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 600,
                                mb: 1.5,
                            }}
                        >
                            {selectedUserDetails
                                ?.SldName ||
                                "-"}
                        </Typography>


                        <Typography
                            variant="body2"
                            sx={(theme) => ({
                                color:
                                    theme.palette
                                        .text.secondary,
                                mb: 0.5,
                            })}
                        >
                            Status
                        </Typography>


                        <Typography
                            variant="body1"
                            sx={(theme) => ({
                                color:
                                    theme.palette
                                        .success.main,
                                fontWeight: 600,
                            })}
                        >
                            {selectedUserDetails
                                ?.Status ||
                                (
                                    selectedUserDetails
                                        ?.IsActive
                                )
                                    ? "Active"
                                    : "-"}
                        </Typography>

                    </Box>

                </Box>


                {/* Territory */}

                <Box
                    sx={(theme) => ({
                        flex: 1,
                        px: 3,
                        borderRight: "1px solid",
                        borderColor:
                            theme.palette
                                .border.subtle,
                        opacity:
                            selectedUser
                                ? 1
                                : 0.55,
                    })}
                >

                    <Box
                        sx={{
                            display: "flex",
                            alignItems:
                                "center",
                            gap: 1.25,
                            mb: 1,
                        }}
                    >

                        <Box
                            sx={(theme) => ({
                                width: 34,
                                height: 34,
                                flexShrink: 0,
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                borderRadius:
                                    "50%",
                                backgroundColor:
                                    selectedUser
                                        ? theme
                                            .palette
                                            .primary
                                            .main
                                        : theme
                                            .palette
                                            .action
                                            .disabledBackground,
                                color:
                                    selectedUser
                                        ? theme
                                            .palette
                                            .primary
                                            .contrastText
                                        : theme
                                            .palette
                                            .text
                                            .disabled,
                                fontSize: 14,
                                fontWeight: 700,
                            })}
                        >
                            2
                        </Box>


                        <Typography
                            variant="h6"
                            sx={{
                                color:
                                    "text.primary",
                                fontWeight: 700,
                            }}
                        >
                            Select Territories
                        </Typography>


                        <Chip
                            size="small"
                            label={`${selectedTerritories.length} selected`}
                            sx={{
                                ml: "auto",
                            }}
                        />

                    </Box>


                    <Typography
                        variant="body2"
                        sx={{
                            color:
                                "text.secondary",
                            mb: 2.5,
                        }}
                    >
                        {selectedUser
                            ? "Select one or more territories for the user."
                            : "Select a user to continue."}
                    </Typography>


                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search territories"
                        value={
                            territorySearch
                        }
                        onChange={(event) =>
                            setTerritorySearch(
                                event.target.value
                            )
                        }
                        disabled={
                            !selectedUser ||
                            isViewMode
                        }
                        sx={{
                            mb: 1.5,
                        }}
                    />


                    <Paper
                        variant="outlined"
                        sx={{
                            maxHeight: 300,
                            overflow: "auto",
                        }}
                    >

                        {availableTerritories.map(
                            (territory) => (

                                <Box
                                    key={
                                        territory.TerritoryId
                                    }
                                    sx={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        px: 1,
                                    }}
                                >

                                    <Checkbox
                                        checked={selectedTerritories.includes(
                                            territory.TerritoryId
                                        )}
                                        onChange={() =>
                                            toggleTerritory(
                                                territory.TerritoryId
                                            )
                                        }
                                        disabled={
                                            !selectedUser ||
                                            isViewMode
                                        }
                                    />

                                    <Typography
                                        variant="body2"
                                    >
                                        {
                                            territory.TerritoryName
                                        }
                                    </Typography>

                                </Box>

                            )
                        )}


                        {availableTerritories.length ===
                            0 && (

                            <Typography
                                variant="body2"
                                sx={{
                                    p: 2,
                                    color:
                                        "text.secondary",
                                }}
                            >
                                {selectedUser
                                    ? "No territories available"
                                    : "Select a user to load territories"}
                            </Typography>

                        )}

                    </Paper>

                </Box>


                {/* Area */}

                <Box
                    sx={(theme) => ({
                        flex: 1,
                        pl: 3,
                        opacity:
                            selectedTerritories.length >
                                0
                                ? 1
                                : 0.55,
                    })}
                >

                    <Box
                        sx={{
                            display: "flex",
                            alignItems:
                                "center",
                            gap: 1.25,
                            mb: 1,
                        }}
                    >

                        <Box
                            sx={(theme) => ({
                                width: 34,
                                height: 34,
                                flexShrink: 0,
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                borderRadius:
                                    "50%",
                                backgroundColor:
                                    selectedTerritories.length >
                                        0
                                        ? theme
                                            .palette
                                            .primary
                                            .main
                                        : theme
                                            .palette
                                            .action
                                            .disabledBackground,
                                color:
                                    selectedTerritories.length >
                                        0
                                        ? theme
                                            .palette
                                            .primary
                                            .contrastText
                                        : theme
                                            .palette
                                            .text
                                            .disabled,
                                fontSize: 14,
                                fontWeight: 700,
                            })}
                        >
                            3
                        </Box>


                        <Typography
                            variant="h6"
                            sx={{
                                color:
                                    "text.primary",
                                fontWeight: 700,
                            }}
                        >
                            Select Areas
                        </Typography>


                        <Chip
                            size="small"
                            label={`${selectedAreas.length} selected`}
                            sx={{
                                ml: "auto",
                            }}
                        />

                    </Box>


                    <Typography
                        variant="body2"
                        sx={{
                            color:
                                "text.secondary",
                            mb: 2.5,
                        }}
                    >
                        {selectedTerritories.length >
                            0
                            ? "Select areas under the selected territories."
                            : "Select territories to continue."}
                    </Typography>


                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search areas"
                        value={areaSearch}
                        onChange={(event) =>
                            setAreaSearch(
                                event.target.value
                            )
                        }
                        disabled={
                            selectedTerritories.length ===
                                0 ||
                            isViewMode
                        }
                        sx={{
                            mb: 1.5,
                        }}
                    />


                    <Paper
                        variant="outlined"
                        sx={{
                            maxHeight: 300,
                            overflow: "auto",
                        }}
                    >

                        {availableAreas.map(
                            (area) => (

                                <Box
                                    key={area.AreaId}
                                    sx={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        px: 1,
                                    }}
                                >

                                    <Checkbox
                                        checked={selectedAreas.includes(
                                            area.AreaId
                                        )}
                                        onChange={() =>
                                            toggleArea(
                                                area.AreaId
                                            )
                                        }
                                        disabled={
                                            selectedTerritories.length ===
                                                0 ||
                                            isViewMode
                                        }
                                    />

                                    <Typography
                                        variant="body2"
                                    >
                                        {
                                            area.AreaName
                                        }
                                    </Typography>

                                </Box>

                            )
                        )}


                        {availableAreas.length ===
                            0 && (

                            <Typography
                                variant="body2"
                                sx={{
                                    p: 2,
                                    color:
                                        "text.secondary",
                                }}
                            >
                                Select territories to
                                load areas
                            </Typography>

                        )}

                    </Paper>

                </Box>

            </Box>


            {/* Mapping Summary */}

            <Box
                sx={(theme) => ({
                    mt: 3,
                    minHeight: 76,
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    border: "1px solid",
                    borderColor:
                        theme.palette
                            .border.default,
                    borderRadius: 1.5,
                    backgroundColor:
                        theme.palette
                            .background.paper,
                    overflow: "hidden",
                })}
            >

                <Typography
                    sx={{
                        px: {
                            xs: 1.5,
                            sm: 2,
                        },
                        fontSize: 12,
                        fontWeight: 700,
                        color:
                            "text.primary",
                        whiteSpace:
                            "nowrap",
                    }}
                >
                    Mapping Summary
                </Typography>


                <Box
                    sx={{
                        width: "1px",
                        height: 38,
                        backgroundColor:
                            "divider",
                    }}
                />


                <Box
                    sx={{
                        px: {
                            xs: 1.25,
                            sm: 2,
                        },
                        minWidth: 110,
                    }}
                >

                    <Typography
                        sx={{
                            fontSize: 10,
                            fontWeight: 500,
                            color:
                                "text.secondary",
                            lineHeight: 1.2,
                        }}
                    >
                        User
                    </Typography>


                    <Typography
                        sx={{
                            mt: 0.35,
                            fontSize: 11,
                            fontWeight: 700,
                            color:
                                "text.primary",
                            lineHeight: 1.2,
                            whiteSpace:
                                "nowrap",
                            overflow:
                                "hidden",
                            textOverflow:
                                "ellipsis",
                            maxWidth: 130,
                        }}
                    >
                        {selectedUserDetails
                            ?.UserName ||
                            "-"}
                    </Typography>

                </Box>


                <Box
                    sx={{
                        width: "1px",
                        height: 38,
                        backgroundColor:
                            "divider",
                    }}
                />


                <Box
                    sx={{
                        px: {
                            xs: 1.25,
                            sm: 2,
                        },
                        minWidth: 110,
                    }}
                >

                    <Typography
                        sx={{
                            fontSize: 10,
                            fontWeight: 500,
                            color:
                                "text.secondary",
                            lineHeight: 1.2,
                        }}
                    >
                        Territories
                    </Typography>


                    <Typography
                        sx={{
                            mt: 0.35,
                            fontSize: 11,
                            fontWeight: 700,
                            color:
                                "text.primary",
                            lineHeight: 1.2,
                        }}
                    >
                        {selectedTerritories.length} selected
                    </Typography>

                </Box>


                <Box
                    sx={{
                        width: "1px",
                        height: 38,
                        backgroundColor:
                            "divider",
                    }}
                />


                <Box
                    sx={{
                        px: {
                            xs: 1.25,
                            sm: 2,
                        },
                        minWidth: 92,
                    }}
                >

                    <Typography
                        sx={{
                            fontSize: 10,
                            fontWeight: 500,
                            color:
                                "text.secondary",
                            lineHeight: 1.2,
                        }}
                    >
                        Areas
                    </Typography>


                    <Typography
                        sx={{
                            mt: 0.35,
                            fontSize: 11,
                            fontWeight: 700,
                            color:
                                "text.primary",
                            lineHeight: 1.2,
                        }}
                    >
                        {selectedAreas.length} selected
                    </Typography>

                </Box>


                {/* Buttons */}

                {!isViewMode && (

                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            ml: "auto",
                            px: {
                                xs: 1,
                                sm: 1.5,
                            },
                            flexShrink: 0,
                        }}
                    >

                        <Button
                            variant="outlined"
                            size="small"
                            onClick={
                                handleReset
                            }
                        >
                            Reset
                        </Button>


                        <Button
                            variant="contained"
                            size="small"
                            onClick={
                                handleSave
                            }
                        >
                            Save Mapping
                        </Button>

                    </Box>

                )}

            </Box>

        </Box>
    );
}


export default UserAreaMapping;