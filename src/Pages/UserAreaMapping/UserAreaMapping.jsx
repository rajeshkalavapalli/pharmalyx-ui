import { useState, useEffect } from "react";
import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";

import { getUsers } from "../UserAreaMapping/index.js";


function UserAreaMapping() {

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    console.log("selectedUser", selectedUser);

    const selectedUserDetails = users.find(
        (user) => user.userId === selectedUser
    );

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
                sx={(theme) => ({
                    border: "1px solid",
                    borderColor: theme.palette.border.default,
                    borderRadius: 2.5,
                    p: 3,
                    display: "flex",
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: theme.card.shadow,
                    overflow: "hidden",
                })}
            >
                {/* User */}
                <Box
                    sx={(theme) => ({
                        flex: 1,
                        pr: 3,
                        borderRight: "1px solid",
                        borderColor: theme.palette.border.subtle,
                    })}
                >
                    {/* Step Header */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 1,
                        }}
                    >
                        <Box
                            sx={(theme) => ({
                                width: 34,
                                height: 34,
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                fontSize: 14,
                                fontWeight: 700,
                            })}
                        >
                            1
                        </Box>

                        <Typography
                            variant="h6"
                            sx={(theme) => ({
                                color: theme.palette.text.primary,
                                fontWeight: 700,
                            })}
                        >
                            Select User
                        </Typography>
                    </Box>

                    <Typography
                        variant="body2"
                        sx={(theme) => ({
                            color: theme.palette.text.secondary,
                            mb: 2.5,
                        })}
                    >
                        Choose a user to map territories and areas.
                    </Typography>

                    {/* User Select */}
                    <FormControl fullWidth>
                        <InputLabel>Select User</InputLabel>

                        <Select
                            label="Select User"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            {users.map((user) => (
                                <MenuItem
                                    key={user.userId}
                                    value={user.userId}
                                >
                                    {user.UserName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* User Details */}
                    <Box
                        sx={(theme) => ({
                            mt: 3,
                            p: 2.25,
                            border: "1px solid",
                            borderColor: theme.palette.border.subtle,
                            borderRadius: 2,
                            backgroundColor: theme.palette.surface.subtle,
                        })}
                    >
                        <Typography
                            variant="body2"
                            sx={(theme) => ({
                                color: theme.palette.text.secondary,
                                mb: 0.5,
                            })}
                        >
                            Division
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 600,
                                mb: 1.5,
                            }}
                        >
                            {selectedUserDetails?.DivisionName || "-"}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={(theme) => ({
                                color: theme.palette.text.secondary,
                                mb: 0.5,
                            })}
                        >
                            Designation
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 600,
                                mb: 1.5,
                            }}
                        >
                            {selectedUserDetails?.SldName || "-"}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={(theme) => ({
                                color: theme.palette.text.secondary,
                                mb: 0.5,
                            })}
                        >
                            Status
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={(theme) => ({
                                color: theme.palette.success.main,
                                fontWeight: 600,
                            })}
                        >
                            -
                        </Typography>
                    </Box>
                </Box>

                {/* Territory */}
                <Box
                    sx={(theme) => ({
                        flex: 1,
                        px: 3,
                        borderRight: "1px solid",
                        borderColor: theme.palette.border.subtle,
                    })}
                >
                    <Typography
                        variant="h6"
                        sx={(theme) => ({
                            color: theme.palette.text.primary,
                            fontWeight: 700,
                        })}
                    >
                        Select Territory
                    </Typography>
                </Box>

                {/* Area */}
                <Box
                    sx={{
                        flex: 1,
                        pl: 3,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={(theme) => ({
                            color: theme.palette.text.primary,
                            fontWeight: 700,
                        })}
                    >
                        Select Area
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default UserAreaMapping;