import { useCallback, useEffect, useState } from "react";

import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AdminPanelSettingsRounded,
    BadgeRounded,
    PeopleAltRounded,
    SecurityRounded,
    SupervisorAccountRounded,
} from "@mui/icons-material";

import LoadError from "../../components/LoadError/LoadError";
import PageHeader from "../../components/PageHeader/PageHeader";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import RolePermissionsPanel from "./RolePermissionsPanel";
import RoleUsersPanel from "./RoleUsersPanel";
import { errorMessage, getRoles } from "./index";

// Same colour per role as the Users tab.
const ROLE_INFO = {
    ADMIN: { icon: AdminPanelSettingsRounded, color: "primary", hint: "Company setup, users and master data" },
    MANAGER: { icon: SupervisorAccountRounded, color: "info", hint: "Own field work plus team approvals" },
    FIELD_USER: { icon: BadgeRounded, color: "success", hint: "Own plans, visits and daily reports" },
};

const TABS = [
    { value: "permissions", label: "Permissions", icon: SecurityRounded },
    { value: "users", label: "Users", icon: PeopleAltRounded },
];

// Role picker card: name, purpose, access level and users, in the role's colour.
function RoleCard({ role, total, selected, onSelect }) {
    const info = ROLE_INFO[role.RoleCode] || { icon: BadgeRounded, color: "secondary", hint: "" };
    const Icon = info.icon;
    const percent = total ? Math.round((role.AllowedPermissions / total) * 100) : 0;
    const full = total > 0 && role.AllowedPermissions === total;

    return (
        <ButtonBase
            onClick={onSelect}
            role="radio"
            aria-checked={selected}
            sx={(theme) => {
                const tone = theme.palette[info.color];

                return {
                    p: 2.25,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: 2,
                    textAlign: "left",
                    minWidth: 0,
                    borderRadius: theme.panel.radius,
                    border: "1px solid",
                    borderColor: selected ? tone.main : theme.palette.border.default,
                    backgroundColor: selected ? alpha(tone.main, theme.tint.hover) : theme.palette.background.paper,
                    boxShadow: selected ? `0 0 0 1px ${tone.main}` : theme.elevation.sm,
                    transition: theme.calendar.transition,
                    "&:hover": {
                        borderColor: selected ? tone.main : theme.palette.border.strong,
                        boxShadow: selected ? `0 0 0 1px ${tone.main}` : theme.card.shadow,
                    },
                };
            }}
        >
            {/* Identity */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                <Box
                    sx={(theme) => ({
                        width: theme.stat.iconSize,
                        height: theme.stat.iconSize,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: theme.stat.iconRadius,
                        color: selected ? theme.palette[info.color].contrastText : theme.palette[info.color].main,
                        backgroundColor: selected
                            ? theme.palette[info.color].main
                            : alpha(theme.palette[info.color].main, theme.tint.soft),
                        transition: theme.calendar.transition,
                    })}
                >
                    <Icon />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="subtitle1" noWrap>
                            {role.RoleName}
                        </Typography>
                        {full && (
                            <Box
                                component="span"
                                sx={(theme) => ({
                                    ...theme.typography.micro,
                                    fontWeight: theme.typography.subtitle2.fontWeight,
                                    px: 1,
                                    py: 0.25,
                                    flexShrink: 0,
                                    borderRadius: theme.statusChip.radius,
                                    color: theme.palette[info.color].dark,
                                    backgroundColor: alpha(theme.palette[info.color].main, theme.tint.soft),
                                })}
                            >
                                Full access
                            </Box>
                        )}
                    </Stack>
                    <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {info.hint}
                    </Typography>
                </Box>
            </Stack>

            {/* Access level */}
            <Box>
                <Box
                    sx={(theme) => ({
                        height: theme.stat.progressHeight,
                        borderRadius: theme.stat.progressHeight,
                        backgroundColor: theme.palette.surface.muted,
                        overflow: "hidden",
                    })}
                >
                    <Box
                        sx={(theme) => ({
                            width: `${percent}%`,
                            height: "100%",
                            borderRadius: "inherit",
                            backgroundColor: theme.palette[info.color].main,
                            transition: theme.calendar.transition,
                        })}
                    />
                </Box>

                <Stack direction="row" sx={{ mt: 1, alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        <Box component="span" sx={(theme) => ({ color: theme.palette.text.primary, fontWeight: theme.typography.subtitle2.fontWeight })}>
                            {role.AllowedPermissions}
                        </Box>{" "}
                        of {total} permissions
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={(theme) => ({ alignItems: "center", color: theme.palette.text.secondary })}>
                        <PeopleAltRounded sx={(theme) => ({ fontSize: theme.typography.subtitle1.fontSize })} />
                        <Typography variant="caption">
                            {role.ActiveUsers} user{role.ActiveUsers === 1 ? "" : "s"}
                        </Typography>
                    </Stack>
                </Stack>
            </Box>
        </ButtonBase>
    );
}

function RolesPermissions() {
    const [tab, setTab] = useState("permissions");
    const [roles, setRoles] = useState([]);
    const [total, setTotal] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [error, setError] = useState("");

    const loadRoles = useCallback(async () => {
        setError("");

        try {
            const list = (await getRoles()).roles || [];
            setRoles(list);
            setSelectedId((current) => current || list[0]?.RoleId || null);
        } catch (err) {
            setRoles([]);
            setError(errorMessage(err, "Failed to load roles"));
        }
    }, []);

    useEffect(() => {
        loadRoles();
    }, [loadRoles]);

    const selected = roles.find((role) => role.RoleId === selectedId);

    return (
        <Box>
            <PageHeader
                eyebrow="Administration"
                title="Roles & permissions"
                subtitle="Choose a role, then switch each action on or off. Assign roles to people on the Users tab."
                actions={<SegmentedControl value={tab} options={TABS} onChange={setTab} />}
            />

            {error ? (
                <LoadError title="Couldn't load roles" message={error} onRetry={loadRoles} />
            ) : tab === "users" ? (
                <RoleUsersPanel roles={roles} onChanged={loadRoles} />
            ) : (
                <>
                    <Box
                        role="radiogroup"
                        aria-label="Roles"
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "minmax(0, 1fr)", md: `repeat(${Math.max(roles.length, 1)}, minmax(0, 1fr))` },
                            gap: theme.stat.gap,
                            mb: theme.pageHeader.marginBottom,
                        })}
                    >
                        {roles.map((role) => (
                            <RoleCard
                                key={role.RoleId}
                                role={role}
                                total={total}
                                selected={role.RoleId === selectedId}
                                onSelect={() => setSelectedId(role.RoleId)}
                            />
                        ))}
                    </Box>

                    {selected && (
                        <RolePermissionsPanel
                            key={selected.RoleId}
                            role={selected}
                            onTotal={setTotal}
                            onSaved={loadRoles}
                        />
                    )}
                </>
            )}
        </Box>
    );
}

export default RolesPermissions;
