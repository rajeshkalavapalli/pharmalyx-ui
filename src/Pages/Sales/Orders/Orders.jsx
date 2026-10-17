import { useCallback, useEffect, useMemo, useState } from "react";

import { Box, Button, ButtonBase, Divider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AddRounded,
    CurrencyRupeeRounded,
    HourglassTopRounded,
    LocalPharmacyRounded,
    LocalShippingRounded,
    MedicalServicesRounded,
    ReceiptLongRounded,
} from "@mui/icons-material";

import ConfirmActionDialog from "../../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import MonthSwitcher from "../../../components/MonthSwitcher/MonthSwitcher";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../../components/StatCard/StatCard";
import StatusChip from "../../../components/StatusChip/StatusChip";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import {
    ORDER_STATUS,
    createOrder,
    customerLabel,
    errorMessage,
    formatAmount,
    formatDate,
    formatMoneyCompact,
    getOrders,
    monthKey,
    updateOrderStatus,
} from "../index";
import OrderDialog from "./OrderDialog";
import OrderDrawer from "./OrderDrawer";

function OrderRow({ order, showOwner, onOpen }) {
    const status = ORDER_STATUS[order.Status];
    const Icon = order.CustomerType === "DOCTOR" ? MedicalServicesRounded : LocalPharmacyRounded;

    return (
        <ButtonBase
            onClick={onOpen}
            sx={(theme) => ({
                width: "100%",
                py: 1.5,
                px: 1,
                gap: 1.5,
                display: "flex",
                alignItems: "center",
                textAlign: "left",
                borderRadius: theme.calendar.cell.radius,
                transition: theme.calendar.transition,
                opacity: order.Status === "CANCELLED" ? theme.table.loadingOpacity : 1,
                "&:hover": { backgroundColor: alpha(theme.palette.primary.main, theme.tint.hover) },
            })}
        >
            <Box
                sx={(theme) => ({
                    width: theme.avatar.sizeSmall,
                    height: theme.avatar.sizeSmall,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: theme.stat.iconRadius,
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft),
                })}
            >
                <Icon fontSize="small" />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                    {customerLabel(order)}
                </Typography>
                <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {[order.OrderNumber, formatDate(order.OrderDate), `via ${order.StockistName || "—"}`, `${order.lines.length} item(s)`, showOwner ? order.UserName : null]
                        .filter(Boolean)
                        .join(" · ")}
                </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <StatusChip label={status.label} color={status.color} />
            </Box>

            <Typography variant="subtitle2" sx={(theme) => ({ minWidth: theme.engagement.quantityColumn, textAlign: "right" })}>
                {formatAmount(order.NetAmount)}
            </Typography>
        </ButtonBase>
    );
}

