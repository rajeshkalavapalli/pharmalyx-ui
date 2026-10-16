import { Box, Divider, Stack, Typography } from "@mui/material";
import {
    CheckRounded,
    CloseRounded,
    EditNoteRounded,
    HourglassTopRounded,
    SendRounded,
} from "@mui/icons-material";

import Panel from "../../../components/Panel/Panel";
import Timeline from "../../../components/Timeline/Timeline";
import { formatDateTime } from "../index";

// Builds only the steps that apply to the current state of the plan.
const buildSteps = (meta) => {
    const { status } = meta;
    const submitted = ["SUBMITTED", "APPROVED", "REJECTED"].includes(status);

    const steps = [
        {
            key: "draft",
            icon: EditNoteRounded,
            title: status === "NEW" ? "Not started" : "Draft created",
            caption:
                status === "NEW"
                    ? "Plan each day, then save a draft"
                    : formatDateTime(meta.createdOn),
            state: status === "NEW" || status === "DRAFT" ? "current" : "done",
            color: "secondary",
        },
        {
            key: "submitted",
            icon: SendRounded,
            title: "Sent for approval",
            caption: submitted
                ? formatDateTime(meta.submittedOn)
                : "Available once every day is planned",
            state: submitted ? "done" : "upcoming",
            color: "primary",
        },
    ];

    if (status === "APPROVED") {
        steps.push({
            key: "review",
            icon: CheckRounded,
            title: "Approved",
            caption: [meta.reviewedByName, formatDateTime(meta.reviewedOn)].filter(Boolean).join(" · "),
            note: meta.reviewRemarks,
            state: "done",
            color: "success",
        });
    } else if (status === "REJECTED") {
        steps.push({
            key: "review",
            icon: CloseRounded,
            title: "Returned for changes",
            caption: [meta.reviewedByName, formatDateTime(meta.reviewedOn)].filter(Boolean).join(" · "),
            note: meta.reviewRemarks,
            state: "current",
            color: "error",
        });
    } else {
        steps.push({
            key: "review",
            icon: HourglassTopRounded,
            title: "Manager review",
            caption: status === "SUBMITTED" ? "Waiting for a decision" : "Approve or return",
            state: status === "SUBMITTED" ? "current" : "upcoming",
            color: "warning",
        });
    }

    return steps;
};

const legendSwatchSx = (variant) => (theme) => {
    const { plan: colors } = theme.palette;
    const { hatchSize, legendSwatch, cell } = theme.calendar;

    const base = {
        width: legendSwatch,
        height: legendSwatch,
        flexShrink: 0,
        borderRadius: cell.radius / 2,
        border: "1px solid",
    };

    switch (variant) {
        case "working":
            return {
                ...base,
                backgroundColor: colors.workingSoft,
                borderColor: colors.workingBorder,
                borderLeft: `${cell.markerWidth}px solid ${colors.working}`,
            };
        case "incomplete":
            return {
                ...base,
                backgroundColor: colors.workingSoft,
                borderColor: colors.workingBorder,
                borderLeft: `${cell.markerWidth}px solid ${theme.palette.warning.main}`,
            };
        case "off":
            return {
                ...base,
                borderColor: theme.palette.border.default,
                backgroundColor: colors.offSoft,
                backgroundImage: `repeating-linear-gradient(135deg, transparent 0 ${hatchSize / 2}px, ${colors.offHatch} ${hatchSize / 2}px ${hatchSize}px)`,
            };
        case "today":
            return {
                ...base,
                borderRadius: "50%",
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.primary.main,
            };
        default:
            return {
                ...base,
                borderStyle: "dashed",
                borderColor: colors.empty,
                backgroundColor: theme.palette.surface.subtle,
            };
    }
};

const LEGEND = [
    { variant: "working", label: "Working day" },
    { variant: "incomplete", label: "Location missing" },
    { variant: "off", label: "Off / leave" },
    { variant: "empty", label: "Not planned" },
    { variant: "today", label: "Today" },
];

function PlanStatusPanel({ meta, editable }) {
    const steps = buildSteps(meta);

    return (
        <Panel title="Approval status">
            <Timeline steps={steps} />

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.text.secondary, mb: 1.5 })}>
                Legend
            </Typography>

            <Stack spacing={1.25}>
                {LEGEND.map(({ variant, label }) => (
                    <Stack
                        key={variant}
                        direction="row"
                        spacing={1.25}
                        sx={{ alignItems: "center" }}
                    >
                        <Box sx={legendSwatchSx(variant)} />
                        <Typography variant="body2">{label}</Typography>
                    </Stack>
                ))}
            </Stack>

            {editable && (
                <Typography
                    variant="caption"
                    component="p"
                    sx={(theme) => ({
                        mt: 2.5,
                        p: 1.5,
                        borderRadius: theme.calendar.cell.radius,
                        color: theme.palette.text.secondary,
                        backgroundColor: theme.palette.surface.subtle,
                    })}
                >
                    Tip: drag across several days to plan them in one go, or use Quick fill to
                    copy last month.
                </Typography>
            )}
        </Panel>
    );
}

export default PlanStatusPanel;
