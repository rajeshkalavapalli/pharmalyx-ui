import { useCallback, useEffect, useState } from "react";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { CloseRounded, EditRounded, PriceChangeRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { RATE_FIELDS, errorMessage, formatAmount, getRates, saveRate } from "../index";

const isRate = (value) => value === "" || (/^\d+(\.\d{1,2})?$/.test(String(value)) && Number(value) <= 100000);

function RateDialog({ designation, onClose, onSaved }) {
    const { showSnackbar } = useSnackbar();

    const [values, setValues] = useState(() =>
        Object.fromEntries([...RATE_FIELDS.map((field) => field.key), "OtherMonthlyLimit"].map((key) => [key, designation[key] == null ? "" : String(designation[key])]))
    );
    const [saving, setSaving] = useState(false);

    const invalid = Object.values(values).some((value) => !isRate(value));

    const handleSave = async () => {
        setSaving(true);

        try {
            const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value === "" ? (key === "OtherMonthlyLimit" ? null : 0) : Number(value)]));
            const response = await saveRate(designation.DesignationId, payload);
            showSnackbar(response?.message || "Rate card saved", "success");
            onSaved();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to save the rate card"), "error");
        } finally {
            setSaving(false);
        }
    };

    const field = (key, label, helper) => (
        <TextField
            key={key}
            size="small"
            type="number"
            label={label}
            value={values[key]}
            error={!isRate(values[key])}
            helperText={helper || " "}
            onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
            slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
        />
    );

    return (
        <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
            <DialogTitle component="div" sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY, display: "flex", gap: 2 })}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        Rate card
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {designation.DesignationName}
                    </Typography>
                </Box>
                <IconButton aria-label="Close" size="small" onClick={onClose} disabled={saving}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography variant="subtitle2">Daily allowance (₹ per day)</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1.5 }}>
                        {RATE_FIELDS.filter((item) => item.group === "da").map((item) => field(item.key, item.label))}
                    </Box>
                    <Typography variant="subtitle2">Travel allowance (₹ per km)</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1.5 }}>
                        {RATE_FIELDS.filter((item) => item.group === "km").map((item) => field(item.key, item.label))}
                    </Box>
                    <Typography variant="subtitle2">Other expenses</Typography>
                    {field("OtherMonthlyLimit", "Monthly limit (₹)", "Leave empty for no limit")}
                </Stack>
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, gap: 1 })}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleSave} disabled={saving || invalid}>
                    Save rates
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// Admin: DA per day by station and TA per km by travel mode, per designation.
function RateCard() {
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            setDesignations((await getRates()).designations || []);
        } catch (err) {
            setDesignations([]);
            setError(errorMessage(err, "Failed to load the rate card"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <Box>
            <PageHeader
                eyebrow="Expenses · Rate card"
                title="DA / TA rate card"
                subtitle="Set the daily allowance and per-km travel rate for each designation. Claims use these rates automatically."
            />

            {error ? (
                <LoadError title="Couldn't load the rate card" message={error} onRetry={load} />
            ) : (
                <Panel title="Designations" subtitle="Users of a designation without rates can't submit claims." sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}>
                    {designations.length ? (
                        <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Designation</TableCell>
                                        <TableCell align="right">DA HQ / Ex-HQ / Out</TableCell>
                                        <TableCell align="right">Bike / Car per km</TableCell>
                                        <TableCell align="right">Other limit</TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {designations.map((designation) => (
                                        <TableRow key={designation.DesignationId} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                    <Typography variant="subtitle2">{designation.DesignationName}</Typography>
                                                    {!designation.HasRates && <Tag label="Not set" color="warning" />}
                                                </Stack>
                                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                    {designation.Users} user(s)
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                {designation.HasRates ? `${formatAmount(designation.DaHq)} / ${formatAmount(designation.DaExHq)} / ${formatAmount(designation.DaOutstation)}` : "—"}
                                            </TableCell>
                                            <TableCell align="right">{designation.HasRates ? `${formatAmount(designation.KmBike)} / ${formatAmount(designation.KmCar)}` : "—"}</TableCell>
                                            <TableCell align="right">{designation.HasRates ? (designation.OtherMonthlyLimit == null ? "No limit" : formatAmount(designation.OtherMonthlyLimit)) : "—"}</TableCell>
                                            <TableCell align="right">
                                                <Button size="small" variant={designation.HasRates ? "outlined" : "contained"} startIcon={<EditRounded />} onClick={() => setEditing(designation)}>
                                                    {designation.HasRates ? "Edit" : "Set rates"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    ) : (
                        <EmptyState icon={PriceChangeRounded} title={loading ? "Loading…" : "No designations"} message={loading ? "" : "Add designations to the Employee Designation list first."} />
                    )}
                </Panel>
            )}

            {editing && (
                <RateDialog
                    designation={editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        load();
                    }}
                />
            )}
        </Box>
    );
}

export default RateCard;
