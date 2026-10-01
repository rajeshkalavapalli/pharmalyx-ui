import {
    Box,
    Typography,
    TextField,
    ToggleButtonGroup,
    ToggleButton,
    Button,
    Paper,
    InputAdornment,
    MenuItem,
} from "@mui/material";

import { useFormik } from "formik";
import * as Yup from "yup";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSnackbar } from "../../components/Snackbar/SnackbarContext";

import { getcountry, getstates, getTerritorie } from "../Territory/index";
import { getAreasByTerritory } from "../Doctors/index";

import { createStockist, updateStockist } from "./index";


import { alpha } from "@mui/material/styles";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";


const sectionStyles = {
    pharmacy: (theme) => ({
        color: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
    }),
    contact: (theme) => ({
        color: theme.palette.success.main,
        backgroundColor: alpha(theme.palette.success.main, 0.08),
    }),
    regulatory: (theme) => ({
        color: theme.palette.warning.dark,
        backgroundColor: alpha(theme.palette.warning.main, 0.1),
    }),
    location: (theme) => ({
        color: theme.palette.info.dark,
        backgroundColor: alpha(theme.palette.info.main, 0.08),
    }),
    status: (theme) => ({
        color: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, 0.07),
    }),
};

function SectionHeading({ icon: Icon, title, tone }) {
    return (
        <Box
            sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                minHeight: 42,
                px: 1.5,
                borderRadius: 1.25,
                ...sectionStyles[tone](theme),
            })}
        >
            <Icon sx={{ fontSize: 19 }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
                {title}
            </Typography>
        </Box>
    );
}

const fieldSx = (theme) => ({
    "& .MuiInputLabel-root": {
        color: theme.palette.text.primary,
        fontSize: 12,
        fontWeight: 600,
    },
    "& .MuiOutlinedInput-root": {
        minHeight: 42,
        borderRadius: 1.25,
        backgroundColor: theme.palette.background.paper,
        "& fieldset": { borderColor: theme.palette.border.default },
        "&:hover fieldset": { borderColor: theme.palette.border.strong },
        "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
    },
    "& .MuiInputBase-input": { fontSize: 12.5 },
    "& .MuiSelect-select": { fontSize: 12.5 },
});

const formGridSx = {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
    gap: { xs: 2, sm: 2.25 },
};

