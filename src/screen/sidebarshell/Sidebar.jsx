import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import FeedbackRoundedIcon from '@mui/icons-material/FeedbackRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';

import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PresentToAllRoundedIcon from '@mui/icons-material/PresentToAllRounded';

import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';

import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';

import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';

import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import AnnouncementRoundedIcon from '@mui/icons-material/AnnouncementRounded';

import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

import navigation from '../naviagation/Navigation';
import PharmalyxLogo from '../../assets/PharmalyxLogo.png';


const iconMap = {

  Dashboard: DashboardRoundedIcon,

  // Main sections
  'Field Operations': PeopleAltRoundedIcon,
  'Doctor Engagement': LocalHospitalRoundedIcon,
  'Products & Promotion': MedicationRoundedIcon,
  'Sales & Distribution': ShoppingCartRoundedIcon,
  Planning: EventNoteRoundedIcon,
  Expenses: AccountBalanceWalletRoundedIcon,
  'HR / Employee': PersonRoundedIcon,
  Resources: FolderRoundedIcon,
  Communication: ChatRoundedIcon,
  'Reports & Analytics': AssessmentRoundedIcon,
  Insights: InsightsRoundedIcon,
  Administration: ManageAccountsRoundedIcon,

  // Field Operations
  Doctors: PeopleAltRoundedIcon,
  'Tour Plan': MapRoundedIcon,
  Visits: LocationOnRoundedIcon,
  DCR: AssignmentRoundedIcon,
  Deviation: WarningAmberRoundedIcon,

  // Doctor Engagement
  RCPA: LocalHospitalRoundedIcon,
  Samples: Inventory2RoundedIcon,
  Gifts: CardGiftcardRoundedIcon,
  Feedback: FeedbackRoundedIcon,
  'Doctor Business': TrendingUpRoundedIcon,

  // Products
  Products: MedicationRoundedIcon,
  Promotions: CampaignRoundedIcon,
  Campaigns: AutoAwesomeRoundedIcon,
  'E-Detailing': PresentToAllRoundedIcon,

  // Sales
  'POB / Orders': ShoppingCartRoundedIcon,
  Retailers: StorefrontRoundedIcon,
  Stockists: WarehouseRoundedIcon,
  Stock: InventoryRoundedIcon,
  'Secondary Sales': BarChartRoundedIcon,
  Business: TrendingUpRoundedIcon,

  // Planning
  'Doctor Business Plan': EventNoteRoundedIcon,
  'Sales Plan': BarChartRoundedIcon,

  // Expenses
  'TA / Claims': AccountBalanceWalletRoundedIcon,

  // HR
  Attendance: PersonRoundedIcon,
  Leave: EventAvailableRoundedIcon,
  Activity: HistoryRoundedIcon,
  Appraisals: TrendingUpRoundedIcon,
  'Learning / Quiz': SchoolRoundedIcon,

  // Resources
  Files: FolderRoundedIcon,
  'Shared Content': ShareRoundedIcon,

  // Communication
  'Internal Communication': ChatRoundedIcon,
  Announcements: AnnouncementRoundedIcon,
  Notifications: NotificationsRoundedIcon,

  // Reports
  'MIS Reports': AssessmentRoundedIcon,
  'DCR / Call Reports': AssignmentRoundedIcon,
  Coverage: MapRoundedIcon,
  KPI: SpeedRoundedIcon,
  'Missed Visits': ErrorOutlineRoundedIcon,
  'POB Reports': ShoppingCartRoundedIcon,
  'Sales Reports': BarChartRoundedIcon,
  'Graphical Reports': AssessmentRoundedIcon,

  // Insights
  'Performance Insights': InsightsRoundedIcon,
  'Field Intelligence': SpeedRoundedIcon,
  'Risk & Alerts': ErrorOutlineRoundedIcon,
  'Advanced Analytics': BarChartRoundedIcon,

  // Administration
  Users: PeopleAltRoundedIcon,
  'Roles & Permissions': SecurityRoundedIcon,
  Masters: ManageAccountsRoundedIcon,
  Divisions: MapRoundedIcon,
  Territories: MapRoundedIcon,
  'Stockist / Retailer Masters': StorefrontRoundedIcon,
  Configuration: SecurityRoundedIcon,
  Approvals: AssignmentRoundedIcon,
  Integrations: ShareRoundedIcon,
};


