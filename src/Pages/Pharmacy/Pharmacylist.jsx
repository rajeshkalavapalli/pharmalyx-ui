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

import { deletePharmacy, getPharmacies } from "./index";
import ConfirmationDialog from "../../components/conformationDialog/ConformationDialog";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";

export const PharmacyList = function ({ onAddPharmacy }) {

    const navigate = useNavigate();

    const [pharmacies, setPharmacies] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { showSnackbar } = useSnackbar();

    useEffect(() => {

        const loadPharmacies = async () => {

            try {

                const response = await getPharmacies();

                const data =
                    response?.pharmacies ||
                    response?.result ||
                    response ||
                    [];

                setPharmacies(Array.isArray(data) ? data : []);

            } catch (err) {

                console.log("error getting pharmacies", err);

                setPharmacies([]);
            }
        };

        loadPharmacies();

    }, []);

    const isActive = (pharmacy) =>
        pharmacy.IsActive === true ||
        pharmacy.IsActive === 1 ||
        pharmacy.IsActive === "Yes" ||
        pharmacy.IsActive === "YES" ||
        pharmacy.IsActive === "true";

    const filteredPharmacies = pharmacies.filter((pharmacy) => {

        const searchValue = `${

            pharmacy.PharmacyName || ""

        } ${

            pharmacy.OwnerName || ""

        } ${

            pharmacy.ContactNumber || ""

        } ${

            pharmacy.TerritoryName || ""

        }`.toLowerCase();

        const matchesSearch =
            searchValue.includes(search.toLowerCase());

        const matchesStatus =
            status === "All" ||
            (status === "Active" && isActive(pharmacy)) ||
            (status === "Inactive" && !isActive(pharmacy));

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

    const handleDelete = async () => {
        try {
            await deletePharmacy(deleteTarget.PharmacyId);
            setPharmacies((current) => current.filter(
                (pharmacy) => pharmacy.PharmacyId !== deleteTarget.PharmacyId
            ));
            showSnackbar("Pharmacy deleted successfully", "success");
            setDeleteTarget(null);
        } catch (error) {
            console.error("Error deleting pharmacy", error);
            showSnackbar(error.response?.data?.message || "Failed to delete pharmacy", "error");
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
                            Pharmacies
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.5,
                                fontSize: 13,
                                color: "text.secondary"
                            }}
                        >
                            Manage pharmacies mapped to each area.
                        </Typography>

                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {

                            if (onAddPharmacy) {
                                onAddPharmacy();
                            } else {
                                navigate("/admin/Pharmacies/add");
                            }

                        }}
                        sx={{
                            textTransform: "none",
                            alignSelf: {
                                xs: "flex-start",
                                sm: "center"
                            }
                        }}
                    >
                        Add Pharmacy
                    </Button>

                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2
                    }}
                >

                    <Box
                        sx={{
                            display: "flex",
                            gap: 1.5,
                            flexWrap: "wrap"
                        }}
                    >

                        <TextField
                            size="small"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search pharmacies"
                            InputProps={{
                                startAdornment: (
                                    <SearchOutlinedIcon
                                        sx={{
                                            mr: 1,
                                            color: "text.secondary"
                                        }}
                                    />
                                )
                            }}
                            sx={{
                                flex: 1,
                                minWidth: 220
                            }}
                        />

                        <Select
                            size="small"
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                            sx={{
                                minWidth: 140
                            }}
                        >

                            <MenuItem value="All">
                                All statuses
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

                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2
                    }}
                >

                    <Table size="small">

                        <TableHead>

                            <TableRow>

                                <TableCell>
                                    Actions
                                </TableCell>

                                <TableCell>
                                    Pharmacy Name
                                </TableCell>

                                <TableCell>
                                    Owner Name
                                </TableCell>

                                <TableCell>
                                    Contact Number
                                </TableCell>

                                <TableCell>
                                    Territory
                                </TableCell>

                                <TableCell>
                                    Status
                                </TableCell>

                                <TableCell>
                                    Created On
                                </TableCell>

                            </TableRow>

                        </TableHead>

                        <TableBody>

                            {filteredPharmacies.map((pharmacy) => (

                                <TableRow
                                    key={pharmacy.PharmacyId}
                                    hover
                                >

                                    <TableCell>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 0.5
                                            }}
                                        >

                                            <Tooltip
                                                title="View Pharmacy"
                                                arrow
                                            >

                                                <IconButton
                                                    size="small"
                                                    aria-label={`View ${pharmacy.PharmacyName || "pharmacy"}`}
                                                    onClick={() => navigate("/admin/Pharmacies/add", { state: { mode: "view", pharmacy } })}
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

                                                    <VisibilityOutlinedIcon
                                                        sx={{ fontSize: 17 }}
                                                    />

                                                </IconButton>

                                            </Tooltip>

                                            <Tooltip
                                                title="Edit Pharmacy"
                                                arrow
                                            >

                                                <IconButton
                                                    size="small"
                                                    aria-label={`Edit ${pharmacy.PharmacyName || "pharmacy"}`}
                                                    onClick={() => navigate("/admin/Pharmacies/add", { state: { mode: "edit", pharmacy } })}
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

                                                    <EditOutlinedIcon
                                                        sx={{ fontSize: 17 }}
                                                    />

                                                </IconButton>

                                            </Tooltip>

                                            <Tooltip
                                                title="Delete Pharmacy"
                                                arrow
                                            >

                                                <IconButton
                                                    size="small"
                                                    aria-label={`Delete ${pharmacy.PharmacyName || "pharmacy"}`}
                                                    onClick={() => setDeleteTarget(pharmacy)}
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

                                                    <DeleteOutline
                                                        sx={{ fontSize: 17 }}
                                                    />

                                                </IconButton>

                                            </Tooltip>

                                        </Box>

                                    </TableCell>

                                    <TableCell>
                                        {pharmacy.PharmacyName || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {pharmacy.OwnerName || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {pharmacy.ContactNumber || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {pharmacy.TerritoryName ||
                                            pharmacy.TerritoryId ||
                                            "-"}
                                    </TableCell>

                                    <TableCell>

                                        <Chip
                                            size="small"
                                            label={isActive(pharmacy) ? "Active" : "Inactive"}
                                            color={isActive(pharmacy) ? "success" : "default"}
                                        />

                                    </TableCell>

                                    <TableCell>
                                        {formatDate(pharmacy.CreatedOn)}
                                    </TableCell>

                                </TableRow>

                            ))}

                            {!filteredPharmacies.length && (

                                <TableRow>

                                    <TableCell
                                        colSpan={7}
                                        align="center"
                                        sx={{
                                            py: 5,
                                            color: "text.secondary"
                                        }}
                                    >
                                        No pharmacies found.
                                    </TableCell>

                                </TableRow>

                            )}

                        </TableBody>

                    </Table>

                </TableContainer>

            </Box>


            <ConfirmationDialog
                open={Boolean(deleteTarget)}
                title="Delete Pharmacy"
                message={`Are you sure you want to delete ${deleteTarget?.PharmacyName || "this pharmacy"}?`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />

        </Box>
    );
};