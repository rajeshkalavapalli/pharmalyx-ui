import { useCallback, useEffect, useState } from "react";

import { Alert, Box, Button, ButtonBase, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AccountTreeRounded,
    BadgeRounded,
    CardGiftcardRounded,
    CheckCircleRounded,
    ChevronRightRounded,
    HubRounded,
    LocalHospitalRounded,
    LocalPharmacyRounded,
    LocationOnRounded,
    MapRounded,
    MedicalServicesRounded,
    MedicationRounded,
    PersonPinCircleRounded,
    RefreshRounded,
    StorefrontRounded,
    WarehouseRounded,
    WarningAmberRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/PageHeader/PageHeader";
import { getConfigurationSummary } from "./index";

const plural = (count, word, many = `${word}s`) => `${count} ${count === 1 ? word : many}`;

const truncate = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

// Grouped in setup order. `color` is a palette key shared by a whole group.
const SECTIONS = [
    {
        title: "Organisation",
        subtitle: "Your sales hierarchy. Divisions contain territories, territories contain areas.",
        color: "primary",
        items: [
            {
                label: "Divisions",
                description: "Business units and product lines",
                icon: AccountTreeRounded,
                path: "/admin/Divisions",
                count: (s) => plural(s.Divisions, "division"),
            },
            {
                label: "Territories",
                description: "Regions each division operates in",
                icon: MapRounded,
                path: "/admin/Territories",
                count: (s) => plural(s.Territories, "territory", "territories"),
            },
            {
                label: "Areas",
                description: "Working areas inside a territory",
                icon: LocationOnRounded,
                path: "/admin/Areas",
                count: (s) => plural(s.Areas, "area"),
            },
        ],
    },
    {
        title: "People",
        subtitle: "Accounts, designations and who reports to whom.",
        color: "secondary",
        items: [
            {
                label: "Users",
                description: "Field staff, managers and admins",
                icon: BadgeRounded,
                path: "/admin/Users",
                count: (s) => plural(s.Users, "user"),
            },
        ],
    },
    {
        title: "Customers",
        subtitle: "The doctors, chemists and distributors your team calls on.",
        color: "success",
        items: [
            {
                label: "Doctors",
                description: "Profiles, category and visit targets",
                icon: MedicalServicesRounded,
                path: "/admin/Doctors",
                count: (s) => plural(s.Doctors, "doctor"),
            },
            {
                label: "Pharmacies",
                description: "Chemists and pharmacy outlets",
                icon: LocalPharmacyRounded,
                path: "/admin/Pharmacies",
                count: (s) => plural(s.Pharmacies, "pharmacy", "pharmacies"),
            },
            {
                label: "Stockists & retailers",
                description: "Distributors and retail partners",
                icon: WarehouseRounded,
                path: "/admin/Stockist",
                count: (s) => plural(s.Stockists, "stockist"),
            },
        ],
    },
    {
        title: "Assignments",
        subtitle: "Who covers which areas and customers. Powers My Doctors, Visits and coverage.",
        color: "warning",
        items: [
            {
                label: "User areas",
                description: "Territories and areas per user",
                icon: PersonPinCircleRounded,
                path: "/admin/UserAreaMapping",
                count: (s) => `${s.UsersWithAreas} of ${s.Users} users`,
            },
            {
                label: "User doctors",
                description: "Doctors each representative calls on",
                icon: LocalHospitalRounded,
                path: "/admin/UserDoctorMapping",
                count: (s) => `${s.UsersWithDoctors} of ${s.Users} users`,
            },
            {
                label: "User pharmacies",
                description: "Pharmacies each representative covers",
                icon: StorefrontRounded,
                path: "/admin/UserPharmacyMapping",
                count: (s) => `${s.UsersWithPharmacies} of ${s.Users} users`,
            },
            {
                label: "User stockists",
                description: "Stockists each representative works with",
                icon: HubRounded,
                path: "/admin/UserStockistMapping",
                count: (s) => `${s.UsersWithStockists} of ${s.Users} users`,
            },
        ],
    },
    {
        title: "Catalogue",
        subtitle: "Our brands and the gifts used in doctor engagement, samples and RCPA.",
        color: "info",
        items: [
            {
                label: "Products",
                description: "Brands, packs and which are sampled",
                icon: MedicationRounded,
                path: "/admin/catalogue/products",
                count: (s) => (s.Products == null ? "Not set up" : plural(s.Products, "product")),
            },
            {
                label: "Gifts",
                description: "Gift items for doctors",
                icon: CardGiftcardRounded,
                path: "/admin/catalogue/gifts",
                count: (s) => (s.Gifts == null ? "Not set up" : plural(s.Gifts, "gift")),
            },
        ],
    },
];

// Gaps that break field workflows, with where to fix them.
const CHECKS = [
    {
        key: "UsersWithoutManager",
        title: "Users without a reporting manager",
        detail: "Can't send tour plans or DCRs for approval",
        action: "Open users",
        path: "/admin/Users",
    },
    {
        key: "UsersWithoutArea",
        title: "Users without an assigned area",
        detail: "Needed to plan tours and log visits",
        action: "Assign areas",
        path: "/admin/UserAreaMapping",
    },
    {
        key: "DoctorsUnassigned",
        title: "Doctors not assigned to anyone",
        detail: "No representative will visit them",
        action: "Assign doctors",
        path: "/admin/UserDoctorMapping",
    },
    {
        key: "DoctorsWithoutCategory",
        title: "Doctors without a category",
        detail: "Set Class A/B/C and a visit target",
        action: "Open doctors",
        path: "/admin/Doctors",
    },
];

// =========================================================
// PIECES
// =========================================================

const surfaceSx = (theme) => ({
    borderRadius: theme.panel.radius,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.card.shadow,
    overflow: "hidden",
});

function IconBox({ icon: Icon, color }) {
    return (
        <Box
            sx={(theme) => ({
                width: theme.configuration.iconSize,
                height: theme.configuration.iconSize,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: theme.calendar.cell.radius,
                color: theme.palette[color].main,
                backgroundColor: alpha(theme.palette[color].main, theme.tint.soft),
            })}
        >
            <Icon sx={(theme) => ({ fontSize: theme.configuration.iconFontSize })} />
        </Box>
    );
}

function MasterRow({ item, color, summary, loading, onOpen }) {
    return (
        <ButtonBase
            onClick={onOpen}
            sx={(theme) => ({
                width: "100%",
                minHeight: theme.configuration.rowMinHeight,
                px: theme.configuration.rowPaddingX,
                py: theme.configuration.rowPaddingY,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                textAlign: "left",
                transition: theme.sidebarLayout.itemTransition,

                "& + &": { borderTop: "1px solid", borderColor: theme.palette.border.subtle },

                "&:hover": { backgroundColor: theme.palette.surface.subtle },
                "&:hover .row-arrow": {
                    color: theme.palette.text.primary,
                    transform: "translateX(2px)",
                },

                "&:focus-visible": {
                    outline: "none",
                    backgroundColor: theme.palette.surface.subtle,
                    boxShadow: `inset 0 0 0 2px ${alpha(theme.palette.primary.main, theme.tint.strong)}`,
                },
            })}
        >
            <IconBox icon={item.icon} color={color} />

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={truncate}>
                    {item.label}
                </Typography>
                <Typography
                    variant="caption"
                    component="p"
                    sx={(theme) => ({ ...truncate, color: theme.palette.text.secondary })}
                >
                    {item.description}
                </Typography>
            </Box>

            <Box
                sx={(theme) => ({
                    minWidth: theme.configuration.countMinWidth,
                    textAlign: "right",
                    display: { xs: "none", sm: "block" },
                })}
            >
                {loading ? (
                    <Skeleton sx={{ ml: "auto" }} width="70%" />
                ) : (
                    summary && (
                        <Typography
                            variant="caption"
                            sx={(theme) => ({
                                color: theme.palette.text.secondary,
                                fontWeight: theme.typography.subtitle2.fontWeight,
                                fontVariantNumeric: "tabular-nums",
                            })}
                        >
                            {item.count(summary)}
                        </Typography>
                    )
                )}
            </Box>

            <ChevronRightRounded
                className="row-arrow"
                fontSize="small"
                sx={(theme) => ({
                    color: theme.palette.text.disabled,
                    transition: theme.calendar.transition,
                })}
            />
        </ButtonBase>
    );
}

function SetupChecks({ summary, onOpen }) {
    const issues = CHECKS.filter((check) => summary[check.key] > 0);

    if (issues.length === 0) {
        return (
            <Alert
                severity="success"
                variant="outlined"
                icon={<CheckCircleRounded />}
                sx={(theme) => ({ mb: theme.stat.gap })}
            >
                Setup is complete. Every user has a manager and an area, and every doctor is
                assigned and categorised.
            </Alert>
        );
    }

    return (
        <Paper elevation={0} sx={(theme) => ({ ...surfaceSx(theme), mb: theme.stat.gap })}>
            <Stack
                direction="row"
                spacing={1.25}
                sx={(theme) => ({
                    alignItems: "center",
                    px: theme.configuration.rowPaddingX,
                    py: 1.5,
                    backgroundColor: alpha(theme.palette.warning.main, theme.tint.hover),
                    borderBottom: "1px solid",
                    borderColor: theme.palette.border.subtle,
                })}
            >
                <WarningAmberRounded
                    fontSize="small"
                    sx={(theme) => ({ color: theme.palette.warning.main })}
                />
                <Typography variant="subtitle2">
                    {plural(issues.length, "setup item")} need attention
                </Typography>
            </Stack>

            {issues.map((check) => (
                <Stack
                    key={check.key}
                    direction="row"
                    sx={(theme) => ({
                        alignItems: "center",
                        gap: 1.5,
                        minHeight: theme.configuration.rowMinHeight,
                        px: theme.configuration.rowPaddingX,
                        py: 1,
                        "& + &": { borderTop: "1px solid", borderColor: theme.palette.border.subtle },
                    })}
                >
                    <Typography
                        variant="subtitle2"
                        sx={(theme) => ({
                            minWidth: theme.configuration.iconSize,
                            textAlign: "center",
                            color: theme.palette.warning.dark,
                            fontVariantNumeric: "tabular-nums",
                        })}
                    >
                        {summary[check.key]}
                    </Typography>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={truncate}>
                            {check.title}
                        </Typography>
                        <Typography
                            variant="caption"
                            component="p"
                            sx={(theme) => ({ ...truncate, color: theme.palette.text.secondary })}
                        >
                            {check.detail}
                        </Typography>
                    </Box>

                    <Button
                        size="small"
                        endIcon={<ChevronRightRounded />}
                        onClick={() => onOpen(check.path)}
                        sx={{ flexShrink: 0 }}
                    >
                        {check.action}
                    </Button>
                </Stack>
            ))}
        </Paper>
    );
}

// =========================================================
// PAGE
// =========================================================

function Configuration() {
    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        setFailed(false);

        getConfigurationSummary()
            .then((response) => setSummary(response?.summary || null))
            .catch(() => {
                setSummary(null);
                setFailed(true);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <Box>
            <PageHeader
                eyebrow="Administration"
                title="Configuration"
                subtitle="Master data behind tour plans, visits and reports. Set it up top to bottom."
                actions={
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RefreshRounded />}
                        onClick={load}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                }
            />

            {failed && (
                <Alert severity="warning" variant="outlined" sx={(theme) => ({ mb: theme.stat.gap })}>
                    Couldn't load record counts. The masters below still open normally.
                </Alert>
            )}

            {summary && <SetupChecks summary={summary} onOpen={navigate} />}

            <Paper elevation={0} sx={surfaceSx}>
                {SECTIONS.map((section, index) => (
                    <Box
                        key={section.title}
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "minmax(0, 1fr)",
                                md: `${theme.configuration.labelColumnWidth}px minmax(0, 1fr)`,
                            },
                            gap: { xs: 1.5, md: 4 },
                            px: theme.panel.padding,
                            py: theme.configuration.sectionPaddingY,
                            borderTop: index === 0 ? "none" : "1px solid",
                            borderColor: theme.palette.border.subtle,
                        })}
                    >
                        <Box>
                            <Typography
                                variant="overline"
                                component="p"
                                sx={(theme) => ({ color: theme.palette[section.color].main })}
                            >
                                Step {index + 1}
                            </Typography>
                            <Typography variant="subtitle1" component="h2">
                                {section.title}
                            </Typography>
                            <Typography
                                variant="caption"
                                component="p"
                                sx={(theme) => ({ mt: 0.5, color: theme.palette.text.secondary })}
                            >
                                {section.subtitle}
                            </Typography>
                        </Box>

                        <Box
                            sx={(theme) => ({
                                display: "flex",
                                flexDirection: "column",
                                border: "1px solid",
                                borderColor: theme.palette.border.default,
                                borderRadius: theme.calendar.cell.radius,
                                overflow: "hidden",
                            })}
                        >
                            {section.items.map((item) => (
                                <MasterRow
                                    key={item.path}
                                    item={item}
                                    color={section.color}
                                    summary={summary}
                                    loading={loading}
                                    onOpen={() => navigate(item.path)}
                                />
                            ))}
                        </Box>
                    </Box>
                ))}
            </Paper>
        </Box>
    );
}

export default Configuration;
