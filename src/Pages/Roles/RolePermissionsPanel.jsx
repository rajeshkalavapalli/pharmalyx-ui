import { useEffect, useMemo, useState } from "react";

import { Box, Button, Stack, Switch, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AccountTreeRounded,
    AssignmentIndRounded,
    AssignmentTurnedInRounded,
    BadgeRounded,
    CardGiftcardRounded,
    CurrencyRupeeRounded,
    EventNoteRounded,
    FactCheckRounded,
    FeedbackRounded,
    InsightsRounded,
    LocalHospitalRounded,
    LocationOnRounded,
    LockRounded,
    MedicationRounded,
    RestartAltRounded,
    RouteRounded,
    SaveRounded,
    SecurityRounded,
    SpaceDashboardRounded,
    TuneRounded,
} from "@mui/icons-material";

import LoadError from "../../components/LoadError/LoadError";
import Panel from "../../components/Panel/Panel";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { ACTIONS, LOCKED, errorMessage, getRolePermissions, saveRolePermissions } from "./index";

const FEATURE_ICONS = {
    users: BadgeRounded,
    roles: SecurityRounded,
    masters: AccountTreeRounded,
    assignments: AssignmentIndRounded,
    catalogue: MedicationRounded,
    configuration: TuneRounded,
    tourplan: EventNoteRounded,
    deviation: RouteRounded,
    visits: LocationOnRounded,
    dcr: AssignmentTurnedInRounded,
    doctors: LocalHospitalRounded,
    stock: CardGiftcardRounded,
    rcpa: FactCheckRounded,
    business: CurrencyRupeeRounded,
    feedback: FeedbackRounded,
    dashboard: SpaceDashboardRounded,
    reports: InsightsRounded,
};

// Shared grid template: feature column, one column per action, then "All".
const gridColumns = (theme) =>
    `minmax(${theme.permissionMatrix.featureColumnMinWidth}px, 1fr) repeat(${ACTIONS.length + 1}, ${theme.permissionMatrix.actionColumnWidth}px)`;

