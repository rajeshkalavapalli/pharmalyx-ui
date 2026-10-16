import { useEffect, useState } from "react";

import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Drawer,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AutoAwesomeRounded,
    CancelRounded,
    CheckCircleRounded,
    CheckRounded,
    CloseRounded,
    EastRounded,
    HourglassTopRounded,
    PersonOutlineRounded,
    PlaceRounded,
    SendRounded,
} from "@mui/icons-material";

import { DetailFact, DetailGrid, DetailSection } from "../../components/DetailSection/DetailSection";
import ConfirmActionDialog from "../../components/ConfirmActionDialog/ConfirmActionDialog";
import StatusChip from "../../components/StatusChip/StatusChip";
import Timeline from "../../components/Timeline/Timeline";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";
import {
    DEVIATION_STATUS,
    REMARKS_LIMIT,
    SYSTEM_SOURCE,
    approveDeviation,
    formatDate,
    formatDateTime,
    formatWeekday,
    getDeviationById,
    initials,
    rejectDeviation,
} from "./index";

const REVIEW_ACTIONS = {
    approve: {
        icon: CheckCircleRounded,
        color: "success",
        title: "Approve this deviation?",
        message: "The change of location will be accepted for this day.",
        confirmLabel: "Approve",
        remarks: "optional",
    },
    reject: {
        icon: CancelRounded,
        color: "error",
        title: "Reject this deviation?",
        message: "Explain why it was not accepted. The representative will see this note.",
        confirmLabel: "Reject",
        remarks: "required",
    },
};

const buildSteps = (d) => {
    const steps = [
        {
            key: "submitted",
            icon: SendRounded,
            title: d.Source === SYSTEM_SOURCE ? "Detected by system" : `Requested by ${d.UserName}`,
            caption: formatDateTime(d.SubmittedOn),
            note: d.Remarks,
            state: "done",
            color: "primary",
        },
    ];

    if (d.Status === "APPROVED" || d.Status === "REJECTED") {
        const approved = d.Status === "APPROVED";

        steps.push({
            key: "review",
            icon: approved ? CheckRounded : CloseRounded,
            title: approved ? "Approved" : "Rejected",
            caption: [d.ReviewedByName, formatDateTime(d.ReviewedOn)].filter(Boolean).join(" · "),
            note: d.ReviewRemarks,
            state: "done",
            color: approved ? "success" : "error",
        });
    } else {
        steps.push({
            key: "review",
            icon: HourglassTopRounded,
            title: "Awaiting review",
            caption: d.ManagerName ? `By ${d.ManagerName}` : "By the reporting manager",
            state: "current",
            color: "warning",
        });
    }

    return steps;
};

// =========================================================
// PIECES
// =========================================================

function LocationCard({ label, territory, area, emphasis, changedTerritory, changedArea }) {
    return (
        <Box
            sx={(theme) => ({
                flex: 1,
                minWidth: 0,
                p: 2,
                borderRadius: theme.calendar.cell.radius,
                border: "1px solid",
                borderColor: emphasis
                    ? alpha(theme.palette.primary.main, theme.tint.border)
                    : theme.palette.border.default,
                backgroundColor: emphasis
                    ? alpha(theme.palette.primary.main, theme.tint.hover)
                    : theme.palette.surface.subtle,
            })}
        >
            <Typography
                variant="overline"
                component="p"
                sx={(theme) => ({
                    color: emphasis ? theme.palette.primary.main : theme.palette.text.secondary,
                })}
            >
                {label}
            </Typography>

            <Typography
                variant="subtitle1"
                sx={(theme) => ({
                    mt: 0.5,
                    overflowWrap: "anywhere",
                    color: changedTerritory ? theme.palette.primary.dark : theme.palette.text.primary,
                })}
            >
                {territory || "Not planned"}
            </Typography>

            <Typography
                variant="body2"
                sx={(theme) => ({
                    mt: 0.25,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: changedArea ? theme.palette.primary.dark : theme.palette.text.secondary,
                })}
            >
                <PlaceRounded fontSize="inherit" />
                {area || "No area"}
            </Typography>
        </Box>
    );
}

