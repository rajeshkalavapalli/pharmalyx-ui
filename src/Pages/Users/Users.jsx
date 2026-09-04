import {
    Box,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";

import { useState } from "react";

import AddNewUser from "./AddNewUser/AddNewUser";
import UserList from "./editNewUser/UserList";


function Users() {

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


            {/* ================================================= */}
            {/* PAGE HEADER */}
            {/* ================================================= */}

            <Box
                sx={{
                    mb: 3,
                }}
            >

                <Typography
                    variant="h5"
                    sx={{
                        fontSize: {
                            xs: 20,
                            md: 22,
                        },

                        fontWeight: 650,

                        color: "text.primary",

                        letterSpacing: "-0.02em",

                        lineHeight: 1.25,
                    }}
                >
                    Users
                </Typography>


                <Typography
                    variant="body2"
                    sx={{
                        mt: 0.75,

                        fontSize: 13,

                        color: "text.secondary",

                        lineHeight: 1.5,
                    }}
                >
                    Manage users and their organizational access.
                </Typography>

            </Box>


            {/* ================================================= */}
            {/* MODULE TABS */}
            {/* ================================================= */}

            <Box
                sx={{
                    borderBottom: "1px solid",

                    borderColor: "divider",

                    mb: 3,
                }}
            >

                <Tabs

                    value={activeTab}

                    onChange={handleTabChange}

                    sx={{

                        minHeight: 42,

                        "& .MuiTabs-indicator": {

                            height: 2,

                            borderRadius: "2px 2px 0 0",

                            backgroundColor: "primary.main",

                        },


                        "& .MuiTab-root": {

                            minHeight: 42,

                            minWidth: 0,

                            px: 1.5,

                            mr: 2,

                            textTransform: "none",

                            fontSize: 13,

                            fontWeight: 500,

                            color: "text.secondary",

                            borderRadius: "6px 6px 0 0",

                            transition:
                                "color 160ms ease, background-color 160ms ease",

                            "&:hover": {

                                color: "primary.main",

                                backgroundColor: "action.hover",

                            },

                        },


                        "& .MuiTab-root.Mui-selected": {

                            color: "primary.main",

                            fontWeight: 650,

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