export const AddStockistOrRetailer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showSnackbar } = useSnackbar();
    const stockist = location.state?.pharmacy;
    const mode = location.state?.mode || "create";
    const readOnly = mode === "view";

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [territories, setTerritories] = useState([]);
    const [areas, setAreas] = useState([]);


    const formik = useFormik({
        initialValues: {
            StocistName: stockist?.StockistName || "",
            ownerName: stockist?.OwnerName || "",
            contactNumber: stockist?.ContactNumber || "",
            emailId: stockist?.EmailId || "",
            drugLicenceNumber: stockist?.DrugLicenceNumber || "",
            gstin: stockist?.GSTIN || "",
            countryId: stockist?.CountryId || "",
            stateId: stockist?.StateId || "",
            territoryId: stockist?.TerritoryId || "",
            areaId: stockist?.AreaId || "",
            address: stockist?.Address || "",
            status: stockist?.IsActive === "No" ? "no" : "yes",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            StocistName: Yup.string().required("stockist name required "),
            ownerName: Yup.string().required("owner name required"),
            contactNumber: Yup.string().required("contact number required"),
            emailId: Yup.string().email("Enter a valid email address"),
            countryId: Yup.string().required("Country is required"),
            stateId: Yup.string().required("State is required"),
            territoryId: Yup.string().required("Territory is required"),
            areaId: Yup.string().required("Area is required"),
            address: Yup.string().trim().required("Address is required"),
        }),

        onSubmit: async (values) => {
            try {
                const { status, ...stockistValues } = values;
                const stockistPayload = {
                    StockistName: stockistValues.StocistName,
                    OwnerName: stockistValues.ownerName,
                    ContactNumber: stockistValues.contactNumber,
                    EmailId: stockistValues.emailId || null,
                    DrugLicenceNumber: stockistValues.drugLicenceNumber || null,
                    GSTIN: stockistValues.gstin || null,
                    CountryId: stockistValues.countryId,
                    StateId: stockistValues.stateId,
                    TerritoryId: stockistValues.territoryId,
                    AreaId: stockistValues.areaId,
                    Address: stockistValues.address,
                    IsActive: status === "no" ? "No" : "Yes",
                };
                const response = mode === "edit"
                    ? await updateStockist(stockist?.StockistId, stockistPayload)
                    : await createStockist(stockistPayload);
                showSnackbar(
                    response?.message || (mode === "edit" ? "Stockist updated successfully" : "Stockist created successfully"),
                    "success"
                );
                formik.resetForm();
                navigate("/admin/Stockist");
            } catch (error) {
                console.error("Error creating stockist", error);
                showSnackbar(
                    error.response?.data?.message || error.message || "Stockist was not created",
                    "error"
                );
            }
        },
    });

    console.log("initiall formik values ===> ", formik.values);

    useEffect(() => {
        const loadCountry = async () => {
            try {
                const response = await getcountry();
                const countryList = response?.country;
                console.log("loaded countries ===> ", countryList);
                setCountries(Array.isArray(countryList) ? countryList : []);
            } catch (error) {
                console.error("Error loading countries", error);
                setCountries([]);
            }
        };
        loadCountry();
    }, []);

    useEffect(() => {
        const loadStates = async () => {
            if (!formik.values.countryId) {
                const preserveRecordValues = stockist?.CountryId === formik.values.countryId;
                if (!preserveRecordValues) setStates([]);
                setTerritories([]);
                setAreas([]);
                return;
            }

            try {
                const response = await getstates(formik.values.countryId);
                const stateList = response?.states;
                console.log("loaded states ===> ", stateList);
                setStates(Array.isArray(stateList) ? stateList : []);
            } catch (err) {
                console.error("Error loading states", err);
                setStates([]);
            }
            setTerritories([]);
            setAreas([]);
            if (stockist?.CountryId !== formik.values.countryId) {
                formik.setFieldValue("stateId", "");
                formik.setFieldValue("territoryId", "");
                formik.setFieldValue("areaId", "");
            }
        };
        loadStates();
    }, [formik.values.countryId]);

    useEffect(() => {
        const loadTerritories = async () => {
            if (!formik.values.stateId) {
                setTerritories([]);
                setAreas([]);
                return;
            }

            try {
                const response = await getTerritorie(formik.values.stateId);
                const territoryList = response?.territories;
                setTerritories(Array.isArray(territoryList) ? territoryList : []);
            } catch (error) {
                console.error("Error loading territories", error);
                setTerritories([]);
            }
            setAreas([]);
            if (stockist?.StateId !== formik.values.stateId) {
                formik.setFieldValue("territoryId", "");
                formik.setFieldValue("areaId", "");
            }
        };
        loadTerritories();
    }, [formik.values.stateId]);

    useEffect(() => {
        const loadAreas = async () => {
            if (!formik.values.territoryId) {
                setAreas([]);
                return;
            }

            try {
                const response = await getAreasByTerritory(formik.values.territoryId);
                setAreas(Array.isArray(response) ? response : []);
            } catch (error) {
                console.error("Error loading areas", error);
                setAreas([]);
            }
            if (stockist?.TerritoryId !== formik.values.territoryId) {
                formik.setFieldValue("areaId", "");
            }
        };
        loadAreas();
    }, [formik.values.territoryId]);

    return (
        <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ width: "100%", py: { xs: 1.5, sm: 2 } }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box
                    sx={(theme) => ({
                        width: 40,
                        height: 40,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 1.5,
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.09),
                        flexShrink: 0,
                    })}
                >
                    <LocalPharmacyOutlinedIcon />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 750, color: "text.primary", lineHeight: 1.25 }}>
                        {mode === "view" ? "View Stockist" : mode === "edit" ? "Edit Stockist" : " Add Stockist"}
                    </Typography>
                    <Typography sx={{ mt: 0.25, fontSize: 12.5, color: "text.secondary" }}>
                        {readOnly ? "Stockist / chemist details" : "Enter stockist / chemist details"}
                    </Typography>
                </Box>
            </Box>

            <Paper
                elevation={0}
                sx={(theme) => ({
                    width: "100%",
                    p: { xs: 1.5, sm: 2.5 },
                    border: "1px solid",
                    borderColor: theme.palette.border.default,
                    borderRadius: theme.card.radius,
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: theme.card.shadow,
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 1.75, sm: 2 },
                })}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <SectionHeading icon={LocalPharmacyOutlinedIcon} title="Stockist Information" tone="pharmacy" />
                    <Box sx={formGridSx}>
                        <TextField
                            fullWidth
                            disabled={readOnly}
                            required
                            name="StocistName"
                            value={formik.values.StocistName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            label="Stockist Name"
                            placeholder="Enter stockist name"
                            sx={fieldSx}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><LocalPharmacyOutlinedIcon fontSize="small" color="action" /></InputAdornment>,
                            }}
                            error={formik.touched.StocistName && Boolean(formik.errors.StocistName)}
                            helperText={formik.touched.StocistName && formik.errors.StocistName}
                        />
                        <TextField
                            fullWidth
                            disabled={readOnly}
                            required
                            name="ownerName"
                            value={formik.values.ownerName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            label="Owner Name"
                            placeholder="Enter owner name"
                            sx={fieldSx}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><PersonOutlineRoundedIcon fontSize="small" color="action" /></InputAdornment>,
                            }}
                            error={formik.touched.ownerName && Boolean(formik.errors.ownerName)}
                            helperText={formik.touched.ownerName && formik.errors.ownerName}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <SectionHeading icon={CallRoundedIcon} title="Contact Information" tone="contact" />
                    <Box sx={formGridSx}>
                        <TextField
                            fullWidth
                            disabled={readOnly}
                            required
                            name="contactNumber"
                            value={formik.values.contactNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            label="Mobile Number"
                            placeholder="Enter mobile number"
                            sx={fieldSx}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><CallRoundedIcon fontSize="small" color="action" /></InputAdornment>,
                            }}
                            error={formik.touched.contactNumber && Boolean(formik.errors.contactNumber)}
                            helperText={formik.touched.contactNumber && formik.errors.contactNumber}
                        />
                        <TextField
                            fullWidth
                            disabled={readOnly}
                            name="emailId"
                            value={formik.values.emailId}
                            onChange={formik.handleChange}
                            label="Email ID"
                            placeholder="Enter email id (optional)"
                            sx={fieldSx}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><EmailOutlinedIcon fontSize="small" color="action" /></InputAdornment>,
                            }}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <SectionHeading icon={DescriptionOutlinedIcon} title="Regulatory Information" tone="regulatory" />
                    <Box sx={formGridSx}>
                        <TextField
                            fullWidth
                            disabled={readOnly}
                            name="drugLicenceNumber"
                            value={formik.values.drugLicenceNumber}
                            onChange={formik.handleChange}
                            label="Drug Licence Number"
                            placeholder="Enter drug licence number"
                            sx={fieldSx}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><DescriptionOutlinedIcon fontSize="small" color="action" /></InputAdornment>,
                            }}
                        />
                        <TextField
                            fullWidth
                            disabled={readOnly}
                            name="gstin"
                            value={formik.values.gstin}
                            onChange={formik.handleChange}
                            label="GSTIN"
                            placeholder="Enter GSTIN (optional)"
                            sx={fieldSx}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><ReceiptLongOutlinedIcon fontSize="small" color="action" /></InputAdornment>,
                            }}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <SectionHeading icon={LocationOnOutlinedIcon} title="Location" tone="location" />
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                                lg: "repeat(4, minmax(0, 1fr))",
                            },
                            gap: { xs: 2, sm: 2.25 },
                        }}
                    >
                        <TextField fullWidth
                            select
                            disabled={readOnly}
                            name="countryId"
                            value={formik.values.countryId}
                            onChange={formik.handleChange}
                            label="Country"
                            onBlur={formik.handleBlur}
                            required sx={fieldSx}
                            error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                            helperText={formik.touched.countryId && formik.errors.countryId}
                        >
                            {countries.map((country) => (
                                <MenuItem key={country.CountryId}
                                    value={country.CountryId}>
                                    {country.CountryName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField fullWidth
                            select
                            name="stateId"
                            value={formik.values.stateId}
                            onChange={formik.handleChange}
                            label="State"
                            onBlur={formik.handleBlur}
                            disabled={readOnly || !formik.values.countryId}
                            required sx={fieldSx}
                            error={formik.touched.stateId && Boolean(formik.errors.stateId)}
                            helperText={formik.touched.stateId && formik.errors.stateId}
                        >
                            {states.map((state) => (
                                <MenuItem key={state.StateId}
                                    value={state.StateId}>
                                    {state.StateName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            select
                            name="territoryId"
                            value={formik.values.territoryId}
                            onChange={formik.handleChange}
                            label="Territory"
                            onBlur={formik.handleBlur}
                            disabled={readOnly || !formik.values.stateId}
                            required sx={fieldSx}
                            error={formik.touched.territoryId && Boolean(formik.errors.territoryId)}
                            helperText={formik.touched.territoryId && formik.errors.territoryId}
                        >
                            {territories.map((territory) => (
                                <MenuItem key={territory.TerritoryId} value={territory.TerritoryId}>
                                    {territory.TerritoryName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField fullWidth
                            select
                            name="areaId"
                            value={formik.values.areaId}
                            onChange={formik.handleChange}
                            label="Area"
                            onBlur={formik.handleBlur}
                            disabled={readOnly || !formik.values.territoryId}
                            required sx={fieldSx}
                            error={formik.touched.areaId && Boolean(formik.errors.areaId)}
                            helperText={formik.touched.areaId && formik.errors.areaId}
                        >
                            {areas.map((area) => (
                                <MenuItem key={area.AreaId} value={area.AreaId}>
                                    {area.AreaName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            disabled={readOnly}
                            required
                            name="address"
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            label="Address"
                            placeholder="Enter complete address"
                            multiline
                            minRows={2}
                            sx={{ ...fieldSx, gridColumn: "1 / -1" }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><ApartmentOutlinedIcon fontSize="small" color="action" /></InputAdornment>,
                            }}
                            error={formik.touched.address && Boolean(formik.errors.address)}
                            helperText={formik.touched.address && formik.errors.address}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <SectionHeading icon={SettingsOutlinedIcon} title="Status" tone="status" />
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: { xs: "stretch", sm: "center" },
                            justifyContent: "space-between",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 2,
                            px: 1,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                                Select Status
                            </Typography>
                            <ToggleButtonGroup
                                exclusive
                                aria-label="status selection"
                                size="small"
                                disabled={readOnly}
                                value={formik.values.status}
                                onChange={(event, value) => {
                                    if (value) formik.setFieldValue("status", value);
                                }}
                                sx={(theme) => ({
                                    "& .MuiToggleButton-root": {
                                        px: 2,
                                        py: 0.5,
                                        borderColor: theme.palette.border.default,
                                        color: theme.palette.text.secondary,
                                        textTransform: "none",
                                        fontSize: 12,
                                    },
                                    "& .MuiToggleButton-root.Mui-selected": {
                                        color: theme.palette.success.dark,
                                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                                    },
                                })}
                            >
                                <ToggleButton value="yes">Yes</ToggleButton>
                                <ToggleButton value="no">No</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.25 }}>
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => navigate("/admin/Stockist")}
                                sx={{
                                    minWidth: 100,
                                    textTransform: "none",
                                    borderColor: "border.default",
                                    color: "text.secondary",
                                }}
                            >
                                {readOnly ? "Back" : "Cancel"}
                            </Button>
                            {!readOnly && (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ minWidth: 160, textTransform: "none" }}
                                >
                                    {mode === "edit" ? "Update Stockist" : "Add Stockist"}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};