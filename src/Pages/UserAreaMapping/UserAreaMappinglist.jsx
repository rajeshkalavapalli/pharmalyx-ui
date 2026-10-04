import {
    Box,
    Chip,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Tooltip,
    InputAdornment,
} from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/Delete";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    deleteUserAreaMapping,
    getUserAreaMappings,
    getUsers,
} from "./index.js";

import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import ConfirmationDialog from "../../components/conformationDialog/ConformationDialog";


function UserAreaMappingList() {

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [search, setSearch] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { showSnackbar } = useSnackbar();


    useEffect(() => {

        const loadMappingData = async () => {

            try {

                const [usersResponse, mappingsResponse] =
                    await Promise.all([
                        getUsers(),
                        getUserAreaMappings(),
                    ]);

                setUsers(
                    Array.isArray(usersResponse?.result)
                        ? usersResponse.result
                        : []
                );

                setMappings(
                    Array.isArray(mappingsResponse?.result)
                        ? mappingsResponse.result
                        : []
                );

            } catch (error) {

                console.error(
                    "Error loading user area mappings",
                    error
                );

                showSnackbar(
                    "Unable to load user area mappings",
                    "error"
                );
            }
        };

        loadMappingData();

    }, [showSnackbar]);


    const handleDelete = async () => {

        try {

            await deleteUserAreaMapping(
                deleteTarget.userId
            );

            setMappings((current) =>
                current.filter(
                    (mapping) =>
                        mapping.UserId !== deleteTarget.userId
                )
            );

            setDeleteTarget(null);

            showSnackbar(
                "User area mappings deleted",
                "success"
            );

        } catch (error) {

            console.error(
                "Error deleting user area mappings",
                error
            );

            showSnackbar(
                error.response?.data?.message ||
                    "Failed to delete user area mappings",
                "error"
            );
        }
    };


    const rows = useMemo(() => {

        const mappedUserIds = new Set(
            mappings
                .map((mapping) => mapping.UserId)
                .filter(Boolean)
        );

        return users
            .filter((user) =>
                mappedUserIds.has(user.userId)
            )
            .map((user) => {

                const userMappings = mappings.filter(
                    (mapping) =>
                        mapping.UserId === user.userId
                );


                const userTerritories = Array.from(
                    new Map(
                        userMappings.map((mapping) => [
                            mapping.TerritoryId,
                            {
                                TerritoryId:
                                    mapping.TerritoryId,

                                TerritoryName:
                                    mapping.TerritoryName,
                            },
                        ])
                    ).values()
                );


                const coverageAreas = Array.from(
                    new Map(
                        userMappings.map((mapping) => [
                            mapping.AreaId,
                            {
                                AreaId:
                                    mapping.AreaId,

                                AreaName:
                                    mapping.AreaName,

                                TerritoryName:
                                    mapping.TerritoryName,
                            },
                        ])
                    ).values()
                );


                return {
                    ...user,
                    userTerritories,
                    coverageAreas,
                };

            });

    }, [mappings, users]);


    const filteredRows = rows.filter((row) => {

        const searchValue = [
            row.UserName,
            row.EmailId,
            row.DivisionName,

            ...row.userTerritories.map(
                (territory) =>
                    territory.TerritoryName
            ),

            ...row.coverageAreas.map(
                (area) =>
                    area.AreaName
            ),

        ]
            .join(" ")
            .toLowerCase();

        return searchValue.includes(
            search.trim().toLowerCase()
        );
    });


    return (

        <Box
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >

            {/* Header */}

            <Box
                sx={{
                    display: "flex",
                    alignItems: {
                        xs: "flex-start",
                        sm: "center",
                    },
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 2,
                }}
            >

                <Box
                    sx={{
                        pl: 1.25,
                        borderLeft: "3px solid",
                        borderColor: "primary.main",
                    }}
                >

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            lineHeight: 1.3,
                        }}
                    >
                        User Area Mappings
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.35,
                            fontSize: 12.5,
                            color: "text.secondary",
                        }}
                    >
                        Manage users&apos; territory and area coverage.
                    </Typography>

                </Box>


                <Chip
                    label={`${filteredRows.length} ${
                        filteredRows.length === 1
                            ? "user"
                            : "users"
                    }`}
                    color="primary"
                    variant="outlined"
                    sx={{
                        flexShrink: 0,
                        alignSelf: {
                            xs: "center",
                            sm: "auto",
                        },
                    }}
                />

            </Box>


            {/* Search */}

            <Paper
                elevation={0}
                sx={{
                    mb: 2,
                    p: {
                        xs: 1.25,
                        sm: 1.5,
                    },
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                }}
            >

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >

                    <TextField
                        size="small"
                        placeholder="Search users or territories"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        sx={{
                            width: {
                                xs: "100%",
                                sm: 360,
                            },
                            maxWidth: "100%",
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">

                                    <SearchOutlinedIcon
                                        sx={{
                                            mr: 1,
                                            fontSize: 18,
                                            color: "text.secondary",
                                        }}
                                    />

                                </InputAdornment>
                            ),
                        }}
                    />

                </Box>

            </Paper>


            {/* Table */}

            <TableContainer
                component={Paper}
                elevation={0}
                sx={(theme) => ({
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflowX: "auto",
                    boxShadow: theme.card.shadow,
                })}
            >

                <Table
                    size="small"
                    sx={{
                        minWidth: 940,
                    }}
                >

                    <TableHead>

                        <TableRow
                            sx={{
                                backgroundColor: "surface.muted",
                            }}
                        >

                            {[
                                "Actions",
                                "User",
                                "Email",
                                "Division",
                                "Territories",
                                "Areas in Coverage",
                            ].map((heading) => (

                                <TableCell
                                    key={heading}
                                    sx={{
                                        py: 1.5,
                                        color: "text.secondary",
                                        fontSize: 10.5,
                                        fontWeight: 800,
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {heading}
                                </TableCell>

                            ))}

                        </TableRow>

                    </TableHead>


                    <TableBody>

                        {filteredRows.map((row) => (

                            <TableRow
                                key={row.userId}
                                hover
                                sx={{
                                    "& .MuiTableCell-root": {
                                        py: 1.6,
                                    },
                                }}
                            >

                                {/* ACTIONS — FIRST COLUMN */}

                                <TableCell>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.25,
                                        }}
                                    >

                                        {/* VIEW */}

                                        <Tooltip
                                            title="View Mapping"
                                            arrow
                                        >

                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    navigate(
                                                        "/admin/UserAreaMapping/mapping",
                                                        {
                                                            state: {
                                                                userId:
                                                                    row.userId,

                                                                mode:
                                                                    "view",
                                                            },
                                                        }
                                                    )
                                                }
                                                sx={{
                                                    width: 31,
                                                    height: 31,
                                                    borderRadius: 1.25,
                                                    color: "text.secondary",

                                                    "&:hover": {
                                                        color:
                                                            "primary.main",

                                                        backgroundColor:
                                                            "action.hover",
                                                    },
                                                }}
                                            >

                                                <VisibilityOutlinedIcon
                                                    sx={{
                                                        fontSize: 17,
                                                    }}
                                                />

                                            </IconButton>

                                        </Tooltip>


                                        {/* EDIT */}

                                        <Tooltip
                                            title="Edit Mapping"
                                            arrow
                                        >

                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    navigate(
                                                        "/admin/UserAreaMapping/mapping",
                                                        {
                                                            state: {
                                                                userId:
                                                                    row.userId,

                                                                mode:
                                                                    "edit",
                                                            },
                                                        }
                                                    )
                                                }
                                                sx={{
                                                    width: 31,
                                                    height: 31,
                                                    borderRadius: 1.25,
                                                    color: "text.secondary",

                                                    "&:hover": {
                                                        color:
                                                            "primary.main",

                                                        backgroundColor:
                                                            "action.hover",
                                                    },
                                                }}
                                            >

                                                <EditOutlinedIcon
                                                    sx={{
                                                        fontSize: 17,
                                                    }}
                                                />

                                            </IconButton>

                                        </Tooltip>


                                        {/* DELETE */}

                                        <Tooltip
                                            title="Delete Mapping"
                                            arrow
                                        >

                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    setDeleteTarget(row)
                                                }
                                                sx={{
                                                    width: 31,
                                                    height: 31,
                                                    borderRadius: 1.25,
                                                    color: "text.secondary",

                                                    "&:hover": {
                                                        color:
                                                            "error.main",

                                                        backgroundColor:
                                                            "action.hover",
                                                    },
                                                }}
                                            >

                                                <DeleteOutline
                                                    sx={{
                                                        fontSize: 17,
                                                    }}
                                                />

                                            </IconButton>

                                        </Tooltip>

                                    </Box>

                                </TableCell>


                                {/* USER */}

                                <TableCell>

                                    <Typography
                                        sx={{
                                            fontSize: 13,
                                            fontWeight: 750,
                                            color: "primary.main",
                                        }}
                                    >
                                        {row.UserName || "-"}
                                    </Typography>

                                </TableCell>


                                {/* EMAIL */}

                                <TableCell
                                    sx={{
                                        color: "text.secondary",
                                        fontSize: 12.5,
                                    }}
                                >
                                    {row.EmailId || "-"}
                                </TableCell>


                                {/* DIVISION */}

                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                    }}
                                >
                                    {row.DivisionName || "-"}
                                </TableCell>


                                {/* TERRITORIES */}

                                <TableCell>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 0.5,
                                            flexWrap: "wrap",
                                        }}
                                    >

                                        {row.userTerritories
                                            .slice(0, 3)
                                            .map((territory) => (

                                                <Chip
                                                    key={
                                                        territory.TerritoryId
                                                    }
                                                    label={
                                                        territory.TerritoryName
                                                    }
                                                    size="small"
                                                    variant="outlined"
                                                />

                                            ))}


                                        {row.userTerritories.length > 3 && (

                                            <Chip
                                                label={`+${
                                                    row.userTerritories
                                                        .length - 3
                                                } more`}
                                                size="small"
                                                variant="outlined"
                                            />

                                        )}


                                        {row.userTerritories.length === 0 &&
                                            "-"}

                                    </Box>

                                </TableCell>


                                {/* AREAS */}

                                <TableCell>

                                    {row.coverageAreas.length > 0 ? (

                                        <Tooltip
                                            title={row.coverageAreas
                                                .map(
                                                    (area) =>
                                                        area.AreaName
                                                )
                                                .join(", ")}
                                            arrow
                                        >

                                            <Chip
                                                label={`${row.coverageAreas.length} mapped`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />

                                        </Tooltip>

                                    ) : (
                                        "-"
                                    )}

                                </TableCell>

                            </TableRow>

                        ))}


                        {filteredRows.length === 0 && (

                            <TableRow>

                                <TableCell
                                    colSpan={6}
                                    align="center"
                                    sx={{
                                        py: 5,
                                        color: "text.secondary",
                                    }}
                                >
                                    No user mappings found
                                </TableCell>

                            </TableRow>

                        )}

                    </TableBody>

                </Table>

            </TableContainer>


            {/* DELETE CONFIRMATION */}

            <ConfirmationDialog
                open={Boolean(deleteTarget)}

                title="Delete User Area Mapping"

                message={`Are you sure you want to delete all area mappings for ${
                    deleteTarget?.UserName ||
                    "this user"
                }?`}

                confirmText="Yes, Delete"

                onCancel={() =>
                    setDeleteTarget(null)
                }

                onConfirm={handleDelete}
            />

        </Box>
    );
}


export default UserAreaMappingList;