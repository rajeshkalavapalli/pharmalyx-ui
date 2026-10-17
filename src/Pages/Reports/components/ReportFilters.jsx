import { Autocomplete, Box, MenuItem, TextField } from "@mui/material";

import Panel from "../../../components/Panel/Panel";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import { RANGE_PRESETS, toKey } from "../index";

// Date range (quick picks or custom), employee from your hierarchy, territory, and optionally product.
function ReportFilters({ filters, onChange, options, showProduct = false }) {
    const users = options?.users || [];
    const today = toKey(new Date());

    const set = (patch) => onChange({ ...filters, ...patch });

    const setPreset = (preset) => {
        const config = RANGE_PRESETS.find((item) => item.value === preset);
        if (config?.range) {
            const [from, to] = config.range(new Date());
            set({ preset, from, to });
        } else {
            set({ preset });
        }
    };

    const selectedUser = users.find((user) => user.UserId === filters.userId) || null;

    return (
        <Panel sx={(theme) => ({ mb: theme.stat.gap })}>
            <Box
                sx={{
                    display: "grid",
                    gap: 1.5,
                    alignItems: "center",
                    gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                }}
            >
                <Box sx={{ maxWidth: "100%", overflowX: "auto", gridColumn: { md: "span 2", lg: "span 4" } }}>
                    <SegmentedControl value={filters.preset} onChange={setPreset} options={RANGE_PRESETS.map(({ value, label }) => ({ value, label }))} />
                </Box>

                <TextField
                    size="small"
                    type="date"
                    label="From"
                    value={filters.from}
                    onChange={(event) => set({ preset: "custom", from: event.target.value })}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: filters.to || today } }}
                />
                <TextField
                    size="small"
                    type="date"
                    label="To"
                    value={filters.to}
                    onChange={(event) => set({ preset: "custom", to: event.target.value })}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: filters.from } }}
                />

                <Autocomplete
                    size="small"
                    options={users}
                    value={selectedUser}
                    onChange={(event, user) => set({ userId: user?.UserId || "" })}
                    getOptionLabel={(user) => (user.IsSelf ? `${user.Name} (me)` : user.Name)}
                    isOptionEqualToValue={(option, value) => option.UserId === value.UserId}
                    renderOption={(props, user) => {
                        const { key, ...rest } = props;
                        return (
                            <li key={key} {...rest}>
                                <Box>
                                    <Box component="span">{user.IsSelf ? `${user.Name} (me)` : user.Name}</Box>
                                    <Box component="span" sx={(theme) => ({ display: "block", ...theme.typography.caption, color: theme.palette.text.secondary })}>
                                        {[user.DesignationName, user.ManagerName ? `reports to ${user.ManagerName}` : null].filter(Boolean).join(" · ")}
                                    </Box>
                                </Box>
                            </li>
                        );
                    }}
                    renderInput={(params) => <TextField {...params} label="Employee" placeholder={users.length > 1 ? "Everyone in my team" : ""} />}
                />

                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: showProduct ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)" }}>
                    <TextField select size="small" label="Territory" value={filters.territoryId} onChange={(event) => set({ territoryId: event.target.value })}>
                        <MenuItem value="">All territories</MenuItem>
                        {(options?.territories || []).map((territory) => (
                            <MenuItem key={territory.TerritoryId} value={territory.TerritoryId}>
                                {territory.TerritoryName}
                            </MenuItem>
                        ))}
                    </TextField>
                    {showProduct && (
                        <TextField select size="small" label="Product" value={filters.productId} onChange={(event) => set({ productId: event.target.value })}>
                            <MenuItem value="">All products</MenuItem>
                            {(options?.products || []).map((product) => (
                                <MenuItem key={product.ProductId} value={product.ProductId}>
                                    {product.ProductName}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                </Box>
            </Box>
        </Panel>
    );
}

export default ReportFilters;
