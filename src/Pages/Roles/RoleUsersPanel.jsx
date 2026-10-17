import { useEffect, useMemo, useState } from "react";

import {
    Avatar,
    Box,
    CircularProgress,
    InputAdornment,
    ListItemIcon,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
    AdminPanelSettingsRounded,
    BadgeRounded,
    HelpOutlineRounded,
    LockRounded,
    PeopleAltRounded,
    SearchRounded,
    SupervisorAccountRounded,
} from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import LoadError from "../../components/LoadError/LoadError";
import Panel from "../../components/Panel/Panel";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { assignUserRole, errorMessage, getRoleUsers } from "./index";

// Icon and palette key per role, so every role reads the same across the screen.
const ROLE_STYLE = {
    ADMIN: { icon: AdminPanelSettingsRounded, color: "primary" },
    MANAGER: { icon: SupervisorAccountRounded, color: "info" },
    FIELD_USER: { icon: BadgeRounded, color: "success" },
};
const NO_ROLE = { icon: HelpOutlineRounded, color: "secondary" };

const initials = (name) =>
    String(name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "?";

const roleStyle = (roles, roleId) => {
    const role = roles.find((item) => item.RoleId === roleId);
    return role ? ROLE_STYLE[role.RoleCode] || NO_ROLE : NO_ROLE;
};

// Shared row layout: user, designation, status, role.
const rowGrid = (theme) => ({
    display: "grid",
    gridTemplateColumns: {
        xs: "minmax(0, 1fr)",
        md: `minmax(0, 1.6fr) minmax(0, 0.8fr) minmax(0, 0.6fr) ${theme.spacing(32)}`,
    },
    alignItems: "center",
    gap: { xs: 1.25, md: 2 },
    px: theme.panel.padding,
});

function RoleUsersPanel({ roles, onChanged }) {
    const theme = useTheme();
    const { showSnackbar } = useSnackbar();
    const me = (localStorage.getItem("userId") || "").toLowerCase();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [savingId, setSavingId] = useState(null);

    const load = async () => {
        setLoading(true);
        setError("");

        try {
            setUsers((await getRoleUsers()).users || []);
        } catch (err) {
            setUsers([]);
            setError(errorMessage(err, "Failed to load users"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const counts = useMemo(() => {
        const result = { ALL: users.length, NONE: users.filter((user) => !user.RoleId).length };
        roles.forEach((role) => {
            result[role.RoleId] = users.filter((user) => user.RoleId === role.RoleId).length;
        });
        return result;
    }, [users, roles]);

    const filterOptions = [
        { value: "ALL", label: `All · ${counts.ALL}`, icon: PeopleAltRounded },
        ...roles.map((role) => ({
            value: role.RoleId,
            label: `${role.RoleName} · ${counts[role.RoleId] || 0}`,
            icon: (ROLE_STYLE[role.RoleCode] || NO_ROLE).icon,
        })),
        ...(counts.NONE ? [{ value: "NONE", label: `No role · ${counts.NONE}`, icon: NO_ROLE.icon }] : []),
    ];

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return users.filter((user) => {
            if (filter === "NONE" ? user.RoleId : filter !== "ALL" && user.RoleId !== filter) return false;
            if (!term) return true;

            return [user.Name, user.UserName, user.EmailId, user.DesignationName, user.RoleName]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(term));
        });
    }, [users, search, filter]);

    const handleChange = async (user, roleId) => {
        if (roleId === user.RoleId) return;

        setSavingId(user.UserId);

        try {
            const response = await assignUserRole(user.UserId, roleId);
            showSnackbar(response?.message || "Role changed", "success");
            await load();
            onChanged?.();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to change role"), "error");
        } finally {
            setSavingId(null);
        }
    };

    return (
        <Panel disablePadding>
            {/* Toolbar: role filter + search */}
            <Stack
                direction={{ xs: "column", lg: "row" }}
                sx={(theme) => ({
                    gap: 1.5,
                    p: theme.panel.padding,
                    alignItems: { xs: "stretch", lg: "center" },
                    justifyContent: "space-between",
                })}
            >
                <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                    <SegmentedControl value={filter} options={filterOptions} onChange={setFilter} />
                </Box>

                <TextField
                    size="small"
                    placeholder="Search name, email, designation…"
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
            </Stack>

            {error ? (
                <Box sx={(theme) => ({ px: theme.panel.padding, pb: theme.panel.padding })}>
                    <LoadError title="Couldn't load users" message={error} onRetry={load} />
                </Box>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={PeopleAltRounded}
                    title={loading ? "Loading…" : "No users match"}
                    message={loading ? "" : "Try another role filter or search."}
                />
            ) : (
                <Box role="table" aria-label="Users and roles" sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}>
                    {/* Column headers (desktop) */}
                    <Box
                        role="row"
                        sx={(theme) => ({
                            ...rowGrid(theme),
                            display: { xs: "none", md: "grid" },
                            py: 1.25,
                            backgroundColor: theme.palette.surface.muted,
                            borderTop: "1px solid",
                            borderBottom: "1px solid",
                            borderColor: theme.palette.border.default,
                        })}
                    >
                        {["User", "Designation", "Status", "Role"].map((label) => (
                            <Typography key={label} role="columnheader" variant="overline" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                {label}
                            </Typography>
                        ))}
                    </Box>

                    {filtered.map((user) => {
                        const isMe = user.UserId?.toLowerCase() === me;
                        const style = roleStyle(roles, user.RoleId);
                        const RoleIcon = style.icon;
                        const saving = savingId === user.UserId;

                        return (
                            <Box
                                key={user.UserId}
                                role="row"
                                sx={(theme) => ({
                                    ...rowGrid(theme),
                                    py: 1.5,
                                    borderBottom: "1px solid",
                                    borderColor: theme.palette.border.subtle,
                                    opacity: user.IsActive ? 1 : theme.table.loadingOpacity,
                                    transition: theme.calendar.transition,
                                    "&:hover": { backgroundColor: theme.palette.surface.subtle },
                                    "&:last-of-type": { borderBottom: 0 },
                                })}
                            >
                                {/* User */}
                                <Stack role="cell" direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                                    <Avatar
                                        sx={(theme) => ({
                                            width: theme.avatar.size,
                                            height: theme.avatar.size,
                                            ...theme.typography.subtitle2,
                                            color: theme.palette[style.color].dark,
                                            backgroundColor: alpha(theme.palette[style.color].main, theme.tint.soft),
                                            border: "1px solid",
                                            borderColor: alpha(theme.palette[style.color].main, theme.tint.border),
                                        })}
                                    >
                                        {initials(user.Name)}
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                            <Typography variant="subtitle2" noWrap>
                                                {user.Name}
                                            </Typography>
                                            {isMe && (
                                                <Box
                                                    component="span"
                                                    sx={(theme) => ({
                                                        ...theme.typography.micro,
                                                        fontWeight: theme.typography.subtitle2.fontWeight,
                                                        px: 0.75,
                                                        py: 0.125,
                                                        borderRadius: theme.statusChip.radius,
                                                        color: theme.palette.primary.contrastText,
                                                        backgroundImage: theme.palette.brand.gradient,
                                                    })}
                                                >
                                                    You
                                                </Box>
                                            )}
                                        </Stack>
                                        <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {user.EmailId || user.UserName}
                                        </Typography>
                                    </Box>
                                </Stack>

                                {/* Designation */}
                                <Box role="cell">
                                    <Box
                                        component="span"
                                        sx={(theme) => ({
                                            ...theme.typography.caption,
                                            fontWeight: theme.typography.subtitle2.fontWeight,
                                            display: "inline-flex",
                                            px: 1.25,
                                            py: 0.375,
                                            borderRadius: theme.statusChip.radius,
                                            color: theme.palette.text.secondary,
                                            backgroundColor: theme.palette.surface.muted,
                                            border: "1px solid",
                                            borderColor: theme.palette.border.default,
                                        })}
                                    >
                                        {user.DesignationName || "No designation"}
                                    </Box>
                                </Box>

                                {/* Status */}
                                <Stack role="cell" direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                                    <Box
                                        sx={(theme) => ({
                                            width: theme.statusChip.dotSize,
                                            height: theme.statusChip.dotSize,
                                            borderRadius: "50%",
                                            backgroundColor: user.IsActive ? theme.palette.success.main : theme.palette.error.main,
                                            boxShadow: `0 0 0 3px ${alpha(
                                                user.IsActive ? theme.palette.success.main : theme.palette.error.main,
                                                theme.tint.border
                                            )}`,
                                        })}
                                    />
                                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {user.IsActive ? "Active" : "Inactive"}
                                    </Typography>
                                </Stack>

                                {/* Role picker */}
                                <Box role="cell">
                                    <Tooltip title={isMe ? "You can't change your own role — ask another administrator" : ""}>
                                        <span>
                                            <Select
                                                fullWidth
                                                size="small"
                                                value={user.RoleId || ""}
                                                displayEmpty
                                                disabled={isMe || saving}
                                                onChange={(event) => handleChange(user, event.target.value)}
                                                IconComponent={isMe ? LockRounded : undefined}
                                                renderValue={(value) => {
                                                    const role = roles.find((item) => item.RoleId === value);

                                                    return (
                                                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                            {saving ? (
                                                                <CircularProgress size={theme.login.spinnerSize} />
                                                            ) : (
                                                                <RoleIcon fontSize="small" sx={(theme) => ({ color: theme.palette[style.color].main })} />
                                                            )}
                                                            <Typography variant="subtitle2" component="span">
                                                                {role?.RoleName || "Assign a role"}
                                                            </Typography>
                                                        </Stack>
                                                    );
                                                }}
                                                sx={(theme) => ({
                                                    minHeight: theme.field.compactHeight,
                                                    borderRadius: theme.statusChip.radius,
                                                    backgroundColor: alpha(theme.palette[style.color].main, theme.tint.hover),
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: alpha(theme.palette[style.color].main, theme.tint.border),
                                                    },
                                                    "& .MuiSelect-select": { py: 0.75 },
                                                    "& .MuiSelect-icon": { color: theme.palette.text.secondary },
                                                })}
                                            >
                                                {roles.map((role) => {
                                                    const option = ROLE_STYLE[role.RoleCode] || NO_ROLE;
                                                    const OptionIcon = option.icon;

                                                    return (
                                                        <MenuItem key={role.RoleId} value={role.RoleId}>
                                                            <ListItemIcon>
                                                                <OptionIcon fontSize="small" sx={(theme) => ({ color: theme.palette[option.color].main })} />
                                                            </ListItemIcon>
                                                            {role.RoleName}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </span>
                                    </Tooltip>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </Panel>
    );
}

export default RoleUsersPanel;
