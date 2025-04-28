import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Import components and services
import { ScreeningService } from "services";
import { CandidateService } from "services";

function NewScreening({ onClose }) {
  // Form state
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    candidateId: "",
    duration: "60",
    expireDate: "",
    tags: [],
  });
  
  // Candidates state
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidateError, setCandidateError] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Available tags and tech tags
  const availableTags = ["Technical", "Behavior", "Coding"];

  // Durations in minutes
  const durations = [
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "60 minutes" },
    { value: "90", label: "90 minutes" },
    { value: "120", label: "2 hours" }
  ];
  
  // Fetch candidates on component mount
  useEffect(() => {
    fetchCandidates();
  }, []);
  
  // Fetch candidates from API
  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    setCandidateError("");
    
    try {
      const response = await CandidateService.getAllCandidates();
      setCandidates(response.data.data.items || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidateError(
        error.response?.data?.message || 
        'Failed to load candidates. Please try again.'
      );
    } finally {
      setLoadingCandidates(false);
    }
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle tags change
  const handleTagsChange = (event, newValue) => {
    setFormData({
      ...formData,
      tags: newValue
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.jobTitle || !formData.candidateId) {
      setError("Please fill in all required fields");
      setOpenSnackbar(true);
      return;
    }
  
    setIsLoading(true);
    console.log("herer")
    try {
      let expireDate = formData.expireDate;
      if (!expireDate) {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        expireDate = date.toISOString(); 
      }
      const dateObj = new Date(expireDate);
      expireDate = dateObj.toISOString();
      // Prepare data for API
      const screeningData = {
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        candidateId: formData.candidateId,
        duration: parseInt(formData.duration),
        expireDate: expireDate,
        tags: formData.tags,
      };
      
      // Call API to create screening
      await ScreeningService.createScreening(screeningData);
      
      setSuccess("Screening created successfully!");
      setOpenSnackbar(true);
      
      // Close modal after a delay
      setTimeout(() => {
        onClose && onClose();
      }, 2000);
      
    } catch (error) {
      setError(error.userMessage || "Failed to create screening");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
    setSuccess("");
  };

  return (
    <MDBox p={3}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <MDBox mb={3}>
                  <MDTypography variant="h5" fontWeight="medium">
                    Basic Information
                  </MDTypography>
                </MDBox>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Job Title"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Job Description"
                      name="jobDescription"
                      value={formData.jobDescription}
                      onChange={handleChange}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  
                  {/* Candidate Selection - replaced TextField with Select */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!candidateError}>
                      <InputLabel id="candidate-select-label">Candidate</InputLabel>
                      {loadingCandidates ? (
                        <Box display="flex" alignItems="center" height="56px" pl={2}>
                          <CircularProgress size={24} />
                          <Typography variant="body2" ml={2}>
                            Loading candidates...
                          </Typography>
                        </Box>
                      ) : (
                        <Select
                          labelId="candidate-select-label"
                          id="candidate-select"
                          name="candidateId"
                          value={formData.candidateId}
                          label="Candidate"
                          onChange={handleChange}
                          sx={{ minHeight: '56px' }}
                          required
                        >
                          {candidates.length > 0 ? (
                            candidates.map((candidate) => (
                              <MenuItem key={candidate.id} value={candidate.id}>
                                {candidate.name} ({candidate.email})
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled value="">
                              No candidates available
                            </MenuItem>
                          )}
                        </Select>
                      )}
                      {candidateError && <FormHelperText>{candidateError}</FormHelperText>}
                    </FormControl>
                    
                    {/* Add New Candidate Button */}
                    <MDBox mt={1}>
                      {!loadingCandidates && candidates.length === 0 && !candidateError && (
                        <MDTypography variant="caption" color="text" ml={2}>
                          No candidates found. Please add a new candidate.
                        </MDTypography>
                      )}
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Expiration Date/Time"
                      name="expireDate"
                      type="datetime-local"
                      value={formData.expireDate}
                      onChange={handleChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          padding: '17px'
                        }
                      }}
                    >
                      {durations.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      options={availableTags}
                      value={formData.tags}
                      onChange={handleTagsChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Screening Tags"
                          placeholder="Select tags"
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option}
                            {...getTagProps({ index })}
                            key={option}
                          />
                        ))
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <MDBox display="flex" justifyContent="flex-end" gap={2}>
          <MDButton 
            variant="outlined" 
            color="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </MDButton>
          
          <MDButton 
            variant="contained" 
            color="info"
            type="submit"
            disabled={isLoading || !formData.candidateId}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Create Screening"}
          </MDButton>
        </MDBox>
      </form>
      
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

// PropTypes
NewScreening.propTypes = {
  onClose: PropTypes.func,
};

export default NewScreening;