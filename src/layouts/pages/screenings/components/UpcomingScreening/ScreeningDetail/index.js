import { useState } from "react";

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
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 3 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ScreeningDetail() {
  // Sample data for the screening
  const screeningData = {
    jobTitle: "Java Developer",
    candidateName: "Jerry Wang",
    expireTime: "2025-12-31 12:00 PM",
    duration: "60 mins",
    jobDescription: "We are looking for an experienced Java Developer to join our team. The ideal candidate should have strong Java programming skills, experience with Spring Framework, and knowledge of microservices architecture. The candidate should also have excellent communication skills and be able to work well in a team environment.",
    questions: [
      { id: 1, question: "Question 1", type: "Technical", duration: "3 mins", completed: false },
      { id: 2, question: "Question 2", type: "Behavior", duration: "3 mins", completed: false },
      { id: 3, question: "Question 3", type: "Coding", duration: "3 mins", completed: true },
      { id: 4, question: "Question 4", type: "Scenario", duration: "6 mins", completed: false },
    ]
  };

  const [questions, setQuestions] = useState(screeningData.questions);
  const [newQuestion, setNewQuestion] = useState("");
  
  const handleQuestionCheck = (id) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, completed: !q.completed } : q
    ));
  };
  
  const handleDeleteScreening = () => {
    if (window.confirm("Are you sure you want to delete this screening?")) {
      alert("Screening deleted");
      // Redirect logic would go here
    }
  };
  
  const handleRegenerate = () => {
    alert("Screening regenerated");
    // Regeneration logic would go here
  };

  return (
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
              <MDBox>
                
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
                    <MDBox mb={2}>
                      <MDTypography variant="body2">
                        Expire time: {screeningData.expireTime}
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                      <MDTypography variant="body2">
                        Duration: {screeningData.duration}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  
                  {/* Job Description */}
                  <Grid item xs={12}>
                    <MDBox mb={2}>
                      <MDTypography variant="subtitle2" fontWeight="medium">
                        Job Description:
                      </MDTypography>
                      <MDBox mt={1}>
                        <MDTypography variant="body2" color="text">
                          {screeningData.jobDescription}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Grid>
                  
                  {/* Screening Questions */}
                  <Grid item xs={12}>
                    <MDBox mb={2}>
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
                            {questions.map((question) => (
                              <TableRow key={question.id}>
                                <TableCell>
                                  {question.question}
                                </TableCell>
                                <TableCell>{question.type}</TableCell>
                                <TableCell>{question.duration}</TableCell>
                                <TableCell>
                                  <Checkbox 
                                    checked={question.completed}
                                    onChange={() => handleQuestionCheck(question.id)}
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
                        Delete Screening
                      </MDButton>
                      
                      <MDButton 
                        variant="gradient" 
                        color="info"
                        onClick={handleRegenerate}
                      >
                        Re-generate Screening
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

export default ScreeningDetail;