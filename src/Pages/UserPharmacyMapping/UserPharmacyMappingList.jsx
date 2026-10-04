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

import { deleteUserPharmacyMappings, getUserPharmacyMappings, getUsers } from "./index.js";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import ConfirmationDialog from "../../components/conformationDialog/ConformationDialog";


function UserPharmacyMappingList() {
    const [users, setUsers] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [search, setSearch] = useState("");
    const { showSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        const loadMappingData = async () => {
            try {
                const [usersResponse, mappingsResponse] = await Promise.all([
                    getUsers(),
                    getUserPharmacyMappings(),
                ]);

                setUsers(Array.isArray(usersResponse?.result) ? usersResponse.result : []);
                setMappings(Array.isArray(mappingsResponse?.result) ? mappingsResponse.result : []);
            } catch (error) {
                console.error("Error loading user pharmacy mappings", error);
                showSnackbar("Unable to load user pharmacy mappings", "error");
            }
        };

        loadMappingData();
    }, [showSnackbar]);

    const rows = useMemo(() => users.map((user) => {
        const userMappings = mappings.filter((mapping) =>
            mapping.UserId === user.userId
        );

        const mappedPharmacies = Array.from(
            new Map(
                userMappings.map((mapping) => [
                    mapping.PharmacyId,
                    {
                        PharmacyId: mapping.PharmacyId,
                        PharmacyName: mapping.PharmacyName,
                    },
                ])
            ).values()
        );

        return {
            ...user,
            mappedPharmacies,
        };
    }), [mappings, users]);

    const filteredRows = rows.filter((row) => {
        const searchValue = [
            row.UserName,
            row.EmailId,
            row.DivisionName,
            ...row.mappedPharmacies.map((pharmacy) => pharmacy.PharmacyName),
        ].join(" ").toLowerCase();

        return searchValue.includes(search.trim().toLowerCase());
    });

    const handleView = (row) => {
        navigate("/admin/UserPharmacyMapping/mapping", {
            state: { mode: "view", user: row },
        });
    };

    const handleEdit = (row) => {
        navigate("/admin/UserPharmacyMapping/mapping", {
            state: { mode: "edit", user: row },
        });
    };

    const handleDelete = async () => {
        try {
            await deleteUserPharmacyMappings({ userId: deleteTarget.userId });
            setMappings((current) =>
                current.filter((mapping) => mapping.UserId !== deleteTarget.userId)
            );
            setDeleteTarget(null);
            showSnackbar("User pharmacy mappings deleted", "success");
        } catch (error) {
            console.error("Error deleting user pharmacy mappings", error);
            showSnackbar(
                error.response?.data?.message || "Failed to delete user pharmacy mappings",
                "error"
            );
        }
    };

    return (
        <Box sx={{ width: "100%", minWidth: 0 }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
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
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        User Pharmacy Mappings
                    </Typography>

                    <Typography sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary" }}>
                        Manage users&apos; assigned pharmacies.
                    </Typography>
                </Box>

                <Chip
                    label={`${filteredRows.length} ${filteredRows.length === 1 ? "user" : "users"}`}
                    color="primary"
                    variant="outlined"
                    sx={{
                        flexShrink: 0,
                        alignSelf: { xs: "center", sm: "auto" },
                    }}
                />
            </Box>

            <Paper
                elevation={0}
                sx={{
                    mb: 2,
                    p: { xs: 1.25, sm: 1.5 },
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                }}
            >
                <TextField
                    size="small"
                    placeholder="Search users or pharmacies"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    sx={{
                        width: { xs: "100%", sm: 360 },
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
                            <TableCell align="center" sx={{ width: 130 }}>Actions</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Division</TableCell>
                            <TableCell>Mapped Pharmacies</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredRows.map((row) => (
                            <TableRow key={row.userId} hover>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.25 }}>
                                        <Tooltip title="View">
                                            <IconButton size="small" onClick={() => handleView(row)}>
                                                <VisibilityOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => handleEdit(row)}>
                                                <EditOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    disabled={row.mappedPharmacies.length === 0}
                                                    onClick={() => setDeleteTarget(row)}
                                                >
                                                    <DeleteOutlineOutlinedIcon fontSize="small" />
                                                </IconButton>
                                            </span>
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
                                        {row.mappedPharmacies.map((pharmacy) => (
                                            <Chip
                                                key={pharmacy.PharmacyId}
                                                size="small"
                                                label={pharmacy.PharmacyName}
                                            />
                                        ))}

                                        {row.mappedPharmacies.length === 0 && (
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "text.secondary" }}
                                            >
                                                No pharmacies mapped
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

            <ConfirmationDialog
                open={Boolean(deleteTarget)}
                title="Delete User Pharmacy Mapping"
                message={`Are you sure you want to delete all pharmacy mappings for ${deleteTarget?.UserName || "this user"}?`}
                confirmText="Yes, Delete"
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />
        </Box>
    );
}

export default UserPharmacyMappingList;