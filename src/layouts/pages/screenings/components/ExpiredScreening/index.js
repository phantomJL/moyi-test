import { useState, useEffect } from "react";
import PropTypes from "prop-types";

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
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Chip from "@mui/material/Chip";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Import the API service
import { ScreeningService } from "services";

function ScreeningDetail({ id, onClose }) {
  // State for screening data
  const [screening, setScreening] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Fetch screening data on component mount
  useEffect(() => {
    if (!id) return;
    
    const fetchScreeningData = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        console.log('Fetching screening with ID:', id);
        const response = await ScreeningService.getScreeningById(id);
        console.log('Screening data:', response.data);
        
        setScreening(response.data);
        setQuestions(response.data.questions || []);
      } catch (error) {
        console.error('Error fetching screening:', error);
        setError(
          error.response?.data?.message || 
          "Failed to fetch screening details. Please try again."
        );
        setOpenSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScreeningData();
  }, [id]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };
  
  // Handle question check
  const handleQuestionCheck = (questionId) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, completed: !q.completed } : q
    ));
    
    // In a real implementation, you would also update this on the server
    // Perhaps using an API call like:
    // ScreeningService.updateQuestion(id, questionId, { completed: !questions.find(q => q.id === questionId).completed });
  };
  
  // Handle delete screening
  const handleDeleteScreening = async () => {
    if (!window.confirm("Are you sure you want to delete this screening?")) return;
    
    setIsSubmitting(true);
    setError("");
    
    try {
      await ScreeningService.deleteScreening(id);
      
      setSuccess("Screening deleted successfully");
      setOpenSnackbar(true);
      
      // Close the modal/navigate away after success
      setTimeout(() => {
        onClose && onClose();
      }, 1500);
    } catch (error) {
      console.error('Error deleting screening:', error);
      setError(
        error.response?.data?.message || 
        "Failed to delete screening. Please try again."
      );
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle regenerate screening
  const handleRegenerate = async () => {
    setIsSubmitting(true);
    setError("");
    
    try {
      // This endpoint might need to be adjusted based on your API
      const response = await ScreeningService.reopenScreening(id);
      
      setSuccess("Screening regenerated successfully");
      setOpenSnackbar(true);
      
      // Refresh the data
      setScreening(response.data);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error regenerating screening:', error);
      setError(
        error.response?.data?.message || 
        "Failed to regenerate screening. Please try again."
      );
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
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
  
  // Error state with no data
  if (error && !screening) {
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
  
  // No data state
  if (!screening) {
    return (
      <MDBox p={3} textAlign="center">
        <MDTypography variant="body1">No screening data found.</MDTypography>
        <MDBox mt={2}>
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
            <Grid container spacing={3}>
              {/* Basic Info Section */}
              <Grid item xs={12} md={6}>
                <MDBox mb={2}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Job Title: {screening.jobTitle}
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2">
                    Candidate: {screening.candidateName || "N/A"}
                  </MDTypography>
                </MDBox>
                {/* Display tags if available */}
                {screening.tags && screening.tags.length > 0 && (
                  <MDBox mb={2} display="flex" flexWrap="wrap" gap={1}>
                    {screening.tags.map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={tag} 
                        color="primary" 
                        variant="outlined" 
                        size="small" 
                      />
                    ))}
                  </MDBox>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <MDBox mb={2}>
                  <MDTypography variant="body2">
                    Expiration: {formatDate(screening.expirationDate)}
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2">
                    Duration: {screening.duration} minutes
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2">
                    Status: {screening.status || "Active"}
                  </MDTypography>
                </MDBox>
              </Grid>
              
              {/* Job Description */}
              <Grid item xs={12}>
                <MDBox mb={3}>
                  <MDTypography variant="subtitle2" fontWeight="medium">
                    Job Description:
                  </MDTypography>
                  <MDBox mt={1}>
                    <MDTypography variant="body2" color="text">
                      {screening.jobDescription || "No job description provided."}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
              
              {/* Screening Questions */}
              <Grid item xs={12}>
                <MDBox mb={2}>
                  <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
                    Screening Questions:
                  </MDTypography>
                  
                  {questions.length > 0 ? (
                    <TableContainer>
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Question</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Completed</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {questions.map((question) => (
                            <TableRow key={question.id}>
                              <TableCell>
                                {question.question || question.content}
                              </TableCell>
                              <TableCell>{question.type || "N/A"}</TableCell>
                              <TableCell>{question.duration || "N/A"}</TableCell>
                              <TableCell>
                                <Checkbox 
                                  checked={Boolean(question.completed)}
                                  onChange={() => handleQuestionCheck(question.id)}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <MDBox p={2} textAlign="center">
                      <MDTypography variant="body2">
                        No questions available for this screening.
                      </MDTypography>
                    </MDBox>
                  )}
                </MDBox>
              </Grid>
              
              {/* Action Buttons */}
              <Grid item xs={12}>
                <MDBox display="flex" justifyContent="space-between" mt={4}>
                  <MDButton 
                    variant="outlined" 
                    color="error"
                    onClick={handleDeleteScreening}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : "Delete Screening"}
                  </MDButton>
                  
                  <MDButton 
                    variant="gradient" 
                    color="info"
                    onClick={handleRegenerate}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : "Re-generate Screening"}
                  </MDButton>
                </MDBox>
              </Grid>
            </Grid>
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
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </MDBox>
  );
}

export default ScreeningDetail;