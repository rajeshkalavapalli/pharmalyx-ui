import {
    Box,
    Chip,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Tooltip,
} from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/Delete";
import { useEffect, useMemo, useState } from "react";

import { getAreas, getTerritories, getUsers } from "./index.js";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";


const toIdArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string") {
        return value.split(",").map((id) => id.trim()).filter(Boolean);
    }

    return [];
};


function UserAreaMappingList() {
    const [users, setUsers] = useState([]);
    const [territories, setTerritories] = useState([]);
    const [areas, setAreas] = useState([]);
    const [search, setSearch] = useState("");
    const { showSnackbar } = useSnackbar();

    useEffect(() => {
        const loadMappingData = async () => {
            try {
                const [usersResponse, territoriesResponse, areasResponse] = await Promise.all([
                    getUsers(),
                    getTerritories(),
                    getAreas(),
                ]);

                setUsers(Array.isArray(usersResponse?.result) ? usersResponse.result : []);
                setTerritories(
                    Array.isArray(territoriesResponse?.territories)
                        ? territoriesResponse.territories
                        : Array.isArray(territoriesResponse)
                            ? territoriesResponse
                            : []
                );
                setAreas(
                    Array.isArray(areasResponse?.result)
                        ? areasResponse.result
                        : Array.isArray(areasResponse)
                            ? areasResponse
                            : []
                );
            } catch (error) {
                console.error("Error loading user area mappings", error);
                showSnackbar("Unable to load user area mappings", "error");
            }
        };

        loadMappingData();
    }, [showSnackbar]);

    const rows = useMemo(() => users.map((user) => {
        const territoryIds = toIdArray(user.TerritoryIds);
        const userTerritories = territories.filter((territory) =>
            territoryIds.includes(territory.TerritoryId)
        );
        const territorySet = new Set(territoryIds);

        return {
            ...user,
            userTerritories,
            coverageAreas: areas.filter((area) => territorySet.has(area.TerritoryId)),
        };
    }), [areas, territories, users]);

    const filteredRows = rows.filter((row) => {
        const searchValue = [
            row.UserName,
            row.DivisionName,
            ...row.userTerritories.map((territory) => territory.TerritoryName),
        ].join(" ").toLowerCase();

        return searchValue.includes(search.trim().toLowerCase());
    });

    return (
        <Box sx={{ width: "100%", minWidth: 0 }}>
            <Paper
                elevation={0}
                sx={{
                    mb: 2,
                    p: { xs: 1.25, sm: 1.5 },
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Search users, divisions, or territories"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        sx={{ flex: 1 }}
                        InputProps={{
                            startAdornment: (
                                <SearchOutlinedIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                            ),
                        }}
                    />
                    <Chip
                        label={`${filteredRows.length} ${filteredRows.length === 1 ? "user" : "users"}`}
                        color="primary"
                        variant="outlined"
                        sx={{ flexShrink: 0 }}
                    />
                </Box>
            </Paper>

            <TableContainer
                component={Paper}
                elevation={0}
                sx={(theme) => ({
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflowX: "auto",
                    boxShadow: theme.card.shadow,
                })}
            >
                <Table size="small" sx={{ minWidth: 940 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "surface.muted" }}>
                            {[
                                "Actions",
                                "User",
                                "Email",
                                "Division",
                                "Territories",
                                "Areas in Coverage",
                                "Status",
                            ].map((heading) => (
                                <TableCell
                                    key={heading}
                                    sx={{
                                        py: 1.5,
                                        color: "text.secondary",
                                        fontSize: 10.5,
                                        fontWeight: 800,
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {heading}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows.map((row) => (
                            <TableRow
                                key={row.userId}
                                hover
                                sx={{
                                    "& .MuiTableCell-root": {
                                        py: 1.6,
                                    },
                                }}
                            >
                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                                        <Tooltip title="View Mapping" arrow>
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    width: 31,
                                                    height: 31,
                                                    borderRadius: 1.25,
                                                    color: "text.secondary",
                                                    "&:hover": {
                                                        color: "primary.main",
                                                        backgroundColor: "action.hover",
                                                    },
                                                }}
                                            >
                                                <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit Mapping" arrow>
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    width: 31,
                                                    height: 31,
                                                    borderRadius: 1.25,
                                                    color: "text.secondary",
                                                    "&:hover": {
                                                        color: "primary.main",
                                                        backgroundColor: "action.hover",
                                                    },
                                                }}
                                            >
                                                <EditOutlinedIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Mapping" arrow>
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    width: 31,
                                                    height: 31,
                                                    borderRadius: 1.25,
                                                    color: "text.secondary",
                                                    "&:hover": {
                                                        color: "error.main",
                                                        backgroundColor: "action.hover",
                                                    },
                                                }}
                                            >
                                                <DeleteOutline sx={{ fontSize: 17 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            fontSize: 13,
                                            fontWeight: 750,
                                            color: "primary.main",
                                        }}
                                    >
                                        {row.UserName || "-"}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ color: "text.secondary", fontSize: 12.5 }}>
                                    {row.EmailId || "-"}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    {row.DivisionName || "-"}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                        {row.userTerritories.map((territory) => (
                                            <Chip key={territory.TerritoryId} label={territory.TerritoryName} size="small" variant="outlined" />
                                        ))}
                                        {row.userTerritories.length === 0 && "-"}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.coverageAreas.length}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.IsActive === false ? "Inactive" : "Active"}
                                        size="small"
                                        color={row.IsActive === false ? "default" : "success"}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 5, color: "text.secondary" }}>
                                    No user mappings found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}


export default UserAreaMappingList;
