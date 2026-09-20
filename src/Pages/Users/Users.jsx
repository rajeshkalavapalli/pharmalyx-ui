import {
    Box,
    Tab,
    Tabs,
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

        <Box
            sx={{
                width: "100%",
            }}
        >

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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

            {/* ================================================= */}
            {/* MODULE NAVIGATION */}
            {/* ================================================= */}

            <Box
                sx={{
                    mb: 2.5,

                    borderBottom: "1px solid",

                    borderColor: "divider",
                }}
            >

                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{

                        minHeight: 40,

                        "& .MuiTabs-flexContainer": {
                            gap: 0.5,
                        },

                        "& .MuiTabs-indicator": {

                            height: 2,

                            borderRadius:
                                "2px 2px 0 0",

                            backgroundColor:
                                "primary.main",

                        },


                        "& .MuiTab-root": {

                            minHeight: 40,

                            minWidth: 0,

                            px: 1.25,

                            py: 0.75,

                            textTransform: "none",

                            fontSize: 13,

                            fontWeight: 500,

                            color: "text.secondary",

                            borderRadius:
                                "6px 6px 0 0",

                            transition:
                                "color 160ms ease, background-color 160ms ease",

                            "&:hover": {

                                color:
                                    "primary.main",

                                backgroundColor:
                                    "action.hover",

                            },

                        },


                        "& .MuiTab-root.Mui-selected": {

                            color:
                                "primary.main",

                            fontWeight: 700,

                        },

                    }}
                >

                    <Tab
                        value="list"
                        label="Users List"
                    />


                    <Tab
                        value="new"
                        label="+ New User"
                    />

                </Tabs>

            </Box>


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

    );
}


export default Users;