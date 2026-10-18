import { useCallback, useEffect, useState } from "react";

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, TextField, Typography } from "@mui/material";
import { AutoFixHighRounded, CheckCircleRounded, EditLocationAltRounded, PolylineRounded } from "@mui/icons-material";

import EmptyState from "../../../components/EmptyState/EmptyState";
import Panel from "../../../components/Panel/Panel";
import Tag from "../../../components/Tag/Tag";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";
import { approveBoundary, draftBoundary, errorMessage, getBoundaries } from "../index";

// Outline of a boundary (no map tiles): approved in one colour, the draft in another.
function BoundaryShape({ approved, draft }) {
    const all = [...(approved || []), ...(draft || [])];
    if (!all.length) return null;

    const lats = all.map((p) => p[0]);
    const lngs = all.map((p) => p[1]);
    const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
    const span = Math.max(maxLat - minLat, maxLng - minLng) || 0.01;
    const toPoints = (polygon) => polygon.map(([lat, lng]) => `${(((lng - minLng) / span) * 90 + 5).toFixed(2)},${(((maxLat - lat) / span) * 90 + 5).toFixed(2)}`).join(" ");

    return (
        <Box component="svg" viewBox="0 0 100 100" sx={(theme) => ({ width: theme.spacing(16), height: theme.spacing(16), flexShrink: 0, borderRadius: theme.field.radius, backgroundColor: theme.palette.action.hover })}>
            {approved && <Box component="polygon" points={toPoints(approved)} sx={(theme) => ({ fill: theme.palette.success.light, fillOpacity: 0.35, stroke: theme.palette.success.main, strokeWidth: 1 })} />}
            {draft && <Box component="polygon" points={toPoints(draft)} sx={(theme) => ({ fill: "none", stroke: theme.palette.warning.main, strokeWidth: 1, strokeDasharray: "3 2" })} />}
        </Box>
    );
}

// Head office: each MR's territory boundary, auto-created around their doctors (with a margin) or entered point by point.
function BoundariesTab({ canEdit, canApprove }) {
    const { showSnackbar } = useSnackbar();
    const [users, setUsers] = useState(null);
    const [busy, setBusy] = useState(false);
    const [drawing, setDrawing] = useState(null);

    const load = useCallback(() => {
        getBoundaries()
            .then((result) => setUsers(result.users))
            .catch((err) => showSnackbar(errorMessage(err, "Couldn't load boundaries"), "error"));
    }, [showSnackbar]);

    useEffect(() => {
        load();
    }, [load]);

    const run = async (work) => {
        setBusy(true);
        try {
            const result = await work();
            showSnackbar(result.message, "success");
            load();
            return true;
        } catch (err) {
            showSnackbar(errorMessage(err, "Something went wrong"), "error");
            return false;
        } finally {
            setBusy(false);
        }
    };

    const saveDrawn = async () => {
        const points = drawing.text
            .split("\n")
            .map((line) => line.split(",").map((part) => Number(part.trim())))
            .filter((pair) => pair.length === 2 && pair.every(Number.isFinite));
        if (await run(() => draftBoundary(drawing.user.UserId, { Source: "DRAWN", Polygon: points, Notes: drawing.notes }))) setDrawing(null);
    };

    return (
        <Stack spacing={2}>
            <Alert severity="info" variant="outlined">
                Visits checked in outside the approved boundary do not count, and managers can&apos;t override that. A manager&apos;s territory automatically includes their team&apos;s boundaries. Use Exceptions for a doctor just outside, leave cover or special duty.
            </Alert>
            <Panel title="Territory boundaries" subtitle="Green = approved, dashed orange = draft waiting for approval.">
                {users?.length ? (
                    <Stack divider={<Divider />}>
                        {users.map((user) => (
                            <Stack key={user.UserId} direction={{ xs: "column", md: "row" }} sx={{ py: 1.5, gap: 2, alignItems: { md: "center" } }}>
                                <BoundaryShape approved={user.approved?.polygon} draft={user.draft?.polygon} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                                        <Typography variant="subtitle2">{user.Name}</Typography>
                                        {user.approved ? <Tag label="Approved" color="success" /> : <Tag label="No approved boundary" color="warning" />}
                                        {user.draft && <Tag label={`Draft (${user.draft.source === "AUTO" ? `auto, ${user.draft.marginKm} km` : "entered"})`} color="warning" />}
                                    </Stack>
                                    <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        {user.pinnedDoctors} doctor(s) with a pinned clinic · {user.approved ? `${user.approved.polygon?.length || 0} points` : "visits are not territory-checked yet"}
                                    </Typography>
                                </Box>
                                <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                                    {canEdit && (
                                        <Button size="small" startIcon={<AutoFixHighRounded />} disabled={busy || !user.pinnedDoctors} onClick={() => run(() => draftBoundary(user.UserId, { Source: "AUTO" }))}>
                                            Auto-create
                                        </Button>
                                    )}
                                    {canEdit && (
                                        <Button
                                            size="small"
                                            startIcon={<EditLocationAltRounded />}
                                            disabled={busy}
                                            onClick={() => setDrawing({ user, text: (user.draft?.polygon || user.approved?.polygon || []).map((p) => p.join(", ")).join("\n"), notes: "" })}
                                        >
                                            Enter points
                                        </Button>
                                    )}
                                    {canApprove && user.draft && (
                                        <Button size="small" variant="contained" color="success" startIcon={<CheckCircleRounded />} disabled={busy} onClick={() => run(() => approveBoundary(user.draft.BoundaryId))}>
                                            Approve draft
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <EmptyState icon={PolylineRounded} title={users ? "Nobody in scope" : "Loading…"} />
                )}
            </Panel>

            {drawing && (
                <Dialog open fullWidth maxWidth="sm" onClose={() => setDrawing(null)} slotProps={{ paper: { sx: (theme) => ({ backgroundColor: theme.palette.background.paper }) } }}>
                    <DialogTitle>Boundary points for {drawing.user.Name}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                One point per line as &quot;latitude, longitude&quot;, going round the territory (3 to 200 points). You can copy points from Google Maps.
                            </Typography>
                            <TextField multiline minRows={8} value={drawing.text} onChange={(event) => setDrawing((d) => ({ ...d, text: event.target.value }))} />
                            <TextField label="Notes (optional)" value={drawing.notes} onChange={(event) => setDrawing((d) => ({ ...d, notes: event.target.value.slice(0, 500) }))} />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDrawing(null)}>Cancel</Button>
                        <Button variant="contained" onClick={saveDrawn} disabled={busy}>
                            Save draft
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Stack>
    );
}

export default BoundariesTab;
