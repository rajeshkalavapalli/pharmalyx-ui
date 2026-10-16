import {
    Avatar,
    Box,
    Button,
    Chip,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AutoAwesomeRounded,
    ChevronRightRounded,
    EastRounded,
    PersonOutlineRounded,
    RouteRounded,
} from "@mui/icons-material";

import StatusChip from "../../../components/StatusChip/StatusChip";
import {
    DEVIATION_STATUS,
    SYSTEM_SOURCE,
    formatDate,
    formatWeekday,
    initials,
} from "../index";

const truncateLines = (lines) => ({
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    overflowWrap: "anywhere",
});

function Location({ label, territory, area, highlight }) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography
                variant="micro"
                component="p"
                sx={(theme) => ({ color: theme.palette.text.secondary })}
            >
                {label}
            </Typography>

            <Typography
                variant="body2"
                sx={(theme) => ({
                    ...truncateLines(1),
                    fontWeight: theme.typography.subtitle2.fontWeight,
                    color: highlight ? theme.palette.primary.dark : theme.palette.text.primary,
                })}
            >
                {territory || "Not planned"}
            </Typography>

            {area && (
                <Typography
                    variant="caption"
                    component="p"
                    sx={(theme) => ({ ...truncateLines(1), color: theme.palette.text.secondary })}
                >
                    {area}
                </Typography>
            )}
        </Box>
    );
}

function EmptyState() {
    return (
        <Box sx={(theme) => ({ py: theme.table.emptyPaddingY, textAlign: "center" })}>
            <RouteRounded
                sx={(theme) => ({
                    fontSize: theme.table.emptyIconSize,
                    color: theme.palette.text.disabled,
                })}
            />
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
                No deviations found
            </Typography>
            <Typography
                variant="body2"
                sx={(theme) => ({ color: theme.palette.text.secondary })}
            >
                Try a different month or clear the filters.
            </Typography>
        </Box>
    );
}

const COLUMNS = ["Date", "Representative", "Planned → Actual", "Type", "Reason", "Status", ""];

function DeviationTable({ rows, loading, onOpen }) {
    return (
        <Box sx={{ overflowX: "auto" }}>
            <Table
                sx={(theme) => ({
                    opacity: loading ? theme.table.loadingOpacity : 1,
                    transition: theme.calendar.transition,
                })}
            >
                <TableHead>
                    <TableRow>
                        {COLUMNS.map((column) => (
                            <TableCell key={column}>{column}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={COLUMNS.length}>
                                {loading ? (
                                    <Typography
                                        variant="body2"
                                        sx={(theme) => ({
                                            py: theme.table.emptyPaddingY,
                                            textAlign: "center",
                                            color: theme.palette.text.secondary,
                                        })}
                                    >
                                        Loading deviations…
                                    </Typography>
                                ) : (
                                    <EmptyState />
                                )}
                            </TableCell>
                        </TableRow>
                    )}

                    {rows.map((row) => {
                        const status = DEVIATION_STATUS[row.Status] || DEVIATION_STATUS.PENDING;
                        const systemDetected = row.Source === SYSTEM_SOURCE;

                        return (
                            <TableRow
                                key={row.DeviationId}
                                hover
                                onClick={() => onOpen(row.DeviationId)}
                                sx={{ cursor: "pointer" }}
                            >
                                <TableCell>
                                    <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap" }}>
                                        {formatDate(row.DeviationDate)}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        component="p"
                                        sx={(theme) => ({ color: theme.palette.text.secondary })}
                                    >
                                        {formatWeekday(row.DeviationDate)}
                                    </Typography>
                                </TableCell>

                                <TableCell>
                                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                                        <Avatar
                                            sx={(theme) => ({
                                                width: theme.avatar.sizeSmall,
                                                height: theme.avatar.sizeSmall,
                                                ...theme.typography.caption,
                                                fontWeight: theme.typography.subtitle2.fontWeight,
                                                color: theme.palette.primary.dark,
                                                backgroundColor: alpha(
                                                    theme.palette.primary.main,
                                                    theme.tint.soft
                                                ),
                                            })}
                                        >
                                            {initials(row.UserName)}
                                        </Avatar>

                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap" }}>
                                                {row.UserName}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                component="p"
                                                sx={(theme) => ({
                                                    whiteSpace: "nowrap",
                                                    color: theme.palette.text.secondary,
                                                })}
                                            >
                                                {row.DesignationName || row.UserCode || "—"}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>

                                <TableCell>
                                    <Stack
                                        direction="row"
                                        spacing={1.5}
                                        sx={(theme) => ({
                                            alignItems: "center",
                                            minWidth: theme.table.textMaxWidth,
                                        })}
                                    >
                                        <Location
                                            label="Planned"
                                            territory={row.PlannedTerritoryName}
                                            area={row.PlannedAreaName}
                                        />

                                        <EastRounded
                                            fontSize="small"
                                            sx={(theme) => ({
                                                flexShrink: 0,
                                                color: theme.palette.text.disabled,
                                            })}
                                        />

                                        <Location
                                            label="Actual"
                                            territory={row.ActualTerritoryName}
                                            area={row.ActualAreaName}
                                            highlight
                                        />
                                    </Stack>
                                </TableCell>

                                <TableCell>
                                    <Stack spacing={0.75} sx={{ alignItems: "flex-start" }}>
                                        <Chip size="small" variant="outlined" label={row.DeviationType} />

                                        <Typography
                                            variant="micro"
                                            sx={(theme) => ({
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                whiteSpace: "nowrap",
                                                color: systemDetected
                                                    ? theme.palette.primary.main
                                                    : theme.palette.text.secondary,
                                            })}
                                        >
                                            {systemDetected ? (
                                                <AutoAwesomeRounded fontSize="inherit" />
                                            ) : (
                                                <PersonOutlineRounded fontSize="inherit" />
                                            )}
                                            {row.Source}
                                        </Typography>
                                    </Stack>
                                </TableCell>

                                <TableCell>
                                    <Tooltip title={row.Reason || ""} placement="top-start">
                                        <Typography
                                            variant="body2"
                                            sx={(theme) => ({
                                                ...truncateLines(2),
                                                maxWidth: theme.table.textMaxWidth,
                                            })}
                                        >
                                            {row.Reason}
                                        </Typography>
                                    </Tooltip>
                                </TableCell>

                                <TableCell>
                                    <StatusChip label={status.label} color={status.color} />
                                </TableCell>

                                <TableCell align="right">
                                    {row.canReview ? (
                                        <Button size="small" variant="contained">
                                            Review
                                        </Button>
                                    ) : (
                                        <IconButton size="small" aria-label="View details">
                                            <ChevronRightRounded />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Box>
    );
}

export default DeviationTable;
