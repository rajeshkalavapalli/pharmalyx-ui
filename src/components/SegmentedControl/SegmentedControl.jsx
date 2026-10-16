import { ToggleButton, ToggleButtonGroup } from "@mui/material";

// Pill-style single choice control. options: [{ value, label, icon? }]
function SegmentedControl({ value, options, onChange, fullWidth = false, disabled = false }) {
    return (
        <ToggleButtonGroup
            exclusive
            fullWidth={fullWidth}
            disabled={disabled}
            value={value}
            onChange={(event, next) => {
                if (next !== null) {
                    onChange(next);
                }
            }}
            sx={(theme) => ({
                p: theme.segmented.padding,
                gap: theme.segmented.gap,
                borderRadius: theme.segmented.radius,
                backgroundColor: theme.palette.surface.muted,

                "& .MuiToggleButtonGroup-grouped": {
                    m: 0,
                    border: 0,
                    borderRadius: theme.segmented.itemRadius,
                },

                "& .MuiToggleButton-root": {
                    minHeight: theme.segmented.itemHeight,
                    px: theme.segmented.itemPaddingX,
                    gap: theme.segmented.itemGap,
                    ...theme.typography.subtitle2,
                    textTransform: "none",
                    color: theme.palette.text.secondary,
                    transition: theme.field.transition,

                    "& .MuiSvgIcon-root": {
                        fontSize: theme.segmented.iconSize,
                    },

                    "&:hover": {
                        color: theme.palette.text.primary,
                        backgroundColor: "transparent",
                    },

                    "&.Mui-selected, &.Mui-selected:hover": {
                        color: theme.palette.text.primary,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.segmented.selectedShadow,
                    },
                },
            })}
        >
            {options.map(({ value: optionValue, label, icon: Icon }) => (
                <ToggleButton key={optionValue} value={optionValue}>
                    {Icon && <Icon />}
                    {label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}

export default SegmentedControl;
