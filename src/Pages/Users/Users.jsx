import {
    Box,
    Tab,
    Tabs,
    Typography,
    Paper,
} from "@mui/material";

import { useState } from "react";

import AddNewUser from "./AddNewUser/AddNewUser";
import UserList from "./editNewUser/UserList";


function Users() {

    const [activeTab, setActiveTab] = useState("list");

    const [selectedUser, setSelecetdUser] = useState(null);


    const handleViewUser = (user) => {
        setSelecetdUser(user);
        setActiveTab("new");
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
                    mb: 2.5,
                }}
            >
                <Typography
                    sx={{
                        fontSize: {
                            xs: 20,
                            md: 22,
                        },

                        fontWeight: 650,

                        color: "text.primary",

                        letterSpacing: "-0.03em",

                        lineHeight: 1.25,
                    }}
                >
                    Users
                </Typography>

                <Typography
                    sx={{
                        mt: 0.6,

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

            <Paper
                elevation={0}
                sx={{
                    width: "fit-content",

                    border: "1px solid",

                    borderColor: "divider",

                    borderRadius: 2.5,

                    backgroundColor: "background.paper",

                    overflow: "hidden",

                    mb: 2.75,
                }}
            >
                <Tabs
                    value={activeTab}

                    onChange={(event, newValue) =>
                        setActiveTab(newValue)
                    }

                    sx={{
                        minHeight: 48,

                        "& .MuiTabs-indicator": {
                            height: 2,

                            borderRadius: 2,

                            backgroundColor: "primary.main",
                        },

                        "& .MuiTab-root": {
                            minHeight: 48,

                            minWidth: 0,

                            px: 2.5,

                            textTransform: "none",

                            fontSize: 13,

                            fontWeight: 500,

                            color: "text.secondary",

                            transition:
                                "color 160ms ease, background-color 160ms ease",

                            "&:hover": {
                                color: "primary.main",

                                backgroundColor:
                                    "sidebar.hover",
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
            </Paper>


            {/* ================================================= */}
            {/* CONTENT */}
            {/* ================================================= */}

            {activeTab === "new" ? (

                <AddNewUser
                    onUserCreated={() =>
                        setActiveTab("list")
                    }
                />

            ) : (

                <UserList
                    onViewUser={handleViewUser}
                />

            )}

        </Box>
    );
}


export default Users;