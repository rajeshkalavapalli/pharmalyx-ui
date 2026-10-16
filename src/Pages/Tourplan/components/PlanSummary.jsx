import { Box } from "@mui/material";
import {
    EventAvailableRounded,
    EventBusyRounded,
    MapRounded,
    WorkOutlineRounded,
} from "@mui/icons-material";

import StatCard from "../../../components/StatCard/StatCard";

function PlanSummary({ summary }) {
    const progress = summary.totalDays ? (summary.planned / summary.totalDays) * 100 : 0;

    return (
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
                icon={EventAvailableRounded}
                label="Days planned"
                value={`${summary.planned} / ${summary.totalDays}`}
                caption={
                    summary.isComplete
                        ? "Ready to send for approval"
                        : `${summary.remaining} day${summary.remaining === 1 ? "" : "s"} left`
                }
                color="primary"
                progress={progress}
            />

            <StatCard
                icon={WorkOutlineRounded}
                label="Working days"
                value={summary.working}
                caption="In the field"
                color="success"
            />

            <StatCard
                icon={EventBusyRounded}
                label="Off days"
                value={summary.off}
                caption="Holidays, leave, weekends"
                color="info"
            />

            <StatCard
                icon={MapRounded}
                label="Territories"
                value={summary.territories}
                caption="Covered this month"
                color="warning"
            />
        </Box>
    );
}

export default PlanSummary;
