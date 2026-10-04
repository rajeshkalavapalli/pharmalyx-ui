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

import { deleteStockist, getStockists } from "./index";
import ConfirmationDialog from "../../components/conformationDialog/ConformationDialog";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";

export const StockistOrRetailerList = function ({ onAddPharmacy }) {

    const navigate = useNavigate();

    const [pharmacies, setPharmacies] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { showSnackbar } = useSnackbar();

    useEffect(() => {

        const loadPharmacies = async () => {

            try {

                const response = await getStockists();

                const data =
                    response?.pharmacies ||
                    response?.result ||
                    response ||
                    [];

                setPharmacies(Array.isArray(data) ? data : []);

            } catch (err) {

                console.log("error getting stockists", err);

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

            pharmacy.StockistName || ""

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
            await deleteStockist(deleteTarget.StockistId);
            setPharmacies((current) => current.filter(
                (pharmacy) => pharmacy.StockistId !== deleteTarget.StockistId
            ));
            showSnackbar("Stockist deleted successfully", "success");
            setDeleteTarget(null);
        } catch (error) {
            console.error("Error deleting stockist", error);
            showSnackbar(error.response?.data?.message || "Failed to delete stockist", "error");
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
                            Stockists
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.5,
                                fontSize: 13,
                                color: "text.secondary"
                            }}
                        >
                            Manage stockists mapped to each area.
                        </Typography>

                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {

                            if (onAddPharmacy) {
                                onAddPharmacy();
                            } else {
                                navigate("/admin/Stockist/add");
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
                        Add Stockist
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
                            placeholder="Search stockists"
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
                                    Stockist Name
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

                                <TableCell>
                                    Modified On
                                </TableCell>

                            </TableRow>

                        </TableHead>

                        <TableBody>

                            {filteredPharmacies.map((stockist) => (

                                <TableRow
                                    key={stockist.StockistId}
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
                                                title="View Stockist"
                                                arrow
                                            >

                                                <IconButton
                                                    size="small"
                                                    aria-label={`View ${stockist.StockistName || "stockist"}`}
                                                    onClick={() => navigate("/admin/Stockist/add", { state: { mode: "view", stockist } })}
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
                                                title="Edit Stockist"
                                                arrow
                                            >

                                                <IconButton
                                                    size="small"
                                                    aria-label={`Edit ${stockist.StockistName || "stockist"}`}
                                                    onClick={() => navigate("/admin/Stockist/add", { state: { mode: "edit", stockist } })}
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
                                                title="Delete Stockist"
                                                arrow
                                            >

                                                <IconButton
                                                    size="small"
                                                    aria-label={`Delete ${stockist.StockistName || "stockist"}`}
                                                    onClick={() => setDeleteTarget(stockist)}
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
                                        {stockist.StockistName || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {stockist.OwnerName || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {stockist.ContactNumber || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {stockist.TerritoryName ||
                                            "-"}
                                    </TableCell>

                                    <TableCell>

                                        <Chip
                                            size="small"
                                            label={isActive(stockist) ? "Active" : "Inactive"}
                                            color={isActive(stockist) ? "success" : "default"}
                                        />

                                    </TableCell>

                                    <TableCell>
                                        {formatDate(stockist.CreatedOn)}
                                    </TableCell>

                                    <TableCell>
                                        {formatDate(stockist.ModifiedOn)}
                                    </TableCell>

                                </TableRow>

                            ))}

                            {!filteredPharmacies.length && (

                                <TableRow>

                                    <TableCell
                                        colSpan={8}
                                        align="center"
                                        sx={{
                                            py: 5,
                                            color: "text.secondary"
                                        }}
                                    >
                                        No stockists found.
                                    </TableCell>

                                </TableRow>

                            )}

                        </TableBody>

                    </Table>

                </TableContainer>

            </Box>


            <ConfirmationDialog
                open={Boolean(deleteTarget)}
                title="Delete Stockist"
                message={`Are you sure you want to delete ${deleteTarget?.StockistName || "this stockist"}?`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />

        </Box>
    );
};