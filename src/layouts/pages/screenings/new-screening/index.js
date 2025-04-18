import { useState } from "react";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Import the API service
import { ScreeningService } from "services";

function NewScreening({ onClose }) {
  // Form state
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    candidateId: "",
    duration: "60",
    expirationDate: "",
    screeningTags: [],
    techTags: [],
    questions: [{ text: "" }],
    sendInvitation: true
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Available tags and tech tags
  const availableTags = ["Technical", "Behavior", "Coding"];
  const availableTechTags = ["Java", "Python", "JavaScript", "React", "Angular", "Node.js", "Spring", "Hibernate", "Kafka", "Redis", "MongoDB", "SQL"];
  
  // Durations in minutes
  const durations = [
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "60 minutes" },
    { value: "90", label: "90 minutes" },
    { value: "120", label: "2 hours" }
  ];
  
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
      screeningTags: newValue
    });
  };
  
  // Handle tech tags change
  const handleTechTagsChange = (event, newValue) => {
    setFormData({
      ...formData,
      techTags: newValue
    });
  };
  
  // Add a new question field
  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { text: "" }]
    });
  };
  
  // Remove a question field
  const removeQuestion = (index) => {
    const newQuestions = [...formData.questions];
    newQuestions.splice(index, 1);
    setFormData({
      ...formData,
      questions: newQuestions.length ? newQuestions : [{ text: "" }] // Always keep at least one question
    });
  };
  
  // Update a question field
  const handleQuestionChange = (index, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index].text = value;
    setFormData({
      ...formData,
      questions: newQuestions
    });
  };
  
  // Handle send invitation toggle
  const handleSendInvitationChange = (e) => {
    setFormData({
      ...formData,
      sendInvitation: e.target.value === "yes"
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
    
    // Ensure at least one question has text
    if (!formData.questions.some(q => q.text.trim())) {
      setError("Please add at least one question");
      setOpenSnackbar(true);
      return;
    }
    
    // Filter out empty questions
    const filteredQuestions = formData.questions.filter(q => q.text.trim());
    
    setIsLoading(true);
    
    try {
      // Set default expiration date if not provided (30 days from now)
      let expirationDate = formData.expirationDate;
      if (!expirationDate) {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        expirationDate = date.toISOString().substring(0, 16); // Format: YYYY-MM-DDTHH:MM
      }
      
      // Prepare data for API
      const screeningData = {
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        candidateId: formData.candidateId,
        duration: parseInt(formData.duration),
        expirationDate: expirationDate,
        screeningTags: formData.screeningTags,
        techTags: formData.techTags,
        questions: filteredQuestions,
        sendInvitation: formData.sendInvitation
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
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Candidate ID"
                      name="candidateId"
                      value={formData.candidateId}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Expiration Date/Time"
                      name="expirationDate"
                      type="datetime-local"
                      value={formData.expirationDate}
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
                      value={formData.screeningTags}
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
                  
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      options={availableTechTags}
                      value={formData.techTags}
                      onChange={handleTechTagsChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Technology Tags"
                          placeholder="Select technologies"
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
                  
                  <Grid item xs={12}>
                    <FormControl>
                      <FormLabel id="send-invitation-label">Send invitation email to candidate?</FormLabel>
                      <RadioGroup
                        row
                        aria-labelledby="send-invitation-label"
                        name="sendInvitation"
                        value={formData.sendInvitation ? "yes" : "no"}
                        onChange={handleSendInvitationChange}
                      >
                        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                        <FormControlLabel value="no" control={<Radio />} label="No" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <MDBox mb={3}>
                  <MDTypography variant="h5" fontWeight="medium">
                    Questions
                  </MDTypography>
                </MDBox>
                
                {formData.questions.map((question, index) => (
                  <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                    <TextField
                      fullWidth
                      label={`Question ${index + 1}`}
                      value={question.text}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      multiline
                      rows={2}
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      aria-label="delete"
                      onClick={() => removeQuestion(index)}
                      disabled={formData.questions.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                
                <MDBox display="flex" justifyContent="center" mt={2}>
                  <MDButton
                    variant="outlined"
                    color="info"
                    onClick={addQuestion}
                  >
                    Add Question
                  </MDButton>
                </MDBox>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <MDBox mb={3}>
                  <MDTypography variant="h5" fontWeight="medium">
                    Invitation
                  </MDTypography>
                </MDBox>
                
                <FormControl>
                  <FormLabel id="send-invitation-label">Send invitation email to candidate?</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="send-invitation-label"
                    name="sendInvitation"
                    value={formData.sendInvitation ? "yes" : "no"}
                    onChange={handleSendInvitationChange}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
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
            disabled={isLoading}
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