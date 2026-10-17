import { useCallback, useEffect, useMemo, useState } from "react";

import { Box, ButtonBase, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    CallRounded,
    ChevronRightRounded,
    CurrencyRupeeRounded,
    HourglassTopRounded,
    LocalPharmacyRounded,
    PersonOffRounded,
    SearchRounded,
    StorefrontRounded,
    TaskAltRounded,
    WarehouseRounded,
} from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import MonthSwitcher from "../../../components/MonthSwitcher/MonthSwitcher";
import PageHeader from "../../../components/PageHeader/PageHeader";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import OrderDialog from "../Orders/OrderDialog";
import { ACCOUNT_KIND, createOrder, errorMessage, formatDate, formatMoneyCompact, getAccounts, monthKey } from "../index";
import AccountDrawer from "./AccountDrawer";

const FILTERS = {
    retailers: [
        { value: "ALL", label: "All", test: () => true },
        { value: "ORDERING", label: "Ordered this month", test: (account) => account.MonthOrders > 0 },
        { value: "NOT_ORDERING", label: "No order this month", test: (account) => account.MonthOrders === 0 },
    ],
    stockists: [
        { value: "ALL", label: "All", test: () => true },
        { value: "PENDING", label: "Awaiting supply", test: (account) => account.PendingOrders > 0 },
        { value: "ORDERING", label: "Active this month", test: (account) => account.MonthOrders > 0 },
    ],
};

function AccountCard({ kind, account, onOpen }) {
    const Icon = kind === "stockists" ? WarehouseRounded : LocalPharmacyRounded;

    return (
        <ButtonBase
            onClick={onOpen}
            sx={(theme) => ({
                p: theme.entityCard.padding,
                gap: 1.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                textAlign: "left",
                minWidth: 0,
                borderRadius: theme.panel.radius,
                border: "1px solid",
                borderColor: theme.palette.border.default,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.elevation.sm,
                transition: theme.calendar.transition,
                "&:hover": {
                    borderColor: alpha(theme.palette.primary.main, theme.tint.strong),
                    boxShadow: theme.card.shadow,
                    transform: theme.entityCard.hoverLift,
                },
            })}
        >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                <Box
                    sx={(theme) => ({
                        width: theme.avatar.size,
                        height: theme.avatar.size,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: theme.stat.iconRadius,
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft),
                    })}
                >
                    <Icon />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" noWrap>
                        {account.Name}
                    </Typography>
                    <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {[account.OwnerName, account.AreaName].filter(Boolean).join(" · ") || "—"}
                    </Typography>
                </Box>
                <ChevronRightRounded sx={(theme) => ({ color: theme.palette.text.disabled })} />
            </Stack>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1 }}>
                <Box>
                    <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        This month
                    </Typography>
                    <Typography variant="subtitle1">{formatMoneyCompact(account.MonthValue)}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Orders
                    </Typography>
                    <Typography variant="subtitle1">{account.MonthOrders}</Typography>
                </Box>
            </Box>

            <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", mt: "auto" }}>
                {account.LastOrderDate ? (
                    <Tag label={`Last order ${formatDate(account.LastOrderDate)}`} color="secondary" />
                ) : (
                    <Tag label="No orders yet" color="warning" />
                )}
                {kind === "stockists" && account.PendingOrders > 0 && <Tag icon={HourglassTopRounded} label={`${account.PendingOrders} awaiting supply`} color="warning" />}
                {kind === "retailers" && account.LastRcpaDate && <Tag label={`RCPA ${formatDate(account.LastRcpaDate)}`} color="info" />}
                {account.ContactNumber && <Tag icon={CallRounded} label={account.ContactNumber} color="secondary" />}
            </Stack>
        </ButtonBase>
    );
}

