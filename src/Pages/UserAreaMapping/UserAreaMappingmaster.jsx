import { Box, ToggleButtonGroup, ToggleButton, Typography } from "@mui/material";
import { useNavigate, Outlet, useLocation } from "react-router-dom";



function UserAreaMappingMaster() {

    const navigate = useNavigate();
    const location = useLocation();



    return (
        <Box
            sx={(theme) => ({
                width: "100%",
                minHeight: "100%",
                backgroundColor: theme.palette.background.default,
            })}
        >
            <Box>
                    <Box
                        sx={(theme) => ({
                            backgroundColor: theme.palette.background.paper,
                            border: "1px solid",
                            borderColor: theme.palette.border.default,
                            borderRadius: 2.5,
                            boxShadow: "0 6px 24px rgba(32, 37, 34, 0.045)",
                            overflow: "hidden",
                        })}
                    >
                        <Box
                            sx={(theme) => ({
                                px: {
                                    xs: 2.5,
                                    sm: 3.5,
                                },
                                py: 3,

                                borderBottom: "1px solid",
                                borderColor: theme.palette.border.subtle,

                                backgroundColor: theme.palette.background.paper,

                                display: "flex",
                                flexDirection: {
                                    xs: "column",
                                    sm: "row",
                                },
                                alignItems: {
                                    xs: "flex-start",
                                    sm: "center",
                                },
                                justifyContent: "space-between",
                                gap: 2,
                            })}
                        >
                            <Box>
                                <Typography
                                    sx={{
                                        mb: 0.55,
                                        color: "primary.main",
                                        fontSize: 10.5,
                                        fontWeight: 800,
                                        letterSpacing: "0.14em",
                                        lineHeight: 1,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Access & Coverage
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 18,
                                        fontWeight: 750,
                                        color: "text.primary",
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    User Area Mappings
                                </Typography>

                                <Typography
                                    sx={{
                                        mt: 0.35,
                                        fontSize: 12.5,
                                        color: "text.secondary",
                                    }}
                                >
                                    Review user territory coverage and available areas.
                                </Typography>
                            </Box>

                            <ToggleButtonGroup
                                exclusive
                                value={
                                    location.pathname.endsWith("/list")
                                        ? "user-area-mapping-list"
                                        : location.pathname.endsWith("/mapping")
                                            ? "user-area-mapping"
                                            : false
                                }
                                sx={(theme) => ({
                                    backgroundColor:
                                        theme.palette.background.paper,

                                    border: "1px solid",
                                    borderColor:
                                        theme.palette.border.default,

                                    borderRadius: 1.5,
                                    p: 0.35,

                                    "& .MuiToggleButton-root": {
                                        border: "none",
                                        borderRadius: 1.25,

                                        px: {
                                            xs: 1.5,
                                            sm: 2,
                                        },

                                        py: 0.85,

                                        color:
                                            theme.palette.text.secondary,

                                        fontSize: "13px",
                                        fontWeight: 600,
                                        textTransform: "none",

                                        transition:
                                            "background-color 160ms ease, color 160ms ease",

                                        "&:hover": {
                                            backgroundColor:
                                                theme.palette.surface.subtle,
                                        },

                                        "&.Mui-selected": {
                                            backgroundColor:
                                                theme.palette.primary.main,

                                            color:
                                                theme.palette.primary
                                                    .contrastText,

                                            "&:hover": {
                                                backgroundColor:
                                                    theme.palette.primary.dark,
                                            },
                                        },
                                    },
                                })}
                            >
                                <ToggleButton
                                    value="user-area-mapping-list"
                                    selected={location.pathname.endsWith("/list")}
                                    onChange={() => navigate("list")}
                                >
                                    User Area Mapping List
                                </ToggleButton>

                                <ToggleButton
                                    value="user-area-mapping"
                                    selected={location.pathname.endsWith("/mapping")}
                                    onChange={() => navigate("mapping")}
                                >
                                    User Area Mapping
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <Box
                            sx={(theme) => ({
                                p: {
                                    xs: 2,
                                    sm: 3,
                                },

                                backgroundColor:
                                    theme.palette.background.paper,
                            })}
                        >
                            <Outlet />
                        </Box>

                    </Box>


            </Box>
        </Box>
    )
}

export default UserAreaMappingMaster;