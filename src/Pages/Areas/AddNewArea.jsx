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

import { getcountry, getstates } from "../Areas/index";


function AddNewArea() {

    const [country, setCountry] = useState('');
    const [countries, setCountries] = useState([])
    const [state, setState] = useState("");
    const [territory, setTerritory] = useState("");


    // Common styling for all form fields
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


    useEffect(() => {

        const loadCountries = async () => {
            const response = await getcountry();
            
            setCountries(response.country)
        };

        loadCountries();

    }, []);


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
                boxShadow: "0 8px 30px rgba(32, 37, 34, 0.055)",
            }}
        >

            {/* Header */}

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


            {/* Form Content */}

            <Box
                sx={{
                    width: "100%",
                    maxWidth: 900,
                    mx: "auto",
                    px: { xs: 2, sm: 3, md: 4 },
                    py: 3.5,
                }}
            >

                {/* Location Information */}

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

                        {/* Country */}

                        <FormControl
                            fullWidth
                            size="small"
                            sx={fieldSx}
                        >

                            <InputLabel>Country</InputLabel>

                            <Select
                                value={country}
                                label="Country"
                                onChange={(event) =>
                                    setCountry(event.target.value)
                                }
                            >

                                <MenuItem value="">
                                    Select Country
                                </MenuItem>

                                {countries.map((item)=>(
                                    <MenuItem 
                                    key={item.CountryId}
                                    value={item.CountryId}
                                    >
                                        {item.CountryName}
                                    </MenuItem>
                                ))}

                            </Select>

                        </FormControl>


                        {/* State */}

                        <FormControl
                            fullWidth
                            size="small"
                            sx={fieldSx}
                        >

                            <InputLabel>State</InputLabel>

                            <Select
                                value={state}
                                label="State"
                                onChange={(event) =>
                                    setState(event.target.value)
                                }
                            >

                                <MenuItem value="">
                                    Select State
                                </MenuItem>

                            </Select>

                        </FormControl>


                        {/* Territory */}

                        <FormControl
                            fullWidth
                            size="small"
                            sx={fieldSx}
                        >

                            <InputLabel>Territory</InputLabel>

                            <Select
                                value={territory}
                                label="Territory"
                                onChange={(event) =>
                                    setTerritory(event.target.value)
                                }
                            >

                                <MenuItem value="">
                                    Select Territory
                                </MenuItem>

                            </Select>

                        </FormControl>

                    </Box>

                </Box>


                <Divider sx={{ my: 3 }} />


                {/* Area Information */}

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

                        <TextField
                            fullWidth
                            size="small"
                            label="Area Name"
                            sx={fieldSx}
                        />

                        <TextField
                            fullWidth
                            size="small"
                            label="Area Code"
                            sx={fieldSx}
                        />

                    </Box>

                </Box>

            </Box>


            {/* Action Bar */}

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
                >
                    Close
                </Button>

                <Button
                    variant="contained"
                >
                    Create Area
                </Button>

            </Box>

        </Paper>
    );
}


export default AddNewArea;