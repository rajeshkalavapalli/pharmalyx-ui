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

import {
    getDesignation,
    createUser,
    getUsers,
} from "../../Users/service/index";

import { getDivisions } from "../../Division/index";

import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";


function AddNewUser({ onUserCreated }) {

    /* ================================================= */
    /* COMMON FIELD STYLE */
    /* ================================================= */

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


    /* ================================================= */
    /* COUNTRIES */
    /* ================================================= */

    const countries =
        countryCodes.all();


    /* ================================================= */
    /* STATE */
    /* ================================================= */

    const [firstName, setfirstName] =
        useState("");

    const [Lastname, setLastname] =
        useState("");

    const [designations, setDesignations] =
        useState([]);

    const [ReportingManager, setReportingManager] =
        useState("");

    const [openCloseDialog, setOpenCloseDialog] =
        useState(false);

    const [divisions, setDivisions] =
        useState([]);

    const [users, setUsers] =
        useState([]);


    /* ================================================= */
    /* GLOBAL SNACKBAR */
    /* ================================================= */

    const { showSnackbar } =
        useSnackbar();


    /* ================================================= */
    /* VALIDATION */
    /* ================================================= */

    const validationSchema =
        yup.object({

            Username:
                yup
                    .string()
                    .required(
                        "Username is required"
                    )
                    .min(
                        3,
                        "Username must be at least 3 characters"
                    )
                    .max(
                        20,
                        "Username must be at most 20 characters"
                    ),

            email:
                yup
                    .string()
                    .required(
                        "Email is required"
                    )
                    .email(
                        "Invalid email address"
                    ),

            Mobile:
                yup
                    .string()
                    .required(
                        "Mobile number is required"
                    )
                    .matches(
                        /^[0-9]+$/,
                        "Mobile number must contain only numbers"
                    )
                    .min(
                        6,
                        "Mobile number is too short"
                    )
                    .max(
                        15,
                        "Mobile number is too long"
                    ),

            password:
                yup
                    .string()
                    .required(
                        "Password is required"
                    )
                    .min(
                        8,
                        "Password must be at least 8 characters"
                    ),

            Designation:
                yup
                    .string()
                    .required(
                        "Designation is required"
                    ),

            countryCode:
                yup
                    .string()
                    .required(
                        "Please select country code"
                    ),

            DivisionId:
                yup
                    .string()
                    .required(
                        "Division is required"
                    ),

            TerritoryId:
                yup
                    .string(),

        });


    /* ================================================= */
    /* CREATE USER */
    /* ================================================= */

    const handleCreateUser =
        async (values) => {

            try {

                const userData = {

                    UserName:
                        values.Username,

                    FirstName:
                        firstName,

                    LastName:
                        Lastname,

                    EmailId:
                        values.email,

                    MobileNumber:
                        values.Mobile,

                    password:
                        values.password,

                    DesignationId:
                        values.Designation,

                    ManagerId:
                        ReportingManager || null,

                    CountryCode:
                        values.countryCode,

                    DivisionId:
                        values.DivisionId || null,

                    TerritoryId:
                        values.TerritoryId || null,

                };


                console.log(
                    "before create user data",
                    userData
                );


                const result =
                    await createUser(userData);


                console.log(
                    "created user details",
                    result
                );


                showSnackbar(
                    "User created successfully",
                    "success"
                );


                onUserCreated();

            } catch (err) {

                console.log(
                    "error creating user:",
                    err
                );


                showSnackbar(
                    "Failed to create user",
                    "error"
                );

            }

        };


    /* ================================================= */
    /* FORMIK */
    /* ================================================= */

    const formik =
        useFormik({

            initialValues: {

                Username: "",

                email: "",

                Mobile: "",

                password: "",

                Designation: "",

                countryCode: "",

                DivisionId: "",

                TerritoryId: "",

            },


            validationSchema:
                validationSchema,


            onSubmit:
                async (values) => {

                    console.log(
                        "Formik validation passed:",
                        values
                    );


                    await handleCreateUser(
                        values
                    );

                },

        });


    /* ================================================= */
    /* LOAD DESIGNATIONS + DIVISIONS + USERS */
    /* ================================================= */

    useEffect(() => {

        const loadDesignation =
            async () => {

                try {

                    const data =
                        await getDesignation();


                    console.log(
                        "Designation API data:",
                        data
                    );


                    setDesignations(
                        Array.isArray(data)
                            ? data
                            : []
                    );

                } catch (err) {

                    console.log(
                        "error getting designation:",
                        err
                    );

                }

            };


        const loadDivisions =
            async () => {

                try {

                    const response =
                        await getDivisions();


                    console.log(
                        "Division API data:",
                        response
                    );


                    const data =
                        response?.result ||
                        response ||
                        [];


                    setDivisions(
                        Array.isArray(data)
                            ? data
                            : []
                    );

                } catch (err) {

                    console.log(
                        "error getting divisions:",
                        err
                    );

                }

            };


        const loadUsers =
            async () => {

                try {

                    const response =
                        await getUsers();


                    console.log(
                        "Users API data:",
                        response
                    );


                    const data =
                        response?.result ||
                        [];


                    setUsers(
                        Array.isArray(data)
                            ? data
                            : []
                    );

                } catch (err) {

                    console.log(
                        "error getting users:",
                        err
                    );

                }

            };


        loadDesignation();

        loadDivisions();

        loadUsers();

    }, []);


    /* ================================================= */
    /* CLOSE */
    /* ================================================= */

    const handleClosed = () => {

        setOpenCloseDialog(true);

    };


    /* ================================================= */
    /* RETURN */
    /* ================================================= */

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
                    Create User
                </Typography>


                <Typography
                    sx={{

                        mt: 0.6,

                        fontSize: 13,

                        lineHeight: 1.5,

                        color:
                            "text.secondary",

                        maxWidth: 620,

                    }}
                >
                    Add a new user and configure
                    their organizational access.
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


                {/* SECTION HEADER */}

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
                            Basic Information
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
                            Enter the user's account
                            and contact details.
                        </Typography>

                    </Box>

                </Box>


                <Grid
                    container

                    spacing={{
                        xs: 2,
                        md: 2,
                    }}
                >


                    {/* USERNAME */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >

                        <TextField
                            fullWidth

                            label="Username"

                            name="Username"

                            placeholder="Enter username"

                            sx={fieldSx}

                            value={
                                formik.values.Username
                            }

                            onChange={
                                formik.handleChange
                            }

                            onBlur={
                                formik.handleBlur
                            }

                            error={
                                formik.touched.Username &&
                                Boolean(
                                    formik.errors.Username
                                )
                            }

                            helperText={
                                formik.touched.Username &&
                                formik.errors.Username
                            }
                        />

                    </Grid>


                    {/* FIRST NAME */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >

                        <TextField
                            fullWidth

                            label="First Name"

                            placeholder="Enter first name"

                            sx={fieldSx}

                            value={firstName}

                            onChange={(event) =>
                                setfirstName(
                                    event.target.value
                                )
                            }
                        />

                    </Grid>


                    {/* LAST NAME */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >

                        <TextField
                            fullWidth

                            label="Last Name"

                            placeholder="Enter last name"

                            sx={fieldSx}

                            value={Lastname}

                            onChange={(event) =>
                                setLastname(
                                    event.target.value
                                )
                            }
                        />

                    </Grid>


                    {/* EMAIL */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >

                        <TextField
                            fullWidth

                            label="Email"

                            name="email"

                            placeholder="Enter email address"

                            type="email"

                            sx={fieldSx}

                            value={
                                formik.values.email
                            }

                            onChange={
                                formik.handleChange
                            }

                            onBlur={
                                formik.handleBlur
                            }

                            error={
                                formik.touched.email &&
                                Boolean(
                                    formik.errors.email
                                )
                            }

                            helperText={
                                formik.touched.email &&
                                formik.errors.email
                            }
                        />

                    </Grid>


                    {/* MOBILE */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >

                        <Grid
                            container
                            spacing={1.5}
                        >

                            <Grid size={{ xs: 4 }}>

                                <Autocomplete
                                    fullWidth

                                    options={countries}

                                    getOptionLabel={
                                        (country) =>
                                            `${country.countryCallingCode} - ${country.countryNameEn}`
                                    }

                                    value={
                                        countries.find(
                                            (country) =>
                                                country.countryCallingCode ===
                                                formik.values.countryCode
                                        ) || null
                                    }

                                    onChange={(
                                        event,
                                        newValue
                                    ) => {

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

                                    renderInput={(
                                        params
                                    ) => (

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


                            <Grid size={{ xs: 8 }}>

                                <TextField
                                    fullWidth

                                    label="Mobile Number"

                                    name="Mobile"

                                    placeholder="Enter mobile number"

                                    sx={fieldSx}

                                    value={
                                        formik.values.Mobile
                                    }

                                    onChange={
                                        formik.handleChange
                                    }

                                    onBlur={
                                        formik.handleBlur
                                    }

                                    error={
                                        formik.touched.Mobile &&
                                        Boolean(
                                            formik.errors.Mobile
                                        )
                                    }

                                    helperText={
                                        formik.touched.Mobile &&
                                        formik.errors.Mobile
                                    }
                                />

                            </Grid>

                        </Grid>

                    </Grid>


                    {/* PASSWORD */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >

                        <TextField
                            fullWidth

                            label="Password"

                            name="password"

                            placeholder="Enter password"

                            type="password"

                            sx={fieldSx}

                            value={
                                formik.values.password
                            }

                            onChange={
                                formik.handleChange
                            }

                            onBlur={
                                formik.handleBlur
                            }

                            error={
                                formik.touched.password &&
                                Boolean(
                                    formik.errors.password
                                )
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


                {/* SECTION HEADER */}

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
                            Organizational Access
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
                            Configure the user's role
                            and organizational access.
                        </Typography>

                    </Box>

                </Box>


                <Grid
                    container

                    spacing={{
                        xs: 2,
                        md: 2,
                    }}
                >


                    {/* DESIGNATION */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >

                        <TextField
                            fullWidth

                            select

                            label="Designation"

                            name="Designation"

                            value={
                                formik.values.Designation
                            }

                            onChange={
                                formik.handleChange
                            }

                            onBlur={
                                formik.handleBlur
                            }

                            error={
                                formik.touched.Designation &&
                                Boolean(
                                    formik.errors.Designation
                                )
                            }

                            helperText={
                                formik.touched.Designation &&
                                formik.errors.Designation
                            }

                            sx={fieldSx}
                        >

                            <MenuItem value="">
                                Select Designation
                            </MenuItem>


                            {designations.map(
                                (designation) => (

                                    <MenuItem
                                        key={
                                            designation.SystemLovDetailId
                                        }

                                        value={
                                            designation.SystemLovDetailId
                                        }
                                    >
                                        {
                                            designation.SldName
                                        }
                                    </MenuItem>

                                )
                            )}

                        </TextField>

                    </Grid>


                    {/* DIVISION */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >

                        <TextField
                            fullWidth

                            select

                            label="Division"

                            name="DivisionId"

                            value={
                                formik.values.DivisionId
                            }

                            onChange={(event) => {

                                formik.setFieldValue(
                                    "DivisionId",
                                    event.target.value
                                );


                                formik.setFieldValue(
                                    "TerritoryId",
                                    ""
                                );

                            }}

                            onBlur={() =>
                                formik.setFieldTouched(
                                    "DivisionId",
                                    true
                                )
                            }

                            error={
                                formik.touched.DivisionId &&
                                Boolean(
                                    formik.errors.DivisionId
                                )
                            }

                            helperText={
                                formik.touched.DivisionId &&
                                formik.errors.DivisionId
                            }

                            sx={fieldSx}
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

                        </TextField>

                    </Grid>


                    {/* TERRITORY */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >

                        <TextField
                            fullWidth

                            select

                            label="Territory"

                            name="TerritoryId"

                            value={
                                formik.values.TerritoryId
                            }

                            onChange={
                                formik.handleChange
                            }

                            onBlur={
                                formik.handleBlur
                            }

                            disabled={
                                !formik.values.DivisionId
                            }

                            sx={fieldSx}
                        >

                            <MenuItem value="">

                                {
                                    formik.values.DivisionId
                                        ? "Select Territory"
                                        : "Select Division First"
                                }

                            </MenuItem>

                        </TextField>

                    </Grid>


                    {/* REPORTING MANAGER */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >

                        <TextField
                            fullWidth

                            select

                            label="Reporting Manager"

                            value={
                                ReportingManager
                            }

                            onChange={(event) =>
                                setReportingManager(
                                    event.target.value
                                )
                            }

                            sx={fieldSx}
                        >

                            <MenuItem value="">
                                Select Reporting Manager
                            </MenuItem>


                            {users.map(
                                (user) => {

                                    const displayName =
                                        user.UserName ||
                                        "-";


                                    return (

                                        <MenuItem
                                            key={user.userId}

                                            value={user.userId}
                                        >
                                            {displayName}
                                        </MenuItem>

                                    );

                                }
                            )}

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

                    justifyContent:
                        "flex-end",

                    alignItems:
                        "center",

                    gap: 1.25,

                    backgroundColor:
                        "background.default",

                }}
            >

                <Button
                    variant="outlined"

                    sx={{

                        minWidth: 96,

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

                    onClick={
                        formik.handleSubmit
                    }
                >
                    Create User
                </Button>

            </Box>


            {/* ================================================= */}
            {/* CONFIRMATION DIALOG */}
            {/* ================================================= */}

            <ConfirmationDialog

                open={
                    openCloseDialog
                }

                title="Close User Creation"

                message="Are you sure you want to close the user creation?"

                onCancel={() =>
                    setOpenCloseDialog(
                        false
                    )
                }

                onConfirm={() => {

                    setOpenCloseDialog(
                        false
                    );

                    onUserCreated();

                }}

            />

        </Paper>

    );

}


export default AddNewUser;