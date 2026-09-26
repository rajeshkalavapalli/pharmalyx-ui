import {
    Box,
    Typography,
    TextField,
    Button,
} from "@mui/material";

import {
    BarChartOutlined,
    GpsFixedOutlined,
    GroupsOutlined,
    ShieldOutlined,
} from "@mui/icons-material";

import {
    alpha,
    useTheme,
} from "@mui/material/styles";

import PharmalyxLogo from "../../assets/PharmalyxLogo.png";
import PharmalyxLoginillustrationLight from "../../assets/PharmalyxLoginillustrationLight.png";


function Login() {

    const theme = useTheme();


    // =====================================================
    // LOGIN FIELD STYLES
    // =====================================================

    const loginFieldSx = {

        "& .MuiOutlinedInput-root": {

            height: 52,

            backgroundColor:
                alpha(
                    theme.palette.background.paper,
                    0.82
                ),

            transition:
                "all 180ms ease",

            "& fieldset": {

                borderColor:
                    alpha(
                        theme.palette.divider,
                        0.85
                    ),

            },

            "&:hover fieldset": {

                borderColor:
                    alpha(
                        theme.palette.primary.main,
                        0.60
                    ),

            },

            "&.Mui-focused": {

                backgroundColor:
                    theme.palette.background.paper,

                boxShadow:
                    `0 0 0 3px ${alpha(
                        theme.palette.primary.main,
                        0.10
                    )}`,

            },

            "&.Mui-focused fieldset": {

                borderColor:
                    theme.palette.primary.main,

                borderWidth:
                    "1px",

            },

        },


        "& .MuiInputBase-input": {

            fontSize: 14,

            color:
                theme.palette.text.primary,

            "&::placeholder": {

                color:
                    theme.palette.text.disabled,

                opacity: 1,

            },

        },

    };


    // =====================================================
    // FEATURE ICON STYLE
    // =====================================================

    const featureIconSx = {

        width: 44,

        height: 44,

        display:
            "flex",

        alignItems:
            "center",

        justifyContent:
            "center",

        border:
            `1px solid ${alpha(
                theme.palette.sidebar.activeText,
                0.24
            )}`,

        borderRadius:
            "50%",

        color:
            theme.palette.sidebar.activeText,

        backgroundColor:
            alpha(
                theme.palette.sidebar.active,
                0.58
            ),

        backdropFilter:
            "blur(8px)",

        boxShadow:
            `0 6px 18px ${alpha(
                theme.palette.secondary.dark,
                0.16
            )}`,

        mb: 1,

    };


    // =====================================================
    // FEATURE LABEL STYLE
    // =====================================================

    const featureLabelSx = {

        fontSize: {

            md: 9,

            lg: 9.5,

        },

        lineHeight:
            1.25,

        fontWeight:
            600,

        color:
            theme.palette.sidebar.activeText,

        textShadow:
            `0 1px 5px ${alpha(
                theme.palette.secondary.dark,
                0.28
            )}`,

    };


    return (

        <Box
            sx={{

                width:
                    "100%",

                height:
                    "100vh",

                minHeight:
                    "100dvh",

                position:
                    "relative",

                overflow:
                    "hidden",

                boxSizing:
                    "border-box",

                backgroundImage: `
                    linear-gradient(
                        90deg,
                        ${alpha(
                            theme.palette.background.default,
                            0.06
                        )} 0%,
                        ${alpha(
                            theme.palette.background.default,
                            0.02
                        )} 45%,
                        ${alpha(
                            theme.palette.background.default,
                            0.42
                        )} 100%
                    ),
                    url(${PharmalyxLoginillustrationLight})
                `,

                backgroundSize:
                    "cover",

                backgroundPosition: {

                    xs:
                        "30% center",

                    md:
                        "center center",

                },

                backgroundRepeat:
                    "no-repeat",

            }}
        >


            {/* ================================================= */}
            {/* BACKGROUND OVERLAY */}
            {/* ================================================= */}

            <Box
                sx={{

                    position:
                        "absolute",

                    inset: 0,

                    background:
                        `linear-gradient(
                            90deg,
                            ${alpha(
                                theme.palette.background.default,
                                0.04
                            )} 0%,
                            ${alpha(
                                theme.palette.background.default,
                                0.02
                            )} 45%,
                            ${alpha(
                                theme.palette.background.default,
                                0.32
                            )} 100%
                        )`,

                    pointerEvents:
                        "none",

                }}
            />


            {/* ================================================= */}
            {/* BRAND LOGO */}
            {/* ================================================= */}

            <Box
                sx={{

                    position:
                        "absolute",

                    top: {

                        xs: 20,

                        sm: 28,

                        md: 32,

                    },

                    left: {

                        xs: 20,

                        sm: 32,

                        md: 40,

                    },

                    zIndex: 2,

                }}
            >

                <Box
                    component="img"

                    src={PharmalyxLogo}

                    alt="Pharmalyx"

                    sx={{

                        width: {

                            xs: 140,

                            sm: 170,

                            md: 190,

                        },

                        height:
                            "auto",

                    }}
                />

            </Box>


            {/* ================================================= */}
            {/* LEFT SIDE PROMOTIONAL CONTENT */}
            {/* ================================================= */}

            <Box
                sx={{

                    position:
                        "absolute",

                    zIndex: 2,

                    left: {

                        xs: 20,

                        sm: 32,

                        md: 64,

                        lg: 78,

                    },

                    top: {

                        md: "56%",

                        lg: "57%",

                    },

                    transform:
                        "translateY(-50%)",

                    width: {

                        md: 430,

                        lg: 470,

                    },

                    display: {

                        xs: "none",

                        md: "block",

                    },

                }}
            >


            </Box>            

            <Box
                sx={{

                    position:
                        "relative",

                    zIndex: 2,

                    width:
                        "100%",

                    height:
                        "100%",

                    boxSizing:
                        "border-box",

                    display:
                        "flex",

                    alignItems:
                        "center",

                    justifyContent: {

                        xs:
                            "center",

                        md:
                            "flex-end",

                    },

                    px: {

                        xs: 2,

                        sm: 4,

                        md: 7,

                        lg: 10,

                    },

                    py: {

                        xs: 3,

                        md: 3,

                    },

                }}
            >


                {/* ================================================= */}
                {/* LOGIN CARD */}
                {/* ================================================= */}

                <Box
                    sx={{

                        width:
                            "100%",

                        maxWidth:
                            400,

                        position:
                            "relative",

                        backgroundColor:
                            alpha(
                                theme.palette.background.paper,
                                0.94
                            ),

                        borderRadius:
                            3,

                        border:
                            `1px solid ${alpha(
                                theme.palette.background.paper,
                                0.90
                            )}`,

                        boxShadow:
                            `0 28px 80px ${alpha(
                                theme.palette.secondary.dark,
                                0.16
                            )}`,

                        backdropFilter:
                            "blur(20px)",

                        boxSizing:
                            "border-box",

                        px: {

                            xs: 3,

                            sm: 4,

                        },

                        py: {

                            xs: 3.25,

                            sm: 3.5,

                        },

                        overflow:
                            "hidden",

                        "&::before": {

                            content:
                                '""',

                            position:
                                "absolute",

                            top: 0,

                            left: 0,

                            right: 0,

                            height: 3,

                            background:
                                `linear-gradient(
                                    90deg,
                                    ${theme.palette.secondary.main} 0%,
                                    ${theme.palette.primary.main} 55%,
                                    ${theme.palette.primary.light} 100%
                                )`,

                        },

                    }}
                >


                    {/* ================================================= */}
                    {/* LOGO */}
                    {/* ================================================= */}

                    <Box
                        sx={{

                            display:
                                "flex",

                            justifyContent:
                                "center",

                            mb: 2.25,

                        }}
                    >

                        <Box
                            component="img"

                            src={PharmalyxLogo}

                            alt="Pharmalyx"

                            sx={{

                                width: {

                                    xs: 140,

                                    sm: 155,

                                },

                                height:
                                    "auto",

                            }}
                        />

                    </Box>


                    {/* ================================================= */}
                    {/* WELCOME */}
                    {/* ================================================= */}

                    <Typography
                        sx={{

                            textAlign:
                                "center",

                            color:
                                theme.palette.text.primary,

                            fontWeight:
                                700,

                            fontSize: {

                                xs: "24px",

                                sm: "26px",

                            },

                            letterSpacing:
                                "-0.025em",

                            lineHeight:
                                1.2,

                            mb: 0.75,

                        }}
                    >

                        Welcome back

                    </Typography>


                    <Typography
                        sx={{

                            textAlign:
                                "center",

                            color:
                                theme.palette.text.secondary,

                            fontSize:
                                13.5,

                            lineHeight:
                                1.5,

                            mb: 3,

                        }}
                    >

                        Sign in to your Pharmalyx account

                    </Typography>


                    {/* ================================================= */}
                    {/* EMAIL / MOBILE */}
                    {/* ================================================= */}

                    <TextField
                        fullWidth

                        placeholder="Email or Mobile Number"

                        variant="outlined"

                        sx={{

                            ...loginFieldSx,

                            mb: 1.5,

                        }}

                        inputProps={{

                            "aria-label":
                                "Email or Mobile Number",

                        }}
                    />


                    {/* ================================================= */}
                    {/* PASSWORD */}
                    {/* ================================================= */}

                    <TextField
                        fullWidth

                        placeholder="Password"

                        type="password"

                        variant="outlined"

                        sx={{

                            ...loginFieldSx,

                            mb: 1,

                        }}

                        inputProps={{

                            "aria-label":
                                "Password",

                        }}
                    />


                    {/* ================================================= */}
                    {/* FORGOT PASSWORD */}
                    {/* ================================================= */}

                    <Box
                        sx={{

                            display:
                                "flex",

                            justifyContent:
                                "flex-end",

                            mb: 2.25,

                        }}
                    >

                        <Typography
                            sx={{

                                fontSize:
                                    "13px",

                                fontWeight:
                                    600,

                                color:
                                    theme.palette.primary.main,

                                cursor:
                                    "pointer",

                                transition:
                                    "all 160ms ease",

                                "&:hover": {

                                    color:
                                        theme.palette.primary.dark,

                                    textDecoration:
                                        "underline",

                                },

                            }}
                        >

                            Forgot Password?

                        </Typography>

                    </Box>


                    {/* ================================================= */}
                    {/* SIGN IN */}
                    {/* ================================================= */}

                    <Button
                        fullWidth

                        variant="contained"

                        size="large"

                        sx={{

                            height:
                                50,

                            borderRadius:
                                1.75,

                            fontSize:
                                "14px",

                            fontWeight:
                                650,

                            textTransform:
                                "none",

                            backgroundColor:
                                theme.palette.primary.main,

                            color:
                                theme.palette.primary.contrastText,

                            boxShadow:
                                `0 10px 24px ${alpha(
                                    theme.palette.primary.main,
                                    0.22
                                )}`,

                            transition:
                                "all 180ms ease",

                            "&:hover": {

                                backgroundColor:
                                    theme.palette.primary.dark,

                                boxShadow:
                                    `0 12px 28px ${alpha(
                                        theme.palette.primary.main,
                                        0.28
                                    )}`,

                                transform:
                                    "translateY(-1px)",

                            },

                        }}
                    >

                        Sign In

                    </Button>


                    {/* ================================================= */}
                    {/* SECURITY */}
                    {/* ================================================= */}

                    <Typography
                        sx={{

                            display:
                                "block",

                            textAlign:
                                "center",

                            mt: 2,

                            fontSize:
                                11.5,

                            color:
                                theme.palette.text.secondary,

                            letterSpacing:
                                "0.01em",

                        }}
                    >

                        Secure access to Pharmalyx

                    </Typography>

                </Box>

            </Box>

        </Box>

    );

}


export default Login;