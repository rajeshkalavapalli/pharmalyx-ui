import {
    Box,
    Tabs,
    Tab,
    Snackbar,
    Alert,
    Typography,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import { useState } from "react";

import TerritoryList from "../Territory/TerritoryList";
import DivisionList from "./DivisionList";
import AddNewDivision from "./AddNewDivision/AddNewDivision";
import AddNewTerritoty from "../Territory/AddTerritory/AddNewTerritory";


function DivisionOrTerritoty() {

    const [selectedTab, setSelectedTab] = useState("division");

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

        if (severity === "success") {
            setShowDivision(false);
        }

        setSnackbar({
            open: true,
            message,
            severity,
        });
    };


    // =====================================================
    // ADD TERRITORY
    // =====================================================

    const handleAddTerritoty = () => {
        setShowTerritory(true);
    };


    // =====================================================
    // TERRITORY CREATED
    // =====================================================

    const handleTerritoryCreated = (
        message = "Territory created successfully",
        severity = "success"
    ) => {

        if (severity === "success") {
            setShowTerritory(false);
        }

        setSnackbar({
            open: true,
            message,
            severity,
        });
    };


    // =====================================================
    // TAB CHANGE
    // =====================================================

    const handleTabChange = (event, newValue) => {

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
                    mb: {
                        xs: 2.5,
                        md: 2.5,
                    },
                }}
            >

                <Typography
                    variant="h5"
                    sx={{
                        fontSize: {
                            xs: 20,
                            md: 22,
                        },
                        fontWeight: 700,
                        color: "text.primary",
                        letterSpacing: "-0.025em",
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
                    View and manage divisions and territories.
                </Typography>

            </Box>


            {/* ================================================= */}
            {/* MODULE TABS */}
            {/* ================================================= */}

            <Box
                sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    mb: {
                        xs: 2.5,
                        md: 3,
                    },
                }}
            >

                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    aria-label="Organization structure tabs"
                    sx={{
                        minHeight: 40,

                        "& .MuiTabs-flexContainer": {
                            gap: 0.5,
                        },

                        "& .MuiTabs-indicator": {
                            height: 2,
                            borderRadius: "2px 2px 0 0",
                            backgroundColor: "primary.main",
                        },

                        "& .MuiTab-root": {
                            minHeight: 40,
                            minWidth: 0,
                            px: 1.25,
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
                            fontWeight: 700,
                        },
                    }}
                >

                    <Tab
                        value="division"
                        label="Divisions"
                    />

                    <Tab
                        value="territory"
                        label="Territories"
                    />

                </Tabs>

            </Box>


            {/* ================================================= */}
            {/* DIVISION LIST */}
            {/* ================================================= */}

            {selectedTab === "division" &&
                !showDivision && (

                    <DivisionList
                        handleAddDiv={handleAddDiv}
                    />

                )
            }


            {/* ================================================= */}
            {/* TERRITORY LIST */}
            {/* ================================================= */}

            {selectedTab === "territory" &&
                !showTerritory && (

                    <TerritoryList
                        handleAddTerritoty={
                            handleAddTerritoty
                        }
                    />

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

                <AddNewTerritoty
                    onTerritoryCreated={
                        handleTerritoryCreated
                    }
                    onClose={() =>
                        setShowTerritory(false)
                    }
                />

            )}


            {/* ================================================= */}
            {/* SUCCESS / ERROR SNACKBAR */}
            {/* ================================================= */}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
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
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={() => {

                        setSnackbar({
                            ...snackbar,
                            open: false,
                        });

                    }}
                    sx={(theme) => ({
                        width: "100%",
                        borderRadius: 2,
                        fontSize: 13,
                        fontWeight: 600,
                        boxShadow: theme.shadows[6],
                    })}
                >
                    {snackbar.message}
                </Alert>

            </Snackbar>

        </Box>
    );
}


export default DivisionOrTerritoty;