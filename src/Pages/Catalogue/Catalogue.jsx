import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    AddRounded,
    CardGiftcardRounded,
    EditRounded,
    MedicationRounded,
    SearchRounded,
} from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import LoadError from "../../components/LoadError/LoadError";
import MasterLayout from "../../components/MasterLayout/MasterLayout";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { errorMessage, formatMoney, getGifts, getProducts, saveGift, saveProduct } from "../Engagement/index";
import CatalogueItemDialog, { CATALOGUE_KINDS } from "./CatalogueItemDialog";

const TABS = [
    { value: "products", label: "Products", icon: MedicationRounded },
    { value: "gifts", label: "Gifts", icon: CardGiftcardRounded },
];

const ROUTES = { products: "/admin/catalogue/products", gifts: "/admin/catalogue/gifts" };

const COLUMNS = {
    products: [
        { key: "ProductName", label: "Product", render: (row) => (
            <Box>
                <Typography variant="subtitle2">{row.ProductName}</Typography>
                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {row.Composition || "—"}
                </Typography>
            </Box>
        ) },
        { key: "Therapy", label: "Therapy", render: (row) => row.Therapy || "—" },
        { key: "PackSize", label: "Pack", render: (row) => row.PackSize || "—" },
        { key: "UnitPrice", label: "Price", render: (row) => formatMoney(row.UnitPrice) },
        { key: "IsSample", label: "Sample", render: (row) => (row.IsSample ? <Tag label="Yes" color="primary" /> : "No") },
    ],
    gifts: [
        { key: "GiftName", label: "Gift", render: (row) => (
            <Box>
                <Typography variant="subtitle2">{row.GiftName}</Typography>
                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {row.Description || "—"}
                </Typography>
            </Box>
        ) },
        { key: "UnitValue", label: "Value", render: (row) => formatMoney(row.UnitValue) },
    ],
};

function Catalogue({ kind = "products" }) {
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const config = CATALOGUE_KINDS[kind];

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState(null); // null closed, {} new, row = edit
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = kind === "products" ? await getProducts() : await getGifts();
            setRows(response?.[kind] || []);
        } catch (err) {
            setRows([]);
            setError(errorMessage(err, `Failed to load ${kind}`));
        } finally {
            setLoading(false);
        }
    }, [kind]);

    useEffect(() => {
        setSearch("");
        setEditing(null);
        load();
    }, [load]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return rows;

        return rows.filter((row) =>
            Object.values(row).some((value) => typeof value === "string" && value.toLowerCase().includes(term))
        );
    }, [rows, search]);

    const handleSave = async (values) => {
        setSaving(true);

        try {
            const id = editing?.[config.idKey] || null;
            const response = kind === "products" ? await saveProduct(id, values) : await saveGift(id, values);

            showSnackbar(response?.message || "Saved", "success");
            setEditing(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Save failed"), "error");
        } finally {
            setSaving(false);
        }
    };

    const columns = COLUMNS[kind];

    return (
        <MasterLayout
            eyebrow="Configuration · Catalogue"
            title="Products & gifts"
            subtitle="Our brands (used for samples and RCPA) and the gifts your team can give doctors."
            tabs={TABS}
            value={kind}
            onTabChange={(next) => navigate(ROUTES[next])}
        >
            <Stack
                direction={{ xs: "column", sm: "row" }}
                sx={{ gap: 1.5, mb: 2, alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}
            >
                <TextField
                    size="small"
                    placeholder={`Search ${kind}…`}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    sx={(theme) => ({
                        minWidth: theme.search.minWidth,
                        "& .MuiOutlinedInput-root": { minHeight: theme.field.compactHeight },
                    })}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRounded fontSize="small" />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                <Button variant="contained" startIcon={<AddRounded />} onClick={() => setEditing({})}>
                    Add {config.noun}
                </Button>
            </Stack>

            {error ? (
                <LoadError title={`Couldn't load ${kind}`} message={error} onRetry={load} />
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={kind === "products" ? MedicationRounded : CardGiftcardRounded}
                    title={loading ? "Loading…" : rows.length ? "Nothing matches your search" : `No ${kind} yet`}
                    message={
                        loading || rows.length
                            ? ""
                            : kind === "products"
                              ? "Add your brands to start issuing samples and recording RCPA."
                              : "Add the gifts your team distributes to doctors."
                    }
                />
            ) : (
                <Box sx={{ overflowX: "auto" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell key={column.key}>{column.label}</TableCell>
                                ))}
                                <TableCell>Status</TableCell>
                                <TableCell align="right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((row) => (
                                <TableRow key={row[config.idKey]} hover>
                                    {columns.map((column) => (
                                        <TableCell key={column.key}>{column.render(row)}</TableCell>
                                    ))}
                                    <TableCell>
                                        <Tag label={row.IsActive ? "Active" : "Inactive"} color={row.IsActive ? "success" : "secondary"} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={`Edit ${config.noun}`}>
                                            <IconButton size="small" aria-label={`Edit ${row[config.nameKey]}`} onClick={() => setEditing(row)}>
                                                <EditRounded fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            )}

            {editing && (
                <CatalogueItemDialog
                    key={editing[config.idKey] || "new"}
                    kind={kind}
                    item={editing[config.idKey] ? editing : null}
                    saving={saving}
                    onClose={() => setEditing(null)}
                    onSave={handleSave}
                />
            )}
        </MasterLayout>
    );
}

export default Catalogue;
