import { useEffect, useState } from "react";

import { Box, Button, Stack } from "@mui/material";
import { LocalShippingRounded, PaymentsRounded } from "@mui/icons-material";

import PageHeader from "../../components/PageHeader/PageHeader";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import DeliveryDialog from "./DeliveryDialog";
import DepositsTab from "./DepositsTab";
import DuesTab from "./DuesTab";
import ExitTab from "./ExitTab";
import HoldingsTab from "./HoldingsTab";
import PaymentDialog from "./PaymentDialog";
import SchemesTab from "./SchemesTab";
import StockTab from "./StockTab";
import { getMyPermissions } from "./index";

const BASE_TABS = [
    { value: "stock", label: "Stock in hand" },
    { value: "dues", label: "Chemist dues" },
];
const HO_TABS = [
    { value: "holdings", label: "Stock with MRs" },
    { value: "deposits", label: "Payments to confirm" },
    { value: "schemes", label: "Schemes & prices" },
    { value: "exits", label: "Exit clearance" },
];

// Company stock with MRs, direct supply to chemists, chemist dues and exit clearance.
// MRs record deliveries and payments; managers view; only head office issues, approves and closes.
function FieldLedger() {
    const { showSnackbar } = useSnackbar();
    const [perms, setPerms] = useState(new Set());
    const [tab, setTab] = useState("stock");
    const [dialog, setDialog] = useState(null);
    const [paymentFor, setPaymentFor] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        getMyPermissions()
            .then(setPerms)
            .catch(() => {});
    }, []);

    const headOffice = perms.has("ledger.approve");
    const canRecord = perms.has("ledger.create");
    const tabs = headOffice ? [...BASE_TABS, ...HO_TABS] : BASE_TABS;
    const refresh = () => setRefreshKey((k) => k + 1);

    const saved = (message) => {
        showSnackbar(message, "success");
        setDialog(null);
        refresh();
    };

    return (
        <Box>
            <PageHeader
                eyebrow="Sales & distribution · Field stock & dues"
                title="Field stock & dues"
                subtitle="Company stock given to MRs, direct supply to chemists with stamped receipts, chemist dues and payments. Everything is in the company's name."
                actions={
                    canRecord && (
                        <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                            <Button
                                variant="outlined"
                                startIcon={<PaymentsRounded />}
                                onClick={() => {
                                    setPaymentFor("");
                                    setDialog("payment");
                                }}
                            >
                                Record payment
                            </Button>
                            <Button variant="contained" startIcon={<LocalShippingRounded />} onClick={() => setDialog("delivery")}>
                                Deliver stock
                            </Button>
                        </Stack>
                    )
                }
            />
            <Box sx={(theme) => ({ mb: theme.stat.gap, overflowX: "auto" })}>
                <SegmentedControl value={tab} onChange={setTab} options={tabs} />
            </Box>

            {tab === "stock" && <StockTab headOffice={headOffice} refreshKey={refreshKey} />}
            {tab === "dues" && (
                <DuesTab
                    canCollect={canRecord}
                    refreshKey={refreshKey}
                    onChanged={refresh}
                    onCollect={(id) => {
                        setPaymentFor(id);
                        setDialog("payment");
                    }}
                />
            )}
            {headOffice && tab === "holdings" && <HoldingsTab onChanged={refresh} />}
            {headOffice && tab === "deposits" && <DepositsTab onChanged={refresh} />}
            {headOffice && tab === "schemes" && <SchemesTab />}
            {headOffice && tab === "exits" && <ExitTab />}

            <DeliveryDialog open={dialog === "delivery"} onClose={() => setDialog(null)} onSaved={saved} />
            <PaymentDialog open={dialog === "payment"} pharmacyId={paymentFor} onClose={() => setDialog(null)} onSaved={saved} />
        </Box>
    );
}

export default FieldLedger;
