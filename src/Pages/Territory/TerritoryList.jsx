import {
    Box,
    Typography,
    Button,
    Select,
    MenuItem,
    TextField,
    TableHead,
    Table,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
    InputAdornment,
} from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import { useState } from "react";


function TerritoryList({
    handleAddTerritoty
}) {

    const [selectMenu, setselectMenu] =
        useState("All");


    const [search, setSearch] =
        useState("");


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

                    justifyContent:
                        "space-between",

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

                            color:
                                "text.primary",

                            letterSpacing:
                                "-0.015em",

                            lineHeight: 1.3,

                        }}
                    >
                        Territories
                    </Typography>


                    <Typography
                        sx={{

                            mt: 0.35,

                            fontSize: 12,

                            color:
                                "text.secondary",

                            lineHeight: 1.5,

                        }}
                    >
                        Manage territories and their organizational coverage.
                    </Typography>

                </Box>


                {/* ================================================= */}
                {/* ADD TERRITORY */}
                {/* ================================================= */}

                <Button
                    variant="contained"

                    onClick={
                        handleAddTerritoty
                    }

                    sx={{

                        minWidth: 145,

                        height: 40,

                        px: 2.25,

                        borderRadius: 1.5,

                        textTransform:
                            "none",

                        fontSize: 13,

                        fontWeight: 600,

                        alignSelf: {
                            xs: "flex-start",
                            sm: "center",
                        },

                        boxShadow:
                            "none",

                        "&:hover": {

                            boxShadow:
                                "none",

                        },

                    }}
                >
                    + Add Territory
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

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius: 2,

                    backgroundColor:
                        "background.paper",

                }}
            >

                <Box
                    sx={{

                        display: "flex",

                        alignItems: {
                            xs: "stretch",
                            sm: "center",
                        },

                        gap: 1.25,

                        flexDirection: {
                            xs: "column",
                            sm: "row",
                        },

                    }}
                >


                    {/* SEARCH */}

                    <TextField

                        size="small"

                        placeholder="Search territories"

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

                        value={selectMenu}

                        onChange={(event) => {

                            setselectMenu(
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

            </Paper>


            {/* ================================================= */}
            {/* TERRITORY TABLE */}
            {/* ================================================= */}

            <TableContainer

                component={Paper}

                elevation={0}

                sx={{

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius: 2,

                    overflow:
                        "hidden",

                    backgroundColor:
                        "background.paper",

                }}
            >

                <Table>


                    {/* ============================================= */}
                    {/* TABLE HEADER */}
                    {/* ============================================= */}

                    <TableHead>

                        <TableRow
                            sx={{

                                backgroundColor:
                                    "background.default",

                            }}
                        >

                            <TableCell
                                sx={{

                                    fontSize: 11,

                                    fontWeight: 650,

                                    color:
                                        "text.secondary",

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

                                    fontSize: 11,

                                    fontWeight: 650,

                                    color:
                                        "text.secondary",

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
                                Territory Name
                            </TableCell>


                            <TableCell
                                sx={{

                                    fontSize: 11,

                                    fontWeight: 650,

                                    color:
                                        "text.secondary",

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

                        </TableRow>

                    </TableHead>


                    {/* ============================================= */}
                    {/* TABLE BODY */}
                    {/* ============================================= */}

                    <TableBody>

                        {/* API DATA WILL BE ADDED HERE */}

                        <TableRow>

                            <TableCell
                                colSpan={3}

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
                                    No territories found
                                </Typography>


                                <Typography
                                    sx={{

                                        mt: 0.5,

                                        fontSize: 12,

                                        color:
                                            "text.secondary",

                                    }}
                                >
                                    Territory records will appear here.
                                </Typography>

                            </TableCell>

                        </TableRow>

                    </TableBody>

                </Table>

            </TableContainer>

        </Box>

    );

}


export default TerritoryList;