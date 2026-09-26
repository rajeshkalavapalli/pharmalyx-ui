import {
    Box,
    Button,
    MenuItem,
    Select,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Paper,
    Divider,
    Autocomplete,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import { useEffect, useState } from "react";

import { useFormik } from "formik";
import * as yup from "yup";

import ConfirmationDialog from "../../../components/conformationDialog/ConformationDialog";

import {
    getcountry,
    getstates,
    createTerriTory,
} from "../index";

function AddNewTerritoty({
    onTerritoryCreated,
    onClose,
}) {
    const [closeDialog, setcloseDialog] =
        useState(false);

    const [countries, setCountries] =
        useState([]);

    const [states, setStates] =
        useState([]);

    useEffect(() => {
        HandleGetCountries();
    }, []);

    // =====================================================
    // COMMON FIELD STYLE
    // =====================================================

    const fieldSx = {
        "& .MuiOutlinedInput-root": {
            minHeight: 46,
            borderRadius: 1.5,
            backgroundColor: "background.paper",
            transition:
                "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",

            "& fieldset": {
                borderColor: "divider",
            },

            "&:hover fieldset": {
                borderColor: "primary.light",
            },

            "&.Mui-focused": {
                boxShadow: (theme) =>
                    `0 0 0 3px ${alpha(
                        theme.palette.primary.main,
                        0.08
                    )}`,
            },

            "&.Mui-focused fieldset": {
                borderColor: "primary.main",
                borderWidth: 1,
            },
        },

        "& .MuiInputLabel-root": {
            fontSize: 13,
            color: "text.secondary",
        },

        "& .MuiInputLabel-root.Mui-focused": {
            color: "primary.main",
        },

        "& .MuiInputBase-input": {
            fontSize: 13,
            color: "text.primary",
        },

        "& .MuiSelect-select": {
            fontSize: 13,
        },

        "& .MuiFormHelperText-root": {
            fontSize: 11,
            marginLeft: 0.5,
            marginTop: 0.5,
        },
    };

    // =====================================================
    // VALIDATION
    // =====================================================

    const validationSchema = yup.object({
        TerritoryName: yup
            .string()
            .trim()
            .required("Territory name is required"),

        CountryId: yup
            .string()
            .required("country name is required"),

        StateId: yup
            .string()
            .required("state is required"),

        isActive: yup
            .boolean()
            .required(),
    });

    // =====================================================
    // FORMIK
    // =====================================================

    const formik = useFormik({
        initialValues: {
            TerritoryName: "",
            CountryId: "",
            StateId: "",
            isActive: true,
        },

        validationSchema,

        onSubmit: async (values) => {
            try {
                const TerritoryPayload = {
                    TerritoryName:
                        values.TerritoryName.trim(),

                    isActive:
                        values.isActive,

                    CountryId:
                        values.CountryId,

                    StateId:
                        values.StateId,
                };

                console.log(
                    "Territory payload:",
                    TerritoryPayload
                );

                const response =
                    await createTerriTory(
                        TerritoryPayload
                    );

                onTerritoryCreated(
                    "Territory created successfully",
                    "success"
                );

                console.log(
                    "territory cerated sucessfully ",
                    response
                );
            } catch (err) {
                console.log(
                    "error creating territory:",
                    err
                );
            }
        },
    });

    // =====================================================
    // CLOSE
    // =====================================================

    const handleCloseDialog = () => {
        setcloseDialog(true);
    };

    // =====================================================
    // GET COUNTRIES
    // =====================================================

    const HandleGetCountries = async () => {
        try {
            const loadcontries =
                await getcountry();

            console.log(
                "countries response",
                loadcontries
            );

            setCountries(
                loadcontries.country || []
            );
        } catch (err) {
            console.log(
                "error getting countries",
                err
            );
        }
    };

    // =====================================================
    // GET STATES
    // =====================================================

    const HandleGetstates = async (
        CountryId
    ) => {
        try {
            const loadsates =
                await getstates(CountryId);

            console.log(
                "satelist",
                loadsates
            );

            setStates(
                loadsates.states || []
            );
        } catch (err) {
            console.log(
                "error getting states",
                err
            );
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                width: "100%",
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor:
                    "background.paper",
                overflow: "hidden",
                boxShadow:
                    "0 8px 30px rgba(32, 37, 34, 0.055)",
            }}
        >
            {/* ================================================= */}
            {/* FORM HEADER */}
            {/* ================================================= */}

            <Box
                sx={{
                    px: {
                        xs: 2.5,
                        md: 3,
                    },
                    py: {
                        xs: 2.5,
                        md: 3,
                    },
                    backgroundColor:
                        "background.paper",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems:
                            "flex-start",
                        gap: 1.25,
                    }}
                >
                    {/* HEADER ACCENT */}

                    <Box
                        sx={{
                            width: 3,
                            minWidth: 3,
                            height: 44,
                            mt: 0.2,
                            borderRadius: 10,
                            backgroundColor:
                                "primary.main",
                            boxShadow:
                                "0 0 12px rgba(196, 93, 69, 0.07)",
                        }}
                    />

                    {/* HEADER CONTENT */}

                    <Box>
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: 19,
                                    md: 22,
                                },
                                fontWeight: 700,
                                color:
                                    "text.primary",
                                letterSpacing:
                                    "-0.025em",
                                lineHeight: 1.25,
                            }}
                        >
                            Create Territory
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.55,
                                fontSize: 13,
                                lineHeight: 1.5,
                                color:
                                    "text.secondary",
                                maxWidth: 640,
                            }}
                        >
                            Add a new geographical
                            territory.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider />

            {/* ================================================= */}
            {/* FORM CONTENT */}
            {/* ================================================= */}

            <Box
                sx={{
                    px: {
                        xs: 2.5,
                        md: 3,
                    },
                    py: {
                        xs: 3,
                        md: 3.25,
                    },
                    maxWidth: 900,
                }}
            >
                {/* ============================================= */}
                {/* SECTION HEADER */}
                {/* ============================================= */}

                <Box
                    sx={{
                        display: "flex",
                        alignItems:
                            "flex-start",
                        gap: 1.25,
                        mb: 2.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 3,
                            minHeight: 36,
                            borderRadius: 2,
                            backgroundColor:
                                "primary.main",
                            flexShrink: 0,
                            mt: 0.15,
                        }}
                    />

                    <Box>
                        <Typography
                            sx={{
                                fontSize: 15,
                                fontWeight: 700,
                                color:
                                    "text.primary",
                                letterSpacing:
                                    "-0.01em",
                                lineHeight: 1.35,
                            }}
                        >
                            Territory Information
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.4,
                                fontSize: 12.5,
                                color:
                                    "text.secondary",
                                lineHeight: 1.5,
                            }}
                        >
                            Configure the geographical
                            details of the territory.
                        </Typography>
                    </Box>
                </Box>

                {/* ============================================= */}
                {/* FORM FIELDS */}
                {/* ============================================= */}

                <Box
                    sx={{
                        display: "flex",
                        flexDirection:
                            "column",
                        gap: 2.25,
                    }}
                >
                    {/* TERRITORY NAME */}

                    <TextField
                        label="Territory Name"
                        placeholder="Enter territory name"
                        fullWidth
                        name="TerritoryName"
                        sx={fieldSx}
                        value={
                            formik.values
                                .TerritoryName
                        }
                        onChange={
                            formik.handleChange
                        }
                        onBlur={
                            formik.handleBlur
                        }
                        error={
                            formik.touched
                                .TerritoryName &&
                            Boolean(
                                formik.errors
                                    .TerritoryName
                            )
                        }
                        helperText={
                            formik.touched
                                .TerritoryName &&
                            formik.errors
                                .TerritoryName
                        }
                    />

                    {/* COUNTRY */}

                    <Autocomplete
                        options={countries}
                        getOptionLabel={(
                            country
                        ) =>
                            country.CountryName
                        }
                        onChange={(
                            event,
                            value
                        ) => {
                            formik.setFieldValue(
                                "CountryId",
                                value
                                    ? value.CountryId
                                    : ""
                            );

                            console.log(value);

                            if (value) {
                                HandleGetstates(
                                    value.CountryId
                                );
                            } else {
                                setStates([]);
                                formik.setFieldValue(
                                    "StateId",
                                    ""
                                );
                            }
                        }}
                        onBlur={() => {
                            formik.setFieldTouched(
                                "CountryId",
                                true
                            );
                        }}
                        renderInput={(
                            params
                        ) => (
                            <TextField
                                {...params}
                                label="Country"
                                sx={fieldSx}
                                error={
                                    formik.touched
                                        .CountryId &&
                                    Boolean(
                                        formik.errors
                                            .CountryId
                                    )
                                }
                                helperText={
                                    formik.touched
                                        .CountryId &&
                                    formik.errors
                                        .CountryId
                                }
                            />
                        )}
                        sx={{
                            ...fieldSx,

                            "& .MuiAutocomplete-inputRoot":
                                {
                                    minHeight: 46,
                                    borderRadius: 1.5,
                                },

                            "& .MuiAutocomplete-input":
                                {
                                    fontSize: 13,
                                },
                        }}
                    />

                    {/* STATE */}

                    <Autocomplete
                        options={states}
                        getOptionLabel={(
                            state
                        ) =>
                            state.StateName
                        }
                        value={
                            states.find(
                                (state) =>
                                    state.StateId ===
                                    formik.values
                                        .StateId
                            ) || null
                        }
                        onChange={(
                            event,
                            value
                        ) => {
                            formik.setFieldValue(
                                "StateId",
                                value
                                    ? value.StateId
                                    : ""
                            );
                        }}
                        onBlur={() => {
                            formik.setFieldTouched(
                                "StateId",
                                true
                            );
                        }}
                        renderInput={(
                            params
                        ) => (
                            <TextField
                                {...params}
                                label="State"
                                sx={fieldSx}
                                error={
                                    formik.touched
                                        .StateId &&
                                    Boolean(
                                        formik.errors
                                            .StateId
                                    )
                                }
                                helperText={
                                    formik.touched
                                        .StateId &&
                                    formik.errors
                                        .StateId
                                }
                            />
                        )}
                        sx={{
                            ...fieldSx,

                            "& .MuiAutocomplete-inputRoot":
                                {
                                    minHeight: 46,
                                    borderRadius: 1.5,
                                },

                            "& .MuiAutocomplete-input":
                                {
                                    fontSize: 13,
                                },
                        }}
                    />

                    {/* STATUS */}

                    <FormControl
                        fullWidth
                        sx={fieldSx}
                    >
                        <InputLabel>
                            Status
                        </InputLabel>

                        <Select
                            label="Status"
                            name="isActive"
                            value={
                                formik.values
                                    .isActive
                            }
                            onChange={
                                formik.handleChange
                            }
                            onBlur={
                                formik.handleBlur
                            }
                        >
                            <MenuItem value={true}>
                                Active
                            </MenuItem>

                            <MenuItem value={false}>
                                Inactive
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Divider />

            {/* ================================================= */}
            {/* ACTION BAR */}
            {/* ================================================= */}

            <Box
                sx={{
                    px: {
                        xs: 2.5,
                        md: 3,
                    },
                    py: 2,
                    display: "flex",
                    justifyContent:
                        "flex-end",
                    alignItems: "center",
                    gap: 1.25,
                    backgroundColor:
                        "background.default",
                }}
            >
                {/* CLOSE */}

                <Button
                    variant="outlined"
                    onClick={
                        handleCloseDialog
                    }
                    sx={{
                        minWidth: 96,
                        height: 40,
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontSize: 13,
                        fontWeight: 600,
                        borderColor:
                            "divider",
                        color:
                            "text.secondary",
                        backgroundColor:
                            "background.paper",

                        "&:hover": {
                            borderColor:
                                "primary.light",
                            color:
                                "text.primary",
                            backgroundColor:
                                "action.hover",
                        },
                    }}
                >
                    Close
                </Button>

                {/* CREATE */}

                <Button
                    variant="contained"
                    onClick={
                        formik.handleSubmit
                    }
                    disabled={
                        formik.isSubmitting
                    }
                    sx={{
                        minWidth: 150,
                        height: 40,
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontSize: 13,
                        fontWeight: 700,
                        boxShadow: "none",

                        "&:hover": {
                            boxShadow: (
                                theme
                            ) =>
                                theme.shadows[3],
                        },
                    }}
                >
                    {formik.isSubmitting
                        ? "Creating..."
                        : "Create Territory"}
                </Button>
            </Box>

            {/* ================================================= */}
            {/* CONFIRMATION */}
            {/* ================================================= */}

            <ConfirmationDialog
                open={closeDialog}
                title="Close Territory"
                message="Are you sure you want to close?"
                onCancel={() => {
                    setcloseDialog(false);
                }}
                onConfirm={() => {
                    setcloseDialog(false);
                }}
            />
        </Paper>
    );
}

export default AddNewTerritoty;