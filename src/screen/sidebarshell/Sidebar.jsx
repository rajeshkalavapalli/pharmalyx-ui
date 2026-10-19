import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
    Box,
    ButtonBase,
    Collapse,
    Divider,
    IconButton,
    InputBase,
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
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import KeyboardDoubleArrowLeftRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";

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

const focusRingSx = (theme) => ({
    outline: "none",
    boxShadow: `0 0 0 2px ${alpha(theme.palette.sidebar.active, theme.tint.strong * 2)}`,
});

const BADGE_COLORS = {
    soon: ["badgeBackground", "badgeText"],
    count: ["countBackground", "countText"],
    ai: ["aiBackground", "aiText"],
};

// Small pill after a label: "Soon", a count, or "AI".
function NavBadge({ label, tone = "soon" }) {
    const [background, text] = BADGE_COLORS[tone] || BADGE_COLORS.soon;

    return (
        <Box
            component="span"
            sx={(theme) => ({
                ...theme.typography.micro,
                fontWeight: theme.typography.subtitle2.fontWeight,
                minWidth: theme.sidebarLayout.badgeHeight,
                height: theme.sidebarLayout.badgeHeight,
                px: 0.75,
                flexShrink: 0,
                display: "inline-grid",
                placeItems: "center",
                borderRadius: theme.statusChip.radius,
                color: theme.palette.sidebar[text],
                backgroundColor: theme.palette.sidebar[background],
            })}
        >
            {label}
        </Box>
    );
}

// `pill`: the current page, drawn as a dark pill.
// `current`: a section holding the current page (stronger text, no pill).
const rowSx = (theme, { pill, current, height }) => ({
    width: "100%",
    minHeight: height,
    px: 1.25,
    gap: 1.25,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    textAlign: "left",
    borderRadius: theme.sidebarLayout.radius,
    color: pill
        ? theme.palette.sidebar.activeText
        : current
          ? theme.palette.sidebar.sectionText
          : theme.palette.sidebar.text,
    backgroundColor: pill ? theme.palette.sidebar.activeLight : "transparent",
    boxShadow: pill ? theme.palette.sidebar.activeGlow : "none",
    transition: theme.sidebarLayout.itemTransition,

    "&:hover": pill
        ? {}
        : {
              backgroundColor: theme.palette.sidebar.hover,
              color: theme.palette.sidebar.hoverText,
          },

    "&:focus-visible": focusRingSx(theme),
});

const iconSx = (theme, { pill, current }) => ({
    fontSize: theme.sidebarLayout.iconSize,
    flexShrink: 0,
    color: pill
        ? theme.palette.sidebar.pillIcon
        : current
          ? theme.palette.sidebar.active
          : theme.palette.sidebar.mutedText,
});

const labelSx = (theme, strong) => ({
    ...theme.typography.body2,
    flex: 1,
    minWidth: 0,
    fontWeight: strong ? theme.typography.subtitle2.fontWeight : theme.typography.body2.fontWeight,
    color: "inherit",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
});

// =========================================================
// EXPANDED: SEARCH
// =========================================================

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "");

