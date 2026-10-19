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

import { deleteDoctor, getDoctors } from "./index";
import { getMyPermissions } from "../DoctorRequests/index";
import ChangeRequestDialog from "../DoctorRequests/components/ChangeRequestDialog";
import ConfirmationDialog from "../../components/conformationDialog/ConformationDialog";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";

export const DoctorList = function ({ onAddDoctor }) {
    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [permissions, setPermissions] = useState(new Set());

    // Only admins change doctors here; everyone else uses Doctor Requests (manager approval).
    const canCreate = permissions.has("masters.create");
    const canEdit = permissions.has("masters.edit");
    const canDelete = permissions.has("masters.delete");
    const seesAll = permissions.has("masters.view");
    // Everyone else asks: add / edit / delete go to the manager with a reason.
    const canRequest = permissions.has("doctorrequests.create");
    const [requestTarget, setRequestTarget] = useState(null);

    // Why a request can't be raised for this doctor (null when it can).
    const requestBlocker = (doctor) => {
        if (!isActive(doctor)) return "This doctor is inactive";
        if (doctor.ApprovalStatus && doctor.ApprovalStatus !== "APPROVED")
            return "Still waiting for manager approval";
        if (!doctor.IsMine)
            return "Only the MR this doctor is assigned to can request changes";
        return null;
    };

    const { showSnackbar } = useSnackbar();

    useEffect(() => {
        getMyPermissions()
            .then(setPermissions)
            .catch(() => setPermissions(new Set()));
    }, []);

    useEffect(() => {
        const loadDoctors = async () => {
            try {
                const response = await getDoctors();

                const data =
                    response?.doctors || response?.result || response || [];

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
        const searchValue =
            `${doctor.DoctorName || ""} ${doctor.Speciality || ""} ${doctor.HospitalName || ""} ${doctor.TerritoryName || ""}`.toLowerCase();

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

    const handleViewDoctor = (doctor) => {
        navigate("/admin/Doctors/add", {
            state: {
                mode: "view",
                doctor,
            },
        });
    };

    const handleEditDoctor = (doctor) => {
        navigate("/admin/Doctors/add", {
            state: {
                mode: "edit",
                doctor,
            },
        });
    };

    const handleDelete = async () => {
        try {
            await deleteDoctor(deleteTarget.DoctorId);

            setDoctors((current) =>
                current.filter(
                    (doctor) => doctor.DoctorId !== deleteTarget.DoctorId,
                ),
            );

            setDeleteTarget(null);

            showSnackbar("Doctor deleted successfully", "success");
        } catch (error) {
            console.error("Error deleting doctor", error);

            showSnackbar(
                error.response?.data?.message || "Failed to delete doctor",
                "error",
            );
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
                        <Typography variant="h6" sx={{ fontWeight: "fontWeightBold" }}>
                            Doctors
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.5,
                                fontSize: "textMd",
                                color: "text.secondary",
                            }}
                        >
                            {seesAll
                                ? "Manage the doctors mapped to each area."
                                : "Doctors assigned to you and your team. To add, change or remove a doctor, use Doctor Requests (your manager approves)."}
                        </Typography>
                    </Box>

                    {canCreate && (
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
                            sx={{
                                textTransform: "none",
                                alignSelf: {
                                    xs: "flex-start",
                                    sm: "center",
                                },
                            }}
                        >
                            Add Doctor
                        </Button>
                    )}
                    {!canCreate && canRequest && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate("/admin/Doctors/add")}
                            sx={{
                                textTransform: "none",
                                alignSelf: {
                                    xs: "flex-start",
                                    sm: "center",
                                },
                            }}
                        >
                            Request new doctor
                        </Button>
                    )}
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1.5,
                            flexWrap: "wrap",
                        }}
                    >
                        <TextField
                            size="small"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search doctors"
                            InputProps={{
                                startAdornment: (
                                    <SearchOutlinedIcon
                                        sx={{
                                            mr: 1,
                                            color: "text.secondary",
                                        }}
                                    />
                                ),
                            }}
                            sx={{
                                flex: 1,
                                minWidth: 220,
                            }}
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
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 0.5,
                                            }}
                                        >
                                            <Tooltip title="View Doctor" arrow>
                                                <IconButton
                                                    size="small"
                                                    aria-label={`View ${doctor.DoctorName || "doctor"}`}
                                                    onClick={() =>
                                                        handleViewDoctor(doctor)
                                                    }
                                                    sx={{
                                                        width: 31,
                                                        height: 31,
                                                        borderRadius: 1.25,
                                                        color: "text.secondary",
                                                        "&:hover": {
                                                            color: "primary.main",
                                                            backgroundColor:
                                                                "action.hover",
                                                        },
                                                    }}
                                                >
                                                    <VisibilityOutlinedIcon
                                                        sx={{
                                                            fontSize: "text2xl",
                                                        }}
                                                    />
                                                </IconButton>
                                            </Tooltip>

                                            {(canEdit || canRequest) && (
                                                <Tooltip
                                                    title={
                                                        canEdit
                                                            ? "Edit Doctor"
                                                            : requestBlocker(
                                                                  doctor,
                                                              ) ||
                                                              "Request an edit (manager approves)"
                                                    }
                                                    arrow
                                                >
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            disabled={
                                                                !canEdit &&
                                                                Boolean(
                                                                    requestBlocker(
                                                                        doctor,
                                                                    ),
                                                                )
                                                            }
                                                            aria-label={`Edit ${doctor.DoctorName || "doctor"}`}
                                                            onClick={() =>
                                                                handleEditDoctor(
                                                                    doctor,
                                                                )
                                                            }
                                                            sx={{
                                                                width: 31,
                                                                height: 31,
                                                                borderRadius: 1.25,
                                                                color: "text.secondary",
                                                                "&:hover": {
                                                                    color: "primary.main",
                                                                    backgroundColor:
                                                                        "action.hover",
                                                                },
                                                            }}
                                                        >
                                                            <EditOutlinedIcon
                                                                sx={{
                                                                    fontSize: "text2xl",
                                                                }}
                                                            />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            )}

                                            {(canDelete || canRequest) && (
                                                <Tooltip
                                                    title={
                                                        canDelete
                                                            ? "Delete Doctor"
                                                            : requestBlocker(
                                                                  doctor,
                                                              ) ||
                                                              "Request removal (manager approves)"
                                                    }
                                                    arrow
                                                >
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            disabled={
                                                                !canDelete &&
                                                                Boolean(
                                                                    requestBlocker(
                                                                        doctor,
                                                                    ),
                                                                )
                                                            }
                                                            aria-label={`Delete ${doctor.DoctorName || "doctor"}`}
                                                            onClick={() =>
                                                                canDelete
                                                                    ? setDeleteTarget(
                                                                          doctor,
                                                                      )
                                                                    : setRequestTarget(
                                                                          {
                                                                              doctor,
                                                                              type: "DELETE",
                                                                          },
                                                                      )
                                                            }
                                                            sx={{
                                                                width: 31,
                                                                height: 31,
                                                                borderRadius: 1.25,
                                                                color: "text.secondary",
                                                                "&:hover": {
                                                                    color: "error.main",
                                                                    backgroundColor:
                                                                        "error.lighter",
                                                                },
                                                            }}
                                                        >
                                                            <DeleteOutline
                                                                sx={{
                                                                    fontSize: "text2xl",
                                                                }}
                                                            />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        {doctor.DoctorName || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {doctor.Speciality || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {doctor.HospitalName || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {doctor.TerritoryName ||
                                            doctor.TerritoryId ||
                                            "-"}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={
                                                isActive(doctor)
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                            color={
                                                isActive(doctor)
                                                    ? "success"
                                                    : "default"
                                            }
                                        />
                                    </TableCell>

                                    <TableCell>
                                        {formatDate(doctor.CreatedOn)}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {!filteredDoctors.length && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        align="center"
                                        sx={{
                                            py: 5,
                                            color: "text.secondary",
                                        }}
                                    >
                                        No doctors found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <ConfirmationDialog
                open={Boolean(deleteTarget)}
                title="Delete Doctor"
                message={`Are you sure you want to delete ${deleteTarget?.DoctorName || "this doctor"}?`}
                confirmText="Yes, Delete"
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />

            {requestTarget && (
                <ChangeRequestDialog
                    doctor={requestTarget.doctor}
                    initialType={requestTarget.type}
                    onClose={() => setRequestTarget(null)}
                    onSaved={() => setRequestTarget(null)}
                />
            )}
        </Box>
    );
};
