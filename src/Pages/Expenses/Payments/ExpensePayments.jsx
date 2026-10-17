import { useCallback, useEffect, useState } from "react";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { PaymentsRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import StatusChip from "../../../components/StatusChip/StatusChip";
import ClaimDialog from "../components/ClaimDialog";
import { CLAIM_STATUS, errorMessage, formatAmount, formatDate, formatMonthLabel, getFinanceClaims } from "../index";

const TABS = [
    { value: "MANAGER_APPROVED", label: "Awaiting approval", empty: "No manager-approved claims are waiting." },
    { value: "APPROVED", label: "To be paid", empty: "No approved claims are waiting for payment." },
    { value: "PAID", label: "Paid", empty: "No claims have been paid yet." },
];

// Finance: final approval of manager-approved claims and recording payment.
function ExpensePayments() {
    const [status, setStatus] = useState("MANAGER_APPROVED");
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [openId, setOpenId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            setClaims((await getFinanceClaims(status)).claims || []);
        } catch (err) {
            setClaims([]);
            setError(errorMessage(err, "Failed to load claims"));
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        load();
    }, [load]);

    const tab = TABS.find((item) => item.value === status);
    const total = claims.reduce((sum, claim) => sum + Math.round((claim.ApprovedAmount ?? claim.ClaimedAmount) * 100), 0) / 100;

    return (
        <Box>
            <PageHeader
                eyebrow="Expenses · Payments"
                title="Expense payments"
                subtitle="Give final approval to claims the managers have approved, then record the payment reference once paid."
                actions={<SegmentedControl value={status} onChange={setStatus} options={TABS.map((item) => ({ value: item.value, label: item.label }))} />}
            />

            {error ? (
                <LoadError title="Couldn't load claims" message={error} onRetry={load} />
            ) : (
                <Panel title={tab.label} subtitle={`${claims.length} claim(s) · ${formatAmount(total)}`} sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}>
                    {claims.length ? (
                        <Stack divider={<Divider />}>
                            {claims.map((claim) => (
                                <Stack key={claim.ClaimId} direction={{ xs: "column", sm: "row" }} sx={{ py: 1.5, gap: 1.5, alignItems: { sm: "center" } }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="subtitle2">
                                            {claim.UserName}
                                            {claim.DesignationName ? ` · ${claim.DesignationName}` : ""} · {formatMonthLabel(claim.ClaimMonth)}
                                        </Typography>
                                        <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            {claim.Status === "PAID"
                                                ? `Paid ${formatDate(claim.PaidOn)} · ${claim.PaymentRef}`
                                                : `Claimed ${formatAmount(claim.ClaimedAmount)}${claim.ManagerReviewedByName ? ` · approved by ${claim.ManagerReviewedByName}` : ""}`}
                                        </Typography>
                                    </Box>
                                    <StatusChip label={CLAIM_STATUS[claim.Status].label} color={CLAIM_STATUS[claim.Status].color} />
                                    <Typography variant="subtitle2" sx={(theme) => ({ minWidth: theme.engagement.quantityColumn, textAlign: { sm: "right" } })}>
                                        {formatAmount(claim.ApprovedAmount ?? claim.ClaimedAmount)}
                                    </Typography>
                                    <Button variant={claim.Status === "PAID" ? "outlined" : "contained"} size="small" onClick={() => setOpenId(claim.ClaimId)}>
                                        {claim.Status === "PAID" ? "View" : "Open"}
                                    </Button>
                                </Stack>
                            ))}
                        </Stack>
                    ) : (
                        <EmptyState icon={PaymentsRounded} title={loading ? "Loading…" : "Nothing here"} message={loading ? "" : tab.empty} />
                    )}
                </Panel>
            )}

            {openId && (
                <ClaimDialog
                    claimId={openId}
                    onClose={() => setOpenId(null)}
                    onDone={() => {
                        setOpenId(null);
                        load();
                    }}
                />
            )}
        </Box>
    );
}

export default ExpensePayments;
