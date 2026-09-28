import { Box,Typography, TextField, MenuItem , Button} from "@mui/material";
import { useState, useEffect,  } from "react";
import { Formik, useFormik } from "formik";
import * as Yup from "yup";

import {
    getcountry,
    getstates,
    getTerritorie,
} from "./../../Territory/index";

import {getAreasByTerritory} from "./../../Doctors/index";
import { createDoctor } from "./../../Doctors/service";
import { useSnackbar } from "../../../components/Snackbar/SnackbarContext";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import { Navigate, useNavigate } from "react-router-dom";



export const AddNewDoctors = function() {

     const navigate = useNavigate();
     const { showSnackbar } = useSnackbar();
    


    const [country, setCountry] = useState([]);
    const [state, setState] = useState([]);
    const [territories, setTerritories] = useState([]);
    const [areas, setAreas] = useState([]);




    const formik = useFormik({
        initialValues:{
            doctorName: "",
            qualification: "",
            speciality: "",
            hospitalName: "",
            mobileNumber: "",
            emailId: "",
            country: "",
            state: '',
            territory: '',
            area: '',

        },


        validationSchema: Yup.object({
            doctorName: Yup.string().required("Doctor name is required"),
            qualification: Yup.string().required("Qualification is required"),
            speciality: Yup.string().required("Speciality is required"),
            hospitalName: Yup.string().required("Hospital Name is required"),
        }),

        onSubmit: async (values) => {
        const payload ={
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
    }
        console.log('payload from adddoctor ', payload)

        try{
            const response = await createDoctor(payload)
            showSnackbar(response?.message || "Doctor created successfully", "success")
            formik.resetForm()
            navigate('/admin/Doctors/list')
        }catch(err){
            console.log("error creating doctor", err)
            showSnackbar(err.response?.data?.message || err.message || "Doctor was not created", "error")
        }

        }

    })
    
    console.log("formik values", formik.values)



    useEffect(()=>{
        const loadCountries = async()=>{
            const data = await getcountry()
            console.log("countries from api", data)
            setCountry(data.country || [])
        }
        loadCountries()
    },[])
    
    {/** Load states when country changes **/}
    
    useEffect(()=>{
        const LoadStates = async()=>{
            const data = await getstates(formik.values.country)
            console.log("states from api", data)
            setState(data.states || [])
        }
        LoadStates()
    },[formik.values.country])

    {/** Load territorys when state changes **/}

   useEffect(()=>{
    const loadTerritories = async()=>{
        const data = await getTerritorie(formik.values.state)
        console.log("territories from api", data)
        // Assuming you have a setTerritory state similar to setState
        setTerritories(data.territories || [])
    }
    loadTerritories()
   },[formik.values.state])

   {/** areas when territory changes   **/}

   useEffect(()=>{
    const loadAreas = async()=>{
        const data = await getAreasByTerritory(formik.values.territory)
        console.log("areas from api", data)
        // endpoint returns the area list directly, not wrapped in an object
        setAreas(Array.isArray(data) ? data : [])
    }
    loadAreas()
   },[formik.values.territory])

    return (
        <Box
            sx={(theme) => ({
                width: "100%",
                border: "1px solid",
                borderColor: theme.palette.border.default,
                borderRadius: theme.card.radius,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.card.shadow,
                overflow: "hidden",
                "& .MuiTextField-root": { width: "100%" },
                "& .MuiOutlinedInput-root": {
                    minHeight: theme.field.minHeight,
                    borderRadius: theme.field.radius,
                    backgroundColor: theme.palette.background.paper,
                    transition: theme.field.transition,
                    "& fieldset": { borderColor: theme.palette.border.default },
                    "&:hover fieldset": { borderColor: theme.palette.border.strong },
                    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                },
                "& .MuiInputLabel-root": {
                    color: theme.palette.text.secondary,
                    fontSize: theme.field.label.fontSize,
                },
                "& .MuiInputBase-input": { fontSize: theme.field.input.fontSize },
            })}
        >
            <Box
                sx={(theme) => ({
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: theme.layout.section.fieldGap,
                    p: { xs: 2, sm: 3 },
                    [theme.breakpoints.down("md")]: {
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    },
                    [theme.breakpoints.down("sm")]: {
                        gridTemplateColumns: "minmax(0, 1fr)",
                        gap: 1.5,
                    },
                })}
            >
                <Box
                    sx={(theme) => ({
                        gridColumn: "1 / -1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        px: 1.25,
                        py: 0.75,
                        borderRadius: 1,
                        backgroundColor: theme.palette.surface.muted,
                    })}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        <Box
                            sx={(theme) => ({
                                width: 32,
                                height: 32,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: theme.field.radius,
                                backgroundColor: theme.palette.brand.terracottaSoft,
                                color: theme.palette.primary.main,
                                flexShrink: 0,
                            })}
                        >
                            <PersonRoundedIcon fontSize="small" />
                        </Box>
                        <Typography sx={{ color: "text.primary", fontSize: 15, fontWeight: 700 }}>
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

                {/** Doctor name**/}
                <TextField 
                label="Doctor Name *"
                name="doctorName"
                value={formik.values.doctorName}
                onChange={formik.handleChange}
                error={formik.touched.doctorName && Boolean(formik.errors.doctorName)}
                helperText={formik.touched.doctorName && formik.errors.doctorName}
                onBlur={formik.handleBlur}
                >

                </TextField>

                <TextField label="Qualification *"
                name="qualification"
                value={formik.values.qualification}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.qualification && Boolean(formik.errors.qualification)}
                helperText={formik.touched.qualification && formik.errors.qualification}
                
                >

                </TextField>

                {/** Specality**/}
                <TextField label="Speciality*"
                name="speciality"
                value={formik.values.speciality}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.speciality && Boolean(formik.errors.speciality)}
                helperText={formik.touched.speciality && formik.errors.speciality}
                >

                </TextField>

                {/** Hospital / Clinic**/}
                <TextField  label='Hospital Name/ Clinic Name *'
                name="hospitalName"
                value={formik.values.hospitalName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.hospitalName && Boolean(formik.errors.hospitalName)}
                helperText={formik.touched.hospitalName && formik.errors.hospitalName}
                >

                </TextField>
                    {/** contact information**/}
                <Box
                    sx={(theme) => ({
                        gridColumn: "1 / -1",
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: theme.layout.section.fieldGap,
                        [theme.breakpoints.down("sm")]: {
                            gridTemplateColumns: "minmax(0, 1fr)",
                            gap: 1.5,
                        },
                    })}
                >
                    <Box
                        sx={(theme) => ({
                            gridColumn: "1 / -1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.5,
                            px: 1.25,
                            py: 0.75,
                            borderRadius: 1,
                            backgroundColor: theme.palette.surface.muted,
                        })}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                            <Box
                                sx={(theme) => ({
                                    width: 32,
                                    height: 32,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: theme.field.radius,
                                    backgroundColor: theme.palette.brand.terracottaSoft,
                                    color: theme.palette.primary.main,
                                    flexShrink: 0,
                                })}
                            >
                                <CallRoundedIcon fontSize="small" />
                            </Box>
                            <Typography sx={{ color: "text.primary", fontSize: 15, fontWeight: 700 }}>
                                Contact Information
                            </Typography>
                        </Box>
                        <Typography sx={{ color: "text.secondary", fontSize: 11.5, textAlign: "right" }}>
                            Enter contact details
                        </Typography>
                    </Box>

                    <TextField label='Mobile Number'
                    name='mobileNumber'
                    value={formik.values.mobileNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.mobileNumber && Boolean(formik.errors.mobileNumber)}
                    helperText={formik.touched.mobileNumber && formik.errors.mobileNumber}
                    >

                    </TextField>

                    <TextField label='Email Id'
                    name='emailId'
                    value={formik.values.emailId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.emailId && Boolean(formik.errors.emailId)}
                    helperText={formik.touched.emailId && formik.errors.emailId}
                    >

                    </TextField>

                </Box>
                     {/** Location **/}
                <Box
                    sx={(theme) => ({
                        gridColumn: "1 / -1",
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr)) auto",
                        alignItems: "center",
                        gap: theme.layout.section.fieldGap,
                        [theme.breakpoints.down("md")]: {
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        },
                        [theme.breakpoints.down("sm")]: {
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        },
                        [theme.breakpoints.down("xs")]: {
                            gridTemplateColumns: "minmax(0, 1fr)",
                            gap: 1.5,
                        },
                    })}
                >
                   
                    <Box
                        sx={(theme) => ({
                            gridColumn: "1 / -1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.5,
                            px: 1.25,
                            py: 0.75,
                            borderRadius: 1,
                            backgroundColor: theme.palette.surface.muted,
                        })}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                            <Box
                                sx={(theme) => ({
                                    width: 32,
                                    height: 32,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: theme.field.radius,
                                    backgroundColor: theme.palette.brand.terracottaSoft,
                                    color: theme.palette.primary.main,
                                    flexShrink: 0,
                                })}
                            >
                                <LocationOnRoundedIcon fontSize="small" />
                            </Box>
                            <Typography sx={{ color: "text.primary", fontSize: 15, fontWeight: 700 }}>
                                Location
                            </Typography>
                        </Box>
                        <Typography sx={{ color: "text.secondary", fontSize: 11.5, textAlign: "right" }}>
                            Select the location details
                        </Typography>
                    </Box>
                        
                     <TextField label='country'
                     select 
                     name='country'
                     value = {formik.values.country}
                     onChange={formik.handleChange}
                     error={formik.touched.country && Boolean(formik.errors.country)}
                     helperText={formik.touched.country && formik.errors.country}
                     
                     >
                        {country.map((item)=>(
                            <MenuItem key={item.CountryId} value={item.CountryId}>
                                {item.CountryName}
                            </MenuItem>
                        ))}
                    </TextField>   

                    <TextField  
                       label='State *'
                       select
                       name='state'
                       value={formik.values.state}
                       onChange={formik.handleChange}
                       error={formik.touched.state && Boolean(formik.errors.state)}
                       helperText={formik.touched.state && formik.errors.state}
                    >   
                       {state.map((item)=>(
                        <MenuItem key={item.StateId} value={item.StateId}>
                            {item.StateName}
                        </MenuItem> 
                       ))}
                    </TextField>

                    <TextField
                       label='Territory'
                       select
                       name='territory'
                       value={formik.values.territory}
                       onChange={formik.handleChange}
                       error={formik.touched.territory && Boolean(formik.errors.territory)}
                       helperText={formik.touched.territory && formik.errors.territory}
                    >
                        {territories.map((item)=>(
                            <MenuItem key={item.TerritoryId} value={item.TerritoryId}>
                                {item.TerritoryName}
                            </MenuItem>
                        )) }
                    </TextField>

                    <TextField
                        label='Area *'
                        select
                        name='area'
                        value={formik.values.area}
                        onChange={formik.handleChange}
                        error={formik.touched.area && Boolean(formik.errors.area)}
                        helperText={formik.touched.area && formik.errors.area}
                    >
                        {areas.map((item)=>(
                            <MenuItem key={item.AreaId} value={item.AreaId}>
                                {item.AreaName}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button
                        sx={(theme) => ({
                            minHeight: theme.field.minHeight,
                            px: 1.75,
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            whiteSpace: "nowrap",
                            alignSelf: "stretch",
                            minWidth: { md: 128 },
                            [theme.breakpoints.down("sm")]: {
                                gridColumn: "1 / -1",
                            },
                        })}

                        onClick={()=>navigate('/admin/Areas/add')}
                    >
                        + Add Area
                    </Button>
                </Box>

                <Box
                    sx={(theme) => ({
                        gridColumn: "1 / -1",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1.5,
                        px: { xs: 2, sm: 3 },
                        py: theme.layout.actionBar.paddingY,
                        borderTop: "1px solid",
                        borderColor: theme.palette.border.subtle,
                        [theme.breakpoints.down("sm")]: {
                            "& .MuiButton-root": { flex: 1 },
                        },
                    })}
                >
                    <Button
                        sx={(theme) => ({
                            minWidth: 112,
                            borderColor: theme.palette.border.default,
                            color: theme.palette.text.secondary,
                            textTransform: "none",
                        })}
                    >
                        Cancel
                    </Button>
                    <Button variant="contained" sx={{ minWidth: 160, textTransform: "none" }}
                    onClick={()=>formik.handleSubmit()}
                    >
                        + Create Doctor
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}