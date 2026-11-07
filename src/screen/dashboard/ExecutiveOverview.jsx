import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import { Box, Button, ButtonBase, Divider, Skeleton, Stack, Typography } from "@mui/material";
import {
    AssignmentLateRounded,
    BeachAccessRounded,
    ChevronRightRounded,
    EmojiEventsRounded,
    EventNoteRounded,
    Inventory2Rounded,
    LocalShippingRounded,
    LocationOnRounded,
    PaymentsRounded,
    PersonOffRounded,
    ReceiptLongRounded,
    StorefrontRounded,
    BoltRounded,
} from "@mui/icons-material";

import api from "../../configurations/api-config";
import Panel from "../../components/Panel/Panel";
import Tag from "../../components/Tag/Tag";

// Company (head office) or team (manager) overview: the month's headline numbers on a dark band,
// what needs attention, a leaderboard of the people below, and the latest field activity.

const rupees = (value) => {
    const n = Number(value) || 0;
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${Math.round(n)}`;
};

const monthLabel = (key) => new Date(`${key}T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

const ago = (at) => {
    const minutes = Math.round((Date.now() - new Date(at).getTime()) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.round(hours / 24);
    return days === 1 ? "yesterday" : `${days} days ago`;
};

const initials = (name) =>
    String(name || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

const ACTIVITY = {
    VISIT: { icon: LocationOnRounded, color: "primary" },
    ORDER: { icon: ReceiptLongRounded, color: "info" },
    DELIVERY: { icon: LocalShippingRounded, color: "warning" },
    PAYMENT: { icon: PaymentsRounded, color: "success" },
    DCR: { icon: EventNoteRounded, color: "secondary" },
    LEAVE: { icon: BeachAccessRounded, color: "error" },
};

const TAG = {
    VALID: { label: "Valid", color: "success" },
    REVIEW: { label: "Needs a look", color: "warning" },
    INVALID: { label: "Not counted", color: "error" },
    BOOKED: { label: "Booked", color: "info" },
    SUBMITTED: { label: "Sent", color: "info" },
    APPROVED: { label: "Approved", color: "success" },
    PENDING: { label: "Pending", color: "warning" },
    UPI: { label: "UPI", color: "success" },
    CASH: { label: "Cash", color: "success" },
};

// ---------------------------------------------------------
// Dark band: headline numbers + attention chips
// ---------------------------------------------------------

function HeadlineTile({ icon: Icon, label, value, caption }) {
    return (
        <Box
            sx={(theme) => ({
                p: 2,
                borderRadius: theme.dashboard.executive.radius / 1.5,
                backgroundColor: theme.dashboard.executive.tileBackground,
                border: `1px solid ${theme.dashboard.executive.tileBorder}`,
                minWidth: 0,
            })}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                <Icon sx={(theme) => ({ fontSize: theme.typography.body1.fontSize, color: theme.dashboard.executive.accent })} />
                <Typography variant="caption" noWrap sx={(theme) => ({ color: theme.dashboard.executive.mutedText, letterSpacing: theme.typography.overline.letterSpacing })}>
                    {label}
                </Typography>
            </Stack>
            <Typography variant="h4" component="p" sx={(theme) => ({ color: theme.dashboard.executive.text, fontWeight: theme.typography.h3.fontWeight })}>
                {value}
            </Typography>
            <Typography variant="caption" sx={(theme) => ({ display: "block", mt: 0.5, color: theme.dashboard.executive.faintText })} noWrap>
                {caption}
            </Typography>
        </Box>
    );
}

function AttentionChip({ icon: Icon, count, label, to, alert }) {
    return (
        <ButtonBase
            component={RouterLink}
            to={to}
            sx={(theme) => ({
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: theme.dashboard.executive.chipRadius,
                color: theme.dashboard.executive.text,
                backgroundColor: alert ? theme.dashboard.executive.chipAlert : theme.dashboard.executive.chipBackground,
                border: `1px solid ${theme.dashboard.executive.tileBorder}`,
                ...theme.typography.caption,
                fontWeight: theme.typography.subtitle2.fontWeight,
                transition: theme.calendar.transition,
                "&:hover": { backgroundColor: theme.dashboard.executive.tileHover },
            })}
        >
            <Icon sx={(theme) => ({ fontSize: theme.typography.body2.fontSize, color: alert ? theme.dashboard.executive.gold : theme.dashboard.executive.accent })} />
            <b>{count}</b> {label}
        </ButtonBase>
    );
}

function Band({ data }) {
    const h = data.headline;
    const a = data.attention;
    const chips = [
        a.paymentsToConfirm > 0 && { icon: PaymentsRounded, count: a.paymentsToConfirm, label: `payment${a.paymentsToConfirm === 1 ? "" : "s"} to confirm`, to: "/sales/field-ledger", alert: true },
        a.missedDcrs > 0 && { icon: AssignmentLateRounded, count: a.missedDcrs, label: `missed DCR${a.missedDcrs === 1 ? "" : "s"} this week`, to: "/reports/dcr", alert: true },
        a.lowStock > 0 && { icon: Inventory2Rounded, count: a.lowStock, label: "sample / gift items running low", to: "/doctor-engagement/samples", alert: true },
        a.inactiveToday > 0 && { icon: PersonOffRounded, count: a.inactiveToday, label: "not in the field yet today", to: "/field-operation/visits" },
    ].filter(Boolean);

    return (
        <Box
            sx={(theme) => ({
                position: "relative",
                overflow: "hidden",
                p: theme.dashboard.executive.padding,
                mb: theme.stat.gap,
                borderRadius: theme.dashboard.executive.radius,
                background: theme.dashboard.executive.background,
                boxShadow: theme.dashboard.executive.shadow,
            })}
        >
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" }, mb: 2.5 }}>
                <Box>
                    <Typography variant="overline" sx={(theme) => ({ color: theme.dashboard.executive.accent })}>
                        {data.headOffice ? "Company overview" : "Team overview"} · {monthLabel(data.month)}
                    </Typography>
                    <Typography variant="h5" component="h2" sx={(theme) => ({ color: theme.dashboard.executive.text, fontWeight: theme.typography.h3.fontWeight })}>
                        {h.repsActiveToday} of {data.people} people in the field today
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Box
                        sx={(theme) => ({
                            width: theme.dashboard.executive.liveDot,
                            height: theme.dashboard.executive.liveDot,
                            borderRadius: "50%",
                            backgroundColor: theme.dashboard.executive.accent,
                            boxShadow: `0 0 0 4px ${alpha(theme.dashboard.executive.accent, 0.2)}`,
                        })}
                    />
                    <Typography variant="body2" sx={(theme) => ({ color: theme.dashboard.executive.mutedText })}>
                        {h.visitsToday} visit{h.visitsToday === 1 ? "" : "s"} so far today
                    </Typography>
                </Stack>
            </Stack>

            <Box
                sx={(theme) => ({
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))", lg: "repeat(5, minmax(0, 1fr))" },
                    gap: theme.stat.gap,
                })}
            >
                <HeadlineTile icon={LocationOnRounded} label="Visits this month" value={h.visitsMonth} caption={h.validPct == null ? "No visits yet" : `${h.validPct}% verified at the clinic`} />
                <HeadlineTile icon={ReceiptLongRounded} label="POB booked" value={rupees(h.pobValue)} caption={`${h.pobCount} order${h.pobCount === 1 ? "" : "s"}`} />
                <HeadlineTile icon={StorefrontRounded} label="Secondary sales" value={rupees(h.secondaryValue)} caption="Stockist statements" />
                <HeadlineTile icon={LocalShippingRounded} label="Delivered to chemists" value={rupees(h.deliveredValue)} caption="With stamped receipts" />
                <HeadlineTile
                    icon={PaymentsRounded}
                    label="Collected"
                    value={rupees(h.collected)}
                    caption={h.cashWithMrs ? `${rupees(h.cashWithMrs)} still with MRs` : "All confirmed"}
                />
            </Box>

            {chips.length > 0 && (
                <>
                    <Divider sx={(theme) => ({ my: 2.5, borderColor: theme.dashboard.executive.divider })} />
                    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, alignItems: "center" }}>
                        <Typography variant="caption" sx={(theme) => ({ color: theme.dashboard.executive.mutedText, mr: 0.5 })}>
                            Needs attention
                        </Typography>
                        {chips.map((chip) => (
                            <AttentionChip key={chip.label} {...chip} />
                        ))}
                    </Stack>
                </>
            )}
        </Box>
    );
}