function SidebarSearch({ value, onChange, inputRef }) {
    return (
        <Box
            sx={(theme) => ({
                height: theme.sidebarLayout.searchHeight,
                px: 1.25,
                gap: 1,
                display: "flex",
                alignItems: "center",
                borderRadius: theme.sidebarLayout.radius,
                border: "1px solid",
                borderColor: theme.palette.sidebar.searchBorder,
                backgroundColor: theme.palette.sidebar.searchBackground,
                transition: theme.sidebarLayout.itemTransition,
                "&:focus-within": {
                    borderColor: theme.palette.sidebar.searchFocusBorder,
                    backgroundColor: theme.palette.sidebar.keyBackground,
                },
            })}
        >
            <SearchRoundedIcon
                sx={(theme) => ({ fontSize: theme.sidebarLayout.iconSize, color: theme.palette.sidebar.mutedText })}
            />
            <InputBase
                inputRef={inputRef}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Escape") {
                        onChange("");
                        event.currentTarget.blur();
                    }
                }}
                placeholder="Search menu…"
                inputProps={{ "aria-label": "Search menu" }}
                sx={(theme) => ({
                    ...theme.typography.body2,
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    color: theme.palette.sidebar.hoverText,
                    "& input": { p: 0 },
                })}
            />
            {value ? (
                <IconButton
                    size="small"
                    aria-label="Clear search"
                    onClick={() => onChange("")}
                    sx={(theme) => ({ ...railButtonSx(theme), p: 0.25 })}
                >
                    <CloseRoundedIcon fontSize="inherit" />
                </IconButton>
            ) : (
                <Box
                    component="kbd"
                    sx={(theme) => ({
                        ...theme.typography.micro,
                        fontFamily: "inherit",
                        px: 0.75,
                        flexShrink: 0,
                        borderRadius: theme.sidebarLayout.radius,
                        border: "1px solid",
                        borderColor: theme.palette.sidebar.searchBorder,
                        color: theme.palette.sidebar.mutedText,
                        backgroundColor: theme.palette.sidebar.keyBackground,
                    })}
                >
                    {isMac ? "⌘K" : "Ctrl K"}
                </Box>
            )}
        </Box>
    );
}

// Keeps entries whose label matches; for sections, otherwise only the matching children.
const filterNavigation = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return navigation;

    return navigation
        .map((section) => {
            if (section.label.toLowerCase().includes(q)) return section;
            if (!section.children) return null;

            const children = section.children.filter((child) => child.label.toLowerCase().includes(q));
            return children.length ? { ...section, children } : null;
        })
        .filter(Boolean);
};

// =========================================================
// EXPANDED: GROUP HEADING
// =========================================================

