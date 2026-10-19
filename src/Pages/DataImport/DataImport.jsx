import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Button, Divider, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ArrowForwardRounded, CloudUploadRounded, FileDownloadRounded, HistoryRounded, PlaylistRemoveRounded, UndoRounded } from "@mui/icons-material";

import ConfirmActionDialog from "../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../components/EmptyState/EmptyState";
import LoadError from "../../components/LoadError/LoadError";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import StatusChip from "../../components/StatusChip/StatusChip";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import UploadDialog from "./UploadDialog";
import { BATCH_STATUS, downloadIssues, downloadTemplate, errorMessage, formatDate, getCatalogue, undoBatch } from "./index";

function StepBadge({ order, done }) {
    return (
        <Box
            aria-hidden
            sx={(theme) => ({
                width: theme.dataImport.stepBadgeSize,
                height: theme.dataImport.stepBadgeSize,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: theme.statusChip.radius,
                ...theme.typography.subtitle2,
                color: done ? theme.palette.success.main : theme.palette.primary.main,
                backgroundColor: alpha(done ? theme.palette.success.main : theme.palette.primary.main, theme.tint.soft),
            })}
        >
            {order}
        </Box>
    );
}

function TypeRow({ type, labels, recommended, onImport, onTemplate }) {
    const done = type.importedBatches > 0;

    return (
        <Stack direction={{ xs: "column", md: "row" }} sx={{ py: 2, gap: 2, alignItems: { md: "center" } }}>
            <Stack direction="row" spacing={1.75} sx={{ flex: 1, minWidth: 0, alignItems: "flex-start" }}>
                <StepBadge order={type.order} done={done} />
                <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
                        <Typography variant="subtitle1">{type.label}</Typography>
                        {done ? <Tag label={`${type.importedRows} imported`} color="success" /> : recommended && <Tag label="Next" color="primary" />}
                    </Stack>
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        {type.description}
                    </Typography>
                    {type.dependsOn.length > 0 && (
                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.disabled })}>
                            Uses {type.dependsOn.map((d) => labels[d]).join(" and ")} already in Pharmalyx
                        </Typography>
                    )}
                </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ pl: { xs: 6, md: 0 } }}>
                <Button size="small" startIcon={<FileDownloadRounded />} onClick={onTemplate}>
                    Template
                </Button>
                <Button size="small" variant={recommended ? "contained" : "outlined"} startIcon={<CloudUploadRounded />} onClick={onImport}>
                    Import file
                </Button>
            </Stack>
        </Stack>
    );
}

const resultText = (batch) => {
    const s = batch.Summary || {};
    if (batch.Status === "IMPORTED" || batch.Status === "UNDONE") return [s.created && `${s.created} new`, s.updated && `${s.updated} updated`, s.skipped && `${s.skipped} skipped`].filter(Boolean).join(" · ") || "—";
    if (batch.Status === "CHECKED") return [`${s.ready + s.warnings || 0} ready`, s.errors && `${s.errors} with errors`].filter(Boolean).join(" · ");
    return "—";
};

