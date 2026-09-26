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
    Chip,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/Delete";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CloseIcon from "@mui/icons-material/Close";

import {
    useState,
    useEffect,
    useMemo,
} from "react";

import { getUsers } from "../service/index";


function UserList({ onViewUser }) {

    const [users, setUsers] = useState([]);

    const [searchText, setSearchText] = useState("");

    const [searchField, setSearchField] = useState("Username");


    // =================================================
    // GET USERS
    // =================================================

    useEffect(() => {

        const fetchUsers = async () => {

            try {

                const result = await getUsers();

                setUsers(
                    Array.isArray(result?.result)
                        ? result.result
                        : []
                );

            } catch (err) {

                console.log(
                    "Error getting users:",
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


    // =================================================
    // FILTER FIELD STYLE
    // =================================================

    const filterFieldSx = {

        "& .MuiOutlinedInput-root": {

            height: 44,

            borderRadius: 1.5,

            backgroundColor:
                "background.paper",

            transition:
                "border-color 160ms ease, box-shadow 160ms ease",

            "& fieldset": {

                borderColor:
                    "divider",

            },

            "&:hover fieldset": {

                borderColor:
                    "primary.light",

            },

            "&.Mui-focused": {

                boxShadow: (theme) =>
                    `0 0 0 3px ${alpha(
                        theme.palette.primary.main,
                        0.07
                    )}`,

            },

            "&.Mui-focused fieldset": {

                borderColor:
                    "primary.main",

                borderWidth: 1,

            },

        },

        "& .MuiInputBase-input": {

            fontSize: 13,

            color:
                "text.primary",

        },

        "& .MuiInputBase-input::placeholder": {

            color:
                "text.secondary",

            opacity: 0.72,

        },

        "& .MuiSelect-select": {

            fontSize: 13,

        },

    };


    // =================================================
    // TABLE HEADER STYLE
    // =================================================

    const tableHeaderSx = {

        borderBottom:
            "1px solid",

        borderColor:
            "divider",

        color:
            "text.secondary",

        fontSize: 10.5,

        fontWeight: 700,

        letterSpacing:
            "0.075em",

        textTransform:
            "uppercase",

        whiteSpace:
            "nowrap",

        py: 1.45,

        px: 1.75,

        backgroundColor:
            "surface.subtle",

    };


    // =================================================
    // TABLE CELL STYLE
    // =================================================

    const tableCellSx = {

        borderBottom:
            "1px solid",

        borderColor:
            "divider",

        py: 1.35,

        px: 1.75,

        fontSize: 13,

        color:
            "text.primary",

        whiteSpace:
            "nowrap",

    };


    return (

        <Box
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >

            {/* ================================================= */}
            {/* FILTER TOOLBAR */}
            {/* ================================================= */}

            <Paper
                elevation={0}
                sx={{
                    mb: 2,

                    p: {
                        xs: 1.25,
                        sm: 1.5,
                    },

                    borderRadius: 2,

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    backgroundColor:
                        "background.paper",

                    boxShadow:
                        "0 4px 18px rgba(32, 37, 34, 0.035)",
                }}
            >

                <Box
                    sx={{
                        display: "flex",

                        alignItems: {
                            xs: "stretch",
                            sm: "center",
                        },

                        justifyContent:
                            "space-between",

                        gap: 1.25,

                        flexDirection: {
                            xs: "column",
                            sm: "row",
                        },
                    }}
                >

                    {/* ================================================= */}
                    {/* SEARCH */}
                    {/* ================================================= */}

                    <Box
                        sx={{
                            display: "flex",

                            alignItems: "center",

                            gap: 1,

                            width: {
                                xs: "100%",
                                sm: "auto",
                            },

                            flex: 1,
                        }}
                    >

                        <TextField
                            placeholder={
                                `Search ${searchField.toLowerCase()}...`
                            }

                            value={
                                searchText
                            }

                            onChange={(event) => {

                                setSearchText(
                                    event.target.value
                                );

                            }}

                            size="small"

                            InputProps={{

                                startAdornment: (

                                    <SearchOutlinedIcon
                                        sx={{
                                            mr: 1,
                                            fontSize: 18,
                                            color:
                                                "text.secondary",
                                        }}
                                    />

                                ),

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
                                                        width: 28,
                                                        height: 28,
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

                                                    <CloseIcon
                                                        sx={{
                                                            fontSize: 16,
                                                        }}
                                                    />

                                                </IconButton>

                                            </Tooltip>

                                        )
                                        : null,

                            }}

                            sx={{
                                ...filterFieldSx,

                                width: {
                                    xs: "100%",
                                    sm: 380,
                                },

                                flex: 1,
                            }}
                        />


                        {/* ================================================= */}
                        {/* SEARCH FIELD */}
                        {/* ================================================= */}

                        <TextField
                            select

                            size="small"

                            value={
                                searchField
                            }

                            onChange={(event) => {

                                setSearchField(
                                    event.target.value
                                );

                                setSearchText("");

                            }}

                            sx={{
                                ...filterFieldSx,

                                width: {
                                    xs: 150,
                                    sm: 165,
                                },

                                flexShrink: 0,
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


                    {/* ================================================= */}
                    {/* USER COUNT */}
                    {/* ================================================= */}

                    <Chip
                        label={
                            `${filteredUsers.length} ${
                                filteredUsers.length === 1
                                    ? "User"
                                    : "Users"
                            }`
                        }

                        size="small"

                        sx={(theme) => ({

                            height: 32,

                            px: 0.75,

                            borderRadius: 1.5,

                            fontSize: 11.5,

                            fontWeight: 700,

                            color:
                                "primary.main",

                            backgroundColor:
                                alpha(
                                    theme.palette.primary.main,
                                    0.055
                                ),

                            border:
                                "1px solid",

                            borderColor:
                                alpha(
                                    theme.palette.primary.main,
                                    0.13
                                ),

                            alignSelf: {
                                xs: "flex-start",
                                sm: "center",
                            },

                        })}
                    />

                </Box>

            </Paper>


            {/* ================================================= */}
            {/* USERS TABLE */}
            {/* ================================================= */}

            <TableContainer
                sx={{

                    width: "100%",

                    overflowX: "auto",

                    border: 0,

                    borderRadius: 0,

                    backgroundColor:
                        "transparent",

                    boxShadow: "none",

                    scrollbarWidth:
                        "thin",

                    scrollbarColor:
                        "rgba(104, 113, 107, 0.20) transparent",

                    "&::-webkit-scrollbar": {
                        height: 5,
                    },

                    "&::-webkit-scrollbar-track": {
                        background:
                            "transparent",
                    },

                    "&::-webkit-scrollbar-thumb": {

                        backgroundColor:
                            "rgba(104, 113, 107, 0.20)",

                        borderRadius:
                            10,

                    },

                    "&::-webkit-scrollbar-thumb:hover": {

                        backgroundColor:
                            "rgba(104, 113, 107, 0.35)",

                    },

                }}
            >

                <Table
                    sx={{
                        minWidth: 1080,
                    }}
                >

                    {/* ================================================= */}
                    {/* TABLE HEADER */}
                    {/* ================================================= */}

                    <TableHead>

                        <TableRow>

                            <TableCell
                                sx={{
                                    ...tableHeaderSx,
                                    width: 115,
                                }}
                            >
                                Actions
                            </TableCell>


                            <TableCell
                                sx={{
                                    ...tableHeaderSx,
                                    minWidth: 135,
                                }}
                            >
                                Username
                            </TableCell>


                            <TableCell
                                sx={{
                                    ...tableHeaderSx,
                                    minWidth: 135,
                                }}
                            >
                                Mobile Number
                            </TableCell>


                            <TableCell
                                sx={{
                                    ...tableHeaderSx,
                                    minWidth: 185,
                                }}
                            >
                                Email
                            </TableCell>


                            <TableCell
                                sx={{
                                    ...tableHeaderSx,
                                    minWidth: 125,
                                }}
                            >
                                Designation
                            </TableCell>


                            <TableCell
                                sx={{
                                    ...tableHeaderSx,
                                    minWidth: 155,
                                }}
                            >
                                Reporting Manager
                            </TableCell>


                            <TableCell
                                sx={{
                                    ...tableHeaderSx,
                                    minWidth: 115,
                                }}
                            >
                                Created On
                            </TableCell>


                            <TableCell
                                sx={{
                                    ...tableHeaderSx,
                                    minWidth: 115,
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
                            (user, index) => (

                                <TableRow
                                    key={
                                        user.UserId ||
                                        user.userId ||
                                        user.UserName
                                    }

                                    sx={{

                                        transition:
                                            "background-color 160ms ease",

                                        "& .MuiTableCell-root": {
                                            ...tableCellSx,

                                            backgroundColor:
                                                index % 2 === 0
                                                    ? "background.paper"
                                                    : "background.default",
                                        },

                                        "&:hover .MuiTableCell-root": {

                                            backgroundColor:
                                                (theme) =>
                                                    alpha(
                                                        theme.palette.primary.main,
                                                        0.035
                                                    ),

                                        },

                                        "&:last-child .MuiTableCell-root": {

                                            borderBottom:
                                                0,

                                        },

                                    }}
                                >

                                    {/* ================================================= */}
                                    {/* ACTIONS */}
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

                                            {/* VIEW */}

                                            <Tooltip
                                                title="View User"
                                                arrow
                                            >

                                                <IconButton
                                                    size="small"

                                                    onClick={() =>
                                                        onViewUser?.(
                                                            user
                                                        )
                                                    }

                                                    sx={{
                                                        width: 31,
                                                        height: 31,

                                                        borderRadius:
                                                            1.25,

                                                        color:
                                                            "text.secondary",

                                                        transition:
                                                            "all 150ms ease",

                                                        "&:hover": {

                                                            color:
                                                                "primary.main",

                                                            backgroundColor:
                                                                (theme) =>
                                                                    alpha(
                                                                        theme.palette.primary.main,
                                                                        0.07
                                                                    ),

                                                        },
                                                    }}
                                                >

                                                    <VisibilityOutlinedIcon
                                                        sx={{
                                                            fontSize:
                                                                17,
                                                        }}
                                                    />

                                                </IconButton>

                                            </Tooltip>


                                            {/* EDIT */}

                                            <Tooltip
                                                title="Edit User"
                                                arrow
                                            >

                                                <IconButton
                                                    size="small"

                                                    sx={{
                                                        width: 31,
                                                        height: 31,

                                                        borderRadius:
                                                            1.25,

                                                        color:
                                                            "text.secondary",

                                                        transition:
                                                            "all 150ms ease",

                                                        "&:hover": {

                                                            color:
                                                                "primary.main",

                                                            backgroundColor:
                                                                (theme) =>
                                                                    alpha(
                                                                        theme.palette.primary.main,
                                                                        0.07
                                                                    ),

                                                        },
                                                    }}
                                                >

                                                    <EditOutlinedIcon
                                                        sx={{
                                                            fontSize:
                                                                17,
                                                        }}
                                                    />

                                                </IconButton>

                                            </Tooltip>


                                            {/* DELETE */}

                                            <Tooltip
                                                title="Delete User"
                                                arrow
                                            >

                                                <IconButton
                                                    size="small"

                                                    sx={{
                                                        width: 31,
                                                        height: 31,

                                                        borderRadius:
                                                            1.25,

                                                        color:
                                                            "text.secondary",

                                                        transition:
                                                            "all 150ms ease",

                                                        "&:hover": {

                                                            color:
                                                                "error.main",

                                                            backgroundColor:
                                                                (theme) =>
                                                                    alpha(
                                                                        theme.palette.error.main,
                                                                        0.07
                                                                    ),

                                                        },
                                                    }}
                                                >

                                                    <DeleteOutline
                                                        sx={{
                                                            fontSize:
                                                                17,
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
                                                fontSize:
                                                    13.25,

                                                fontWeight:
                                                    650,

                                                color:
                                                    "text.primary",

                                                letterSpacing:
                                                    "0.005em",

                                                overflow:
                                                    "hidden",

                                                textOverflow:
                                                    "ellipsis",

                                                whiteSpace:
                                                    "nowrap",

                                                maxWidth:
                                                    150,

                                                cursor:
                                                    "pointer",

                                                transition:
                                                    "color 150ms ease",

                                                "&:hover": {

                                                    color:
                                                        "primary.main",

                                                },
                                            }}
                                        >
                                            {
                                                user.UserName ||
                                                "-"
                                            }
                                        </Typography>

                                    </TableCell>


                                    {/* ================================================= */}
                                    {/* MOBILE NUMBER */}
                                    {/* ================================================= */}

                                    <TableCell>

                                        <Typography
                                            sx={{
                                                fontSize:
                                                    13,

                                                fontWeight:
                                                    500,

                                                color:
                                                    "text.secondary",

                                                letterSpacing:
                                                    "0.015em",
                                            }}
                                        >
                                            {
                                                user.MobileNumber ||
                                                "-"
                                            }
                                        </Typography>

                                    </TableCell>


                                    {/* ================================================= */}
                                    {/* EMAIL */}
                                    {/* ================================================= */}

                                    <TableCell>

                                        <Tooltip
                                            title={
                                                user.EmailId ||
                                                ""
                                            }

                                            arrow

                                            disableHoverListener={
                                                !user.EmailId
                                            }
                                        >

                                            <Typography
                                                sx={{
                                                    fontSize:
                                                        13,

                                                    color:
                                                        "text.secondary",

                                                    overflow:
                                                        "hidden",

                                                    textOverflow:
                                                        "ellipsis",

                                                    whiteSpace:
                                                        "nowrap",

                                                    maxWidth:
                                                        190,
                                                }}
                                            >
                                                {
                                                    user.EmailId ||
                                                    "-"
                                                }
                                            </Typography>

                                        </Tooltip>

                                    </TableCell>


                                    {/* ================================================= */}
                                    {/* DESIGNATION */}
                                    {/* ================================================= */}

                                    <TableCell>

                                        <Typography
                                            sx={{
                                                display:
                                                    "inline-flex",

                                                alignItems:
                                                    "center",

                                                minHeight:
                                                    26,

                                                px:
                                                    1,

                                                borderRadius:
                                                    1.25,

                                                fontSize:
                                                    11.5,

                                                fontWeight:
                                                    700,

                                                color:
                                                    "primary.main",

                                                backgroundColor:
                                                    (theme) =>
                                                        alpha(
                                                            theme.palette.primary.main,
                                                            0.055
                                                        ),

                                                border:
                                                    "1px solid",

                                                borderColor:
                                                    (theme) =>
                                                        alpha(
                                                            theme.palette.primary.main,
                                                            0.10
                                                        ),

                                                whiteSpace:
                                                    "nowrap",

                                            }}
                                        >
                                            {
                                                user.SldName ||
                                                "-"
                                            }
                                        </Typography>

                                    </TableCell>


                                    {/* ================================================= */}
                                    {/* REPORTING MANAGER */}
                                    {/* ================================================= */}

                                    <TableCell>

                                        <Tooltip
                                            title={
                                                user.ManagerName ||
                                                user.ManagerId ||
                                                ""
                                            }

                                            arrow

                                            disableHoverListener={
                                                !(user.ManagerName || user.ManagerId)
                                            }
                                        >

                                            <Typography
                                                sx={{
                                                    fontSize:
                                                        13,

                                                    color:
                                                        "text.secondary",

                                                    overflow:
                                                        "hidden",

                                                    textOverflow:
                                                        "ellipsis",

                                                    whiteSpace:
                                                        "nowrap",

                                                    maxWidth:
                                                        155,
                                                }}
                                            >
                                                {
                                                    user.ManagerName ||
                                                    user.ManagerId ||
                                                    "-"
                                                }
                                            </Typography>

                                        </Tooltip>

                                    </TableCell>


                                    {/* ================================================= */}
                                    {/* CREATED ON */}
                                    {/* ================================================= */}

                                    <TableCell>

                                        <Typography
                                            sx={{
                                                fontSize:
                                                    12.25,

                                                color:
                                                    "text.secondary",

                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {
                                                formatDate(
                                                    user.CreatedOn
                                                )
                                            }
                                        </Typography>

                                    </TableCell>


                                    {/* ================================================= */}
                                    {/* MODIFIED ON */}
                                    {/* ================================================= */}

                                    <TableCell>

                                        <Typography
                                            sx={{
                                                fontSize:
                                                    12.25,

                                                color:
                                                    "text.secondary",

                                                whiteSpace:
                                                    "nowrap",
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
                                        borderBottom:
                                            0,

                                        py: 8,

                                        textAlign:
                                            "center",
                                    }}
                                >

                                    <Box
                                        sx={{
                                            display:
                                                "flex",

                                            flexDirection:
                                                "column",

                                            alignItems:
                                                "center",

                                            justifyContent:
                                                "center",

                                            px: 2,
                                        }}
                                    >

                                        <Box
                                            sx={(theme) => ({
                                                width: 44,

                                                height: 44,

                                                mb: 1.5,

                                                display:
                                                    "flex",

                                                alignItems:
                                                    "center",

                                                justifyContent:
                                                    "center",

                                                borderRadius:
                                                    2,

                                                color:
                                                    "primary.main",

                                                backgroundColor:
                                                    alpha(
                                                        theme.palette.primary.main,
                                                        0.055
                                                    ),
                                            })}
                                        >

                                            <SearchOutlinedIcon
                                                sx={{
                                                    fontSize:
                                                        21,
                                                }}
                                            />

                                        </Box>


                                        <Typography
                                            sx={{
                                                fontSize:
                                                    14,

                                                fontWeight:
                                                    700,

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
                                                mt: 0.65,

                                                fontSize:
                                                    12.5,

                                                color:
                                                    "text.secondary",

                                                lineHeight:
                                                    1.5,
                                            }}
                                        >
                                            {
                                                searchText
                                                    ? "Try a different search term or search field."
                                                    : "Users will appear here once they are created."
                                            }
                                        </Typography>

                                    </Box>

                                </TableCell>

                            </TableRow>

                        )}

                    </TableBody>

                </Table>

            </TableContainer>

        </Box>

    );

}


export default UserList;