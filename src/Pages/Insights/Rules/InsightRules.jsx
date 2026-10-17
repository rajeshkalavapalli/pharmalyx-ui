import { useCallback, useEffect, useState } from "react";

import { Box, Button, Divider, Stack, Switch, TextField, Typography } from "@mui/material";
import { RestartAltRounded, SaveRounded } from "@mui/icons-material";

import LoadError from "../../../components/LoadError/LoadError";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { errorMessage, getInsightRules, saveInsightRule } from "../index";

const draftOf = (rule) => ({ enabled: rule.enabled, t1: rule.t1 == null ? "" : String(rule.t1), t2: rule.t2 == null ? "" : String(rule.t2) });
const isNumber = (value) => value === "" || (/^\d+(\.\d{1,2})?$/.test(value) && Number(value) <= 100000);

function RuleRow({ rule, onSaved }) {
    const { showSnackbar } = useSnackbar();
    const [draft, setDraft] = useState(() => draftOf(rule));
    const [saving, setSaving] = useState(false);

    const original = draftOf(rule);
    const dirty = draft.enabled !== original.enabled || draft.t1 !== original.t1 || draft.t2 !== original.t2;
    const valid = isNumber(draft.t1) && isNumber(draft.t2);

    const save = async (payload) => {
        setSaving(true);

        try {
            const response = await saveInsightRule(rule.code, payload);
            showSnackbar(response?.message || "Rule saved", "success");
            onSaved();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to save the rule"), "error");
        } finally {
            setSaving(false);
        }
    };

    const thresholds = [rule.t1 != null && ["t1", rule.labels[0], rule.defaults.t1], rule.t2 != null && ["t2", rule.labels[1], rule.defaults.t2]].filter(Boolean);

    return (
        <Stack direction={{ xs: "column", lg: "row" }} sx={{ py: 2, gap: 2, alignItems: { lg: "center" } }}>
            <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0, alignItems: "flex-start" }}>
                <Switch
                    checked={draft.enabled}
                    onChange={(event) => setDraft((current) => ({ ...current, enabled: event.target.checked }))}
                    slotProps={{ input: { "aria-label": `${rule.title} on or off` } }}
                />
                <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
                        <Typography variant="subtitle2">{rule.title}</Typography>
                        {rule.customised && <Tag label="Customised" color="info" />}
                        {!draft.enabled && <Tag label="Off" color="secondary" />}
                    </Stack>
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {rule.description}
                    </Typography>
                </Box>
            </Stack>

            <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap", alignItems: "flex-start" }}>
                {thresholds.map(([field, label, fallback]) => (
                    <TextField
                        key={field}
                        size="small"
                        type="number"
                        label={label}
                        value={draft[field]}
                        disabled={!draft.enabled}
                        error={!isNumber(draft[field])}
                        helperText={`Default ${fallback}`}
                        onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))}
                        sx={(theme) => ({ width: theme.insights.thresholdWidth })}
                        slotProps={{ htmlInput: { min: 0 } }}
                    />
                ))}
                <Stack direction="row" sx={{ gap: 1, pt: 0.25 }}>
                    {rule.customised && (
                        <Button size="small" startIcon={<RestartAltRounded />} disabled={saving} onClick={() => save({ Reset: true })}>
                            Reset
                        </Button>
                    )}
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<SaveRounded />}
                        disabled={!dirty || !valid || saving}
                        onClick={() => save({ IsEnabled: draft.enabled, Threshold1: draft.t1, Threshold2: draft.t2 })}
                    >
                        Save
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    );
}

// Admin: switch alert rules on/off and change their thresholds.
function InsightRules() {
    const [rules, setRules] = useState(null);
    const [error, setError] = useState("");
    const [version, setVersion] = useState(0);

    const load = useCallback(async () => {
        setError("");

        try {
            setRules((await getInsightRules()).rules);
            setVersion((value) => value + 1);
        } catch (err) {
            setError(errorMessage(err, "Failed to load the rules"));
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const groups = rules ? [...new Set(rules.map((rule) => rule.groupLabel))] : [];

    return (
        <Box>
            <PageHeader eyebrow="Insights" title="Insight rules" subtitle="Choose which alerts run and when they fire. Changes apply the next time anyone opens Risk & alerts." />

            {error ? (
                <LoadError title="Couldn't load the rules" message={error} onRetry={load} />
            ) : (
                <Stack spacing={2}>
                    {groups.map((group) => (
                        <Panel key={group} title={group} subtitle={`${rules.filter((rule) => rule.groupLabel === group && rule.enabled).length} of ${rules.filter((rule) => rule.groupLabel === group).length} rules on`}>
                            <Stack divider={<Divider />}>
                                {rules
                                    .filter((rule) => rule.groupLabel === group)
                                    .map((rule) => (
                                        <RuleRow key={`${rule.code}-${version}`} rule={rule} onSaved={load} />
                                    ))}
                            </Stack>
                        </Panel>
                    ))}
                </Stack>
            )}
        </Box>
    );
}

export default InsightRules;
