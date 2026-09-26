import {
    Box,
        ToggleButtonGroup,
        ToggleButton,
        Paper,
        Divider,
    Snackbar,
    Alert,
    Typography,
} from "@mui/material";

import { useState } from "react";

import TerritoryList from "../Territory/TerritoryList";
import DivisionList from "./DivisionList";
import AddNewDivision from "./AddNewDivision/AddNewDivision";
import AddNewTerritoty from "../Territory/AddTerritory/AddNewTerritory";


function DivisionOrTerritoty({
    initialTab = "division",
}) {

    const [selectedTab, setSelectedTab] = useState(initialTab);

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

                <Box
                    sx={{
                        px: { xs: 2, sm: 3, md: 4 },
                        py: 3,
                    }}
                >

                <Typography
                    sx={{
                        mb: 0.75,
                        color: "primary.main",
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                        lineHeight: 1,
                        textTransform: "uppercase",
                    }}
                >
                    Administration / Master Data
                </Typography>

                <Typography
                        sx={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "text.primary",
                            mb: 0.5,
                        }}
                    >
                        Manage Organization Structure
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: 12,
                            color: "text.secondary",
                            mb: 2,
                        }}
                    >
                        View existing divisions and territories or create new ones.
                    </Typography>

                    <ToggleButtonGroup
                        exclusive
                        value={selectedTab}
                        sx={{
                            "& .MuiToggleButton-root": {
                                textTransform: "none",
                                fontSize: 13,
                                fontWeight: 600,
                                px: 2.5,
                                py: 1,
                                borderColor: "divider",
                                color: "text.secondary",

                                "&:hover": {
                                    backgroundColor: "action.hover",
                                },

                                "&.Mui-selected": {
                                    color: "primary.main",
                                    backgroundColor: "action.selected",
                                    borderColor: "primary.main",

                                    "&:hover": {
                                        backgroundColor: "action.selected",
                                    },
                                },
                            },
                        }}
                    >
                        <ToggleButton
                            value="division"
                            onClick={() => handleTabChange(null, "division")}
                        >
                            Divisions
                        </ToggleButton>

                        <ToggleButton
                            value="territory"
                            onClick={() => handleTabChange(null, "territory")}
                        >
                            Territories
                        </ToggleButton>
                    </ToggleButtonGroup>

                </Box>

                <Divider />

                <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>


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

            </Paper>

        </Box>
    );
}


export default DivisionOrTerritoty;