import { Box, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useNavigate, Outlet, useLocation } from "react-router-dom";



function UserAreaMappingMaster() {

    const navigate = useNavigate();
    const location = useLocation();



    return (
        <Box>
            <Box>
                <Typography variant="h4" gutterBottom>
                    User Area Mapping
                </Typography>

                <Box>
                    <Box variant="5">
                        <Typography>
                            Map users to their territories and working areas.
                        </Typography>
                    </Box>
                    <Box>
                        <ToggleButtonGroup>
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

                        <Outlet />

                    </Box>


                    <Box />
                </Box>
            </Box>
        </Box>
    )
}

export default UserAreaMappingMaster;