function Orders() {
    const { showSnackbar } = useSnackbar();

    const [month, setMonth] = useState(monthKey());
    const [scope, setScope] = useState("self");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            setData(await getOrders(month, scope));
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load orders"));
        } finally {
            setLoading(false);
        }
    }, [month, scope]);

    useEffect(() => {
        load();
    }, [load]);

    const orders = useMemo(
        () => (data?.orders || []).filter((order) => statusFilter === "ALL" || order.Status === statusFilter),
        [data, statusFilter]
    );

    const handleBook = async (payload) => {
        setSaving(true);

        try {
            const response = await createOrder(payload);
            showSnackbar(response?.message || "Order booked", "success");
            setDialogOpen(false);
            if (scope !== "self") setScope("self");
            else load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to book order"), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleStatus = async (remarks) => {
        setSaving(true);

        try {
            const response = await updateOrderStatus(pendingAction.order.OrderId, pendingAction.action.status, remarks);
            showSnackbar(response?.message || "Order updated", "success");
            setPendingAction(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Failed to update order"), "error");
        } finally {
            setSaving(false);
        }
    };

    const summary = data?.summary;
    const selected = (data?.orders || []).find((order) => order.OrderId === selectedId) || null;
    const counts = summary?.byStatus || {};
    const statusOptions = [
        { value: "ALL", label: `All · ${data?.orders?.length ?? 0}` },
        ...Object.entries(ORDER_STATUS).map(([value, status]) => ({ value, label: `${status.label} · ${counts[value] ?? 0}` })),
    ];
    const maxTop = Math.max(1, ...(summary?.topProducts || []).map((product) => product.value));

    return (
        <Box>
            <PageHeader
                eyebrow="Sales & distribution · POB"
                title={scope === "team" ? "Team orders" : "POB / Orders"}
                subtitle="Orders booked at doctors and chemists, supplied through your stockists."
                actions={
                    <>
                        {data?.hasTeam && (
                            <SegmentedControl
                                value={scope}
                                onChange={setScope}
                                options={[
                                    { value: "self", label: "My orders" },
                                    { value: "team", label: "My team" },
                                ]}
                            />
                        )}
                        {scope === "self" && (
                            <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialogOpen(true)}>
                                Book order
                            </Button>
                        )}
                    </>
                }
            />

            <Box
                sx={(theme) => ({
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                    gap: theme.stat.gap,
                    mb: theme.pageHeader.marginBottom,
                })}
            >
                <StatCard icon={CurrencyRupeeRounded} label="Order value" value={summary ? formatMoneyCompact(summary.value) : "—"} caption="Excluding cancelled" color="primary" />
                <StatCard icon={ReceiptLongRounded} label="Orders" value={summary?.orders ?? "—"} caption={`${summary?.customers ?? 0} customer(s)`} color="info" />
                <StatCard icon={HourglassTopRounded} label="Awaiting supply" value={summary?.pending ?? "—"} caption="Booked or confirmed" color="warning" />
                <StatCard
                    icon={LocalShippingRounded}
                    label="Supplied value"
                    value={summary ? formatMoneyCompact(summary.suppliedValue) : "—"}
                    caption={summary?.value ? `${Math.round((summary.suppliedValue / summary.value) * 100)}% of order value` : "Nothing booked yet"}
                    color="success"
                    progress={summary?.value ? Math.round((summary.suppliedValue / summary.value) * 100) : 0}
                />
            </Box>

            {error ? (
                <LoadError title="Couldn't load orders" message={error} onRetry={load} />
            ) : (
                <Box
                    sx={(theme) => ({
                        display: "grid",
                        gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: `minmax(0, 1fr) ${theme.spacing(theme.dashboard.sideColumnWidth)}` },
                        gap: theme.stat.gap,
                        alignItems: "start",
                        opacity: loading ? theme.table.loadingOpacity : 1,
                    })}
                >
                    <Panel title="Orders" subtitle={`${orders.length} shown`} actions={<MonthSwitcher month={month} onChange={setMonth} />}>
                        <Box sx={{ maxWidth: "100%", overflowX: "auto", mb: 1.5 }}>
                            <SegmentedControl value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
                        </Box>

                        {orders.length ? (
                            <Stack divider={<Divider />}>
                                {orders.map((order) => (
                                    <OrderRow key={order.OrderId} order={order} showOwner={scope === "team"} onOpen={() => setSelectedId(order.OrderId)} />
                                ))}
                            </Stack>
                        ) : (
                            <EmptyState
                                icon={ReceiptLongRounded}
                                title={loading ? "Loading orders…" : statusFilter === "ALL" ? "No orders this month" : `No ${ORDER_STATUS[statusFilter].label.toLowerCase()} orders`}
                                message={loading || scope === "team" ? "" : "Book a POB when a doctor or chemist places an order."}
                            />
                        )}
                    </Panel>

                    <Panel title="Top products" subtitle="By order value">
                        {summary?.topProducts?.length ? (
                            <Stack spacing={1.75}>
                                {summary.topProducts.map((product) => (
                                    <Box key={product.ProductId}>
                                        <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                                            <Typography variant="subtitle2" noWrap>
                                                {product.ProductName}
                                            </Typography>
                                            <Typography variant="subtitle2">{formatMoneyCompact(product.value)}</Typography>
                                        </Stack>
                                        <Box sx={(theme) => ({ height: theme.spacing(0.75), borderRadius: theme.statusChip.radius, backgroundColor: theme.palette.surface.muted })}>
                                            <Box
                                                sx={(theme) => ({
                                                    width: `${(product.value / maxTop) * 100}%`,
                                                    height: "100%",
                                                    borderRadius: theme.statusChip.radius,
                                                    backgroundColor: theme.palette.primary.main,
                                                })}
                                            />
                                        </Box>
                                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {product.quantity} units{product.freeQuantity ? ` + ${product.freeQuantity} free` : ""}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        ) : (
                            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                No products ordered this month.
                            </Typography>
                        )}
                    </Panel>
                </Box>
            )}

            <OrderDrawer
                order={selected}
                canUpdate
                onClose={() => setSelectedId(null)}
                onAction={(order, action) => setPendingAction({ order, action })}
            />

            {dialogOpen && <OrderDialog saving={saving} onClose={() => setDialogOpen(false)} onSave={handleBook} />}

            {pendingAction && (
                <ConfirmActionDialog
                    icon={pendingAction.action.status === "CANCELLED" ? undefined : LocalShippingRounded}
                    color={pendingAction.action.color}
                    title={`${pendingAction.action.label}?`}
                    message={`${pendingAction.order.OrderNumber} · ${customerLabel(pendingAction.order)} · ${formatAmount(pendingAction.order.NetAmount)}`}
                    confirmLabel={pendingAction.action.label}
                    remarks={pendingAction.action.remarks}
                    remarksLabel={pendingAction.action.status === "CANCELLED" ? "Reason for cancelling" : "Note (optional)"}
                    remarksLimit={500}
                    busy={saving}
                    onClose={() => setPendingAction(null)}
                    onConfirm={handleStatus}
                />
            )}
        </Box>
    );
}

export default Orders;
