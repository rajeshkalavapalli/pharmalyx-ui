import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Tooltip,
} from "@mui/material";

import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import { useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  // =====================================================
  // PAGE DETAILS
  // =====================================================

  const getPageDetails = () => {
    switch (location.pathname) {
      case "/dashboard":
        return {
          title: "Dashboard",
          subtitle: "Welcome to Pharmalyx",
        };

      case "/admin/Users":
        return {
          title: "Users",
          subtitle: "Manage users and their organizational access.",
        };

      default:
        return {
          title: "",
          subtitle: "",
        };
    }
  };

  const { title, subtitle } = getPageDetails();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundImage: "none",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "68px !important",

          px: {
            xs: 2,
            md: 3,
          },

          gap: 2,
        }}
      >
        {/* ================================================= */}
        {/* LEFT — PAGE INFORMATION */}
        {/* ================================================= */}

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 650,
              color: "text.primary",
              letterSpacing: "-0.025em",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 400,
                color: "text.secondary",
                mt: 0.35,
                lineHeight: 1.35,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* ================================================= */}
        {/* RIGHT — USER AREA */}
        {/* ================================================= */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          {/* ================================================= */}
          {/* NOTIFICATIONS */}
          {/* ================================================= */}

          <Tooltip title="Notifications">
            <IconButton
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                color: "text.secondary",

                transition:
                  "background-color 160ms ease, color 160ms ease",

                "&:hover": {
                  backgroundColor: "action.hover",
                  color: "primary.main",
                },
              }}
            >
              <Badge
                badgeContent={3}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: 9,
                    fontWeight: 700,
                    minWidth: 16,
                    height: 16,
                    padding: "0 4px",
                    border: "2px solid",
                    borderColor: "background.paper",
                  },
                }}
              >
                <NotificationsNoneRoundedIcon
                  sx={{
                    fontSize: 21,
                  }}
                />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* ================================================= */}
          {/* USER ACCOUNT */}
          {/* ================================================= */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              ml: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 1.5,
              cursor: "pointer",
              border: "1px solid transparent",

              transition:
                "background-color 160ms ease, border-color 160ms ease",

              "&:hover": {
                backgroundColor: "action.hover",
                borderColor: "divider",
              },
            }}
          >
            {/* Avatar */}

            <Avatar
              sx={{
                width: 34,
                height: 34,

                // Centralized theme color
                backgroundColor: "primary.main",
                color: "primary.contrastText",

                fontSize: 12,
                fontWeight: 700,

                boxShadow: 1,
              }}
            >
              M
            </Avatar>

            {/* User information */}

            <Box
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },

                minWidth: 82,
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "text.primary",
                  lineHeight: 1.3,
                }}
              >
                Manager
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 400,
                  color: "text.secondary",
                  lineHeight: 1.3,
                  mt: 0.15,
                }}
              >
                Administrator
              </Typography>
            </Box>

            {/* Dropdown */}

            <KeyboardArrowDownRoundedIcon
              sx={{
                fontSize: 18,
                color: "text.secondary",
                ml: 0.15,
              }}
            />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;