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
} from "@mui/material";

import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";

import ConfirmationDialog from "../../../components/conformationDialog/ConformationDialog";
import { createDivision } from "../../Division/index";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";


function AddNewDivision({
    onDivisionCreated,
    onClose,
}) {

    const [closeDialog, setcloseDialog] =
        useState(false);

    const { showSnackbar } =
        useSnackbar();


    // =====================================================
    // COMMON FIELD STYLE
    // =====================================================

    const fieldSx = {

        "& .MuiOutlinedInput-root": {

            minHeight: 42,

            borderRadius: 1.5,

            backgroundColor:
                "background.paper",

            transition:
                "border-color 160ms ease, box-shadow 160ms ease",


            "& fieldset": {

                borderColor:
                    "divider",

            },


            "&:hover fieldset": {

                borderColor:
                    "primary.light",

            },


            "&.Mui-focused fieldset": {

                borderColor:
                    "primary.main",

                borderWidth: 1,

            },

        },


        "& .MuiInputLabel-root": {

            fontSize: 13,

            color:
                "text.secondary",

        },


        "& .MuiInputLabel-root.Mui-focused": {

            color:
                "primary.main",

        },


        "& .MuiInputBase-input": {

            fontSize: 13,

        },


        "& .MuiSelect-select": {

            fontSize: 13,

        },


        "& .MuiFormHelperText-root": {

            fontSize: 11,

            marginLeft: 0.25,

            marginTop: 0.5,

        },

    };


    // =====================================================
    // CLOSE DIALOG
    // =====================================================

    const handleDialog = () => {

        setcloseDialog(true);

    };


    // =====================================================
    // VALIDATION
    // =====================================================

    const validationSchema =
        yup.object({

            DivisionName:
                yup
                    .string()
                    .trim()
                    .required(
                        "Division name is required"
                    ),

            Description:
                yup
                    .string()
                    .max(
                        700,
                        "Description cannot exceed 700 characters"
                    ),

            isActive:
                yup
                    .boolean()
                    .required(),

        });


    // =====================================================
    // FORMIK
    // =====================================================

    const formik =
        useFormik({

            initialValues: {

                DivisionName: "",

                Description: "",

                isActive: true,

            },


            validationSchema,


            onSubmit:
                async (values) => {

                    try {

                        const DivisionPayload = {

                            DivisionName:
                                values.DivisionName,

                            Description:
                                values.Description,

                            isActive:
                                values.isActive,

                        };


                        const result =
                            await createDivision(
                                DivisionPayload
                            );


                        console.log(
                            "division created:",
                            result
                        );


                        // =========================================
                        // SUCCESS
                        // =========================================

                        showSnackbar(
                            "Division created successfully",
                            "success"
                        );


                        // Only used after successful creation
                        onDivisionCreated();


                    } catch (err) {

                        console.log(
                            "error creating division:",
                            err
                        );


                        // =========================================
                        // ERROR
                        // =========================================

                        showSnackbar(
                            "Failed to create division",
                            "error"
                        );

                    }

                },

        });


    return (

        <Paper
            elevation={0}

            sx={{

                width: "100%",

                borderRadius: 2.5,

                border: "1px solid",

                borderColor:
                    "divider",

                backgroundColor:
                    "background.paper",

                overflow:
                    "hidden",

            }}
        >


            {/* ================================================= */}
            {/* FORM HEADER */}
            {/* ================================================= */}

            <Box
                sx={{

                    px: {
                        xs: 2.5,
                        md: 3.5,
                    },

                    py: {
                        xs: 2.5,
                        md: 3,
                    },

                }}
            >

                <Typography
                    sx={{

                        fontSize: {
                            xs: 18,
                            md: 20,
                        },

                        fontWeight: 650,

                        color:
                            "text.primary",

                        letterSpacing:
                            "-0.025em",

                        lineHeight: 1.25,

                    }}
                >
                    Create Division
                </Typography>


                <Typography
                    sx={{

                        mt: 0.6,

                        fontSize: 13,

                        lineHeight: 1.5,

                        color:
                            "text.secondary",

                    }}
                >
                    Add a new division to your organizational structure.
                </Typography>

            </Box>


            <Divider />


            {/* ================================================= */}
            {/* FORM CONTENT */}
            {/* ================================================= */}

            <Box
                sx={{

                    px: {
                        xs: 2.5,
                        md: 3.5,
                    },

                    py: {
                        xs: 2.75,
                        md: 3.25,
                    },

                    maxWidth:
                        760,

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

                            minHeight: 38,

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

                                fontSize: 14,

                                fontWeight: 650,

                                color:
                                    "text.primary",

                                letterSpacing:
                                    "-0.01em",

                                lineHeight: 1.35,

                            }}
                        >
                            Division Information
                        </Typography>


                        <Typography
                            sx={{

                                mt: 0.35,

                                fontSize: 12,

                                color:
                                    "text.secondary",

                                lineHeight: 1.5,

                            }}
                        >
                            Enter the division details and configure its status.
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


                    {/* DIVISION NAME */}

                    <TextField
                        label="Division Name"

                        placeholder="Enter division name"

                        fullWidth

                        name="DivisionName"

                        sx={fieldSx}

                        value={
                            formik.values.DivisionName
                        }

                        onChange={
                            formik.handleChange
                        }

                        onBlur={
                            formik.handleBlur
                        }

                        error={
                            formik.touched.DivisionName &&
                            Boolean(
                                formik.errors.DivisionName
                            )
                        }

                        helperText={
                            formik.touched.DivisionName &&
                            formik.errors.DivisionName
                        }
                    />


                    {/* DESCRIPTION */}

                    <TextField
                        label="Description"

                        placeholder="Enter division description"

                        multiline

                        rows={5}

                        fullWidth

                        name="Description"

                        sx={{

                            ...fieldSx,


                            "& .MuiOutlinedInput-root": {

                                ...fieldSx[
                                    "& .MuiOutlinedInput-root"
                                ],

                                minHeight:
                                    "auto",

                                alignItems:
                                    "flex-start",

                            },

                        }}

                        value={
                            formik.values.Description
                        }

                        onChange={
                            formik.handleChange
                        }

                        onBlur={
                            formik.handleBlur
                        }

                        error={
                            formik.touched.Description &&
                            Boolean(
                                formik.errors.Description
                            )
                        }

                        helperText={
                            formik.touched.Description &&
                            formik.errors.Description
                        }
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
                                formik.values.isActive
                            }

                            onChange={
                                formik.handleChange
                            }

                            onBlur={
                                formik.handleBlur
                            }

                            error={
                                formik.touched.isActive &&
                                Boolean(
                                    formik.errors.isActive
                                )
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
                        md: 3.5,
                    },

                    py: 2,

                    display:
                        "flex",

                    justifyContent:
                        "flex-end",

                    alignItems:
                        "center",

                    gap: 1.25,

                    backgroundColor:
                        "background.default",

                }}
            >

                {/* CLOSE */}

                <Button
                    variant="outlined"

                    onClick={handleDialog}

                    sx={{

                        minWidth: 90,

                        height: 40,

                        borderRadius: 1.5,

                        textTransform:
                            "none",

                        fontSize: 13,

                        fontWeight: 500,

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

                        minWidth: 140,

                        height: 40,

                        borderRadius: 1.5,

                        textTransform:
                            "none",

                        fontSize: 13,

                        fontWeight: 600,

                        boxShadow:
                            "none",


                        "&:hover": {

                            boxShadow:
                                "none",

                        },

                    }}
                >

                    {formik.isSubmitting
                        ? "Creating..."
                        : "Create Division"}

                </Button>

            </Box>


            {/* ================================================= */}
            {/* CLOSE CONFIRMATION */}
            {/* ================================================= */}

            <ConfirmationDialog

                open={
                    closeDialog
                }

                title="Close Division"

                message="Are you sure you want to close?"

                onCancel={() => {

                    setcloseDialog(false);

                }}

                onConfirm={() => {

                    setcloseDialog(false);

                    // Close only.
                    // Do NOT call onDivisionCreated.
                    onClose();

                }}

            />

        </Paper>

    );

}


export default AddNewDivision;