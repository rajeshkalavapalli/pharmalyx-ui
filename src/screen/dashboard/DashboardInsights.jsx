import { Link as RouterLink } from "react-router-dom";

import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    CardGiftcardRounded,
    ChevronRightRounded,
    CurrencyRupeeRounded,
    FactCheckRounded,
    MedicationRounded,
    SentimentSatisfiedAltRounded,
} from "@mui/icons-material";

import Panel from "../../components/Panel/Panel";
import CategoryBadge from "../../Pages/MyDoctors/components/CategoryBadge";
import BarChart from "./BarChart";

const monthShort = (key) => new Date(`${key}-01T00:00:00`).toLocaleDateString("en-GB", { month: "short" });
const monthLong = (key) => new Date(`${key}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

// =========================================================
// ENGAGEMENT TILES
// =========================================================

function MetricTile({ icon: Icon, label, value, caption, color, to }) {
    return (
        <ButtonBase
            component={RouterLink}
            to={to}
            sx={(theme) => ({
                p: 2,
                gap: 1.5,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                textAlign: "left",
                minWidth: 0,
                borderRadius: theme.panel.radius,
                border: "1px solid",
                borderColor: theme.palette.border.default,
                backgroundColor: theme.palette.background.paper,
                transition: theme.calendar.transition,

                "&:hover": {
                    borderColor: alpha(theme.palette[color].main, theme.tint.strong),
                    boxShadow: theme.card.shadow,
                    transform: theme.entityCard.hoverLift,
                },
                "&:hover .tile-arrow": { opacity: 1, transform: "translateX(2px)" },
            })}
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
                <Typography variant="h5" component="p" noWrap sx={{ mt: 0.25 }}>
                    {value}
                </Typography>
                <Typography variant="micro" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {caption}
                </Typography>
            </Box>

            <ChevronRightRounded
                className="tile-arrow"
                fontSize="small"
                sx={(theme) => ({ opacity: 0.4, color: theme.palette.text.secondary, transition: theme.calendar.transition })}
            />
        </ButtonBase>
    );
}

const notSetUp = "Not set up";

export function EngagementRow({ engagement }) {
    const e = engagement;
    const fb = e.feedback;

    return (
        <Panel title="Doctor engagement" subtitle="This month across samples, gifts, RCPA, business and feedback">
            <Box
                sx={(theme) => ({
                    display: "grid",
                    gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(5, minmax(0, 1fr))" },
                    gap: theme.stat.gap,
                })}
            >
                <MetricTile
                    icon={MedicationRounded}
                    label="Samples given"
                    value={e.samplesGiven ?? "—"}
                    caption={
                        e.samplesGiven == null
                            ? notSetUp
                            : e.lowStockItems
                              ? `${e.lowStockItems} item(s) running low`
                              : `${e.doctorsReached} doctor(s) reached`
                    }
                    color={e.lowStockItems ? "warning" : "primary"}
                    to="/doctor-engagement/samples"
                />
                <MetricTile
                    icon={CardGiftcardRounded}
                    label="Gifts given"
                    value={e.giftsGiven ?? "—"}
                    caption={e.giftsGiven == null ? notSetUp : `${e.itemsHeld} item type(s) in hand`}
                    color="secondary"
                    to="/doctor-engagement/gifts"
                />
                <MetricTile
                    icon={FactCheckRounded}
                    label="RCPA brand share"
                    value={e.rcpaShare == null ? "—" : `${e.rcpaShare}%`}
                    caption={e.rcpaAudits == null ? notSetUp : `${e.rcpaAudits} audit(s)`}
                    color="info"
                    to="/doctor-engagement/rcpa"
                />
                <MetricTile
                    icon={CurrencyRupeeRounded}
                    label="Business achieved"
                    value={e.businessAchievement == null ? "—" : `${e.businessAchievement}%`}
                    caption={
                        e.businessExpected == null
                            ? notSetUp
                            : e.businessExpected
                              ? "Actual vs expected"
                              : "No targets set"
                    }
                    color={e.businessAchievement == null ? "info" : e.businessAchievement >= 100 ? "success" : e.businessAchievement >= 75 ? "warning" : "error"}
                    to="/doctor-engagement/doctor-business"
                />
                <MetricTile
                    icon={SentimentSatisfiedAltRounded}
                    label="Net sentiment"
                    value={fb.netScore == null ? "—" : `${fb.netScore > 0 ? "+" : ""}${fb.netScore}`}
                    caption={`${fb.positive} positive · ${fb.negative} negative`}
                    color={fb.netScore == null ? "info" : fb.netScore >= 0 ? "success" : "error"}
                    to="/doctor-engagement/feedback"
                />
            </Box>
        </Panel>
    );
}

// =========================================================
// CHARTS
// =========================================================

const CATEGORY_LABEL = { A: "Class A", B: "Class B", C: "Class C", U: "Unrated" };

// Bullet bars: visited out of assigned, per doctor category.
export function CoverageByCategory({ rows }) {
    return (
        <Panel title="Coverage by category" subtitle="Assigned doctors visited this month">
            {rows.length === 0 ? (
                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    No doctors assigned yet.
                </Typography>
            ) : (
                <Stack spacing={2.25}>
                    {rows.map((row) => {
                        const pct = row.mapped ? Math.round((row.visited / row.mapped) * 100) : 0;

                        return (
                            <Box key={row.category}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                                    {row.category === "U" ? null : <CategoryBadge category={row.category} />}
                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                        {CATEGORY_LABEL[row.category]}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        {row.visited}/{row.mapped}
                                    </Typography>
                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary, minWidth: theme.engagement.percentColumn, textAlign: "right" })}>
                                        {pct}%
                                    </Typography>
                                </Stack>
                                <Box
                                    role="img"
                                    aria-label={`${CATEGORY_LABEL[row.category]}: ${row.visited} of ${row.mapped} visited`}
                                    sx={(theme) => ({
                                        height: theme.stat.progressHeight,
                                        borderRadius: theme.stat.progressHeight,
                                        backgroundColor: theme.palette.surface.muted,
                                        overflow: "hidden",
                                    })}
                                >
                                    <Box
                                        sx={(theme) => ({
                                            width: `${pct}%`,
                                            height: "100%",
                                            borderRadius: "inherit",
                                            backgroundImage: theme.palette.brand.gradient,
                                            transition: theme.calendar.transition,
                                        })}
                                    />
                                </Box>
                            </Box>
                        );
                    })}
                </Stack>
            )}
        </Panel>
    );
}

export function WeekdayChart({ rows, weeks, sx }) {
    const best = rows.reduce((top, row) => (row.average > (top?.average ?? 0) ? row : top), null);

    return (
        <Panel title="Visits by weekday" subtitle={best ? `Average over ${weeks} weeks · busiest on ${best.label}` : `Average over ${weeks} weeks`} sx={sx}>
            <BarChart
                unit="visit"
                ariaLabel={`Average visits per weekday over the last ${weeks} weeks`}
                highlightKey={best?.label}
                items={rows.map((row) => ({
                    key: row.label,
                    axisLabel: row.label,
                    tooltipTitle: `${row.label} · ${row.visits} in ${weeks} weeks`,
                    value: row.average,
                    detail: `${row.average} visits on average`,
                }))}
            />
        </Panel>
    );
}

export function MonthlyChart({ rows, sx }) {
    const total = rows.reduce((sum, row) => sum + row.visits, 0);

    return (
        <Panel title="Monthly visits" subtitle={`Last ${rows.length} months · ${total} visits`} sx={sx}>
            <BarChart
                unit="visit"
                ariaLabel={`Visits per month over the last ${rows.length} months`}
                highlightKey={rows[rows.length - 1]?.month}
                items={rows.map((row) => ({
                    key: row.month,
                    axisLabel: monthShort(row.month),
                    tooltipTitle: monthLong(row.month),
                    value: row.visits,
                }))}
            />
        </Panel>
    );
}
