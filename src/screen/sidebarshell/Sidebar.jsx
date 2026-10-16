import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
    Box,
    ButtonBase,
    Collapse,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DirectionsWalkRoundedIcon from "@mui/icons-material/DirectionsWalkRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import KeyboardDoubleArrowLeftRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";

import Tag from "../../components/Tag/Tag";
import navigation from "../naviagation/Navigation";
import BrandMark from "../../components/BrandMark/BrandMark";

// Icons for top-level entries; child items are text-only under a guide line.
const SECTION_ICONS = {
    Dashboard: DashboardRoundedIcon,
    "Field Operations": DirectionsWalkRoundedIcon,
    "Doctor Engagement": LocalHospitalRoundedIcon,
    "Products & Promotion": MedicationRoundedIcon,
    "Sales & Distribution": ShoppingCartRoundedIcon,
    Planning: EventNoteRoundedIcon,
    Expenses: AccountBalanceWalletRoundedIcon,
    "HR / Employee": BadgeRoundedIcon,
    Resources: FolderRoundedIcon,
    Communication: ChatRoundedIcon,
    "Reports & Analytics": AssessmentRoundedIcon,
    Insights: InsightsRoundedIcon,
    Administration: AdminPanelSettingsRoundedIcon,
};

const STORAGE_KEY = "pharmalyx.sidebarCollapsed";

// =========================================================
// ACTIVE STATE
// =========================================================

const normalize = (path) => String(path || "").toLowerCase().replace(/\/+$/, "");

const matchesPath = (pathname, path) => {
    const current = normalize(pathname);
    const target = normalize(path);

    return Boolean(target) && (current === target || current.startsWith(`${target}/`));
};

const isItemActive = (item, pathname) =>
    matchesPath(pathname, item.path) || (item.match || []).some((path) => matchesPath(pathname, path));

const isSectionActive = (section, pathname) =>
    section.children
        ? section.children.some((child) => isItemActive(child, pathname))
        : isItemActive(section, pathname);

const readCollapsed = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
        return false;
    }
};

const writeCollapsed = (value) => {
    try {
        localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
        // Preference just won't persist.
    }
};

// =========================================================
// SHARED STYLES
// =========================================================

const railButtonSx = (theme) => ({
    color: theme.palette.sidebar.mutedText,
    "&:hover": {
        color: theme.palette.sidebar.hoverText,
        backgroundColor: theme.palette.sidebar.hover,
    },
});

function SoonBadge() {
    return (
        <Box
            component="span"
            sx={(theme) => ({
                ...theme.typography.micro,
                px: 0.75,
                py: 0.125,
                flexShrink: 0,
                borderRadius: theme.statusChip.radius,
                color: theme.palette.sidebar.badgeText,
                backgroundColor: theme.palette.sidebar.badgeBackground,
            })}
        >
            Soon
        </Box>
    );
}

const rowSx = (theme, { active, height, emphasis }) => ({
    width: "100%",
    minHeight: height,
    px: 1.25,
    gap: 1.25,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    textAlign: "left",
    position: "relative",
    borderRadius: theme.sidebarLayout.radius,
    color: active ? theme.palette.sidebar.activeText : theme.palette.sidebar.text,
    backgroundColor: active && emphasis ? theme.palette.sidebar.activeLight : "transparent",
    transition: theme.sidebarLayout.itemTransition,

    "&:hover": {
        backgroundColor: active && emphasis ? theme.palette.sidebar.activeLight : theme.palette.sidebar.hover,
        color: theme.palette.sidebar.hoverText,
    },

    "&:focus-visible": {
        outline: "none",
        boxShadow: `0 0 0 2px ${alpha(theme.palette.sidebar.active, theme.tint.strong * 2)}`,
    },
});

const labelSx = (theme, active) => ({
    ...theme.typography.body2,
    flex: 1,
    minWidth: 0,
    fontWeight: active ? theme.typography.subtitle2.fontWeight : theme.typography.body2.fontWeight,
    color: "inherit",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
});

// =========================================================
// EXPANDED: TOP-LEVEL LINK (e.g. Dashboard)
// =========================================================

