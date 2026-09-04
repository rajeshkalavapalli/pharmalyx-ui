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
    TextField,
    MenuItem,
} from "@mui/material";

import {
    Visibility,
    Edit,
    Delete,
    Search,
    Close,
} from "@mui/icons-material";

import {
    useState,
    useEffect,
    useMemo,
} from "react";

import { getUsers } from "../service/index";


function UserList({ onViewUser }) {

    const [users, setUsers] = useState([]);

    const [searchText, setSearchText] =
        useState("");

    const [searchField, setSearchField] =
        useState("Username");


    // =================================================
    // GET USERS
    // =================================================

    useEffect(() => {

        const fetchUsers = async () => {

            try {

                const result =
                    await getUsers();

                console.log(
                    "users from api:",
                    result
                );

                setUsers(
                    Array.isArray(result?.result)
                        ? result.result
                        : []
                );

            } catch (err) {

                console.log(
                    "error getting users:",
                    err
                );

                setUsers([]);

            }

        };

        fetchUsers();

    }, []);


    // =================================================
    // DATE FORMAT
    // =================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    // =================================================
    // GET SEARCH VALUE
    // =================================================

    const getSearchValue = (user) => {

        switch (searchField) {

            case "Username":
                return user.UserName || "";

            case "Mobile Number":
                return user.MobileNumber || "";

            case "Email":
                return user.EmailId || "";

            case "Designation":
                return user.SldName || "";

            case "Reporting Manager":
                return user.ManagerId || "";

            default:
                return "";

        }

    };


    // =================================================
    // FILTER USERS
    // =================================================

    const filteredUsers = useMemo(() => {

        const search =
            searchText
                .trim()
                .toLowerCase();


        if (!search) {
            return users;
        }


        return users.filter((user) => {

            const value =
                getSearchValue(user)
                    .toString()
                    .toLowerCase();

            return value.includes(search);

        });

    }, [
        users,
        searchText,
        searchField,
    ]);


    // =================================================
    // CLEAR SEARCH
    // =================================================

    const handleClearSearch = () => {

        setSearchText("");

    };


    return (

        <Box
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >


            {/* ================================================= */}
            {/* SECTION HEADER */}
            {/* ================================================= */}

            <Box
                sx={{
                    display: "flex",

                    alignItems: "center",

                    justifyContent:
                        "space-between",

                    mb: 1.5,
                }}
            >

                <Box>

                    <Typography
                        sx={{
                            fontSize: 15,

                            fontWeight: 650,

                            color:
                                "text.primary",

                            letterSpacing:
                                "-0.015em",

                            lineHeight: 1.3,
                        }}
                    >
                        Users
                    </Typography>


                    <Typography
                        sx={{
                            mt: 0.35,

                            fontSize: 12,

                            color:
                                "text.secondary",
                        }}
                    >
                        View and manage registered users.
                    </Typography>

                </Box>


                <Box
                    sx={{
                        px: 1.25,

                        py: 0.5,

                        borderRadius: 1.5,

                        backgroundColor:
                            "action.hover",

                        border: "1px solid",

                        borderColor:
                            "divider",
                    }}
                >

                    <Typography
                        sx={{
                            fontSize: 12,

                            fontWeight: 600,

                            color:
                                "text.secondary",
                        }}
                    >
                        {filteredUsers.length}{" "}

                        {filteredUsers.length === 1
                            ? "User"
                            : "Users"}
                    </Typography>

                </Box>

            </Box>


            {/* ================================================= */}
            {/* FILTER TOOLBAR */}
            {/* ================================================= */}

            <Paper
                elevation={0}

                sx={{
                    mb: 2,

                    p: 1.25,

                    borderRadius: 2,

                    border: "1px solid",

                    borderColor:
                        "divider",

                    backgroundColor:
                        "background.paper",
                }}
            >

                <Box
                    sx={{
                        display: "flex",

                        alignItems: "center",

                        gap: 1,

                        flexWrap: "wrap",
                    }}
                >


                    {/* SEARCH */}

                    <TextField
                        fullWidth

                        placeholder={
                            `Search ${searchField.toLowerCase()}...`
                        }

                        value={searchText}

                        onChange={(event) => {

                            setSearchText(
                                event.target.value
                            );

                        }}

                        size="small"

                        slotProps={{
                            input: {

                                startAdornment:
                                    <Search
                                        sx={{
                                            mr: 1,

                                            fontSize: 18,

                                            color:
                                                "text.secondary",
                                        }}
                                    />,

                                endAdornment:
                                    searchText
                                        ? (

                                            <Tooltip
                                                title="Clear search"
                                                arrow
                                            >

                                                <IconButton
                                                    size="small"

                                                    onClick={
                                                        handleClearSearch
                                                    }

                                                    sx={{
                                                        width: 26,

                                                        height: 26,

                                                        color:
                                                            "text.secondary",

                                                        "&:hover": {

                                                            color:
                                                                "text.primary",

                                                            backgroundColor:
                                                                "action.hover",

                                                        },
                                                    }}
                                                >

                                                    <Close
                                                        sx={{
                                                            fontSize: 16,
                                                        }}
                                                    />

                                                </IconButton>

                                            </Tooltip>

                                        )
                                        : null,

                            },
                        }}

                        sx={{
                            maxWidth: 440,

                            flexGrow: 1,

                            "& .MuiOutlinedInput-root": {

                                height: 40,

                                borderRadius: 1.5,

                                backgroundColor:
                                    "background.default",

                                "& fieldset": {

                                    borderColor:
                                        "divider",

                                },

                                "&:hover fieldset": {

                                    borderColor:
                                        "primary.light",

                                },

                                "&.Mui-focused fieldset": {

                                    borderColor:
                                        "primary.main",

                                    borderWidth: 1,

                                },

                            },

                            "& .MuiInputBase-input": {

                                fontSize: 13,

                            },
                        }}
                    />


                    {/* SEARCH FIELD SELECT */}

                    <TextField
                        select

                        size="small"

                        value={searchField}

                        onChange={(event) => {

                            setSearchField(
                                event.target.value
                            );

                            setSearchText("");

                        }}

                        sx={{
                            width: 190,

                            flexShrink: 0,

                            "& .MuiOutlinedInput-root": {

                                height: 40,

                                borderRadius: 1.5,

                                backgroundColor:
                                    "background.default",

                                "& fieldset": {

                                    borderColor:
                                        "divider",

                                },

                                "&:hover fieldset": {

                                    borderColor:
                                        "primary.light",

                                },

                                "&.Mui-focused fieldset": {

                                    borderColor:
                                        "primary.main",

                                    borderWidth: 1,

                                },

                            },

                            "& .MuiSelect-select": {

                                fontSize: 13,

                            },
                        }}
                    >

                        <MenuItem value="Username">
                            Username
                        </MenuItem>

                        <MenuItem value="Mobile Number">
                            Mobile Number
                        </MenuItem>

                        <MenuItem value="Email">
                            Email
                        </MenuItem>

                        <MenuItem value="Designation">
                            Designation
                        </MenuItem>

                        <MenuItem value="Reporting Manager">
                            Reporting Manager
                        </MenuItem>

                    </TextField>

                </Box>

            </Paper>


            {/* ================================================= */}
            {/* USERS TABLE */}
            {/* ================================================= */}

            <Paper
                elevation={0}

                sx={{
                    width: "100%",

                    overflow: "hidden",

                    borderRadius: 2,

                    border: "1px solid",

                    borderColor:
                        "divider",

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
                            minWidth: 1100,
                        }}
                    >


                        {/* ================================================= */}
                        {/* TABLE HEADER */}
                        {/* ================================================= */}

                        <TableHead>

                            <TableRow
                                sx={{

                                    backgroundColor:
                                        "action.hover",

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
                                            "0.035em",

                                        textTransform:
                                            "uppercase",

                                        whiteSpace:
                                            "nowrap",

                                        py: 1.4,
                                    },

                                }}
                            >

                                <TableCell
                                    sx={{
                                        width: 110,
                                    }}
                                >
                                    Actions
                                </TableCell>


                                <TableCell
                                    sx={{
                                        minWidth: 150,
                                    }}
                                >
                                    Username
                                </TableCell>


                                <TableCell
                                    sx={{
                                        minWidth: 140,
                                    }}
                                >
                                    Mobile Number
                                </TableCell>


                                <TableCell
                                    sx={{
                                        minWidth: 220,
                                    }}
                                >
                                    Email
                                </TableCell>


                                <TableCell
                                    sx={{
                                        minWidth: 150,
                                    }}
                                >
                                    Designation
                                </TableCell>


                                <TableCell
                                    sx={{
                                        minWidth: 180,
                                    }}
                                >
                                    Reporting Manager
                                </TableCell>


                                <TableCell
                                    sx={{
                                        minWidth: 120,
                                    }}
                                >
                                    Created On
                                </TableCell>


                                <TableCell
                                    sx={{
                                        minWidth: 120,
                                    }}
                                >
                                    Modified On
                                </TableCell>

                            </TableRow>

                        </TableHead>


                        {/* ================================================= */}
                        {/* TABLE BODY */}
                        {/* ================================================= */}

                        <TableBody>

                            {filteredUsers.map(
                                (user) => (

                                    <TableRow
                                        key={
                                            user.userId ||
                                            user.UserId ||
                                            user.UserName
                                        }

                                        sx={{

                                            transition:
                                                "background-color 160ms ease",

                                            "& .MuiTableCell-root": {

                                                borderBottom:
                                                    "1px solid",

                                                borderColor:
                                                    "divider",

                                                py: 1.5,

                                                fontSize: 12.5,

                                                color:
                                                    "text.primary",

                                                whiteSpace:
                                                    "nowrap",

                                            },

                                            "&:hover": {

                                                backgroundColor:
                                                    "action.hover",

                                            },

                                            "&:last-child .MuiTableCell-root": {

                                                borderBottom: 0,

                                            },

                                        }}
                                    >


                                        {/* ACTIONS */}

                                        <TableCell>

                                            <Box
                                                sx={{
                                                    display:
                                                        "flex",

                                                    alignItems:
                                                        "center",

                                                    gap: 0.5,
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

                                                            borderRadius: 1.25,

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

                                                            borderRadius: 1.25,

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

                                                            borderRadius: 1.25,

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


                                        {/* USERNAME */}

                                        <TableCell>

                                            <Typography
                                                sx={{
                                                    fontSize: 12.5,

                                                    fontWeight: 600,

                                                    color:
                                                        "text.primary",

                                                    overflow:
                                                        "hidden",

                                                    textOverflow:
                                                        "ellipsis",

                                                    whiteSpace:
                                                        "nowrap",

                                                    maxWidth: 150,
                                                }}
                                            >
                                                {
                                                    user.UserName ||
                                                    "-"
                                                }
                                            </Typography>

                                        </TableCell>


                                        {/* MOBILE */}

                                        <TableCell>

                                            <Typography
                                                sx={{
                                                    fontSize: 12.5,

                                                    color:
                                                        "text.secondary",
                                                }}
                                            >
                                                {
                                                    user.MobileNumber ||
                                                    "-"
                                                }
                                            </Typography>

                                        </TableCell>


                                        {/* EMAIL */}

                                        <TableCell>

                                            <Typography
                                                sx={{
                                                    fontSize: 12.5,

                                                    color:
                                                        "text.secondary",

                                                    overflow:
                                                        "hidden",

                                                    textOverflow:
                                                        "ellipsis",

                                                    whiteSpace:
                                                        "nowrap",

                                                    maxWidth: 220,
                                                }}
                                            >
                                                {
                                                    user.EmailId ||
                                                    "-"
                                                }
                                            </Typography>

                                        </TableCell>


                                        {/* DESIGNATION */}

                                        <TableCell>

                                            <Typography
                                                sx={{
                                                    fontSize: 12.5,

                                                    color:
                                                        "text.secondary",
                                                }}
                                            >
                                                {
                                                    user.SldName ||
                                                    "-"
                                                }
                                            </Typography>

                                        </TableCell>


                                        {/* REPORTING MANAGER */}

                                        <TableCell>

                                            <Typography
                                                sx={{
                                                    fontSize: 12.5,

                                                    color:
                                                        "text.secondary",
                                                }}
                                            >
                                                {
                                                    user.ManagerId ||
                                                    "-"
                                                }
                                            </Typography>

                                        </TableCell>


                                        {/* CREATED ON */}

                                        <TableCell>

                                            <Typography
                                                sx={{
                                                    fontSize: 12,

                                                    color:
                                                        "text.secondary",
                                                }}
                                            >
                                                {
                                                    formatDate(
                                                        user.CreatedOn
                                                    )
                                                }
                                            </Typography>

                                        </TableCell>


                                        {/* MODIFIED ON */}

                                        <TableCell>

                                            <Typography
                                                sx={{
                                                    fontSize: 12,

                                                    color:
                                                        "text.secondary",
                                                }}
                                            >
                                                {
                                                    formatDate(
                                                        user.ModifiedOn
                                                    )
                                                }
                                            </Typography>

                                        </TableCell>

                                    </TableRow>

                                )
                            )}


                            {/* ================================================= */}
                            {/* EMPTY STATE */}
                            {/* ================================================= */}

                            {filteredUsers.length === 0 && (

                                <TableRow>

                                    <TableCell
                                        colSpan={8}

                                        sx={{
                                            borderBottom: 0,

                                            py: 8,

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
                                            {
                                                searchText
                                                    ? "No users match your search"
                                                    : "No users found"
                                            }
                                        </Typography>


                                        <Typography
                                            sx={{
                                                mt: 0.75,

                                                fontSize: 12,

                                                color:
                                                    "text.secondary",
                                            }}
                                        >
                                            {
                                                searchText
                                                    ? "Try a different search term or filter."
                                                    : "Users will appear here once they are created."
                                            }
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