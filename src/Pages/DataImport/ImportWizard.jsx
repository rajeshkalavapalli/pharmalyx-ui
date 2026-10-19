import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Autocomplete,
    Box,
    Button,
    Divider,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import {
    AddCircleRounded,
    ArrowBackRounded,
    CheckCircleRounded,
    ErrorRounded,
    FactCheckRounded,
    FileDownloadRounded,
    PublishRounded,
    RefreshRounded,
    SkipNextRounded,
    SyncRounded,
    UndoRounded,
} from "@mui/icons-material";

import ConfirmActionDialog from "../../components/ConfirmActionDialog/ConfirmActionDialog";
import EmptyState from "../../components/EmptyState/EmptyState";
import LoadError from "../../components/LoadError/LoadError";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../components/StatCard/StatCard";
import StatusChip from "../../components/StatusChip/StatusChip";
import Tag from "../../components/Tag/Tag";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import { ACTION_LABEL, ROW_STATUS, cancelBatch, checkBatch, commitBatch, downloadIssues, errorMessage, getBatch, retypeBatch, rowTitle, undoBatch } from "./index";

const TYPE_LABEL = { TERRITORY: "territories", AREA: "areas", USER: "users", DOCTOR: "doctors", CHEMIST: "chemists", STOCKIST: "stockists", STATEMENT: "a stockist statement" };

const sampleOf = (sample, header) =>
    header
        ? sample
              .map((row) => row[header])
              .filter((value) => value !== "" && value != null)
              .slice(0, 3)
              .map((value) => (String(value).includes("T00:00:00") ? String(value).slice(0, 10) : String(value)))
              .join(" · ")
        : "";

// ---------------------------------------------------------
// Step 1: match the file's columns to Pharmalyx fields
// ---------------------------------------------------------

// Fields that can take one typed value for every row.
const DEFAULTABLE = new Set(["ref", "enum", "text", "active", "int", "month"]);
const DEFAULT_HINT = { territory: "e.g. Tirupati", area: "e.g. Chittoor", state: "e.g. Andhra Pradesh", category: "A, B or C", active: "Yes or No", stockist: "e.g. Swastik Agencies", month: "e.g. 2023-02" };

// What a stock & sales statement's letterhead says, in one line.
const statementFacts = (detected) =>
    [
        detected.from && `From ${detected.from}`,
        detected.town && detected.state && `${detected.town}, ${detected.state}`,
        detected.gstin && `GSTIN ${detected.gstin}`,
        detected.period && `Period ${detected.period}`,
        `${detected.products} product ${detected.products === 1 ? "row" : "rows"}`,
    ]
        .filter(Boolean)
        .join(" · ");

