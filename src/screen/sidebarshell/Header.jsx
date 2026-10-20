import { useLocation, useNavigate } from "react-router-dom";

import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";

import useActingUser from "../../components/ActingUserSelect/useActingUser";
import { clearSession } from "../../configurations/session";
import navigation from "../naviagation/Navigation";

const normalize = (path) => String(path || "").toLowerCase().replace(/\/+$/, "");

const matches = (pathname, path) => {
  const current = normalize(pathname);
  const target = normalize(path);
  return Boolean(target) && (current === target || current.startsWith(`${target}/`));
};

// Section › page, from the sidebar definition.
const breadcrumbFor = (pathname) => {
  for (const section of navigation) {
    if (!section.children) {
      if (matches(pathname, section.path)) return [section.label];
      continue;
    }

    const child = section.children.find(
      (item) => matches(pathname, item.path) || (item.match || []).some((path) => matches(pathname, path))
    );

    if (child) return [section.label, child.label];
  }

  return [];
};

const initials = (name) =>
  String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

// `onMenuClick` is passed on phones, where the sidebar lives in a drawer.
function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const { me } = useActingUser();

  const navigate = useNavigate();

  const handleSignOut = () => {
    clearSession();
    navigate("/", { replace: true });
  };

  const crumbs = breadcrumbFor(pathname);
  const user = me;

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={(theme) => ({
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.brand.glass,
        backgroundImage: "none",
        backdropFilter: "blur(12px)",
        border: 0,
        borderBottom: "1px solid",
        borderColor: theme.palette.border.default,
        boxShadow: "none",
      })}
    >
      <Toolbar
        sx={(theme) => ({
          minHeight: `${theme.appShell.headerHeight}px !important`,
          px: theme.appShell.headerPaddingX,
          gap: { xs: 1, sm: 2 },
        })}
      >
        {onMenuClick && (
          <IconButton edge="start" aria-label="Open menu" onClick={onMenuClick}>
            <MenuRoundedIcon />
          </IconButton>
        )}

        {/* BREADCRUMB */}

        <Stack
          component="nav"
          aria-label="Breadcrumb"
          direction="row"
          sx={{ flex: 1, minWidth: 0, alignItems: "center", gap: 0.75 }}
        >
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;

            return (
              <Stack key={crumb} direction="row" sx={{ alignItems: "center", gap: 0.75, minWidth: 0 }}>
                {index > 0 && (
                  <ChevronRightRoundedIcon
                    fontSize="small"
                    sx={(theme) => ({ color: theme.palette.text.disabled })}
                  />
                )}
                <Typography
                  variant={last ? "subtitle2" : "body2"}
                  aria-current={last ? "page" : undefined}
                  sx={(theme) => ({
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: last ? theme.palette.text.primary : theme.palette.text.secondary,
                    display: { xs: last ? "block" : "none", sm: "block" },
                  })}
                >
                  {crumb}
                </Typography>
              </Stack>
            );
          })}
        </Stack>

        {/* ACTIONS */}

        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton
              aria-label="Notifications"
              sx={(theme) => ({
                border: "1px solid",
                borderColor: theme.palette.border.default,
                color: theme.palette.text.secondary,
                "&:hover": {
                  color: theme.palette.primary.main,
                  borderColor: alpha(theme.palette.primary.main, theme.tint.border),
                },
              })}
            >
              <NotificationsNoneRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Stack
            direction="row"
            sx={(theme) => ({
              alignItems: "center",
              gap: 1.25,
              pl: 0.5,
              pr: { xs: 0.5, sm: 1.5 },
              py: 0.5,
              borderRadius: theme.statusChip.radius,
              border: "1px solid",
              borderColor: theme.palette.border.default,
              backgroundColor: theme.palette.background.paper,
            })}
          >
            <Avatar
              sx={(theme) => ({
                width: theme.avatar.sizeSmall,
                height: theme.avatar.sizeSmall,
                ...theme.typography.caption,
                fontWeight: theme.typography.subtitle2.fontWeight,
                color: theme.palette.primary.contrastText,
                backgroundImage: theme.palette.brand.gradient,
              })}
            >
              {initials(user?.name)}
            </Avatar>

            <Box sx={{ display: { xs: "none", sm: "block" }, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap" }}>
                {user?.name || "Not signed in"}
              </Typography>
              <Typography
                variant="micro"
                component="p"
                sx={(theme) => ({ color: theme.palette.text.secondary, whiteSpace: "nowrap" })}
              >
                {user ? user.designation || "Pharmalyx workspace" : "Loading…"}
              </Typography>
            </Box>
          </Stack>

          <Tooltip title="Change password">
            <IconButton
              aria-label="Change password"
              onClick={() => navigate("/change-password")}
              sx={(theme) => ({
                border: "1px solid",
                borderColor: theme.palette.border.default,
                color: theme.palette.text.secondary,
                "&:hover": {
                  color: theme.palette.primary.main,
                  borderColor: alpha(theme.palette.primary.main, theme.tint.border),
                },
              })}
            >
              <KeyRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Sign out">
            <IconButton
              aria-label="Sign out"
              onClick={handleSignOut}
              sx={(theme) => ({
                border: "1px solid",
                borderColor: theme.palette.border.default,
                color: theme.palette.text.secondary,
                "&:hover": {
                  color: theme.palette.error.main,
                  borderColor: alpha(theme.palette.error.main, theme.tint.border),
                },
              })}
            >
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
