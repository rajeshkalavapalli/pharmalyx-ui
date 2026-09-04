import {
    Box,
    Tabs,
    Tab,
    Snackbar,
    Alert,
    Typography,
} from "@mui/material";

import { useState } from "react";

import TerritoryList from "../Territory/TerritoryList";
import DivisionList from "./DivisionList";
import AddNewDivision from "./AddNewDivision/AddNewDivision";
import AddNewTerritoty from "../Territory/AddTerritory/AddNewTerritory";


function DivisionOrTerritoty() {

    const [selectedTab, setSelectedTab] = useState(0);

    const [showDivision, setShowDivision] = useState(false);

    const [showTerritory, setShowTerritory] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });


    // =====================================================
    // ADD DIVISION
    // =====================================================

    const handleAddDiv = () => {

        setShowDivision(true);

    };


    // =====================================================
    // DIVISION CREATED
    // =====================================================

    const handleDivisionCreated = (
        message = "Division created successfully",
        severity = "success"
    ) => {

        // Only return to list after success
        if (severity === "success") {

            setShowDivision(false);

        }


        setSnackbar({
            open: true,
            message: message,
            severity: severity,
        });

    };


    // =====================================================
    // ADD TERRITORY
    // =====================================================

    const handleAddTerritoty = () => {

        setShowTerritory(true);

    };


    // =====================================================
    // TAB CHANGE
    // =====================================================

    const handleTabChange = (
        event,
        newValue
    ) => {

        setSelectedTab(newValue);

        setShowDivision(false);

        setShowTerritory(false);

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
                    Organization Structure
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
                    Manage divisions and territories within your organization.
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

                    value={selectedTab}

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
                        label="Divisions"
                    />


                    <Tab
                        label="Territories"
                    />

                </Tabs>

            </Box>


            {/* ================================================= */}
            {/* DIVISION LIST */}
            {/* ================================================= */}

            {selectedTab === 0 &&
                !showDivision && (

                    <Box>

                        <DivisionList
                            handleAddDiv={
                                handleAddDiv
                            }
                        />

                    </Box>

                )
            }


            {/* ================================================= */}
            {/* TERRITORY LIST */}
            {/* ================================================= */}

            {selectedTab === 1 &&
                !showTerritory && (

                    <Box>

                        <TerritoryList
                            handleAddTerritoty={
                                handleAddTerritoty
                            }
                        />

                    </Box>

                )
            }


            {/* ================================================= */}
            {/* CREATE DIVISION */}
            {/* ================================================= */}

            {showDivision && (

                <AddNewDivision

                    onDivisionCreated={
                        handleDivisionCreated
                    }

                    onClose={() =>
                        setShowDivision(false)
                    }

                />

            )}


            {/* ================================================= */}
            {/* CREATE TERRITORY */}
            {/* ================================================= */}

            {showTerritory && (

                <AddNewTerritoty />

            )}


            {/* ================================================= */}
            {/* SUCCESS / ERROR SNACKBAR */}
            {/* ================================================= */}

            <Snackbar

                open={
                    snackbar.open
                }

                autoHideDuration={
                    3000
                }

                onClose={() => {

                    setSnackbar({
                        ...snackbar,
                        open: false,
                    });

                }}

                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
            >

                <Alert

                    severity={
                        snackbar.severity
                    }

                    variant="filled"

                    onClose={() => {

                        setSnackbar({
                            ...snackbar,
                            open: false,
                        });

                    }}

                    sx={{
                        width: "100%",
                    }}
                >

                    {snackbar.message}

                </Alert>

            </Snackbar>

        </Box>

    );

}


export default DivisionOrTerritoty;