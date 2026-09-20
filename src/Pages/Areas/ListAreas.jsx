import {
    Box,
    Button,
    Chip,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    IconButton,
    Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAreas } from "./index";


function ListAreas ({ onAddArea }){
    const navigate = useNavigate();
    const [areas, setAreas] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");

    useEffect(() => {
        const loadAreas = async () => {
            try {
                const response = await getAreas();
                const data = response?.result || response?.areas || response || [];
                setAreas(Array.isArray(data) ? data : []);
            } catch (err) {
                console.log("error getting areas", err);
                setAreas([]);
            }
        };

        loadAreas();
    }, []);

    const isActive = (area) =>
        area.IsActive === true ||
        area.IsActive === 1 ||
        area.IsActive === "YES" ||
        area.IsActive === "true";

    const filteredAreas = areas.filter((area) => {
        const searchValue = `${area.AreaName || ""} ${area.AreaCode || ""} ${area.TerritoryName || ""}`.toLowerCase();
        const matchesSearch = searchValue.includes(search.toLowerCase());
        const matchesStatus =
            status === "All" ||
            (status === "Active" && isActive(area)) ||
            (status === "Inactive" && !isActive(area));

        return matchesSearch && matchesStatus;
    });

    const formatDate = (date) => {
        if (!date) return "-";
        const parsedDate = new Date(date);
        return Number.isNaN(parsedDate.getTime())
            ? "-"
            : parsedDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
    };

    return(
        <Box>
            <Box sx={{ width: "100%" }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "stretch", sm: "center" },
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                        mb: 2.5,
                    }}
                >
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Areas
                        </Typography>
                        <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                            Manage the areas created for each territory.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            if (onAddArea) {
                                onAddArea();
                            } else {
                                navigate("/admin/Areas/add");
                            }
                        }}
                        sx={{ textTransform: "none", alignSelf: { xs: "flex-start", sm: "center" } }}
                    >
                        Add New Area
                    </Button>
                </Box>

                <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                        <TextField
                            size="small"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search areas"
                            InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
                            sx={{ flex: 1, minWidth: 220 }}
                        />
                        <Select
                            size="small"
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            sx={{ minWidth: 140 }}
                        >
                            <MenuItem value="All">All statuses</MenuItem>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                    </Box>
                </Paper>

                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Actions</TableCell>
                                <TableCell>Area Name</TableCell>
                                <TableCell>Area Code</TableCell>
                                <TableCell>Territory</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created On</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAreas.map((area) => (
                                <TableRow key={area.AreaId} hover>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 0.5 }}>
                                            <Tooltip title="View Area" arrow>
                                                <IconButton
                                                    size="small"
                                                    aria-label={`View ${area.AreaName || "area"}`}
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

                                            <Tooltip title="Edit Area" arrow>
                                                <IconButton
                                                    size="small"
                                                    aria-label={`Edit ${area.AreaName || "area"}`}
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

                                            <Tooltip title="Delete Area" arrow>
                                                <IconButton
                                                    size="small"
                                                    aria-label={`Delete ${area.AreaName || "area"}`}
                                                    sx={{
                                                        width: 31,
                                                        height: 31,
                                                        borderRadius: 1.25,
                                                        color: "text.secondary",
                                                        "&:hover": {
                                                            color: "error.main",
                                                            backgroundColor: "error.lighter",
                                                        },
                                                    }}
                                                >
                                                    <DeleteOutline sx={{ fontSize: 17 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{area.AreaName || "-"}</TableCell>
                                    <TableCell>{area.AreaCode || "-"}</TableCell>
                                    <TableCell>{area.TerritoryName || area.TerritoryId || "-"}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={isActive(area) ? "Active" : "Inactive"}
                                            color={isActive(area) ? "success" : "default"}
                                        />
                                    </TableCell>
                                    <TableCell>{formatDate(area.CreatedOn)}</TableCell>
                                </TableRow>
                            ))}
                            {!filteredAreas.length && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: "text.secondary" }}>
                                        No areas found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    )
}

export default ListAreas;