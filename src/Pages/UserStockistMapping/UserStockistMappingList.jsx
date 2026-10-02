import {
    Box,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    InputAdornment,
} from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useEffect, useMemo, useState } from "react";

// import { getUserStockistMappings, getUsers } from "./index.js";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";


function UserStockistMappingList() {
    const [users, setUsers] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [search, setSearch] = useState("");
    const { showSnackbar } = useSnackbar();

    useEffect(() => {
        const loadMappingData = async () => {
            try {
                const [usersResponse, mappingsResponse] = await Promise.all([
                    getUsers(),
                    getUserStockistMappings(),
                ]);

                setUsers(
                    Array.isArray(usersResponse?.result)
                        ? usersResponse.result
                        : []
                );

                setMappings(
                    Array.isArray(mappingsResponse?.result)
                        ? mappingsResponse.result
                        : []
                );
            } catch (error) {
                console.error(
                    "Error loading user stockist mappings",
                    error
                );

                showSnackbar(
                    "Unable to load user stockist mappings",
                    "error"
                );
            }
        };

        loadMappingData();
    }, [showSnackbar]);


    const rows = useMemo(() => users.map((user) => {

        const userMappings = mappings.filter(
            (mapping) =>
                mapping.UserId === user.userId
        );


        const mappedStockists = Array.from(
            new Map(
                userMappings.map((mapping) => [
                    mapping.StockistId,
                    {
                        StockistId: mapping.StockistId,
                        StockistName: mapping.StockistName,
                    },
                ])
            ).values()
        );


        return {
            ...user,
            mappedStockists,
        };

    }), [mappings, users]);


    const filteredRows = rows.filter((row) => {

        const searchValue = [
            row.UserName,
            row.EmailId,
            row.DivisionName,
            ...row.mappedStockists.map(
                (stockist) =>
                    stockist.StockistName
            ),
        ]
            .join(" ")
            .toLowerCase();


        return searchValue.includes(
            search.trim().toLowerCase()
        );

    });


    return (
        <Box sx={{ width: "100%", minWidth: 0 }}>

            <Box
                sx={{
                    display: "flex",
                    alignItems: {
                        xs: "flex-start",
                        sm: "center",
                    },
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 2,
                }}
            >

                <Box
                    sx={{
                        pl: 1.25,
                        borderLeft: "3px solid",
                        borderColor: "primary.main",
                    }}
                >

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            lineHeight: 1.3,
                        }}
                    >
                        User Stockist Mappings
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.35,
                            fontSize: 12.5,
                            color: "text.secondary",
                        }}
                    >
                        Manage users&apos; assigned stockists.
                    </Typography>

                </Box>


                <Chip
                    label={`${filteredRows.length} ${
                        filteredRows.length === 1
                            ? "user"
                            : "users"
                    }`}
                    color="primary"
                    variant="outlined"
                    sx={{
                        flexShrink: 0,
                        alignSelf: {
                            xs: "center",
                            sm: "auto",
                        },
                    }}
                />

            </Box>


            <Paper
                elevation={0}
                sx={{
                    mb: 2,
                    p: {
                        xs: 1.25,
                        sm: 1.5,
                    },
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                }}
            >

                <TextField
                    size="small"
                    placeholder="Search users or stockists"
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    sx={{
                        width: {
                            xs: "100%",
                            sm: 360,
                        },
                        maxWidth: "100%",
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchOutlinedIcon
                                    sx={{
                                        mr: 1,
                                        fontSize: 18,
                                        color: "text.secondary",
                                    }}
                                />
                            </InputAdornment>
                        ),
                    }}
                />

            </Paper>


            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                }}
            >

                <Table size="small">

                    <TableHead>

                        <TableRow>

                            <TableCell>
                                User
                            </TableCell>

                            <TableCell>
                                Email
                            </TableCell>

                            <TableCell>
                                Division
                            </TableCell>

                            <TableCell>
                                Mapped Stockists
                            </TableCell>

                        </TableRow>

                    </TableHead>


                    <TableBody>

                        {filteredRows.map((row) => (

                            <TableRow
                                key={row.userId}
                                hover
                            >

                                <TableCell>
                                    {row.UserName || "-"}
                                </TableCell>

                                <TableCell>
                                    {row.EmailId || "-"}
                                </TableCell>

                                <TableCell>
                                    {row.DivisionName || "-"}
                                </TableCell>

                                <TableCell>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 0.5,
                                        }}
                                    >

                                        {row.mappedStockists.map(
                                            (stockist) => (

                                                <Chip
                                                    key={
                                                        stockist.StockistId
                                                    }
                                                    size="small"
                                                    label={
                                                        stockist.StockistName
                                                    }
                                                />

                                            )
                                        )}


                                        {row.mappedStockists.length === 0 && (

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color:
                                                        "text.secondary",
                                                }}
                                            >
                                                No stockists mapped
                                            </Typography>

                                        )}

                                    </Box>

                                </TableCell>

                            </TableRow>

                        ))}


                        {!filteredRows.length && (

                            <TableRow>

                                <TableCell
                                    colSpan={4}
                                    align="center"
                                    sx={{
                                        py: 5,
                                        color:
                                            "text.secondary",
                                    }}
                                >
                                    No users found.
                                </TableCell>

                            </TableRow>

                        )}

                    </TableBody>

                </Table>

            </TableContainer>

        </Box>
    );
}

export default UserStockistMappingList;