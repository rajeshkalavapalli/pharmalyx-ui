import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    IconButton,
    Tooltip,
} from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";
import FeedbackRoundedIcon from "@mui/icons-material/FeedbackRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PresentToAllRoundedIcon from "@mui/icons-material/PresentToAllRounded";

import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";

import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";

import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import AnnouncementRoundedIcon from "@mui/icons-material/AnnouncementRounded";

import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

import navigation from "../naviagation/Navigation";
import PharmalyxLogo from "../../assets/PharmalyxLogo.png";


const iconMap = {
    Dashboard: DashboardRoundedIcon,

    "Field Operations": PeopleAltRoundedIcon,
    "Doctor Engagement": LocalHospitalRoundedIcon,
    "Products & Promotion": MedicationRoundedIcon,
    "Sales & Distribution": ShoppingCartRoundedIcon,
    Planning: EventNoteRoundedIcon,
    Expenses: AccountBalanceWalletRoundedIcon,
    "HR / Employee": PersonRoundedIcon,
    Resources: FolderRoundedIcon,
    Communication: ChatRoundedIcon,
    "Reports & Analytics": AssessmentRoundedIcon,
    Insights: InsightsRoundedIcon,
    Administration: ManageAccountsRoundedIcon,

    Doctors: PeopleAltRoundedIcon,
    "Tour Plan": MapRoundedIcon,
    Visits: LocationOnRoundedIcon,
    DCR: AssignmentRoundedIcon,
    Deviation: WarningAmberRoundedIcon,

    RCPA: LocalHospitalRoundedIcon,
    Samples: Inventory2RoundedIcon,
    Gifts: CardGiftcardRoundedIcon,
    Feedback: FeedbackRoundedIcon,
    "Doctor Business": TrendingUpRoundedIcon,

    Products: MedicationRoundedIcon,
    Promotions: CampaignRoundedIcon,
    Campaigns: AutoAwesomeRoundedIcon,
    "E-Detailing": PresentToAllRoundedIcon,

    "POB / Orders": ShoppingCartRoundedIcon,
    Retailers: StorefrontRoundedIcon,
    Stockists: WarehouseRoundedIcon,
    Stock: InventoryRoundedIcon,
    "Secondary Sales": BarChartRoundedIcon,
    Business: TrendingUpRoundedIcon,

    "Doctor Business Plan": EventNoteRoundedIcon,
    "Sales Plan": BarChartRoundedIcon,

    "TA / Claims": AccountBalanceWalletRoundedIcon,

    Attendance: PersonRoundedIcon,
    Leave: EventAvailableRoundedIcon,
    Activity: HistoryRoundedIcon,
    Appraisals: TrendingUpRoundedIcon,
    "Learning / Quiz": SchoolRoundedIcon,

    Files: FolderRoundedIcon,
    "Shared Content": ShareRoundedIcon,

    "Internal Communication": ChatRoundedIcon,
    Announcements: AnnouncementRoundedIcon,
    Notifications: NotificationsRoundedIcon,

    "MIS Reports": AssessmentRoundedIcon,
    "DCR / Call Reports": AssignmentRoundedIcon,
    Coverage: MapRoundedIcon,
    KPI: SpeedRoundedIcon,
    "Missed Visits": ErrorOutlineRoundedIcon,
    "POB Reports": ShoppingCartRoundedIcon,
    "Sales Reports": BarChartRoundedIcon,
    "Graphical Reports": AssessmentRoundedIcon,

    "Performance Insights": InsightsRoundedIcon,
    "Field Intelligence": SpeedRoundedIcon,
    "Risk & Alerts": ErrorOutlineRoundedIcon,
    "Advanced Analytics": BarChartRoundedIcon,

    Users: PeopleAltRoundedIcon,
    "Roles & Permissions": SecurityRoundedIcon,
    Masters: ManageAccountsRoundedIcon,
    Divisions: MapRoundedIcon,
    Areas: MapRoundedIcon,
    "Stockist / Retailer Masters": StorefrontRoundedIcon,
    Configuration: SecurityRoundedIcon,
    Approvals: AssignmentRoundedIcon,
    Integrations: ShareRoundedIcon,
};


