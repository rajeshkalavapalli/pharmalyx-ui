import { useCallback, useEffect, useState } from "react";

import { Alert, Box, Button } from "@mui/material";
import { DownloadRounded } from "@mui/icons-material";

import LoadError from "../../../components/LoadError/LoadError";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../../components/StatCard/StatCard";
import { defaultFilters, downloadCsv, errorMessage } from "../index";
import ReportFilters from "./ReportFilters";
import ReportTable from "./ReportTable";
import useReportOptions from "./useReportOptions";

// Shared shell for report pages: header with CSV download, filters, KPI cards,
// optional charts, and tabbed tables. Each tab's columns drive both table and CSV.
//
// kpis(data)   -> [{ icon, label, value, caption, color, progress }]
// charts(data) -> node
// tabs(data)   -> [{ value, label, title, subtitle, columns, rows, rowKey, empty, fileName }]
// note(data)   -> optional text shown above the tables
function ReportPage({ eyebrow = "Reports & analytics", title, subtitle, load, showProduct = false, kpis, charts, tabs, note }) {
    const options = useReportOptions();

    const [filters, setFilters] = useState(defaultFilters);
    const [tab, setTab] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchReport = useCallback(async () => {
        if (!filters.from || !filters.to || filters.from > filters.to) return;

        setLoading(true);
        setError("");

        try {
            setData(await load(filters));
        } catch (err) {
            setData(null);
            setError(errorMessage(err, `Failed to load the ${title.toLowerCase()}`));
        } finally {
            setLoading(false);
        }
    }, [filters, load, title]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const tabList = data ? tabs(data).filter(Boolean) : [];
    const active = tabList.find((item) => item.value === tab) || tabList[0];
    const cards = data ? kpis(data) : [];
    const noteText = data && note ? note(data) : null;

    const handleExport = () => {
        if (!active) return;
        downloadCsv(
            `${active.fileName}-${filters.from}-to-${filters.to}.csv`,
            active.columns.map((column) => ({ label: column.label, value: column.csv })),
            active.rows
        );
    };

    return (
        <Box>
            <PageHeader
                eyebrow={eyebrow}
                title={title}
                subtitle={subtitle}
                actions={
                    <Button variant="outlined" startIcon={<DownloadRounded />} onClick={handleExport} disabled={!active || loading}>
                        Download CSV
                    </Button>
                }
            />

            <ReportFilters filters={filters} onChange={setFilters} options={options} showProduct={showProduct} />

            {error ? (
                <LoadError title={`Couldn't load the ${title.toLowerCase()}`} message={error} onRetry={fetchReport} />
            ) : (
                <Box sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1, transition: theme.calendar.transition })}>
                    {cards.length > 0 && (
                        <Box
                            sx={(theme) => ({
                                display: "grid",
                                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: `repeat(${Math.min(cards.length, 4)}, minmax(0, 1fr))` },
                                gap: theme.stat.gap,
                                mb: theme.stat.gap,
                            })}
                        >
                            {cards.map((card) => (
                                <StatCard key={card.label} {...card} />
                            ))}
                        </Box>
                    )}

                    {data && charts && <Box sx={(theme) => ({ mb: theme.stat.gap })}>{charts(data)}</Box>}

                    {noteText && (
                        <Alert severity="info" variant="outlined" sx={(theme) => ({ mb: theme.stat.gap })}>
                            {noteText}
                        </Alert>
                    )}

                    {active && (
                        <Panel
                            title={active.title}
                            subtitle={active.subtitle}
                            actions={tabList.length > 1 && <SegmentedControl value={active.value} onChange={setTab} options={tabList.map(({ value, label }) => ({ value, label }))} />}
                            disablePadding
                        >
                            <ReportTable
                                columns={active.columns.filter((column) => !column.csvOnly)}
                                rows={active.rows}
                                rowKey={active.rowKey}
                                empty={active.empty}
                            />
                        </Panel>
                    )}
                </Box>
            )}
        </Box>
    );
}

export default ReportPage;