function ColumnStep({ batch, busy, onCheck, onCancel, onRetype }) {
    const [columnMap, setColumnMap] = useState(batch.columnMap || {});
    const [defaults, setDefaults] = useState(batch.options?.defaults || {});
    const [source, setSource] = useState(batch.sourceSystem || "");

    const used = new Set(Object.values(columnMap).filter(Boolean));
    const unused = batch.headers.filter((h) => !used.has(h));
    const given = (key) => Boolean(columnMap[key] || String(defaults[key] || "").trim());
    // Territory and area stand in for each other.
    const missing = batch.fields.filter((f) => f.required && !given(f.key) && !(f.requiredUnless && given(f.requiredUnless)));

    const detected = batch.detected;
    if (detected?.kind === "STOCK_STATEMENT" && batch.entityType !== "STATEMENT") {
        return (
            <Panel>
                <EmptyState
                    icon={FactCheckRounded}
                    title="This file is a stock & sales statement, not a list"
                    message={`${statementFacts(detected)}. It holds one stockist's monthly opening, purchases, sales and closing stock per product. Import it as a stockist statement: the stockist and any new products are created from it, and the stock becomes that month's secondary sales.`}
                    action={
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
                            <Button onClick={onCancel} disabled={busy}>
                                Cancel
                            </Button>
                            <Button variant="contained" startIcon={<FactCheckRounded />} onClick={() => onRetype("STATEMENT")} disabled={busy}>
                                Import as stockist statement
                            </Button>
                        </Stack>
                    }
                />
            </Panel>
        );
    }

    return (
        <Panel
            title="Match your columns"
            subtitle={
                detected?.kind === "STOCK_STATEMENT"
                    ? `${statementFacts(detected)}. The stockist, month and place below were read from the statement; change them if they're wrong.`
                    : `${batch.totalRows} rows in ${batch.fileName}. We've matched what we could; check each field and fix any that are wrong.`
            }
            disablePadding
        >
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={(theme) => ({ width: theme.dataImport.fieldColumnWidth })}>Pharmalyx field</TableCell>
                            <TableCell>Column in your file</TableCell>
                            <TableCell>Sample values</TableCell>
                            <TableCell>Value for every row (when blank)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {batch.fields.map((field) => {
                            const header = columnMap[field.key] || "";
                            return (
                                <TableRow key={field.key}>
                                    <TableCell>
                                        <Stack direction="row" sx={{ gap: 0.75, alignItems: "center" }}>
                                            <Typography variant="body2" sx={{ fontWeight: "fontWeightMedium" }}>
                                                {field.label}
                                            </Typography>
                                            {field.required && (
                                                <Tag
                                                    label={field.requiredUnless ? `Required, or ${batch.fields.find((f) => f.key === field.requiredUnless)?.label}` : "Required"}
                                                    color={missing.includes(field) ? "error" : "secondary"}
                                                />
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            select
                                            size="small"
                                            value={header}
                                            error={missing.includes(field)}
                                            onChange={(event) => setColumnMap((current) => ({ ...current, [field.key]: event.target.value || null }))}
                                            sx={(theme) => ({ width: theme.dataImport.selectWidth, maxWidth: "100%" })}
                                            slotProps={{ htmlInput: { "aria-label": `Column for ${field.label}` } }}
                                        >
                                            <MenuItem value="">
                                                <em>Not in this file</em>
                                            </MenuItem>
                                            {batch.headers.map((h) => (
                                                <MenuItem key={h} value={h} disabled={used.has(h) && h !== header}>
                                                    {h}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </TableCell>
                                    <TableCell sx={(theme) => ({ maxWidth: theme.dataImport.sampleMaxWidth })}>
                                        <Typography variant="body2" noWrap sx={(theme) => ({ color: theme.palette.text.secondary })} title={sampleOf(batch.sample, header)}>
                                            {sampleOf(batch.sample, header) || "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {DEFAULTABLE.has(field.kind) && (
                                            <TextField
                                                size="small"
                                                value={defaults[field.key] || ""}
                                                placeholder={DEFAULT_HINT[field.key] || ""}
                                                error={missing.includes(field)}
                                                onChange={(event) => setDefaults((current) => ({ ...current, [field.key]: event.target.value }))}
                                                sx={(theme) => ({ width: theme.dataImport.defaultInputWidth })}
                                                slotProps={{ htmlInput: { maxLength: 250, "aria-label": `Value for every row: ${field.label}` } }}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Stack spacing={2} sx={(theme) => ({ p: theme.panel.padding })}>
                {unused.length > 0 && (
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Not imported: {unused.join(", ")}
                    </Typography>
                )}
                <TextField
                    size="small"
                    label="Previous app (optional)"
                    value={source}
                    onChange={(event) => setSource(event.target.value)}
                    helperText="The next file from this app is matched the same way automatically."
                    sx={(theme) => ({ maxWidth: theme.dataImport.valueChooserWidth })}
                    slotProps={{ htmlInput: { maxLength: 100 } }}
                />
                <Stack direction={{ xs: "column-reverse", sm: "row" }} sx={{ gap: 1, justifyContent: "space-between" }}>
                    <Button color="error" onClick={onCancel} disabled={busy}>
                        Cancel this import
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<FactCheckRounded />}
                        disabled={busy || missing.length > 0}
                        onClick={() => onCheck({ columnMap, defaults, sourceSystem: source.trim() })}
                    >
                        {busy ? "Checking rows…" : missing.length ? `Choose a column or value for ${missing[0].label}` : "Check the file"}
                    </Button>
                </Stack>
            </Stack>
        </Panel>
    );
}

// ---------------------------------------------------------
// Step 2: review the check
// ---------------------------------------------------------

function UnknownValues({ unknown, valueMap, onChange }) {
    return (
        <Panel
            title="Values we couldn't find"
            subtitle="Match each one to a Pharmalyx record once; every row with that value is fixed. Anything missing must be added (or imported) first."
        >
            <Stack spacing={2.5} divider={<Divider />}>
                {unknown.map((group) => (
                    <Box key={group.field}>
                        <Typography variant="overline" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            {group.label}
                        </Typography>
                        <Stack spacing={1.25} sx={{ mt: 1 }}>
                            {group.values.map((entry) => {
                                const key = entry.value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
                                const chosen = group.choices.find((c) => c.id === valueMap[group.field]?.[key]) || null;
                                return (
                                    <Stack key={key} direction={{ xs: "column", sm: "row" }} sx={{ gap: 1.5, alignItems: { sm: "center" } }}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" sx={{ fontWeight: "fontWeightMedium" }}>
                                                "{entry.value}"
                                            </Typography>
                                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                {entry.count} {entry.count === 1 ? "row" : "rows"} (row {entry.rows.join(", ")}
                                                {entry.count > entry.rows.length ? "…" : ""})
                                            </Typography>
                                        </Box>
                                        <Autocomplete
                                            size="small"
                                            options={group.choices}
                                            value={chosen}
                                            getOptionLabel={(option) => option.label}
                                            isOptionEqualToValue={(a, b) => a.id === b.id}
                                            onChange={(_, option) => onChange(group.field, key, option?.id || null)}
                                            sx={(theme) => ({ width: theme.dataImport.valueChooserWidth, maxWidth: "100%" })}
                                            renderInput={(params) => <TextField {...params} placeholder={`Match to a ${group.label.toLowerCase()}`} />}
                                        />
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </Box>
                ))}
            </Stack>
        </Panel>
    );
}

const PLACE_TYPE_LABEL = { STOCKIST: "Stockists", PRODUCT: "Products", STATE: "States", TERRITORY: "Territories", AREA: "Areas" };
const CREATE_NEW = { id: "__NEW__", label: "Create new" };

// Sets (or clears) the admin's choice for every spelling that led to one record.
const setChoice = (setValueMap, field, keys, id) =>
    setValueMap((current) => {
        const next = { ...current, [field]: { ...(current[field] || {}) } };
        keys.forEach((key) => {
            if (id) next[field][key] = id;
            else delete next[field][key];
        });
        return next;
    });

// States / territories / areas the import will create, each replaceable by an existing record.
function NewPlaces({ places, valueMap, setValueMap }) {
    const types = ["STOCKIST", "PRODUCT", "STATE", "TERRITORY", "AREA"].filter((type) => places.some((p) => p.type === type));
    const counts = types.map((type) => `${places.filter((p) => p.type === type).length} ${PLACE_TYPE_LABEL[type].toLowerCase()}`).join(", ");

    return (
        <Panel
            title={`New records to create: ${counts}`}
            subtitle="These aren't in Pharmalyx yet, so the import adds them. If one is already here under another name, pick it instead."
        >
            <Stack spacing={2.5} divider={<Divider />}>
                {types.map((type) => (
                    <Box key={type}>
                        <Typography variant="overline" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            {PLACE_TYPE_LABEL[type]}
                        </Typography>
                        <Stack spacing={1.25} sx={{ mt: 1 }}>
                            {places
                                .filter((p) => p.type === type)
                                .map((place) => {
                                    const picked = valueMap[place.field]?.[place.rawKeys[0]];
                                    const value = place.choices.find((c) => c.id === picked) || CREATE_NEW;
                                    return (
                                        <Stack key={place.id} direction={{ xs: "column", sm: "row" }} sx={{ gap: 1.5, alignItems: { sm: "center" } }}>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
                                                    <Typography variant="body2" sx={{ fontWeight: "fontWeightMedium" }}>
                                                        {place.label}
                                                    </Typography>
                                                    {place.parent && <Tag label={`in ${place.parent}`} />}
                                                </Stack>
                                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                                    {place.count} {place.count === 1 ? "row" : "rows"} · written as {place.rawKeys.slice(0, 4).map((k) => `"${k}"`).join(", ")}
                                                    {place.rawKeys.length > 4 ? "…" : ""}
                                                </Typography>
                                            </Box>
                                            <Autocomplete
                                                size="small"
                                                disableClearable
                                                options={[CREATE_NEW, ...place.choices]}
                                                value={value}
                                                getOptionLabel={(option) => option.label}
                                                isOptionEqualToValue={(a, b) => a.id === b.id}
                                                onChange={(_, option) => setChoice(setValueMap, place.field, place.rawKeys, option.id === CREATE_NEW.id ? null : option.id)}
                                                sx={(theme) => ({ width: theme.dataImport.placeChooserWidth, maxWidth: "100%" })}
                                                renderInput={(params) => <TextField {...params} slotProps={{ htmlInput: { ...params.inputProps, "aria-label": `Use for ${place.label}` } }} />}
                                            />
                                        </Stack>
                                    );
                                })}
                        </Stack>
                    </Box>
                ))}
            </Stack>
        </Panel>
    );
}

// Values read as an existing record because the spelling was close.
function Corrections({ corrections, setValueMap }) {
    return (
        <Panel title="Spellings we corrected" subtitle="Close spellings were matched to records already in Pharmalyx. Change any that are wrong.">
            <Stack spacing={1.25}>
                {corrections.map((c) => (
                    <Stack key={`${c.field}|${c.key}`} direction={{ xs: "column", sm: "row" }} sx={{ gap: 1.5, alignItems: { sm: "center" } }}>
                        <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                            "{c.value}" <Box component="span" sx={(theme) => ({ color: theme.palette.text.secondary })}>→</Box> {c.label}
                            <Box component="span" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                {" "}
                                · {c.count} {c.count === 1 ? "row" : "rows"}
                            </Box>
                        </Typography>
                        <Autocomplete
                            size="small"
                            disableClearable
                            options={[{ id: "__NEW__", label: `Create new "${c.value}"` }, ...c.choices]}
                            value={c.choices.find((choice) => choice.id === c.id) || null}
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            onChange={(_, option) => setChoice(setValueMap, c.field, [c.key], option.id)}
                            sx={(theme) => ({ width: theme.dataImport.placeChooserWidth, maxWidth: "100%" })}
                            renderInput={(params) => <TextField {...params} slotProps={{ htmlInput: { ...params.inputProps, "aria-label": `Match for ${c.value}` } }} />}
                        />
                    </Stack>
                ))}
            </Stack>
        </Panel>
    );
}

const MESSAGE_COLOR = { error: "error.main", warning: "warning.dark", info: "text.secondary" };

function IssueTable({ rows, columnMap, decisions, onDecide }) {
    if (!rows.length) return <EmptyState icon={CheckCircleRounded} title="Nothing to show" message="No rows in this group." />;

    return (
        <TableContainer sx={(theme) => ({ maxHeight: theme.dataImport.issuesMaxHeight })}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>Record</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>What we found</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => {
                        const status = ROW_STATUS[row.status] || ROW_STATUS.READY;
                        const action = decisions[row.rowNumber] || row.action;
                        return (
                            <TableRow key={row.rowNumber} hover sx={{ verticalAlign: "top" }}>
                                <TableCell>{row.rowNumber}</TableCell>
                                <TableCell sx={(theme) => ({ maxWidth: theme.table.textMaxWidth })}>
                                    <Typography variant="body2" noWrap>
                                        {rowTitle(row, columnMap)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <StatusChip label={status.label} color={status.color} />
                                </TableCell>
                                <TableCell sx={(theme) => ({ maxWidth: theme.dataImport.messageMaxWidth })}>
                                    <Stack spacing={0.5}>
                                        {row.messages.map((message, i) => (
                                            <Typography key={i} variant="body2" sx={{ color: MESSAGE_COLOR[message.level] }}>
                                                {message.text}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    {row.status === "ERROR" ? (
                                        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                            Fix in the file
                                        </Typography>
                                    ) : (
                                        <TextField
                                            select
                                            size="small"
                                            value={action}
                                            onChange={(event) => onDecide(row.rowNumber, event.target.value)}
                                            sx={(theme) => ({ width: theme.dataImport.actionSelectWidth })}
                                            slotProps={{ htmlInput: { "aria-label": `Action for row ${row.rowNumber}` } }}
                                        >
                                            {row.allowed.map((option) => (
                                                <MenuItem key={option} value={option}>
                                                    {ACTION_LABEL[option]}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

const FILTERS = [
    { value: "ALL", label: "All" },
    { value: "ERROR", label: "Errors" },
    { value: "WARNING", label: "To check" },
    { value: "MATCH", label: "Already in Pharmalyx" },
];

function ReviewStep({ batch, review, busy, onRecheck, onBack, onImport }) {
    const [valueMap, setValueMap] = useState(review.valueMap || {});
    const [decisions, setDecisions] = useState({});
    const [filter, setFilter] = useState(review.summary.errors ? "ERROR" : "ALL");
    const existing = review.options?.existing || "SKIP";
    const createMissing = review.options?.createMissing !== false;
    const { summary } = review;

    const valuesChanged = JSON.stringify(valueMap) !== JSON.stringify(review.valueMap || {});
    const dirty = valuesChanged || Object.keys(decisions).length > 0;
    const toImport = summary.create + summary.update;

    const rows = review.issues.filter((row) =>
        filter === "ALL" ? true : filter === "MATCH" ? Boolean(row.match) : row.status === filter
    );

    const recheck = (options = {}) =>
        onRecheck({
            valueMap,
            options: { existing, createMissing, ...options },
            decisions: Object.entries(decisions).map(([rowNumber, decision]) => ({ rowNumber: Number(rowNumber), decision })),
        });

    const statement = review.statement;

    return (
        <Stack spacing={2}>
            {statement && (
                <Panel
                    title={`${statement.stockist}: ${statement.monthLabel} statement`}
                    subtitle={`Importing creates this month's secondary-sales statement as approved history${statement.newStockist ? ", and adds the stockist" : ""}. ${
                        statement.owner ? "It belongs to the MR assigned to this stockist." : "No MR is assigned to this stockist yet, so it's recorded under your name."
                    }`}
                />
            )}
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
                <StatCard icon={AddCircleRounded} label="New records" value={summary.create} color="success" />
                <StatCard icon={SyncRounded} label="Updates" value={summary.update} color="info" />
                <StatCard icon={SkipNextRounded} label="Skipped" value={summary.skip - summary.errors} color="secondary" />
                <StatCard icon={ErrorRounded} label="Errors" value={summary.errors} caption={summary.errors ? "Fix in the file and upload again" : "None"} color="error" />
            </Box>

            <Panel title="Import settings">
                <Stack spacing={2} divider={<Divider />}>
                    <Stack direction={{ xs: "column", md: "row" }} sx={{ gap: 2, justifyContent: "space-between", alignItems: { md: "center" } }}>
                        <Box>
                            <Typography variant="subtitle2">Records already in Pharmalyx</Typography>
                            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                When a row matches an existing record (same name, mobile, GSTIN…), skip it or fill in its details from the file. Blank cells never erase anything.
                            </Typography>
                        </Box>
                        <SegmentedControl
                            value={existing}
                            disabled={busy}
                            onChange={(value) => recheck({ existing: value })}
                            options={[
                                { value: "SKIP", label: "Skip them" },
                                { value: "UPDATE", label: "Update them" },
                            ]}
                        />
                    </Stack>
                    <Stack direction={{ xs: "column", md: "row" }} sx={{ gap: 2, justifyContent: "space-between", alignItems: { md: "center" } }}>
                        <Box>
                            <Typography variant="subtitle2">Missing states, territories and areas</Typography>
                            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                Create them from the file, or turn this off to match every unknown value by hand.
                            </Typography>
                        </Box>
                        <SegmentedControl
                            value={createMissing ? "CREATE" : "MATCH"}
                            disabled={busy}
                            onChange={(value) => recheck({ createMissing: value === "CREATE" })}
                            options={[
                                { value: "CREATE", label: "Create them" },
                                { value: "MATCH", label: "Match by hand" },
                            ]}
                        />
                    </Stack>
                </Stack>
            </Panel>

            {(review.notices || []).map((notice) => (
                <Panel key={notice}>
                    <Typography variant="body2" role="status" sx={(theme) => ({ color: theme.palette.warning.dark })}>
                        {notice}
                    </Typography>
                </Panel>
            ))}

            {review.unknownValues.length > 0 && (
                <UnknownValues
                    unknown={review.unknownValues}
                    valueMap={valueMap}
                    onChange={(field, key, id) =>
                        setValueMap((current) => {
                            const next = { ...current, [field]: { ...(current[field] || {}) } };
                            if (id) next[field][key] = id;
                            else delete next[field][key];
                            return next;
                        })
                    }
                />
            )}

            {review.newPlaces?.length > 0 && <NewPlaces places={review.newPlaces} valueMap={valueMap} setValueMap={setValueMap} />}

            {review.corrections?.length > 0 && <Corrections corrections={review.corrections} setValueMap={setValueMap} />}

            <Panel
                title="Rows to look at"
                subtitle={
                    review.issuesTruncated
                        ? "Showing the first 2,000. Download the full list to fix them in Excel."
                        : "Errors are skipped. Download them, fix them in Excel and upload that file again."
                }
                actions={
                    <Button size="small" startIcon={<FileDownloadRounded />} onClick={() => downloadIssues(batch.batchId)} disabled={!summary.errors && !summary.warnings}>
                        Rows to fix
                    </Button>
                }
                disablePadding
            >
                <Box sx={(theme) => ({ px: theme.panel.padding, pb: 1.5 })}>
                    <SegmentedControl value={filter} onChange={setFilter} options={FILTERS} />
                </Box>
                <IssueTable
                    rows={rows}
                    columnMap={batch.columnMap}
                    decisions={decisions}
                    onDecide={(rowNumber, decision) => setDecisions((current) => ({ ...current, [rowNumber]: decision }))}
                />
            </Panel>

            <Stack direction={{ xs: "column-reverse", sm: "row" }} sx={{ gap: 1, justifyContent: "space-between" }}>
                <Button startIcon={<ArrowBackRounded />} onClick={onBack} disabled={busy}>
                    Back to columns
                </Button>
                {dirty ? (
                    <Button variant="contained" startIcon={<RefreshRounded />} onClick={() => recheck()} disabled={busy}>
                        {busy ? "Checking…" : "Apply changes and check again"}
                    </Button>
                ) : (
                    <Button variant="contained" startIcon={<PublishRounded />} onClick={onImport} disabled={busy || toImport === 0}>
                        {toImport ? `Import ${toImport} ${toImport === 1 ? "row" : "rows"}` : "Nothing to import"}
                    </Button>
                )}
            </Stack>
        </Stack>
    );
}

// ---------------------------------------------------------
// Step 3: done
// ---------------------------------------------------------

function DoneStep({ batch, result, onUndo, onFinish }) {
    const s = result || batch.summary || {};
    const places = [
        s.newStockists && `${s.newStockists} ${s.newStockists === 1 ? "stockist" : "stockists"}`,
        s.newProducts && `${s.newProducts} ${s.newProducts === 1 ? "product" : "products"}`,
        s.newStates && `${s.newStates} ${s.newStates === 1 ? "state" : "states"}`,
        s.newTerritories && `${s.newTerritories} ${s.newTerritories === 1 ? "territory" : "territories"}`,
        s.newAreas && `${s.newAreas} ${s.newAreas === 1 ? "area" : "areas"}`,
    ]
        .filter(Boolean)
        .join(", ");
    return (
        <Panel>
            <EmptyState
                icon={CheckCircleRounded}
                title={batch.entityType === "STATEMENT" ? "Statement imported" : `Imported ${TYPE_LABEL[batch.entityType]}`}
                message={[
                    `${s.created || 0} new, ${s.updated || 0} updated, ${s.skipped || 0} skipped.`,
                    places && `Also created ${places}.`,
                    batch.entityType === "USER" && "Imported users can sign in once an admin sets their password in Users.",
                ]
                    .filter(Boolean)
                    .join(" ")}
                action={
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
                        <Button color="error" startIcon={<UndoRounded />} onClick={onUndo}>
                            Undo
                        </Button>
                        <Button variant="contained" onClick={onFinish}>
                            Back to Data import
                        </Button>
                    </Stack>
                }
            />
        </Panel>
    );
}

// ---------------------------------------------------------
// Wizard
// ---------------------------------------------------------

function ImportWizard() {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();

    const [batch, setBatch] = useState(null);
    const [review, setReview] = useState(null);
    const [result, setResult] = useState(null);
    const [step, setStep] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [confirm, setConfirm] = useState(null); // "IMPORT" | "UNDO"

    const runCheck = useCallback(
        async (payload) => {
            setBusy(true);
            try {
                const checked = await checkBatch(batchId, payload);
                setReview(checked);
                setBatch(await getBatch(batchId));
                setStep("review");
            } catch (err) {
                showSnackbar(errorMessage(err, "Couldn't check the file"), "error");
            } finally {
                setBusy(false);
            }
        },
        [batchId, showSnackbar]
    );

    const load = useCallback(async () => {
        setError("");
        try {
            const loaded = await getBatch(batchId);
            setBatch(loaded);
            if (loaded.status === "IMPORTED" || loaded.status === "UNDONE" || loaded.status === "CANCELLED") setStep("done");
            else if (loaded.status === "CHECKED") {
                setReview(await checkBatch(batchId, {}));
                setStep("review");
            } else setStep("columns");
        } catch (err) {
            setError(errorMessage(err, "Failed to load the import"));
        }
    }, [batchId]);

    useEffect(() => {
        load();
    }, [load]);

    const steps = useMemo(() => ["Match columns", "Review", "Done"], []);
    const stepIndex = { columns: 0, review: 1, done: 2 }[step] ?? 0;

    const doImport = async () => {
        setBusy(true);
        try {
            const outcome = await commitBatch(batchId);
            setResult(outcome);
            setBatch(await getBatch(batchId));
            setStep("done");
            setConfirm(null);
            showSnackbar("Import finished", "success");
        } catch (err) {
            showSnackbar(errorMessage(err, "Import failed; nothing was saved"), "error");
        } finally {
            setBusy(false);
        }
    };

    const doUndo = async () => {
        setBusy(true);
        try {
            await undoBatch(batchId);
            showSnackbar("Import undone", "success");
            navigate("/admin/data-import");
        } catch (err) {
            showSnackbar(errorMessage(err, "Couldn't undo the import"), "error");
            setConfirm(null);
        } finally {
            setBusy(false);
        }
    };

    const retype = async (type) => {
        setBusy(true);
        try {
            setBatch(await retypeBatch(batchId, type));
            setReview(null);
            setStep("columns");
        } catch (err) {
            showSnackbar(errorMessage(err, "Couldn't change the import type"), "error");
        } finally {
            setBusy(false);
        }
    };

    const cancel = async () => {
        try {
            await cancelBatch(batchId);
        } finally {
            navigate("/admin/data-import");
        }
    };

    const typeLabel = batch ? TYPE_LABEL[batch.entityType] : "";
    const toImport = review ? review.summary.create + review.summary.update : 0;

    return (
        <Box>
            <PageHeader
                eyebrow="Data import"
                title={batch ? `Import ${typeLabel}` : "Import"}
                subtitle={batch ? `${batch.fileName} · step ${stepIndex + 1} of 3: ${steps[stepIndex]}` : undefined}
                actions={
                    <Button startIcon={<ArrowBackRounded />} onClick={() => navigate("/admin/data-import")}>
                        All imports
                    </Button>
                }
            />

            {error ? (
                <LoadError title="Couldn't load the import" message={error} onRetry={load} />
            ) : (
                batch && (
                    <>
                        {step === "columns" && <ColumnStep key={batch.entityType} batch={batch} busy={busy} onCheck={runCheck} onCancel={cancel} onRetype={retype} />}
                        {step === "review" && review && (
                            <ReviewStep
                                key={JSON.stringify(review.summary) + JSON.stringify(review.valueMap) + JSON.stringify(review.options)}
                                batch={batch}
                                review={review}
                                busy={busy}
                                onRecheck={runCheck}
                                onBack={() => setStep("columns")}
                                onImport={() => setConfirm("IMPORT")}
                            />
                        )}
                        {step === "done" &&
                            (batch.status === "IMPORTED" ? (
                                <DoneStep batch={batch} result={result} onUndo={() => setConfirm("UNDO")} onFinish={() => navigate("/admin/data-import")} />
                            ) : (
                                <Panel>
                                    <EmptyState
                                        icon={UndoRounded}
                                        title={batch.status === "UNDONE" ? "This import was undone" : "This import was cancelled"}
                                        message="Upload the file again from Data import if you still need it."
                                        action={
                                            <Button variant="contained" onClick={() => navigate("/admin/data-import")}>
                                                Back to Data import
                                            </Button>
                                        }
                                    />
                                </Panel>
                            ))}
                    </>
                )
            )}

            {confirm === "IMPORT" && (
                <ConfirmActionDialog
                    icon={PublishRounded}
                    title={`Import ${toImport} ${toImport === 1 ? "row" : "rows"}?`}
                    message={`${review.summary.create} new and ${review.summary.update} updated ${typeLabel}${
                        review.newPlaces?.length ? `, plus ${review.newPlaces.length} new states, territories or areas they need` : ""
                    }. Rows with errors are skipped. You can undo this import while nothing uses the new records yet.`}
                    confirmLabel="Import"
                    busy={busy}
                    onClose={() => setConfirm(null)}
                    onConfirm={doImport}
                />
            )}
            {confirm === "UNDO" && (
                <ConfirmActionDialog
                    icon={UndoRounded}
                    color="error"
                    title="Undo this import?"
                    message="Records it created are removed and records it updated go back to how they were."
                    confirmLabel="Undo import"
                    busy={busy}
                    onClose={() => setConfirm(null)}
                    onConfirm={doUndo}
                />
            )}
        </Box>
    );
}

export default ImportWizard;
