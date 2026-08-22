import {
    Box,
    Typography,
    TextField,
    Grid,
    Button,
    Paper,
    Divider,
    MenuItem,
    Autocomplete,
    
} from "@mui/material";

import { Formik, useFormik } from "formik";
import * as yup from "yup";
import { useState, useEffect } from "react";
// import { allCountries } from "country-codes-list";
import * as countryCodes from "country-codes-list";

console.log(countryCodes);

import { getDesignation } from "../../Users/service";

function AddNewUser() {
    const fieldSx = {
        "& .MuiOutlinedInput-root": {
            minHeight: "36px",
            borderRadius: '6px',
            backgroundColor: "background.paper",

            "& fieldset": {
                borderColor: "divider",
            },

            "&:hover fieldset": {
                borderColor: "secondary.light",
            },

            "&.Mui-focused fieldset": {
                borderColor: "primary.main",
                borderWidth: "1px",
            },
        },

        "& .MuiInputLabel-root": {
            fontSize: 13,
        },

        "& .MuiInputBase-input": {
            fontSize: 13,
        },
    };

    const countries = countryCodes.all();

    const [Username, setUsername] = useState("");
    const [firstName, setfirstName] = useState("");
    const [Lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [Mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [Designation, setDesignation] = useState("");
    const [designations, setDesignations] = useState([]);
    const [ReportingManager, setReportingManager] = useState("");
    const [openCloseDialog, SetOpenCloseDialog] = useState(false)

    const validationSchema = yup.object({
        Username: yup.string().required('username is required').min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
        email: yup.string().required("user emailId required ").email("invalid email adress"),
        Mobile:yup.string()
    .required("Mobile number is required")
    .matches(
        /^[0-9]+$/,
        "Mobile number must contain only numbers")
        .min(6, "Mobile number is too short").max(15, "Mobile number is too long"),
        password: yup.string().required("user Password is required").min(8, "user password must be 8 characters"),
        Designation: yup.string().required("user Designation required")
    })
    const formik = useFormik({
        initialValues: {
            Username: "",
            email: "",
            Mobile: "",
            password: "",
            Designation: "",
            countryCode: "+91",
        },
        validationSchema: validationSchema
    })



    useEffect(() => {
        const loadDesignation = async () => {
            const data = await getDesignation()
            setDesignations(data)
            console.log("Designation API data:", data);
        }
        loadDesignation();
    }, [])

    const handleCreateUser = () => {
        const userData = {
            Username: Username,
            firstName: firstName,
            Lastname: Lastname,
            email: email,
            mobile: Mobile,
            password: password,
            Designation: Designation,
            ReportingManager: ReportingManager,
        };

        console.log(userData);
    };

    // ui 
    return (
        <Paper
            elevation={0}
            sx={{
                width: "100%",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
            }}
        >
            {/* ================= HEADER ================= */}

            <Box
                sx={{
                    px: {
                        xs: 2.5,
                        md: 3,
                    },
                    py: 2.5,
                }}
            >
                <Typography
                    sx={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "text.primary",
                        letterSpacing: "-0.2px",
                    }}
                >
                    Create New User
                </Typography>

                <Typography
                    sx={{
                        mt: 0.5,
                        fontSize: 13,
                        color: "text.secondary",
                    }}
                >
                    Add a new user and configure their organizational access.
                </Typography>
            </Box>

            <Divider />

            {/* ================= BASIC INFORMATION ================= */}

            <Box
                sx={{
                    px: {
                        xs: 2.5,
                        md: 3,
                    },
                    py: 3,
                }}
            >
                <Typography
                    sx={{
                        mb: 2,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "secondary.main",
                        letterSpacing: "0.7px",
                        textTransform: "uppercase",
                    }}
                >
                    Basic Information
                </Typography>

                <Grid container spacing={1.5}>
                    {/* Username */}

                    <Grid size={{ xs: 12, md: 6 }}>

                        <TextField
                            fullWidth
                            label="Username"
                            name="Username"
                            placeholder="Enter username"
                            sx={fieldSx}
                            value={formik.values.Username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.Username &&
                                Boolean(formik.errors.Username)
                            }
                            helperText={
                                formik.touched.Username &&
                                formik.errors.Username
                            }
                        />
                    </Grid>

                    {/* First Name */}

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="First Name"
                            placeholder="Enter first name"
                            sx={fieldSx}
                            value={firstName}
                            onChange={(event) =>
                                setfirstName(event.target.value)
                            }
                        />
                    </Grid>

                    {/* Last Name */}

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Last Name"
                            placeholder="Enter last name"
                            sx={fieldSx}
                            value={Lastname}
                            onChange={(event) =>
                                setLastname(event.target.value)
                            }
                        />
                    </Grid>

                    {/* Email */}

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            placeholder="Enter email address"
                            type="email"
                            sx={fieldSx}
                            value={formik.values.email}
                            onChange={formik.handleChange
                            }
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.email &&
                                Boolean(formik.errors.email)
                            }
                            helperText={
                                formik.touched.email &&
                                formik.errors.email
                            }
                        />
                    </Grid>

                    {/* Mobile */}

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Grid container spacing={2}>

                            <Grid size={{ xs: 4 }}>
                                <Autocomplete
                                    fullWidth
                                    options={countries}
                                    getOptionLabel={(country) =>
                                        `${country.countryCallingCode} - ${country.countryNameEn}`
                                    }
                                    value={
                                        countries.find(
                                            (country) =>
                                                country.countryCallingCode ===
                                                formik.values.countryCode
                                        ) || null
                                    }
                                    onChange={(event, newValue) => {
                                        formik.setFieldValue(
                                            "countryCode",
                                            newValue
                                                ? newValue.countryCallingCode
                                                : ""
                                        );
                                    }}
                                    onBlur={() =>
                                        formik.setFieldTouched("countryCode", true)
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            label="Country Code"
                                            sx={fieldSx}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 8 }}>
                                <TextField
                                    fullWidth
                                    label="Mobile Number"
                                    name="Mobile"
                                    placeholder="Enter mobile number"
                                    sx={fieldSx}
                                    value={formik.values.Mobile}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.Mobile &&
                                        Boolean(formik.errors.Mobile)
                                    }
                                    helperText={
                                        formik.touched.Mobile &&
                                        formik.errors.Mobile
                                    }
                                />
                            </Grid>

                        </Grid>
                    </Grid>

                    {/* Password */}

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            placeholder="Enter password"
                            type="password"
                            sx={fieldSx}
                            value={formik.values.password}
                            onChange={formik.handleChange
                            }
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.password &&
                                Boolean(formik.errors.password)
                            }
                            helperText={
                                formik.touched.password &&
                                formik.errors.password
                            }
                        />
                    </Grid>
                </Grid>
            </Box>

            <Divider />

            {/* ================= ORGANIZATIONAL ACCESS ================= */}

            <Box
                sx={{
                    px: {
                        xs: 2.5,
                        md: 3,
                    },
                    py: 3,
                }}
            >
                <Typography
                    sx={{
                        mb: 2,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "secondary.main",
                        letterSpacing: "0.7px",
                        textTransform: "uppercase",
                    }}
                >
                    Organizational Access
                </Typography>

                <Grid container spacing={1.5}>
                    {/* Designation */}

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            select
                            autoComplete=""
                            label="Designation"
                            name="Designation"
                            value={formik.values.Designation}
                            onChange={formik.handleChange
                            }
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.Designation &&
                                Boolean(formik.errors.Designation)
                            }
                            helperText={
                                formik.touched.Designation &&
                                formik.errors.Designation
                            }
                            sx={fieldSx}
                        >
                            {designations.map((designation) => (
                                <MenuItem
                                    key={designation.SystemLovDetailId}
                                    value={designation.SystemLovDetailId}
                                >
                                    {designation.SldName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Reporting Manager */}

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            select
                            label="Reporting Manager"
                            value={ReportingManager}
                            onChange={(event) =>
                                setReportingManager(event.target.value)
                            }
                            sx={fieldSx}
                        >
                            {/* Options will come here later */}
                        </TextField>
                    </Grid>
                </Grid>
            </Box>

            <Divider />

            {/* ================= ACTIONS ================= */}

            <Box
                sx={{
                    px: {
                        xs: 2.5,
                        md: 3,
                    },
                    py: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 1.5,
                }}
            >
                <Button
                    variant="outlined"
                    sx={{
                        minWidth: 100,
                        height: 40,
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontSize: 13,
                        fontWeight: 500,
                        borderColor: "divider",
                        color: "error.main",

                        "&:hover": {
                            borderColor: "secondary.light",
                            backgroundColor:
                                "sidebar.hover",
                        },
                        
                    }}
                    onClick = {()=>SetOpenCloseDialog(true)}
                >
                    Close
                </Button>

                <Button
                    variant="contained"
                    sx={{
                        minWidth: 120,
                        height: 40,
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontSize: 13,
                        fontWeight: 600,

                        boxShadow:
                            "0 4px 12px rgba(11, 114, 133, 0.18)",

                        "&:hover": {
                            boxShadow:
                                "0 6px 16px rgba(11, 114, 133, 0.24)",
                        },
                    }}
                    onClick={handleCreateUser}
                >
                    Create User
                </Button>
            </Box>
        </Paper>
    );
}

export default AddNewUser;