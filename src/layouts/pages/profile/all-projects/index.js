import { useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 3 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

function AllProjects() {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const navigate = useNavigate();
  
  const handleViewDetails = (screeningId) => {
    navigate(`/screening/${screeningId}`);
  };

  // Tag color mapping
  const getTagColor = (tag) => {
    switch(tag) {
      case "Technical":
        return { bgColor: "#e3f2fd", textColor: "#0277bd" };
      case "Behavior":
        return { bgColor: "#fce4ec", textColor: "#c2185b" };
      case "Coding":
        return { bgColor: "#e8f5e9", textColor: "#2e7d32" };
      default:
        return { bgColor: "#f5f5f5", textColor: "#616161" };
    }
  };

  const screenings = [
    {
      id: "scr-001",
      title: "Java Developer",
      candidateName: "Jerry Wang",
      duration: "60 mins",
      expireTime: "2025-12-31 12:00 PM EST",
      tags: ["Technical", "Behavior", "Coding"]
    },
    {
      id: "scr-002",
      title: "Java Developer",
      candidateName: "Jerry Wang",
      duration: "60 mins",
      expireTime: "2025-12-31 12:00 PM EST",
      tags: ["Technical", "Behavior", "Coding"]
    },
    {
      id: "scr-003",
      title: "Java Developer",
      candidateName: "Jerry Wang",
      duration: "60 mins",
      expireTime: "2025-12-31 12:00 PM EST",
      tags: ["Technical", "Behavior", "Coding"]
    },
    {
      id: "scr-004",
      title: "Java Developer",
      candidateName: "Jerry Wang",
      duration: "60 mins",
      expireTime: "2025-12-31 12:00 PM EST",
      tags: ["Technical", "Behavior", "Coding"]
    }
  ];

  return (
    <DashboardLayout>
      <MDBox width="calc(100% - 48px)" position="absolute" top="1.75rem">
        <DashboardNavbar light absolute />
      </MDBox>
      <Header />
      <MDBox>
        <Grid container alignItems="center">
          <Grid item xs={12} md={7}>
            <MDBox mb={1}>
              <MDTypography variant="h5">All Screenings</MDTypography>
            </MDBox>
            <MDBox mb={2}>
              <MDTypography variant="body2" color="text">
                Here are all the screenings that you have created. You can add new screenings by
                clicking the button below.
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={5} sx={{ textAlign: "right" }}>
            <MDButton variant="gradient" color="info">
              <Icon>add</Icon>&nbsp; Add New
            </MDButton>
          </Grid>
        </Grid>
      </MDBox>
      <MDBox pt={3} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDBox mt={5}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                sx={{ mb: 3 }}
              >
                <Tab label="Upcoming" />
                <Tab label="Completed" />
                <Tab label="Expired" />
              </Tabs>

              <MDBox>
                {screenings.map((screening, index) => (
                  <Card key={index} sx={{ mb: 2, overflow: "visible" }}>
                    <CardContent>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} md={8}>
                          <MDBox>
                            <MDTypography variant="h6" fontWeight="medium">
                              Job Title: {screening.title}
                            </MDTypography>
                            <MDTypography variant="body2" color="text">
                              Candidate Name: {screening.candidateName}
                            </MDTypography>
                            <MDTypography variant="body2" color="text">
                              Duration: {screening.duration}
                            </MDTypography>
                          </MDBox>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <MDTypography variant="body2" color="text">
                            Expire time: {screening.expireTime}
                          </MDTypography>
                          <MDBox display="flex" mt={1} flexWrap="wrap" gap={1}>
                            {screening.tags.map((tag, idx) => {
                              const { bgColor, textColor } = getTagColor(tag);
                              return (
                                <MDBox
                                  key={idx}
                                  px={1.5}
                                  py={0.4}
                                  borderRadius="lg"
                                  sx={{
                                    backgroundColor: bgColor,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                  }}
                                >
                                  <MDTypography
                                    variant="caption"
                                    fontWeight="medium"
                                    sx={{ color: textColor }}
                                  >
                                    {tag}
                                  </MDTypography>
                                </MDBox>
                              );
                            })}
                          </MDBox>
                        </Grid>
                        <Grid item xs={12} md={1} sx={{ display: "flex", justifyContent: "flex-end" }}>
                          <MDButton 
                            variant="outlined" 
                            color="info" 
                            size="small"
                            onClick={() => handleViewDetails(screening.id)}
                          >
                            Details
                          </MDButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </MDBox>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AllProjects;