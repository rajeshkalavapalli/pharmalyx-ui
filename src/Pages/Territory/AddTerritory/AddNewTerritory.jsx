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

import { useEffect, useState } from "react";

import { useFormik } from "formik";
import * as yup from "yup";

import ConfirmationDialog from "../../../components/conformationDialog/ConformationDialog";

import { getDivisions } from "../../Division/index";


function AddNewTerritoty() {

    const [divisions, setDivisions] =
        useState([]);

    const [closeDialog, setcloseDialog] =
        useState(false);


    // =====================================================
    // LOAD DIVISIONS
    // =====================================================

    useEffect(() => {

        loadDivisions();

    }, []);


    const loadDivisions = async () => {

        try {

            const response =
                await getDivisions();


            console.log(
                "divisions for territory:",
                response
            );


            setDivisions(
                response || []
            );

        } catch (err) {

            console.log(
                "error getting divisions:",
                err
            );

        }

    };


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

    };


    // =====================================================
    // VALIDATION
    // =====================================================

    const validationSchema =
        yup.object({

            TerritoryName:
                yup
                    .string()
                    .trim()
                    .required(
                        "Territory name is required"
                    ),

            DivisionId:
                yup
                    .string()
                    .required(
                        "Division is required"
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

                TerritoryName: "",

                DivisionId: "",

                isActive: true,

            },


            validationSchema,


            onSubmit:
                async (values) => {

                    try {

                        const TerritoryPayload = {

                            TerritoryName:
                                values.TerritoryName.trim(),

                            DivisionId:
                                values.DivisionId,

                            isActive:
                                values.isActive,

                        };


                        console.log(
                            "Territory payload:",
                            TerritoryPayload
                        );


                        // Territory API will be called here
                        // await createTerritory(TerritoryPayload);


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
                    Create Territory
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
                    Add a new territory and assign it to a division.
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
                            Territory Information
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
                            Configure the territory details and assign it to a division.
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
                            formik.values.TerritoryName
                        }

                        onChange={
                            formik.handleChange
                        }

                        onBlur={
                            formik.handleBlur
                        }

                        error={
                            formik.touched.TerritoryName &&
                            Boolean(
                                formik.errors.TerritoryName
                            )
                        }

                        helperText={
                            formik.touched.TerritoryName &&
                            formik.errors.TerritoryName
                        }

                    />


                    {/* DIVISION */}

                    <FormControl

                        fullWidth

                        sx={fieldSx}

                        error={
                            formik.touched.DivisionId &&
                            Boolean(
                                formik.errors.DivisionId
                            )
                        }
                    >

                        <InputLabel>
                            Division
                        </InputLabel>


                        <Select

                            label="Division"

                            name="DivisionId"

                            value={
                                formik.values.DivisionId
                            }

                            onChange={
                                formik.handleChange
                            }

                            onBlur={
                                formik.handleBlur
                            }

                        >

                            <MenuItem value="">
                                Select Division
                            </MenuItem>


                            {divisions.map(
                                (division) => (

                                    <MenuItem

                                        key={
                                            division.DivisionId
                                        }

                                        value={
                                            division.DivisionId
                                        }
                                    >

                                        {
                                            division.DivisionName ||
                                            "-"
                                        }

                                    </MenuItem>

                                )
                            )}

                        </Select>


                        {formik.touched.DivisionId &&
                            formik.errors.DivisionId && (

                                <Typography

                                    variant="caption"

                                    sx={{

                                        color:
                                            "error.main",

                                        mt: 0.5,

                                        ml: 1.5,

                                        fontSize: 11,

                                    }}
                                >

                                    {
                                        formik.errors.DivisionId
                                    }

                                </Typography>

                            )}

                    </FormControl>


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

                    onClick={
                        handleCloseDialog
                    }

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

                        minWidth: 145,

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
                        : "Create Territory"}
                </Button>

            </Box>


            {/* ================================================= */}
            {/* CONFIRMATION */}
            {/* ================================================= */}

            <ConfirmationDialog

                open={
                    closeDialog
                }

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