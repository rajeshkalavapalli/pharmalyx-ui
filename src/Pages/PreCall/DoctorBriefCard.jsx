import { useState } from "react";

import { Box, Button, Collapse, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    CallRounded,
    CheckCircleRounded,
    ExpandMoreRounded,
    LightbulbRounded,
    AddTaskRounded,
    DeleteOutlineRounded,
    EditNoteRounded,
    EventAvailableRounded,
    PlaceRounded,
    PlayArrowRounded,
} from "@mui/icons-material";

import Tag from "../../components/Tag/Tag";
import CategoryBadge from "../MyDoctors/components/CategoryBadge";
import { FEEDBACK, formatMoney, formatShortDate } from "./index";

function Fact({ label, children }) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                {label}
            </Typography>
            <Box sx={{ mt: 0.5 }}>{children}</Box>
        </Box>
    );
}

function Meter({ value, color }) {
    return (
        <Box
            sx={(theme) => ({
                mt: 0.75,
                height: theme.stat.progressHeight,
                borderRadius: theme.stat.progressHeight,
                backgroundColor: theme.palette.surface.muted,
                overflow: "hidden",
            })}
        >
            <Box
                sx={(theme) => ({
                    width: `${Math.min(100, Math.max(0, value))}%`,
                    height: "100%",
                    borderRadius: "inherit",
                    backgroundColor: theme.palette[color].main,
                })}
            />
        </Box>
    );
}

