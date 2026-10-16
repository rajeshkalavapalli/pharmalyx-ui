import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Alert, AlertTitle, Box, Button, Divider, Stack, Typography } from "@mui/material";
import {
    AddRounded,
    AltRouteRounded,
    CancelRounded,
    CheckCircleRounded,
    HourglassTopRounded,
    RefreshRounded,
} from "@mui/icons-material";

import ActingUserSelect from "../../components/ActingUserSelect/ActingUserSelect";
import useActingUser from "../../components/ActingUserSelect/useActingUser";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../components/StatCard/StatCard";
import { getDivisions } from "../Division/index";
import { getTerritories } from "../Territory/index";

import DeviationDetails from "./DeviationDetails";
import RequestDeviation from "./RequestDeviation";
import DeviationFilters from "./components/DeviationFilters";
import DeviationTable from "./components/DeviationTable";
import { getDeviations } from "./index";

const EMPTY_FILTERS = {
    month: "",
    userId: "",
    divisionId: "",
    territoryId: "",
    deviationType: "",
};

const EMPTY_SUMMARY = { total: 0, pending: 0, approved: 0, rejected: 0 };

// The API puts a friendly text in `message` and the underlying cause in `error`.
const errorMessage = (error, fallback) => {
    const data = error.response?.data;
    const message = data?.message || error.message || fallback;

    return data?.error && data.error !== message ? `${message} (${data.error})` : message;
};

