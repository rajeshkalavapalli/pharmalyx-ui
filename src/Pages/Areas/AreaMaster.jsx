import {
    Box,
    Typography,
    ToggleButtonGroup,
    ToggleButton,
    Paper,
    Divider,
} from "@mui/material";

import { useState } from "react";

import ListAreas from "./ListAreas";
import AddNewArea from "./AddNewArea";


function AreaMaster() {

    const [selectedView, setSelectedView] = useState("list");

    const [areaForm, setAreaForm] = useState({
        open: false,
        mode: "create",
        area: null,
    });


    // =====================================================
    // ADD AREA
    // =====================================================

    const handleAddArea = () => {
        setAreaForm({
            open: true,
            mode: "create",
            area: null,
        });
    };


    // =====================================================
    // VIEW AREA
    // =====================================================

    const handleViewArea = (area) => {
        setAreaForm({
            open: true,
            mode: "view",
            area,
        });
    };


    // =====================================================
    // EDIT AREA
    // =====================================================

    const handleEditArea = (area) => {
        setAreaForm({
            open: true,
            mode: "edit",
            area,
        });
    };


    // =====================================================
    // AREA CREATED / UPDATED
    // =====================================================

    const handleAreaCreated = () => {

        setAreaForm({
            open: false,
            mode: "create",
            area: null,
        });

        setSelectedView("list");
    };


    // =====================================================
    // CLOSE AREA FORM
    // =====================================================

    const handleCloseArea = () => {

        setAreaForm({
            open: false,
            mode: "create",
            area: null,
        });

        setSelectedView("list");
    };


    // =====================================================
    // TAB CHANGE
    // =====================================================

   const handleViewChange = (event, newValue) => {
    if (!newValue) return;

    if (newValue === "add") {
        handleAddArea();
        return;
    }

    if (newValue === "list") {
        setSelectedView("list");

        setAreaForm({
            open: false,
            mode: "create",
            area: null,
        });
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

            {/* ================================================= */}
            {/* HEADER / NAVIGATION */}
            {/* ================================================= */}

            <Box
                sx={{
                    px: { xs: 2, sm: 3, md: 4 },
                    py: 3,
                }}
            >

                <Typography
                    sx={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 0.5,
                    }}
                >
                    Manage Areas
                </Typography>

                <Typography
                    sx={{
                        fontSize: 12,
                        color: "text.secondary",
                        mb: 2,
                    }}
                >
                    View existing areas or create a new area.
                </Typography>


                <ToggleButtonGroup
                    exclusive
                    value={
                        areaForm.open
                            ? "add"
                            : selectedView
                    }
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

                    <ToggleButton value="list">
                        List Areas
                    </ToggleButton>

                    <ToggleButton value="add">
                        + Add New Area
                    </ToggleButton>

                </ToggleButtonGroup>

            </Box>


            <Divider />


            {/* ================================================= */}
            {/* CONTENT */}
            {/* ================================================= */}

            <Box
                sx={{
                    px: { xs: 2, sm: 3, md: 4 },
                    py: 3,
                }}
            >

                {!areaForm.open && selectedView === "list" && (
                    <ListAreas
                        onAddArea={handleAddArea}
                        onViewArea={handleViewArea}
                        onEditArea={handleEditArea}
                    />
                )}


                {areaForm.open && (
                    <AddNewArea
                        mode={areaForm.mode}
                        area={areaForm.area}
                        onAreaCreated={handleAreaCreated}
                        onClose={handleCloseArea}
                    />
                )}

            </Box>

        </Paper>
    );
}


export default AreaMaster;