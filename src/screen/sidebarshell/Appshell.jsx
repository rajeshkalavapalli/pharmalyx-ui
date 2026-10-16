import { useEffect, useState } from "react";

import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

function AppShell() {
  const theme = useTheme();
  const { pathname } = useLocation();

  // Phones: the sidebar moves into a slide-in drawer to free the full width.
  const isPhone = useMediaQuery(theme.breakpoints.down("sm"));
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, isPhone]);

  return (
    <Box
      sx={(theme) => ({
        height: "100dvh",
        display: "flex",
        overflow: "hidden",
        backgroundColor: theme.palette.background.default,
      })}
    >
      {isPhone ? (
        <Drawer
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          slotProps={{
            paper: {
              sx: (theme) => ({
                width: theme.sidebarLayout.width,
                maxWidth: theme.appShell.drawerMaxWidth,
                backgroundColor: theme.palette.sidebar.background,
              }),
            },
          }}
        >
          <Sidebar mobile onClose={() => setMenuOpen(false)} />
        </Drawer>
      ) : (
        <Sidebar />
      )}

      <Box
        sx={(theme) => ({
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.palette.background.default,
        })}
      >
        <Header onMenuClick={isPhone ? () => setMenuOpen(true) : undefined} />

        <Box
          component="main"
          sx={(theme) => ({
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            backgroundColor: theme.palette.background.default,
            p: theme.appShell.contentPadding,
          })}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AppShell;