function TourPlanDeviation() {
    const { actingUserId, setActingUserId, users } = useActingUser();

    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [status, setStatus] = useState("ALL");
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState(EMPTY_SUMMARY);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [divisions, setDivisions] = useState([]);
    const [territories, setTerritories] = useState([]);

    const [selectedId, setSelectedId] = useState(null);
    const [requestOpen, setRequestOpen] = useState(false);

    // =========================================================
    // REFERENCE DATA
    // =========================================================

    useEffect(() => {
        getDivisions()
            .then((response) => setDivisions(Array.isArray(response) ? response : []))
            .catch(() => setDivisions([]));

        getTerritories()
            .then((response) =>
                setTerritories(Array.isArray(response?.territories) ? response.territories : [])
            )
            .catch(() => setTerritories([]));
    }, []);

    // =========================================================
    // LOAD (filters apply automatically; status is filtered locally)
    // =========================================================

    const requestRef = useRef(0);

    const loadDeviations = useCallback(async () => {
        const requestId = ++requestRef.current;
        const isCurrent = () => requestId === requestRef.current;

        setLoading(true);
        setLoadError("");

        try {
            const params = Object.fromEntries(
                Object.entries(filters).filter(([, value]) => value)
            );
            const response = await getDeviations(params);

            if (!isCurrent()) return;

            setRows(response?.deviations || []);
            setSummary(response?.summary || EMPTY_SUMMARY);
        } catch (error) {
            if (!isCurrent()) return;

            setRows([]);
            setSummary(EMPTY_SUMMARY);
            setLoadError(errorMessage(error, "Failed to load deviations"));
        } finally {
            if (isCurrent()) setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (actingUserId) {
            loadDeviations();
        }
    }, [actingUserId, loadDeviations]);

    const handleFilterChange = (field, value) =>
        setFilters((current) => ({ ...current, [field]: value }));

    // =========================================================
    // DERIVED
    // =========================================================

    const visibleRows = useMemo(
        () => (status === "ALL" ? rows : rows.filter((row) => row.Status === status)),
        [rows, status]
    );

    const awaitingMe = rows.filter((row) => row.canReview).length;

    const statusOptions = [
        { value: "ALL", label: `All · ${summary.total}` },
        { value: "PENDING", label: `Pending · ${summary.pending}` },
        { value: "APPROVED", label: `Approved · ${summary.approved}` },
        { value: "REJECTED", label: `Rejected · ${summary.rejected}` },
    ];

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <Box>
            <PageHeader
                eyebrow="Field operations · Plan deviation"
                title="Plan deviations"
                subtitle="Track days where field work differed from the approved tour plan, and review requests from your team."
                actions={
                    <>
                        <ActingUserSelect
                            users={users}
                            value={actingUserId}
                            onChange={setActingUserId}
                        />

                        <Button
                            variant="contained"
                            startIcon={<AddRounded />}
                            disabled={!actingUserId}
                            onClick={() => setRequestOpen(true)}
                        >
                            Request deviation
                        </Button>
                    </>
                }
            />

            {!actingUserId ? (
                <Panel>
                    <Box sx={{ py: 6, textAlign: "center" }}>
                        <Typography variant="h5" component="p">
                            Choose a user to continue
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={(theme) => ({ mt: 1, color: theme.palette.text.secondary })}
                        >
                            Sign-in is not connected yet. Pick who you are acting as from the
                            header to load deviations.
                        </Typography>
                    </Box>
                </Panel>
            ) : (
                <>
                    {/* SUMMARY */}

                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "repeat(2, minmax(0, 1fr))",
                                lg: "repeat(4, minmax(0, 1fr))",
                            },
                            gap: theme.stat.gap,
                            mb: theme.pageHeader.marginBottom,
                        })}
                    >
                        <StatCard
                            icon={AltRouteRounded}
                            label="Total deviations"
                            value={summary.total}
                            caption="Matching the filters"
                            color="primary"
                        />
                        <StatCard
                            icon={HourglassTopRounded}
                            label="Pending review"
                            value={summary.pending}
                            caption={
                                awaitingMe > 0 ? `${awaitingMe} waiting for you` : "Nothing waiting for you"
                            }
                            color="warning"
                        />
                        <StatCard
                            icon={CheckCircleRounded}
                            label="Approved"
                            value={summary.approved}
                            caption="Accepted by managers"
                            color="success"
                        />
                        <StatCard
                            icon={CancelRounded}
                            label="Rejected"
                            value={summary.rejected}
                            caption="Not accepted"
                            color="error"
                        />
                    </Box>

                    {/* FILTERS + TABLE */}

                    <Panel disablePadding>
                        <Box sx={(theme) => ({ p: theme.panel.padding })}>
                            <DeviationFilters
                                filters={filters}
                                onChange={handleFilterChange}
                                onClear={() => setFilters(EMPTY_FILTERS)}
                                users={users}
                                divisions={divisions}
                                territories={territories}
                            />
                        </Box>

                        <Divider />

                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            sx={(theme) => ({
                                alignItems: { xs: "flex-start", md: "center" },
                                justifyContent: "space-between",
                                gap: theme.panel.gap,
                                px: theme.panel.padding,
                                py: theme.panel.headerPaddingY,
                            })}
                        >
                            <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                                <SegmentedControl
                                    value={status}
                                    options={statusOptions}
                                    onChange={setStatus}
                                />
                            </Box>

                            <Typography
                                variant="caption"
                                sx={(theme) => ({ color: theme.palette.text.secondary })}
                            >
                                Showing {visibleRows.length} of {rows.length}
                            </Typography>
                        </Stack>

                        {loadError ? (
                            <Box sx={(theme) => ({ px: theme.panel.padding, pb: theme.panel.padding })}>
                                <Alert
                                    severity="error"
                                    variant="outlined"
                                    action={
                                        <Button
                                            color="error"
                                            size="small"
                                            startIcon={<RefreshRounded />}
                                            onClick={loadDeviations}
                                        >
                                            Retry
                                        </Button>
                                    }
                                >
                                    <AlertTitle>Couldn't load deviations</AlertTitle>
                                    {loadError}
                                </Alert>
                            </Box>
                        ) : (
                            <DeviationTable
                                rows={visibleRows}
                                loading={loading}
                                onOpen={setSelectedId}
                            />
                        )}
                    </Panel>
                </>
            )}

            <DeviationDetails
                open={Boolean(selectedId)}
                deviationId={selectedId}
                onClose={() => setSelectedId(null)}
                onReviewed={loadDeviations}
            />

            {requestOpen && (
                <RequestDeviation
                    onClose={() => setRequestOpen(false)}
                    onCreated={loadDeviations}
                />
            )}
        </Box>
    );
}

export default TourPlanDeviation;
