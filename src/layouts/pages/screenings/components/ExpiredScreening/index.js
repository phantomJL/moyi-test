import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 3 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ExpiredScreeningDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Sample data for the screening
  const screeningData = {
    id: id,
    jobTitle: "Java Developer",
    candidateName: "Jerry Wang",
    expireTime: "2025-12-31 12:00 PM",
    duration: "60 mins",
    jobDescription: "We are looking for an experienced Java Developer to join our team. The ideal candidate should have strong Java programming skills, experience with Spring Framework, and knowledge of microservices architecture. The candidate should also have excellent communication skills and be able to work well in a team environment.",
    questions: [
      { id: 1, question: "Question 1", type: "Technical", duration: "3 mins", coding: false },
      { id: 2, question: "Question 2", type: "Behavior", duration: "3 mins", coding: false },
      { id: 3, question: "Question 3", type: "Coding", duration: "3 mins", coding: true },
      { id: 4, question: "Question 4", type: "Scenario", duration: "5 mins", coding: false },
    ],
    techTags: ["Java", "Kafka", "Redis"]
  };

  const handleReopenScreening = () => {
    alert(`Reopening screening: ${id}`);
  };

  const handleDeleteScreening = () => {
    if (window.confirm("Are you sure you want to delete this screening?")) {
      alert(`Deleting screening: ${id}`);
      navigate("/screenings/all-screenings"); 
    }
  };

  const handleBack = () => {
    navigate("/screenings/all-screenings");
  };

  return (
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
              <MDBox>
                <MDBox mb={4} display="flex" justifyContent="space-between" alignItems="center">
                  <MDBox>
                    <MDTypography variant="h5" fontWeight="medium">
                      Screening Detail
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      ID: {id}
                    </MDTypography>
                  </MDBox>
                  <MDButton 
                    variant="outlined"
                    color="info"
                    onClick={handleBack}
                    startIcon={<Icon>arrow_back</Icon>}
                  >
                    Back to List
                  </MDButton>
                </MDBox>
                
                <Grid container spacing={3}>
                  {/* Basic Info Section */}
                  <Grid item xs={12} md={6}>
                    <MDBox mb={2}>
                      <MDTypography variant="h6" fontWeight="medium">
                        Job Title: {screeningData.jobTitle}
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                      <MDTypography variant="body2">
                        Candidate Name: {screeningData.candidateName}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <MDBox mb={2} display="flex" alignItems="center">
                      <MDTypography variant="body2" mr={1}>
                        Expire time:
                      </MDTypography>
                      <MDInput
                        type="text"
                        value={screeningData.expireTime}
                        disabled
                        sx={{ width: '200px' }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton edge="end">
                                <Icon>calendar_today</Icon>
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </MDBox>
                    <MDBox mb={2}>
                      <MDTypography variant="body2">
                        Duration: {screeningData.duration}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  
                  {/* Job Description */}
                  <Grid item xs={12}>
                    <MDBox mb={3}>
                      <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                        Job Description:
                      </MDTypography>
                      <MDBox 
                        p={2} 
                        border="1px solid #eee" 
                        borderRadius="md"
                        sx={{ backgroundColor: "#f8f9fa" }}
                      >
                        <MDTypography variant="body2" color="text">
                          {screeningData.jobDescription}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Grid>
                  
                  {/* Tech Tags */}
                  <Grid item xs={12}>
                    <MDBox mb={3} display="flex" flexWrap="wrap" gap={1}>
                      {screeningData.techTags.map((tag, idx) => (
                        <MDBox
                          key={idx}
                          px={2}
                          py={0.5}
                          borderRadius="xl"
                          bgcolor="#f0f0f0"
                          display="inline-flex"
                        >
                          <MDTypography variant="caption" fontWeight="medium">
                            {tag}
                          </MDTypography>
                        </MDBox>
                      ))}
                    </MDBox>
                  </Grid>
                  
                  {/* Screening Questions */}
                  <Grid item xs={12}>
                    <MDBox mb={3}>
                      <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
                        Screening Questions (Editable table):
                      </MDTypography>
                      
                      <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                          <TableHead>
                            <TableRow>
                              <TableCell>Screening Question*</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Duration</TableCell>
                              <TableCell>Coding</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {screeningData.questions.map((question) => (
                              <TableRow key={question.id}>
                                <TableCell>{question.question}</TableCell>
                                <TableCell>{question.type}</TableCell>
                                <TableCell>{question.duration}</TableCell>
                                <TableCell>
                                  <Checkbox 
                                    checked={question.coding}
                                    disabled
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </MDBox>
                  </Grid>
                  
                  {/* Action Buttons */}
                  <Grid item xs={12}>
                    <MDBox display="flex" justifyContent="space-between" mt={4}>
                      <MDButton 
                        variant="outlined" 
                        color="error"
                        onClick={handleDeleteScreening}
                      >
                        Delete Screenings
                      </MDButton>
                      
                      <MDButton 
                        variant="gradient" 
                        color="info"
                        onClick={handleReopenScreening}
                      >
                        Reopen Screenings
                      </MDButton>
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>
          </Grid>
        </Grid>
      </MDBox>
  );
}

export default ExpiredScreeningDetail;