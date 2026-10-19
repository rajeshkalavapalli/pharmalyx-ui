import {
    Alert,
    Box,
    Typography,
    TextField,
    MenuItem,
    Button,
    Checkbox,
    FormControlLabel,
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

import EngagementFields from "./EngagementFields";

import {
    checkDuplicates,
    errorMessage,
    getMyPermissions,
    requestChange,
    requestNewDoctor,
    uploadPhoto,
} from "../../DoctorRequests/index";
import DuplicateMatches from "../../DoctorRequests/components/DuplicateMatches";
import {
    CameraCapture,
    LocationStatus,
} from "../../DoctorRequests/components/LiveCapture";
import useLiveLocation from "../../DoctorRequests/components/useLiveLocation";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";

const MIN_REASON = 10;

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
    // Where to go after save / cancel (Doctor Requests opens this form too).
    const returnTo = location.state?.returnTo || "/admin/Doctors/list";


    const [country, setCountry] = useState([]);
    const [state, setState] = useState([]);
    const [territories, setTerritories] = useState([]);
    const [areas, setAreas] = useState([]);

    // Admins save directly. Everyone else sends a request (live GPS, signboard photo, reason) to their manager.
    const [permissions, setPermissions] = useState(null);
    const liveLocation = useLiveLocation();
    const [photo, setPhoto] = useState(null);
    const [moveClinic, setMoveClinic] = useState(false);
    const [reason, setReason] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [duplicates, setDuplicates] = useState([]);

    const requestMode =
        !isViewMode &&
        Boolean(permissions) &&
        !permissions.has(isEditMode ? "masters.edit" : "masters.create");
    const needsLocation = requestMode && (!isEditMode || moveClinic);


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

            category: doctor?.Category || "",
            visitsPerMonth: doctor?.VisitsPerMonth ?? "",
            dateOfBirth: doctor?.DateOfBirth || "",
            anniversaryDate: doctor?.AnniversaryDate || "",
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

            visitsPerMonth: Yup.number()
                .transform((value, original) => (original === "" ? null : value))
                .nullable()
                .typeError("Enter a number")
                .integer("Enter a whole number")
                .min(0, "Cannot be negative")
                .max(31, "At most 31 visits"),
        }),


        onSubmit: async (values) => {

            if (requestMode) {
                await sendRequest(values);
                return;
            }

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
                    category: values.category,
                    visitsPerMonth: values.visitsPerMonth,
                    dateOfBirth: values.dateOfBirth,
                    anniversaryDate: values.anniversaryDate,
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
                    Category: values.category,
                    VisitsPerMonth: values.visitsPerMonth,
                    DateOfBirth: values.dateOfBirth,
                    AnniversaryDate: values.anniversaryDate,
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

                navigate(returnTo);

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
        getMyPermissions()
            .then(setPermissions)
            .catch(() => setPermissions(new Set()));
    }, []);

    // Live GPS: always for a new doctor, and for an edit when the clinic has moved.
    useEffect(() => {
        if (needsLocation) liveLocation.start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needsLocation]);

    // Possible duplicates while typing (new doctor requests only).
    const fix = liveLocation.fix;
    useEffect(() => {
        if (!requestMode || isEditMode) return undefined;

        const handle = setTimeout(() => {
            checkDuplicates({
                DoctorName: formik.values.doctorName,
                Speciality: formik.values.speciality,
                AreaId: formik.values.area || null,
                MobileNumber: formik.values.mobileNumber,
                RegistrationNumber: registrationNumber,
                Latitude: fix?.latitude ?? null,
                Longitude: fix?.longitude ?? null,
            })
                .then((response) => setDuplicates(response.duplicates || []))
                .catch(() => setDuplicates([]));
        }, 600);

        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestMode, isEditMode, formik.values.doctorName, formik.values.speciality, formik.values.area, formik.values.mobileNumber, registrationNumber, fix]);

    const registrationClash = duplicates.some(
        (match) =>
            match.doctor.ApprovalStatus === "APPROVED" &&
            match.reasons.some((item) => item.reason === "REGISTRATION_NO")
    );

    const sendRequest = async (values) => {
        if (needsLocation && liveLocation.status !== "CAPTURED") {
            showSnackbar("Capture the clinic location first (you need to be at the clinic).", "error");
            return;
        }
        if (!isEditMode && !photo) {
            showSnackbar("Take the clinic signboard photo first.", "error");
            return;
        }
        if (isEditMode && reason.trim().length < MIN_REASON) {
            showSnackbar(`Write why the details need to change (at least ${MIN_REASON} characters).`, "error");
            return;
        }

        const fields = {
            DoctorName: values.doctorName,
            Qualification: values.qualification,
            Speciality: values.speciality,
            HospitalName: values.hospitalName,
            MobileNumber: values.mobileNumber,
            EmailId: values.emailId,
            CountryId: values.country || null,
            StateId: values.state || null,
            TerritoryId: values.territory,
            AreaId: values.area,
            Category: values.category || null,
            VisitsPerMonth: values.visitsPerMonth === "" ? null : values.visitsPerMonth,
            DateOfBirth: values.dateOfBirth || null,
            AnniversaryDate: values.anniversaryDate || null,
            // Status change is part of an edit request; a new doctor starts active.
            ...(isEditMode ? { IsActive: values.status === "no" ? "No" : "Yes" } : {}),
        };
        const gps = needsLocation
            ? {
                  LocationStatus: "CAPTURED",
                  Latitude: fix.latitude,
                  Longitude: fix.longitude,
                  Accuracy: fix.accuracy,
              }
            : {};

        try {
            const photoId = photo ? (await uploadPhoto(photo)).photoId : undefined;
            let response;

            if (isEditMode) {
                response = await requestChange(doctor.DoctorId, {
                    RequestType: "EDIT",
                    Comment: reason.trim(),
                    Changes: registrationNumber ? { ...fields, RegistrationNumber: registrationNumber } : fields,
                    ...(moveClinic ? { MoveClinic: true, ...gps, PhotoId: photoId } : {}),
                });
            } else {
                response = await requestNewDoctor({
                    ...fields,
                    RegistrationNumber: registrationNumber || null,
                    Comment: reason.trim() || null,
                    ...gps,
                    PhotoId: photoId,
                });
            }

            showSnackbar(response?.message || "Sent to your manager", response?.duplicates ? "warning" : "success");
            navigate(returnTo);
        } catch (err) {
            showSnackbar(errorMessage(err, "The request was not sent"), "error");
        }
    };

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
                                fontSize: "textLg",
                                fontWeight: "fontWeightBold",
                            }}
                        >
                            Doctor Information
                        </Typography>

                    </Box>

                    <Typography
                        sx={{
                            color: "text.secondary",
                            fontSize: "textXs",
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


                <EngagementFields
                    formik={formik}
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
                                    fontSize: "textLg",
                                    fontWeight: "fontWeightBold",
                                }}
                            >
                                Contact Information
                            </Typography>

                        </Box>

                        <Typography
                            sx={{
                                color: "text.secondary",
                                fontSize: "textXs",
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
                                    fontSize: "textLg",
                                    fontWeight: "fontWeightBold",
                                }}
                            >
                                Location
                            </Typography>

                        </Box>

                        <Typography
                            sx={{
                                color: "text.secondary",
                                fontSize: "textXs",
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


                {/* Clinic check (requests only) */}

                {requestMode && (
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
                                <VerifiedUserRoundedIcon
                                    fontSize="small"
                                />
                            </Box>

                            <Typography
                                sx={{
                                    color: "text.primary",
                                    fontSize: "textLg",
                                    fontWeight: "fontWeightBold",
                                }}
                            >
                                Clinic Check
                            </Typography>

                        </Box>

                        <Typography
                            sx={{
                                color: "text.secondary",
                                fontSize: "textXs",
                                textAlign: "right",
                            }}
                        >
                            {isEditMode
                                ? "Your manager approves the change first"
                                : "Live GPS and signboard photo at the clinic; your manager approves"}
                        </Typography>

                    </Box>

                    {isEditMode && (
                        <FormControlLabel
                            sx={{ gridColumn: "1 / -1" }}
                            control={
                                <Checkbox
                                    checked={moveClinic}
                                    onChange={(event) => setMoveClinic(event.target.checked)}
                                />
                            }
                            label="The clinic has moved. Pin the new location (I am at the new clinic now)."
                        />
                    )}

                    {needsLocation && (
                        <LocationStatus
                            location={liveLocation}
                            label={isEditMode ? "New clinic location" : "Clinic location"}
                        />
                    )}

                    {needsLocation && (
                        <CameraCapture
                            value={photo}
                            onChange={setPhoto}
                            label={isEditMode ? "New signboard photo (recommended)" : "Clinic signboard photo *"}
                        />
                    )}

                    <TextField
                        label="Registration No. (if you have it)"
                        value={registrationNumber}
                        onChange={(event) => setRegistrationNumber(event.target.value.slice(0, 40))}
                    />

                    <TextField
                        multiline
                        minRows={2}
                        label={isEditMode ? "Why do these details need to change? *" : "Note for your manager (optional)"}
                        value={reason}
                        onChange={(event) => setReason(event.target.value.slice(0, 1000))}
                        error={isEditMode && Boolean(reason) && reason.trim().length < MIN_REASON}
                        helperText={isEditMode ? `At least ${MIN_REASON} characters` : " "}
                    />

                    {!isEditMode && duplicates.length > 0 && (
                        <Box sx={{ gridColumn: "1 / -1" }}>
                            {registrationClash && (
                                <Alert severity="error" variant="outlined" sx={{ mb: 1.5 }}>
                                    This registration number already belongs to an approved doctor. Ask your manager to assign that doctor to you instead.
                                </Alert>
                            )}
                            <DuplicateMatches
                                matches={duplicates}
                                subject={{
                                    DoctorName: formik.values.doctorName,
                                    Speciality: formik.values.speciality,
                                    HospitalName: formik.values.hospitalName,
                                }}
                                subjectPhotoId={null}
                                subjectTitle="New doctor"
                            />
                        </Box>
                    )}

                </Box>
                )}


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
                            sx={{ fontSize: "text3xl" }}
                        />

                        <Typography
                            sx={{
                                fontSize: "textMd",
                                fontWeight: "fontWeightBold",
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
                                    fontSize: "textSm",
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
                                disabled={isViewMode || (requestMode && !isEditMode)}
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
                                        fontSize: "textSm",
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


                        {requestMode && (
                            <Typography
                                sx={{
                                    fontSize: "textSm",
                                    color:
                                        "text.secondary",
                                }}
                            >
                                {isEditMode
                                    ? "Nothing changes until your manager approves."
                                    : "New doctors start active and stay provisional until approved and verified."}
                            </Typography>
                        )}

                        {/* Actions */}

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent:
                                    "flex-end",
                                gap: 1.25,
                                ml: "auto",
                            }}
                        >

                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() =>
                                    navigate(returnTo)
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
                                    disabled={
                                        formik.isSubmitting ||
                                        (requestMode && registrationClash)
                                    }
                                    sx={{
                                        minWidth: 160,
                                        textTransform:
                                            "none",
                                    }}
                                >
                                    {/* New doctor: "Add Doctor" for everyone; an edit by a non-admin goes to the manager. */}
                                    {isEditMode
                                        ? requestMode
                                            ? "Send to Manager"
                                            : "Update Doctor"
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