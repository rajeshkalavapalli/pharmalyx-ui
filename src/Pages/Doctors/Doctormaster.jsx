import { Box, Typography, ToggleButtonGroup, ToggleButton, Paper, Divider } from "@mui/material";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
export const Doctormaster = function () {

    const navigate = useNavigate();
    const location = useLocation();
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
            <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
                    <Typography sx={{
                        mb: 0.55,
                        color: "primary.main",
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                        lineHeight: 1,
                        textTransform: "uppercase",
                    }}>
                        DOCTOR / DOCTORS MASTER DATA
                    </Typography>
                    <Typography sx={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 0.5,
                    }}>
                        Manage Doctors
                    </Typography>

                    <Typography sx={{
                        fontSize: 12,
                        color: "text.secondary",
                        mb: 2,
                    }}>
                        View existing Doctors or create a new Doctor.
                    </Typography>

                    <ToggleButtonGroup
                        exclusive
                        value={location.pathname.endsWith('add') ? 'add' : 'list'}
                        onChange={(event, newValue) => {
                            navigate(newValue)
                        }}
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
                        <ToggleButton value='list'>
                            Doctors List
                        </ToggleButton>
                        <ToggleButton value='add'>
                            + Add Doctor
                        </ToggleButton>

                    </ToggleButtonGroup>
            </Box>

            <Divider />

            <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
                <Outlet />
            </Box>
        </Paper>
    )
}