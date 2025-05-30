import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Import the API service
import { ScreeningService } from "services";

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

function ScreeningReport({ id, onClose }) {
  // State for report data
  const [reportData, setReportData] = useState({
    screeningInfo: {
      jobTitle: "",
      candidateName: "",
      expireTime: "",
      duration: "",
      questionNumber: "0",
      screeningRate: "",
      suspiciousPoints: "0"
    },
    questions: [],
    suspiciousData: [],
    videoUrl: null,
    codeRecords: []
  });
  
  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch report data on component mount
  useEffect(() => {
    if (!id) return;
    
    const fetchReportData = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        const response = await ScreeningService.getScreeningReport(id);
        console.log("Report data response:", response);
        
        // Basic report data validation
        if (response.data && response.data.status === "SUCCESS") {
          // Extract the screening questions/ratings from the API response
          const questions = response.data.data || [];
          
          // Get the screening basic info - this might need to be adjusted 
          // based on your actual API response structure
          const screeningDetail = await ScreeningService.getScreeningById(id);
          
          setReportData({
            screeningInfo: {
              jobTitle: screeningDetail.data.data?.jobTitle || "",
              candidateName: screeningDetail.data.data?.candidateName || "",
              expireTime: screeningDetail.data.data?.expireDate || "",
              duration: `${screeningDetail.data.data?.duration || 0} mins`,
              questionNumber: `${questions.length}`,
              screeningRate: calculateOverallRating(questions),
              suspiciousPoints: calculateSuspiciousPoints(questions)
            },
            questions: questions,
            suspiciousData: extractSuspiciousData(questions),
            videoUrl: screeningDetail.data.data?.videoUrl || null,
            codeRecords: screeningDetail.data.data?.codeRecords || []
          });
        } else {
          throw new Error("Invalid report data structure");
        }
      } catch (error) {
        console.error('Error fetching screening report:', error);
        setError(
          error.response?.data?.message || 
          "Failed to fetch screening report. Please try again."
        );
        setOpenSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReportData();
  }, [id]);

  // Utility function to calculate overall rating
  const calculateOverallRating = (questions) => {
    if (!questions || questions.length === 0) return "N/A";
    
    // Count occurrences of each rating
    const ratings = questions.map(q => q.rating);
    const ratingCounts = {
      "Excellence": 0,
      "Good": 0,
      "Fair": 0,
      "Weak": 0
    };
    
    ratings.forEach(rating => {
      if (ratingCounts[rating] !== undefined) {
        ratingCounts[rating]++;
      }
    });
    
    // Determine the most common rating
    let maxCount = 0;
    let dominantRating = "Good"; // Default
    
    for (const [rating, count] of Object.entries(ratingCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantRating = rating;
      }
    }
    
    return dominantRating;
  };
  
  // Utility function to count suspicious points
  const calculateSuspiciousPoints = (questions) => {
    if (!questions || questions.length === 0) return "0";
    
    // Count questions with suspicious activity
    const suspiciousCount = questions.filter(
      q => q.suspiciousType && q.suspiciousType !== "None"
    ).length;
    
    return String(suspiciousCount);
  };
  
  // Utility function to extract suspicious data
  const extractSuspiciousData = (questions) => {
    if (!questions || questions.length === 0) return [];
    
    // Create suspicious data entries from questions with suspicious activity
    return questions
      .filter(q => q.suspiciousType && q.suspiciousType !== "None")
      .map((q, index) => ({
        id: index + 1,
        question: q.question,
        suspiciousType: q.suspiciousType || "Unknown",
        answerRecord: `Video ${index + 1}`,
        timePoint: q.suspiciousTimePoint || "N/A"
      }));
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </MDBox>
    );
  }
  
  // Error state
  if (error) {
    return (
      <MDBox p={3}>
        <Alert severity="error">{error}</Alert>
        <MDBox mt={2} display="flex" justifyContent="center">
          <MDButton variant="outlined" color="info" onClick={onClose}>
            Go Back
          </MDButton>
        </MDBox>
      </MDBox>
    );
  }

  return (
    <MDBox pt={3} pb={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MDBox>
            {/* Basic Info Section */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDBox mb={2}>
                  <MDTypography variant="body2" fontWeight="bold">
                    Job Title: <MDTypography variant="body2" fontWeight="regular" component="span">
                      {reportData.screeningInfo.jobTitle}
                    </MDTypography>
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" fontWeight="bold">
                    Candidate Name: <MDTypography variant="body2" fontWeight="regular" component="span">
                      {reportData.screeningInfo.candidateName}
                    </MDTypography>
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" fontWeight="bold">
                    Expire time: <MDTypography variant="body2" fontWeight="regular" component="span">
                      {reportData.screeningInfo.expireTime}
                    </MDTypography>
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" fontWeight="bold">
                    Screening Rate: <MDTypography variant="body2" fontWeight="regular" component="span">
                      {reportData.screeningInfo.screeningRate}
                    </MDTypography>
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" fontWeight="bold">
                    Suspicious Points: <MDTypography variant="body2" fontWeight="regular" component="span">
                      {reportData.screeningInfo.suspiciousPoints}
                    </MDTypography>
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox mb={2}>
                  <MDTypography variant="body2" fontWeight="bold">
                    Duration: <MDTypography variant="body2" fontWeight="regular" component="span">
                      {reportData.screeningInfo.duration}
                    </MDTypography>
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" fontWeight="bold">
                    Question Number: <MDTypography variant="body2" fontWeight="regular" component="span">
                      {reportData.screeningInfo.questionNumber}
                    </MDTypography>
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
                <Table>
                  <TableHead sx={{ display: 'table-header-group' }}>
                    <TableRow>
                      <TableCell>Screening Question*</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Candidate Answer</TableCell>
                      <TableCell>Comment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.questions.map((question, index) => (
                      <TableRow key={index}>
                        <TableCell>{question.question}</TableCell>
                        <TableCell>{question.rating}</TableCell>
                        <TableCell>{question.answer || "N/A"}</TableCell>
                        <TableCell sx={{ 
                          whiteSpace: 'pre-wrap', 
                          wordBreak: 'break-word',
                          maxWidth: '400px' 
                        }}>
                          {question.comment || "N/A"}
                        </TableCell>
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
                    {reportData.suspiciousData.length > 0 ? (
                      reportData.suspiciousData.map((item) => (
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No suspicious activities detected
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MDBox p={2} border="1px solid #eee" borderRadius="lg">
                    {reportData.videoUrl ? (
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="200px">
                        <video
                          controls
                          width="100%"
                          height="auto"
                          src={reportData.videoUrl}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </MDBox>
                    ) : (
                      <MDBox 
                        display="flex" 
                        justifyContent="center" 
                        alignItems="center" 
                        height="200px"
                        border="1px dashed #ccc"
                        borderRadius="lg"
                      >
                        {/* Placeholder smiley face image as shown in your mockup */}
                        <MDBox 
                          component="img" 
                          src="/path/to/placeholder-smiley.png" 
                          alt="Candidate"
                          width="100px"
                          height="100px"
                        />
                      </MDBox>
                    )}
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
                        <Box component="span" sx={{ cursor: "pointer" }}>⏵</Box>
                        <MDBox width="70%" mx={2} bgcolor="#f0f0f0" height="10px" borderRadius="lg" />
                        <Box component="span" sx={{ cursor: "pointer" }}>🔊</Box>
                        <Box component="span" sx={{ cursor: "pointer" }}>⤢</Box>
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
                    {reportData.codeRecords && reportData.codeRecords.length > 0 ? (
                      <MDBox width="100%" maxHeight="200px" overflow="auto">
                        <pre style={{ width: '100%', margin: 0 }}>
                          {reportData.codeRecords.map((record, index) => (
                            <code key={index}>{record.code}</code>
                          ))}
                        </pre>
                      </MDBox>
                    ) : (
                      <MDTypography variant="body2" color="text" textAlign="center">
                        No code records for this screening
                      </MDTypography>
                    )}
                  </MDBox>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Close Button */}
            <MDBox display="flex" justifyContent="flex-end" mt={4}>
              <MDButton variant="gradient" color="info" onClick={onClose}>
                Close Window
              </MDButton>
            </MDBox>
          </MDBox>
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </MDBox>
  );
}

// PropTypes
ScreeningReport.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
};

export default ScreeningReport;