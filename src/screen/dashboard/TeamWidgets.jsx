import { Link as RouterLink } from "react-router-dom";

import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AssignmentTurnedInRounded,
    FlagRounded,
    GroupsRounded,
    MapRounded,
    ReceiptLongRounded,
    RouteRounded,
    ShoppingCartRounded,
} from "@mui/icons-material";

import Panel from "../../components/Panel/Panel";
import Tag from "../../components/Tag/Tag";

const MEMBER_STATUS = {
    IN_FIELD: { label: "In field", color: "info" },
    DCR_SENT: { label: "DCR sent", color: "success" },
    NOT_STARTED: { label: "Not started", color: "warning" },
    OFF: { label: "Off day", color: "secondary" },
};

const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

const shortDate = (key) => new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const initials = (name) =>
    String(name || "?")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

function Avatar({ name }) {
    return (
        <Box
            sx={(theme) => ({
                width: theme.avatar.sizeSmall,
                height: theme.avatar.sizeSmall,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                ...theme.typography.caption,
                fontWeight: theme.typography.subtitle2.fontWeight,
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft),
            })}
        >
            {initials(name)}
        </Box>
    );
}

function Bar({ value }) {
    return (
        <Box sx={(theme) => ({ height: theme.stat.progressHeight, borderRadius: theme.stat.progressHeight, backgroundColor: theme.palette.surface.muted, overflow: "hidden" })}>
            <Box sx={(theme) => ({ width: `${Math.min(100, value)}%`, height: "100%", borderRadius: "inherit", backgroundImage: theme.palette.brand.gradient })} />
        </Box>
    );
}

// =========================================================
// TEAM TODAY
// =========================================================

