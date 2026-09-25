import {
    Box,
    Tab,
    Tabs,
    Paper,
    Typography,
    IconButton,
    Tooltip,
} from "@mui/material";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CloseRounded from "@mui/icons-material/CloseRounded";

import AddNewUser from "./AddNewUser/AddNewUser";
import UserList from "./editNewUser/UserList";


function Users() {

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("list");

    const [selectedUser, setSelecetdUser] = useState(null);


    // =====================================================
    // VIEW USER
    // =====================================================

    const handleViewUser = (user) => {

        setSelecetdUser(user);

        setActiveTab("new");

    };


    // =====================================================
    // USER CREATED
    // =====================================================

    const handleUserCreated = () => {

        setSelecetdUser(null);

        setActiveTab("list");

    };


    // =====================================================
    // TAB CHANGE
    // =====================================================

    const handleTabChange = (event, newValue) => {

        setActiveTab(newValue);

        // Clear selected user when creating a new user
        if (newValue === "new") {

            setSelecetdUser(null);

        }

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

            <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Tooltip title="Close">
                    <IconButton
                        onClick={() => navigate(-1)}
                        aria-label="Close users"
                        size="small"
                        sx={{
                            width: 36,
                            height: 36,
                            mb: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1.5,
                            color: "text.secondary",
                            "&:hover": {
                                color: "primary.main",
                                backgroundColor: "action.hover",
                                borderColor: "primary.main",
                            },
                        }}
                    >
                        <CloseRounded sx={{ fontSize: 19 }} />
                    </IconButton>
                </Tooltip>
            </Box>

            <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 2.5 }}>
                <Typography
                    sx={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 0.5,
                    }}
                >
                    Manage Users
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    View existing users or create a new user.
                </Typography>
            </Box>

            {/* ================================================= */}
            {/* MODULE NAVIGATION */}
            {/* ================================================= */}

            <Box
                sx={{
                    px: { xs: 2, sm: 3, md: 4 },
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            >

                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{
                        minHeight: 40,
                        "& .MuiTabs-flexContainer": { gap: 0.5 },
                        "& .MuiTabs-indicator": {
                            height: 2,
                            borderRadius: "2px 2px 0 0",
                            backgroundColor: "primary.main",
                        },
                        "& .MuiTab-root": {
                            minHeight: 40,
                            minWidth: 0,
                            px: 1.5,
                            py: 0.75,
                            textTransform: "none",
                            fontSize: 13,
                            fontWeight: 500,
                            color: "text.secondary",
                            borderRadius: "6px 6px 0 0",
                            "&:hover": {
                                color: "primary.main",
                                backgroundColor: "action.hover",
                            },
                        },
                        "& .MuiTab-root.Mui-selected": {
                            color: "primary.main",
                            fontWeight: 700,
                        },
                    }}
                >
                    <Tab value="list" label="Users List" />
                    <Tab value="new" label="+ New User" />
                </Tabs>
            </Box>

            <Box
                sx={{
                    px: { xs: 2, sm: 3, md: 4 },
                    py: 3,
                }}
            >


            {/* ================================================= */}
            {/* CONTENT */}
            {/* ================================================= */}

            {activeTab === "new" ? (

                <AddNewUser

                    onUserCreated={
                        handleUserCreated
                    }

                    selectedUser={
                        selectedUser
                    }

                />

            ) : (

                <UserList

                    onViewUser={
                        handleViewUser
                    }

                />

            )}

            </Box>

        </Paper>

    );
}


export default Users;