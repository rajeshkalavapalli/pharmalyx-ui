import { useCallback, useEffect, useState } from "react";

import { Box, Button } from "@mui/material";
import { FactCheckRounded } from "@mui/icons-material";

import PageHeader from "../../components/PageHeader/PageHeader";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { errorMessage, getProducts, getStockists, runChecks } from "./index";
import RecordsTab from "./data/RecordsTab";
import { BatchesTab, PeopleTab, StockistsTab, TargetsTab } from "./data/SetupTabs";

const TABS = [
    { value: "dispatches", label: "Dispatch" },
    { value: "returns", label: "Returns & expiry" },
    { value: "batches", label: "Batches" },
    { value: "stockists", label: "Stockists" },
    { value: "people", label: "People & salary" },
    { value: "targets", label: "Milestones & incentive" },
];

// Head office data that business tracking is built on. Managers can't edit any of this.
function BusinessData() {
    const { showSnackbar } = useSnackbar();
    const [tab, setTab] = useState("dispatches");
    const [products, setProducts] = useState([]);
    const [stockists, setStockists] = useState({ stockists: [], territories: [] });
    const [busy, setBusy] = useState(false);

    const loadStockists = useCallback(() => {
        getStockists()
            .then(setStockists)
            .catch(() => {});
    }, []);

    useEffect(() => {
        getProducts()
            .then((result) => setProducts(result.products || []))
            .catch(() => {});
        loadStockists();
    }, [loadStockists]);

    return (
        <Box>
            <PageHeader
                eyebrow="Sales & distribution · Head office"
                title="Business data"
                subtitle="Dispatch, returns and expiry, batches, stockist territories, salaries, ramp-up milestones and incentive slabs. Every change is logged."
                actions={
                    <Button
                        variant="outlined"
                        startIcon={<FactCheckRounded />}
                        disabled={busy}
                        onClick={async () => {
                            setBusy(true);
                            try {
                                showSnackbar((await runChecks()).message, "success");
                            } catch (err) {
                                showSnackbar(errorMessage(err, "Checks failed"), "error");
                            } finally {
                                setBusy(false);
                            }
                        }}
                    >
                        Run order checks now
                    </Button>
                }
            />
            <Box sx={(theme) => ({ mb: theme.stat.gap, overflowX: "auto" })}>
                <SegmentedControl value={tab} onChange={setTab} options={TABS} />
            </Box>

            {(tab === "dispatches" || tab === "returns") && <RecordsTab key={tab} kind={tab} stockists={stockists.stockists} territories={stockists.territories} products={products} />}
            {tab === "batches" && <BatchesTab products={products} />}
            {tab === "stockists" && <StockistsTab stockists={stockists.stockists} territories={stockists.territories} onChanged={loadStockists} />}
            {tab === "people" && <PeopleTab />}
            {tab === "targets" && <TargetsTab />}
        </Box>
    );
}

export default BusinessData;