// One doctor's pre-call briefing: why to meet them, what happened last time, and what to say.
function DoctorBriefCard({ doctor, canLog, canPlan, onLogVisit, onPlan, onRemovePlan }) {
    const [open, setOpen] = useState(doctor.mustMeet && !doctor.visitedOnDay);

    const feedback = FEEDBACK[doctor.lastVisit?.feedback];
    const callPlan = doctor.callPlan;
    const planVisited = callPlan?.status === "VISITED";
    const location = [doctor.TerritoryName, doctor.AreaName].filter(Boolean).join(" · ");

    return (
        <Paper
            elevation={0}
            sx={(theme) => ({
                borderRadius: theme.panel.radius,
                backgroundColor: theme.palette.background.paper,
                boxShadow: doctor.mustMeet && !doctor.visitedOnDay ? theme.card.shadow : theme.elevation.sm,
                borderColor: doctor.mustMeet && !doctor.visitedOnDay
                    ? alpha(theme.palette.primary.main, theme.tint.strong)
                    : theme.palette.border.default,
                opacity: doctor.visitedOnDay ? theme.table.loadingOpacity + 0.2 : 1,
                overflow: "hidden",
                transition: theme.calendar.transition,
            })}
        >
            {/* Summary row */}
            <Stack
                direction={{ xs: "column", md: "row" }}
                sx={(theme) => ({ gap: 2, p: theme.entityCard.padding, alignItems: { xs: "stretch", md: "center" } })}
            >
                <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0, alignItems: "flex-start" }}>
                    <CategoryBadge category={doctor.Category} />

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
                            <Typography variant="subtitle1">Dr. {doctor.DoctorName}</Typography>
                            {callPlan && <Tag icon={EventAvailableRounded} label={`Planned #${callPlan.order}`} color="submitted" />}
                            {doctor.mustMeet && !doctor.visitedOnDay && <Tag label="Must meet" color="primary" />}
                            {doctor.visitedOnDay && <Tag icon={CheckCircleRounded} label="Visited" color="success" />}
                        </Stack>

                        <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            {[doctor.Speciality, doctor.HospitalName].filter(Boolean).join(" · ") || "—"}
                        </Typography>

                        {location && (
                            <Typography
                                variant="caption"
                                component="p"
                                sx={(theme) => ({ display: "flex", alignItems: "center", gap: 0.5, color: theme.palette.text.secondary })}
                            >
                                <PlaceRounded fontSize="inherit" />
                                {location}
                            </Typography>
                        )}

                        {doctor.reasons.length > 0 && (
                            <Stack direction="row" sx={{ mt: 1, gap: 0.75, flexWrap: "wrap" }}>
                                {doctor.reasons.map((reason) => (
                                    <Tag key={reason.code} label={reason.label} color={reason.tone} />
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: { xs: "flex-end", md: "flex-start" } }}>
                    <Tooltip title={doctor.MobileNumber ? `Call ${doctor.MobileNumber}` : "No mobile number"}>
                        <span>
                            <IconButton
                                component={doctor.MobileNumber ? "a" : "button"}
                                href={doctor.MobileNumber ? `tel:${doctor.MobileNumber}` : undefined}
                                disabled={!doctor.MobileNumber}
                                aria-label="Call"
                            >
                                <CallRounded fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>

                    {canPlan && !planVisited && (
                        <Button
                            variant={callPlan ? "outlined" : "contained"}
                            color="primary"
                            startIcon={callPlan ? <EditNoteRounded /> : <AddTaskRounded />}
                            onClick={() => onPlan(doctor)}
                        >
                            {callPlan ? "Edit plan" : "Plan call"}
                        </Button>
                    )}

                    {canPlan && callPlan && !planVisited && (
                        <Tooltip title="Remove from call plan">
                            <IconButton aria-label="Remove from call plan" onClick={() => onRemovePlan(doctor)}>
                                <DeleteOutlineRounded fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {canLog && !doctor.visitedOnDay && (
                        <Button variant={callPlan ? "contained" : "outlined"} startIcon={<PlayArrowRounded />} onClick={() => onLogVisit(doctor)}>
                            Log visit
                        </Button>
                    )}

                    <Tooltip title={open ? "Hide briefing" : "Show briefing"}>
                        <IconButton aria-label={open ? "Hide briefing" : "Show briefing"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
                            <ExpandMoreRounded
                                sx={(theme) => ({
                                    transform: open ? "rotate(180deg)" : "none",
                                    transition: theme.sidebarLayout.chevronTransition,
                                })}
                            />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            {/* Briefing */}
            <Collapse in={open} unmountOnExit>
                <Box
                    sx={(theme) => ({
                        p: theme.entityCard.padding,
                        borderTop: "1px solid",
                        borderColor: theme.palette.border.subtle,
                        backgroundColor: theme.palette.surface.subtle,
                    })}
                >
                    {callPlan && (
                        <Box
                            sx={(theme) => ({
                                mb: 2.5,
                                p: 2,
                                borderRadius: theme.calendar.cell.radius,
                                backgroundColor: theme.palette.background.paper,
                                border: "1px solid",
                                borderColor: alpha(theme.palette.submitted.main, theme.tint.strong),
                            })}
                        >
                            <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.submitted.dark })}>
                                Your plan for this call{planVisited ? " · visited" : ""}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                                {callPlan.objective}
                            </Typography>
                            {callPlan.productNames && (
                                <Typography variant="body2" sx={(theme) => ({ mt: 0.75, color: theme.palette.text.secondary })}>
                                    Products: {callPlan.productNames}
                                </Typography>
                            )}
                            {callPlan.keyMessages && (
                                <Typography variant="body2" sx={(theme) => ({ mt: 0.5, color: theme.palette.text.secondary, whiteSpace: "pre-wrap" })}>
                                    {callPlan.keyMessages}
                                </Typography>
                            )}
                        </Box>
                    )}

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                            gap: 2.5,
                        }}
                    >
                        <Fact label="Last visit">
                            {doctor.lastVisit ? (
                                <>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                        <Typography variant="subtitle2">{formatShortDate(doctor.lastVisit.date)}</Typography>
                                        {feedback && <Tag label={feedback.label} color={feedback.color} />}
                                    </Stack>
                                    <Typography variant="body2" sx={(theme) => ({ mt: 0.5, color: theme.palette.text.secondary, whiteSpace: "pre-wrap" })}>
                                        {doctor.lastVisit.notes || "No notes from that call."}
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    First call with this doctor.
                                </Typography>
                            )}
                        </Fact>

                        <Fact label="Given last time">
                            <Typography variant="body2">{doctor.lastVisit?.itemsGiven || "Nothing recorded"}</Typography>
                            <Typography variant="caption" component="p" sx={(theme) => ({ mt: 0.5, color: theme.palette.text.secondary })}>
                                {doctor.visits.target
                                    ? `${doctor.visits.done} of ${doctor.visits.target} visits this month`
                                    : `${doctor.visits.done} visit(s) this month`}
                            </Typography>
                        </Fact>

                        <Fact label="Prescription share (RCPA)">
                            {doctor.rcpa ? (
                                <>
                                    <Typography variant="subtitle2">
                                        {doctor.rcpa.share}% ours
                                        {doctor.rcpa.topCompetitor ? ` · ${doctor.rcpa.topCompetitor} leads competitors` : ""}
                                    </Typography>
                                    <Meter value={doctor.rcpa.share} color={doctor.rcpa.share >= 50 ? "success" : "warning"} />
                                </>
                            ) : (
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    No audit in the last 90 days
                                </Typography>
                            )}
                        </Fact>

                        <Fact label="Business this month">
                            {doctor.business ? (
                                <>
                                    <Typography variant="subtitle2">
                                        {formatMoney(doctor.business.actual ?? 0)} of {formatMoney(doctor.business.expected)}
                                    </Typography>
                                    <Meter
                                        value={doctor.business.expected ? ((doctor.business.actual ?? 0) / doctor.business.expected) * 100 : 0}
                                        color="primary"
                                    />
                                </>
                            ) : (
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    No target set
                                </Typography>
                            )}
                        </Fact>
                    </Box>

                    {doctor.talkingPoints.length > 0 && (
                        <Box
                            sx={(theme) => ({
                                mt: 2.5,
                                p: 2,
                                borderRadius: theme.calendar.cell.radius,
                                backgroundColor: alpha(theme.palette.primary.main, theme.tint.hover),
                                border: "1px solid",
                                borderColor: alpha(theme.palette.primary.main, theme.tint.border),
                            })}
                        >
                            <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.primary.main, mb: 1 })}>
                                Talking points
                            </Typography>
                            <Stack spacing={0.75}>
                                {doctor.talkingPoints.map((point) => (
                                    <Stack key={point} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                                        <LightbulbRounded fontSize="small" sx={(theme) => ({ mt: 0.125, color: theme.palette.warning.main })} />
                                        <Typography variant="body2">{point}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
}

export default DoctorBriefCard;
