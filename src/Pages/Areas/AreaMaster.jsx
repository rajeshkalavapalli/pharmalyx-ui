import {
    Box,
    Typography,
    ToggleButtonGroup,
    ToggleButton,
    Paper,
    Divider,
    IconButton,
    Tooltip,
} from "@mui/material";

import CloseRounded from "@mui/icons-material/CloseRounded";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import ListAreas from "./ListAreas";
import AddNewArea from "./AddNewArea";


function AreaMaster({ initialView = "list" }) {

    const navigate = useNavigate();
    const [activeView, setActiveView] = useState(initialView);

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


            {/* Navigation */}

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
                    value={activeView}
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
                        value="list"
                        onClick={() => {
                            setActiveView("list");
                        }}
                    >
                        List Areas
                    </ToggleButton>


                    <ToggleButton
                        value="add"
                        onClick={() => {
                            setActiveView("add");
                        }}
                    >
                        + Add New Area
                    </ToggleButton>

                </ToggleButtonGroup>

            </Box>

            <Divider />

            <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
                {activeView === "add" ? (
                    <AddNewArea
                        onAreaCreated={() => setActiveView("list")}
                        onClose={() => setActiveView("list")}
                    />
                ) : (
                    <ListAreas onAddArea={() => setActiveView("add")} />
                )}
            </Box>

        </Paper>
    );
}


export default AreaMaster;