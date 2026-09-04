import {
    Box,
    Typography,
    Button,
    TextField,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Select,
    MenuItem,
    IconButton,
    Paper,
    Chip,
    Tooltip,
    InputAdornment,
} from "@mui/material";

import { useEffect, useState } from "react";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Delete from "@mui/icons-material/Delete";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import { getDivisions } from "../Division/index";


function DivisionList({ handleAddDiv }) {

    const [status, setStatus] = useState("All");

    const [search, setSearch] = useState("");

    const [divisions, setDivisions] = useState([]);


    // =====================================================
    // LOAD DIVISIONS
    // =====================================================

    useEffect(() => {

        loadDivisions();

    }, []);


    const loadDivisions = async () => {

        try {

            const response = await getDivisions();

            console.log(
                "divisions from API:",
                response
            );

            setDivisions(
                Array.isArray(response)
                    ? response
                    : []
            );

        } catch (err) {

            console.log(
                "error getting divisions:",
                err
            );

            setDivisions([]);

        }

    };


    // =====================================================
    // SEARCH + STATUS FILTER
    // =====================================================

    const filteredDivisions =
        divisions.filter((division) => {

            const divisionName =
                division.DivisionName || "";

            const matchesSearch =
                divisionName
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );


            const matchesStatus =
                status === "All" ||
                (
                    status === "Active" &&
                    division.IsActive === true
                ) ||
                (
                    status === "Inactive" &&
                    division.IsActive === false
                );


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "-";
        }


        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
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
            {/* LIST TOOLBAR */}
            {/* ================================================= */}

            <Box
                sx={{

                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: {
                        xs: "stretch",
                        sm: "center",
                    },

                    flexDirection: {
                        xs: "column",
                        sm: "row",
                    },

                    gap: 2,

                    mb: 2.25,

                }}
            >


                {/* ================================================= */}
                {/* LEFT SIDE */}
                {/* ================================================= */}

                <Box>

                    <Typography
                        sx={{

                            fontSize: 15,

                            fontWeight: 650,

                            color: "text.primary",

                            letterSpacing: "-0.015em",

                            lineHeight: 1.3,

                        }}
                    >
                        Divisions
                    </Typography>


                    <Typography
                        sx={{

                            mt: 0.35,

                            fontSize: 12,

                            color: "text.secondary",

                            lineHeight: 1.5,

                        }}
                    >
                        Manage and maintain organization divisions.
                    </Typography>

                </Box>


                {/* ================================================= */}
                {/* ADD DIVISION */}
                {/* ================================================= */}

                <Button
                    variant="contained"

                    onClick={handleAddDiv}

                    sx={{

                        minWidth: 138,

                        height: 40,

                        px: 2.25,

                        borderRadius: 1.5,

                        textTransform: "none",

                        fontSize: 13,

                        fontWeight: 600,

                        alignSelf: {
                            xs: "flex-start",
                            sm: "center",
                        },

                        boxShadow: "none",

                        "&:hover": {

                            boxShadow: "none",

                        },

                    }}
                >
                    + Add Division
                </Button>

            </Box>


            {/* ================================================= */}
            {/* FILTER TOOLBAR */}
            {/* ================================================= */}

            <Paper
                elevation={0}

                sx={{

                    mb: 1.75,

                    px: {
                        xs: 1.5,
                        md: 2,
                    },

                    py: 1.25,

                    border: "1px solid",

                    borderColor: "divider",

                    borderRadius: 2,

                    backgroundColor: "background.paper",

                }}
            >

                <Box
                    sx={{

                        display: "flex",

                        justifyContent: "space-between",

                        alignItems: {
                            xs: "flex-start",
                            md: "center",
                        },

                        flexDirection: {
                            xs: "column",
                            md: "row",
                        },

                        gap: 1.5,

                    }}
                >


                    {/* ================================================= */}
                    {/* FILTERS */}
                    {/* ================================================= */}

                    <Box
                        sx={{

                            display: "flex",

                            alignItems: "center",

                            gap: 1.25,

                            flexWrap: "wrap",

                            width: {
                                xs: "100%",
                                md: "auto",
                            },

                        }}
                    >


                        {/* SEARCH */}

                        <TextField
                            size="small"

                            placeholder="Search divisions"

                            value={search}

                            onChange={(event) => {

                                setSearch(
                                    event.target.value
                                );

                            }}

                            sx={{

                                width: {
                                    xs: "100%",
                                    sm: 280,
                                },

                                "& .MuiOutlinedInput-root": {

                                    height: 38,

                                    borderRadius: 1.5,

                                    fontSize: 13,

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

                                    },

                                },

                            }}

                            InputProps={{

                                startAdornment: (

                                    <InputAdornment
                                        position="start"
                                    >

                                        <SearchOutlinedIcon
                                            sx={{

                                                fontSize: 18,

                                                color:
                                                    "text.secondary",

                                            }}
                                        />

                                    </InputAdornment>

                                ),

                            }}
                        />


                        {/* STATUS FILTER */}

                        <Select
                            size="small"

                            value={status}

                            onChange={(event) => {

                                setStatus(
                                    event.target.value
                                );

                            }}

                            sx={{

                                minWidth: 130,

                                height: 38,

                                borderRadius: 1.5,

                                fontSize: 13,

                                backgroundColor:
                                    "background.default",

                                "& .MuiOutlinedInput-notchedOutline": {

                                    borderColor:
                                        "divider",

                                },

                                "&:hover .MuiOutlinedInput-notchedOutline": {

                                    borderColor:
                                        "primary.light",

                                },

                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {

                                    borderColor:
                                        "primary.main",

                                },

                            }}
                        >

                            <MenuItem value="All">
                                All Status
                            </MenuItem>

                            <MenuItem value="Active">
                                Active
                            </MenuItem>

                            <MenuItem value="Inactive">
                                Inactive
                            </MenuItem>

                        </Select>

                    </Box>


                    {/* ================================================= */}
                    {/* RESULT COUNT */}
                    {/* ================================================= */}

                    <Typography
                        sx={{

                            fontSize: 12,

                            color: "text.secondary",

                            whiteSpace: "nowrap",

                        }}
                    >
                        {filteredDivisions.length}{" "}

                        {filteredDivisions.length === 1
                            ? "division"
                            : "divisions"}
                    </Typography>

                </Box>

            </Paper>


            {/* ================================================= */}
            {/* TABLE */}
            {/* ================================================= */}

            <TableContainer
                component={Paper}

                elevation={0}

                sx={{

                    border: "1px solid",

                    borderColor: "divider",

                    borderRadius: 2,

                    overflow: "hidden",

                    backgroundColor:
                        "background.paper",

                }}
            >

                <Table
                    sx={{

                        tableLayout: "fixed",

                        width: "100%",

                    }}
                >


                    {/* ================================================= */}
                    {/* TABLE HEADER */}
                    {/* ================================================= */}

                    <TableHead>

                        <TableRow
                            sx={{

                                backgroundColor:
                                    "background.default",

                            }}
                        >


                            <TableCell
                                sx={{

                                    width: "14%",

                                    fontSize: 11,

                                    fontWeight: 650,

                                    color: "text.secondary",

                                    textTransform:
                                        "uppercase",

                                    letterSpacing:
                                        "0.04em",

                                    py: 1.35,

                                    borderBottom:
                                        "1px solid",

                                    borderColor:
                                        "divider",

                                }}
                            >
                                Actions
                            </TableCell>


                            <TableCell
                                sx={{

                                    width: "22%",

                                    fontSize: 11,

                                    fontWeight: 650,

                                    color: "text.secondary",

                                    textTransform:
                                        "uppercase",

                                    letterSpacing:
                                        "0.04em",

                                    py: 1.35,

                                    borderBottom:
                                        "1px solid",

                                    borderColor:
                                        "divider",

                                }}
                            >
                                Division Name
                            </TableCell>


                            <TableCell
                                sx={{

                                    width: "13%",

                                    fontSize: 11,

                                    fontWeight: 650,

                                    color: "text.secondary",

                                    textTransform:
                                        "uppercase",

                                    letterSpacing:
                                        "0.04em",

                                    py: 1.35,

                                    borderBottom:
                                        "1px solid",

                                    borderColor:
                                        "divider",

                                }}
                            >
                                Status
                            </TableCell>


                            <TableCell
                                sx={{

                                    width: "19%",

                                    fontSize: 11,

                                    fontWeight: 650,

                                    color: "text.secondary",

                                    textTransform:
                                        "uppercase",

                                    letterSpacing:
                                        "0.04em",

                                    py: 1.35,

                                    borderBottom:
                                        "1px solid",

                                    borderColor:
                                        "divider",

                                }}
                            >
                                Created On
                            </TableCell>


                            <TableCell
                                sx={{

                                    width: "19%",

                                    fontSize: 11,

                                    fontWeight: 650,

                                    color: "text.secondary",

                                    textTransform:
                                        "uppercase",

                                    letterSpacing:
                                        "0.04em",

                                    py: 1.35,

                                    borderBottom:
                                        "1px solid",

                                    borderColor:
                                        "divider",

                                }}
                            >
                                Modified On
                            </TableCell>


                            <TableCell
                                sx={{

                                    width: "13%",

                                    fontSize: 11,

                                    fontWeight: 650,

                                    color: "text.secondary",

                                    textTransform:
                                        "uppercase",

                                    letterSpacing:
                                        "0.04em",

                                    py: 1.35,

                                    borderBottom:
                                        "1px solid",

                                    borderColor:
                                        "divider",

                                }}
                            >
                                Modified By
                            </TableCell>

                        </TableRow>

                    </TableHead>


                    {/* ================================================= */}
                    {/* TABLE BODY */}
                    {/* ================================================= */}

                    <TableBody>

                        {filteredDivisions.length > 0 ? (

                            filteredDivisions.map(
                                (division) => (

                                    <TableRow
                                        key={
                                            division.DivisionId
                                        }

                                        sx={{

                                            transition:
                                                "background-color 140ms ease",

                                            "&:hover": {

                                                backgroundColor:
                                                    "action.hover",

                                            },

                                            "&:last-child td": {

                                                borderBottom: 0,

                                            },

                                        }}
                                    >


                                        {/* ACTIONS */}

                                        <TableCell
                                            sx={{
                                                py: 1.1,
                                            }}
                                        >

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
                                                    title="View division"
                                                    arrow
                                                >

                                                    <IconButton
                                                        size="small"

                                                        sx={{

                                                            width: 30,

                                                            height: 30,

                                                            color:
                                                                "text.secondary",

                                                            borderRadius: 1.25,

                                                            "&:hover": {

                                                                color:
                                                                    "primary.main",

                                                                backgroundColor:
                                                                    "action.hover",

                                                            },

                                                        }}
                                                    >

                                                        <VisibilityOutlinedIcon
                                                            sx={{
                                                                fontSize: 17,
                                                            }}
                                                        />

                                                    </IconButton>

                                                </Tooltip>


                                                {/* EDIT */}

                                                <Tooltip
                                                    title="Edit division"
                                                    arrow
                                                >

                                                    <IconButton
                                                        size="small"

                                                        sx={{

                                                            width: 30,

                                                            height: 30,

                                                            color:
                                                                "text.secondary",

                                                            borderRadius: 1.25,

                                                            "&:hover": {

                                                                color:
                                                                    "primary.main",

                                                                backgroundColor:
                                                                    "action.hover",

                                                            },

                                                        }}
                                                    >

                                                        <EditOutlinedIcon
                                                            sx={{
                                                                fontSize: 17,
                                                            }}
                                                        />

                                                    </IconButton>

                                                </Tooltip>


                                                {/* DELETE */}

                                                <Tooltip
                                                    title="Delete division"
                                                    arrow
                                                >

                                                    <IconButton
                                                        size="small"

                                                        sx={{

                                                            width: 30,

                                                            height: 30,

                                                            color:
                                                                "text.secondary",

                                                            borderRadius: 1.25,

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


                                        {/* DIVISION NAME */}

                                        <TableCell
                                            sx={{

                                                py: 1.1,

                                                fontSize: 13,

                                                fontWeight: 600,

                                                color:
                                                    "text.primary",

                                                whiteSpace:
                                                    "nowrap",

                                                overflow:
                                                    "hidden",

                                                textOverflow:
                                                    "ellipsis",

                                            }}
                                        >
                                            {division.DivisionName || "-"}
                                        </TableCell>


                                        {/* STATUS */}

                                        <TableCell
                                            sx={{
                                                py: 1.1,
                                            }}
                                        >

                                            <Chip
                                                label={
                                                    division.IsActive
                                                        ? "Active"
                                                        : "Inactive"
                                                }

                                                size="small"

                                                color={
                                                    division.IsActive
                                                        ? "success"
                                                        : "default"
                                                }

                                                sx={{

                                                    height: 24,

                                                    fontSize: 11,

                                                    fontWeight: 600,

                                                    borderRadius: 1.25,

                                                    "& .MuiChip-label": {

                                                        px: 1.1,

                                                    },

                                                }}
                                            />

                                        </TableCell>


                                        {/* CREATED ON */}

                                        <TableCell
                                            sx={{

                                                py: 1.1,

                                                fontSize: 12,

                                                color:
                                                    "text.secondary",

                                                whiteSpace:
                                                    "nowrap",

                                            }}
                                        >
                                            {formatDate(
                                                division.CreatedOn
                                            )}
                                        </TableCell>


                                        {/* MODIFIED ON */}

                                        <TableCell
                                            sx={{

                                                py: 1.1,

                                                fontSize: 12,

                                                color:
                                                    "text.secondary",

                                                whiteSpace:
                                                    "nowrap",

                                            }}
                                        >
                                            {formatDate(
                                                division.ModifiedOn
                                            )}
                                        </TableCell>


                                        {/* MODIFIED BY */}

                                        <TableCell
                                            sx={{

                                                py: 1.1,

                                                fontSize: 12,

                                                color:
                                                    "text.secondary",

                                                whiteSpace:
                                                    "nowrap",

                                                overflow:
                                                    "hidden",

                                                textOverflow:
                                                    "ellipsis",

                                            }}
                                        >
                                            {division.ModifiedBy || "-"}
                                        </TableCell>

                                    </TableRow>

                                )
                            )

                        ) : (

                            <TableRow>

                                <TableCell
                                    colSpan={6}

                                    align="center"

                                    sx={{

                                        py: 7,

                                        borderBottom: 0,

                                    }}
                                >

                                    <Typography
                                        sx={{

                                            fontSize: 14,

                                            fontWeight: 600,

                                            color:
                                                "text.primary",

                                        }}
                                    >
                                        No divisions found
                                    </Typography>


                                    <Typography
                                        sx={{

                                            mt: 0.5,

                                            fontSize: 12,

                                            color:
                                                "text.secondary",

                                        }}
                                    >
                                        Try adjusting your search or
                                        status filter.
                                    </Typography>

                                </TableCell>

                            </TableRow>

                        )}

                    </TableBody>

                </Table>

            </TableContainer>

        </Box>

    );

}


export default DivisionList;