// ---------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------

function Leaderboard({ people, sx }) {
    return (
        <Panel
            title="Leaderboard"
            subtitle="This month · most field work first"
            actions={
                <Button size="small" endIcon={<ChevronRightRounded />} component={RouterLink} to="/reports/kpi">
                    KPI report
                </Button>
            }
            sx={sx}
        >
            {people.length === 0 ? (
                <Typography variant="body2" sx={{ color: "text.secondary", py: 3, textAlign: "center" }}>
                    No team members yet.
                </Typography>
            ) : (
                <Stack divider={<Divider />}>
                    {people.map((person, index) => (
                        <Stack key={person.UserId} direction="row" spacing={1.5} sx={(theme) => ({ alignItems: "center", py: theme.leaderboard.rowPaddingY })}>
                            <Box
                                sx={(theme) => ({
                                    width: theme.leaderboard.rankSize,
                                    height: theme.leaderboard.rankSize,
                                    flexShrink: 0,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: "50%",
                                    ...theme.typography.caption,
                                    fontWeight: theme.typography.subtitle2.fontWeight,
                                    color: index === 0 ? theme.palette.gold.contrastText : theme.palette.text.secondary,
                                    backgroundColor: index === 0 ? theme.palette.gold.main : theme.palette.surface.muted,
                                })}
                            >
                                {index === 0 ? <EmojiEventsRounded sx={(theme) => ({ fontSize: theme.typography.body2.fontSize })} /> : index + 1}
                            </Box>
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
                                {initials(person.Name)}
                            </Box>
                            <Box sx={(theme) => ({ flex: 1, minWidth: theme.leaderboard.nameMinWidth })}>
                                <Typography variant="subtitle2" noWrap>
                                    {person.Name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
                                    {[person.DesignationName, `${person.doctors} doctor${person.doctors === 1 ? "" : "s"}`, `${person.dcrSent} DCR`].filter(Boolean).join(" · ")}
                                </Typography>
                                <Box sx={(theme) => ({ mt: 0.75, height: theme.leaderboard.barHeight, borderRadius: theme.leaderboard.barHeight, backgroundColor: theme.palette.surface.muted, overflow: "hidden" })}>
                                    <Box
                                        sx={(theme) => ({
                                            width: `${person.validPct ?? 0}%`,
                                            height: "100%",
                                            borderRadius: "inherit",
                                            backgroundImage: theme.palette.brand.gradient,
                                        })}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                                <Typography variant="subtitle2">{person.visits} visits</Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                    {person.validPct == null ? "—" : `${person.validPct}% valid`}
                                </Typography>
                            </Box>
                            <Box sx={(theme) => ({ textAlign: "right", flexShrink: 0, display: { xs: "none", sm: "block" }, minWidth: theme.leaderboard.valueMinWidth })}>
                                <Typography variant="subtitle2">{rupees(person.pobValue)}</Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    POB
                                </Typography>
                            </Box>
                        </Stack>
                    ))}
                </Stack>
            )}
        </Panel>
    );
}

// ---------------------------------------------------------
// Live activity
// ---------------------------------------------------------

function ActivityFeed({ items, sx }) {
    return (
        <Panel
            title="Live activity"
            subtitle="Latest field work across the team"
            actions={<BoltRounded sx={(theme) => ({ color: theme.palette.primary.main })} />}
            sx={sx}
        >
            {items.length === 0 ? (
                <Typography variant="body2" sx={{ color: "text.secondary", py: 3, textAlign: "center" }}>
                    Nothing in the last 7 days.
                </Typography>
            ) : (
                <Stack sx={(theme) => ({ maxHeight: theme.activity.maxHeight, overflowY: "auto" })} divider={<Divider />}>
                    {items.map((item, index) => {
                        const kind = ACTIVITY[item.kind] || ACTIVITY.VISIT;
                        const Icon = kind.icon;
                        const tag = TAG[item.tag];
                        return (
                            <Stack key={`${item.kind}-${item.at}-${index}`} direction="row" spacing={1.5} sx={(theme) => ({ alignItems: "center", py: theme.activity.rowPaddingY })}>
                                <Box
                                    sx={(theme) => ({
                                        width: theme.activity.iconSize,
                                        height: theme.activity.iconSize,
                                        flexShrink: 0,
                                        display: "grid",
                                        placeItems: "center",
                                        borderRadius: theme.card.radius,
                                        color: theme.palette[kind.color].main,
                                        backgroundColor: alpha(theme.palette[kind.color].main, theme.tint.soft),
                                    })}
                                >
                                    <Icon sx={(theme) => ({ fontSize: theme.typography.body1.fontSize })} />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" noWrap sx={(theme) => ({ fontWeight: theme.typography.subtitle2.fontWeight })}>
                                        {item.text}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
                                        {item.who} · {ago(item.at)}
                                    </Typography>
                                </Box>
                                {tag && <Tag label={tag.label} color={tag.color} />}
                            </Stack>
                        );
                    })}
                </Stack>
            )}
        </Panel>
    );
}

// ---------------------------------------------------------

export default function ExecutiveOverview({ refreshKey }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        let alive = true;
        api.get("/app/dashboard/overview")
            .then((response) => alive && setData(response.data))
            .catch(() => alive && setData({ available: false }));
        return () => {
            alive = false;
        };
    }, [refreshKey]);

    if (!data) return <Skeleton variant="rounded" sx={(theme) => ({ height: theme.dashboard.skeleton.hero, mb: theme.stat.gap })} />;
    if (!data.available) return null;

    return (
        <>
            <Band data={data} />
            <Box
                sx={(theme) => ({
                    display: "grid",
                    gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(12, minmax(0, 1fr))" },
                    gap: theme.stat.gap,
                    mb: theme.stat.gap,
                })}
            >
                <Box sx={{ gridColumn: { lg: "span 7" }, minWidth: 0 }}>
                    <Leaderboard people={data.leaderboard} sx={{ height: "100%" }} />
                </Box>
                <Box sx={{ gridColumn: { lg: "span 5" }, minWidth: 0 }}>
                    <ActivityFeed items={data.activity} sx={{ height: "100%" }} />
                </Box>
            </Box>
        </>
    );
}
