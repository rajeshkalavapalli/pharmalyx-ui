import { useEffect, useState } from "react";

import { Alert, Box, Button, Divider, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { AddRounded, CallRounded, CloseRounded, MailOutlineRounded } from "@mui/icons-material";

import { DetailFact, DetailSection } from "../../../components/DetailSection/DetailSection";
import StatusChip from "../../../components/StatusChip/StatusChip";
import { ACCOUNT_KIND, ORDER_STATUS, errorMessage, formatAmount, formatDate, formatMoneyCompact, getAccount } from "../index";

function Metric({ label, value, caption }) {
    return (
        <Box sx={(theme) => ({ p: 1.5, borderRadius: theme.calendar.cell.radius, backgroundColor: theme.palette.surface.subtle, minWidth: 0 })}>
            <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                {label}
            </Typography>
            <Typography variant="h6" component="p" noWrap>
                {value}
            </Typography>
            {caption && (
                <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {caption}
                </Typography>
            )}
        </Box>
    );
}

// Contact details, business at a glance and recent orders for one chemist or stockist.
function AccountDrawer({ kind, accountId, refreshKey, onClose, onBook }) {
    const config = ACCOUNT_KIND[kind];

    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!accountId) return undefined;

        let active = true;
        setError("");

        getAccount(kind, accountId)
            .then((response) => active && setData(response))
            .catch((err) => active && setError(errorMessage(err, `Couldn't load this ${config.noun}`)));

        return () => {
            active = false;
        };
    }, [kind, accountId, refreshKey, config.noun]);

    const account = data?.account?.AccountId === accountId ? data.account : null;
    const orders = account ? data.orders : [];

    return (
        <Drawer
            anchor="right"
            open={Boolean(accountId)}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: (theme) => ({ width: theme.drawer.width, backgroundColor: theme.palette.background.paper, display: "flex", flexDirection: "column" }),
                },
            }}
        >
            <Stack direction="row" sx={(theme) => ({ gap: 2, px: theme.drawer.paddingX, py: theme.drawer.paddingY, alignItems: "flex-start" })}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                        {config.singular}
                    </Typography>
                    <Typography variant="h4" component="h2">
                        {account?.Name || (error ? "Unavailable" : "Loading…")}
                    </Typography>
                    {account && (
                        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            {[account.AreaName, account.TerritoryName].filter(Boolean).join(" · ") || "No area set"}
                        </Typography>
                    )}
                </Box>
                <IconButton aria-label="Close" onClick={onClose}>
                    <CloseRounded />
                </IconButton>
            </Stack>

            <Divider />

            <Box sx={(theme) => ({ flex: 1, overflowY: "auto", px: theme.drawer.paddingX, py: theme.drawer.paddingY })}>
                {error ? (
                    <Alert severity="error" variant="outlined">
                        {error}
                    </Alert>
                ) : (
                    account && (
                        <Stack sx={(theme) => ({ gap: theme.drawer.sectionGap })}>
                            <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                                <Button variant="outlined" startIcon={<CallRounded />} href={`tel:${account.ContactNumber}`} disabled={!account.ContactNumber}>
                                    Call
                                </Button>
                                <Button variant="outlined" startIcon={<MailOutlineRounded />} href={`mailto:${account.EmailId}`} disabled={!account.EmailId}>
                                    Email
                                </Button>
                            </Stack>

                            <Box sx={(theme) => ({ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: theme.stat.gap })}>
                                <Metric label="This month" value={formatMoneyCompact(account.MonthValue)} caption={`${account.MonthOrders} order(s)`} />
                                <Metric label="All time" value={formatMoneyCompact(account.TotalValue)} caption={`${account.TotalOrders} order(s)`} />
                                {kind === "stockists" ? (
                                    <Metric label="Awaiting supply" value={account.PendingOrders} caption={formatMoneyCompact(account.PendingValue)} />
                                ) : (
                                    <Metric label="Last RCPA" value={account.LastRcpaDate ? formatDate(account.LastRcpaDate) : "—"} caption="Chemist audit" />
                                )}
                            </Box>

                            <DetailSection title="Contact">
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 2 }}>
                                    <DetailFact label="Owner">{account.OwnerName || "—"}</DetailFact>
                                    <DetailFact label="Phone">{account.ContactNumber || "—"}</DetailFact>
                                    <DetailFact label="Email">{account.EmailId || "—"}</DetailFact>
                                    <DetailFact label="Drug licence">{account.DrugLicenceNumber || "—"}</DetailFact>
                                    <DetailFact label="GSTIN">{account.GSTIN || "—"}</DetailFact>
                                    <DetailFact label="Address">{account.Address || "—"}</DetailFact>
                                </Box>
                            </DetailSection>

                            <DetailSection title={`Recent orders${orders.length ? ` · ${orders.length}` : ""}`}>
                                {orders.length ? (
                                    <Stack divider={<Divider />}>
                                        {orders.map((order) => (
                                            <Stack key={order.OrderId} direction="row" sx={{ py: 1.25, gap: 1.5, alignItems: "center" }}>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="subtitle2" noWrap>
                                                        {kind === "stockists"
                                                            ? order.CustomerType === "DOCTOR"
                                                                ? `Dr. ${order.CustomerName}`
                                                                : order.CustomerName
                                                            : `via ${order.StockistName || "—"}`}
                                                    </Typography>
                                                    <Typography variant="caption" component="p" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                        {[order.OrderNumber, formatDate(order.OrderDate), `${order.Items} item(s)`].join(" · ")}
                                                    </Typography>
                                                </Box>
                                                <StatusChip label={ORDER_STATUS[order.Status].label} color={ORDER_STATUS[order.Status].color} />
                                                <Typography variant="subtitle2" sx={(theme) => ({ minWidth: theme.engagement.quantityColumn, textAlign: "right" })}>
                                                    {formatAmount(order.NetAmount)}
                                                </Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        No orders booked {kind === "stockists" ? "through" : "for"} this {config.noun} yet.
                                    </Typography>
                                )}
                            </DetailSection>
                        </Stack>
                    )
                )}
            </Box>

            {account && (
                <>
                    <Divider />
                    <Stack direction="row" sx={(theme) => ({ justifyContent: "flex-end", px: theme.drawer.paddingX, py: 2 })}>
                        <Button variant="contained" startIcon={<AddRounded />} onClick={() => onBook(account)}>
                            Book order
                        </Button>
                    </Stack>
                </>
            )}
        </Drawer>
    );
}

export default AccountDrawer;
