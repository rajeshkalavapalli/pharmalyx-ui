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

import { alpha } from "@mui/material/styles";

import { useEffect, useState } from "react";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddIcon from "@mui/icons-material/Add";

import { getTerritories } from "./index";


function TerritoryList({
    handleAddTerritoty,
}) {

    const [status, setStatus] =
        useState("All");

    const [search, setSearch] =
        useState("");

    const [territories, setTerritories] =
        useState([]);


    // =====================================================
    // LOAD TERRITORIES
    // =====================================================

    useEffect(() => {

        loadTerritories();

    }, []);


    const loadTerritories =
        async () => {

            try {

                const response =
                    await getTerritories();

                console.log(
                    "Territories from API:",
                    response
                );


                const data =
                    response?.result ||
                    response?.territories ||
                    response ||
                    [];


                setTerritories(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {

                console.log(
                    "error getting territories:",
                    err
                );


                setTerritories([]);

            }

        };


    // =====================================================
    // SEARCH + STATUS FILTER
    // =====================================================

    const filteredTerritories =
        territories.filter((territory) => {

            const territoryName =
                territory.TerritoryName || "";

            const stateName =
                territory.StateName ||
                "";


            const matchesSearch =

                territoryName
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    )

                ||

                stateName
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );


            const isActive =
                territory.IsActive === true ||
                territory.IsActive === 1 ||
                territory.IsActive === "true";


            const matchesStatus =

                status === "All"

                ||

                (
                    status === "Active" &&
                    isActive
                )

                ||

                (
                    status === "Inactive" &&
                    !isActive
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


    // =====================================================
    // TABLE HEADER STYLE
    // =====================================================

    const getHeaderCellSx =
        (width) => {

            return (theme) => ({

                width,

                fontSize: 11,

                fontWeight: 750,

                color:
                    theme.palette.primary.main,

                textTransform:
                    "uppercase",

                letterSpacing:
                    "0.07em",

                py: 1.8,

                whiteSpace:
                    "nowrap",

                borderBottom:
                    "1px solid",

                borderColor:
                    alpha(
                        theme.palette.primary.main,
                        0.16
                    ),

            });

        };


    // =====================================================
    // ACTION BUTTON STYLE
    // =====================================================

    const getActionButtonSx =
        (
            type = "default"
        ) => {

            return (theme) => {

                const hoverColor =

                    type === "delete"

                        ? theme.palette.error.main

                        : theme.palette.primary.main;


                return {

                    width: 34,

                    height: 34,

                    borderRadius: 1.5,

                    color:
                        theme.palette.text.secondary,

                    transition:
                        "all 160ms ease",


                    "&:hover": {

                        color:
                            hoverColor,

                        backgroundColor:

                            alpha(
                                hoverColor,
                                0.09
                            ),

                        transform:
                            "translateY(-1px)",

                    },

                };

            };

        };


    return (

        <Box
            sx={{
                width: "100%",
            }}
        >


            {/* ================================================= */}
            {/* PAGE TOOLBAR */}
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

                    mb: 2.5,

                }}
            >


                {/* PAGE TITLE */}

                <Box>

                    <Box
                        sx={{

                            display: "flex",

                            alignItems: "center",

                            gap: 1.25,

                        }}
                    >

                        <Box
                            sx={(theme) => ({

                                width: 4,

                                height: 32,

                                borderRadius: 10,

                                backgroundColor:
                                    theme.palette.primary.main,

                            })}
                        />


                        <Box>

                            <Typography
                                sx={{

                                    fontSize: 18,

                                    fontWeight: 750,

                                    color:
                                        "text.primary",

                                    letterSpacing:
                                        "-0.02em",

                                    lineHeight: 1.25,

                                }}
                            >
                                Territories
                            </Typography>


                            <Typography
                                sx={{

                                    mt: 0.35,

                                    fontSize: 12.5,

                                    color:
                                        "text.secondary",

                                }}
                            >
                                Manage territories and their organizational coverage.
                            </Typography>

                        </Box>

                    </Box>

                </Box>


                {/* ADD TERRITORY */}

                <Button
                    variant="contained"

                    startIcon={
                        <AddIcon
                            sx={{
                                fontSize: 18,
                            }}
                        />
                    }

                    onClick={
                        handleAddTerritoty
                    }

                    sx={{

                        minWidth: 168,

                        height: 46,

                        px: 2.5,

                        borderRadius: 1.75,

                        textTransform:
                            "none",

                        fontSize: 13,

                        fontWeight: 700,

                        alignSelf: {
                            xs: "flex-start",
                            sm: "center",
                        },

                        boxShadow: 2,

                        transition:
                            "all 180ms ease",


                        "&:hover": {

                            boxShadow: 4,

                            transform:
                                "translateY(-1px)",

                        },

                    }}
                >
                    Add Territory
                </Button>

            </Box>


            {/* ================================================= */}
            {/* FILTER BAR */}
            {/* ================================================= */}

            <Paper
                elevation={0}

                sx={(theme) => ({

                    mb: 2,

                    px: {
                        xs: 1.5,
                        md: 2,
                    },

                    py: 1.5,

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius: 2.5,

                    backgroundColor:

                        alpha(
                            theme.palette.primary.main,
                            0.025
                        ),

                })}
            >

                <Box
                    sx={{

                        display: "flex",

                        justifyContent:
                            "space-between",

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


                    {/* FILTER CONTROLS */}

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

                            placeholder="Search territories"

                            value={search}

                            onChange={(event) => {

                                setSearch(
                                    event.target.value
                                );

                            }}

                            sx={(theme) => ({

                                width: {
                                    xs: "100%",
                                    sm: 330,
                                },

                                "& .MuiOutlinedInput-root": {

                                    height: 44,

                                    borderRadius: 1.75,

                                    fontSize: 13,

                                    backgroundColor:
                                        theme.palette.background.paper,

                                    transition:
                                        "all 160ms ease",


                                    "& fieldset": {

                                        borderColor:
                                            theme.palette.divider,

                                    },


                                    "&:hover fieldset": {

                                        borderColor:

                                            alpha(
                                                theme.palette.primary.main,
                                                0.55
                                            ),

                                    },


                                    "&.Mui-focused": {

                                        boxShadow:

                                            `0 0 0 3px ${alpha(
                                                theme.palette.primary.main,
                                                0.1
                                            )}`,

                                    },


                                    "&.Mui-focused fieldset": {

                                        borderColor:
                                            theme.palette.primary.main,

                                    },

                                },

                            })}

                            InputProps={{

                                startAdornment: (

                                    <InputAdornment
                                        position="start"
                                    >

                                        <SearchOutlinedIcon
                                            sx={{

                                                fontSize: 19,

                                                color:
                                                    "text.secondary",

                                            }}
                                        />

                                    </InputAdornment>

                                ),

                            }}
                        />


                        {/* STATUS */}

                        <Select
                            size="small"

                            value={status}

                            onChange={(event) => {

                                setStatus(
                                    event.target.value
                                );

                            }}

                            sx={(theme) => ({

                                minWidth: 160,

                                height: 44,

                                borderRadius: 1.75,

                                fontSize: 13,

                                fontWeight: 500,

                                backgroundColor:
                                    theme.palette.background.paper,


                                "& .MuiOutlinedInput-notchedOutline": {

                                    borderColor:
                                        theme.palette.divider,

                                },


                                "&:hover .MuiOutlinedInput-notchedOutline": {

                                    borderColor:

                                        alpha(
                                            theme.palette.primary.main,
                                            0.55
                                        ),

                                },


                                "&.Mui-focused": {

                                    boxShadow:

                                        `0 0 0 3px ${alpha(
                                            theme.palette.primary.main,
                                            0.1
                                        )}`,

                                },


                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {

                                    borderColor:
                                        theme.palette.primary.main,

                                },

                            })}
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


                    {/* RESULT COUNT */}

                    <Box
                        sx={(theme) => ({

                            display: "flex",

                            alignItems: "center",

                            gap: 0.75,

                            px: 1.5,

                            py: 0.9,

                            borderRadius: 1.5,

                            backgroundColor:

                                alpha(
                                    theme.palette.primary.main,
                                    0.07
                                ),

                            border:
                                "1px solid",

                            borderColor:

                                alpha(
                                    theme.palette.primary.main,
                                    0.14
                                ),

                            alignSelf: {
                                xs: "flex-start",
                                md: "center",
                            },

                        })}
                    >

                        <Typography
                            sx={{

                                fontSize: 12,

                                fontWeight: 750,

                                color:
                                    "primary.main",

                            }}
                        >
                            {filteredTerritories.length}
                        </Typography>


                        <Typography
                            sx={{

                                fontSize: 12,

                                fontWeight: 500,

                                color:
                                    "text.secondary",

                                whiteSpace:
                                    "nowrap",

                            }}
                        >

                            {
                                filteredTerritories.length === 1

                                    ? "territory"

                                    : "territories"
                            }

                        </Typography>

                    </Box>

                </Box>

            </Paper>


            {/* ================================================= */}
            {/* TERRITORY TABLE */}
            {/* ================================================= */}

            <TableContainer
                sx={{

                    width: "100%",

                    overflowX: "hidden",

                    border: 0,

                    borderRadius: 0,

                    backgroundColor:
                        "transparent",

                    boxShadow:
                        "none",

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
                            sx={(theme) => ({

                                backgroundColor:

                                    alpha(
                                        theme.palette.primary.main,
                                        0.07
                                    ),

                            })}
                        >

                            <TableCell
                                sx={
                                    getHeaderCellSx("14%")
                                }
                            >
                                Actions
                            </TableCell>


                            <TableCell
                                sx={
                                    getHeaderCellSx("20%")
                                }
                            >
                                Territory Name
                            </TableCell>


                            <TableCell
                                sx={
                                    getHeaderCellSx("16%")
                                }
                            >
                                State
                            </TableCell>


                            <TableCell
                                sx={
                                    getHeaderCellSx("12%")
                                }
                            >
                                Status
                            </TableCell>


                            <TableCell
                                sx={
                                    getHeaderCellSx("18%")
                                }
                            >
                                Created On
                            </TableCell>


                            <TableCell
                                sx={
                                    getHeaderCellSx("18%")
                                }
                            >
                                Modified On
                            </TableCell>


                            <TableCell
                                sx={
                                    getHeaderCellSx("15%")
                                }
                            >
                                Modified By
                            </TableCell>

                        </TableRow>

                    </TableHead>


                    {/* ================================================= */}
                    {/* TABLE BODY */}
                    {/* ================================================= */}

                    <TableBody>

                        {
                            filteredTerritories.length > 0

                                ? (

                                    filteredTerritories.map(
                                        (territory, index) => {

                                            const isActive =

                                                territory.IsActive === true ||

                                                territory.IsActive === 1 ||

                                                territory.IsActive === "true";


                                            return (

                                                <TableRow

                                                    key={
                                                        territory.TerritoryId
                                                    }

                                                    sx={(theme) => ({

                                                        transition:
                                                            "background-color 160ms ease",


                                                        "& .MuiTableCell-root": {

                                                            backgroundColor:

                                                                index % 2 === 0

                                                                    ? "#FFFFFF"

                                                                    : "#F7F5F1",

                                                        },


                                                        "&:hover .MuiTableCell-root": {

                                                            backgroundColor:

                                                                alpha(
                                                                    theme.palette.primary.main,
                                                                    0.035
                                                                ),

                                                        },


                                                        "&:hover .territory-name": {

                                                            color:
                                                                theme.palette.primary.main,

                                                        },


                                                        "&:last-child .MuiTableCell-root": {

                                                            borderBottom: 0,

                                                        },

                                                    })}
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

                                                                alignItems: "center",

                                                                gap: 0.25,

                                                            }}
                                                        >


                                                            {/* VIEW */}

                                                            <Tooltip
                                                                title="View territory"
                                                                arrow
                                                            >

                                                                <IconButton
                                                                    size="small"

                                                                    sx={
                                                                        getActionButtonSx()
                                                                    }
                                                                >

                                                                    <VisibilityOutlinedIcon
                                                                        sx={{
                                                                            fontSize: 18,
                                                                        }}
                                                                    />

                                                                </IconButton>

                                                            </Tooltip>


                                                            {/* EDIT */}

                                                            <Tooltip
                                                                title="Edit territory"
                                                                arrow
                                                            >

                                                                <IconButton
                                                                    size="small"

                                                                    sx={
                                                                        getActionButtonSx()
                                                                    }
                                                                >

                                                                    <EditOutlinedIcon
                                                                        sx={{
                                                                            fontSize: 18,
                                                                        }}
                                                                    />

                                                                </IconButton>

                                                            </Tooltip>


                                                            {/* DELETE */}

                                                            <Tooltip
                                                                title="Delete territory"
                                                                arrow
                                                            >

                                                                <IconButton
                                                                    size="small"

                                                                    sx={
                                                                        getActionButtonSx(
                                                                            "delete"
                                                                        )
                                                                    }
                                                                >

                                                                    <DeleteIcon
                                                                        sx={{
                                                                            fontSize: 18,
                                                                        }}
                                                                    />

                                                                </IconButton>

                                                            </Tooltip>

                                                        </Box>

                                                    </TableCell>


                                                    {/* TERRITORY NAME */}

                                                    <TableCell
                                                        className="territory-name"

                                                        sx={(theme) => ({

                                                            py: 1.1,

                                                            fontSize: 13.5,

                                                            fontWeight: 700,

                                                            color:
                                                                theme.palette.primary.dark,

                                                            whiteSpace:
                                                                "nowrap",

                                                            overflow:
                                                                "hidden",

                                                            textOverflow:
                                                                "ellipsis",

                                                            letterSpacing:
                                                                "-0.01em",

                                                            transition:
                                                                "color 160ms ease",

                                                        })}
                                                    >

                                                        {
                                                            territory.TerritoryName ||
                                                            "-"
                                                        }

                                                    </TableCell>


                                                    {/* STATE */}

                                                    <TableCell
                                                        sx={{

                                                            py: 1.1,

                                                            fontSize: 12.5,

                                                            fontWeight: 500,

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

                                                        {
                                                            territory.StateName ||

                                                            territory.State ||

                                                            "-"
                                                        }

                                                    </TableCell>


                                                    {/* STATUS */}

                                                    <TableCell
                                                        sx={{
                                                            py: 1.1,
                                                        }}
                                                    >

                                                        <Chip

                                                            size="small"

                                                            label={

                                                                <Box
                                                                    sx={{

                                                                        display:
                                                                            "flex",

                                                                        alignItems:
                                                                            "center",

                                                                        gap: 0.75,

                                                                    }}
                                                                >

                                                                    <Box
                                                                        sx={(theme) => ({

                                                                            width: 6,

                                                                            height: 6,

                                                                            borderRadius:
                                                                                "50%",

                                                                            backgroundColor:

                                                                                isActive

                                                                                    ? theme.palette.success.main

                                                                                    : theme.palette.warning.main,


                                                                            boxShadow:

                                                                                isActive

                                                                                    ? `0 0 0 3px ${alpha(
                                                                                        theme.palette.success.main,
                                                                                        0.12
                                                                                    )}`

                                                                                    : `0 0 0 3px ${alpha(
                                                                                        theme.palette.warning.main,
                                                                                        0.12
                                                                                    )}`,

                                                                        })}
                                                                    />


                                                                    <Typography

                                                                        component="span"

                                                                        sx={{

                                                                            fontSize: 11,

                                                                            fontWeight: 700,

                                                                            lineHeight: 1,

                                                                        }}
                                                                    >

                                                                        {
                                                                            isActive

                                                                                ? "Active"

                                                                                : "Inactive"
                                                                        }

                                                                    </Typography>

                                                                </Box>

                                                            }

                                                            sx={(theme) => ({

                                                                height: 30,

                                                                minWidth: 96,

                                                                borderRadius: 1.5,

                                                                color:

                                                                    isActive

                                                                        ? theme.palette.success.main

                                                                        : theme.palette.warning.main,


                                                                backgroundColor:

                                                                    isActive

                                                                        ? alpha(
                                                                            theme.palette.success.main,
                                                                            0.09
                                                                        )

                                                                        : alpha(
                                                                            theme.palette.warning.main,
                                                                            0.1
                                                                        ),


                                                                border:
                                                                    "1px solid",


                                                                borderColor:

                                                                    isActive

                                                                        ? alpha(
                                                                            theme.palette.success.main,
                                                                            0.2
                                                                        )

                                                                        : alpha(
                                                                            theme.palette.warning.main,
                                                                            0.22
                                                                        ),


                                                                "& .MuiChip-label": {

                                                                    px: 1.2,

                                                                    width: "100%",

                                                                },

                                                            })}
                                                        />

                                                    </TableCell>


                                                    {/* CREATED ON */}

                                                    <TableCell
                                                        sx={{

                                                            py: 1.1,

                                                            fontSize: 12.5,

                                                            fontWeight: 500,

                                                            color:
                                                                "text.secondary",

                                                            whiteSpace:
                                                                "nowrap",

                                                        }}
                                                    >

                                                        {
                                                            formatDate(
                                                                territory.CreatedOn
                                                            )
                                                        }

                                                    </TableCell>


                                                    {/* MODIFIED ON */}

                                                    <TableCell
                                                        sx={{

                                                            py: 1.1,

                                                            fontSize: 12.5,

                                                            fontWeight: 500,

                                                            color:
                                                                "text.secondary",

                                                            whiteSpace:
                                                                "nowrap",

                                                        }}
                                                    >

                                                        {
                                                            formatDate(
                                                                territory.ModifiedOn
                                                            )
                                                        }

                                                    </TableCell>


                                                    {/* MODIFIED BY */}

                                                    <TableCell
                                                        sx={{

                                                            py: 1.1,

                                                            fontSize: 12.5,

                                                            fontWeight: 500,

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

                                                        {
                                                            territory.ModifiedBy ||
                                                            "-"
                                                        }

                                                    </TableCell>

                                                </TableRow>

                                            );

                                        }
                                    )

                                )

                                : (

                                    <TableRow>

                                        <TableCell

                                            colSpan={7}

                                            align="center"

                                            sx={{

                                                py: 8,

                                                borderBottom: 0,

                                            }}
                                        >

                                            <Box
                                                sx={{

                                                    display: "flex",

                                                    flexDirection:
                                                        "column",

                                                    alignItems:
                                                        "center",

                                                }}
                                            >

                                                <Box
                                                    sx={(theme) => ({

                                                        width: 48,

                                                        height: 48,

                                                        borderRadius:
                                                            "50%",

                                                        display:
                                                            "flex",

                                                        alignItems:
                                                            "center",

                                                        justifyContent:
                                                            "center",

                                                        mb: 1.5,

                                                        backgroundColor:

                                                            alpha(
                                                                theme.palette.primary.main,
                                                                0.08
                                                            ),

                                                    })}
                                                >

                                                    <SearchOutlinedIcon
                                                        sx={{

                                                            fontSize: 23,

                                                            color:
                                                                "primary.main",

                                                        }}
                                                    />

                                                </Box>


                                                <Typography
                                                    sx={{

                                                        fontSize: 14,

                                                        fontWeight: 700,

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
                                                    Try adjusting your search or status filter.
                                                </Typography>

                                            </Box>

                                        </TableCell>

                                    </TableRow>

                                )

                        }

                    </TableBody>

                </Table>

            </TableContainer>

        </Box>

    );

}


export default TerritoryList;