// Field view of the MR's assigned chemists (kind="retailers") or stockists (kind="stockists").
function Accounts({ kind }) {
    const config = ACCOUNT_KIND[kind];
    const { showSnackbar } = useSnackbar();

    const [month, setMonth] = useState(monthKey());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    const [selectedId, setSelectedId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [booking, setBooking] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            setData(await getAccounts(kind, month));
        } catch (err) {
            setData(null);
            setError(errorMessage(err, `Failed to load ${config.plural.toLowerCase()}`));
        } finally {
            setLoading(false);
        }
    }, [kind, month, config.plural]);

    useEffect(() => {
        load();
    }, [load]);

    const filters = FILTERS[kind];

    const accounts = useMemo(() => {
        const term = search.trim().toLowerCase();
        const test = (filters.find((item) => item.value === filter) || filters[0]).test;

        return (data?.accounts || []).filter(
            (account) =>
                test(account) &&
                (!term ||
                    [account.Name, account.OwnerName, account.AreaName, account.TerritoryName, account.ContactNumber]
                        .filter(Boolean)
                        .some((value) => String(value).toLowerCase().includes(term)))
        );
    }, [data, search, filter, filters]);

    const handleBook = async (payload) => {
        setSaving(true);

        try {
            const response = await createOrder(payload);
            showSnackbar(response?.message || "Order booked", "success");
            setBooking(null);
            setRefreshKey((key) => key + 1);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to book order"), "error");
        } finally {
            setSaving(false);
        }
    };

    const summary = data?.summary;
    const all = data?.accounts || [];

    return (
        <Box>
            <PageHeader
                eyebrow={config.eyebrow}
                title={kind === "stockists" ? "My stockists" : "My retailers"}
                subtitle={
                    kind === "stockists"
                        ? "Stockists who supply your orders: contacts, business routed through them and pending supply."
                        : "Chemists assigned to you: contacts, ordering this month and recent orders."
                }
                actions={<MonthSwitcher month={month} onChange={setMonth} />}
            />

            <Box
                sx={(theme) => ({
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                    gap: theme.stat.gap,
                    mb: theme.pageHeader.marginBottom,
                })}
            >
                <StatCard icon={kind === "stockists" ? WarehouseRounded : StorefrontRounded} label={kind === "stockists" ? "Stockists" : "Retailers"} value={summary?.total ?? "—"} caption="Assigned to you" color="primary" />
                <StatCard
                    icon={TaskAltRounded}
                    label="Active this month"
                    value={summary?.ordering ?? "—"}
                    caption={summary?.total ? `${Math.round((summary.ordering / summary.total) * 100)}% of ${config.plural.toLowerCase()}` : "—"}
                    color="success"
                    progress={summary?.total ? Math.round((summary.ordering / summary.total) * 100) : 0}
                />
                <StatCard icon={CurrencyRupeeRounded} label="Order value" value={summary ? formatMoneyCompact(summary.monthValue) : "—"} caption={`${summary?.monthOrders ?? 0} order(s) this month`} color="info" />
                {kind === "stockists" ? (
                    <StatCard icon={HourglassTopRounded} label="Awaiting supply" value={summary?.pendingOrders ?? "—"} caption={summary ? `${formatMoneyCompact(summary.pendingValue)} to be supplied` : "—"} color="warning" />
                ) : (
                    <StatCard icon={PersonOffRounded} label="Never ordered" value={summary?.neverOrdered ?? "—"} caption="Chemists to convert" color="warning" />
                )}
            </Box>

            <Stack
                direction={{ xs: "column", lg: "row" }}
                sx={(theme) => ({ gap: 1.5, mb: theme.pageHeader.marginBottom, alignItems: { xs: "stretch", lg: "center" }, justifyContent: "space-between" })}
            >
                <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                    <SegmentedControl
                        value={filter}
                        onChange={setFilter}
                        options={filters.map((item) => ({ value: item.value, label: `${item.label} · ${all.filter(item.test).length}` }))}
                    />
                </Box>
                <TextField
                    size="small"
                    placeholder={`Search ${config.plural.toLowerCase()}, owner, area, phone…`}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    sx={(theme) => ({ minWidth: theme.search.minWidth, "& .MuiOutlinedInput-root": { minHeight: theme.field.compactHeight } })}
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
                <LoadError title={`Couldn't load ${config.plural.toLowerCase()}`} message={error} onRetry={load} />
            ) : accounts.length === 0 ? (
                <EmptyState
                    icon={kind === "stockists" ? WarehouseRounded : StorefrontRounded}
                    title={loading ? "Loading…" : all.length ? `No ${config.plural.toLowerCase()} match` : `No ${config.plural.toLowerCase()} assigned yet`}
                    message={loading ? "" : all.length ? "Try another filter or search." : `Ask your administrator to map ${config.plural.toLowerCase()} to you in Configuration.`}
                />
            ) : (
                <Box
                    sx={(theme) => ({
                        display: "grid",
                        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${theme.entityCard.minWidth}px), 1fr))`,
                        gap: theme.stat.gap,
                        opacity: loading ? theme.table.loadingOpacity : 1,
                    })}
                >
                    {accounts.map((account) => (
                        <AccountCard key={account.AccountId} kind={kind} account={account} onOpen={() => setSelectedId(account.AccountId)} />
                    ))}
                </Box>
            )}

            <AccountDrawer
                kind={kind}
                accountId={selectedId}
                refreshKey={refreshKey}
                onClose={() => setSelectedId(null)}
                onBook={(account) =>
                    setBooking(kind === "stockists" ? { stockistId: account.AccountId } : { customerType: "CHEMIST", customerId: account.AccountId })
                }
            />

            {booking && <OrderDialog initial={booking} saving={saving} onClose={() => setBooking(null)} onSave={handleBook} />}
        </Box>
    );
}

export default Accounts;
