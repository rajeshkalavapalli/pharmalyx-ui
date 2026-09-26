import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

function AppShell() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <Sidebar />

      {/* ================================================= */}
      {/* APPLICATION AREA */}
      {/* ================================================= */}

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.default",
        }}
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <Header />

        {/* ================================================= */}
        {/* MAIN WORKSPACE */}
        {/* ================================================= */}

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            backgroundColor: "background.default",

            p: {
              xs: 2,
              sm: 2.5,
              md: 3,
              lg: 3.5,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AppShell;