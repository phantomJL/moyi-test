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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 3 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function ScreeningReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCloseWindow = () => {
    navigate(-1); // Go back to previous page
  };

  // Mock data for the screening report
  const reportData = {
    jobTitle: "Java Developer",
    candidateName: "Jerry Wang",
    expireTime: "2025-12-31 12:00 PM",
    duration: "60 mins",
    questionNumber: "10",
    screeningRate: "Good",
    suspiciousPoints: "3",
    questions: [
      { id: 1, question: "Question 1", rate: "Good", answer: "Answer 1", comment: "Comment 1" },
      { id: 2, question: "Question 2", rate: "Fair", answer: "Answer 2", comment: "Comment 2" },
      { id: 3, question: "Question 3", rate: "Weak", answer: "Answer 3", comment: "Comment 3" },
      { id: 4, question: "Question 4", rate: "Excellence", answer: "Answer 4", comment: "Comment 4" },
    ],
    suspiciousData: [
      { id: 1, question: "Question 1", suspiciousType: "Read Script", answerRecord: "Video 1", timePoint: "03:15 - 05:45" },
      { id: 2, question: "Question 2", suspiciousType: "Copy Clip", answerRecord: "Video 2", timePoint: "11:20 - 15:22" },
      { id: 3, question: "Question 3", suspiciousType: "AI Cheat", answerRecord: "Video 3", timePoint: "17:16 - 21:22" },
      { id: 4, question: "Question 4", suspiciousType: "AI Cheat", answerRecord: "Video 4", timePoint: "23:15 - 25:45" },
    ]
  };

  return (
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
              <MDBox>
                
                {/* Basic Info Section */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <MDBox mb={2}>
                      <MDTypography variant="body2" fontWeight="bold">
                        Job Title: <MDTypography variant="body2" fontWeight="regular" component="span">{reportData.jobTitle}</MDTypography>
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                      <MDTypography variant="body2" fontWeight="bold">
                        Candidate Name: <MDTypography variant="body2" fontWeight="regular" component="span">{reportData.candidateName}</MDTypography>
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                      <MDTypography variant="body2" fontWeight="bold">
                        Expire time: <MDTypography variant="body2" fontWeight="regular" component="span">{reportData.expireTime}</MDTypography>
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                      <MDTypography variant="body2" fontWeight="bold">
                        Screening Rate: <MDTypography variant="body2" fontWeight="regular" component="span">{reportData.screeningRate}</MDTypography>
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                      <MDTypography variant="body2" fontWeight="bold">
                        Suspicious Points: <MDTypography variant="body2" fontWeight="regular" component="span">{reportData.suspiciousPoints}</MDTypography>
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDBox mb={2}>
                      <MDTypography variant="body2" fontWeight="bold">
                        Duration: <MDTypography variant="body2" fontWeight="regular" component="span">{reportData.duration}</MDTypography>
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                      <MDTypography variant="body2" fontWeight="bold">
                        Question Number: <MDTypography variant="body2" fontWeight="regular" component="span">{reportData.questionNumber}</MDTypography>
                      </MDTypography>
                    </MDBox>
                  </Grid>
                </Grid>
                
                {/* Tabs Navigation */}
                <MDBox mt={4}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                  >
                    <Tab label="Screening Report" />
                    <Tab label="Suspicious Point" />
                    <Tab label="Screening Record" />
                  </Tabs>
                </MDBox>
                
                {/* Tab Panels */}
                <TabPanel value={tabValue} index={0}>
                  <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Screening Question*</TableCell>
                          <TableCell>Rate</TableCell>
                          <TableCell>Candidate Answer</TableCell>
                          <TableCell>Comment</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.questions.map((question) => (
                          <TableRow key={question.id}>
                            <TableCell>{question.question}</TableCell>
                            <TableCell>{question.rate}</TableCell>
                            <TableCell>{question.answer}</TableCell>
                            <TableCell>{question.comment}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Screening Question*</TableCell>
                          <TableCell>Suspicious type</TableCell>
                          <TableCell>Answer Record</TableCell>
                          <TableCell>Time Point</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.suspiciousData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.question}</TableCell>
                            <TableCell>{item.suspiciousType}</TableCell>
                            <TableCell>
                              <MDTypography 
                                component="a" 
                                href="#" 
                                variant="caption" 
                                color="info"
                                fontWeight="medium"
                              >
                                {item.answerRecord}
                              </MDTypography>
                            </TableCell>
                            <TableCell>{item.timePoint}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>
                
                <TabPanel value={tabValue} index={2}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <MDBox p={2} border="1px solid #eee" borderRadius="lg">
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="200px">
                          <MDBox component="img" src="/path/to/placeholder-video.png" width="80%" height="auto" />
                        </MDBox>
                        <MDBox display="flex" alignItems="center" mt={2}>
                          <MDBox 
                            display="flex" 
                            alignItems="center" 
                            justifyContent="space-between" 
                            width="100%"
                            p={1}
                            border="1px solid #eee"
                            borderRadius="lg"
                          >
                            <Icon>play_circle</Icon>
                            <MDBox width="70%" mx={2} bgcolor="#f0f0f0" height="10px" borderRadius="lg" />
                            <Icon>volume_up</Icon>
                            <Icon>fullscreen</Icon>
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDBox 
                        p={2} 
                        border="1px solid #eee" 
                        borderRadius="lg" 
                        height="100%"
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <MDTypography variant="h6" textAlign="center" gutterBottom>
                          Code Records
                        </MDTypography>
                        <MDTypography variant="body2" color="text" textAlign="center">
                          No code records for this screening
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                </TabPanel>
                
                {/* Close Button */}
                <MDBox display="flex" justifyContent="flex-end" mt={4}>
                  <MDButton variant="gradient" color="info" onClick={handleCloseWindow}>
                    Close Window
                  </MDButton>
                </MDBox>
              </MDBox>
          </Grid>
        </Grid>
      </MDBox>
  );
}

export default ScreeningReport;