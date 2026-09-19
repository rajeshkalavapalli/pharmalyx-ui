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

import {
    getcountry,
    getstates,
    getTerritorie,
    previewAreaCode,

} from "../Areas/index";


function AddNewArea() {

    const [country, setCountry] = useState("");
    const [countries, setCountries] = useState([]);

    const [state, setState] = useState("");
    const [states, setSates] = useState([]);

    const [territory, setTerritory] = useState("");
    const [territories, setTerritories] = useState([]);

    const [areaName, setAreaName] = useState("");

    const [areaCode, setAreaCode] = useState("");

    const [isActive, setIsActive] = useState("YES");


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

        setAreaName(value);

        if (!territory || !value.trim()) {
            setAreaCode("");
            return;
        }

        try {
            const result = await previewAreaCode(
                territory,
                value.trim()
            );

            setAreaCode(result.areaCode || "");
        } catch (err) {
            console.log("error previewing area code", err);
            setAreaCode("");
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

        if (!country) {
            return;
        }

        const loadStates = async () => {

            const response = await getstates(country);

            setSates(response.states);
        };

        loadStates();

    }, [country]);


    // =====================================================
    // LOAD TERRITORIES
    // =====================================================

    useEffect(() => {

        if (!state) {
            return;
        }

        const loadTerritories = async () => {

            const response = await getTerritorie(state);

            setTerritories(response.territories);
        };

        loadTerritories();

    }, [state]);


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
                                value={country}
                                label="Country"
                                onChange={(event) =>
                                    setCountry(event.target.value)
                                }
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
                                value={state}
                                label="State"
                                onChange={(event) =>
                                    setState(event.target.value)
                                }
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
                                value={territory}
                                label="Territory"
                                onChange={(event) => {
                                    setTerritory(event.target.value);
                                    setAreaCode("");
                                }}
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
                            value={areaName}
                            onChange={handleAreaNameChange}
                            sx={fieldSx}
                        />


                        {/* AREA CODE */}

                        <TextField
                            fullWidth
                            size="small"
                            label="Area Code"
                            value={areaCode}
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
                                        setIsActive("YES")
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
                                            isActive === "YES"
                                                ? "success.main"
                                                : "text.secondary",

                                        backgroundColor:
                                            isActive === "YES"
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
                                                isActive === "YES"
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
                                        setIsActive("NO")
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
                                            isActive === "NO"
                                                ? "error.main"
                                                : "text.secondary",

                                        backgroundColor:
                                            isActive === "NO"
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
                                                isActive === "NO"
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