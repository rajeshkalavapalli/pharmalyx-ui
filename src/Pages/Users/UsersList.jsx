import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    Paper,
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

import AddIcon from "@mui/icons-material/Add";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/Delete";

import { useEffect, useState } from "react";

import { deleteUser, getUsers } from "./service/index";
import ConfirmationDialog from "../../components/conformationDialog/ConformationDialog";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";

function UserList({ onAddUser, onViewUser, onEditUser }) {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { showSnackbar } = useSnackbar();

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await getUsers();

                const data =
                    response?.result ||
                    response?.users ||
                    response ||
                    [];

                setUsers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error loading users", error);

                setUsers([]);

                showSnackbar(
                    error.response?.data?.message ||
                        "Unable to load users",
                    "error"
                );
            }
        };

        loadUsers();
    }, [showSnackbar]);

    const filteredUsers = users.filter((user) => {
        const searchValue = [
            user.UserName,
            user.FirstName,
            user.LastName,
            user.EmailId,
            user.MobileNumber,
            user.SldName,
            user.DivisionName,
            user.ManagerName,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchValue.includes(
            search.trim().toLowerCase()
        );
    });

    const handleDeleteUser = async () => {
        try {
            const userId =
                deleteTarget?.UserId ||
                deleteTarget?.userId;

            if (!userId) return;

            await deleteUser(userId);

            setUsers((current) =>
                current.filter(
                    (user) =>
                        (user.UserId || user.userId) !== userId
                )
            );

            setDeleteTarget(null);

            showSnackbar(
                "User deleted successfully",
                "success"
            );
        } catch (error) {
            console.error(
                "Error deleting user",
                error
            );

            showSnackbar(
                error.response?.data?.message ||
                    "Failed to delete user",
                "error"
            );
        }
    };

    return (
        <Box>
            {/* Search + Add User */}
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: {
                        xs: "stretch",
                        sm: "center",
                    },
                    flexDirection: {
                        xs: "column",
                        sm: "row",
                    },
                    gap: 2,
                    mb: 2.5,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                }}
            >
                <TextField
                    size="small"
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search users"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchOutlinedIcon
                                    sx={{
                                        mr: 1,
                                        color: "text.secondary",
                                    }}
                                />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        flex: 1,
                        minWidth: 220,
                    }}
                />

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onAddUser}
                    sx={{
                        textTransform: "none",
                        flexShrink: 0,
                    }}
                >
                    Add New User
                </Button>
            </Box>

            {/* Users Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                }}
            >
                <Table
                    size="small"
                    sx={{
                        minWidth: 900,
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Actions
                            </TableCell>

                            <TableCell>
                                User
                            </TableCell>

                            <TableCell>
                                Email
                            </TableCell>

                            <TableCell>
                                Mobile
                            </TableCell>

                            <TableCell>
                                Designation
                            </TableCell>

                            <TableCell>
                                Division
                            </TableCell>

                            <TableCell>
                                Manager
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredUsers.map((user) => {
                            const userId =
                                user.UserId ||
                                user.userId;

                            return (
                                <TableRow
                                    key={userId}
                                    hover
                                >
                                    {/* Actions */}
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 0.5,
                                            }}
                                        >
                                            <Tooltip
                                                title="View User"
                                                arrow
                                            >
                                                <IconButton
                                                    size="small"
                                                    aria-label={`View ${
                                                        user.UserName ||
                                                        "user"
                                                    }`}
                                                    onClick={() =>
                                                        onViewUser(
                                                            user
                                                        )
                                                    }
                                                    sx={{
                                                        width: 31,
                                                        height: 31,
                                                        borderRadius: 1.25,
                                                        color: "text.secondary",
                                                        "&:hover":
                                                            {
                                                                color: "primary.main",
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

                                            <Tooltip
                                                title="Edit User"
                                                arrow
                                            >
                                                <IconButton
                                                    size="small"
                                                    aria-label={`Edit ${
                                                        user.UserName ||
                                                        "user"
                                                    }`}
                                                    onClick={() =>
                                                        onEditUser(
                                                            user
                                                        )
                                                    }
                                                    sx={{
                                                        width: 31,
                                                        height: 31,
                                                        borderRadius: 1.25,
                                                        color: "text.secondary",
                                                        "&:hover":
                                                            {
                                                                color: "primary.main",
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

                                            <Tooltip
                                                title="Delete User"
                                                arrow
                                            >
                                                <IconButton
                                                    size="small"
                                                    aria-label={`Delete ${
                                                        user.UserName ||
                                                        "user"
                                                    }`}
                                                    onClick={() =>
                                                        setDeleteTarget(
                                                            user
                                                        )
                                                    }
                                                    sx={{
                                                        width: 31,
                                                        height: 31,
                                                        borderRadius: 1.25,
                                                        color: "text.secondary",
                                                        "&:hover":
                                                            {
                                                                color: "error.main",
                                                                backgroundColor:
                                                                    "error.lighter",
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

                                    {/* User */}
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                fontSize: 12,
                                                color: "text.primary",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {user.UserName || "-"}
                                        </Typography>
                                    </TableCell>

                                    {/* Email */}
                                    <TableCell
                                        sx={{
                                            fontSize: 12,
                                            color: "text.secondary",
                                        }}
                                    >
                                        {user.EmailId || "-"}
                                    </TableCell>

                                    {/* Mobile */}
                                    <TableCell
                                        sx={{
                                            fontSize: 12,
                                            color: "text.secondary",
                                        }}
                                    >
                                        {[
                                            user.CountryCode,
                                            user.MobileNumber,
                                        ]
                                            .filter(Boolean)
                                            .join(" ") || "-"}
                                    </TableCell>

                                    {/* Designation */}
                                    <TableCell
                                        sx={{
                                            fontSize: 12,
                                            color: "text.secondary",
                                        }}
                                    >
                                        {user.SldName || "-"}
                                    </TableCell>

                                    {/* Division */}
                                    <TableCell
                                        sx={{
                                            fontSize: 12,
                                            color: "text.secondary",
                                        }}
                                    >
                                        {user.DivisionName || "-"}
                                    </TableCell>

                                    {/* Manager */}
                                    <TableCell
                                        sx={{
                                            fontSize: 12,
                                            color: "text.secondary",
                                        }}
                                    >
                                        {user.ManagerName || "-"}
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {!filteredUsers.length && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
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

            {/* Delete Confirmation */}
            <ConfirmationDialog
                open={Boolean(deleteTarget)}
                title="Delete User"
                message={`Are you sure you want to delete ${
                    deleteTarget?.UserName ||
                    "this user"
                }?`}
                confirmText="Yes, Delete"
                onCancel={() =>
                    setDeleteTarget(null)
                }
                onConfirm={handleDeleteUser}
            />
        </Box>
    );
}

export default UserList;