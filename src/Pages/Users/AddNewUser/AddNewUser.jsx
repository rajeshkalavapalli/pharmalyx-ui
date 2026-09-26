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

import { alpha } from "@mui/material/styles";

import { useFormik } from "formik";
import * as yup from "yup";
import { useState, useEffect, useRef } from "react";

import * as countryCodes from "country-codes-list";

import ConfirmationDialog from "../../../components/conformationDialog/ConformationDialog";

import {
    getDesignation,
    createUser,
    getUsers,
} from "../../Users/service/index";

import { getDivisions } from "../../Division/index";

import {
    getcountry,
    getstates,
    getTerritorie,
} from "../../Territory/index";

import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";


function AddNewUser({ onUserCreated }) {

    /* ================================================= */
    /* COMMON FIELD STYLE */
    /* ================================================= */

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

            "&.Mui-disabled": {
                backgroundColor: "action.hover",
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
            marginTop: 0.6,
        },
    };


    /* ================================================= */
    /* COUNTRIES */
    /* ================================================= */

    const mobileCountries = countryCodes.all();


    /* ================================================= */
    /* STATE */
    /* ================================================= */

    const [firstName, setfirstName] = useState("");
    const [Lastname, setLastname] = useState("");
    const [designations, setDesignations] = useState([]);
    const [ReportingManager, setReportingManager] = useState("");
    const [openCloseDialog, setOpenCloseDialog] = useState(false);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [territories, setTerritories] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [managers, setManagers] = useState([]);
    const territoryRequestRef = useRef(0);


    /* ================================================= */
    /* GLOBAL SNACKBAR */
    /* ================================================= */

    const { showSnackbar } = useSnackbar();


    /* ================================================= */
    /* VALIDATION */
    /* ================================================= */

    const validationSchema = yup.object({

        Username: yup
            .string()
            .required("Username is required")
            .min(
                3,
                "Username must be at least 3 characters"
            )
            .max(
                20,
                "Username must be at most 20 characters"
            ),

        email: yup
            .string()
            .required("Email is required")
            .email("Invalid email address"),

        Mobile: yup
            .string()
            .required("Mobile number is required")
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

        password: yup
            .string()
            .required("Password is required")
            .min(
                8,
                "Password must be at least 8 characters"
            ),

        Designation: yup
            .string()
            .required("Designation is required"),

        countryCode: yup
            .string()
            .required("Please select country code"),

        CountryId: yup
            .string()
            .required("Country is required"),

        StateIds: yup
            .array()
            .of(yup.string())
            .min(1, "State is required")
            .required("State is required"),

        TerritoryIds: yup
            .array()
            .of(yup.string())
            .min(1, "Territory is required")
            .required("Territory is required"),

        DivisionId: yup
            .string()
            .required("Division is required"),

    });


    /* ================================================= */
    /* CREATE USER */
    /* ================================================= */

    const handleCreateUser = async (values) => {

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

                CountryId:
                    values.CountryId,

                StateIds:
                    values.StateIds,

                TerritoryIds:
                    values.TerritoryIds,

                DivisionId:
                    values.DivisionId,

            };


            console.log(
                "before create user data",
                userData
            );


            const result =
                await createUser(
                    userData
                );

            const payload =
                result?.createUser || result;

            console.log(
                "created user details",
                payload
            );

            if (
                payload?.success === false ||
                (!payload?.success && !payload?.UserId && !payload?.message)
            ) {
                throw new Error(
                    payload?.message ||
                    "User creation failed"
                );
            }

            showSnackbar(
                payload?.message ||
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

    const formik = useFormik({

        initialValues: {

            Username: "",
            email: "",
            Mobile: "",
            password: "",
            Designation: "",
            countryCode: "",
            CountryId: "",
            StateIds: [],
            TerritoryIds: [],
            DivisionId: "",

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
    /* LOAD COUNTRIES */
    /* ================================================= */

    const loadCountries = async () => {

        try {

            const response =
                await getcountry();


            console.log(
                "Countries API data:",
                response
            );


            const data =
                response?.country ||
                response?.countries ||
                response?.result ||
                response ||
                [];


            setCountries(
                Array.isArray(data)
                    ? data
                    : []
            );


        } catch (err) {

            console.log(
                "error getting countries:",
                err
            );

            setCountries([]);

        }

    };


    /* ================================================= */
    /* LOAD STATES */
    /* ================================================= */

    const loadStates = async (CountryId) => {

        try {

            if (!CountryId) {

                setStates([]);

                return;

            }


            const response =
                await getstates(
                    CountryId
                );


            console.log(
                "States API data:",
                response
            );


            const data =
                response?.states ||
                response?.result ||
                response ||
                [];


            setStates(
                Array.isArray(data)
                    ? data
                    : []
            );


        } catch (err) {

            console.log(
                "error getting states:",
                err
            );

            setStates([]);

        }

    };


    /* ================================================= */
    /* LOAD TERRITORIES */
    /* ================================================= */

    const loadTerritories = async (StateIds) => {

        try {

            if (!StateIds || !Array.isArray(StateIds)) {

                setTerritories([]);

                return;

            }

            const requestId = ++territoryRequestRef.current;


            const responses = await Promise.all(
                StateIds.map((StateId) =>
                    getTerritorie(StateId)
                )
            );


            console.log(
                "Territories API data:",
                responses
            );


            const data = responses.flatMap((response) =>
                response?.territories ||
                response?.result ||
                response ||
                []
            );

            const uniqueTerritories = Array.from(
                new Map(
                    data.map((territory) => [
                        territory.TerritoryId,
                        territory,
                    ])
                ).values()
            );

            if (requestId !== territoryRequestRef.current) {
                return;
            }


            setTerritories(
                Array.isArray(uniqueTerritories)
                    ? uniqueTerritories
                    : []
            );


        } catch (err) {

            console.log(
                "error getting territories:",
                err
            );

            setTerritories([]);

        }

    };


    /* ================================================= */
    /* LOAD DIVISIONS BY TERRITORY */
    /* ================================================= */

    const loadDivisionsByTerritory =
        async (TerritoryId) => {

            try {

                if (!TerritoryId) {

                    setDivisions([]);

                    return;

                }


                const response = await getDivisions();


                console.log(
                    "Divisions by Territory API data:",
                    response
                );


                const data =
                    response?.divisions ||
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
                    "error getting divisions by territory:",
                    err
                );

                setDivisions([]);

            }

        };


    /* ================================================= */
    /* LOAD MANAGERS BY DIVISION */
    /* ================================================= */

    const loadManagersByDivision =
        async (DivisionId) => {

            try {

                if (!DivisionId) {

                    setManagers([]);

                    return;

                }


                const response = await getUsers();


                console.log(
                    "Managers by Division API data:",
                    response
                );


                const data =
                    response?.managers ||
                    response?.users ||
                    response?.result ||
                    response ||
                    [];

                const managerRows =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data?.recordset)
                            ? data.recordset
                            : [];

                const filteredManagers = managerRows.filter((manager) => {
                    const managerDivisionId =
                        manager.DivisionId ||
                        manager.divisionId ||
                        manager.DivisionID ||
                        manager.Division_Id;

                    return managerDivisionId === DivisionId;
                });

                setManagers(filteredManagers);


            } catch (err) {

                console.log(
                    "error getting managers by division:",
                    err
                );

                setManagers([]);

            }

        };


    /* ================================================= */
    /* LOAD INITIAL DATA */
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

                    setDesignations([]);

                }

            };


        loadDesignation();
        loadCountries();

    }, []);


    /* ================================================= */
    /* CLOSE */
    /* ================================================= */

    const handleClosed = () => {

        setOpenCloseDialog(true);

    };


    return (

        <Paper
            component="form"
            onSubmit={formik.handleSubmit}
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
            {/* FORM HEADER */}
            {/* ================================================= */}

            <Box
                sx={{
                    px: {
                        xs: 2.5,
                        md: 4,
                    },
                    py: {
                        xs: 2.5,
                        md: 3,
                    },
                    backgroundColor: "background.paper",
                }}
            >

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                    }}
                >

                    <Box
                        sx={(theme) => ({
                            width: 3,
                            minWidth: 3,
                            height: 44,
                            mt: 0.2,
                            borderRadius: 10,
                            backgroundColor: "primary.main",
                            boxShadow:
                                `0 0 0 4px ${alpha(
                                    theme.palette.primary.main,
                                    0.07
                                )}`,
                        })}
                    />

                    <Box>

                        <Typography
                            sx={{
                                fontSize: {
                                    xs: 20,
                                    md: 22,
                                },
                                fontWeight: 700,
                                color: "text.primary",
                                letterSpacing: "-0.025em",
                                lineHeight: 1.25,
                            }}
                        >
                            Create User
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.55,
                                fontSize: 13,
                                lineHeight: 1.55,
                                color: "text.secondary",
                                maxWidth: 640,
                            }}
                        >
                            Add a new user and configure
                            their organizational access.
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
                        md: 4,
                    },
                    py: {
                        xs: 3,
                        md: 3.5,
                    },
                    display: "flex",
                    flexDirection: "column",
                    gap: 3.5,
                }}
            >

                {/* ================================================= */}
                {/* BASIC INFORMATION */}
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
                                minWidth: 3,
                                height: 36,
                                borderRadius: 2,
                                backgroundColor:
                                    "primary.main",
                                mt: 0.15,
                            }}
                        />

                        <Box>

                            <Typography
                                sx={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: "text.primary",
                                    letterSpacing: "-0.01em",
                                    lineHeight: 1.35,
                                }}
                            >
                                Basic Information
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    fontSize: 12.5,
                                    color: "text.secondary",
                                    lineHeight: 1.5,
                                }}
                            >
                                Enter the user's account and contact details.
                            </Typography>

                        </Box>

                    </Box>


                    <Grid
                        container
                        spacing={{
                            xs: 2,
                            md: 2.25,
                        }}
                    >

                        <Grid size={{ xs: 12, md: 6 }}>

                            <TextField
                                fullWidth
                                label="Username *"
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


                        <Grid size={{ xs: 12, md: 6 }}>

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


                        <Grid size={{ xs: 12, md: 6 }}>

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


                        <Grid size={{ xs: 12, md: 6 }}>

                            <TextField
                                fullWidth
                                label="Email * "
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


                        <Grid size={{ xs: 12, md: 6 }}>

                            <Grid
                                container
                                spacing={1.5}
                            >

                                <Grid size={{ xs: 4 }}>

                                    <Autocomplete
                                        fullWidth
                                        options={mobileCountries}
                                        getOptionLabel={
                                            (country) =>
                                                `${country.countryCallingCode} - ${country.countryNameEn}`
                                        }
                                        value={
                                            mobileCountries.find(
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
                                        renderInput={
                                            (params) => (

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

                                            )
                                        }
                                    />

                                </Grid>


                                <Grid size={{ xs: 8 }}>

                                    <TextField
                                        fullWidth
                                        label="Mobile Number * "
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


                        <Grid size={{ xs: 12, md: 6 }}>

                            <TextField
                                fullWidth
                                label="Password * "
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
                                minWidth: 3,
                                height: 36,
                                borderRadius: 2,
                                backgroundColor:
                                    "primary.main",
                                mt: 0.15,
                            }}
                        />

                        <Box>

                            <Typography
                                sx={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: "text.primary",
                                    letterSpacing: "-0.01em",
                                    lineHeight: 1.35,
                                }}
                            >
                                Organizational Access
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    fontSize: 12.5,
                                    color: "text.secondary",
                                    lineHeight: 1.5,
                                }}
                            >
                                Configure the user's role and organizational access.
                            </Typography>

                        </Box>

                    </Box>


                    <Grid
                        container
                        spacing={{
                            xs: 2,
                            md: 2.25,
                        }}
                    >

                        {/* DESIGNATION */}

                        <Grid size={{ xs: 12, md: 6 }}>

                            <TextField
                                fullWidth
                                select
                                label="Designation * "
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


                        {/* COUNTRY */}

                        <Grid size={{ xs: 12, md: 6 }}>

                            <Autocomplete
                                options={countries}
                                value={
                                    countries.find(
                                        (country) =>
                                            country.CountryId ===
                                            formik.values.CountryId
                                    ) || null
                                }
                                getOptionLabel={(country) =>
                                    country.CountryName || ""
                                }
                                onChange={(event, value) => {

                                    formik.setFieldValue(
                                        "CountryId",
                                        value
                                            ? value.CountryId
                                            : ""
                                    );

                                    formik.setFieldValue(
                                        "StateIds",
                                        []
                                    );

                                    formik.setFieldValue(
                                        "TerritoryIds",
                                        []
                                    );

                                    formik.setFieldValue(
                                        "DivisionId",
                                        ""
                                    );

                                    setReportingManager(
                                        ""
                                    );

                                    setStates([]);
                                    setTerritories([]);
                                    setDivisions([]);
                                    setManagers([]);

                                    if (value) {

                                        loadStates(
                                            value.CountryId
                                        );

                                    }

                                }}
                                onBlur={() =>
                                    formik.setFieldTouched(
                                        "CountryId",
                                        true
                                    )
                                }
                                renderInput={(params) => (

                                    <TextField
                                        {...params}
                                        label="Country * "
                                        sx={fieldSx}
                                        error={
                                            formik.touched.CountryId &&
                                            Boolean(
                                                formik.errors.CountryId
                                            )
                                        }
                                        helperText={
                                            formik.touched.CountryId &&
                                            formik.errors.CountryId
                                        }
                                    />

                                )}
                            />

                        </Grid>


                        {/* STATE */}

                        <Grid size={{ xs: 12, md: 6 }}>

                            <Autocomplete
                                multiple
                                options={states}
                                value={
                                    states.filter(
                                        (state) =>
                                            formik.values.StateIds.includes(state.StateId)
                                    ) || null
                                }
                                disabled={
                                    !formik.values.CountryId
                                }
                                getOptionLabel={(state) =>
                                    state.StateName || ""
                                }
                                onChange={(event, value) => {

                                    formik.setFieldValue(
                                        "StateIds",
                                        value
                                            ? value.map((state) => state.StateId)
                                            : []
                                    );

                                    formik.setFieldValue(
                                        "TerritoryIds",
                                        []
                                    );

                                    formik.setFieldValue(
                                        "DivisionId",
                                        ""
                                    );

                                    setReportingManager(
                                        ""
                                    );

                                    setTerritories([]);
                                    setDivisions([]);
                                    setManagers([]);

                                    if (value.length > 0) {

                                        loadTerritories(
                                            value.map((state) => state.StateId)
                                        );

                                    }

                                }}
                                onBlur={() =>
                                    formik.setFieldTouched(
                                        "StateIds",
                                        true
                                    )
                                }
                                renderInput={(params) => (

                                    <TextField
                                        {...params}
                                        label="State * "
                                        sx={fieldSx}
                                        error={
                                            formik.touched.StateIds &&
                                            Boolean(
                                                formik.errors.StateIds
                                            )
                                        }
                                        helperText={
                                            formik.touched.StateIds &&
                                            formik.errors.StateIds
                                        }
                                    />

                                )}
                            />

                        </Grid>


                        {/* TERRITORY */}

                        <Grid size={{ xs: 12, md: 6 }}>

                            <Autocomplete
                                multiple
                                options={territories}
                                value={
                                    territories.filter(
                                        (territory) =>
                                            formik.values.TerritoryIds.includes(
                                                territory.TerritoryId
                                            )
                                    )
                                }
                                onChange={(event, value) => {

                                    const TerritoryIds =
                                        value.map(
                                            (territory) =>
                                                territory.TerritoryId
                                        );

                                    formik.setFieldValue(
                                        "TerritoryIds",
                                        TerritoryIds
                                    );

                                    formik.setFieldValue(
                                        "DivisionId",
                                        ""
                                    );

                                    setReportingManager("");

                                    setDivisions([]);
                                    setManagers([]);

                                    if (TerritoryIds.length > 0) {

                                        loadDivisionsByTerritory(
                                            TerritoryIds
                                        );

                                    }

                                }}
                                onBlur={() =>
                                    formik.setFieldTouched(
                                        "TerritoryIds",
                                        true
                                    )
                                }
                                disabled={
                                    !formik.values.StateIds ||
                                    formik.values.StateIds.length === 0
                                }
                                getOptionLabel={(territory) =>
                                    territory.TerritoryName || ""
                                }
                                isOptionEqualToValue={(
                                    option,
                                    value
                                ) =>
                                    option.TerritoryId ===
                                    value.TerritoryId
                                }
                                renderInput={(params) => (

                                    <TextField
                                        {...params}
                                        fullWidth
                                        label="Territory *"
                                        sx={fieldSx}
                                        error={
                                            formik.touched.TerritoryIds &&
                                            Boolean(
                                                formik.errors.TerritoryIds
                                            )
                                        }
                                        helperText={
                                            formik.touched.TerritoryIds &&
                                            formik.errors.TerritoryIds
                                        }
                                    />

                                )}
                            />

                        </Grid>


                        {/* DIVISION */}

                        <Grid size={{ xs: 12, md: 6 }}>

                            <TextField
                                fullWidth
                                select
                                label="Division * "
                                name="DivisionId"
                                value={
                                    formik.values.DivisionId
                                }
                                onChange={(event) => {

                                    const DivisionId =
                                        event.target.value;

                                    formik.setFieldValue(
                                        "DivisionId",
                                        DivisionId
                                    );

                                    setReportingManager(
                                        ""
                                    );

                                    setManagers([]);

                                    if (DivisionId) {

                                        loadManagersByDivision(
                                            DivisionId
                                        );

                                    }

                                }}
                                onBlur={
                                    formik.handleBlur
                                }
                                disabled={
                                    !formik.values.TerritoryIds ||
                                    formik.values.TerritoryIds.length === 0
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
                                    {
                                        !formik.values.TerritoryIds ||
                                        formik.values.TerritoryIds.length === 0
                                            ? "Select Territory First"
                                            : "Select Division"
                                    }
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


                        {/* REPORTING MANAGER */}

                        <Grid size={{ xs: 12, md: 6 }}>

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
                                disabled={
                                    !formik.values.DivisionId
                                }
                                sx={fieldSx}
                            >

                                <MenuItem value="">
                                    {
                                        !formik.values.DivisionId
                                            ? "Select Division First"
                                            : "Select Reporting Manager"
                                    }
                                </MenuItem>

                                {managers.map(
                                    (manager) => {

                                        const ManagerId =
                                            manager.UserId ||
                                            manager.userId ||
                                            manager.UserID ||
                                            manager.Id;

                                        const displayName =
                                            manager.UserName ||
                                            manager.userName ||
                                            manager.Username ||
                                            manager.Name ||
                                            [
                                                manager.FirstName,
                                                manager.LastName,
                                            ]
                                                .filter(Boolean)
                                                .join(" ") ||
                                            "-";

                                        return (

                                            <MenuItem
                                                key={
                                                    ManagerId
                                                }
                                                value={
                                                    ManagerId
                                                }
                                            >
                                                {
                                                    displayName
                                                }
                                            </MenuItem>

                                        );

                                    }
                                )}

                            </TextField>

                        </Grid>

                    </Grid>

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
                        md: 4,
                    },
                    py: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 1.25,
                    backgroundColor: "surface.subtle",
                }}
            >

                {/* CLOSE */}

                <Button
                    variant="outlined"
                    onClick={
                        handleClosed
                    }
                    sx={{
                        minWidth: 100,
                        height: 40,
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontSize: 13,
                        fontWeight: 600,
                        borderColor: "divider",
                        color: "text.secondary",
                        backgroundColor: "background.paper",
                    }}
                >
                    Close
                </Button>


                {/* CREATE USER */}

                <Button
                    type="submit"
                    variant="contained"
                    disabled={
                        formik.isSubmitting
                    }
                    sx={{
                        minWidth: 135,
                        height: 40,
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontSize: 13,
                        fontWeight: 700,
                        boxShadow: "none",
                    }}
                >
                    {
                        formik.isSubmitting
                            ? "Creating..."
                            : "Create User"
                    }
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