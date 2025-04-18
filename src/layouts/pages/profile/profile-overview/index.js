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

import { useState } from "react";
import { Link } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 3 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Sample avatar image
import teamImage from "assets/images/team-3.jpg";

function MyProfile() {
  // User profile data
  const profileData = {
    name: "Mark Wang",
    email: "mark.wang@moyi-tech.org",
    role: "Admin",
    company: "Moyi-Tech",
    location: "Jersey City, NJ",
    timeZone: "(-04:00) America/New_York",
    contactNumber: "+1 (201) 555-1234",
    plan: "Starter Plan",
    planExpiry: "May 21, 2024",
    joinDate: "January 15, 2023"
  };
  
  // User stats
  const userStats = [
    {
      icon: "person_add",
      title: "Candidates",
      value: "23"
    },
    {
      icon: "event",
      title: "Screenings",
      value: "36"
    },
    {
      icon: "check_circle",
      title: "Completed",
      value: "28"
    },
    {
      icon: "schedule",
      title: "Pending",
      value: "8"
    }
  ];
  
  // Recent activity
  const recentActivity = [
    {
      action: "Created new screening",
      subject: "Java Developer",
      time: "2 hours ago"
    },
    {
      action: "Reviewed candidate",
      subject: "Jerry Wang",
      time: "1 day ago"
    },
    {
      action: "Updated company info",
      subject: "",
      time: "3 days ago"
    },
    {
      action: "Created new candidate",
      subject: "Christina Jiang",
      time: "1 week ago"
    }
  ];
  
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* Profile Overview Card */}
          <Grid item xs={12} md={4} xl={3}>
            <Card sx={{ height: '100%' }}>
              <MDBox 
                p={3} 
                textAlign="center"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <MDAvatar
                  src={teamImage}
                  alt={profileData.name}
                  size="xxl"
                  shadow="md"
                  sx={{ mb: 2 }}
                />
                <MDTypography variant="h5" fontWeight="medium">
                  {profileData.name}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  {profileData.role} at {profileData.company}
                </MDTypography>
                <MDBox mt={2} mb={2}>
                  <MDButton
                    component={Link}
                    to="/account/settings"
                    variant="gradient"
                    color="info"
                    size="small"
                  >
                    Edit Profile
                  </MDButton>
                </MDBox>
                <Divider />
                <MDBox mt={2} px={2} width="100%">
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <MDBox 
                        display="flex" 
                        alignItems="center"
                        mb={1}
                      >
                        <Icon fontSize="small" color="info" sx={{ mr: 1 }}>email</Icon>
                        <MDTypography variant="button" fontWeight="regular">
                          {profileData.email}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12}>
                      <MDBox 
                        display="flex" 
                        alignItems="center"
                        mb={1}
                      >
                        <Icon fontSize="small" color="info" sx={{ mr: 1 }}>phone</Icon>
                        <MDTypography variant="button" fontWeight="regular">
                          {profileData.contactNumber}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12}>
                      <MDBox 
                        display="flex" 
                        alignItems="center"
                        mb={1}
                      >
                        <Icon fontSize="small" color="info" sx={{ mr: 1 }}>location_on</Icon>
                        <MDTypography variant="button" fontWeight="regular">
                          {profileData.location}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12}>
                      <MDBox 
                        display="flex" 
                        alignItems="center"
                        mb={1}
                      >
                        <Icon fontSize="small" color="info" sx={{ mr: 1 }}>schedule</Icon>
                        <MDTypography variant="button" fontWeight="regular">
                          {profileData.timeZone}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              </MDBox>
              <Divider />
              <MDBox p={2}>
                <MDTypography variant="button" color="text" fontWeight="regular">
                  Member since {profileData.joinDate}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          
          {/* Main Content */}
          <Grid item xs={12} md={8} xl={9}>
            <Grid container spacing={3}>
              {/* Subscription Info */}
              <Grid item xs={12}>
                <Card>
                  <MDBox 
                    p={3} 
                    display="flex" 
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between" 
                    alignItems={{ sm: 'center' }}
                  >
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="medium">
                        Subscription Plan
                      </MDTypography>
                      <MDTypography variant="body2" color="text" mt={0.5}>
                        Current Plan: <strong>{profileData.plan}</strong>
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Expires on: <strong>{profileData.planExpiry}</strong>
                      </MDTypography>
                    </MDBox>
                    <MDBox 
                      mt={{ xs: 2, sm: 0 }}
                      display="flex"
                      gap={1}
                    >
                      <MDButton
                        component={Link}
                        to="/account/billing"
                        variant="outlined"
                        color="info"
                        size="small"
                      >
                        Manage Billing
                      </MDButton>
                      <MDButton
                        component={Link}
                        to="/account/pricing"
                        variant="gradient"
                        color="info"
                        size="small"
                      >
                        Upgrade Plan
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
              
              {/* User Stats */}
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Usage Statistics
                    </MDTypography>
                    <Grid container spacing={3}>
                      {userStats.map((stat, index) => (
                        <Grid item xs={6} md={3} key={index}>
                          <MDBox 
                            p={2} 
                            textAlign="center" 
                            bgcolor="grey.100"
                            borderRadius="lg"
                          >
                            <MDBox 
                              display="flex" 
                              justifyContent="center" 
                              alignItems="center"
                              color="info"
                              mb={1}
                            >
                              <Icon>{stat.icon}</Icon>
                            </MDBox>
                            <MDTypography variant="h4" fontWeight="medium">
                              {stat.value}
                            </MDTypography>
                            <MDTypography variant="button" color="text">
                              {stat.title}
                            </MDTypography>
                          </MDBox>
                        </Grid>
                      ))}
                    </Grid>
                  </MDBox>
                </Card>
              </Grid>
              
              {/* Recent Activity */}
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDBox 
                      display="flex" 
                      justifyContent="space-between" 
                      alignItems="center"
                      mb={2}
                    >
                      <MDTypography variant="h6" fontWeight="medium">
                        Recent Activity
                      </MDTypography>
                      <MDButton 
                        variant="text" 
                        color="info"
                        size="small"
                      >
                        View All
                      </MDButton>
                    </MDBox>
                    <Divider />
                    {recentActivity.map((activity, index) => (
                      <MDBox key={index}>
                        <MDBox 
                          py={2} 
                          display="flex" 
                          alignItems="center"
                        >
                          <MDBox 
                            mr={2} 
                            width="40px" 
                            height="40px" 
                            borderRadius="50%" 
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            bgcolor="grey.200"
                          >
                            <Icon color="info">
                              {activity.action.includes("screening") 
                                ? "video_call" 
                                : activity.action.includes("candidate") 
                                  ? "person" 
                                  : activity.action.includes("company") 
                                    ? "business" 
                                    : "event_note"}
                            </Icon>
                          </MDBox>
                          <MDBox>
                            <MDTypography variant="button" fontWeight="medium" display="block">
                              {activity.action}
                              {activity.subject && (
                                <MDTypography 
                                  variant="button" 
                                  fontWeight="regular" 
                                  color="text" 
                                  component="span"
                                  ml={0.5}
                                >
                                  - {activity.subject}
                                </MDTypography>
                              )}
                            </MDTypography>
                            <MDTypography variant="caption" color="text">
                              {activity.time}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                        {index < recentActivity.length - 1 && <Divider />}
                      </MDBox>
                    ))}
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default MyProfile;