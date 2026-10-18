import { useEffect, useState } from "react";

import { Box, Button, Divider, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { CloseRounded } from "@mui/icons-material";

import { DetailFact, DetailSection } from "../../../components/DetailSection/DetailSection";
import StatusChip from "../../../components/StatusChip/StatusChip";
import { customerLabel, fetchSlipUrl, formatAmount, formatDate, orderActions, statusOf } from "../index";

const formatStamp = (value) =>
    value ? new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : null;

function Row({ label, value, strong }) {
    return (
        <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
            <Typography variant={strong ? "subtitle1" : "body2"} sx={(theme) => ({ color: strong ? theme.palette.text.primary : theme.palette.text.secondary })}>
                {label}
            </Typography>
            <Typography variant={strong ? "subtitle1" : "body2"}>{value}</Typography>
        </Stack>
    );
}

// Slip photo (fetched with the session; never cached in public).
function SlipPhoto({ orderId }) {
    const [url, setUrl] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let current = null;
        fetchSlipUrl(orderId)
            .then((value) => {
                current = value;
                setUrl(value);
            })
            .catch(() => setFailed(true));
        return () => current && URL.revokeObjectURL(current);
    }, [orderId]);

    if (failed) return <Typography variant="body2">The slip photo could not be loaded.</Typography>;
    if (!url) return <Typography variant="body2">Loading the slip…</Typography>;
    return <Box component="img" src={url} alt="Order slip" sx={(theme) => ({ width: "100%", maxHeight: theme.doctorRequests.cameraMaxHeight, objectFit: "contain", borderRadius: theme.field.radius, backgroundColor: theme.palette.surface.subtle })} />;
}

// Order details with the next steps: the MR marks supplied; the manager follows up and verifies.
function OrderDrawer({ order, canUpdate, role = "owner", onClose, onAction }) {
    const status = order ? statusOf(order) : null;
    const actions = order && canUpdate ? orderActions(order, role) : [];

    const history = order
        ? [
              { label: "Raised", at: order.CreatedOn },
              { label: `Under follow-up${order.FollowUpByName ? ` (${order.FollowUpByName})` : ""}`, at: order.FollowUpOn || order.ConfirmedOn },
              { label: "Supplied", at: order.SuppliedOn },
              { label: `Verified${order.VerifiedByName ? ` (${order.VerifiedByName})` : ""}`, at: order.VerifiedOn },
              { label: "Cancelled", at: order.CancelledOn },
          ].filter((step) => step.at)
        : [];

    return (
        <Drawer
            anchor="right"
            open={Boolean(order)}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: (theme) => ({ width: theme.drawer.width, backgroundColor: theme.palette.background.paper, display: "flex", flexDirection: "column" }),
                },
            }}
        >
            {order && (
                <>
                    <Stack direction="row" sx={(theme) => ({ gap: 2, px: theme.drawer.paddingX, py: theme.drawer.paddingY, alignItems: "flex-start" })}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main })}>
                                {order.OrderNumber}
                            </Typography>
                            <Typography variant="h4" component="h2">
                                {customerLabel(order)}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                <StatusChip label={status.label} color={status.color} />
                            </Box>
                        </Box>
                        <IconButton aria-label="Close" onClick={onClose}>
                            <CloseRounded />
                        </IconButton>
                    </Stack>

                    <Divider />

                    <Box sx={(theme) => ({ flex: 1, overflowY: "auto", px: theme.drawer.paddingX, py: theme.drawer.paddingY })}>
                        <Stack sx={(theme) => ({ gap: theme.drawer.sectionGap })}>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 2 }}>
                                <DetailFact label="Order date">{formatDate(order.OrderDate)}</DetailFact>
                                <DetailFact label="Supplying stockist">{order.StockistName || "—"}</DetailFact>
                                <DetailFact label="Customer type">{order.CustomerType === "DOCTOR" ? "Doctor" : "Chemist"}</DetailFact>
                                <DetailFact label="Booked by">{order.UserName}</DetailFact>
                            </Box>

                            <DetailSection title={`Products · ${order.lines.length}`}>
                                <Stack divider={<Divider />}>
                                    {order.lines.map((line) => (
                                        <Stack key={line.LineId} direction="row" sx={{ py: 1.25, gap: 2, alignItems: "flex-start" }}>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="subtitle2">{line.ProductName}</Typography>
                                                <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                    {[
                                                        `${line.Quantity}${line.FreeQuantity ? ` + ${line.FreeQuantity} free` : ""} × ${formatAmount(line.UnitPrice)}`,
                                                        line.DiscountPercent ? `${line.DiscountPercent}% off` : null,
                                                        line.PackSize,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </Typography>
                                            </Box>
                                            <Typography variant="subtitle2">{formatAmount(line.NetAmount)}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>

                                <Stack spacing={1} sx={(theme) => ({ mt: 1.5, p: 2, borderRadius: theme.calendar.cell.radius, backgroundColor: theme.palette.surface.subtle })}>
                                    <Row label="Gross" value={formatAmount(order.GrossAmount)} />
                                    <Row label="Discount" value={`− ${formatAmount(order.DiscountAmount)}`} />
                                    <Row label="Units" value={`${order.TotalQuantity}${order.TotalFreeQuantity ? ` + ${order.TotalFreeQuantity} free` : ""}`} />
                                    <Divider />
                                    <Row label="Order value" value={formatAmount(order.NetAmount)} strong />
                                </Stack>
                            </DetailSection>

                            {(order.HasSlip || order.BookedLatitude != null) && (
                                <DetailSection title="Booked at the chemist">
                                    <Stack spacing={1.5}>
                                        {order.HasSlip && <SlipPhoto orderId={order.OrderId} />}
                                        {order.BookedLatitude != null && (
                                            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                GPS {Number(order.BookedLatitude).toFixed(5)}, {Number(order.BookedLongitude).toFixed(5)}
                                                {order.DistanceFromChemistM != null ? ` · ${order.DistanceFromChemistM} m from the chemist` : ""} · {formatStamp(order.CreatedOn)} · {order.UserName}
                                            </Typography>
                                        )}
                                    </Stack>
                                </DetailSection>
                            )}

                            <DetailSection title="Progress">
                                <Stack spacing={1}>
                                    {history.map((step) => (
                                        <Row key={step.label} label={step.label} value={formatStamp(step.at)} />
                                    ))}
                                </Stack>
                                {order.StatusRemarks && (
                                    <Typography variant="body2" sx={(theme) => ({ mt: 1.5, color: theme.palette.text.secondary })}>
                                        “{order.StatusRemarks}”
                                    </Typography>
                                )}
                            </DetailSection>

                            {order.Remarks && (
                                <DetailSection title="Remarks">
                                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                                        {order.Remarks}
                                    </Typography>
                                </DetailSection>
                            )}
                        </Stack>
                    </Box>

                    {actions.length > 0 && (
                        <>
                            <Divider />
                            <Stack direction="row" sx={(theme) => ({ justifyContent: "flex-end", gap: 1, px: theme.drawer.paddingX, py: 2, flexWrap: "wrap" })}>
                                {actions.map((action) => (
                                    <Button
                                        key={action.status}
                                        variant={action.status === "CANCELLED" ? "outlined" : "contained"}
                                        color={action.color}
                                        onClick={() => onAction(order, action)}
                                    >
                                        {action.label}
                                    </Button>
                                ))}
                            </Stack>
                        </>
                    )}
                </>
            )}
        </Drawer>
    );
}

export default OrderDrawer;
