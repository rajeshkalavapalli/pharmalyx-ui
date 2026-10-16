import { Box, ButtonBase, Typography } from "@mui/material";
import { ChevronRightRounded } from "@mui/icons-material";

import Panel from "../../../components/Panel/Panel";
import { formatDayHeading } from "../index";

// DCRs from direct reports waiting for the signed-in manager.
function ReviewQueue({ reviews, onOpen }) {
    if (reviews.length === 0) return null;

    return (
        <Panel
            title="Waiting for your review"
            subtitle={`${reviews.length} DCR${reviews.length === 1 ? "" : "s"} from your team`}
            sx={(theme) => ({ mb: theme.pageHeader.marginBottom })}
        >
            <Box
                sx={(theme) => ({
                    display: "grid",
                    gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${theme.entityCard.minWidth}px), 1fr))`,
                    gap: 1.25,
                })}
            >
                {reviews.map((review) => (
                    <ButtonBase
                        key={review.DcrId}
                        onClick={() => onOpen(review)}
                        sx={(theme) => ({
                            p: 1.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            textAlign: "left",
                            borderRadius: theme.calendar.cell.radius,
                            border: "1px solid",
                            borderColor: theme.palette.border.default,
                            backgroundColor: theme.palette.surface.subtle,
                            transition: theme.calendar.transition,

                            "&:hover": {
                                borderColor: theme.palette.border.strong,
                                backgroundColor: theme.palette.background.paper,
                            },
                        })}
                    >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2">{review.UserName}</Typography>
                            <Typography
                                variant="caption"
                                component="p"
                                sx={(theme) => ({ color: theme.palette.text.secondary })}
                            >
                                {formatDayHeading(review.ReportDate)} · {review.VisitCount} visit
                                {review.VisitCount === 1 ? "" : "s"} · {review.DistanceKm} km
                            </Typography>
                        </Box>

                        <ChevronRightRounded sx={(theme) => ({ color: theme.palette.text.secondary })} />
                    </ButtonBase>
                ))}
            </Box>
        </Panel>
    );
}

export default ReviewQueue;
