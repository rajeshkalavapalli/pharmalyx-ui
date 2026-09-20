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
import { useNavigate } from "react-router-dom";

import ConfirmationDialog from "../../components/conformationDialog/ConformationDialog";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";

import {
    getcountry,
    getstates,
    getTerritorie,
    createArea,
    previewAreaCode,

} from "../Areas/index";


function AddNewArea({ onAreaCreated, onClose }) {

    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const [closeDialog, setCloseDialog] = useState(false);

    const [countries, setCountries] = useState([]);
    const [states, setSates] = useState([]);
    const [territories, setTerritories] = useState([]);

    const validationSchema = yup.object({
        CountryId: yup.string().required("Country is required"),
        StateId: yup.string().required("State is required"),
        TerritoryId: yup.string().required("Territory is required"),
        AreaName: yup.string().trim().required("Area name is required"),
    });

    const formik = useFormik({
        initialValues: {
            CountryId: "",
            StateId: "",
            TerritoryId: "",
            AreaName: "",
            AreaCode: "",
            IsActive: "YES",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                await createArea({
                    TerritoryId: values.TerritoryId,
                    AreaName: values.AreaName.trim(),
                    AreaCode: values.AreaCode,
                    IsActive: values.IsActive,
                });

                showSnackbar("Area created successfully", "success");
                formik.resetForm();
                setStates([]);
                setTerritories([]);
                if (onAreaCreated) {
                    onAreaCreated();
                } else {
                    navigate("/admin/Areas/list");
                }
            } catch (err) {
                console.log("error creating area", err);
                showSnackbar(
                    err.response?.status === 409
                        ? "Area already exists"
                        : err.response?.data?.message || "Area was not created",
                    "error"
                );
            }
        },
    });

    const { values, touched, errors, setFieldValue, handleBlur, handleSubmit } = formik;

    const closeArea = () => {
        formik.resetForm();
        setStates([]);
        setTerritories([]);
        if (onClose) {
            onClose();
        } else {
            navigate("/admin/Areas/list");
        }
    };

    const handleClose = () => {
        setCloseDialog(true);
    };


    // =====================================================
    // COMMON FIELD STYLING
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
                    `0 0 0 3px ${theme.palette.primary.main}12`,
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


    const handleAreaNameChange = async (e) => {
        const value = e.target.value;

        setFieldValue("AreaName", value);

        if (!values.TerritoryId || !value.trim()) {
            setFieldValue("AreaCode", "");
            return;
        }

        try {
            const result = await previewAreaCode(
                values.TerritoryId,
                value.trim()
            );

            setFieldValue("AreaCode", result.areaCode || "");
        } catch (err) {
            console.log("error previewing area code", err);
            setFieldValue("AreaCode", "");
        }
    };

    // =====================================================
    // LOAD COUNTRIES
    // =====================================================

    useEffect(() => {

        const loadCountries = async () => {

            const response = await getcountry();

            setCountries(response.country);
        };

        loadCountries();

    }, []);


    // =====================================================
    // LOAD STATES
    // =====================================================

    useEffect(() => {

        if (!values.CountryId) {
            return;
        }

        const loadStates = async () => {

            const response = await getstates(values.CountryId);

            setSates(response.states);
        };

        loadStates();

    }, [values.CountryId]);


    // =====================================================
    // LOAD TERRITORIES
    // =====================================================

    useEffect(() => {

        if (!values.StateId) {
            return;
        }

        const loadTerritories = async () => {

            const response = await getTerritorie(values.StateId);

            setTerritories(response.territories);
        };

        loadTerritories();

    }, [values.StateId]);


    return (

        <Paper
            elevation={0}
            sx={{
                width: "100%",
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                overflow: "hidden",

                boxShadow:
                    "0 8px 30px rgba(32, 37, 34, 0.055)",
            }}
        >

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <Box
                sx={{
                    px: { xs: 2, sm: 3, md: 4 },
                    py: 3,

                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                }}
            >

                <Box
                    sx={{
                        width: 4,
                        minHeight: 42,
                        borderRadius: 2,
                        backgroundColor: "primary.main",
                    }}
                />

                <Box>

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            lineHeight: 1.3,
                        }}
                    >
                        Create Area
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            mt: 0.5,
                            color: "text.secondary",
                            fontSize: 13,
                        }}
                    >
                        Add a new area to your geographical structure.
                    </Typography>

                </Box>

            </Box>


            <Divider />


            {/* ================================================= */}
            {/* FORM CONTENT */}
            {/* ================================================= */}

            <Box
                sx={{
                    width: "100%",
                    maxWidth: 900,
                    mx: "auto",
                    px: { xs: 2, sm: 3, md: 4 },
                    py: 3.5,
                }}
            >

                {/* ================================================= */}
                {/* LOCATION INFORMATION */}
                {/* ================================================= */}

                <Box sx={{ mb: 3 }}>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.25,
                            mb: 2.5,
                        }}
                    >

                        <Box
                            sx={{
                                width: 3,
                                minHeight: 28,
                                borderRadius: 2,
                                backgroundColor: "primary.main",
                            }}
                        />

                        <Box>

                            <Typography
                                sx={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: "text.primary",
                                }}
                            >
                                Location Information
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.25,
                                    fontSize: 12,
                                    color: "text.secondary",
                                }}
                            >
                                Select the country, state, and territory for this area.
                            </Typography>

                        </Box>

                    </Box>


                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2.25,
                        }}
                    >

                        {/* COUNTRY */}

                        <FormControl
                            fullWidth
                            size="small"
                            sx={fieldSx}
                        >

                            <InputLabel>
                                Country
                            </InputLabel>

                            <Select
                                name="CountryId"
                                value={values.CountryId}
                                label="Country"
                                onChange={(event) => {
                                    setFieldValue("CountryId", event.target.value);
                                    setFieldValue("StateId", "");
                                    setFieldValue("TerritoryId", "");
                                    setTerritories([]);
                                }}
                                onBlur={handleBlur}
                                error={touched.CountryId && Boolean(errors.CountryId)}
                            >

                                <MenuItem value="">
                                    Select Country
                                </MenuItem>

                                {countries.map((item) => (

                                    <MenuItem
                                        key={item.CountryId}
                                        value={item.CountryId}
                                    >
                                        {item.CountryName}
                                    </MenuItem>

                                ))}

                            </Select>

                        </FormControl>


                        {/* STATE */}

                        <FormControl
                            fullWidth
                            size="small"
                            sx={fieldSx}
                        >

                            <InputLabel>
                                State
                            </InputLabel>

                            <Select
                                name="StateId"
                                value={values.StateId}
                                label="State"
                                onChange={(event) => {
                                    setFieldValue("StateId", event.target.value);
                                    setFieldValue("TerritoryId", "");
                                }}
                                onBlur={handleBlur}
                                error={touched.StateId && Boolean(errors.StateId)}
                            >

                                <MenuItem value="">
                                    Select State
                                </MenuItem>

                                {states.map((item) => (

                                    <MenuItem
                                        key={item.StateId}
                                        value={item.StateId}
                                    >
                                        {item.StateName}
                                    </MenuItem>

                                ))}

                            </Select>

                        </FormControl>


                        {/* TERRITORY */}

                        <FormControl
                            fullWidth
                            size="small"
                            sx={fieldSx}
                        >

                            <InputLabel>
                                Territory
                            </InputLabel>

                            <Select
                                name="TerritoryId"
                                value={values.TerritoryId}
                                label="Territory"
                                onChange={(event) => {
                                    setFieldValue("TerritoryId", event.target.value);
                                    setFieldValue("AreaCode", "");
                                }}
                                onBlur={handleBlur}
                                error={touched.TerritoryId && Boolean(errors.TerritoryId)}
                            >

                                <MenuItem value="">
                                    Select Territory
                                </MenuItem>

                                {territories.map((item) => (

                                    <MenuItem
                                        key={item.TerritoryId}
                                        value={item.TerritoryId}
                                    >
                                        {item.TerritoryName}
                                    </MenuItem>

                                ))}

                            </Select>

                        </FormControl>

                    </Box>

                </Box>


                <Divider sx={{ my: 3 }} />


                {/* ================================================= */}
                {/* AREA INFORMATION */}
                {/* ================================================= */}

                <Box>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.25,
                            mb: 2.5,
                        }}
                    >

                        <Box
                            sx={{
                                width: 3,
                                minHeight: 28,
                                borderRadius: 2,
                                backgroundColor: "primary.main",
                            }}
                        />

                        <Box>

                            <Typography
                                sx={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: "text.primary",
                                }}
                            >
                                Area Information
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.25,
                                    fontSize: 12,
                                    color: "text.secondary",
                                }}
                            >
                                Enter the basic information for the new area.
                            </Typography>

                        </Box>

                    </Box>


                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2.25,
                        }}
                    >

                        {/* AREA NAME */}

                        <TextField
                            fullWidth
                            size="small"
                            label="Area Name"
                            name="AreaName"
                            value={values.AreaName}
                            onChange={handleAreaNameChange}
                            onBlur={handleBlur}
                            error={touched.AreaName && Boolean(errors.AreaName)}
                            helperText={touched.AreaName ? errors.AreaName : ""}
                            sx={fieldSx}
                        />


                        {/* AREA CODE */}

                        <TextField
                            fullWidth
                            size="small"
                            label="Area Code"
                            value={values.AreaCode}
                            placeholder="Auto-generated"
                            helperText="Area code will be generated automatically."
                            InputProps={{
                                readOnly: true,
                            }}
                            sx={{
                                ...fieldSx,

                                "& .MuiOutlinedInput-root": {
                                    ...fieldSx[
                                    "& .MuiOutlinedInput-root"
                                    ],

                                    backgroundColor:
                                        "action.hover",
                                },

                                "& .MuiInputBase-input": {
                                    fontSize: 13,
                                    color: "text.secondary",
                                    cursor: "not-allowed",
                                },
                            }}
                        />


                        {/* STATUS */}

                        <Box>

                            <Typography
                                sx={{
                                    fontSize: 13,
                                    color: "text.secondary",
                                    mb: 1,
                                }}
                            >
                                Status
                            </Typography>


                            <Box
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 1.5,
                                    overflow: "hidden",
                                    backgroundColor:
                                        "background.paper",
                                }}
                            >

                                {/* YES */}

                                <Button
                                    type="button"
                                    onClick={() =>
                                        setFieldValue("IsActive", "YES")
                                    }
                                    disableRipple
                                    sx={{
                                        minWidth: 70,
                                        height: 38,
                                        px: 1.75,

                                        borderRadius: 0,
                                        textTransform: "none",

                                        fontSize: 12,
                                        fontWeight: 600,

                                        color:
                                            values.IsActive === "YES"
                                                ? "success.main"
                                                : "text.secondary",

                                        backgroundColor:
                                            values.IsActive === "YES"
                                                ? "action.selected"
                                                : "transparent",

                                        "&:hover": {
                                            backgroundColor:
                                                "action.hover",
                                        },
                                    }}
                                >

                                    <Box
                                        sx={{
                                            width: 7,
                                            height: 7,
                                            borderRadius: "50%",
                                            mr: 0.75,

                                            backgroundColor:
                                                values.IsActive === "YES"
                                                    ? "success.main"
                                                    : "text.disabled",
                                        }}
                                    />

                                    Yes

                                </Button>


                                {/* DIVIDER */}

                                <Divider
                                    orientation="vertical"
                                    flexItem
                                />


                                {/* NO */}

                                <Button
                                    type="button"
                                    onClick={() =>
                                        setFieldValue("IsActive", "NO")
                                    }
                                    disableRipple
                                    sx={{
                                        minWidth: 70,
                                        height: 38,
                                        px: 1.75,

                                        borderRadius: 0,
                                        textTransform: "none",

                                        fontSize: 12,
                                        fontWeight: 600,

                                        color:
                                            values.IsActive === "NO"
                                                ? "error.main"
                                                : "text.secondary",

                                        backgroundColor:
                                            values.IsActive === "NO"
                                                ? "action.selected"
                                                : "transparent",

                                        "&:hover": {
                                            backgroundColor:
                                                "action.hover",
                                        },
                                    }}
                                >

                                    <Box
                                        sx={{
                                            width: 7,
                                            height: 7,
                                            borderRadius: "50%",
                                            mr: 0.75,

                                            backgroundColor:
                                                values.IsActive === "NO"
                                                    ? "error.main"
                                                    : "text.disabled",
                                        }}
                                    />

                                    No

                                </Button>

                            </Box>

                        </Box>

                    </Box>

                </Box>

            </Box>


            {/* ================================================= */}
            {/* ACTION BAR */}
            {/* ================================================= */}

            <Divider />

            <Box
                sx={{
                    px: { xs: 2, sm: 3, md: 4 },
                    py: 2,

                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1.5,

                    backgroundColor: "background.default",
                }}
            >

                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleClose}
                >
                    Close
                </Button>

                <Button
                    variant="contained"
                    type="button"
                    onClick={() => handleSubmit()}
                >
                    Create Area
                </Button>

            </Box>

            <ConfirmationDialog
                open={closeDialog}
                title="Close Area Creation"
                message="Are you sure you want to close? The entered data will be lost."
                confirmText="Close"
                onCancel={() => setCloseDialog(false)}
                onConfirm={() => {
                    setCloseDialog(false);
                    closeArea();
                }}
            />

        </Paper>
    );
}


export default AddNewArea;