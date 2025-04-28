import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import InputLabel from "@mui/material/InputLabel";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// API services
import { 
  createCandidate, 
  updateCandidate, 
  deleteCandidate, 
  uploadResume 
} from "services/CandidateServices";

function Candidate({ 
  isEditMode = false, 
  candidateId = null, 
  onSave, 
  onClose, 
  onResumeUpload, 
  candidateData = null 
}) {
  // Form state with default values or data from props
  const [formData, setFormData] = useState({
    name: candidateData?.name || "",
    email: candidateData?.email || "",
    location: candidateData?.location || "",
    priority: candidateData?.priority || "MEDIUM",
    resumeLocation: candidateData?.resumeLocation || ""
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState(
    candidateData?.resumeLocation ? 
      candidateData.resumeLocation.split('/').pop() : 
      ""
  );
  
  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResumeFileName(file.name);
    }
  };

  // Handle resume upload
  const handleResumeUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      setOpenSnackbar(true);
      return;
    }

    setIsUploading(true);
    setError("");
    
    try {
      console.log("Uploading resume:", selectedFile.name);
      
      // Call the upload resume API
      const response = await uploadResume(selectedFile);
      
      // Get the resume S3 URI from the response
      const resumeS3Uri = response.data.data;
      
      if (!resumeS3Uri) {
        throw new Error("Failed to get resume location from server");
      }
      
      console.log("Resume uploaded successfully. S3 URI:", resumeS3Uri);
      
      // Update form data with the resume location
      setFormData({
        ...formData,
        resumeLocation: resumeS3Uri
      });
      
      // Call the onResumeUpload callback if provided
      if (onResumeUpload) {
        onResumeUpload(resumeS3Uri);
      }
      
      setSuccess("Resume uploaded successfully!");
      setOpenSnackbar(true);
      
    } catch (error) {
      console.error("Error uploading resume:", error);
      
      if (error.response) {
        setError(error.response.data?.message || "Failed to upload resume");
      } else if (error.request) {
        setError("No response from server. Please try again later.");
      } else {
        setError(error.message || "An error occurred during upload");
      }
      setOpenSnackbar(true);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email) {
      setError("Please fill in all required fields");
      setOpenSnackbar(true);
      return;
    }

    // Check if resume is uploaded for new candidates
    if (!isEditMode && !formData.resumeLocation) {
      setError("Please upload a resume first");
      setOpenSnackbar(true);
      return;
    }

    setIsSubmitting(true);
    setError("");
    
    try {
      let response;
      
      if (isEditMode) {
        // Update existing candidate
        console.log("Updating candidate:", candidateId, formData);
        response = await updateCandidate(candidateId, formData);
      } else {
        // Create new candidate
        console.log("Creating new candidate:", formData);
        response = await createCandidate(formData);
      }
      
      console.log("API response:", response.data);
      
      // Call the onSave callback with the saved data
      onSave(response.data);
      
      setSuccess(isEditMode 
        ? "Candidate updated successfully!" 
        : "Candidate added successfully!");
      setOpenSnackbar(true);
      
      // Close the modal after short delay on success
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error("Error saving candidate:", error);
      
      if (error.response) {
        setError(error.response.data?.message || "Operation failed");
      } else if (error.request) {
        setError("No response from server. Please try again later.");
      } else {
        setError(error.message || "An error occurred. Please try again.");
      }
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete candidate
  const handleDelete = async () => {
    if (!isEditMode || !candidateId) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this candidate?");
    if (!confirmed) return;
    
    setIsSubmitting(true);
    setError("");
    
    try {
      console.log("Deleting candidate:", candidateId);
      
      // Call the delete candidate API
      await deleteCandidate(candidateId);
      
      setSuccess("Candidate deleted successfully!");
      setOpenSnackbar(true);
      
      // Close the modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error("Error deleting candidate:", error);
      
      if (error.response) {
        setError(error.response.data?.message || "Delete operation failed");
      } else if (error.request) {
        setError("No response from server. Please try again later.");
      } else {
        setError(error.message || "An error occurred. Please try again.");
      }
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Determine if the form is currently processing
  const isLoading = isUploading || isSubmitting;

  return (
    <MDBox>
      <MDBox component="form" role="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Candidate Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Candidate Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Candidate Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
                required
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDBox mb={2}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                  sx={{padding:'12px'}}
                >
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </Select>
              </FormControl>
            </MDBox>
          </Grid>
          <Grid item xs={12}>
            <MDBox mb={2}>
              <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                Resume
              </MDTypography>
              <MDBox display="flex" alignItems="center" flexWrap="wrap" gap={2}>
                {/* File selection */}
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  component="label"
                  disabled={isLoading}
                >
                  Select File
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    hidden
                    onChange={handleFileChange}
                  />
                </MDButton>
                
                {/* Display selected file name */}
                {resumeFileName && (
                  <MDTypography variant="body2" fontWeight="regular">
                    {resumeFileName}
                  </MDTypography>
                )}
                
                {/* Upload button - only show if file selected but not yet uploaded */}
                {selectedFile && (
                  <MDButton
                    variant="contained"
                    color="info"
                    size="small"
                    onClick={handleResumeUpload}
                    disabled={isLoading}
                    sx={{ ml: 'auto' }}
                  >
                    {isUploading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Upload Resume"
                    )}
                  </MDButton>
                )}
                
                {/* Success indicator if resume is uploaded */}
                {formData.resumeLocation && !selectedFile && (
                  <MDTypography 
                    variant="caption" 
                    color="success" 
                    fontWeight="medium"
                  >
                    ✓ Resume uploaded
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
          </Grid>
        </Grid>
        
        <MDBox mt={4} mb={1} display="flex" justifyContent="space-between">
          {isEditMode ? (
            <>
              <MDButton
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Delete
              </MDButton>
              <MDBox display="flex" gap={2}>
                <MDButton
                  variant="outlined"
                  color="dark"
                  onClick={onClose}
                >
                  Cancel
                </MDButton>
                <MDButton
                  variant="gradient"
                  color="info"
                  type="submit"
                  disabled={isLoading}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                </MDButton>
              </MDBox>
            </>
          ) : (
            <>
              <MDButton
                variant="outlined"
                color="dark"
                onClick={onClose}
              >
                Cancel
              </MDButton>
              <MDButton
                variant="gradient"
                color="info"
                type="submit"
                disabled={isLoading || !formData.resumeLocation}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Add Candidate"}
              </MDButton>
            </>
          )}
        </MDBox>
      </MDBox>
      
      {/* Error/Success Snackbar */}
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

export default Candidate;