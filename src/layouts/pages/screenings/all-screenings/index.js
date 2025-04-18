import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
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

// Material Dashboard 3 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Header from "../components/Header";

// Import the components to show in modals
import NewScreening from "../new-screening";
import ScreeningDetail from "../components/UpcomingScreening/ScreeningDetail";
import ScreeningReport from "../components/CompletedScreening/ScreeningReport";
import ExpiredScreeningDetail from "../components/ExpiredScreening";

// Import the API service
import { ScreeningService } from "services";

function AllScreenings() {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    fetchScreenings(getStatusFromTabValue(newValue));
  };
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [selectedScreeningId, setSelectedScreeningId] = useState(null);
  
  // Screenings data state
  const [screenings, setScreenings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Helper function to get status from tab value
  const getStatusFromTabValue = (tabValue) => {
    switch (tabValue) {
      case 0:
        return "upcoming";
      case 1:
        return "completed";
      case 2:
        return "expired";
      default:
        return "upcoming";
    }
  };
  
  // Fetch screenings from API
  const fetchScreenings = async (status = getStatusFromTabValue(tabValue)) => {
    setIsLoading(true);
    try {
      const response = await ScreeningService.getScreeningsByStatus(status);
      setScreenings(response.data);
      setError("");
    } catch (error) {
      setError(error.userMessage || "Failed to fetch screenings");
      setOpenSnackbar(true);
      setScreenings([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Open modal with specific content
  const openModal = (content, title, screeningId = null) => {
    setModalContent(content);
    setModalTitle(title);
    setSelectedScreeningId(screeningId);
    setModalOpen(true);
  };
  
  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
    setModalTitle("");
    setSelectedScreeningId(null);
    
    // Refresh screenings list after modal is closed (in case changes were made)
    fetchScreenings(getStatusFromTabValue(tabValue));
  };

  // Handle opening different modals
  const handleViewDetails = (screeningId) => {
    openModal("detail", "Screening Detail", screeningId);
  };

  const handleViewReport = (screeningId) => {
    openModal("report", "Screening Report", screeningId);
  };
  
  const handleReopenScreening = (screeningId) => {
    openModal("expired", "Expired Screening", screeningId);
  };
  
  const handleNewScreening = () => {
    openModal("new", "New Screening");
  };
  
  // Handle reopen screening directly
  const handleReopenDirectly = async (screeningId) => {
    setIsLoading(true);
    try {
      await ScreeningService.reopenScreening(screeningId);
      setSuccess("Screening reopened successfully");
      setOpenSnackbar(true);
      fetchScreenings(getStatusFromTabValue(tabValue));
    } catch (error) {
      setError(error.userMessage || "Failed to reopen screening");
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

  // Tag color mapping
  const getTagColor = (tag) => {
    switch(tag) {
      case "Technical":
        return { bgColor: "#e3f2fd", textColor: "#0277bd" };
      case "Behavior":
        return { bgColor: "#fce4ec", textColor: "#c2185b" };
      case "Coding":
        return { bgColor: "#e8f5e9", textColor: "#2e7d32" };
      case "Java":
        return { bgColor: "#fff8e1", textColor: "#ff8f00" };
      case "Kafka":
        return { bgColor: "#f3e5f5", textColor: "#7b1fa2" };
      case "Redis":
        return { bgColor: "#ffebee", textColor: "#c62828" };
      default:
        return { bgColor: "#f5f5f5", textColor: "#616161" };
    }
  };

  // Load screenings on component mount
  useEffect(() => {
    fetchScreenings();
  }, []);

  const renderModalContent = () => {
    switch (modalContent) {
      case "new":
        return <NewScreening onClose={closeModal} />;
      case "detail":
        return <ScreeningDetail id={selectedScreeningId} onClose={closeModal} />;
      case "report":
        return <ScreeningReport id={selectedScreeningId} onClose={closeModal} />;
      case "expired":
        return <ExpiredScreeningDetail id={selectedScreeningId} onClose={closeModal} onReopen={() => handleReopenDirectly(selectedScreeningId)} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <MDBox width="calc(100% - 48px)" position="absolute" top="1.75rem">
        <DashboardNavbar light absolute />
      </MDBox>
      <Header />
      <MDBox>
        <Grid container alignItems="center">
          <Grid item xs={12} md={7}>
            <MDBox mb={1}>
              <MDTypography variant="h5">All Screenings</MDTypography>
            </MDBox>
            <MDBox mb={2}>
              <MDTypography variant="body2" color="text">
                Here are all the screenings that you have created. You can add new screenings by
                clicking the button below.
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={5} sx={{ textAlign: "right" }}>
            <MDButton 
              variant="gradient" 
              color="info"
              onClick={handleNewScreening}
            >
              <Icon>add</Icon>&nbsp; Add New
            </MDButton>
          </Grid>
        </Grid>
      </MDBox>
      <MDBox pt={3} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDBox mt={5}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                sx={{ mb: 3 }}
              >
                <Tab label="Upcoming" />
                <Tab label="Completed" />
                <Tab label="Expired" />
              </Tabs>

              {isLoading ? (
                <MDBox display="flex" justifyContent="center" p={5}>
                  <CircularProgress />
                </MDBox>
              ) : (
                <MDBox>
                  {screenings.length > 0 ? screenings.map((screening, index) => (
                    <Card key={index} sx={{ mb: 2, overflow: "visible" }}>
                      <CardContent>
                        <Grid container alignItems="center" spacing={2}>
                          <Grid item xs={12} md={6}>
                            <MDBox>
                              <MDTypography variant="h6" fontWeight="medium">
                                Job Title: {screening.jobTitle}
                              </MDTypography>
                              <MDTypography variant="body2" color="text">
                                Candidate ID: {screening.candidateId}
                              </MDTypography>
                              <MDTypography variant="body2" color="text">
                                Duration: {screening.duration} minutes
                              </MDTypography>
                            </MDBox>
                            {tabValue === 2 && ( // Show tech tags in expired tab
                              <MDBox display="flex" mt={1} flexWrap="wrap" gap={1}>
                                {screening.techTags && screening.techTags.map((tag, idx) => {
                                  const { bgColor, textColor } = getTagColor(tag);
                                  return (
                                    <MDBox
                                      key={idx}
                                      px={1.5}
                                      py={0.4}
                                      borderRadius="lg"
                                      sx={{
                                        backgroundColor: bgColor,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                      }}
                                    >
                                      <MDTypography
                                        variant="caption"
                                        fontWeight="medium"
                                        sx={{ color: textColor }}
                                      >
                                        {tag}
                                      </MDTypography>
                                    </MDBox>
                                  );
                                })}
                              </MDBox>
                            )}
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <MDTypography variant="body2" color="text">
                              Expire time: {new Date(screening.expirationDate).toLocaleString()}
                            </MDTypography>
                            {tabValue !== 2 && ( // Show screening tags in upcoming and completed tabs
                              <MDBox display="flex" mt={1} flexWrap="wrap" gap={1}>
                                {screening.screeningTags && screening.screeningTags.map((tag, idx) => {
                                  const { bgColor, textColor } = getTagColor(tag);
                                  return (
                                    <MDBox
                                      key={idx}
                                      px={1.5}
                                      py={0.4}
                                      borderRadius="lg"
                                      sx={{
                                        backgroundColor: bgColor,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                      }}
                                    >
                                      <MDTypography
                                        variant="caption"
                                        fontWeight="medium"
                                        sx={{ color: textColor }}
                                      >
                                        {tag}
                                      </MDTypography>
                                    </MDBox>
                                  );
                                })}
                              </MDBox>
                            )}
                          </Grid>
                          <Grid item xs={12} md={3} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            {screening.status === "completed" ? (
                              <MDButton 
                                variant="outlined" 
                                color="info" 
                                size="small"
                                onClick={() => handleViewReport(screening.id)}
                              >
                                View Report
                              </MDButton>
                            ) : screening.status === "expired" ? (
                              <MDButton 
                                variant="outlined" 
                                color="info" 
                                size="small"
                                onClick={() => handleReopenScreening(screening.id)}
                              >
                                Reopen Screening
                              </MDButton>
                            ) : (
                              <MDButton 
                                variant="outlined" 
                                color="info" 
                                size="small"
                                onClick={() => handleViewDetails(screening.id)}
                              >
                                Details
                              </MDButton>
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )) : (
                    <Card>
                      <CardContent>
                        <MDBox py={5} textAlign="center">
                          <MDTypography variant="body1" color="text">
                            No {tabValue === 0 ? "upcoming" : tabValue === 1 ? "completed" : "expired"} screenings found.
                          </MDTypography>
                        </MDBox>
                      </CardContent>
                    </Card>
                  )}
                </MDBox>
              )}
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      
      {/* Modal */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth="lg"
        fullWidth
        aria-labelledby="screening-modal-title"
      >
        <DialogTitle id="screening-modal-title">
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
          {renderModalContent()}
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

export default AllScreenings;