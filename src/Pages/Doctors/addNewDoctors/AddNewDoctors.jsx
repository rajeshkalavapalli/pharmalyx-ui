import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Button,
    ToggleButtonGroup,
    ToggleButton,
} from "@mui/material";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import {
    getcountry,
    getstates,
    getTerritorie,
} from "./../../Territory/index";

import { getAreasByTerritory } from "./../../Doctors/index";

import {
    createDoctor,
    updateDoctor,
} from "../index";

import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";


export const AddNewDoctors = function () {

    const navigate = useNavigate();
    const location = useLocation();

    const { showSnackbar } = useSnackbar();

    const mode = location.state?.mode || "create";
    const doctor = location.state?.doctor || null;

    const isEditMode = mode === "edit";
    const isViewMode = mode === "view";


    const [country, setCountry] = useState([]);
    const [state, setState] = useState([]);
    const [territories, setTerritories] = useState([]);
    const [areas, setAreas] = useState([]);


    const formik = useFormik({
        enableReinitialize: true,

        initialValues: {
            doctorName:
                doctor?.DoctorName ||
                doctor?.doctorName ||
                "",

            qualification:
                doctor?.Qualification ||
                doctor?.qualification ||
                "",

            speciality:
                doctor?.Speciality ||
                doctor?.speciality ||
                "",

            hospitalName:
                doctor?.HospitalName ||
                doctor?.hospitalName ||
                "",

            mobileNumber:
                doctor?.MobileNumber ||
                doctor?.mobileNumber ||
                "",

            emailId:
                doctor?.EmailId ||
                doctor?.emailId ||
                "",

            country:
                doctor?.CountryId ||
                doctor?.country ||
                "",

            state:
                doctor?.StateId ||
                doctor?.state ||
                "",

            territory:
                doctor?.TerritoryId ||
                doctor?.territory ||
                "",

            area:
                doctor?.AreaId ||
                doctor?.area ||
                "",

            status:
                doctor?.IsActive === "No"
                    ? "no"
                    : "yes",
        },


        validationSchema: Yup.object({
            doctorName: Yup.string().required(
                "Doctor name is required"
            ),

            qualification: Yup.string().required(
                "Qualification is required"
            ),

            speciality: Yup.string().required(
                "Speciality is required"
            ),

            hospitalName: Yup.string().required(
                "Hospital Name is required"
            ),
        }),


        onSubmit: async (values) => {

            try {

                /*
                 * CREATE
                 *
                 * Keep the form field names for create.
                 * Backend create flow can continue
                 * with the existing payload structure.
                 */
                const createPayload = {
                    doctorName: values.doctorName,
                    qualification: values.qualification,
                    speciality: values.speciality,
                    hospitalName: values.hospitalName,
                    mobileNumber: values.mobileNumber,
                    emailId: values.emailId,
                    country: values.country,
                    state: values.state,
                    territory: values.territory,
                    area: values.area,
                    isActive:
                        values.status === "no"
                            ? "No"
                            : "Yes",
                };


                /*
                 * UPDATE
                 *
                 * UPDATE_DOCTOR SQL expects these
                 * exact parameter names.
                 */
                const updatePayload = {
                    DoctorName: values.doctorName,
                    Qualification: values.qualification,
                    Speciality: values.speciality,
                    HospitalName: values.hospitalName,
                    MobileNumber: values.mobileNumber,
                    EmailId: values.emailId,
                    CountryId: values.country,
                    StateId: values.state,
                    TerritoryId: values.territory,
                    AreaId: values.area,
                    IsActive:
                        values.status === "no"
                            ? "No"
                            : "Yes",
                };


                console.log(
                    "create payload",
                    createPayload
                );

                console.log(
                    "update payload",
                    updatePayload
                );


                if (isEditMode) {

                    await updateDoctor(
                        doctor.DoctorId,
                        updatePayload
                    );

                    showSnackbar(
                        "Doctor updated successfully",
                        "success"
                    );

                } else {

                    const response =
                        await createDoctor(
                            createPayload
                        );

                    showSnackbar(
                        response?.message ||
                        "Doctor created successfully",
                        "success"
                    );
                }

                navigate("/admin/Doctors/list");

            } catch (err) {

                console.log(
                    "error saving doctor",
                    err
                );

                showSnackbar(
                    err.response?.data?.message ||
                    err.message ||
                    "Doctor was not saved",
                    "error"
                );
            }
        },
    });


    useEffect(() => {

        const loadCountries = async () => {

            try {

                const data = await getcountry();

                console.log(
                    "countries from api",
                    data
                );

                setCountry(
                    data.country || []
                );

            } catch (err) {

                console.log(
                    "error loading countries",
                    err
                );

                setCountry([]);
            }
        };

        loadCountries();

    }, []);


    useEffect(() => {

        if (!formik.values.country) {
            setState([]);
            return;
        }

        const loadStates = async () => {

            try {

                const data =
                    await getstates(
                        formik.values.country
                    );

                console.log(
                    "states from api",
                    data
                );

                setState(
                    data.states || []
                );

            } catch (err) {

                console.log(
                    "error loading states",
                    err
                );

                setState([]);
            }
        };

        loadStates();

    }, [formik.values.country]);


    useEffect(() => {

        if (!formik.values.state) {
            setTerritories([]);
            return;
        }

        const loadTerritories = async () => {

            try {

                const data =
                    await getTerritorie(
                        formik.values.state
                    );

                console.log(
                    "territories from api",
                    data
                );

                setTerritories(
                    data.territories || []
                );

            } catch (err) {

                console.log(
                    "error loading territories",
                    err
                );

                setTerritories([]);
            }
        };

        loadTerritories();

    }, [formik.values.state]);


    useEffect(() => {

        if (!formik.values.territory) {
            setAreas([]);
            return;
        }

        const loadAreas = async () => {

            try {

                const data =
                    await getAreasByTerritory(
                        formik.values.territory
                    );

                console.log(
                    "areas from api",
                    data
                );

                setAreas(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {

                console.log(
                    "error loading areas",
                    err
                );

                setAreas([]);
            }
        };

        loadAreas();

    }, [formik.values.territory]);


    return (
        <Box
            sx={(theme) => ({
                width: "100%",
                border: "1px solid",
                borderColor:
                    theme.palette.border.default,
                borderRadius:
                    theme.card.radius,
                backgroundColor:
                    theme.palette.background.paper,
                boxShadow:
                    theme.card.shadow,
                overflow: "hidden",

                "& .MuiTextField-root": {
                    width: "100%",
                },

                "& .MuiOutlinedInput-root": {
                    minHeight:
                        theme.field.minHeight,
                    borderRadius:
                        theme.field.radius,
                    backgroundColor:
                        theme.palette.background.paper,
                    transition:
                        theme.field.transition,

                    "& fieldset": {
                        borderColor:
                            theme.palette.border.default,
                    },

                    "&:hover fieldset": {
                        borderColor:
                            theme.palette.border.strong,
                    },

                    "&.Mui-focused fieldset": {
                        borderColor:
                            theme.palette.primary.main,
                    },
                },

                "& .MuiInputLabel-root": {
                    color:
                        theme.palette.text.secondary,
                    fontSize:
                        theme.field.label.fontSize,
                },

                "& .MuiInputBase-input": {
                    fontSize:
                        theme.field.input.fontSize,
                },
            })}
        >

            <Box
                sx={(theme) => ({
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(3, minmax(0, 1fr))",
                    gap:
                        theme.layout.section.fieldGap,
                    p: { xs: 2, sm: 3 },

                    [theme.breakpoints.down("md")]: {
                        gridTemplateColumns:
                            "repeat(2, minmax(0, 1fr))",
                    },

                    [theme.breakpoints.down("sm")]: {
                        gridTemplateColumns:
                            "minmax(0, 1fr)",
                        gap: 1.5,
                    },
                })}
            >

                {/* Doctor Information */}

                <Box
                    sx={(theme) => ({
                        gridColumn: "1 / -1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        gap: 1.5,
                        px: 1.25,
                        py: 0.75,
                        borderRadius: 1,
                        backgroundColor:
                            theme.palette.surface.muted,
                    })}
                >

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                        }}
                    >

                        <Box
                            sx={(theme) => ({
                                width: 32,
                                height: 32,
                                display: "grid",
                                placeItems: "center",
                                borderRadius:
                                    theme.field.radius,
                                backgroundColor:
                                    theme.palette.brand
                                        .terracottaSoft,
                                color:
                                    theme.palette.primary.main,
                                flexShrink: 0,
                            })}
                        >
                            <PersonRoundedIcon
                                fontSize="small"
                            />
                        </Box>

                        <Typography
                            sx={{
                                color: "text.primary",
                                fontSize: 15,
                                fontWeight: 700,
                            }}
                        >
                            Doctor Information
                        </Typography>

                    </Box>

                    <Typography
                        sx={{
                            color: "text.secondary",
                            fontSize: 11.5,
                            textAlign: "right",
                        }}
                    >
                        Enter doctor&apos;s basic details
                    </Typography>

                </Box>


                <TextField
                    label="Doctor Name *"
                    name="doctorName"
                    value={
                        formik.values.doctorName
                    }
                    onChange={
                        formik.handleChange
                    }
                    onBlur={
                        formik.handleBlur
                    }
                    error={
                        formik.touched.doctorName &&
                        Boolean(
                            formik.errors.doctorName
                        )
                    }
                    helperText={
                        formik.touched.doctorName &&
                        formik.errors.doctorName
                    }
                    disabled={isViewMode}
                />


                <TextField
                    label="Qualification *"
                    name="qualification"
                    value={
                        formik.values.qualification
                    }
                    onChange={
                        formik.handleChange
                    }
                    onBlur={
                        formik.handleBlur
                    }
                    error={
                        formik.touched.qualification &&
                        Boolean(
                            formik.errors.qualification
                        )
                    }
                    helperText={
                        formik.touched.qualification &&
                        formik.errors.qualification
                    }
                    disabled={isViewMode}
                />


                <TextField
                    label="Speciality*"
                    name="speciality"
                    value={
                        formik.values.speciality
                    }
                    onChange={
                        formik.handleChange
                    }
                    onBlur={
                        formik.handleBlur
                    }
                    error={
                        formik.touched.speciality &&
                        Boolean(
                            formik.errors.speciality
                        )
                    }
                    helperText={
                        formik.touched.speciality &&
                        formik.errors.speciality
                    }
                    disabled={isViewMode}
                />


                <TextField
                    label="Hospital Name/ Clinic Name *"
                    name="hospitalName"
                    value={
                        formik.values.hospitalName
                    }
                    onChange={
                        formik.handleChange
                    }
                    onBlur={
                        formik.handleBlur
                    }
                    error={
                        formik.touched.hospitalName &&
                        Boolean(
                            formik.errors.hospitalName
                        )
                    }
                    helperText={
                        formik.touched.hospitalName &&
                        formik.errors.hospitalName
                    }
                    disabled={isViewMode}
                />


                {/* Contact Information */}

                <Box
                    sx={(theme) => ({
                        gridColumn: "1 / -1",
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(2, minmax(0, 1fr))",
                        gap:
                            theme.layout.section.fieldGap,

                        [theme.breakpoints.down("sm")]: {
                            gridTemplateColumns:
                                "minmax(0, 1fr)",
                            gap: 1.5,
                        },
                    })}
                >

                    <Box
                        sx={(theme) => ({
                            gridColumn: "1 / -1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",
                            gap: 1.5,
                            px: 1.25,
                            py: 0.75,
                            borderRadius: 1,
                            backgroundColor:
                                theme.palette.surface.muted,
                        })}
                    >

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.25,
                            }}
                        >

                            <Box
                                sx={(theme) => ({
                                    width: 32,
                                    height: 32,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius:
                                        theme.field.radius,
                                    backgroundColor:
                                        theme.palette.brand
                                            .terracottaSoft,
                                    color:
                                        theme.palette.primary.main,
                                    flexShrink: 0,
                                })}
                            >
                                <CallRoundedIcon
                                    fontSize="small"
                                />
                            </Box>

                            <Typography
                                sx={{
                                    color: "text.primary",
                                    fontSize: 15,
                                    fontWeight: 700,
                                }}
                            >
                                Contact Information
                            </Typography>

                        </Box>

                        <Typography
                            sx={{
                                color: "text.secondary",
                                fontSize: 11.5,
                                textAlign: "right",
                            }}
                        >
                            Enter contact details
                        </Typography>

                    </Box>


                    <TextField
                        label="Mobile Number"
                        name="mobileNumber"
                        value={
                            formik.values.mobileNumber
                        }
                        onChange={
                            formik.handleChange
                        }
                        onBlur={
                            formik.handleBlur
                        }
                        error={
                            formik.touched.mobileNumber &&
                            Boolean(
                                formik.errors.mobileNumber
                            )
                        }
                        helperText={
                            formik.touched.mobileNumber &&
                            formik.errors.mobileNumber
                        }
                        disabled={isViewMode}
                    />


                    <TextField
                        label="Email Id"
                        name="emailId"
                        value={
                            formik.values.emailId
                        }
                        onChange={
                            formik.handleChange
                        }
                        onBlur={
                            formik.handleBlur
                        }
                        error={
                            formik.touched.emailId &&
                            Boolean(
                                formik.errors.emailId
                            )
                        }
                        helperText={
                            formik.touched.emailId &&
                            formik.errors.emailId
                        }
                        disabled={isViewMode}
                    />

                </Box>


                {/* Location */}

                <Box
                    sx={(theme) => ({
                        gridColumn: "1 / -1",
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(4, minmax(0, 1fr)) auto",
                        alignItems: "center",
                        gap:
                            theme.layout.section.fieldGap,

                        [theme.breakpoints.down("md")]: {
                            gridTemplateColumns:
                                "repeat(3, minmax(0, 1fr))",
                        },

                        [theme.breakpoints.down("sm")]: {
                            gridTemplateColumns:
                                "repeat(2, minmax(0, 1fr))",
                        },

                        [theme.breakpoints.down("xs")]: {
                            gridTemplateColumns:
                                "minmax(0, 1fr)",
                            gap: 1.5,
                        },
                    })}
                >

                    <Box
                        sx={(theme) => ({
                            gridColumn: "1 / -1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",
                            gap: 1.5,
                            px: 1.25,
                            py: 0.75,
                            borderRadius: 1,
                            backgroundColor:
                                theme.palette.surface.muted,
                        })}
                    >

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.25,
                            }}
                        >

                            <Box
                                sx={(theme) => ({
                                    width: 32,
                                    height: 32,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius:
                                        theme.field.radius,
                                    backgroundColor:
                                        theme.palette.brand
                                            .terracottaSoft,
                                    color:
                                        theme.palette.primary.main,
                                    flexShrink: 0,
                                })}
                            >
                                <LocationOnRoundedIcon
                                    fontSize="small"
                                />
                            </Box>

                            <Typography
                                sx={{
                                    color: "text.primary",
                                    fontSize: 15,
                                    fontWeight: 700,
                                }}
                            >
                                Location
                            </Typography>

                        </Box>

                        <Typography
                            sx={{
                                color: "text.secondary",
                                fontSize: 11.5,
                                textAlign: "right",
                            }}
                        >
                            Select the location details
                        </Typography>

                    </Box>


                    <TextField
                        label="Country *"
                        select
                        name="country"
                        value={formik.values.country}
                        onChange={formik.handleChange}
                        error={
                            formik.touched.country &&
                            Boolean(
                                formik.errors.country
                            )
                        }
                        helperText={
                            formik.touched.country &&
                            formik.errors.country
                        }
                        disabled={isViewMode}
                    >
                        {country.map((item) => (
                            <MenuItem
                                key={item.CountryId}
                                value={item.CountryId}
                            >
                                {item.CountryName}
                            </MenuItem>
                        ))}
                    </TextField>


                    <TextField
                        label="State *"
                        select
                        name="state"
                        value={
                            formik.values.state
                        }
                        onChange={
                            formik.handleChange
                        }
                        error={
                            formik.touched.state &&
                            Boolean(
                                formik.errors.state
                            )
                        }
                        helperText={
                            formik.touched.state &&
                            formik.errors.state
                        }
                        disabled={isViewMode}
                    >
                        {state.map((item) => (
                            <MenuItem
                                key={item.StateId}
                                value={item.StateId}
                            >
                                {item.StateName}
                            </MenuItem>
                        ))}
                    </TextField>


                    <TextField
                        label="Territory"
                        select
                        name="territory"
                        value={
                            formik.values.territory
                        }
                        onChange={
                            formik.handleChange
                        }
                        error={
                            formik.touched.territory &&
                            Boolean(
                                formik.errors.territory
                            )
                        }
                        helperText={
                            formik.touched.territory &&
                            formik.errors.territory
                        }
                        disabled={isViewMode}
                    >
                        {territories.map((item) => (
                            <MenuItem
                                key={item.TerritoryId}
                                value={item.TerritoryId}
                            >
                                {item.TerritoryName}
                            </MenuItem>
                        ))}
                    </TextField>


                    <TextField
                        label="Area *"
                        select
                        name="area"
                        value={
                            formik.values.area
                        }
                        onChange={
                            formik.handleChange
                        }
                        error={
                            formik.touched.area &&
                            Boolean(
                                formik.errors.area
                            )
                        }
                        helperText={
                            formik.touched.area &&
                            formik.errors.area
                        }
                        disabled={isViewMode}
                    >
                        {areas.map((item) => (
                            <MenuItem
                                key={item.AreaId}
                                value={item.AreaId}
                            >
                                {item.AreaName}
                            </MenuItem>
                        ))}
                    </TextField>


                    <Button
                        sx={(theme) => ({
                            minHeight:
                                theme.field.minHeight,
                            px: 1.75,
                            borderColor:
                                theme.palette.primary.main,
                            color:
                                theme.palette.primary.main,
                            whiteSpace: "nowrap",
                            alignSelf: "stretch",
                            minWidth: {
                                md: 128,
                            },

                            [theme.breakpoints.down("sm")]: {
                                gridColumn:
                                    "1 / -1",
                            },
                        })}
                        onClick={() =>
                            navigate("/admin/Areas/add")
                        }
                        disabled={isViewMode}
                    >
                        + Add Area
                    </Button>

                </Box>


                {/* Status */}

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.25,
                        gridColumn: "1 / -1",
                    }}
                >

                    {/* Status Heading */}

                    <Box
                        sx={(theme) => ({
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                            minHeight: 42,
                            px: 1.5,
                            borderRadius: 1.25,
                            color:
                                theme.palette.error.main,
                            backgroundColor:
                                theme.palette.error.main
                                    ? `${theme.palette.error.main}12`
                                    : theme.palette.surface.muted,
                        })}
                    >

                        <SettingsOutlinedIcon
                            sx={{ fontSize: 19 }}
                        />

                        <Typography
                            sx={{
                                fontSize: 13.5,
                                fontWeight: 700,
                            }}
                        >
                            Status
                        </Typography>

                    </Box>


                    {/* Status Selection + Actions */}

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: {
                                xs: "stretch",
                                sm: "center",
                            },
                            justifyContent:
                                "space-between",
                            flexDirection: {
                                xs: "column",
                                sm: "row",
                            },
                            gap: 2,
                            px: 1,
                        }}
                    >

                        {/* Select Status */}

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.25,
                            }}
                        >

                            <Typography
                                sx={{
                                    fontSize: 12.5,
                                    color:
                                        "text.secondary",
                                }}
                            >
                                Select Status
                            </Typography>


                            <ToggleButtonGroup
                                exclusive
                                aria-label="status selection"
                                size="small"
                                disabled={isViewMode}
                                value={
                                    formik.values.status
                                }
                                onChange={(
                                    event,
                                    value
                                ) => {

                                    if (value) {
                                        formik.setFieldValue(
                                            "status",
                                            value
                                        );
                                    }

                                }}
                                sx={(theme) => ({
                                    "& .MuiToggleButton-root": {
                                        px: 2,
                                        py: 0.5,
                                        borderColor:
                                            theme.palette
                                                .border
                                                .default,
                                        color:
                                            theme.palette
                                                .text
                                                .secondary,
                                        textTransform:
                                            "none",
                                        fontSize: 12,
                                    },

                                    "& .MuiToggleButton-root.Mui-selected":
                                        {
                                            color:
                                                theme.palette
                                                    .success
                                                    .dark,

                                            backgroundColor:
                                                `${theme.palette.success.main}1A`,

                                            "&:hover": {
                                                backgroundColor:
                                                    `${theme.palette.success.main}1A`,
                                            },
                                        },
                                })}
                            >

                                <ToggleButton value="yes">
                                    Yes
                                </ToggleButton>

                                <ToggleButton value="no">
                                    No
                                </ToggleButton>

                            </ToggleButtonGroup>

                        </Box>


                        {/* Actions */}

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent:
                                    "flex-end",
                                gap: 1.25,
                            }}
                        >

                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() =>
                                    navigate(
                                        "/admin/Doctors/list"
                                    )
                                }
                                sx={(theme) => ({
                                    minWidth: 100,
                                    textTransform:
                                        "none",
                                    borderColor:
                                        theme.palette
                                            .border
                                            .default,
                                    color:
                                        theme.palette
                                            .text
                                            .secondary,
                                })}
                            >
                                {isViewMode
                                    ? "Back"
                                    : "Cancel"}
                            </Button>


                            {!isViewMode && (
                                <Button
                                    type="button"
                                    variant="contained"
                                    onClick={() =>
                                        formik.handleSubmit()
                                    }
                                    sx={{
                                        minWidth: 160,
                                        textTransform:
                                            "none",
                                    }}
                                >
                                    {isEditMode
                                        ? "Update Doctor"
                                        : "Add Doctor"}
                                </Button>
                            )}

                        </Box>

                    </Box>

                </Box>

            </Box>

        </Box>
    );
};