import { useCallback, useEffect, useState } from "react";

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { SaveRounded, TuneRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { errorMessage, getSettings, saveSettings } from "../index";

// Every rule value is per company and editable by head office; changes need a reason and are audited.
function RulesTab({ canEdit }) {
    const { showSnackbar } = useSnackbar();
    const [rows, setRows] = useState(null);
    const [values, setValues] = useState({});
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        getSettings()
            .then((result) => {
                setRows(result.settings);
                setValues(Object.fromEntries(result.settings.map((row) => [row.key, String(row.value)])));
            })
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load rule values"), "error"));
    }, [showSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    const changed = (rows || []).filter((row) => Number(values[row.key]) !== row.value);

    const save = async () => {
        setBusy(true);
        try {
            const result = await saveSettings(Object.fromEntries(changed.map((row) => [row.key, Number(values[row.key])])), reason);
            showSnackbar(result.message, "success");
            setReason("");
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Could not save"), "error");
        } finally {
            setBusy(false);
        }
    };

    if (!rows) return <EmptyState icon={TuneRounded} title="Loading…" />;

    return (
        <Panel
            title="Rule values"
            subtitle="Defaults: clinic radius 200 m, minimum stay 3 min, DA from 6 valid visits, A/B/C = 3/2/1 visits, location every 10 min."
            actions={
                canEdit && (
                    <Button variant="contained" startIcon={<SaveRounded />} disabled={busy || !changed.length || reason.trim().length < 10} onClick={save}>
                        Save {changed.length || ""}
                    </Button>
                )
            }
        >
            <Stack spacing={2}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
                    {rows.map((row) => (
                        <TextField
                            key={row.key}
                            type="number"
                            label={row.key.replace(/_/g, " ").toLowerCase()}
                            value={values[row.key]}
                            disabled={!canEdit}
                            onChange={(event) => setValues((current) => ({ ...current, [row.key]: event.target.value }))}
                            helperText={`${row.description || ""}${row.limits ? ` (${row.limits[0]}–${row.limits[1]})` : ""}`}
                            slotProps={{ htmlInput: { step: "any" } }}
                        />
                    ))}
                </Box>
                {canEdit && (
                    <TextField label="Why are you changing these? (required, saved in the audit log)" value={reason} onChange={(event) => setReason(event.target.value.slice(0, 500))} />
                )}
                {!canEdit && (
                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Only head office can change rule values.
                    </Typography>
                )}
            </Stack>
        </Panel>
    );
}

export default RulesTab;