function HistoryTable({ history, labels, onContinue, onUndo, onIssues }) {
    if (!history.length) {
        return <EmptyState icon={HistoryRounded} title="No imports yet" message="Files you upload appear here, with what each one created and the option to undo it." />;
    }

    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>File</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Rows</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>By</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history.map((batch) => {
                        const status = BATCH_STATUS[batch.Status] || BATCH_STATUS.UPLOADED;
                        const hasIssues = (batch.Summary?.errors || 0) + (batch.Summary?.warnings || 0) > 0;
                        return (
                            <TableRow key={batch.BatchId} hover>
                                <TableCell sx={(theme) => ({ maxWidth: theme.table.textMaxWidth })}>
                                    <Typography variant="body2" noWrap title={batch.FileName}>
                                        {batch.FileName}
                                    </Typography>
                                    {batch.SourceSystem && (
                                        <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            from {batch.SourceSystem}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>{labels[batch.EntityType]}</TableCell>
                                <TableCell>
                                    <StatusChip label={status.label} color={status.color} />
                                </TableCell>
                                <TableCell align="right">{batch.TotalRows}</TableCell>
                                <TableCell>{resultText(batch)}</TableCell>
                                <TableCell>{batch.CreatedByName || "—"}</TableCell>
                                <TableCell>{formatDate(batch.ImportedOn || batch.CreatedOn)}</TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                                        {hasIssues && (
                                            <Tooltip title="Download rows to fix">
                                                <IconButton size="small" aria-label="Download rows to fix" onClick={() => onIssues(batch)}>
                                                    <PlaylistRemoveRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {(batch.Status === "UPLOADED" || batch.Status === "CHECKED") && (
                                            <Button size="small" endIcon={<ArrowForwardRounded />} onClick={() => onContinue(batch)}>
                                                Continue
                                            </Button>
                                        )}
                                        {batch.Status === "IMPORTED" && (
                                            <Button size="small" color="error" startIcon={<UndoRounded />} onClick={() => onUndo(batch)}>
                                                Undo
                                            </Button>
                                        )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

// Administration > Data import: the guided order, and every import so far.
function DataImport() {
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const [catalogue, setCatalogue] = useState(null);
    const [error, setError] = useState("");
    const [uploadFor, setUploadFor] = useState(null);
    const [undoing, setUndoing] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setError("");
        try {
            setCatalogue(await getCatalogue());
        } catch (err) {
            setError(errorMessage(err, "Failed to load imports"));
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const labels = Object.fromEntries((catalogue?.types || []).map((t) => [t.type, t.label]));
    const nextType = catalogue?.types.find((t) => t.importedBatches === 0)?.type;

    const undo = async () => {
        setBusy(true);
        try {
            await undoBatch(undoing.BatchId);
            showSnackbar("Import undone", "success");
            setUndoing(null);
            load();
        } catch (err) {
            showSnackbar(errorMessage(err, "Couldn't undo the import"), "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Box>
            <PageHeader
                eyebrow="Administration"
                title="Data import"
                subtitle="Bring your company's data over from your previous MR app. Import in this order: later lists refer to the earlier ones."
            />

            {error ? (
                <LoadError title="Couldn't load imports" message={error} onRetry={load} />
            ) : (
                catalogue && (
                    <Stack spacing={2}>
                        <Panel title="What to import" subtitle="Upload your old app's export as it is; you match its columns in the next step.">
                            <Stack divider={<Divider />}>
                                {catalogue.types.map((type) => (
                                    <TypeRow
                                        key={type.type}
                                        type={type}
                                        labels={labels}
                                        recommended={type.type === nextType}
                                        onImport={() => setUploadFor(type)}
                                        onTemplate={() => downloadTemplate(type.type).catch(() => showSnackbar("Couldn't download the template", "error"))}
                                    />
                                ))}
                            </Stack>
                        </Panel>

                        <Panel title="Import history" subtitle="Undo removes what an import created and puts updated records back, as long as nothing uses them yet." disablePadding>
                            <HistoryTable
                                history={catalogue.history}
                                labels={labels}
                                onContinue={(batch) => navigate(`/admin/data-import/${batch.BatchId}`)}
                                onUndo={setUndoing}
                                onIssues={(batch) => downloadIssues(batch.BatchId).catch(() => showSnackbar("Couldn't download the rows", "error"))}
                            />
                        </Panel>
                    </Stack>
                )
            )}

            {uploadFor && (
                <UploadDialog
                    type={uploadFor}
                    onClose={() => setUploadFor(null)}
                    onUploaded={(batch) => navigate(`/admin/data-import/${batch.batchId}`)}
                />
            )}

            {undoing && (
                <ConfirmActionDialog
                    icon={UndoRounded}
                    color="error"
                    title={`Undo "${undoing.FileName}"?`}
                    message="Records this import created are removed and records it updated go back to how they were. This only works while nothing (visits, orders, mappings) uses them yet."
                    confirmLabel="Undo import"
                    busy={busy}
                    onClose={() => setUndoing(null)}
                    onConfirm={undo}
                />
            )}
        </Box>
    );
}

export default DataImport;
