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

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 3 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import CheckIcon from "@mui/icons-material/Check";

function PricingPlans() {
  const [isAnnual, setIsAnnual] = useState(false);

  const planFeatures = {
    starter: [
      "1 user",
      "Access to Screen + Interview",
      "Advanced plagiarism detection",
      "2000+ questions",
      "120 attempts per year",
      "$15 per additional attempt"
    ],
    pro: [
      "Unlimited users",
      "Integrations",
      "ATS: Greenhouse, Lever, Ashby",
      "Calendar: Google & Outlook",
      "4000+ questions",
      "300 attempts per year",
      "Ability to pre-purchase additional attempts at checkout"
    ],
    enterprise: [
      "Custom users and attempts",
      "Certified assessments",
      "40+ integrations",
      "Full library of 7500+ questions",
      "Advanced user roles and permissions",
      "Test up to 100k candidates at once",
      "Designated account manager",
      "Access to Professional Services",
      "Single sign on (SSO/SCIM)",
      "Premium support"
    ]
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8} lg={8}>
            <Card>
              <MDBox p={3} lineHeight={1}>
                <MDTypography variant="h5" fontWeight="medium">
                  Choose a plan that works for you
                </MDTypography>
                <MDTypography variant="button" color="text">
                  From interns to experienced hires, evaluate skills for any developer role including:
                  software engineer, back-end, front-end, DevOps, data scientist, and QA/SDET.
                </MDTypography>
              </MDBox>

              <MDBox mx={3} my={2} display="flex" justifyContent="center">
                <MDBox display="flex" alignItems="center">
                  <MDTypography variant="button" color="text" fontWeight="regular">
                    Monthly
                  </MDTypography>
                  <Switch checked={isAnnual} onChange={() => setIsAnnual(!isAnnual)} />
                  <MDBox ml={1} mr={1}>
                    <MDTypography variant="button" color="text" fontWeight="regular">
                      Annual
                    </MDTypography>
                  </MDBox>
                  <Chip 
                    label="2 months free" 
                    color="success" 
                    size="small" 
                    variant="filled"
                    sx={{ display: isAnnual ? 'inline-flex' : 'none' }}
                  />
                </MDBox>
              </MDBox>

              <MDBox px={3}>
                <Grid container spacing={3}>
                  {/* Starter Plan */}
                  <Grid item xs={12} md={4}>
                    <Card>
                      <MDBox p={3} textAlign="center">
                        <MDTypography variant="h6" fontWeight="medium">
                          Starter
                        </MDTypography>
                        <MDBox my={2}>
                          <MDTypography variant="h3" fontWeight="bold">
                            ${isAnnual ? "165" : "119"}/mo
                          </MDTypography>
                          {isAnnual && (
                            <MDTypography variant="caption" color="text">
                              $1,990 billed annually
                            </MDTypography>
                          )}
                        </MDBox>
                        <MDTypography variant="body2" color="text">
                          The basics to start hiring:
                        </MDTypography>
                        <MDBox my={2}>
                          {planFeatures.starter.map((feature, index) => (
                            <MDBox key={index} display="flex" alignItems="center" pb={1}>
                              <CheckIcon color="success" fontSize="small" />
                              <MDTypography variant="button" color="text" fontWeight="regular" ml={1}>
                                {feature}
                              </MDTypography>
                            </MDBox>
                          ))}
                        </MDBox>
                        <MDButton variant="gradient" color="dark" fullWidth>
                          Buy Now
                        </MDButton>
                      </MDBox>
                    </Card>
                  </Grid>

                  {/* Pro Plan */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ backgroundColor: "#061836", color: "white" }}>
                      <MDBox p={3} textAlign="center">
                        <MDTypography variant="h6" fontWeight="medium" color="white">
                          Pro
                        </MDTypography>
                        <MDBox my={2}>
                          <MDTypography variant="h3" fontWeight="bold" color="white">
                            ${isAnnual ? "375" : "249"}/mo
                          </MDTypography>
                          {isAnnual && (
                            <MDTypography variant="caption" color="white">
                              $4,490 billed annually
                            </MDTypography>
                          )}
                        </MDBox>
                        <MDTypography variant="body2" color="white">
                          Everything in Starter plus:
                        </MDTypography>
                        <MDBox my={2}>
                          {planFeatures.pro.map((feature, index) => (
                            <MDBox key={index} display="flex" alignItems="center" pb={1}>
                              <CheckIcon sx={{ color: "#00e676" }} fontSize="small" />
                              <MDTypography variant="button" color="white" fontWeight="regular" ml={1}>
                                {feature}
                              </MDTypography>
                            </MDBox>
                          ))}
                        </MDBox>
                        <MDButton variant="contained" color="success" fullWidth>
                          Buy Now
                        </MDButton>
                      </MDBox>
                    </Card>
                  </Grid>

                  {/* Enterprise Plan */}
                  <Grid item xs={12} md={4}>
                    <Card>
                      <MDBox p={3} textAlign="center">
                        <MDTypography variant="h6" fontWeight="medium">
                          Enterprise
                        </MDTypography>
                        <MDBox my={2}>
                          <MDTypography variant="h3" fontWeight="bold">
                            Custom Pricing
                          </MDTypography>
                        </MDBox>
                        <MDTypography variant="body2" color="text">
                          Custom users and attempts
                        </MDTypography>
                        <MDBox my={2}>
                          {planFeatures.enterprise.map((feature, index) => (
                            <MDBox key={index} display="flex" alignItems="center" pb={1}>
                              <CheckIcon color="success" fontSize="small" />
                              <MDTypography variant="button" color="text" fontWeight="regular" ml={1}>
                                {feature}
                              </MDTypography>
                            </MDBox>
                          ))}
                        </MDBox>
                        <MDButton variant="gradient" color="dark" fullWidth>
                          Contact Us
                        </MDButton>
                      </MDBox>
                    </Card>
                  </Grid>
                </Grid>
              </MDBox>

              <MDBox p={3} mt={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <MDBox p={3}>
                        <MDTypography variant="h6" fontWeight="medium">
                          Features Comparison
                        </MDTypography>
                        <MDBox mt={3}>
                          <Grid container spacing={1}>
                            <Grid item xs={3}>
                              <MDTypography variant="button" fontWeight="bold">
                                Features
                              </MDTypography>
                            </Grid>
                            <Grid item xs={3}>
                              <MDTypography variant="button" fontWeight="bold">
                                Starter
                              </MDTypography>
                            </Grid>
                            <Grid item xs={3}>
                              <MDTypography variant="button" fontWeight="bold">
                                Professional
                              </MDTypography>
                            </Grid>
                            <Grid item xs={3}>
                              <MDTypography variant="button" fontWeight="bold">
                                Enterprise
                              </MDTypography>
                            </Grid>
                          </Grid>
                          <Divider />
                          
                          {/* Price */}
                          <Grid container spacing={1} mt={1}>
                            <Grid item xs={3}>
                              <MDTypography variant="button">Price</MDTypography>
                            </Grid>
                            <Grid item xs={3}>
                              <MDTypography variant="button">$119/mo</MDTypography>
                            </Grid>
                            <Grid item xs={3}>
                              <MDTypography variant="button">$249/mo</MDTypography>
                            </Grid>
                            <Grid item xs={3}>
                              <MDTypography variant="button">Custom Pricing</MDTypography>
                            </Grid>
                          </Grid>
                          
                          {/* Candidate Limit */}
                          <Grid container spacing={1} mt={1}>
                            <Grid item xs={3}>
                              <MDTypography variant="button">Candidate Limit</MDTypography>
                            </Grid>
                            <Grid item xs={3}>
                              <MDTypography variant="button">Up to 10</MDTypography>
                            </Grid>
                            <Grid item xs={3}>
                              <MDTypography variant="button">Up to 50</MDTypography>
                            </Grid>
                            <Grid item xs={3}>
                              <MDTypography variant="button">Custom candidates</MDTypography>
                            </Grid>
                          </Grid>
                          
                          {/* Screening attempts */}
                          <Grid container spacing={1} mt={1}>
                            <Grid item xs={3}>
                              <MDTypography variant="button">Screening attempts</MDTypography>
                            </Grid>
                            <Grid item xs={3}>
                              <MDTypography variant="button">200 per year</MDTypography>
                            </Grid>
                            <Grid item xs={3}>
                              <MDTypography variant="button">500 per year</MDTypography>
                            </Grid>
                            <Grid item xs={3}>
                              <MDTypography variant="button">Custom attempts</MDTypography>
                            </Grid>
                          </Grid>
                          
                          {/* Other features */}
                          {[
                            {
                              name: "Automated Question Generation",
                              starter: true,
                              pro: true,
                              enterprise: "✅ (with customization)"
                            },
                            {
                              name: "Live Coding Environment",
                              starter: "✅ (basic)",
                              pro: true,
                              enterprise: "✅ (multi-language support + AI review)"
                            },
                            {
                              name: "Google Calendar Integration",
                              starter: true,
                              pro: true,
                              enterprise: true
                            },
                            {
                              name: "Real-Time Transcription",
                              starter: false,
                              pro: true,
                              enterprise: true
                            },
                            {
                              name: "Interview Recording & Replay",
                              starter: true,
                              pro: true,
                              enterprise: true
                            },
                            {
                              name: "Custom Branding",
                              starter: false,
                              pro: true,
                              enterprise: true
                            },
                            {
                              name: "ATS Integration",
                              starter: false,
                              pro: true,
                              enterprise: "✅ (custom API access)"
                            },
                            {
                              name: "Dedicated Support",
                              starter: "Email only",
                              pro: "Priority email/chat",
                              enterprise: "Dedicated account manager"
                            },
                            {
                              name: "Reporting & Scorecards",
                              starter: "Basic",
                              pro: "Advanced",
                              enterprise: "Fully customizable"
                            },
                            {
                              name: "Data Encryption & Compliance",
                              starter: true,
                              pro: true,
                              enterprise: "✅ (SOC 2 / GDPR ready)"
                            }
                          ].map((feature, index) => (
                            <Grid container spacing={1} mt={1} key={index}>
                              <Grid item xs={3}>
                                <MDTypography variant="button">{feature.name}</MDTypography>
                              </Grid>
                              <Grid item xs={3}>
                                <MDTypography variant="button">
                                  {typeof feature.starter === 'boolean' 
                                    ? (feature.starter ? "✅" : "❌") 
                                    : feature.starter}
                                </MDTypography>
                              </Grid>
                              <Grid item xs={3}>
                                <MDTypography variant="button">
                                  {typeof feature.pro === 'boolean' 
                                    ? (feature.pro ? "✅" : "❌") 
                                    : feature.pro}
                                </MDTypography>
                              </Grid>
                              <Grid item xs={3}>
                                <MDTypography variant="button">
                                  {typeof feature.enterprise === 'boolean' 
                                    ? (feature.enterprise ? "✅" : "❌") 
                                    : feature.enterprise}
                                </MDTypography>
                              </Grid>
                            </Grid>
                          ))}
                        </MDBox>
                      </MDBox>
                    </Card>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PricingPlans;