import { useEffect, useState } from "react";

import { Alert, Box, Divider, LinearProgress, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { InsightsRounded, LocalShippingRounded, SavingsRounded } from "@mui/icons-material";

import EmptyState from "../../components/EmptyState/EmptyState";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { dayLabel, errorMessage, getFillRate, getFocus, getSpendReport, percent, rupees } from "./index";

const TABS = [
    { value: "fill", label: "Stockist fill rate" },
    { value: "spend", label: "Spend vs business" },
    { value: "focus", label: "Focus" },
];
const muted = (theme) => ({ color: theme.palette.text.secondary });

function Row({ title, caption, right, flagged, children }) {
    return (
        <Stack sx={{ py: 1.25, gap: 0.5 }}>
            <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
                        <Typography variant="subtitle2">{title}</Typography>
                        {flagged}
                    </Stack>
                    {caption && (
                        <Typography variant="caption" sx={muted}>
                            {caption}
                        </Typography>
                    )}
                </Box>
                {right}
            </Stack>
            {children}
        </Stack>
    );
}

function FillRate({ data }) {
    return (
        <Panel title="Orders supplied by each stockist" subtitle={`${dayLabel(data.from)} – ${dayLabel(data.to)}. Flagged below ${data.minPct}%. Unsupplied POBs are flagged to head office after ${data.unsuppliedDays} days.`}>
            {data.stockists.length ? (
                <Stack divider={<Divider />}>
                    {data.stockists.map((s) => (
                        <Row
                            key={s.StockistId}
                            title={s.StockistName}
                            caption={`${s.supplied} of ${s.raised} orders · ${rupees(s.suppliedValue)} of ${rupees(s.raisedValue)}${s.overdue ? ` · ${s.overdue} overdue` : ""}`}
                            flagged={s.flagged && <Tag label="Low fill rate" color="error" />}
                            right={
                                <Typography variant="subtitle1" sx={(theme) => ({ color: s.flagged ? theme.palette.error.main : theme.palette.success.main })}>
                                    {percent(s.countPct)}
                                </Typography>
                            }
                        >
                            <LinearProgress variant="determinate" value={Math.min(100, s.countPct || 0)} color={s.flagged ? "error" : "success"} />
                            <Stack direction="row" sx={{ gap: 0.5, flexWrap: "wrap" }}>
                                {s.months.map((m) => (
                                    <Tag key={m.month} label={`${new Date(`${m.month}T00:00:00`).toLocaleDateString("en-IN", { month: "short" })}: ${percent(m.countPct)} (value ${percent(m.valuePct)})`} color={m.flagged ? "error" : "secondary"} />
                                ))}
                            </Stack>
                        </Row>
                    ))}
                </Stack>
            ) : (
                <EmptyState icon={LocalShippingRounded} title="No POBs in this period" />
            )}
        </Panel>
    );
}

function SpendList({ title, rows, maxPct, businessLabel }) {
    return (
        <Panel title={title} subtitle={`Spend = samples + schemes / special prices + doctor spend paid. Flagged when spend is over ${maxPct}% of ${businessLabel}.`}>
            {rows.length ? (
                <Stack divider={<Divider />}>
                    {rows.map((r) => (
                        <Row
                            key={r.id}
                            title={r.name}
                            caption={`${r.territory ? `${r.territory} · ` : ""}samples ${rupees(r.samples)} · schemes ${rupees(r.schemes)} · doctor spend ${rupees(r.doctorSpend)}`}
                            flagged={r.flagged && <Tag label={r.pct == null ? "Spend, no business" : "Spend too high"} color="error" />}
                            right={
                                <Box sx={{ textAlign: "right" }}>
                                    <Typography variant="subtitle2">
                                        {rupees(r.spend)} / {rupees(r.business)}
                                    </Typography>
                                    <Typography variant="caption" sx={(theme) => ({ color: r.flagged ? theme.palette.error.main : theme.palette.text.secondary })}>
                                        {r.pct == null ? "—" : `${r.pct}% of business`}
                                    </Typography>
                                </Box>
                            }
                        />
                    ))}
                </Stack>
            ) : (
                <EmptyState icon={SavingsRounded} title="No spend or business in this period" />
            )}
        </Panel>
    );
}

function FocusList({ title, rows, unit }) {
    const top = rows[0]?.score || 1;
    return (
        <Panel title={title} subtitle="Most responsive first: business for every rupee of effort (spend + visits).">
            {rows.length ? (
                <Stack divider={<Divider />}>
                    {rows.slice(0, 25).map((r, i) => (
                        <Row
                            key={r.id}
                            title={`${i + 1}. ${r.name}`}
                            caption={`${r.territory ? `${r.territory} · ` : ""}business ${rupees(r.business)} · spend ${rupees(r.spend)} · ${r.visits} ${unit}`}
                            right={<Typography variant="subtitle2">{r.score.toLocaleString("en-IN")}x</Typography>}
                        >
                            <LinearProgress variant="determinate" value={Math.max(2, Math.min(100, (r.score / top) * 100))} color={i < 3 ? "success" : r.score === 0 ? "error" : "primary"} />
                        </Row>
                    ))}
                </Stack>
            ) : (
                <EmptyState icon={InsightsRounded} title="Nothing to rank yet" />
            )}
        </Panel>
    );
}

// Head office, managers and MRs: where supply fails, where spend does not pay back, and where to focus.
function SupplyReports() {
    const { showSnackbar } = useSnackbar();
    const [tab, setTab] = useState("fill");
    const [months, setMonths] = useState(3);
    const [view, setView] = useState("territories");
    const [data, setData] = useState({});

    useEffect(() => {
        const loader = { fill: getFillRate, spend: getSpendReport, focus: getFocus }[tab];
        setData((d) => ({ ...d, [tab]: null }));
        loader(months)
            .then((result) => setData((d) => ({ ...d, [tab]: result })))
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load the report"), "error"));
    }, [tab, months, showSnackbar]);

    const current = data[tab];
    const views =
        tab === "spend"
            ? [
                  { value: "territories", label: "Territories" },
                  { value: "doctors", label: "Doctors" },
                  { value: "chemists", label: "Chemists" },
              ]
            : [
                  { value: "doctors", label: "Doctors" },
                  { value: "chemists", label: "Chemists" },
                  { value: "areas", label: "Areas" },
                  { value: "products", label: "Products" },
              ];
    const activeView = views.some((v) => v.value === view) ? view : views[0].value;

    return (
        <Box>
            <PageHeader
                eyebrow="Sales & distribution · Reports"
                title="Supply & spend reports"
                subtitle="Stockist fill rate, spend (samples, schemes, special prices, doctor spend) against net sales, and the most responsive doctors, chemists, areas and products."
                actions={
                    <TextField select size="small" label="Period" value={months} onChange={(e) => setMonths(Number(e.target.value))} sx={(theme) => ({ minWidth: theme.spacing(18) })}>
                        {[1, 3, 6, 12].map((m) => (
                            <MenuItem key={m} value={m}>
                                Last {m} month{m > 1 ? "s" : ""}
                            </MenuItem>
                        ))}
                    </TextField>
                }
            />
            <Stack direction={{ xs: "column", md: "row" }} sx={(theme) => ({ gap: 1.5, mb: theme.stat.gap, overflowX: "auto" })}>
                <SegmentedControl value={tab} onChange={setTab} options={TABS} />
                {tab !== "fill" && <SegmentedControl value={activeView} onChange={setView} options={views} />}
            </Stack>

            {!current && <EmptyState icon={InsightsRounded} title="Loading…" />}
            {current && tab === "fill" && <FillRate data={current} />}
            {current && tab === "spend" && (
                <Stack spacing={2}>
                    <Alert severity="info" variant="outlined">
                        Territory business is net sales (dispatch − returns). Chemist business is supplied POB + direct supply; doctor business is supplied POB booked for the doctor.
                    </Alert>
                    <SpendList
                        title={{ territories: "By territory", doctors: "By doctor", chemists: "By chemist" }[activeView]}
                        rows={current[activeView]}
                        maxPct={current.maxPct}
                        businessLabel={activeView === "territories" ? "net sales" : "business"}
                    />
                </Stack>
            )}
            {current && tab === "focus" && (
                <FocusList
                    title={{ doctors: "Doctors", chemists: "Chemists", areas: "Areas", products: "Products" }[activeView]}
                    rows={current[activeView]}
                    unit={activeView === "chemists" ? "orders / deliveries" : activeView === "products" ? "visits" : "valid visits"}
                />
            )}
        </Box>
    );
}

export default SupplyReports;
