import {
    Box,
    Typography,
    Paper,
    Table,
    TableContainer,
    TableHead,
    TableCell,
    TableRow,
    TableBody,
    Tooltip,
    IconButton,
} from "@mui/material";

import {
    Visibility,
    Edit,
    Delete,
} from "@mui/icons-material";

import { getUsers } from "../service/index";

import {
    useState,
    useEffect,
} from "react";


function UserList({ onViewUser }) {

    const [users, setUsers] = useState([]);


    useEffect(() => {

        const fetchUsers = async () => {

            const result = await getUsers();

            console.log("users from api:", result);

            setUsers(result.result);
        };

        fetchUsers();

    }, []);


    const formatDate = (date) => {

        if (!date) return "";

        return new Date(date).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    return (
        <Box
            sx={{
                width: "100%",
            }}
        >

            {/* ================================================= */}
            {/* TABLE TITLE */}
            {/* ================================================= */}

            <Box
                sx={{
                    display: "flex",

                    alignItems: "center",

                    justifyContent: "space-between",

                    mb: 1.25,

                    px: 0.25,
                }}
            >

                <Typography
                    sx={{
                        fontSize: 14,

                        fontWeight: 650,

                        color: "text.primary",

                        letterSpacing: "-0.01em",
                    }}
                >
                    Users
                </Typography>


                <Typography
                    sx={{
                        fontSize: 12,

                        color: "text.secondary",

                        fontWeight: 500,
                    }}
                >
                    {users.length}{" "}
                    {users.length === 1
                        ? "user"
                        : "users"}
                </Typography>

            </Box>


            {/* ================================================= */}
            {/* TABLE */}
            {/* ================================================= */}

            <Paper
                elevation={0}
                sx={{
                    width: "100%",

                    overflow: "hidden",

                    border: "1px solid",

                    borderColor: "divider",

                    borderRadius: 2.5,

                    backgroundColor:
                        "background.paper",
                }}
            >

                <TableContainer
                    sx={{
                        width: "100%",

                        overflowX: "auto",

                        "&::-webkit-scrollbar": {
                            height: 6,
                        },

                        "&::-webkit-scrollbar-track": {
                            backgroundColor:
                                "background.default",
                        },

                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor:
                                "divider",

                            borderRadius: 10,
                        },
                    }}
                >

                    <Table
                        sx={{
                            minWidth: 1050,
                        }}
                    >

                        {/* ================================================= */}
                        {/* HEADER */}
                        {/* ================================================= */}

                        <TableHead>

                            <TableRow
                                sx={{
                                    backgroundColor:
                                        "background.default",

                                    "& .MuiTableCell-root": {
                                        borderBottom:
                                            "1px solid",

                                        borderColor:
                                            "divider",

                                        color:
                                            "text.secondary",

                                        fontSize: 11,

                                        fontWeight: 650,

                                        letterSpacing:
                                            "0.025em",

                                        whiteSpace:
                                            "nowrap",

                                        py: 1.5,
                                    },
                                }}
                            >

                                <TableCell
                                    sx={{
                                        width: 120,
                                    }}
                                >
                                    Action
                                </TableCell>

                                <TableCell>
                                    Username
                                </TableCell>

                                <TableCell>
                                    Mobile Number
                                </TableCell>

                                <TableCell>
                                    Email
                                </TableCell>

                                <TableCell>
                                    Designation
                                </TableCell>

                                <TableCell>
                                    Reporting Manager
                                </TableCell>

                                <TableCell>
                                    Created On
                                </TableCell>

                                <TableCell>
                                    Modified On
                                </TableCell>

                            </TableRow>

                        </TableHead>


                        {/* ================================================= */}
                        {/* BODY */}
                        {/* ================================================= */}

                        <TableBody>

                            {users.map((user) => (

                                <TableRow
                                    key={user.userId}

                                    hover

                                    sx={{
                                        "&:last-child td": {
                                            borderBottom: 0,
                                        },

                                        "& .MuiTableCell-root": {
                                            borderBottom:
                                                "1px solid",

                                            borderColor:
                                                "divider",

                                            py: 1.65,

                                            fontSize: 12.5,

                                            color:
                                                "text.primary",

                                            whiteSpace:
                                                "nowrap",
                                        },

                                        transition:
                                            "background-color 160ms ease",

                                        "&:hover": {
                                            backgroundColor:
                                                "sidebar.hover",
                                        },
                                    }}
                                >

                                    {/* ================================================= */}
                                    {/* ACTION */}
                                    {/* ================================================= */}

                                    <TableCell>

                                        <Box
                                            sx={{
                                                display: "flex",

                                                alignItems:
                                                    "center",

                                                gap: 0.25,
                                            }}
                                        >

                                            <Tooltip
                                                title="View"
                                                arrow
                                            >
                                                <IconButton
                                                    size="small"

                                                    onClick={() =>
                                                        onViewUser(
                                                            user
                                                        )
                                                    }

                                                    sx={{
                                                        width: 30,

                                                        height: 30,

                                                        borderRadius:
                                                            1,

                                                        color:
                                                            "text.secondary",

                                                        "&:hover": {
                                                            color:
                                                                "primary.main",

                                                            backgroundColor:
                                                                "action.hover",
                                                        },
                                                    }}
                                                >
                                                    <Visibility
                                                        sx={{
                                                            fontSize: 17,
                                                        }}
                                                    />
                                                </IconButton>
                                            </Tooltip>


                                            <Tooltip
                                                title="Edit"
                                                arrow
                                            >
                                                <IconButton
                                                    size="small"

                                                    sx={{
                                                        width: 30,

                                                        height: 30,

                                                        borderRadius:
                                                            1,

                                                        color:
                                                            "text.secondary",

                                                        "&:hover": {
                                                            color:
                                                                "primary.main",

                                                            backgroundColor:
                                                                "action.hover",
                                                        },
                                                    }}
                                                >
                                                    <Edit
                                                        sx={{
                                                            fontSize: 17,
                                                        }}
                                                    />
                                                </IconButton>
                                            </Tooltip>


                                            <Tooltip
                                                title="Delete"
                                                arrow
                                            >
                                                <IconButton
                                                    size="small"

                                                    sx={{
                                                        width: 30,

                                                        height: 30,

                                                        borderRadius:
                                                            1,

                                                        color:
                                                            "text.secondary",

                                                        "&:hover": {
                                                            color:
                                                                "error.main",

                                                            backgroundColor:
                                                                "action.hover",
                                                        },
                                                    }}
                                                >
                                                    <Delete
                                                        sx={{
                                                            fontSize: 17,
                                                        }}
                                                    />
                                                </IconButton>
                                            </Tooltip>

                                        </Box>

                                    </TableCell>


                                    {/* ================================================= */}
                                    {/* USERNAME */}
                                    {/* ================================================= */}

                                    <TableCell>

                                        <Typography
                                            sx={{
                                                fontSize: 12.5,

                                                fontWeight: 600,

                                                color:
                                                    "text.primary",
                                            }}
                                        >
                                            {user.UserName}
                                        </Typography>

                                    </TableCell>


                                    {/* ================================================= */}
                                    {/* MOBILE */}
                                    {/* ================================================= */}

                                    <TableCell>
                                        {user.MobileNumber}
                                    </TableCell>


                                    {/* ================================================= */}
                                    {/* EMAIL */}
                                    {/* ================================================= */}

                                    <TableCell>
                                        {user.EmailId}
                                    </TableCell>


                                    {/* ================================================= */}
                                    {/* DESIGNATION */}
                                    {/* ================================================= */}

                                    <TableCell>
                                        {user.SldName || "-"}
                                    </TableCell>


                                    {/* ================================================= */}
                                    {/* REPORTING MANAGER */}
                                    {/* ================================================= */}

                                    <TableCell>
                                        {user.ManagerId || "-"}
                                    </TableCell>


                                    {/* ================================================= */}
                                    {/* CREATED ON */}
                                    {/* ================================================= */}

                                    <TableCell>
                                        {formatDate(
                                            user.CreatedOn
                                        )}
                                    </TableCell>


                                    {/* ================================================= */}
                                    {/* MODIFIED ON */}
                                    {/* ================================================= */}

                                    <TableCell>
                                        {formatDate(
                                            user.ModifiedOn
                                        )}
                                    </TableCell>

                                </TableRow>

                            ))}


                            {/* ================================================= */}
                            {/* EMPTY STATE */}
                            {/* ================================================= */}

                            {users.length === 0 && (

                                <TableRow>

                                    <TableCell
                                        colSpan={8}

                                        sx={{
                                            borderBottom: 0,

                                            py: 7,

                                            textAlign:
                                                "center",
                                        }}
                                    >

                                        <Typography
                                            sx={{
                                                fontSize: 13,

                                                fontWeight: 600,

                                                color:
                                                    "text.primary",
                                            }}
                                        >
                                            No users found
                                        </Typography>


                                        <Typography
                                            sx={{
                                                mt: 0.5,

                                                fontSize: 12,

                                                color:
                                                    "text.secondary",
                                            }}
                                        >
                                            Users will appear here
                                            once they are created.
                                        </Typography>

                                    </TableCell>

                                </TableRow>

                            )}

                        </TableBody>

                    </Table>

                </TableContainer>

            </Paper>

        </Box>
    );
}


export default UserList;