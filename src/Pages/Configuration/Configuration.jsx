import {
    Box,
    Divider,
    Paper,
    Typography,
    ButtonBase,
    IconButton,
    Tooltip,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import {
    AccountTreeRounded,
    MapRounded,
    LocationOnRounded,
    PeopleAltRounded,
    CloseRounded,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";


function Configuration() {

    const navigate = useNavigate();


    const masters = [
        {
            label: "Division",
            description: "Business divisions",
            icon: AccountTreeRounded,
            color: "primary",
            path: "/admin/Divisions",
        },
        {
            label: "Area",
            description: "Working areas",
            icon: MapRounded,
            color: "warning",
            path: "/admin/Areas",
        },
        {
            label: "Territory",
            description: "Territories and locations",
            icon: LocationOnRounded,
            color: "info",
            path: "/admin/Territories",
        },
        {
            label: "Users",
            description: "User accounts",
            icon: PeopleAltRounded,
            color: "success",
            path: "/admin/Users",
        },
    ];


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

                boxShadow: (theme) =>
                    `0 8px 30px ${alpha(
                        theme.palette.common.black,
                        0.055
                    )}`,
            }}
        >

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <Box
                sx={{
                    px: { xs: 2, sm: 3, md: 4 },
                    py: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                }}
            >

                {/* HEADER ACCENT */}

                <Box
                    sx={{
                        width: 4,
                        height: 42,
                        borderRadius: 2,
                        backgroundColor: "primary.main",
                        flexShrink: 0,
                    }}
                />


                {/* HEADER TEXT */}

                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                    }}
                >

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            lineHeight: 1.3,
                            letterSpacing: "-0.01em",
                        }}
                    >
                        Configuration
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            mt: 0.5,
                            color: "text.secondary",
                            fontSize: 13,
                        }}
                    >
                        Manage the core master data that drives Pharmalyx operations.
                    </Typography>

                </Box>


                {/* CLOSE */}

                <Tooltip title="Close">

                    <IconButton
                        onClick={() => navigate(-1)}
                        aria-label="Close configuration"
                        size="small"
                        sx={{
                            width: 36,
                            height: 36,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1.5,
                            color: "text.secondary",

                            "&:hover": {
                                color: "primary.main",

                                backgroundColor: (theme) =>
                                    alpha(
                                        theme.palette.primary.main,
                                        0.07
                                    ),

                                borderColor: "primary.main",
                            },
                        }}
                    >

                        <CloseRounded
                            sx={{
                                fontSize: 19,
                            }}
                        />

                    </IconButton>

                </Tooltip>

            </Box>


            <Divider />


            {/* ================================================= */}
            {/* MASTERS */}
            {/* ================================================= */}

            <Box
                sx={{
                    px: { xs: 2, sm: 3, md: 4 },
                    py: 3,
                }}
            >

                <Typography
                    sx={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 0.5,
                    }}
                >
                    Masters
                </Typography>


                <Typography
                    sx={{
                        fontSize: 12,
                        color: "text.secondary",
                        mb: 2.5,
                    }}
                >
                    Configure organizational, geographic, and user master data.
                </Typography>


                {/* ================================================= */}
                {/* MASTER BUTTONS */}
                {/* ================================================= */}

                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                    }}
                >

                    {masters.map((master) => {

                        const Icon = master.icon;

                        return (
                            <ButtonBase
                                key={master.label}
                                onClick={() =>
                                    navigate(master.path)
                                }

                                sx={(theme) => ({
                                    minWidth: {
                                        xs: "100%",
                                        sm: 165,
                                    },

                                    minHeight: 52,

                                    px: 1.5,

                                    borderRadius: 1.75,

                                    border: "1px solid",

                                    borderColor: "divider",

                                    backgroundColor:
                                        "background.paper",

                                    justifyContent:
                                        "flex-start",

                                    textAlign: "left",

                                    transition:
                                        "border-color 160ms ease, background-color 160ms ease, transform 160ms ease",


                                    "&:hover": {

                                        borderColor: alpha(
                                            theme.palette[
                                                master.color
                                            ].main,
                                            0.45
                                        ),

                                        backgroundColor: alpha(
                                            theme.palette[
                                                master.color
                                            ].main,
                                            0.035
                                        ),

                                        transform:
                                            "translateY(-1px)",
                                    },


                                    "&:focus-visible": {

                                        outline: `2px solid ${theme.palette[master.color].main}`,

                                        outlineOffset: 2,
                                    },
                                })}
                            >

                                {/* ICON */}

                                <Box
                                    sx={(theme) => ({
                                        width: 32,
                                        height: 32,
                                        mr: 1.25,

                                        borderRadius: 1.25,

                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",

                                        flexShrink: 0,

                                        backgroundColor:
                                            alpha(
                                                theme.palette[
                                                    master.color
                                                ].main,
                                                0.09
                                            ),

                                        color:
                                            theme.palette[
                                                master.color
                                            ].main,
                                    })}
                                >

                                    <Icon
                                        sx={{
                                            fontSize: 19,
                                        }}
                                    />

                                </Box>


                                {/* TEXT */}

                                <Box>

                                    <Typography
                                        sx={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "text.primary",
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {master.label}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 0.25,
                                            fontSize: 10.5,
                                            color: "text.secondary",
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {master.description}
                                    </Typography>

                                </Box>

                            </ButtonBase>
                        );
                    })}

                </Box>

            </Box>

        </Paper>
    );
}


export default Configuration;