function LeafItem({ item, active }) {
    const Icon = SECTION_ICONS[item.label] || DashboardRoundedIcon;

    return (
        <ButtonBase
            component={NavLink}
            to={item.path}
            aria-current={active ? "page" : undefined}
            sx={(theme) => ({
                ...rowSx(theme, { active, height: theme.sidebarLayout.itemHeight, emphasis: true }),

                "&::before": active
                    ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: "20%",
                          bottom: "20%",
                          width: theme.sidebarLayout.indicatorWidth,
                          borderRadius: theme.sidebarLayout.indicatorWidth,
                          backgroundColor: theme.palette.sidebar.active,
                      }
                    : undefined,
            })}
        >
            <Icon
                sx={(theme) => ({
                    fontSize: theme.sidebarLayout.iconSize,
                    color: active ? theme.palette.sidebar.active : theme.palette.sidebar.mutedText,
                })}
            />
            <Typography component="span" sx={(theme) => labelSx(theme, active)}>
                {item.label}
            </Typography>
        </ButtonBase>
    );
}

// =========================================================
// EXPANDED: SECTION WITH CHILDREN
// =========================================================

function SectionItem({ section, active, open, onToggle, pathname }) {
    const Icon = SECTION_ICONS[section.label] || DashboardRoundedIcon;
    const id = `sidebar-section-${section.label.replace(/\W+/g, "-").toLowerCase()}`;

    return (
        <Box>
            <ButtonBase
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={id}
                sx={(theme) => rowSx(theme, { active, height: theme.sidebarLayout.itemHeight })}
            >
                <Icon
                    sx={(theme) => ({
                        fontSize: theme.sidebarLayout.iconSize,
                        color: active ? theme.palette.sidebar.active : theme.palette.sidebar.mutedText,
                    })}
                />
                <Typography component="span" sx={(theme) => labelSx(theme, active)}>
                    {section.label}
                </Typography>
                <ExpandMoreRoundedIcon
                    sx={(theme) => ({
                        fontSize: theme.sidebarLayout.iconSize,
                        color: theme.palette.sidebar.mutedText,
                        transform: open ? "rotate(180deg)" : "none",
                        transition: theme.sidebarLayout.chevronTransition,
                    })}
                />
            </ButtonBase>

            <Collapse in={open} timeout="auto" unmountOnExit>
                <Box
                    id={id}
                    role="group"
                    sx={(theme) => ({
                        position: "relative",
                        pl: theme.sidebarLayout.childIndent,
                        py: 0.5,

                        // Tree guide line under the section icon.
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            left: theme.spacing(theme.sidebarLayout.guideOffset),
                            top: theme.spacing(0.5),
                            bottom: theme.spacing(0.5),
                            width: "1px",
                            backgroundColor: theme.palette.sidebar.guide,
                        },
                    })}
                >
                    {section.children.map((child) => (
                        <ChildItem key={child.path} item={child} active={isItemActive(child, pathname)} />
                    ))}
                </Box>
            </Collapse>
        </Box>
    );
}

function ChildItem({ item, active }) {
    return (
        <ButtonBase
            component={NavLink}
            to={item.path}
            aria-current={active ? "page" : undefined}
            sx={(theme) => ({
                ...rowSx(theme, { active, height: theme.sidebarLayout.childItemHeight, emphasis: true }),
                pl: 2,
                color: active
                    ? theme.palette.sidebar.activeText
                    : item.ready
                      ? theme.palette.sidebar.text
                      : theme.palette.sidebar.mutedText,

                // Highlights the guide line next to the active page.
                "&::before": active
                    ? {
                          content: '""',
                          position: "absolute",
                          left: `calc(${theme.spacing(theme.sidebarLayout.guideOffset - theme.sidebarLayout.childIndent)} - 1px)`,
                          top: "22%",
                          bottom: "22%",
                          width: theme.sidebarLayout.indicatorWidth,
                          borderRadius: theme.sidebarLayout.indicatorWidth,
                          backgroundColor: theme.palette.sidebar.active,
                      }
                    : undefined,
            })}
        >
            <Typography component="span" sx={(theme) => labelSx(theme, active)}>
                {item.label}
            </Typography>
            {!item.ready && <SoonBadge />}
        </ButtonBase>
    );
}

