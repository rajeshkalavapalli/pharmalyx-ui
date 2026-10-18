import { Link as RouterLink } from "react-router-dom";

import { Box, Button } from "@mui/material";
import {
    AccountBalanceWalletRounded,
    AssignmentTurnedInRounded,
    BadgeRounded,
    BeachAccessRounded,
    CalendarMonthRounded,
    CheckCircleRounded,
    ChevronRightRounded,
    CurrencyRupeeRounded,
    DirectionsCarRounded,
    EventAvailableRounded,
    FactCheckRounded,
    GroupsRounded,
    InsightsRounded,
    LocalShippingRounded,
    LocationOnRounded,
    MedicalServicesRounded,
    MedicationRounded,
    NotificationsActiveRounded,
    PriorityHighRounded,
    RestaurantRounded,
    RouteRounded,
    SentimentSatisfiedAltRounded,
    StorefrontRounded,
    TrendingUpRounded,
    VisibilityRounded,
} from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import Panel from "../../components/Panel/Panel";
import BarChart from "./BarChart";
import { useModuleData } from "./moduleData";
import { DonutChart, KpiCard, LineChart, RankList } from "./ModuleCharts";

const ICONS = {
    visits: LocationOnRounded,
    valid: CheckCircleRounded,
    dcr: AssignmentTurnedInRounded,
    route: RouteRounded,
    doctors: MedicalServicesRounded,
    samples: MedicationRounded,
    rcpa: FactCheckRounded,
    feedback: SentimentSatisfiedAltRounded,
    money: CurrencyRupeeRounded,
    supplied: LocalShippingRounded,
    net: TrendingUpRounded,
    secondary: StorefrontRounded,
    plan: CalendarMonthRounded,
    da: RestaurantRounded,
    ta: DirectionsCarRounded,
    review: AccountBalanceWalletRounded,
    present: EventAvailableRounded,
    calendar: CalendarMonthRounded,
    leave: BeachAccessRounded,
    alert: NotificationsActiveRounded,
    high: PriorityHighRounded,
    ack: VisibilityRounded,
    people: GroupsRounded,
    badge: BadgeRounded,
};

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const compact = (n) => {
    const v = Number(n) || 0;
    if (Math.abs(v) >= 10000000) return `₹${(v / 10000000).toFixed(1)} Cr`;
    if (Math.abs(v) >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
    if (Math.abs(v) >= 1000) return `₹${(v / 1000).toFixed(1)} K`;
    return `₹${Math.round(v)}`;
};

// One sidebar module on the dashboard: headline numbers and charts, for my team or my work.
// `stats={false}` shows the charts only (when the tab already has its own cards above).
// `module` passes data the page already loaded (from useModuleData), so it isn't fetched twice.
function ModuleSection({ section, team, stats = true, module }) {
    const own = useModuleData(module ? null : section, team);
    const { data, failed } = module || own;

    if (failed) return <EmptyState icon={InsightsRounded} title="This part of the dashboard couldn't load" message="Try again in a moment." />;
    if (!data) return <EmptyState icon={InsightsRounded} title="Loading…" />;

    // Pairs of charts share a row: a wide trend next to a narrower donut or list.
    const WIDE = new Set(["line", "bar"]);
    const spans = data.charts.map((chart, index, list) => {
        const pairStart = index % 2 === 0;
        const partner = pairStart ? list[index + 1] : list[index - 1];
        if (!partner) return 12;
        const wide = WIDE.has(chart.type);
        const partnerWide = WIDE.has(partner.type);
        if (wide === partnerWide) return 6;
        return wide ? 7 : 5;
    });

    const renderChart = (c) => {
        if (!c.items.length || !c.items.some((item) => item.value)) {
            return <EmptyState icon={InsightsRounded} title="Nothing yet" message="This fills in as work is recorded." />;
        }
        if (c.type === "line") return <LineChart items={c.items} money={c.money} unit={c.unit} />;
        if (c.type === "donut") return <DonutChart items={c.items} money={c.money} unit={c.unit} />;
        if (c.type === "rank") return <RankList items={c.items} money={c.money} unit={c.unit} />;
        return (
            <BarChart
                ariaLabel={c.title}
                unit={c.unit}
                items={c.items.map((item) => ({
                    key: item.key,
                    axisLabel: item.label,
                    tooltipTitle: item.label,
                    value: item.value,
                    detail: `${c.money ? inr.format(item.value) : `${item.value} ${c.unit}`}${item.detail ? ` · ${item.detail}` : ""}`,
                }))}
            />
        );
    };

    return (
        <Box>
            {stats && (
                <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                    {data.stats.map((s) => (
                        <KpiCard
                            key={s.label}
                            icon={ICONS[s.icon] || InsightsRounded}
                            label={s.label}
                            value={s.money ? compact(s.value) : s.value}
                            caption={s.caption}
                            color={s.color}
                            progress={s.progress ?? undefined}
                            spark={s.spark}
                            trend={s.trend}
                        />
                    ))}
                </Box>
            )}

            <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(12, minmax(0, 1fr))" }, gap: theme.stat.gap, mb: theme.stat.gap })}>
                {data.charts.map((c, index) => (
                    <Box key={c.key} sx={{ gridColumn: { xs: "auto", lg: `span ${spans[index]}` }, minWidth: 0 }}>
                        <Panel
                            title={c.title}
                            subtitle={c.subtitle}
                            sx={{ height: "100%" }}
                            actions={
                                index === 0 && data.link ? (
                                    <Button size="small" endIcon={<ChevronRightRounded />} component={RouterLink} to={data.link.to}>
                                        {data.link.label}
                                    </Button>
                                ) : null
                            }
                        >
                            {renderChart(c)}
                        </Panel>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

export default ModuleSection;
