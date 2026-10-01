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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteDoctor, getDoctors, updateDoctor } from "./service";
import ConfirmationDialog from "../../components/conformationDialog/ConformationDialog";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";

export const DoctorList = function ({ onAddDoctor }) {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [viewDoctor, setViewDoctor] = useState(null);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { showSnackbar } = useSnackbar();

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

    const handleUpdate = async () => {
        try {
            await updateDoctor(editingDoctor.DoctorId, editingDoctor);
            setDoctors((current) => current.map((doctor) => doctor.DoctorId === editingDoctor.DoctorId ? editingDoctor : doctor));
            setEditingDoctor(null);
            showSnackbar("Doctor updated successfully", "success");
        } catch (error) {
            console.error("Error updating doctor", error);
            showSnackbar(error.response?.data?.message || "Failed to update doctor", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDoctor(deleteTarget.DoctorId);
            setDoctors((current) => current.filter((doctor) => doctor.DoctorId !== deleteTarget.DoctorId));
            setDeleteTarget(null);
            showSnackbar("Doctor deleted successfully", "success");
        } catch (error) {
            console.error("Error deleting doctor", error);
            showSnackbar(error.response?.data?.message || "Failed to delete doctor", "error");
        }
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
                                            {editingDoctor?.DoctorId === doctor.DoctorId ? (
                                                <>
                                                    <Button size="small" onClick={handleUpdate}>Update</Button>
                                                    <Button size="small" onClick={() => setEditingDoctor(null)}>Cancel</Button>
                                                </>
                                            ) : <>
                                            <Tooltip title="View Doctor" arrow>
                                                <IconButton
                                                    size="small"
                                                    aria-label={`View ${doctor.DoctorName || "doctor"}`}
                                                    onClick={() => setViewDoctor(doctor)}
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
                                                    onClick={() => setEditingDoctor({ ...doctor })}
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
                                                    onClick={() => setDeleteTarget(doctor)}
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
                                            </>}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {editingDoctor?.DoctorId === doctor.DoctorId ? (
                                            <TextField size="small" value={editingDoctor.DoctorName || ""} onChange={(event) => setEditingDoctor((current) => ({ ...current, DoctorName: event.target.value }))} />
                                        ) : doctor.DoctorName || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {editingDoctor?.DoctorId === doctor.DoctorId ? (
                                            <TextField size="small" value={editingDoctor.Speciality || ""} onChange={(event) => setEditingDoctor((current) => ({ ...current, Speciality: event.target.value }))} />
                                        ) : doctor.Speciality || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {editingDoctor?.DoctorId === doctor.DoctorId ? (
                                            <TextField size="small" value={editingDoctor.HospitalName || ""} onChange={(event) => setEditingDoctor((current) => ({ ...current, HospitalName: event.target.value }))} />
                                        ) : doctor.HospitalName || "-"}
                                    </TableCell>
                                    <TableCell>{doctor.TerritoryName || doctor.TerritoryId || "-"}</TableCell>
                                    <TableCell>
                                        {editingDoctor?.DoctorId === doctor.DoctorId ? (
                                            <Select size="small" value={editingDoctor.IsActive === "No" ? "No" : "Yes"} onChange={(event) => setEditingDoctor((current) => ({ ...current, IsActive: event.target.value }))}>
                                                <MenuItem value="Yes">Active</MenuItem>
                                                <MenuItem value="No">Inactive</MenuItem>
                                            </Select>
                                        ) : <Chip
                                            size="small"
                                            label={isActive(doctor) ? "Active" : "Inactive"}
                                            color={isActive(doctor) ? "success" : "default"}
                                        />}
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
            <Dialog open={Boolean(viewDoctor)} onClose={() => setViewDoctor(null)} maxWidth="sm" fullWidth>
                <DialogTitle>{viewDoctor?.DoctorName || "Doctor details"}</DialogTitle>
                <DialogContent dividers>
                    <Typography>Qualification: {viewDoctor?.Qualification || "-"}</Typography>
                    <Typography>Speciality: {viewDoctor?.Speciality || "-"}</Typography>
                    <Typography>Hospital: {viewDoctor?.HospitalName || "-"}</Typography>
                    <Typography>Territory: {viewDoctor?.TerritoryName || viewDoctor?.TerritoryId || "-"}</Typography>
                    <Typography>Status: {viewDoctor && (isActive(viewDoctor) ? "Active" : "Inactive")}</Typography>
                </DialogContent>
                <DialogActions><Button onClick={() => setViewDoctor(null)}>Close</Button></DialogActions>
            </Dialog>
            <ConfirmationDialog
                open={Boolean(deleteTarget)}
                title="Delete Doctor"
                message={`Are you sure you want to delete ${deleteTarget?.DoctorName || "this doctor"}?`}
                confirmText="Yes, Delete"
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />
        </Box>
    );
};