// =========================================================
// DRAWER
// =========================================================

function DeviationDetails({ open, deviationId, onClose, onReviewed }) {
    const { showSnackbar } = useSnackbar();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [action, setAction] = useState(null);

    useEffect(() => {
        if (!open || !deviationId) return undefined;

        let active = true;

        setData(null);
        setAction(null);
        setLoading(true);

        getDeviationById(deviationId)
            .then((response) => {
                if (active) setData(response?.deviation || null);
            })
            .catch((error) => {
                if (!active) return;
                showSnackbar(error.response?.data?.message || "Failed to load deviation", "error");
                onClose();
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
        // onClose is recreated by the parent on every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, deviationId, showSnackbar]);

    const handleReview = async (remarks) => {
        setBusy(true);

        try {
            const call = action === "approve" ? approveDeviation : rejectDeviation;
            const response = await call(deviationId, remarks);

            showSnackbar(response?.message || "Deviation updated", "success");
            setAction(null);
            onReviewed?.();
            onClose();
        } catch (error) {
            showSnackbar(error.response?.data?.message || "Failed to update deviation", "error");
        } finally {
            setBusy(false);
        }
    };

    const d = data || {};
    const status = DEVIATION_STATUS[d.Status] || DEVIATION_STATUS.PENDING;
    const territoryChanged =
        Boolean(d.ActualTerritoryId) && d.ActualTerritoryId !== d.PlannedTerritoryId;
    const areaChanged = Boolean(d.ActualAreaId) && d.ActualAreaId !== d.PlannedAreaId;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={busy ? undefined : onClose}
            slotProps={{
                paper: {
                    sx: (theme) => ({
                        width: theme.drawer.width,
                        backgroundColor: theme.palette.background.paper,
                        display: "flex",
                        flexDirection: "column",
                    }),
                },
            }}
        >
            {/* HEADER */}

            <Stack
                direction="row"
                sx={(theme) => ({
                    alignItems: "flex-start",
                    gap: 2,
                    px: theme.drawer.paddingX,
                    py: theme.drawer.paddingY,
                })}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="overline"
                        component="p"
                        sx={(theme) => ({ color: theme.palette.primary.main })}
                    >
                        Deviation{d.DeviationType ? ` · ${d.DeviationType}` : ""}
                    </Typography>

                    <Typography variant="h4" component="h2">
                        {d.DeviationDate ? formatDate(d.DeviationDate) : "Loading…"}
                    </Typography>

                    {d.DeviationDate && (
                        <Stack direction="row" spacing={1.25} sx={{ mt: 1, alignItems: "center" }}>
                            <StatusChip label={status.label} color={status.color} />
                            <Typography
                                variant="body2"
                                sx={(theme) => ({ color: theme.palette.text.secondary })}
                            >
                                {formatWeekday(d.DeviationDate)}
                            </Typography>
                        </Stack>
                    )}
                </Box>

                <IconButton aria-label="Close" onClick={onClose} disabled={busy}>
                    <CloseRounded />
                </IconButton>
            </Stack>

            <Divider />

            {/* BODY */}

            <Box
                sx={(theme) => ({
                    flex: 1,
                    overflowY: "auto",
                    px: theme.drawer.paddingX,
                    py: theme.drawer.paddingY,
                })}
            >
                {loading || !data ? (
                    <Box sx={{ py: 8, display: "grid", placeItems: "center" }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack sx={(theme) => ({ gap: theme.drawer.sectionGap })}>
                        {/* PERSON */}

                        <Stack
                            direction="row"
                            sx={(theme) => ({
                                alignItems: "center",
                                gap: 1.5,
                                p: 2,
                                borderRadius: theme.calendar.cell.radius,
                                backgroundColor: theme.palette.surface.subtle,
                            })}
                        >
                            <Avatar
                                sx={(theme) => ({
                                    width: theme.avatar.size,
                                    height: theme.avatar.size,
                                    ...theme.typography.subtitle2,
                                    color: theme.palette.primary.dark,
                                    backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft),
                                })}
                            >
                                {initials(d.UserName)}
                            </Avatar>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle1">{d.UserName}</Typography>
                                <Typography
                                    variant="caption"
                                    component="p"
                                    sx={(theme) => ({ color: theme.palette.text.secondary })}
                                >
                                    {[d.DesignationName, d.UserCode, d.DivisionName]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </Typography>
                            </Box>

                            {d.ManagerName && (
                                <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                                    <Typography
                                        variant="caption"
                                        component="p"
                                        sx={(theme) => ({ color: theme.palette.text.secondary })}
                                    >
                                        Reports to
                                    </Typography>
                                    <Typography variant="subtitle2">{d.ManagerName}</Typography>
                                </Box>
                            )}
                        </Stack>

                        {/* PLANNED VS ACTUAL */}

                        <DetailSection title="Planned vs actual">
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                sx={{ alignItems: "stretch", gap: 1.5 }}
                            >
                                <LocationCard
                                    label="Planned"
                                    territory={d.PlannedTerritoryName}
                                    area={d.PlannedAreaName}
                                />

                                <Box
                                    sx={(theme) => ({
                                        display: "grid",
                                        placeItems: "center",
                                        color: theme.palette.text.disabled,
                                        transform: { xs: "rotate(90deg)", sm: "none" },
                                    })}
                                >
                                    <EastRounded />
                                </Box>

                                <LocationCard
                                    label="Actual"
                                    territory={d.ActualTerritoryName}
                                    area={d.ActualAreaName}
                                    emphasis
                                    changedTerritory={territoryChanged}
                                    changedArea={areaChanged}
                                />
                            </Stack>
                        </DetailSection>

                        {/* DETAILS */}

                        <DetailSection title="Details">
                            <DetailGrid>
                                <DetailFact label="Deviation type">
                                    <Chip size="small" variant="outlined" label={d.DeviationType} />
                                </DetailFact>

                                <DetailFact label="Source">
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        color={d.Source === SYSTEM_SOURCE ? "primary" : "default"}
                                        icon={
                                            d.Source === SYSTEM_SOURCE ? (
                                                <AutoAwesomeRounded />
                                            ) : (
                                                <PersonOutlineRounded />
                                            )
                                        }
                                        label={d.Source}
                                    />
                                </DetailFact>
                            </DetailGrid>
                        </DetailSection>

                        {/* REASON */}

                        <DetailSection title="Reason">
                            <Typography
                                variant="body1"
                                sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
                            >
                                {d.Reason}
                            </Typography>
                        </DetailSection>

                        {/* HISTORY */}

                        <DetailSection title="History">
                            <Timeline steps={buildSteps(d)} />
                        </DetailSection>
                    </Stack>
                )}
            </Box>

            {/* FOOTER */}

            <Divider />

            <Stack
                direction="row"
                sx={(theme) => ({
                    justifyContent: "flex-end",
                    gap: 1,
                    px: theme.drawer.paddingX,
                    py: 2,
                })}
            >
                {d.canReview ? (
                    <>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelRounded />}
                            disabled={busy}
                            onClick={() => setAction("reject")}
                        >
                            Reject
                        </Button>

                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleRounded />}
                            disabled={busy}
                            onClick={() => setAction("approve")}
                        >
                            Approve
                        </Button>
                    </>
                ) : (
                    <Button variant="outlined" onClick={onClose}>
                        Close
                    </Button>
                )}
            </Stack>

            {action && (
                <ConfirmActionDialog
                    key={action}
                    {...REVIEW_ACTIONS[action]}
                    remarksLimit={REMARKS_LIMIT}
                    busy={busy}
                    onClose={() => setAction(null)}
                    onConfirm={handleReview}
                />
            )}
        </Drawer>
    );
}

export default DeviationDetails;