// =========================================================
// COLLAPSED RAIL
// =========================================================

function RailItem({ section, active, onOpenFlyout }) {
    const Icon = SECTION_ICONS[section.label] || DashboardRoundedIcon;
    const isLeaf = !section.children;

    return (
        <Tooltip title={section.label} placement="right" arrow>
            <ButtonBase
                {...(isLeaf
                    ? { component: NavLink, to: section.path }
                    : { onClick: (event) => onOpenFlyout(event.currentTarget, section) })}
                aria-label={section.label}
                aria-haspopup={isLeaf ? undefined : "menu"}
                aria-current={isLeaf && active ? "page" : undefined}
                sx={(theme) => ({
                    width: theme.sidebarLayout.railItemSize,
                    height: theme.sidebarLayout.railItemSize,
                    mx: "auto",
                    display: "grid",
                    placeItems: "center",
                    borderRadius: theme.sidebarLayout.radius,
                    color: active ? theme.palette.sidebar.activeText : theme.palette.sidebar.mutedText,
                    backgroundColor: "transparent",
                    backgroundImage: active ? theme.palette.brand.gradient : "none",
                    boxShadow: active ? theme.palette.sidebar.activeGlow : "none",
                    transition: theme.sidebarLayout.itemTransition,

                    "&:hover": {
                        color: theme.palette.sidebar.hoverText,
                        backgroundColor: active ? "transparent" : theme.palette.sidebar.hover,
                    },

                    "&:focus-visible": {
                        outline: "none",
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.sidebar.active, theme.tint.strong * 2)}`,
                    },
                })}
            >
                <Icon sx={(theme) => ({ fontSize: theme.sidebarLayout.iconSize })} />
            </ButtonBase>
        </Tooltip>
    );
}

function Flyout({ anchor, section, pathname, onClose }) {
    return (
        <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={onClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            slotProps={{
                paper: { sx: (theme) => ({ minWidth: theme.sidebarLayout.flyoutMinWidth, ml: 1 }) },
            }}
        >
            {section && (
                <Typography
                    variant="overline"
                    component="p"
                    sx={(theme) => ({ px: 2, pt: 1, pb: 0.5, color: theme.palette.text.secondary })}
                >
                    {section.label}
                </Typography>
            )}

            {section?.children.map((child) => {
                const active = isItemActive(child, pathname);

                return (
                    <MenuItem
                        key={child.path}
                        component={NavLink}
                        to={child.path}
                        selected={active}
                        onClick={onClose}
                        sx={(theme) => ({
                            gap: 1.5,
                            justifyContent: "space-between",
                            color: child.ready ? theme.palette.text.primary : theme.palette.text.secondary,
                            fontWeight: active ? theme.typography.subtitle2.fontWeight : undefined,
                        })}
                    >
                        {child.label}
                        {!child.ready && <Tag label="Soon" color="secondary" />}
                    </MenuItem>
                );
            })}
        </Menu>
    );
}

// =========================================================
// SIDEBAR
// =========================================================

// `mobile`: rendered inside the phone drawer, always expanded, with a close button.
function Sidebar({ mobile = false, onClose }) {
    const theme = useTheme();
    const { pathname } = useLocation();

    // Tablets get the icon rail; phones use the drawer instead.
    const compactScreen = useMediaQuery(theme.breakpoints.down("md")) && !mobile;
    const [pinnedCollapsed, setPinnedCollapsed] = useState(readCollapsed);
    const collapsed = !mobile && (compactScreen || pinnedCollapsed);

    const activeSection = navigation.find((section) => isSectionActive(section, pathname))?.label;

    // One section open at a time; follows the current page.
    const [openSection, setOpenSection] = useState(activeSection || null);

    useEffect(() => {
        if (activeSection) setOpenSection(activeSection);
    }, [activeSection]);

    const [flyout, setFlyout] = useState({ anchor: null, section: null });

    const toggleCollapsed = () => {
        setPinnedCollapsed((previous) => {
            writeCollapsed(!previous);
            return !previous;
        });
    };

    return (
        <Box
            component="nav"
            aria-label="Main navigation"
            sx={(theme) => ({
                width: collapsed ? theme.sidebarLayout.collapsedWidth : theme.sidebarLayout.width,
                height: mobile ? "100%" : "100vh",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                backgroundColor: theme.palette.sidebar.background,
                backgroundImage: theme.palette.sidebar.backgroundImage,
                borderRight: mobile ? "none" : "1px solid",
                borderColor: theme.palette.sidebar.border,
                transition: theme.sidebarLayout.transition,
            })}
        >
            {/* BRAND + COLLAPSE */}

            <Box
                sx={(theme) => ({
                    height: theme.sidebarLayout.headerHeight,
                    flexShrink: 0,
                    px: collapsed ? 0 : theme.sidebarLayout.paddingX,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "space-between",
                    gap: 1,
                })}
            >
                {collapsed ? (
                    <Tooltip title={compactScreen ? "Pharmalyx" : "Expand menu"} placement="right" arrow>
                        <ButtonBase
                            onClick={compactScreen ? undefined : toggleCollapsed}
                            aria-label={compactScreen ? "Pharmalyx" : "Expand menu"}
                            sx={(theme) => ({ borderRadius: theme.sidebarLayout.radius })}
                        >
                            <BrandMark size={theme.sidebarLayout.markSize} />
                        </ButtonBase>
                    </Tooltip>
                ) : (
                    <>
                        <BrandMark
                            size={theme.sidebarLayout.markSize}
                            showWordmark
                            tagline="Field intelligence"
                        />

                        {mobile ? (
                            <IconButton size="small" aria-label="Close menu" onClick={onClose} sx={railButtonSx}>
                                <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                        ) : (
                            <Tooltip title="Collapse menu" placement="right" arrow>
                                <IconButton
                                    size="small"
                                    aria-label="Collapse menu"
                                    onClick={toggleCollapsed}
                                    sx={railButtonSx}
                                >
                                    <KeyboardDoubleArrowLeftRoundedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </>
                )}
            </Box>

            <Divider sx={(theme) => ({ borderColor: theme.palette.sidebar.border })} />

            {/* NAVIGATION */}

            <Box
                sx={(theme) => ({
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    px: collapsed ? 0 : theme.sidebarLayout.paddingX,
                    py: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: collapsed ? 0.75 : 0.25,

                    "&::-webkit-scrollbar": { width: theme.sidebarLayout.scrollbarWidth },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: theme.palette.sidebar.scrollbar,
                        borderRadius: theme.sidebarLayout.scrollbarWidth,
                    },
                })}
            >
                {navigation.map((section) => {
                    const active = isSectionActive(section, pathname);

                    if (collapsed) {
                        return (
                            <RailItem
                                key={section.label}
                                section={section}
                                active={active}
                                onOpenFlyout={(anchor, item) => setFlyout({ anchor, section: item })}
                            />
                        );
                    }

                    return section.children ? (
                        <SectionItem
                            key={section.label}
                            section={section}
                            active={active}
                            open={openSection === section.label}
                            pathname={pathname}
                            onToggle={() =>
                                setOpenSection((current) => (current === section.label ? null : section.label))
                            }
                        />
                    ) : (
                        <LeafItem key={section.label} item={section} active={active} />
                    );
                })}
            </Box>

            {/* EXPAND (collapsed, large screens) */}

            {collapsed && !compactScreen && (
                <>
                    <Divider sx={(theme) => ({ borderColor: theme.palette.sidebar.border })} />
                    <Box sx={{ py: 1.5, display: "grid", placeItems: "center" }}>
                        <Tooltip title="Expand menu" placement="right" arrow>
                            <IconButton size="small" aria-label="Expand menu" onClick={toggleCollapsed} sx={railButtonSx}>
                                <KeyboardDoubleArrowRightRoundedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </>
            )}

            <Flyout
                anchor={flyout.anchor}
                section={flyout.section}
                pathname={pathname}
                onClose={() => setFlyout({ anchor: null, section: null })}
            />
        </Box>
    );
}

export default Sidebar;
