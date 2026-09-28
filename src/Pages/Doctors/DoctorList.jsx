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

import { getDoctors } from "./service";

export const DoctorList = function ({ onAddDoctor }) {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");

    useEffect(() => {
        const loadDoctors = async () => {
            try {
                const response = await getDoctors();
                const data = response?.doctors || response?.result || response || [];
                setDoctors(Array.isArray(data) ? data : []);
            } catch (err) {
                console.log("error getting doctors", err);
                setDoctors([]);
            }
        };

        loadDoctors();
    }, []);

    const isActive = (doctor) =>
        doctor.IsActive === true ||
        doctor.IsActive === 1 ||
        doctor.IsActive === "Yes" ||
        doctor.IsActive === "YES" ||
        doctor.IsActive === "true";

    const filteredDoctors = doctors.filter((doctor) => {
        const searchValue = `${doctor.DoctorName || ""} ${doctor.Speciality || ""} ${doctor.HospitalName || ""} ${doctor.TerritoryName || ""}`.toLowerCase();
        const matchesSearch = searchValue.includes(search.toLowerCase());
        const matchesStatus =
            status === "All" ||
            (status === "Active" && isActive(doctor)) ||
            (status === "Inactive" && !isActive(doctor));

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

    return (
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
                            Doctors
                        </Typography>
                        <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                            Manage the doctors mapped to each area.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            if (onAddDoctor) {
                                onAddDoctor();
                            } else {
                                navigate("/admin/Doctors/add");
                            }
                        }}
                        sx={{ textTransform: "none", alignSelf: { xs: "flex-start", sm: "center" } }}
                    >
                        Add Doctor
                    </Button>
                </Box>

                <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                        <TextField
                            size="small"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search doctors"
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
                                <TableCell>Doctor Name</TableCell>
                                <TableCell>Speciality</TableCell>
                                <TableCell>Hospital Name</TableCell>
                                <TableCell>Territory</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created On</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredDoctors.map((doctor) => (
                                <TableRow key={doctor.DoctorId} hover>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 0.5 }}>
                                            <Tooltip title="View Doctor" arrow>
                                                <IconButton
                                                    size="small"
                                                    aria-label={`View ${doctor.DoctorName || "doctor"}`}
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

                                            <Tooltip title="Edit Doctor" arrow>
                                                <IconButton
                                                    size="small"
                                                    aria-label={`Edit ${doctor.DoctorName || "doctor"}`}
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

                                            <Tooltip title="Delete Doctor" arrow>
                                                <IconButton
                                                    size="small"
                                                    aria-label={`Delete ${doctor.DoctorName || "doctor"}`}
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
                                    <TableCell>{doctor.DoctorName || "-"}</TableCell>
                                    <TableCell>{doctor.Speciality || "-"}</TableCell>
                                    <TableCell>{doctor.HospitalName || "-"}</TableCell>
                                    <TableCell>{doctor.TerritoryName || doctor.TerritoryId || "-"}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={isActive(doctor) ? "Active" : "Inactive"}
                                            color={isActive(doctor) ? "success" : "default"}
                                        />
                                    </TableCell>
                                    <TableCell>{formatDate(doctor.CreatedOn)}</TableCell>
                                </TableRow>
                            ))}
                            {!filteredDoctors.length && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: "text.secondary" }}>
                                        No doctors found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};