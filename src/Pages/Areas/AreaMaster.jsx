import {
    Box,
    Typography,
    ToggleButtonGroup,
    ToggleButton,
    Paper,
    Divider,
} from "@mui/material";

import { useNavigate } from "react-router-dom";


function AreaMaster() {

    const navigate = useNavigate();

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

            {/* Header */}

            <Box
                sx={{
                    px: { xs: 2, sm: 3, md: 4 },
                    py: 3,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                }}
            >

                <Box
                    sx={{
                        width: 4,
                        minHeight: 42,
                        borderRadius: 2,
                        backgroundColor: "primary.main",
                    }}
                />

                <Box>

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            lineHeight: 1.3,
                        }}
                    >
                        Area Master
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            mt: 0.5,
                            color: "text.secondary",
                            fontSize: 13,
                        }}
                    >
                        Create and manage geographical working areas.
                    </Typography>

                </Box>

            </Box>


            <Divider />


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
                            navigate("/admin/Areas/list");
                        }}
                    >
                        List Areas
                    </ToggleButton>


                    <ToggleButton
                        value="add"
                        onClick={() => {
                            navigate("/admin/Areas/add");
                        }}
                    >
                        + Add New Area
                    </ToggleButton>

                </ToggleButtonGroup>

            </Box>

        </Paper>
    );
}


export default AreaMaster;