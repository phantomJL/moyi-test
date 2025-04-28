import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 3 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// API service
import { CandidateService } from "services";
import Header from "../Header";

// Import the Candidate component (for new and edit)
import Candidate from "../components/candidate";

function Candidates() {
  const navigate = useNavigate();
  
  // State for candidates data
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Open modal with specific content
  const openModal = (title, candidateId = null, editMode = false) => {
    setModalTitle(title);
    setSelectedCandidateId(candidateId);
    setIsEditMode(editMode);
    setModalOpen(true);
  };
  
  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setModalTitle("");
    setSelectedCandidateId(null);
    setIsEditMode(false);
  };
  
  // Fetch candidates data
  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const response = await CandidateService.getAllCandidates();

      setCandidates(response.data.data.items);
      setError("");
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setError(error.userMessage || "Failed to load candidates");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load candidates on component mount
  useEffect(() => {
    fetchCandidates();
  }, []);
  
  // Handle actions
  const handleNewCandidate = () => {
    openModal("New Candidate", null, false);
  };
  
  const handleEditCandidate = (candidateId) => {
    openModal("Edit Candidate", candidateId, true);
  };
  
  const handleResumeView = (resumeLocation) => {
    if (!resumeLocation) {
      setError("Resume not available");
      setOpenSnackbar(true);
      return;
    }
    
    // Open the resume in a new tab
    window.open(resumeLocation, '_blank');
  };
  
  const handleDeleteCandidate = async (candidateId) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      setIsLoading(true);
      try {
        await CandidateService.deleteCandidate(candidateId);
        
        // Update the local state
        setCandidates(candidates.filter(candidate => candidate.id !== candidateId));
        
        setSuccess("Candidate deleted successfully");
        setOpenSnackbar(true);
      } catch (error) {
        setError(error.userMessage || "Failed to delete candidate");
        setOpenSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
    setSuccess("");
  };
  
  // Handle candidate save (from modal)
  const handleSaveCandidate = async (candidateData) => {
    setIsLoading(true);
    
    try {
      let response;
      
      if (isEditMode) {
        // Update existing candidate
        response = await CandidateService.updateCandidate(selectedCandidateId, candidateData);
        setSuccess("Candidate updated successfully");
      } else {
        // Create new candidate
        response = await CandidateService.createCandidate(candidateData);
        setSuccess("Candidate created successfully");
      }
      
      setOpenSnackbar(true);
      
      // Refresh candidates
      fetchCandidates();
      
      // Close the modal
      closeModal();
      
    } catch (error) {
      setError(error.userMessage || `Failed to ${isEditMode ? 'update' : 'create'} candidate`);
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle resume upload
  const handleResumeUpload = async (file, candidateId) => {
    setIsLoading(true);
    
    try {
      const response = await CandidateService.uploadResume(file);
      const resumeLocation = response.data.data;
      
      // If we have a candidateId, update the candidate with the new resume location
      if (candidateId) {
        await CandidateService.updateCandidate(candidateId, { resumeLocation });
      }
      
      setSuccess("Resume uploaded successfully");
      setOpenSnackbar(true);
      
      // Return the resume location for use in the form
      return resumeLocation;
    } catch (error) {
      setError(error.userMessage || "Failed to upload resume");
      setOpenSnackbar(true);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <MDBox width="calc(100% - 48px)" position="absolute" top="1.75rem">
        <DashboardNavbar light absolute />
      </MDBox>
      <Header />
      
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={3}
              >
                <MDBox>
                  <MDTypography variant="h5" fontWeight="medium">
                    Candidates
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" gap={2}>
                  <MDButton 
                    variant="contained" 
                    color="info"
                    onClick={handleNewCandidate}
                    disabled={isLoading}
                  >
                    New Candidate
                  </MDButton>
                </MDBox>
              </MDBox>
              
              <MDBox p={3}>
                {isLoading && !candidates.length ? (
                  <MDBox display="flex" justifyContent="center" py={5}>
                    <CircularProgress />
                  </MDBox>
                ) : error && !candidates.length ? (
                  <MDBox textAlign="center" py={5}>
                    <MDTypography variant="body1" color="error">
                      {error}
                    </MDTypography>
                  </MDBox>
                ) : candidates.length === 0 ? (
                  <MDBox textAlign="center" py={5}>
                    <MDTypography variant="body1" color="text">
                      No candidates found. Add your first candidate.
                    </MDTypography>
                  </MDBox>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableBody>
                        {candidates.map((candidate) => (
                          <TableRow key={candidate.id} >
                            <TableCell colSpan={12}>
                              <MDBox p={1}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} md={8}>
                                    <MDBox>
                                      <MDTypography variant="subtitle1" fontWeight="medium">
                                        Candidate Name: {candidate.name}
                                      </MDTypography>
                                      <MDTypography variant="body2">
                                        Candidate Email: {candidate.email}
                                      </MDTypography>
                                      <MDTypography variant="body2">
                                        Candidate Location: {candidate.location}
                                      </MDTypography>
                                      <MDTypography variant="body2">
                                        Add Date: {candidate.addDate}
                                      </MDTypography>
                                    </MDBox>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <MDBox>
                                      <MDTypography variant="body2" display="flex" alignItems="center">
                                        Resume: 
                                        {candidate.resumeLocation ? (
                                          <MDButton 
                                            variant="text" 
                                            color="info" 
                                            onClick={() => handleResumeView(candidate.resumeLocation)}
                                            sx={{ p: 0, ml: 1 }}
                                          >
                                            View Resume
                                          </MDButton>
                                        ) : (
                                          <MDTypography variant="body2" color="text" sx={{ ml: 1 }}>
                                            No resume
                                          </MDTypography>
                                        )}
                                      </MDTypography>
                                      <MDTypography variant="body2">
                                        Priority: {candidate.priority}
                                      </MDTypography>
                                    </MDBox>
                                  </Grid>
                                  <Grid item xs={12} md={1} sx={{ 
                                    display: "flex", 
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    gap: 1
                                    }}>
                                    <MDButton 
                                      variant="outlined" 
                                      color="info" 
                                      size="small"
                                      onClick={() => handleEditCandidate(candidate.id)}
                                    >
                                      Edit
                                    </MDButton>
                                    <MDButton 
                                      variant="outlined" 
                                      color="error" 
                                      size="small"
                                      onClick={() => handleDeleteCandidate(candidate.id)}
                                    >
                                      <Icon>delete</Icon>
                                    </MDButton>
                                  </Grid>
                                </Grid>
                              </MDBox>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      
      {/* Candidate Modal */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth="lg"
        fullWidth
        aria-labelledby="candidate-modal-title"
      >
        <DialogTitle id="candidate-modal-title">
          <MDBox display="flex" alignItems="center" justifyContent="space-between">
            <MDTypography variant="h6">{modalTitle}</MDTypography>
            <IconButton 
              aria-label="close" 
              onClick={closeModal}
              edge="end"
            >
              <CloseIcon />
            </IconButton>
          </MDBox>
        </DialogTitle>
        <DialogContent dividers>
          <Candidate 
            isEditMode={isEditMode}
            candidateId={selectedCandidateId}
            onSave={handleSaveCandidate}
            onClose={closeModal}
            onResumeUpload={handleResumeUpload}
            candidateData={
              isEditMode && selectedCandidateId
                ? candidates.find(c => c.id === selectedCandidateId) 
                : null
            }
          />
        </DialogContent>
      </Dialog>
      
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
      
      <Footer />
    </DashboardLayout>
  );
}

export default Candidates;