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

  const getIcon = (label) => {
    return iconMap[label] || DashboardRoundedIcon;
  };

  const isSectionActive = (item) => {
    if (!item.children) {
      return false;
    }

    return item.children.some(
      (child) =>
        location.pathname === child.path ||
        location.pathname.startsWith(`${child.path}/`)
    );
  };

  return (
    <Box
      sx={{
        width: collapsed ? 76 : 240,
        height: '100vh',
        flexShrink: 0,

        backgroundColor: 'sidebar.background',

        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',

        transition: 'width 0.2s ease',

        overflow: 'hidden',

        boxShadow: '4px 0 18px rgba(3, 24, 32, 0.12)',
      }}
    >
      {/* ================= BRAND ================= */}

      <Box
        sx={{
          height: 72,
          px: collapsed ? 1 : 2,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          borderBottom: '1px solid',
          borderColor: 'sidebar.border',

          flexShrink: 0,

          backgroundColor: 'sidebar.surface',
        }}
      >
        <Box
          component="img"
          src={PharmalyxLogo}
          alt="Pharmalyx"
          sx={{
            width: collapsed ? 48 : 175,
            height: 'auto',
            maxHeight: 52,
            objectFit: 'contain',
            transition: 'width 0.2s ease',
          }}
        />
      </Box>

      {/* ================= TOGGLE ================= */}

      <Box
        sx={{
          height: 54,

          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
          alignItems: 'center',

          px: collapsed ? 0 : 1.5,

          flexShrink: 0,
        }}
      >
        <IconButton
          onClick={() => setCollapsed((previous) => !previous)}
          sx={{
            color: 'sidebar.mutedText',

            width: 42,
            height: 42,

            borderRadius: 1.5,

            '&:hover': {
              backgroundColor: 'sidebar.hover',
              color: 'sidebar.text',
            },
          }}
        >
          <MenuRoundedIcon />
        </IconButton>
      </Box>

      {/* ================= NAVIGATION ================= */}

      <Box
        sx={{
          flex: 1,

          overflowY: 'auto',

          px: collapsed ? 1 : 1.25,
          pb: 2,

          '&::-webkit-scrollbar': {
            width: '5px',
          },

          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },

          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'sidebar.scrollbar',
            borderRadius: '10px',
          },
        }}
      >
        <List disablePadding>
          {navigation.map((item) => {
            const MainIcon = getIcon(item.label);
            const sectionActive = isSectionActive(item);

            return (
              <Box key={item.label}>
                {/* ================= NORMAL ITEM ================= */}

                {!item.children && (
                  <Tooltip
                    title={collapsed ? item.label : ''}
                    placement="right"
                    arrow
                  >
                    <ListItemButton
                      component={NavLink}
                      to={item.path}
                      sx={{
                        minHeight: 58,
                        width: '100%',

                        px: collapsed ? 0 : 1,
                        py: collapsed ? 1 : 0.75,

                        mb: 0.75,

                        borderRadius: 2,

                        display: 'flex',
                        flexDirection: 'column',

                        justifyContent: 'center',
                        alignItems: 'center',

                        color: 'sidebar.text',

                        transition:
                          'background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',

                        '&:hover': {
                          backgroundColor: 'sidebar.hover',
                          color: 'sidebar.text',
                        },

                        '&.active': {
                          backgroundColor: 'sidebar.surface',
                          color: 'sidebar.text',

                          boxShadow:
                            '0 6px 18px rgba(0, 0, 0, 0.20)',

                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 10,
                            bottom: 10,
                            width: 3,
                            borderRadius: '0 4px 4px 0',
                            backgroundColor: 'sidebar.active',
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
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <MainIcon sx={{ fontSize: 21 }} />
                      </ListItemIcon>

                      {!collapsed && <ListItemText
                        primary={item.label}
                        sx={{
                          m: 0,
                          textAlign: 'center',
                        }}
                        primaryTypographyProps={{
                          fontSize: collapsed ? 0 : 12.5,
                          fontWeight: 500,
                          color: 'inherit',
                          whiteSpace: 'normal',
                          lineHeight: 1.2,
                        }}
                      />}
                    </ListItemButton>
                  </Tooltip>
                )}

                {/* ================= PARENT / MODULE ================= */}

                {item.children && (
                  <>
                    <Tooltip
                      title={collapsed ? item.label : ''}
                      placement="right"
                      arrow
                    >
                      <ListItemButton
                        onClick={() => handleSectionClick(item.label)}
                        sx={{
                          minHeight: collapsed ? 58 : 72,
                          width: '100%',

                          px: collapsed ? 0 : 1,
                          py: collapsed ? 1 : 0.75,

                          mb: 0.5,

                          borderRadius: 2,

                          position: 'relative',

                          display: 'flex',
                          flexDirection: 'column',

                          justifyContent: 'center',
                          alignItems: 'center',

                          color: sectionActive
                            ? 'sidebar.text'
                            : 'sidebar.mutedText',

                          backgroundColor: sectionActive
                            ? 'sidebar.surface'
                            : 'transparent',

                          border: '1px solid',
                          borderColor: 'sidebar.border',

                          transition:
                            'background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',

                          boxShadow: sectionActive
                            ? '0 6px 18px rgba(0, 0, 0, 0.16)'
                            : 'none',

                          '&:hover': {
                            backgroundColor: sectionActive
                              ? 'sidebar.surface'
                              : 'sidebar.hover',

                            color: 'sidebar.text',
                          },

                          '&::before': sectionActive
                            ? {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: 10,
                                bottom: 10,
                                width: 3,
                                borderRadius: '0 4px 4px 0',
                                backgroundColor: 'sidebar.active',
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
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <MainIcon sx={{ fontSize: 22 }} />
                        </ListItemIcon>

                        {/* Parent name */}

                        {!collapsed && (
                          <ListItemText
                            primary={item.label}
                            sx={{
                              m: 0,
                              textAlign: 'center',
                            }}
                            primaryTypographyProps={{
                              fontSize: 12.5,
                              fontWeight: 500,
                              color: 'inherit',
                              whiteSpace: 'normal',
                              lineHeight: 1.2,
                            }}
                          />
                        )}

                        {/* Expand arrow */}

                        {!collapsed && (
                          <ExpandMoreRoundedIcon
                            sx={{
                              position: 'absolute',
                              right: 7,
                              top: '50%',

                              fontSize: 17,

                              color: 'sidebar.mutedText',

                              transition: 'transform 0.2s ease',

                              transform: openSections[item.label]
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                            }}
                          />
                        )}
                      </ListItemButton>
                    </Tooltip>

                    {/* ================= CHILDREN ================= */}

                    <Collapse
                      in={!collapsed && openSections[item.label]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List
                        disablePadding
                        sx={{
                          mb: 0.5,

                          pl: collapsed ? 0 : 0.5,

                          borderLeft: '1px solid',
                          borderColor: 'sidebar.border',
                        }}
                      >
                        {item.children.map((child) => {
                          const ChildIcon = getIcon(child.label);

                          return (
                            <ListItemButton
                              key={child.path}
                              component={NavLink}
                              to={child.path}
                              sx={{
                                minHeight: 58,
                                width: '100%',

                                px: 1,
                                py: 0.75,

                                mb: 0.25,

                                borderRadius: 1.5,

                                display: 'flex',
                                flexDirection: 'column',

                                justifyContent: 'center',
                                alignItems: 'center',

                                color: 'sidebar.mutedText',

                                transition:
                                  'background-color 0.2s ease, color 0.2s ease',

                                '&:hover': {
                                  backgroundColor: 'sidebar.hover',
                                  color: 'sidebar.text',
                                },

                                '&.active': {
                                  backgroundColor: 'sidebar.surface',

                                  color: 'sidebar.text',

                                  '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    right: 6,
                                    width: 3,
                                    height: 22,
                                    borderRadius: 4,
                                    backgroundColor: 'sidebar.active',
                                  },
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  width: 'auto',
                                  mr: 0,
                                  mb: 0.3,

                                  color: 'inherit',

                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <ChildIcon
                                  sx={{
                                    fontSize: 18,
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
                                  fontWeight: 400,
                                  color: 'inherit',
                                  whiteSpace: 'normal',
                                  lineHeight: 1.2,
                                }}
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
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