import {
    Box,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    Tooltip,
} from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getUserDoctorMappings, getUsers } from "./index.js";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";


function UserDoctorMappingList() {
    const [users, setUsers] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [search, setSearch] = useState("");

    const { showSnackbar } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        const loadMappingData = async () => {
            try {
                const [usersResponse, mappingsResponse] = await Promise.all([
                    getUsers(),
                    getUserDoctorMappings(),
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
                console.error("Error loading user doctor mappings", error);
                showSnackbar(
                    "Unable to load user doctor mappings",
                    "error"
                );
            }
        };

        loadMappingData();
    }, [showSnackbar]);

    const rows = useMemo(
        () =>
            users.map((user) => {
                const userMappings = mappings.filter(
                    (mapping) => mapping.UserId === user.userId
                );

                const mappedDoctors = Array.from(
                    new Map(
                        userMappings.map((mapping) => [
                            mapping.DoctorId,
                            {
                                DoctorId: mapping.DoctorId,
                                DoctorName: mapping.DoctorName,
                                Speciality: mapping.Speciality,
                            },
                        ])
                    ).values()
                );

                return {
                    ...user,
                    mappedDoctors,
                };
            }),
        [mappings, users]
    );

    const filteredRows = rows.filter((row) => {
        const searchValue = [
            row.UserName,
            row.EmailId,
            row.DivisionName,
            ...row.mappedDoctors.map(
                (doctor) => doctor.DoctorName
            ),
        ]
            .join(" ")
            .toLowerCase();

        return searchValue.includes(
            search.trim().toLowerCase()
        );
    });

    const handleView = (row) => {
        navigate("/admin/UserDoctorMapping/mapping", {
            state: {
                mode: "view",
                user: row,
            },
        });
    };

    const handleEdit = (row) => {
        navigate("/admin/UserDoctorMapping/mapping", {
            state: {
                mode: "edit",
                user: row,
            },
        });
    };

    return (
        <Box sx={{ width: "100%", minWidth: 0 }}>
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
                        User Doctor Mappings
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.35,
                            fontSize: 12.5,
                            color: "text.secondary",
                        }}
                    >
                        Manage users&apos; assigned doctors.
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
                <TextField
                    size="small"
                    placeholder="Search users or doctors"
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
            </Paper>

            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                }}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {/* Actions first */}
                            <TableCell
                                align="center"
                                sx={{ width: 130 }}
                            >
                                Actions
                            </TableCell>

                            <TableCell>User</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Division</TableCell>
                            <TableCell>Mapped Doctors</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredRows.map((row) => (
                            <TableRow
                                key={row.userId}
                                hover
                            >
                                {/* Actions */}
                                <TableCell align="center">
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 0.25,
                                        }}
                                    >
                                        <Tooltip title="View">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleView(row)
                                                }
                                            >
                                                <VisibilityOutlinedIcon
                                                    fontSize="small"
                                                />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleEdit(row)
                                                }
                                            >
                                                <EditOutlinedIcon
                                                    fontSize="small"
                                                />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    // Delete confirmation/API
                                                    // will be connected in
                                                    // the next step.
                                                }}
                                            >
                                                <DeleteOutlineOutlinedIcon
                                                    fontSize="small"
                                                />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>

                                <TableCell>
                                    {row.UserName || "-"}
                                </TableCell>

                                <TableCell>
                                    {row.EmailId || "-"}
                                </TableCell>

                                <TableCell>
                                    {row.DivisionName || "-"}
                                </TableCell>

                                <TableCell>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 0.5,
                                        }}
                                    >
                                        {row.mappedDoctors.map(
                                            (doctor) => (
                                                <Chip
                                                    key={
                                                        doctor.DoctorId
                                                    }
                                                    size="small"
                                                    label={
                                                        doctor.DoctorName
                                                    }
                                                />
                                            )
                                        )}

                                        {row.mappedDoctors.length ===
                                            0 && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color:
                                                        "text.secondary",
                                                }}
                                            >
                                                No doctors mapped
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}

                        {!filteredRows.length && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    align="center"
                                    sx={{
                                        py: 5,
                                        color: "text.secondary",
                                    }}
                                >
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default UserDoctorMappingList;