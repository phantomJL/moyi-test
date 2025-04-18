/**
=========================================================
* Material Dashboard 3 PRO React - v2.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2024 Moyi Tech (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Grid from "@mui/material/Grid";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

// API service
import axios from "axios";
import API from "services/api";

function Cover() {
  const navigate = useNavigate();
  
  // Step state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Registration', 'Verification'];
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
    companyWebsite: ""
  });
  
  // Verification state
  const [verificationCode, setVerificationCode] = useState("");
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Handle input changes for signup form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle verification code input
  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
  };

  // Handle signup form submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setOpenSnackbar(true);
      return;
    }
    
    if (!agreeToTerms) {
      setError("You must agree to the Terms and Conditions");
      setOpenSnackbar(true);
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      // Call signup API
      const response = await API.post('/auth/signup', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite  
      });
      
      setSuccess("Account created successfully! Please check your email for verification code.");
      setOpenSnackbar(true);
      
      // Move to verification step
      setActiveStep(1);
      
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data || "User already exists or signup exception");
      } else if (error.request) {
        // The request was made but no response was received
        setError("No response from server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError("An error occurred. Please try again.");
      }
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError("Please enter the verification code");
      setOpenSnackbar(true);
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      // Call verify email API
      const response = await axios.post('/api/v1/auth/verify-email', {
        email: formData.email,
        confirmationCode: verificationCode
      });
      
      setSuccess("Email verified successfully! Redirecting to login...");
      setOpenSnackbar(true);
      
      // Redirect to sign-in page after successful verification
      setTimeout(() => {
        navigate('/authentication/sign-in/cover');
      }, 2000);
      
    } catch (error) {
      if (error.response) {
        setError(error.response.data || "Invalid verification code");
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

  // Handle resend verification code
  const handleResendCode = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Call resend verification code API
      const response = await axios.post('/api/v1/auth/resend-confirmation-code', {
        email: formData.email
      });
      
      setSuccess("Verification code resent successfully!");
      setOpenSnackbar(true);
      
    } catch (error) {
      if (error.response) {
        setError(error.response.data || "Failed to resend code");
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
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          mx={2}
          mt={2}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            {activeStep === 0 
              ? "Enter your information to register" 
              : "Enter the verification code sent to your email"}
          </MDTypography>
        </MDBox>
        
        <MDBox p={3}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === 0 ? (
            // Step 1: Registration Form
            <MDBox component="form" role="form" onSubmit={handleSignupSubmit}>
              <MDBox mb={2}>
                <MDInput 
                  type="text" 
                  label="First Name" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  variant="standard" 
                  fullWidth 
                  required
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput 
                  type="text" 
                  label="Last Name" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  variant="standard" 
                  fullWidth 
                  required
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="standard"
                  fullWidth
                  required
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  type="password"
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="standard"
                  fullWidth
                  required
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  variant="standard"
                  fullWidth
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  label="Company Website"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  variant="standard"
                  fullWidth
                />
              </MDBox>
              <MDBox display="flex" alignItems="center" ml={-1}>
                <Checkbox 
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color="text"
                  sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                >
                  &nbsp;&nbsp;I agree the&nbsp;
                </MDTypography>
                <MDTypography
                  component="a"
                  href="#"
                  variant="button"
                  fontWeight="bold"
                  color="info"
                  textGradient
                >
                  Terms and Conditions
                </MDTypography>
              </MDBox>
              <MDBox mt={4} mb={1}>
                <MDButton 
                  variant="gradient" 
                  color="info" 
                  fullWidth
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
                </MDButton>
              </MDBox>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="text">
                  Already have an account?{" "}
                  <MDTypography
                    component={Link}
                    to="/authentication/sign-in/cover"
                    variant="button"
                    color="info"
                    fontWeight="medium"
                    textGradient
                  >
                    Sign In
                  </MDTypography>
                </MDTypography>
              </MDBox>
            </MDBox>
          ) : (
            // Step 2: Verification Form
            <MDBox component="form" role="form" onSubmit={handleVerifySubmit}>
              <MDBox mb={2} textAlign="center">
                <MDTypography variant="body2" color="text">
                  We've sent a verification code to <strong>{formData.email}</strong>
                </MDTypography>
              </MDBox>
              
              <MDBox mb={4}>
                <MDInput
                  type="text"
                  label="Verification Code"
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  variant="standard"
                  fullWidth
                  required
                />
              </MDBox>
              
              <MDBox mt={4} mb={1}>
                <MDButton 
                  variant="gradient" 
                  color="info" 
                  fullWidth
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : "Verify"}
                </MDButton>
              </MDBox>
              
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="text">
                  Didn't receive the code?{" "}
                  <MDTypography
                    component="button"
                    variant="button"
                    color="info"
                    fontWeight="medium"
                    textGradient
                    onClick={handleResendCode}
                    sx={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Resend
                  </MDTypography>
                </MDTypography>
              </MDBox>
              
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography
                  component="button"
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  onClick={() => setActiveStep(0)}
                  sx={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Back to Sign Up
                </MDTypography>
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </Card>
      
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
    </CoverLayout>
  );
}

export default Cover;