function Sidebar() {

  const [openSections, setOpenSections] = useState({});

  const [collapsed, setCollapsed] = useState(false);

  const location = useLocation();


  /* ================================================= */
  /* SECTION CLICK */
  /* ================================================= */

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


  /* ================================================= */
  /* ICON */
  /* ================================================= */

  const getIcon = (label) => {

    return iconMap[label] || DashboardRoundedIcon;
  };


  /* ================================================= */
  /* CHECK ACTIVE RECURSIVELY */
  /* ================================================= */

  const isSectionActive = (item) => {

    if (!item.children) {
      return false;
    }

    return item.children.some((child) => {

      if (child.children) {
        return isSectionActive(child);
      }

      return (
        location.pathname === child.path ||
        location.pathname.startsWith(`${child.path}/`)
      );
    });
  };


  /* ================================================= */
  /* RENDER NESTED CHILDREN */
  /* ================================================= */

  const renderChildren = (children, level = 1) => {

    return (
      <List
        disablePadding
        sx={{
          mb: 0.5,

          pl: level === 1 ? 0.5 : 0.75,

          ml: level > 1 ? 1 : 0,

          borderLeft: '1px solid',

          borderColor: 'sidebar.border',
        }}
      >

        {children.map((child) => {

          const ChildIcon = getIcon(child.label);

          const hasChildren = Boolean(child.children);

          const childActive = hasChildren
            ? isSectionActive(child)
            : (
                location.pathname === child.path ||
                location.pathname.startsWith(`${child.path}/`)
              );


          return (
            <Box
              key={child.path || child.label}
            >

              {/* ================================================= */}
              {/* NESTED SECTION */}
              {/* ================================================= */}

              {hasChildren ? (

                <>
                  <ListItemButton
                    onClick={() =>
                      handleSectionClick(child.label)
                    }

                    sx={{
                      minHeight: 50,

                      width: '100%',

                      px: 1,

                      py: 0.5,

                      mb: 0.25,

                      borderRadius: 1.25,

                      display: 'flex',

                      flexDirection: 'column',

                      justifyContent: 'center',

                      alignItems: 'center',

                      color: childActive
                        ? 'sidebar.text'
                        : 'sidebar.mutedText',

                      backgroundColor: childActive
                        ? 'sidebar.surface'
                        : 'transparent',

                      position: 'relative',

                      transition:
                        'background-color 160ms ease, color 160ms ease',

                      '&:hover': {
                        backgroundColor:
                          'sidebar.hover',

                        color:
                          'sidebar.text',
                      },

                      '&::after': childActive
                        ? {
                            content: '""',

                            position: 'absolute',

                            right: 5,

                            width: 3,

                            height: 20,

                            borderRadius: 4,

                            backgroundColor:
                              'sidebar.active',
                          }
                        : {},
                    }}
                  >

                    <ListItemIcon
                      sx={{
                        minWidth: 0,

                        width: 'auto',

                        mr: 0,

                        mb: 0.25,

                        color: 'inherit',

                        display: 'flex',

                        justifyContent: 'center',

                        alignItems: 'center',
                      }}
                    >

                      <ChildIcon
                        sx={{
                          fontSize: 17,
                        }}
                      />

                    </ListItemIcon>


                    <ListItemText
                      primary={child.label}

                      sx={{
                        m: 0,

                        textAlign: 'center',
                      }}

                      primaryTypographyProps={{
                        fontSize: 12,

                        fontWeight: 500,

                        color: 'inherit',

                        whiteSpace: 'normal',

                        lineHeight: 1.2,
                      }}
                    />


                    <ExpandMoreRoundedIcon
                      sx={{
                        position: 'absolute',

                        right: 7,

                        top: '50%',

                        fontSize: 16,

                        color: childActive
                          ? 'sidebar.text'
                          : 'sidebar.mutedText',

                        transition:
                          'transform 160ms ease',

                        transform:
                          openSections[child.label]
                            ? 'rotate(180deg)'
                            : 'rotate(0deg)',
                      }}
                    />

                  </ListItemButton>


                  {/* ================================================= */}
                  {/* GRANDCHILDREN */}
                  {/* ================================================= */}

                  <Collapse
                    in={
                      !collapsed &&
                      openSections[child.label]
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

                /* ================================================= */
                /* NORMAL CHILD */
                /* ================================================= */

                <ListItemButton
                  component={NavLink}

                  to={child.path}

                  sx={{
                    minHeight: level === 1 ? 50 : 46,

                    width: '100%',

                    px: 1,

                    py: 0.5,

                    mb: 0.25,

                    borderRadius: 1.25,

                    display: 'flex',

                    flexDirection: 'column',

                    justifyContent: 'center',

                    alignItems: 'center',

                    color:
                      'sidebar.mutedText',

                    position: 'relative',

                    transition:
                      'background-color 160ms ease, color 160ms ease',

                    '&:hover': {
                      backgroundColor:
                        'sidebar.hover',

                      color:
                        'sidebar.text',
                    },

                    '&.active': {
                      backgroundColor:
                        'rgba(45, 212, 191, 0.07)',

                      color:
                        'sidebar.text',

                      '&::after': {
                        content: '""',

                        position: 'absolute',

                        right: 5,

                        width: 3,

                        height: level === 1
                          ? 20
                          : 18,

                        borderRadius: 4,

                        backgroundColor:
                          'sidebar.active',
                      },
                    },
                  }}
                >

                  <ListItemIcon
                    sx={{
                      minWidth: 0,

                      width: 'auto',

                      mr: 0,

                      mb: 0.25,

                      color: 'inherit',

                      display: 'flex',

                      justifyContent: 'center',

                      alignItems: 'center',
                    }}
                  >

                    <ChildIcon
                      sx={{
                        fontSize:
                          level === 1
                            ? 17
                            : 16,
                      }}
                    />

                  </ListItemIcon>


                  <ListItemText
                    primary={child.label}

                    sx={{
                      m: 0,

                      textAlign: 'center',
                    }}

                    primaryTypographyProps={{
                      fontSize:
                        level === 1
                          ? 12
                          : 11.5,

                      fontWeight:
                        level === 1
                          ? 450
                          : 450,

                      color:
                        'inherit',

                      whiteSpace:
                        'normal',

                      lineHeight:
                        1.2,
                    }}
                  />

                </ListItemButton>

              )}

            </Box>
          );
        })}

      </List>
    );
  };


  return (

    <Box
      sx={{
        width: collapsed ? 76 : 240,

        height: '100vh',

        flexShrink: 0,

        backgroundColor:
          'sidebar.background',

        display: 'flex',

        flexDirection: 'column',

        boxSizing: 'border-box',

        transition:
          'width 0.2s ease',

        overflow: 'hidden',

        borderRight: '1px solid',

        borderColor:
          'sidebar.border',
      }}
    >

      {/* ================================================= */}
      {/* BRAND */}
      {/* ================================================= */}

      <Box
        sx={{
          height: 72,

          px: collapsed ? 1 : 2,

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          borderBottom: '1px solid',

          borderColor:
            'sidebar.border',

          flexShrink: 0,

          backgroundColor:
            'sidebar.background',
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
                : 175,

            height: 'auto',

            maxHeight: 52,

            objectFit: 'contain',

            transition:
              'width 0.2s ease',
          }}
        />

      </Box>


      {/* ================================================= */}
      {/* TOGGLE */}
      {/* ================================================= */}

      <Box
        sx={{
          height: 54,

          display: 'flex',

          justifyContent:
            collapsed
              ? 'center'
              : 'flex-end',

          alignItems: 'center',

          px:
            collapsed
              ? 0
              : 1.5,

          flexShrink: 0,
        }}
      >

        <IconButton
          onClick={() =>
            setCollapsed(
              (previous) =>
                !previous
            )
          }

          sx={{
            color:
              'sidebar.mutedText',

            width: 40,

            height: 40,

            borderRadius: 1.5,

            '&:hover': {
              backgroundColor:
                'sidebar.hover',

              color:
                'sidebar.text',
            },
          }}
        >

          <MenuRoundedIcon />

        </IconButton>

      </Box>


      {/* ================================================= */}
      {/* NAVIGATION */}
      {/* ================================================= */}

      <Box
        sx={{
          flex: 1,

          overflowY: 'auto',

          px:
            collapsed
              ? 1
              : 1.25,

          pb: 2,

          '&::-webkit-scrollbar': {
            width: '5px',
          },

          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },

          '&::-webkit-scrollbar-thumb': {
            backgroundColor:
              'sidebar.scrollbar',

            borderRadius: '10px',
          },
        }}
      >

        <List disablePadding>

          {navigation.map((item) => {

            const MainIcon =
              getIcon(item.label);

            const sectionActive =
              isSectionActive(item);


            return (

              <Box
                key={item.label}
              >

                {/* ================================================= */}
                {/* NORMAL ITEM */}
                {/* ================================================= */}

                {!item.children && (

                  <Tooltip
                    title={
                      collapsed
                        ? item.label
                        : ''
                    }

                    placement="right"

                    arrow
                  >

                    <ListItemButton
                      component={NavLink}

                      to={item.path}

                      sx={{
                        minHeight: 56,

                        width: '100%',

                        px:
                          collapsed
                            ? 0
                            : 1,

                        py:
                          collapsed
                            ? 1
                            : 0.75,

                        mb: 0.5,

                        borderRadius: 1.5,

                        display: 'flex',

                        flexDirection:
                          'column',

                        justifyContent:
                          'center',

                        alignItems:
                          'center',

                        color:
                          'sidebar.mutedText',

                        position:
                          'relative',

                        transition:
                          'background-color 160ms ease, color 160ms ease',

                        '&:hover': {
                          backgroundColor:
                            'sidebar.hover',

                          color:
                            'sidebar.text',
                        },

                        '&.active': {
                          backgroundColor:
                            'rgba(45, 212, 191, 0.08)',

                          color:
                            'sidebar.text',

                          '&::before': {
                            content: '""',

                            position:
                              'absolute',

                            left: 0,

                            top: 10,

                            bottom: 10,

                            width: 3,

                            borderRadius:
                              '0 4px 4px 0',

                            backgroundColor:
                              'sidebar.active',
                          },
                        },
                      }}
                    >

                      <ListItemIcon
                        sx={{
                          minWidth: 0,

                          width: 'auto',

                          mr: 0,

                          mb: 0.35,

                          color: 'inherit',

                          display: 'flex',

                          justifyContent:
                            'center',

                          alignItems:
                            'center',
                        }}
                      >

                        <MainIcon
                          sx={{
                            fontSize: 21,
                          }}
                        />

                      </ListItemIcon>


                      {!collapsed && (

                        <ListItemText
                          primary={
                            item.label
                          }

                          sx={{
                            m: 0,

                            textAlign:
                              'center',
                          }}

                          primaryTypographyProps={{
                            fontSize: 12.5,

                            fontWeight: 500,

                            color:
                              'inherit',

                            whiteSpace:
                              'normal',

                            lineHeight:
                              1.2,
                          }}
                        />

                      )}

                    </ListItemButton>

                  </Tooltip>

                )}


                {/* ================================================= */}
                {/* PARENT / MODULE */}
                {/* ================================================= */}

                {item.children && (

                  <>

                    <Tooltip
                      title={
                        collapsed
                          ? item.label
                          : ''
                      }

                      placement="right"

                      arrow
                    >

                      <ListItemButton
                        onClick={() =>
                          handleSectionClick(
                            item.label
                          )
                        }

                        sx={{
                          minHeight:
                            collapsed
                              ? 58
                              : 68,

                          width: '100%',

                          px:
                            collapsed
                              ? 0
                              : 1,

                          py:
                            collapsed
                              ? 1
                              : 0.75,

                          mb: 0.5,

                          borderRadius: 1.5,

                          position:
                            'relative',

                          display: 'flex',

                          flexDirection:
                            'column',

                          justifyContent:
                            'center',

                          alignItems:
                            'center',

                          color:
                            sectionActive
                              ? 'sidebar.text'
                              : 'sidebar.mutedText',

                          backgroundColor:
                            sectionActive
                              ? 'sidebar.surface'
                              : 'transparent',

                          border: '1px solid',

                          borderColor:
                            sectionActive
                              ? 'rgba(45, 212, 191, 0.16)'
                              : 'transparent',

                          transition:
                            'background-color 160ms ease, color 160ms ease, border-color 160ms ease',

                          '&:hover': {
                            backgroundColor:
                              sectionActive
                                ? 'sidebar.surface'
                                : 'sidebar.hover',

                            color:
                              'sidebar.text',

                            borderColor:
                              sectionActive
                                ? 'rgba(45, 212, 191, 0.20)'
                                : 'transparent',
                          },

                          '&::before':
                            sectionActive
                              ? {
                                  content:
                                    '""',

                                  position:
                                    'absolute',

                                  left: 0,

                                  top: 10,

                                  bottom: 10,

                                  width: 3,

                                  borderRadius:
                                    '0 4px 4px 0',

                                  backgroundColor:
                                    'sidebar.active',
                                }
                              : {},
                        }}
                      >

                        {/* Parent icon */}

                        <ListItemIcon
                          sx={{
                            minWidth: 0,

                            width: 'auto',

                            mr: 0,

                            mb: 0.35,

                            color: 'inherit',

                            display: 'flex',

                            justifyContent:
                              'center',

                            alignItems:
                              'center',
                          }}
                        >

                          <MainIcon
                            sx={{
                              fontSize: 21,
                            }}
                          />

                        </ListItemIcon>


                        {/* Parent name */}

                        {!collapsed && (

                          <ListItemText
                            primary={
                              item.label
                            }

                            sx={{
                              m: 0,

                              textAlign:
                                'center',
                            }}

                            primaryTypographyProps={{
                              fontSize: 12.5,

                              fontWeight: 550,

                              color:
                                'inherit',

                              whiteSpace:
                                'normal',

                              lineHeight:
                                1.2,
                            }}
                          />

                        )}


                        {/* Expand arrow */}

                        {!collapsed && (

                          <ExpandMoreRoundedIcon
                            sx={{
                              position:
                                'absolute',

                              right: 7,

                              top: '50%',

                              fontSize: 17,

                              color:
                                sectionActive
                                  ? 'sidebar.text'
                                  : 'sidebar.mutedText',

                              transition:
                                'transform 160ms ease, color 160ms ease',

                              transform:
                                openSections[
                                  item.label
                                ]
                                  ? 'rotate(180deg)'
                                  : 'rotate(0deg)',
                            }}
                          />

                        )}

                      </ListItemButton>

                    </Tooltip>


                    {/* ================================================= */}
                    {/* CHILDREN */}
                    {/* ================================================= */}

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

                  </>

                )}

              </Box>

            );

          })}

        </List>

      </Box>

    </Box>
  );
}


export default Sidebar;