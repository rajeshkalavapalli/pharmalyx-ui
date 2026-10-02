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
    AssignmentIndRounded,
    CloseRounded,
    MedicalServicesRounded,
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
            color: "success",
            path: "/admin/Areas",
        },
        {
            label: "Territory",
            description: "Territories and locations",
            icon: LocationOnRounded,
            color: "warning",
            path: "/admin/Territories",
        },
        {
            label: "Users",
            description: "User accounts",
            icon: PeopleAltRounded,
            color: "success",
            path: "/admin/Users",
        },
        {
            label: "User Area Mapping",
            description: "Map users to territories and areas",
            icon: AssignmentIndRounded,
            color: "warning",
            path: "/admin/UserAreaMapping",
        },
        {
            label: "Doctor",
            description: "Manage doctor information",
            icon: MedicalServicesRounded,
            color: "error",
            path: "/admin/Doctors",
        },
        {
            label: "User Doctor Mapping",
            description: "Manage user doctor mapping",
            icon: MedicalServicesRounded,
            color: "success",
            path: "/admin/UserDoctorMapping",
        },
        {
            label: "Add Pharmacy",
            description: "Manage pharmacy information",
            icon: MedicalServicesRounded,
            color: "error",
            path: "/admin/Pharmacies",
        },
        {
            label: "User Pharmacy Mapping",
            description: "Map users to pharmacies",
            icon: AssignmentIndRounded,
            color: "primary",
            path: "/admin/UserPharmacyMapping",
        },
        {
            label: "Add Stockist/Retailer",
            description: "Manage stockist information",
            icon: AssignmentIndRounded,
            color: "warning",
            path: "/admin/Stockist",
        },
        {
            label: "User Stockist Mapping",
            description: "Map users to stockists",
            icon: AssignmentIndRounded,
            color: "success",
            path: "/admin/UserStockistMapping",
        },
    ];

    return (
        <Paper
            elevation={0}
            sx={(theme) => ({
                width: "100%",
                minHeight: theme.configuration.workspace.minHeight,
                borderRadius: theme.card.radius,
                border: `${theme.card.borderWidth}px solid`,
                borderColor: theme.palette.divider,
                backgroundColor: theme.palette.background.paper,
                overflow: "hidden",
                boxShadow: theme.card.shadow,
            })}
        >
            {/* HEADER */}

            <Box
                sx={(theme) => ({
                    px: theme.configuration.header.paddingX,
                    py: theme.configuration.header.paddingY,

                    display: "flex",
                    alignItems: "center",
                    gap: theme.configuration.header.gap,
                })}
            >
                <Box
                    sx={(theme) => ({
                        width: theme.configuration.header.indicatorWidth,
                        height: theme.configuration.header.indicatorHeight,
                        borderRadius: theme.shape.borderRadius,
                        backgroundColor: theme.palette.primary.main,
                        flexShrink: 0,
                    })}
                />

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
                        Manage the core master data that drives Pharmalyx
                        operations.
                    </Typography>
                </Box>

                <Tooltip title="Close">
                    <IconButton
                        onClick={() => navigate(-1)}
                        aria-label="Close configuration"
                        size="small"
                        sx={(theme) => ({
                            width: theme.configuration.closeButton.size,
                            height: theme.configuration.closeButton.size,
                            border: "1px solid",
                            borderColor: theme.palette.divider,
                            borderRadius:
                                theme.configuration.closeButton.radius,
                            color: theme.palette.text.secondary,

                            "&:hover": {
                                color: theme.palette.primary.main,

                                backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.07
                                ),

                                borderColor: theme.palette.primary.main,
                            },
                        })}
                    >
                        <CloseRounded
                            sx={(theme) => ({
                                fontSize:
                                    theme.configuration.closeButton.iconSize,
                            })}
                        />
                    </IconButton>
                </Tooltip>
            </Box>

            <Divider />

            {/* MASTERS */}

            <Box
                sx={(theme) => ({
                    px: theme.configuration.content.paddingX,
                    py: theme.configuration.content.paddingY,
                })}
            >
                <Typography
                    sx={(theme) => ({
                        fontSize:
                            theme.configuration.section.titleFontSize,
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb:
                            theme.configuration.section.titleMarginBottom,
                    })}
                >
                    Masters
                </Typography>

                <Typography
                    sx={(theme) => ({
                        fontSize:
                            theme.configuration.section.descriptionFontSize,
                        color: theme.palette.text.secondary,
                        mb:
                            theme.configuration.section
                                .descriptionMarginBottom,
                    })}
                >
                    Configure organizational, geographic, and user master
                    data.
                </Typography>

                {/* MASTER BUTTONS */}

                <Box
                    sx={(theme) => ({
                        display: "grid",

                        gridTemplateColumns:
                            theme.configuration.grid.columns,

                        gap: theme.configuration.grid.gap,
                    })}
                >
                    {masters.map((master) => {
                        const Icon = master.icon;

                        return (
                            <ButtonBase
                                key={master.label}
                                onClick={() => navigate(master.path)}
                                sx={(theme) => ({
                                    width: "100%",
                                    minWidth: 0,

                                    minHeight:
                                        theme.configuration.item.minHeight,

                                    px:
                                        theme.configuration.item.paddingX,

                                    borderRadius:
                                        theme.configuration.item.radius,

                                    border: "1px solid",
                                    borderColor:
                                        theme.palette.divider,

                                    backgroundColor:
                                        theme.palette.background.paper,

                                    justifyContent: "flex-start",
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
                                        width:
                                            theme.configuration.item.icon
                                                .containerSize,

                                        height:
                                            theme.configuration.item.icon
                                                .containerSize,

                                        mr:
                                            theme.configuration.item.icon
                                                .marginRight,

                                        borderRadius:
                                            theme.configuration.item.icon
                                                .radius,

                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",

                                        flexShrink: 0,

                                        backgroundColor: alpha(
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
                                        sx={(theme) => ({
                                            fontSize:
                                                theme.configuration.item
                                                    .icon.fontSize,
                                        })}
                                    />
                                </Box>

                                {/* TEXT */}

                                <Box
                                    sx={{
                                        minWidth: 0,
                                    }}
                                >
                                    <Typography
                                        sx={(theme) => ({
                                            fontSize:
                                                theme.configuration.item
                                                    .title.fontSize,

                                            fontWeight:
                                                theme.configuration.item
                                                    .title.fontWeight,

                                            color:
                                                theme.palette.text.primary,

                                            lineHeight:
                                                theme.configuration.item
                                                    .title.lineHeight,

                                            overflowWrap: "anywhere",
                                        })}
                                    >
                                        {master.label}
                                    </Typography>

                                    <Typography
                                        sx={(theme) => ({
                                            mt:
                                                theme.configuration.item
                                                    .description.marginTop,

                                            fontSize:
                                                theme.configuration.item
                                                    .description.fontSize,

                                            color:
                                                theme.palette.text.secondary,

                                            lineHeight:
                                                theme.configuration.item
                                                    .description.lineHeight,

                                            overflowWrap: "anywhere",
                                        })}
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