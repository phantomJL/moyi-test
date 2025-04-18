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
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDAlert from "components/MDAlert";

// Material Dashboard 3 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function CompanySettings() {
  // Company Info state
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "Moyi-Tech",
    inviteAs: "Moyi-Tech Hiring Team",
    logo: null,
    logoPreview: null
  });
  
  // Success state for save operation
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo({
      ...companyInfo,
      [name]: value
    });
  };
  
  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Check file size (max 800kb)
      if (file.size > 800 * 1024) {
        alert("File size exceeds 800kb limit");
        return;
      }
      
      // Create file preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setCompanyInfo({
          ...companyInfo,
          logo: file,
          logoPreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle save
  const handleSave = (e) => {
    e.preventDefault();
    
    // Here you would typically send the data to your backend
    // For this example, we'll just show a success message
    
    setSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };
  
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            
            {saveSuccess && (
              <MDAlert color="success" dismissible>
                Company settings saved successfully.
              </MDAlert>
            )}
            
            <Card>
              <MDBox p={3}>
                <MDBox component="form" mt={4} onSubmit={handleSave}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <MDTypography variant="h6" fontWeight="medium">
                        Company Logo
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        SVG or PNG file. Max size of 800kb
                      </MDTypography>
                      
                      <MDBox mt={2} display="flex" alignItems="center">
                        <MDBox
                          width="100px"
                          height="100px"
                          border="1px dashed #ccc"
                          borderRadius="lg"
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          overflow="hidden"
                          position="relative"
                        >
                          {companyInfo.logoPreview ? (
                            <img 
                              src={companyInfo.logoPreview} 
                              alt="Company Logo" 
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <Icon fontSize="large" color="disabled">image</Icon>
                          )}
                        </MDBox>
                        
                        <MDBox ml={2}>
                          <MDButton
                            variant="contained"
                            color="info"
                            size="small"
                            component="label"
                          >
                            Upload
                            <input
                              type="file"
                              hidden
                              accept="image/svg+xml,image/png"
                              onChange={handleLogoUpload}
                            />
                          </MDButton>
                        </MDBox>
                      </MDBox>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <MDTypography variant="h6" fontWeight="medium">
                        Company Details
                      </MDTypography>
                      
                      <Grid container spacing={2} mt={1}>
                        <Grid item xs={12}>
                          <MDBox mb={2}>
                            <MDTypography variant="button" fontWeight="regular" mb={1}>
                              Company Name
                            </MDTypography>
                            <MDInput
                              type="text"
                              name="companyName"
                              value={companyInfo.companyName}
                              onChange={handleChange}
                              fullWidth
                            />
                          </MDBox>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <MDBox mb={2}>
                            <MDTypography variant="button" fontWeight="regular" mb={1}>
                              Send Invites As
                            </MDTypography>
                            <MDInput
                              type="text"
                              name="inviteAs"
                              value={companyInfo.inviteAs}
                              onChange={handleChange}
                              fullWidth
                              placeholder="e.g. Company Name Hiring Team"
                            />
                            <MDTypography variant="caption" color="text">
                              This name will appear as the sender when inviting candidates to interviews
                            </MDTypography>
                          </MDBox>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <MDBox mt={4} display="flex" justifyContent="flex-end">
                    <MDButton variant="contained" color="info" type="submit">
                      Save
                    </MDButton>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CompanySettings;