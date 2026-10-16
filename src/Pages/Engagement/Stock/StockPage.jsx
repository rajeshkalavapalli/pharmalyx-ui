import { useCallback, useEffect, useMemo, useState } from "react";

import {
    Box,
    Button,
    LinearProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import {
    AddRounded,
    CardGiftcardRounded,
    HistoryRounded,
    Inventory2Rounded,
    LocalShippingRounded,
    MedicationRounded,
    UndoRounded,
    WarningAmberRounded,
} from "@mui/icons-material";

import ActingUserSelect from "../../../components/ActingUserSelect/ActingUserSelect";
import useActingUser from "../../../components/ActingUserSelect/useActingUser";
import EmptyState from "../../../components/EmptyState/EmptyState";
import LoadError from "../../../components/LoadError/LoadError";
import PageHeader from "../../../components/PageHeader/PageHeader";
import Panel from "../../../components/Panel/Panel";
import StatCard from "../../../components/StatCard/StatCard";
import Tag from "../../../components/Tag/Tag";
import TeamViewSelect, { useTeamView } from "../../../components/TeamViewSelect/TeamViewSelect";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import {
    ENTRY_TYPE,
    ITEM_TYPE,
    LOW_STOCK_THRESHOLD,
    cacheBalances,
    errorMessage,
    formatDate,
    getStockBalances,
    getStockLedger,
    issueStock,
    monthKey,
    returnStock,
} from "../index";
import { IssueStockDialog, ReturnStockDialog } from "./StockDialogs";

const PAGE = {
    SAMPLE: {
        icon: MedicationRounded,
        eyebrow: "Doctor engagement · Samples",
        subtitle: "Product samples you hold, what you've given doctors, and what's been issued to you.",
    },
    GIFT: {
        icon: CardGiftcardRounded,
        eyebrow: "Doctor engagement · Gifts",
        subtitle: "Gifts you hold for doctors, distribution history and stock received.",
    },
};

// Samples and Gifts share this page; `itemType` is SAMPLE or GIFT.
function StockPage({ itemType }) {
    const { showSnackbar } = useSnackbar();
    const { actingUserId, setActingUserId, users } = useActingUser();
    const { team, reports, viewUserId, setViewUserId, viewing, viewingSelf, isManager } = useTeamView(actingUserId);

    const config = ITEM_TYPE[itemType];
    const page = PAGE[itemType];

    const [balances, setBalances] = useState([]);
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dialog, setDialog] = useState(null); // { type: 'issue' } | { type: 'return', item }
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        if (!viewUserId) return;

        setLoading(true);
        setError("");

        try {
            const [balanceResponse, ledgerResponse] = await Promise.all([
                getStockBalances(viewUserId, itemType),
                getStockLedger(viewUserId, itemType),
            ]);

            const rows = balanceResponse?.balances || [];
            setBalances(rows);
            setLedger(ledgerResponse?.ledger || []);

            if (viewUserId === actingUserId) cacheBalances(actingUserId, rows);
        } catch (err) {
            setBalances([]);
            setLedger([]);
            setError(errorMessage(err, "Failed to load stock"));
        } finally {
            setLoading(false);
        }
    }, [viewUserId, itemType, actingUserId]);

    useEffect(() => {
        load();
    }, [load]);

    const stats = useMemo(() => {
        const held = balances.filter((row) => row.Balance > 0);

        return {
            inHand: held.reduce((sum, row) => sum + row.Balance, 0),
            items: held.length,
            givenThisMonth: balances.reduce((sum, row) => sum + row.GivenThisMonth, 0),
            low: held.filter((row) => row.Balance <= LOW_STOCK_THRESHOLD).length,
            doctorsThisMonth: new Set(
                ledger
                    .filter((entry) => entry.EntryType === "DISTRIBUTION" && entry.EntryDate >= `${monthKey()}-01`)
                    .map((entry) => entry.DoctorId)
            ).size,
        };
    }, [balances, ledger]);

    const run = async (action, fallback) => {
        setSaving(true);

        try {
            const response = await action();
            showSnackbar(response?.message || fallback, "success");
            setDialog(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Action failed"), "error");
        } finally {
            setSaving(false);
        }
    };

    const title = viewing && !viewing.IsSelf ? `${viewing.Name}'s ${config.plural.toLowerCase()}` : config.plural;

    return (
        <Box>
            <PageHeader
                eyebrow={page.eyebrow}
                title={title}
                subtitle={page.subtitle}
                actions={
                    <>
                        <ActingUserSelect users={users} value={actingUserId} onChange={setActingUserId} />
                        <TeamViewSelect team={team} value={viewUserId} onChange={setViewUserId} />
                        {isManager && (
                            <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialog({ type: "issue" })}>
                                Issue {config.plural.toLowerCase()}
                            </Button>
                        )}
                    </>
                }
            />

            {!actingUserId ? (
                <Panel>
                    <EmptyState icon={page.icon} title="Choose a user to continue" message="Pick who you are acting as from the header." />
                </Panel>
            ) : (
                <>
                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                            gap: theme.stat.gap,
                            mb: theme.pageHeader.marginBottom,
                        })}
                    >
                        <StatCard icon={Inventory2Rounded} label="In hand" value={stats.inHand} caption={`${stats.items} item(s) held`} color="primary" />
                        <StatCard icon={LocalShippingRounded} label="Given this month" value={stats.givenThisMonth} caption={`${stats.doctorsThisMonth} doctor(s) reached`} color="success" />
                        <StatCard icon={WarningAmberRounded} label="Running low" value={stats.low} caption={`${LOW_STOCK_THRESHOLD} or fewer left`} color={stats.low ? "warning" : "info"} />
                        <StatCard icon={HistoryRounded} label="Movements" value={ledger.length} caption="This year" color="info" />
                    </Box>

                    {error ? (
                        <LoadError title="Couldn't load stock" message={error} onRetry={load} />
                    ) : (
                        <Stack spacing={2} sx={(theme) => ({ opacity: loading ? theme.table.loadingOpacity : 1 })}>
                            <Panel title="Current stock" subtitle={`What ${viewingSelf ? "you hold" : "they hold"} right now`} disablePadding>
                                {balances.length === 0 ? (
                                    <EmptyState
                                        icon={page.icon}
                                        title={loading ? "Loading…" : `No ${config.plural.toLowerCase()} yet`}
                                        message={loading ? "" : isManager ? "Issue stock to a team member to get started." : "Your manager issues stock to you; it will appear here."}
                                    />
                                ) : (
                                    <Box sx={{ overflowX: "auto" }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>{config.label}</TableCell>
                                                    <TableCell>In hand</TableCell>
                                                    <TableCell>Given / received</TableCell>
                                                    <TableCell>Last received</TableCell>
                                                    {viewingSelf && <TableCell align="right" />}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {balances.map((row) => {
                                                    const low = row.Balance > 0 && row.Balance <= LOW_STOCK_THRESHOLD;
                                                    const used = row.TotalIssued ? (row.TotalGiven / row.TotalIssued) * 100 : 0;

                                                    return (
                                                        <TableRow key={row.ItemId} hover>
                                                            <TableCell>
                                                                <Typography variant="subtitle2">{row.ItemName}</Typography>
                                                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                    {row.ItemDetail || "—"}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                                    <Typography variant="subtitle1">{row.Balance}</Typography>
                                                                    {low && <Tag label="Low" color="warning" />}
                                                                    {row.Balance === 0 && <Tag label="Out" color="error" />}
                                                                </Stack>
                                                            </TableCell>
                                                            <TableCell sx={(theme) => ({ minWidth: theme.spacing(22) })}>
                                                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                    {row.TotalGiven} of {row.TotalIssued} given
                                                                </Typography>
                                                                <LinearProgress variant="determinate" value={Math.min(100, used)} sx={(theme) => ({ mt: 0.5, height: theme.stat.progressHeight })} />
                                                            </TableCell>
                                                            <TableCell>{formatDate(row.LastIssuedOn)}</TableCell>
                                                            {viewingSelf && (
                                                                <TableCell align="right">
                                                                    <Button
                                                                        size="small"
                                                                        startIcon={<UndoRounded />}
                                                                        disabled={row.Balance <= 0}
                                                                        onClick={() => setDialog({ type: "return", item: row })}
                                                                    >
                                                                        Return
                                                                    </Button>
                                                                </TableCell>
                                                            )}
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                )}
                            </Panel>

                            <Panel title="History" subtitle="Received, given to doctors and returned" disablePadding>
                                {ledger.length === 0 ? (
                                    <EmptyState icon={HistoryRounded} title="No movements yet" />
                                ) : (
                                    <Box sx={{ overflowX: "auto" }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>{config.label}</TableCell>
                                                    <TableCell>Movement</TableCell>
                                                    <TableCell align="right">Qty</TableCell>
                                                    <TableCell>Details</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {ledger.map((entry) => {
                                                    const type = ENTRY_TYPE[entry.EntryType];

                                                    return (
                                                        <TableRow key={entry.EntryId} hover>
                                                            <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(entry.EntryDate)}</TableCell>
                                                            <TableCell>{entry.ItemName}</TableCell>
                                                            <TableCell>
                                                                <Tag label={type.label} color={type.color} />
                                                            </TableCell>
                                                            <TableCell
                                                                align="right"
                                                                sx={(theme) => ({
                                                                    fontVariantNumeric: "tabular-nums",
                                                                    fontWeight: theme.typography.subtitle2.fontWeight,
                                                                    color: entry.Quantity > 0 ? theme.palette.success.dark : theme.palette.text.primary,
                                                                })}
                                                            >
                                                                {entry.Quantity > 0 ? `+${entry.Quantity}` : entry.Quantity}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {entry.DoctorName ? `Dr. ${entry.DoctorName}` : entry.Remarks || "—"}
                                                                </Typography>
                                                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                                    {[entry.BatchNumber && `Batch ${entry.BatchNumber}`, entry.EntryType === "ISSUE" && `By ${entry.CreatedByName}`]
                                                                        .filter(Boolean)
                                                                        .join(" · ")}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                )}
                            </Panel>
                        </Stack>
                    )}
                </>
            )}

            {dialog?.type === "issue" && (
                <IssueStockDialog
                    itemType={itemType}
                    reports={reports}
                    defaultUserId={viewingSelf ? "" : viewUserId}
                    saving={saving}
                    onClose={() => setDialog(null)}
                    onSave={(payload) => run(() => issueStock(payload), "Stock issued")}
                />
            )}

            {dialog?.type === "return" && (
                <ReturnStockDialog
                    item={dialog.item}
                    saving={saving}
                    onClose={() => setDialog(null)}
                    onSave={(payload) => run(() => returnStock(payload), "Stock returned")}
                />
            )}
        </Box>
    );
}

export default StockPage;