function Sidebar() {

    const [openSections, setOpenSections] = useState({});
    const [collapsed, setCollapsed] = useState(false);

    const location = useLocation();


    // =====================================================
    // GET ICON
    // =====================================================

    const getIcon = (label) => {

        return iconMap[label] || DashboardRoundedIcon;

    };


    // =====================================================
    // CHECK ACTIVE
    // =====================================================

    const isItemActive = (item) => {

        if (!item.path) {
            return false;
        }

        return (
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`)
        );

    };


    // =====================================================
    // CHECK SECTION ACTIVE
    // =====================================================

    const isSectionActive = (item) => {

        if (!item.children) {
            return isItemActive(item);
        }

        return item.children.some((child) => {

            if (child.children) {
                return isSectionActive(child);
            }

            return isItemActive(child);

        });

    };


    // =====================================================
    // SECTION CLICK
    // =====================================================

    const handleSectionClick = (label) => {

        if (collapsed) {

            setCollapsed(false);

            setOpenSections((previous) => ({
                ...previous,
                [label]: true,
            }));

            return;
        }

        setOpenSections((previous) => ({
            ...previous,
            [label]: !previous[label],
        }));

    };


    // =====================================================
    // CHILD NAVIGATION
    // =====================================================

    const renderChildren = (children, level = 1) => {

        return (

            <List
                disablePadding
                sx={{
                    mt: 0.75,
                    mb: 1,

                    pl: level === 1 ? 1 : 1.5,

                    borderLeft:
                        level > 1
                            ? "1px solid"
                            : "none",

                    borderColor: "sidebar.border",
                }}
            >

                {children.map((child) => {

                    const ChildIcon = getIcon(child.label);

                    const hasChildren =
                        Boolean(child.children);

                    const childActive =
                        hasChildren
                            ? isSectionActive(child)
                            : isItemActive(child);


                    return (

                        <Box
                            key={
                                child.path ||
                                child.label
                            }
                        >

                            {/* ===================================== */}
                            {/* NESTED SECTION */}
                            {/* ===================================== */}

                            {hasChildren ? (

                                <>

                                    <Tooltip
                                        title={child.label}
                                        placement="right"
                                        arrow
                                    >

                                        <ListItemButton
                                            onClick={() =>
                                                handleSectionClick(
                                                    child.label
                                                )
                                            }

                                            sx={{
                                                minHeight: 42,

                                                px: 1.25,

                                                mb: 0.5,

                                                borderRadius: 1.5,

                                                color:
                                                    childActive
                                                        ? "sidebar.text"
                                                        : "sidebar.mutedText",

                                                backgroundColor:
                                                    childActive
                                                        ? "sidebar.activeLight"
                                                        : "sidebar.surface",

                                                border: "1px solid",

                                                borderColor:
                                                    childActive
                                                        ? "sidebar.active"
                                                        : "sidebar.border",

                                                transition:
                                                    "all 160ms ease",

                                                "&:hover": {
                                                    backgroundColor:
                                                        "sidebar.hover",

                                                    color:
                                                        "sidebar.text",
                                                },
                                            }}
                                        >

                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 34,

                                                    color:
                                                        "inherit",
                                                }}
                                            >

                                                <ChildIcon
                                                    sx={{
                                                        fontSize: 18,
                                                    }}
                                                />

                                            </ListItemIcon>


                                            <ListItemText
                                                primary={
                                                    child.label
                                                }

                                                slotProps={{
                                                    primary: {
                                                        fontSize: 13,

                                                        fontWeight:
                                                            childActive
                                                                ? 600
                                                                : 500,
                                                    },
                                                }}
                                            />


                                            <ExpandMoreRoundedIcon
                                                sx={{
                                                    fontSize: 18,

                                                    transition:
                                                        "transform 160ms ease",

                                                    transform:
                                                        openSections[
                                                            child.label
                                                        ]
                                                            ? "rotate(180deg)"
                                                            : "rotate(0deg)",
                                                }}
                                            />

                                        </ListItemButton>

                                    </Tooltip>


                                    <Collapse
                                        in={
                                            !collapsed &&
                                            openSections[
                                                child.label
                                            ]
                                        }

                                        timeout="auto"

                                        unmountOnExit
                                    >

                                        {renderChildren(
                                            child.children,
                                            level + 1
                                        )}

                                    </Collapse>

                                </>

                            ) : (

                                /* ===================================== */
                                /* NORMAL CHILD */
                                /* ===================================== */

                                <Tooltip
                                    title={child.label}
                                    placement="right"
                                    arrow
                                >

                                    <ListItemButton
                                        component={NavLink}

                                        to={child.path}

                                        sx={{
                                            minHeight: 40,

                                            px: 1.25,

                                            mb: 0.5,

                                            borderRadius: 1.5,

                                            color:
                                                "sidebar.mutedText",

                                            backgroundColor:
                                                "sidebar.surface",

                                            border: "1px solid",

                                            borderColor:
                                                "sidebar.border",

                                            transition:
                                                "all 160ms ease",

                                            "&:hover": {
                                                backgroundColor:
                                                    "sidebar.hover",

                                                color:
                                                    "sidebar.text",
                                            },

                                            "&.active": {
                                                backgroundColor:
                                                    "sidebar.activeLight",

                                                borderColor:
                                                    "sidebar.active",

                                                color:
                                                    "sidebar.text",
                                            },
                                        }}
                                    >

                                        <ListItemIcon
                                            sx={{
                                                minWidth: 34,

                                                color:
                                                    "inherit",
                                            }}
                                        >

                                            <ChildIcon
                                                sx={{
                                                    fontSize: 17,
                                                }}
                                            />

                                        </ListItemIcon>


                                        <ListItemText
                                            primary={
                                                child.label
                                            }

                                            slotProps={{
                                                primary: {
                                                    fontSize: 12.5,

                                                    fontWeight: 500,
                                                },
                                            }}
                                        />

                                    </ListItemButton>

                                </Tooltip>

                            )}

                        </Box>

                    );

                })}

            </List>

        );

    };


    // =====================================================
    // MAIN NAVIGATION ITEM
    // =====================================================

    const renderMainItem = (item) => {

        const MainIcon =
            getIcon(item.label);

        const hasChildren =
            Boolean(item.children);

        const active =
            hasChildren
                ? isSectionActive(item)
                : isItemActive(item);


        const itemContent = (

            <ListItemButton

                component={
                    hasChildren
                        ? "button"
                        : NavLink
                }

                to={
                    !hasChildren
                        ? item.path
                        : undefined
                }

                onClick={
                    hasChildren
                        ? () =>
                            handleSectionClick(
                                item.label
                            )
                        : undefined
                }

                sx={{

                    /* ============================================= */
                    /* COMPACT / EXPANDED SIZE */
                    /* ============================================= */

                    width:
                        collapsed
                            ? 56
                            : "100%",

                    minHeight: 64,

                    p:
                        collapsed
                            ? 0.75
                            : 0.75,

                    mb:
                        collapsed
                            ? 0.75
                            : 0.5,


                    /* ============================================= */
                    /* LAYOUT */
                    /* ============================================= */

                    borderRadius: 2,

                    display: "flex",

                    flexDirection: "column",

                    alignItems: "center",

                    justifyContent: "center",

                    gap:
                        collapsed
                            ? 0
                            : 0.35,


                    /* ============================================= */
                    /* COLORS */
                    /* ============================================= */

                    color:
                        active
                            ? "sidebar.activeText"
                            : "sidebar.text",

                    backgroundColor:
                        active
                            ? "sidebar.active"
                            : "sidebar.surface",

                    border: "1px solid",

                    borderColor:
                        active
                            ? "sidebar.active"
                            : "sidebar.border",


                    /* ============================================= */
                    /* TRANSITION */
                    /* ============================================= */

                    position: "relative",

                    transition:
                        "all 180ms ease",


                    /* ============================================= */
                    /* HOVER */
                    /* ============================================= */

                    "&:hover": {

                        borderColor:
                            active
                                ? "sidebar.active"
                                : "primary.light",

                        backgroundColor:
                            active
                                ? "sidebar.active"
                                : "action.hover",
                    },


                    /* ============================================= */
                    /* ACTIVE */
                    /* ============================================= */

                    "&.active": {

                        color:
                            "sidebar.activeText",

                        backgroundColor:
                            "sidebar.active",

                        borderColor:
                            "sidebar.active",
                    },
                }}
            >


                {/* ============================================= */}
                {/* ICON */}
                {/* ============================================= */}

                <ListItemIcon

                    sx={{

                        minWidth: 0,

                        color: "inherit",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                        m: 0,
                    }}
                >

                    <MainIcon

                        sx={{

                            fontSize:
                                collapsed
                                    ? 24
                                    : 22,
                        }}
                    />

                </ListItemIcon>


                {/* ============================================= */}
                {/* EXPANDED LABEL */}
                {/* ============================================= */}

                {!collapsed && (

                    <ListItemText

                        primary={
                            item.label
                        }

                        sx={{

                            m: 0,

                            width: "100%",

                            textAlign: "center",
                        }}

                        slotProps={{

                            primary: {

                                sx: {

                                    fontSize: 12.5,

                                    fontWeight:
                                        active
                                            ? 600
                                            : 500,

                                    lineHeight: 1.2,

                                    whiteSpace: "nowrap",

                                    overflow: "hidden",

                                    textOverflow: "ellipsis",
                                },
                            },
                        }}
                    />

                )}


                {/* ============================================= */}
                {/* EXPAND ICON */}
                {/* ============================================= */}

                {hasChildren && !collapsed && (

                    <ExpandMoreRoundedIcon

                        sx={{

                            position: "absolute",

                            right: 7,

                            top: 7,

                            fontSize: 15,

                            transition:
                                "transform 160ms ease",

                            transform:
                                openSections[
                                    item.label
                                ]
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                        }}
                    />

                )}

            </ListItemButton>

        );


        return (

            <Box
                key={item.label}
            >

                {/* ============================================= */}
                {/* TOOLTIP - COMPACT MODE ONLY */}
                {/* ============================================= */}

                <Tooltip

                    title={item.label}

                    placement="right"

                    arrow

                    disableHoverListener={
                        !collapsed
                    }

                    disableFocusListener={
                        !collapsed
                    }

                    disableTouchListener={
                        !collapsed
                    }
                >

                    <Box>

                        {itemContent}

                    </Box>

                </Tooltip>


                {/* ============================================= */}
                {/* CHILDREN */}
                {/* ============================================= */}

                {hasChildren && (

                    <Collapse

                        in={
                            !collapsed &&
                            openSections[
                                item.label
                            ]
                        }

                        timeout="auto"

                        unmountOnExit
                    >

                        {renderChildren(
                            item.children
                        )}

                    </Collapse>

                )}

            </Box>

        );

    };


    return (

        <Box
            sx={{

                width:
                    collapsed
                        ? 72
                        : 250,

                height: "100vh",

                flexShrink: 0,

                backgroundColor:
                    "sidebar.background",

                display: "flex",

                flexDirection: "column",

                boxSizing: "border-box",

                transition:
                    "width 180ms ease",

                overflow: "hidden",

                borderRight:
                    "1px solid",

                borderColor:
                    "sidebar.border",
            }}
        >


            {/* ================================================= */}
            {/* BRAND */}
            {/* ================================================= */}

            <Box
                sx={{

                    height: 88,

                    px:
                        collapsed
                            ? 1
                            : 2,

                    display: "flex",

                    alignItems: "center",

                    justifyContent:
                        "center",

                    flexShrink: 0,
                }}
            >

                <Box
                    component="img"

                    src={PharmalyxLogo}

                    alt="Pharmalyx"

                    sx={{

                        width:
                            collapsed
                                ? 48
                                : 165,

                        height: "auto",

                        maxHeight: 54,

                        objectFit:
                            "contain",

                        transition:
                            "width 180ms ease",
                    }}
                />

            </Box>


            {/* ================================================= */}
            {/* COLLAPSE BUTTON */}
            {/* ================================================= */}

            <Box
                sx={{

                    height: 54,

                    display: "flex",

                    alignItems: "center",

                    justifyContent:
                        "center",

                    flexShrink: 0,
                }}
            >

                <Tooltip
                    title={
                        collapsed
                            ? "Expand menu"
                            : "Collapse menu"
                    }

                    placement="right"

                    arrow
                >

                    <IconButton

                        onClick={() =>
                            setCollapsed(
                                (previous) =>
                                    !previous
                            )
                        }

                        sx={{

                            width: 42,

                            height: 42,

                            color:
                                "sidebar.text",

                            borderRadius: 1.5,

                            "&:hover": {
                                backgroundColor:
                                    "action.hover",
                            },
                        }}
                    >

                        <MenuRoundedIcon
                            sx={{
                                fontSize: 28,
                            }}
                        />

                    </IconButton>

                </Tooltip>

            </Box>


            {/* ================================================= */}
            {/* NAVIGATION */}
            {/* ================================================= */}

            <Box
                sx={{

                    flex: 1,

                    overflowY:
                        "auto",

                    overflowX:
                        "hidden",

                    px:
                        collapsed
                            ? 0.5
                            : 2.5,

                    pb: 1.5,

                    display:
                        "flex",

                    justifyContent:
                        "center",

                    "&::-webkit-scrollbar": {
                        width: 5,
                    },

                    "&::-webkit-scrollbar-track": {
                        background:
                            "transparent",
                    },

                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor:
                            "sidebar.scrollbar",

                        borderRadius: 10,
                    },
                }}
            >

                <List
                    disablePadding

                    sx={{
                        width: "100%",
                    }}
                >

                    {navigation.map(
                        renderMainItem
                    )}

                </List>

            </Box>

        </Box>

    );

}


export default Sidebar;