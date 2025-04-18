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

// API service
import axios from "axios";

function Candidate({ isEditMode = false, candidateId = null, onSave, onClose, candidateData = null }) {
  // Form state with default values or data from props
  const [formData, setFormData] = useState({
    name: candidateData?.name || "",
    email: candidateData?.email || "",
    location: candidateData?.location || "",
    priority: candidateData?.priority || "High",
    resume: null
  });
  
  const [resumeFileName, setResumeFileName] = useState(candidateData?.resumeUrl || "");
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
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
      setFormData({
        ...formData,
        resume: file
      });
      setResumeFileName(file.name);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.location) {
      setError("Please fill in all required fields");
      setOpenSnackbar(true);
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      // In a real app, you would submit to your API
      // const formDataToSend = new FormData();
      // formDataToSend.append('name', formData.name);
      // formDataToSend.append('email', formData.email);
      // formDataToSend.append('location', formData.location);
      // formDataToSend.append('priority', formData.priority);
      
      // if (formData.resume) {
      //   formDataToSend.append('resume', formData.resume);
      // }
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create data object to pass back to parent
      const savedData = {
        name: formData.name,
        email: formData.email,
        location: formData.location,
        priority: formData.priority,
        resumeUrl: resumeFileName || "resume.docx" // Use existing file name or default
      };
      
      // Call the onSave callback with the saved data
      onSave(savedData);
      
      setSuccess(isEditMode 
        ? "Candidate updated successfully!" 
        : "Candidate added successfully!");
      setOpenSnackbar(true);
      
    } catch (error) {
      console.error("Error saving candidate:", error);
      if (error.response) {
        setError(error.response.data || "Operation failed");
      } else if (error.request) {
        setError("No response from server. Please try again later.");
      } else {
        setError("An error occurred. Please try again.");
      }
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete candidate
  const handleDelete = async () => {
    if (!isEditMode) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this candidate?");
    if (!confirmed) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      // In a real app, you would call your API
      // await axios.delete(`/api/v1/candidates/${candidateId}`);
      
      // Mock successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess("Candidate deleted successfully!");
      setOpenSnackbar(true);
      
      // Close the modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error("Error deleting candidate:", error);
      if (error.response) {
        setError(error.response.data || "Delete operation failed");
      } else if (error.request) {
        setError("No response from server. Please try again later.");
      } else {
        setError("An error occurred. Please try again.");
      }
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

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
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </MDBox>
          </Grid>
          <Grid item xs={12}>
            <MDBox mb={2} display="flex" alignItems="center">
              <MDTypography variant="body2" fontWeight="regular" mr={2}>
                Resume:
              </MDTypography>
              {resumeFileName && (
                <MDTypography variant="body2" fontWeight="regular" mr={2}>
                  {resumeFileName}
                </MDTypography>
              )}
              <MDButton
                variant="contained"
                color="primary"
                size="small"
                component="label"
              >
                Upload
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={handleFileChange}
                />
              </MDButton>
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
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
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
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Add Candidate"}
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