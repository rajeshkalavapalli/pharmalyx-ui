import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";

import { getUsers } from "../UserAreaMapping/index.js";


function UserAreaMapping() {

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");

    useEffect(() => {
        const getusers = async () => {
            const usersList = await getUsers();
            console.log("usersusersList from users", usersList);
            setUsers(usersList.result);

        }

        getusers();


    }, []);


    return (
        <Box>
            <Box
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 4,
                    display: "flex",
                }}

            >
                {/* User */}
                <Box sx={{
                    flex: 1,
                    borderRight: "1px solid",
                    borderColor: "divider",
                }}>
                    <Typography variant="h6">
                        Select User
                    </Typography>
                    <Typography variant="body2">
                        Choose a user to map territories and areas.
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Select User</InputLabel>
                        <Select label="Select User"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            {users.map((user) => (
                                <MenuItem 
                                key={user.userId}
                                value={user.userId}>
                
                                {user.UserName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                {/* Territory*/}

                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">
                        Select Territory
                    </Typography>
                </Box>
                {/* Area*/}

                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">
                        Select Area
                    </Typography>
                </Box>
            </Box>

        </Box>
    )
}

export default UserAreaMapping;