function GroupLabel({ label, first }) {
    return (
        <Typography
            variant="overline"
            component="p"
            sx={(theme) => ({
                px: 1.25,
                pt: first ? 0.5 : theme.sidebarLayout.groupGap,
                pb: 0.75,
                color: theme.palette.sidebar.groupLabel,
            })}
        >
            {label}
        </Typography>
    );
}

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
            sx={(theme) => rowSx(theme, { pill: active, height: theme.sidebarLayout.itemHeight })}
        >
            <Icon sx={(theme) => iconSx(theme, { pill: active })} />
            <Typography component="span" sx={(theme) => labelSx(theme, active)}>
                {item.label}
            </Typography>
            {item.badge && <NavBadge {...item.badge} />}
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
                sx={(theme) => rowSx(theme, { current: active, height: theme.sidebarLayout.itemHeight })}
            >
                <Icon sx={(theme) => iconSx(theme, { current: active })} />
                <Typography component="span" sx={(theme) => labelSx(theme, active)}>
                    {section.label}
                </Typography>
                {section.badge && <NavBadge {...section.badge} />}
                <ChevronRightRoundedIcon
                    sx={(theme) => ({
                        fontSize: theme.sidebarLayout.iconSize,
                        flexShrink: 0,
                        color: theme.palette.sidebar.mutedText,
                        transform: open ? "rotate(90deg)" : "none",
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
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.25,

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
                ...rowSx(theme, { pill: active, height: theme.sidebarLayout.childItemHeight }),
                pl: 1.5,
                ...(!active && !item.ready && { color: theme.palette.sidebar.mutedText }),
            })}
        >
            <Typography component="span" sx={(theme) => labelSx(theme, active)}>
                {item.label}
            </Typography>
            {!item.ready && <NavBadge label="Soon" />}
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
                    color: active ? theme.palette.sidebar.pillIcon : theme.palette.sidebar.mutedText,
                    backgroundColor: active ? theme.palette.sidebar.activeLight : "transparent",
                    boxShadow: active ? theme.palette.sidebar.activeGlow : "none",
                    transition: theme.sidebarLayout.itemTransition,

                    "&:hover": {
                        color: active ? theme.palette.sidebar.pillIcon : theme.palette.sidebar.hoverText,
                        backgroundColor: active ? theme.palette.sidebar.activeLight : theme.palette.sidebar.hover,
                    },

                    "&:focus-visible": focusRingSx(theme),
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
                        {!child.ready && <NavBadge label="Soon" />}
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

    const [query, setQuery] = useState("");
    const searchRef = useRef(null);
    const searching = query.trim() !== "";
    const items = useMemo(() => filterNavigation(query), [query]);

    // Ctrl/Cmd + K jumps to the menu search (expands the menu first if needed).
    useEffect(() => {
        const onKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                if (pinnedCollapsed && !compactScreen) {
                    writeCollapsed(false);
                    setPinnedCollapsed(false);
                }
                // Wait a frame so the input exists after expanding.
                requestAnimationFrame(() => searchRef.current?.focus());
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [pinnedCollapsed, compactScreen]);

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
                            <BrandMark size={theme.sidebarLayout.markSize} tone={theme.palette.sidebar.tone} />
                        </ButtonBase>
                    </Tooltip>
                ) : (
                    <>
                        <BrandMark
                            size={theme.sidebarLayout.markSize}
                            showWordmark
                            tagline="Field intelligence"
                            tone={theme.palette.sidebar.tone}
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

            {collapsed ? (
                <Divider sx={(theme) => ({ borderColor: theme.palette.sidebar.border })} />
            ) : (
                <Box sx={(theme) => ({ px: theme.sidebarLayout.paddingX, pb: 1, flexShrink: 0 })}>
                    <SidebarSearch value={query} onChange={setQuery} inputRef={searchRef} />
                </Box>
            )}

            {/* NAVIGATION */}

            <Box
                sx={(theme) => ({
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    px: collapsed ? 0 : theme.sidebarLayout.paddingX,
                    py: collapsed ? 1.5 : 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: collapsed ? 0.75 : 0.25,

                    // Thin scrollbar, shown only while the pointer is over the menu.
                    scrollbarWidth: "thin",
                    scrollbarColor: "transparent transparent",
                    "&:hover, &:focus-within": {
                        scrollbarColor: `${theme.palette.sidebar.scrollbar} transparent`,
                    },
                })}
            >
                {(collapsed ? navigation : items).map((section, index, list) => {
                    const active = isSectionActive(section, pathname);
                    const groupStart = index === 0 || list[index - 1].group !== section.group;

                    if (collapsed) {
                        return (
                            <Box key={section.label} sx={{ display: "contents" }}>
                                {groupStart && index > 0 && (
                                    <Divider
                                        sx={(theme) => ({ mx: 2, my: 0.5, borderColor: theme.palette.sidebar.border })}
                                    />
                                )}
                                <RailItem
                                    section={section}
                                    active={active}
                                    onOpenFlyout={(anchor, item) => setFlyout({ anchor, section: item })}
                                />
                            </Box>
                        );
                    }

                    return (
                        <Box key={section.label} sx={{ display: "contents" }}>
                            {groupStart && section.group && <GroupLabel label={section.group} first={index === 0} />}
                            {section.children ? (
                                <SectionItem
                                    section={section}
                                    active={active}
                                    open={searching || openSection === section.label}
                                    pathname={pathname}
                                    onToggle={() =>
                                        setOpenSection((current) => (current === section.label ? null : section.label))
                                    }
                                />
                            ) : (
                                <LeafItem item={section} active={active} />
                            )}
                        </Box>
                    );
                })}

                {!collapsed && searching && items.length === 0 && (
                    <Typography
                        variant="body2"
                        sx={(theme) => ({ px: 1.25, py: 2, color: theme.palette.sidebar.mutedText })}
                    >
                        No menu items match "{query.trim()}".
                    </Typography>
                )}
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
