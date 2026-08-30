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

import { useFormik } from "formik";
import * as yup from "yup";
import { useState, useEffect } from "react";

import * as countryCodes from "country-codes-list";
import ConfirmationDialog from "../../../components/conformationDialog/ConformationDialog";

import { getDesignation, createUser } from "../../Users/service/index";


function AddNewUser({ onUserCreated }) {

    const fieldSx = {
        "& .MuiOutlinedInput-root": {
            minHeight: "40px",

            borderRadius: 1.5,

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

            color: "text.secondary",
        },

        "& .MuiInputLabel-root.Mui-focused": {
            color: "primary.main",
        },

        "& .MuiInputBase-input": {
            fontSize: 13,
        },

        "& .MuiFormHelperText-root": {
            fontSize: 11,

            marginLeft: 0.25,

            marginTop: 0.5,
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
    const [openCloseDialog, setOpenCloseDialog] = useState(false);
    const [countryCode, setCountryCode] = useState("");


    const validationSchema = yup.object({
        Username: yup
            .string()
            .required("username is required")
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username must be at most 20 characters"),

        email: yup
            .string()
            .required("user emailId required ")
            .email("invalid email adress"),

        Mobile: yup
            .string()
            .required("Mobile number is required")
            .matches(
                /^[0-9]+$/,
                "Mobile number must contain only numbers"
            )
            .min(6, "Mobile number is too short")
            .max(15, "Mobile number is too long"),

        password: yup
            .string()
            .required("user password is required")
            .min(8, "user password must be 8 characters"),

        Designation: yup
            .string()
            .required("user Designation required"),

        countryCode: yup
            .string()
            .required("please select valid country code"),
    });


    const formik = useFormik({
        initialValues: {
            Username: "",
            email: "",
            Mobile: "",
            password: "",
            Designation: "",
            countryCode: "",
        },

        validationSchema: validationSchema,
    });


    useEffect(() => {
        const loadDesignation = async () => {
            const data = await getDesignation();

            setDesignations(data);

            console.log("Designation API data:", data);
        };

        loadDesignation();
    }, []);


    const handleCreateUser = async () => {

        const userData = {
            UserName: formik.values.Username,

            FirstName: firstName,

            LastName: Lastname,

            EmailId: formik.values.email,

            MobileNumber: formik.values.Mobile,

            password: formik.values.password,

            DesignationId: formik.values.Designation,

            ManagerId: ReportingManager || null,

            CountryCode: formik.values.countryCode,
        };


        console.log("before create user data", userData);

        console.log("PASSWORD:", userData.password);


        const result = await createUser(userData);

        console.log("created user details", result);

        onUserCreated();
    };


    const handleClosed = () => {

        setOpenCloseDialog(true);

        console.log("Close clicked");
    };


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

                    backgroundColor: "background.paper",
                }}
            >
                <Typography
                    sx={{
                        fontSize: {
                            xs: 18,
                            md: 19,
                        },

                        fontWeight: 650,

                        color: "text.primary",

                        letterSpacing: "-0.025em",
                    }}
                >
                    Create User
                </Typography>

                <Typography
                    sx={{
                        mt: 0.6,

                        fontSize: 13,

                        lineHeight: 1.5,

                        color: "text.secondary",

                        maxWidth: 620,
                    }}
                >
                    Add a new user and configure their organizational access.
                </Typography>
            </Box>


            <Divider />


            {/* ================================================= */}
            {/* BASIC INFORMATION */}
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
                }}
            >

                {/* Section heading */}

                <Box
                    sx={{
                        mb: 2.25,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 12,

                            fontWeight: 650,

                            color: "primary.main",

                            letterSpacing: "0.06em",

                            textTransform: "uppercase",
                        }}
                    >
                        Basic Information
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.35,

                            fontSize: 12,

                            color: "text.secondary",
                        }}
                    >
                        Enter the user's account and contact details.
                    </Typography>
                </Box>


                <Grid
                    container
                    spacing={{
                        xs: 2,
                        md: 2,
                    }}
                >

                    {/* ================================================= */}
                    {/* USERNAME */}
                    {/* ================================================= */}

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


                    {/* ================================================= */}
                    {/* FIRST NAME */}
                    {/* ================================================= */}

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


                    {/* ================================================= */}
                    {/* LAST NAME */}
                    {/* ================================================= */}

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


                    {/* ================================================= */}
                    {/* EMAIL */}
                    {/* ================================================= */}

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            placeholder="Enter email address"
                            type="email"
                            sx={fieldSx}
                            value={formik.values.email}
                            onChange={formik.handleChange}
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


                    {/* ================================================= */}
                    {/* MOBILE */}
                    {/* ================================================= */}

                    <Grid size={{ xs: 12, md: 6 }}>

                        <Grid
                            container
                            spacing={1.5}
                        >

                            {/* COUNTRY CODE */}

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
                                        formik.setFieldTouched(
                                            "countryCode",
                                            true
                                        )
                                    }

                                    renderInput={(params) => (
                                        <TextField
                                            {...params}

                                            fullWidth

                                            label="Country Code"

                                            sx={fieldSx}

                                            error={
                                                formik.touched.countryCode &&
                                                Boolean(
                                                    formik.errors.countryCode
                                                )
                                            }

                                            helperText={
                                                formik.touched.countryCode &&
                                                formik.errors.countryCode
                                            }
                                        />
                                    )}
                                />

                            </Grid>


                            {/* MOBILE NUMBER */}

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


                    {/* ================================================= */}
                    {/* PASSWORD */}
                    {/* ================================================= */}

                    <Grid size={{ xs: 12, md: 6 }}>

                        <TextField
                            fullWidth

                            label="Password"

                            name="password"

                            placeholder="Enter password"

                            type="password"

                            sx={fieldSx}

                            value={formik.values.password}

                            onChange={formik.handleChange}

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


            {/* ================================================= */}
            {/* ORGANIZATIONAL ACCESS */}
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
                }}
            >

                {/* Section heading */}

                <Box
                    sx={{
                        mb: 2.25,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 12,

                            fontWeight: 650,

                            color: "primary.main",

                            letterSpacing: "0.06em",

                            textTransform: "uppercase",
                        }}
                    >
                        Organizational Access
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.35,

                            fontSize: 12,

                            color: "text.secondary",
                        }}
                    >
                        Configure the user's role within the organization.
                    </Typography>
                </Box>


                <Grid
                    container
                    spacing={{
                        xs: 2,
                        md: 2,
                    }}
                >

                    {/* ================================================= */}
                    {/* DESIGNATION */}
                    {/* ================================================= */}

                    <Grid size={{ xs: 12, md: 6 }}>

                        <TextField
                            fullWidth

                            select

                            autoComplete=""

                            label="Designation"

                            name="Designation"

                            value={formik.values.Designation}

                            onChange={formik.handleChange}

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


                    {/* ================================================= */}
                    {/* REPORTING MANAGER */}
                    {/* ================================================= */}

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

                    display: "flex",

                    justifyContent: "flex-end",

                    alignItems: "center",

                    gap: 1.25,

                    backgroundColor: "background.default",
                }}
            >

                <Button
                    variant="outlined"

                    sx={{
                        minWidth: 96,

                        height: 40,

                        borderRadius: 1.5,

                        textTransform: "none",

                        fontSize: 13,

                        fontWeight: 500,

                        borderColor: "divider",

                        color: "text.secondary",

                        "&:hover": {
                            borderColor: "secondary.light",

                            backgroundColor: "sidebar.hover",
                        },
                    }}

                    onClick={handleClosed}
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

                        boxShadow: "none",

                        "&:hover": {
                            boxShadow: "none",
                        },
                    }}

                    onClick={handleCreateUser}
                >
                    Create User
                </Button>

            </Box>


            {/* ================================================= */}
            {/* CONFIRMATION DIALOG */}
            {/* ================================================= */}

            <ConfirmationDialog
                open={openCloseDialog}

                title="Close User Creation"

                message="Are you sure you want to close the user creation?"

                onCancel={() =>
                    setOpenCloseDialog(false)
                }

                onConfirm={() =>
                    setOpenCloseDialog(false)
                }
            />

        </Paper>
    );
}

export default AddNewUser;