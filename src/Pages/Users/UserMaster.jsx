import {
    Box,
    Divider,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { useState } from "react";

import UserList from "./UsersList";
import AddNewUser from "./AddNewUser/AddNewUser";

function UserMaster() {
    const [selectedView, setSelectedView] = useState("list");
    const [userForm, setUserForm] = useState({
        open: false,
        mode: "create",
        user: null,
    });

    const handleAddUser = () => {
        setUserForm({ open: true, mode: "create", user: null });
    };

    const handleViewUser = (user) => {
        setUserForm({ open: true, mode: "view", user });
    };

    const handleEditUser = (user) => {
        setUserForm({ open: true, mode: "edit", user });
    };

    const handleCloseUser = () => {
        setUserForm({ open: false, mode: "create", user: null });
        setSelectedView("list");
    };

    const handleViewChange = (event, newValue) => {
        if (!newValue) return;

        if (newValue === "add") {
            handleAddUser();
            return;
        }

        setSelectedView("list");
        setUserForm({ open: false, mode: "create", user: null });
    };

    return (
        <Paper
            elevation={0}
            sx={{
                width: "100%",
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                overflow: "hidden",
                boxShadow: "0 8px 30px rgba(32, 37, 34, 0.055)",
            }}
        >
            <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                    Manage Users
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 2 }}>
                    View existing users or create a new user.
                </Typography>
                <ToggleButtonGroup
                    exclusive
                    value={userForm.open ? "add" : selectedView}
                    onChange={handleViewChange}
                    sx={{
                        "& .MuiToggleButton-root": {
                            textTransform: "none",
                            fontSize: 13,
                            fontWeight: 600,
                            px: 2.5,
                            py: 1,
                            borderColor: "divider",
                            color: "text.secondary",
                            "&:hover": { backgroundColor: "action.hover" },
                            "&.Mui-selected": {
                                color: "primary.main",
                                backgroundColor: "action.selected",
                                borderColor: "primary.main",
                                "&:hover": { backgroundColor: "action.selected" },
                            },
                        },
                    }}
                >
                    <ToggleButton value="list">Users List</ToggleButton>
                    <ToggleButton value="add">+ Add New User</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Divider />
            <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
                {!userForm.open && selectedView === "list" && (
                    <UserList
                        onAddUser={handleAddUser}
                        onViewUser={handleViewUser}
                        onEditUser={handleEditUser}
                    />
                )}
                {userForm.open && (
                    <AddNewUser
                        mode={userForm.mode}
                        user={userForm.user}
                        onUserCreated={handleCloseUser}
                        onClose={handleCloseUser}
                    />
                )}
            </Box>
        </Paper>
    );
}

export default UserMaster;