// Feature × action matrix of on/off switches for one role, saved together.
function RolePermissionsPanel({ role, onSaved, onTotal }) {
    const { showSnackbar } = useSnackbar();

    const [permissions, setPermissions] = useState([]);
    const [draft, setDraft] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getRolePermissions(role.RoleId);
            setPermissions(response.permissions || []);
            onTotal?.((response.permissions || []).length);
            setDraft({});
        } catch (err) {
            setPermissions([]);
            setError(errorMessage(err, "Failed to load permissions"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // Reload only when the selected role changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role.RoleId]);

    const byCode = useMemo(() => new Map(permissions.map((p) => [p.PermissionCode, p])), [permissions]);

    // Module -> features -> { code per action }.
    const modules = useMemo(() => {
        const result = [];
        permissions.forEach((p) => {
            let module = result.find((m) => m.name === p.ModuleName);
            if (!module) {
                module = { name: p.ModuleName, features: [] };
                result.push(module);
            }
            let feature = module.features.find((f) => f.code === p.FeatureCode);
            if (!feature) {
                feature = { code: p.FeatureCode, name: p.FeatureName, actions: {} };
                module.features.push(feature);
            }
            feature.actions[p.ActionCode] = p;
        });
        return result;
    }, [permissions]);

    const isOn = (code) => draft[code] ?? Boolean(byCode.get(code)?.IsAllowed);
    const isLocked = (code) => role.RoleCode === LOCKED.role && LOCKED.permissions.includes(code);
    const isChanged = (code) => draft[code] !== undefined && draft[code] !== Boolean(byCode.get(code)?.IsAllowed);

    // Keeps View consistent: any action turns View on; View off turns the row off.
    const setCells = (feature, updates) =>
        setDraft((current) => {
            const next = { ...current };
            const viewCode = feature.actions.view?.PermissionCode;

            Object.entries(updates).forEach(([code, value]) => {
                if (!isLocked(code)) next[code] = value;
            });

            const anyActionOn = Object.values(feature.actions).some(
                (p) => p.ActionCode !== "view" && (next[p.PermissionCode] ?? Boolean(p.IsAllowed))
            );

            if (viewCode && anyActionOn) next[viewCode] = true;

            if (viewCode && updates[viewCode] === false) {
                Object.values(feature.actions).forEach((p) => {
                    if (!isLocked(p.PermissionCode)) next[p.PermissionCode] = false;
                });
            }

            return next;
        });

    const changes = permissions
        .filter((p) => isChanged(p.PermissionCode))
        .map((p) => ({ PermissionCode: p.PermissionCode, IsAllowed: draft[p.PermissionCode] }));

    const handleSave = async () => {
        setSaving(true);

        try {
            const response = await saveRolePermissions(role.RoleId, changes);
            showSnackbar(response?.message || "Permissions saved", "success");
            await load();
            onSaved?.();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to save permissions"), "error");
        } finally {
            setSaving(false);
        }
    };

    const allowedCount = permissions.filter((p) => isOn(p.PermissionCode)).length;
    const percent = permissions.length ? Math.round((allowedCount / permissions.length) * 100) : 0;

    return (
        <Panel
            title={role.RoleName}
            subtitle={`${allowedCount} of ${permissions.length} permissions on (${percent}%) · ${role.ActiveUsers} active user(s)`}
            disablePadding
            sx={{ overflow: { xs: "hidden", lg: "visible" } }}
            actions={
                <Stack direction="row" spacing={1}>
                    <Button startIcon={<RestartAltRounded />} disabled={!changes.length || saving} onClick={() => setDraft({})}>
                        Discard
                    </Button>
                    <Button variant="contained" startIcon={<SaveRounded />} disabled={!changes.length || saving} onClick={handleSave}>
                        {changes.length ? `Save ${changes.length} change${changes.length === 1 ? "" : "s"}` : "All saved"}
                    </Button>
                </Stack>
            }
        >
            {error ? (
                <Box sx={(theme) => ({ p: theme.panel.padding })}>
                    <LoadError title="Couldn't load permissions" message={error} onRetry={load} />
                </Box>
            ) : (
                // Sideways scroll only on small screens; on desktop the header sticks to the page.
                <Box sx={(theme) => ({ overflowX: { xs: "auto", lg: "visible" }, opacity: loading ? theme.table.loadingOpacity : 1 })}>
                    <Box role="table" aria-label={`Permissions for ${role.RoleName}`} sx={(theme) => ({ minWidth: theme.permissionMatrix.minWidth })}>
                        {/* Column headers */}
                        <Box
                            role="row"
                            sx={(theme) => ({
                                display: "grid",
                                gridTemplateColumns: gridColumns(theme),
                                alignItems: "center",
                                px: theme.panel.padding,
                                py: 1.25,
                                position: "sticky",
                                top: 0,
                                zIndex: 2,
                                boxShadow: theme.elevation.sm,
                                backgroundColor: theme.palette.surface.muted,
                                borderBottom: "1px solid",
                                borderColor: theme.palette.border.default,
                            })}
                        >
                            <Typography role="columnheader" variant="overline" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                Feature
                            </Typography>
                            {[...ACTIONS, { code: "all", label: "All" }].map((action) => (
                                <Typography
                                    key={action.code}
                                    role="columnheader"
                                    variant="overline"
                                    sx={(theme) => ({ textAlign: "center", color: theme.palette.text.secondary })}
                                >
                                    {action.label}
                                </Typography>
                            ))}
                        </Box>

                        {modules.map((module) => (
                            <Box key={module.name} role="rowgroup">
                                {/* Module heading */}
                                <Box
                                    sx={(theme) => ({
                                        px: theme.panel.padding,
                                        pt: 2.5,
                                        pb: 1,
                                    })}
                                >
                                    <Typography variant="overline" component="h3" sx={(theme) => ({ color: theme.palette.primary.main })}>
                                        {module.name}
                                    </Typography>
                                </Box>

                                {module.features.map((feature) => {
                                    const Icon = FEATURE_ICONS[feature.code] || SecurityRounded;
                                    const codes = Object.values(feature.actions).map((p) => p.PermissionCode);
                                    const editable = codes.filter((code) => !isLocked(code));
                                    const rowAll = codes.every(isOn);
                                    const rowSome = codes.some(isOn);
                                    const rowChanged = codes.some(isChanged);

                                    return (
                                        <Box
                                            key={feature.code}
                                            role="row"
                                            sx={(theme) => ({
                                                display: "grid",
                                                gridTemplateColumns: gridColumns(theme),
                                                alignItems: "center",
                                                minHeight: theme.permissionMatrix.cellHeight,
                                                px: theme.panel.padding,
                                                borderTop: "1px solid",
                                                borderColor: theme.palette.border.subtle,
                                                backgroundColor: rowChanged
                                                    ? alpha(theme.palette.warning.main, theme.tint.hover * 1.5)
                                                    : "transparent",
                                                transition: theme.calendar.transition,
                                                "&:hover": {
                                                    backgroundColor: rowChanged
                                                        ? alpha(theme.palette.warning.main, theme.tint.hover * 2)
                                                        : theme.palette.surface.subtle,
                                                },
                                            })}
                                        >
                                            {/* Feature */}
                                            <Stack role="rowheader" direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0, py: 1 }}>
                                                <Box
                                                    sx={(theme) => ({
                                                        width: theme.avatar.sizeSmall,
                                                        height: theme.avatar.sizeSmall,
                                                        flexShrink: 0,
                                                        display: "grid",
                                                        placeItems: "center",
                                                        borderRadius: theme.sidebarLayout.radius,
                                                        color: rowSome ? theme.palette.primary.main : theme.palette.text.disabled,
                                                        backgroundColor: rowSome
                                                            ? alpha(theme.palette.primary.main, theme.tint.soft)
                                                            : theme.palette.surface.muted,
                                                        transition: theme.calendar.transition,
                                                    })}
                                                >
                                                    <Icon fontSize="small" />
                                                </Box>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography variant="subtitle2">{feature.name}</Typography>
                                                    <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                        {rowAll ? "Full access" : rowSome ? `${codes.filter(isOn).length} of ${codes.length} actions` : "No access"}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            {/* Action cells */}
                                            {ACTIONS.map((action) => {
                                                const permission = feature.actions[action.code];

                                                if (!permission) {
                                                    return (
                                                        <Typography
                                                            key={action.code}
                                                            role="cell"
                                                            aria-label={`${action.label} not applicable`}
                                                            sx={(theme) => ({ textAlign: "center", color: theme.palette.text.disabled })}
                                                        >
                                                            —
                                                        </Typography>
                                                    );
                                                }

                                                const code = permission.PermissionCode;
                                                const locked = isLocked(code);

                                                return (
                                                    <Box key={action.code} role="cell" sx={{ display: "grid", placeItems: "center", position: "relative" }}>
                                                        <Tooltip
                                                            title={locked ? "Administrators always keep this" : permission.Description}
                                                            placement="top"
                                                        >
                                                            <span>
                                                                <Switch
                                                                    size="small"
                                                                    checked={isOn(code)}
                                                                    disabled={locked || saving}
                                                                    onChange={(event) => setCells(feature, { [code]: event.target.checked })}
                                                                    slotProps={{ input: { "aria-label": `${feature.name}: ${action.label}` } }}
                                                                />
                                                            </span>
                                                        </Tooltip>
                                                        {locked && (
                                                            <LockRounded
                                                                sx={(theme) => ({
                                                                    position: "absolute",
                                                                    top: 0,
                                                                    right: theme.spacing(1),
                                                                    fontSize: theme.typography.micro.fontSize,
                                                                    color: theme.palette.text.disabled,
                                                                })}
                                                            />
                                                        )}
                                                        {isChanged(code) && (
                                                            <Box
                                                                aria-hidden
                                                                sx={(theme) => ({
                                                                    position: "absolute",
                                                                    top: 2,
                                                                    right: theme.spacing(1.25),
                                                                    width: theme.permissionMatrix.changedDotSize,
                                                                    height: theme.permissionMatrix.changedDotSize,
                                                                    borderRadius: "50%",
                                                                    backgroundColor: theme.palette.warning.main,
                                                                })}
                                                            />
                                                        )}
                                                    </Box>
                                                );
                                            })}

                                            {/* Whole row */}
                                            <Box role="cell" sx={{ display: "grid", placeItems: "center" }}>
                                                <Tooltip title={rowAll ? "Turn everything off" : "Turn everything on"} placement="top">
                                                    <span>
                                                        <Switch
                                                            size="small"
                                                            color="success"
                                                            checked={rowAll}
                                                            disabled={editable.length === 0 || saving}
                                                            onChange={(event) =>
                                                                setCells(
                                                                    feature,
                                                                    Object.fromEntries(editable.map((code) => [code, event.target.checked]))
                                                                )
                                                            }
                                                            slotProps={{ input: { "aria-label": `${feature.name}: all actions` } }}
                                                        />
                                                    </span>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        ))}

                        <Typography
                            variant="caption"
                            component="p"
                            sx={(theme) => ({ px: theme.panel.padding, py: 2, color: theme.palette.text.secondary })}
                        >
                            Turning on any action also turns on View. Turning off View turns off the whole row.
                        </Typography>
                    </Box>
                </Box>
            )}
        </Panel>
    );
}

export default RolePermissionsPanel;
