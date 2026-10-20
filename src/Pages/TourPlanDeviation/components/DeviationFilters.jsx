import { Box, Button, MenuItem, TextField } from "@mui/material";
import { FilterAltOffRounded } from "@mui/icons-material";

import { DEVIATION_TYPES } from "../index";

function SelectFilter({ label, value, onChange, options }) {
    return (
        <TextField
            select
            size="small"
            fullWidth
            label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
        >
            <MenuItem value="">All</MenuItem>
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    );
}

function DeviationFilters({ filters, onChange, onClear, users, divisions, territories }) {
    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <Box
            sx={(theme) => ({
                display: "grid",
                gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(5, minmax(0, 1fr)) auto",
                },
                gap: theme.panel.gap,
                alignItems: "center",
            })}
        >
            <TextField
                label="Month"
                type="month"
                size="small"
                fullWidth
                value={filters.month}
                onChange={(event) => onChange("month", event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
            />

            {/* Only people with a team choose a representative (an MR sees just their own). */}
            {users.length > 1 && (
                <SelectFilter
                    label="Representative"
                    value={filters.userId}
                    onChange={(value) => onChange("userId", value)}
                    options={users.map((user) => ({ value: user.id, label: user.name }))}
                />
            )}

            <SelectFilter
                label="Division"
                value={filters.divisionId}
                onChange={(value) => onChange("divisionId", value)}
                options={divisions.map((division) => ({
                    value: division.DivisionId,
                    label: division.DivisionName,
                }))}
            />

            <SelectFilter
                label="Territory"
                value={filters.territoryId}
                onChange={(value) => onChange("territoryId", value)}
                options={territories.map((territory) => ({
                    value: territory.TerritoryId,
                    label: territory.TerritoryName,
                }))}
            />

            <SelectFilter
                label="Deviation type"
                value={filters.deviationType}
                onChange={(value) => onChange("deviationType", value)}
                options={DEVIATION_TYPES.map((type) => ({ value: type, label: type }))}
            />

            <Button
                startIcon={<FilterAltOffRounded />}
                disabled={!hasFilters}
                onClick={onClear}
                sx={{ justifySelf: { xs: "start", lg: "auto" } }}
            >
                Clear
            </Button>
        </Box>
    );
}

export default DeviationFilters;
