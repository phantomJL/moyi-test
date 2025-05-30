/**
=========================================================
* Material Dashboard 3 PRO React - v2.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2024 Moyi Tech (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";

// Material Dashboard 3 PRO React examples
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 3 PRO React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 3 PRO React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 3 PRO React routes
import routes from "routes";

// Material Dashboard 3 PRO React contexts
import {
  setLayout,
  useMaterialUIController,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";
import { AuthProvider } from "context/AuthContext";

// Authentication components
import ProtectedRoute from "components/Authentication/ProtectedRoute";

// Auth pages
import SignInCover from "layouts/authentication/sign-in/cover";
import SignUpCover from "layouts/authentication/sign-up/cover";
import ResetCover from "layouts/authentication/reset-password/cover";

// Other pages
import ScreeningDetail from "layouts/pages/screenings/components/UpcomingScreening/ScreeningDetail";
import AIInterview from "layouts/pages/ai-interview";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () =>
    setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    // Check if it's an interview path
    const isInterviewPath = pathname.startsWith('/interview/');
    
    if (isInterviewPath) {
      // Set layout to 'minimal' for interview pages
      setLayout(dispatch, 'minimal');
    } else if (!pathname.includes('/authentication/')) {
      // Set layout back to dashboard for regular pages
      setLayout(dispatch, 'dashboard');
    }
  }, [pathname, dispatch]);
  

  // Helper function to wrap routes with ProtectedRoute
  const getProtectedRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getProtectedRoutes(route.collapse);
      }
      if (route.route) {
        // Skip authentication for auth-related routes
        if (route.route.includes('/authentication/')) {
          return (
            <Route
              exact
              path={route.route}
              element={route.component}
              key={route.key}
            />
          );
        }
        // Protect all other routes
        return (
          <Route
            exact
            path={route.route}
            element={<ProtectedRoute>{route.component}</ProtectedRoute>}
            key={route.key}
          />
        );
      }

      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  // Regular app with authentication for non-interview routes
  return (
    <AuthProvider>
      {direction === "rtl" ? (
        <CacheProvider value={rtlCache}>
          <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
            <CssBaseline />
            {layout === "dashboard" && (
              <>
                <Sidenav
                  color={sidenavColor}
                  brand={
                    (transparentSidenav && !darkMode) || whiteSidenav
                      ? brandDark
                      : brandWhite
                  }
                  brandName="Moyi Tech"
                  routes={routes}
                  onMouseEnter={handleOnMouseEnter}
                  onMouseLeave={handleOnMouseLeave}
                />
                <Configurator />
                {configsButton}
              </>
            )}
            {layout === "vr" && <Configurator />}
            <Routes>
              {/* Auth routes (not protected) */}
              <Route path="/authentication/sign-in/cover" element={<SignInCover />} />
              <Route path="/authentication/sign-up/cover" element={<SignUpCover />} />
              <Route path="/authentication/reset-password/cover" element={<ResetCover />} />
              
              {/* Protected routes */}
              {getProtectedRoutes(routes)}
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/authentication/sign-in/cover" />} />
            </Routes>
          </ThemeProvider>
        </CacheProvider>
      ) : (
        <ThemeProvider theme={darkMode ? themeDark : theme}>
          <CssBaseline />
          {layout === "dashboard" && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={
                  (transparentSidenav && !darkMode) || whiteSidenav
                    ? brandDark
                    : brandWhite
                }
                brandName="Moyi Tech"
                routes={routes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
              <Configurator />
              {configsButton}
            </>
          )}
          {layout === "vr" && <Configurator />}
          <Routes>
            {/* Auth routes (not protected) */}
            <Route path="/authentication/sign-in/cover" element={<SignInCover />} />
            <Route path="/authentication/sign-up/cover" element={<SignUpCover />} />
            <Route path="/authentication/reset-password/cover" element={<ResetCover />} />

            {/* Protected routes */}
            {getProtectedRoutes(routes)}
            <Route 
              path="/interview/:interviewId/:meetingCreateToken" 
              element={<AIInterview isDirectAccess={true} />} 
            />
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/authentication/sign-in/cover" />} />
          </Routes>
        </ThemeProvider>
      )}
    </AuthProvider>
  );
}