import { Box, Tab, Tabs, Typography, Paper } from "@mui/material";
import { useState } from "react";

import AddNewUser from "./AddNewUser/AddNewUser";
import EditUser from "./editNewUser/EditNewUser";

function Users() {
    const [activeTab, setActiveTab] = useState("list");

    return (
        <Box
            sx={{
                width: "100%",
            }}
        >
            {/* ================= PAGE HEADER ================= */}

            <Box
                sx={{
                    mb: 3,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "text.primary",
                        letterSpacing: "-0.2px",
                    }}
                >
                    Users
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        mt: 0.5,
                        color: "text.secondary",
                    }}
                >
                    Manage users and their organizational access.
                </Typography>
            </Box>

            {/* ================= TABS ================= */}

            <Paper
                elevation={0}
                sx={{
                    width: "fit-content",

                    border: "1px solid",
                    borderColor: "divider",

                    borderRadius: 2,

                    backgroundColor: "background.paper",

                    mb: 3,

                    overflow: "hidden",
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

                            px: 2.5,

                            textTransform: "none",

                            fontSize: 13,
                            fontWeight: 500,

                            color: "text.secondary",

                            transition:
                                "color 0.2s ease, background-color 0.2s ease",

                            "&:hover": {
                                color: "primary.main",
                                backgroundColor: "sidebar.hover",
                            },
                        },

                        "& .MuiTab-root.Mui-selected": {
                            color: "primary.main",
                            fontWeight: 600,
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

            {/* ================= PAGE CONTENT ================= */}

            {activeTab === "new" ? (
                <AddNewUser />
            ) : (
                <EditUser />
            )}
        </Box>
    );
}

export default Users;