// Who is in the field today: territory, visits vs planned, status.
export function TeamTodayPanel({ members, sx }) {
    const active = members.filter((member) => member.visits > 0).length;

    return (
        <Panel title="Team today" subtitle={members.length ? `${active} of ${members.length} in the field` : "No team members"} sx={sx}>
            {members.length ? (
                <Stack spacing={1.5} sx={(theme) => ({ maxHeight: theme.dashboard.scheduleMaxHeight, overflowY: "auto", mr: -1, pr: 1 })}>
                    {members.map((member) => {
                        const status = MEMBER_STATUS[member.status];

                        return (
                            <Stack key={member.UserId} direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                                <Avatar name={member.Name} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2" noWrap>
                                        {member.Name}
                                    </Typography>
                                    <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {[
                                            member.territory,
                                            member.planned ? `${member.visits}/${member.planned} calls` : `${member.visits} visit(s)`,
                                            member.firstVisit ? `${member.firstVisit}${member.lastVisit && member.lastVisit !== member.firstVisit ? `–${member.lastVisit}` : ""}` : null,
                                        ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </Typography>
                                </Box>
                                <Tag label={status.label} color={status.color} />
                            </Stack>
                        );
                    })}
                </Stack>
            ) : (
                <Typography variant="body2" sx={(theme) => ({ py: 2, color: theme.palette.text.secondary })}>
                    No one reports to you yet.
                </Typography>
            )}
        </Panel>
    );
}

// =========================================================
// TEAM PERFORMANCE TABLE
// =========================================================

export function TeamPerformancePanel({ team, sx }) {
    return (
        <Panel title="Team performance" subtitle="This month, by visits" sx={sx}>
            <Box sx={{ overflowX: "auto" }}>
                <Box
                    component="table"
                    sx={(theme) => ({
                        width: "100%",
                        borderCollapse: "collapse",
                        "& th, & td": { textAlign: "left", py: 1, px: 0.75, borderBottom: "1px solid", borderColor: theme.palette.border.subtle, whiteSpace: "nowrap" },
                        "& th": { ...theme.typography.caption, color: theme.palette.text.secondary, fontWeight: theme.typography.subtitle2.fontWeight },
                        "& tr:last-of-type td": { borderBottom: 0 },
                    })}
                >
                    <thead>
                        <tr>
                            <th>Representative</th>
                            <th>Visits</th>
                            <th>Coverage</th>
                            <th>DCRs</th>
                            <th>Last visit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team.map((member) => {
                            const coverage = percent(member.doctorsVisited, member.doctorsMapped);

                            return (
                                <tr key={member.UserId}>
                                    <td>
                                        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                                            <Avatar name={member.Name} />
                                            <Box>
                                                <Typography variant="subtitle2">{member.Name}</Typography>
                                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                    {member.DesignationName || "—"}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </td>
                                    <td>
                                        <Typography variant="subtitle2">{member.visits}</Typography>
                                    </td>
                                    <td>
                                        <Box sx={(theme) => ({ minWidth: theme.engagement.quantityColumn })}>
                                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                {member.doctorsVisited}/{member.doctorsMapped} · {coverage}%
                                            </Typography>
                                            <Bar value={coverage} />
                                        </Box>
                                    </td>
                                    <td>
                                        <Typography variant="body2">{member.dcrSent}</Typography>
                                    </td>
                                    <td>
                                        {member.lastVisitDate ? (
                                            <Typography variant="body2">{shortDate(member.lastVisitDate)}</Typography>
                                        ) : (
                                            <Tag label="No visits yet" color="warning" />
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Box>
            </Box>
        </Panel>
    );
}

// =========================================================
// MANAGER ACTIONS
// =========================================================

// Review queues with their counts, plus team shortcuts.
export function ManagerActions({ approvals, sx }) {
    const actions = [
        { label: "Tour plans", to: "/field-operation/tour-plan", icon: MapRounded, color: "primary", count: approvals.tourPlans },
        { label: "DCR reviews", to: "/field-operation/dcr", icon: AssignmentTurnedInRounded, color: "info", count: approvals.dcrs },
        { label: "Deviations", to: "/field-operation/plan-deviation", icon: RouteRounded, color: "warning", count: approvals.deviations },
        { label: "Expense claims", to: "/expenses/claims", icon: ReceiptLongRounded, color: "success" },
        { label: "Team targets", to: "/planning/sales-plan", icon: FlagRounded, color: "secondary" },
        { label: "Team orders", to: "/sales/orders", icon: ShoppingCartRounded, color: "error" },
    ];

    return (
        <Panel title="Quick actions" subtitle="Reviews waiting and team tools" sx={sx}>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1.25 }}>
                {actions.map(({ label, to, icon: Icon, color, count }) => (
                    <ButtonBase
                        key={label}
                        component={RouterLink}
                        to={to}
                        sx={(theme) => ({
                            position: "relative",
                            minHeight: theme.dashboard.quickActionMinHeight,
                            p: 1.25,
                            gap: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            borderRadius: theme.calendar.cell.radius,
                            border: "1px solid",
                            borderColor: theme.palette.border.subtle,
                            transition: theme.calendar.transition,
                            "&:hover": {
                                borderColor: alpha(theme.palette[color].main, theme.tint.strong),
                                backgroundColor: alpha(theme.palette[color].main, theme.tint.hover),
                                transform: theme.entityCard.hoverLift,
                            },
                        })}
                    >
                        {count > 0 && (
                            <Box
                                sx={(theme) => ({
                                    position: "absolute",
                                    top: theme.spacing(0.75),
                                    right: theme.spacing(0.75),
                                    minWidth: theme.spacing(2.5),
                                    height: theme.spacing(2.5),
                                    px: 0.5,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: theme.statusChip.radius,
                                    ...theme.typography.micro,
                                    fontWeight: "fontWeightBold",
                                    color: theme.palette.error.contrastText,
                                    backgroundColor: theme.palette.error.main,
                                })}
                            >
                                {count}
                            </Box>
                        )}
                        <Box
                            sx={(theme) => ({
                                width: theme.avatar.sizeSmall,
                                height: theme.avatar.sizeSmall,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: theme.sidebarLayout.radius,
                                color: theme.palette[color].main,
                                backgroundColor: alpha(theme.palette[color].main, theme.tint.soft),
                            })}
                        >
                            <Icon fontSize="small" />
                        </Box>
                        <Typography variant="caption" sx={(theme) => ({ fontWeight: theme.typography.subtitle2.fontWeight, color: theme.palette.text.primary })}>
                            {label}
                        </Typography>
                    </ButtonBase>
                ))}
            </Box>
        </Panel>
    );
}

// =========================================================
// TEAM HIGHLIGHTS
// =========================================================

// One row of month figures that don't need a chart of their own.
export function TeamHighlights({ items }) {
    return (
        <Panel title="Team this month" subtitle="Coverage, business and field discipline">
            <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: `repeat(${items.length}, minmax(0, 1fr))` }, gap: theme.stat.gap })}>
                {items.map(({ label, value, caption, progress, icon: Icon = GroupsRounded, color = "primary" }) => (
                    <Stack
                        key={label}
                        direction="row"
                        spacing={1.25}
                        sx={(theme) => ({ p: 1.5, borderRadius: theme.calendar.cell.radius, border: "1px solid", borderColor: theme.palette.border.subtle, alignItems: "flex-start" })}
                    >
                        <Box
                            sx={(theme) => ({
                                width: theme.avatar.sizeSmall,
                                height: theme.avatar.sizeSmall,
                                flexShrink: 0,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: theme.sidebarLayout.radius,
                                color: theme.palette[color].main,
                                backgroundColor: alpha(theme.palette[color].main, theme.tint.soft),
                            })}
                        >
                            <Icon fontSize="small" />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                {label}
                            </Typography>
                            <Typography variant="subtitle1">{value}</Typography>
                            {progress != null && <Bar value={progress} />}
                            {caption && (
                                <Typography variant="caption" component="p" noWrap sx={(theme) => ({ mt: progress != null ? 0.5 : 0, color: theme.palette.text.secondary })}>
                                    {caption}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                ))}
            </Box>
        </Panel>
    );
}
