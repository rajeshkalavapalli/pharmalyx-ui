import { Box, MenuItem, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";

import { DOCTOR_CATEGORY } from "../index";

// Category, call frequency and personal occasions for the doctor master form.
function EngagementFields({ formik, disabled }) {
    const fieldError = (name) => ({
        error: Boolean(formik.touched[name] && formik.errors[name]),
        helperText: formik.touched[name] && formik.errors[name],
    });

    const handleCategoryChange = (event) => {
        const category = event.target.value;

        formik.setFieldValue("category", category);

        // Suggest the usual frequency when none has been entered yet.
        if (category && formik.values.visitsPerMonth === "") {
            formik.setFieldValue("visitsPerMonth", DOCTOR_CATEGORY[category].visits);
        }
    };

    return (
        <Box
            sx={(theme) => ({
                gridColumn: "1 / -1",
                display: "grid",
                gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                },
                gap: theme.layout.section.fieldGap,
            })}
        >
            <Box
                sx={(theme) => ({
                    gridColumn: "1 / -1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    px: 1.25,
                    py: 0.75,
                    borderRadius: theme.calendar.cell.radius,
                    backgroundColor: theme.palette.surface.muted,
                })}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Box
                        sx={(theme) => ({
                            width: theme.avatar.sizeSmall,
                            height: theme.avatar.sizeSmall,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            borderRadius: theme.field.radius,
                            color: theme.palette.primary.main,
                            backgroundColor: alpha(theme.palette.primary.main, theme.tint.soft),
                        })}
                    >
                        <InsightsRoundedIcon fontSize="small" />
                    </Box>

                    <Typography variant="subtitle1" component="h3">
                        Engagement
                    </Typography>
                </Box>

                <Typography
                    variant="caption"
                    sx={(theme) => ({ color: theme.palette.text.secondary, textAlign: "right" })}
                >
                    Visit priority and personal occasions
                </Typography>
            </Box>

            <TextField
                select
                label="Category"
                name="category"
                value={formik.values.category}
                onChange={handleCategoryChange}
                onBlur={formik.handleBlur}
                disabled={disabled}
                {...fieldError("category")}
            >
                <MenuItem value="">Not set</MenuItem>
                {Object.entries(DOCTOR_CATEGORY).map(([value, category]) => (
                    <MenuItem key={value} value={value}>
                        {category.label} · {category.hint}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                label="Visits per month"
                name="visitsPerMonth"
                type="number"
                value={formik.values.visitsPerMonth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={disabled}
                slotProps={{ htmlInput: { min: 0, max: 31, step: 1 } }}
                {...fieldError("visitsPerMonth")}
            />

            <TextField
                label="Date of birth"
                name="dateOfBirth"
                type="date"
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={disabled}
                slotProps={{ inputLabel: { shrink: true } }}
                {...fieldError("dateOfBirth")}
            />

            <TextField
                label="Anniversary"
                name="anniversaryDate"
                type="date"
                value={formik.values.anniversaryDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={disabled}
                slotProps={{ inputLabel: { shrink: true } }}
                {...fieldError("anniversaryDate")}
            />
        </Box>
    );
}

export default EngagementFields;
