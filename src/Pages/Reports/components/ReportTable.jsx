import { Box, Typography } from "@mui/material";

// Plain report table: sticky header, horizontal scroll on small screens.
// columns: [{ key, label, align?, render?: (row) => node, csv: (row) => value }]; render falls back to csv.
function ReportTable({ columns, rows, rowKey, empty = "No data for these filters.", maxHeight }) {
    if (!rows.length) {
        return (
            <Typography variant="body2" sx={(theme) => ({ py: 4, textAlign: "center", color: theme.palette.text.secondary })}>
                {empty}
            </Typography>
        );
    }

    return (
        <Box sx={(theme) => ({ maxWidth: "100%", overflow: "auto", maxHeight: maxHeight ?? theme.reports.tableMaxHeight })}>
            <Box
                component="table"
                sx={(theme) => ({
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    "& th, & td": {
                        ...theme.typography.body2,
                        textAlign: "left",
                        py: 1,
                        px: 1.25,
                        borderBottom: "1px solid",
                        borderColor: theme.palette.border.subtle,
                        whiteSpace: "nowrap",
                    },
                    "& th": {
                        ...theme.typography.caption,
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        fontWeight: theme.typography.subtitle2.fontWeight,
                        color: theme.palette.text.secondary,
                        backgroundColor: theme.palette.surface.muted,
                    },
                    "& tbody tr:hover td": { backgroundColor: theme.palette.surface.subtle },
                    "& tbody tr:last-of-type td": { borderBottom: 0 },
                    "& .align-right": { textAlign: "right", fontVariantNumeric: "tabular-nums" },
                })}
            >
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className={column.align === "right" ? "align-right" : undefined}>
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={rowKey(row)}>
                            {columns.map((column) => (
                                <td key={column.key} className={column.align === "right" ? "align-right" : undefined}>
                                    {column.render ? column.render(row) : column.csv(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Box>
        </Box>
    );
}

export default ReportTable;
