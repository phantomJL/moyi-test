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

import { useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import CreditCardIcon from "@mui/icons-material/CreditCard";

// Material Dashboard 3 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 3 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function Billing() {
  // State for modals
  const [updatePaymentOpen, setUpdatePaymentOpen] = useState(false);
  const [updateAddressOpen, setUpdateAddressOpen] = useState(false);
  
  // Current billing data
  const billingData = {
    plan: {
      type: "Starter",
      price: "USD 100.00",
      billingCycle: "billed monthly",
      expirationDate: "21 May 2024"
    },
    payment: {
      company: "haochien wang moyi inc",
      cardType: "amex",
      cardNumber: "**** **** **** 1003",
      expirationDate: "9/2027"
    },
    address: {
      line1: "42 Hansom rd",
      line2: "",
      city: "Basking ridge",
      state: "NJ",
      zip: "07920",
      country: "United States"
    }
  };
  
  // Order history data
  const orderHistory = [
    { 
      date: "20 May 2024", 
      plan: "Starter", 
      payment: "",
      receipt: true 
    },
    { 
      date: "20 Apr 2024", 
      plan: "Starter", 
      payment: "USD 100\nAmex 1003",
      receipt: true 
    },
    { 
      date: "20 Mar 2024", 
      plan: "Starter", 
      payment: "USD 100\nAmex 1003",
      receipt: true 
    },
    { 
      date: "20 Feb 2024", 
      plan: "Starter", 
      payment: "USD 100\nAmex 1003",
      receipt: true 
    }
  ];
  
  // Payment form data
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    securityCode: "",
    country: "United States",
    zipCode: "",
    isDefault: true
  });
  
  // Address form data
  const [addressData, setAddressData] = useState({
    addressLine1: billingData.address.line1,
    addressLine2: billingData.address.line2,
    country: billingData.address.country,
    state: billingData.address.state,
    city: billingData.address.city,
    postalCode: billingData.address.zip,
    updateShipping: false
  });
  
  // Form change handlers
  const handlePaymentChange = (e) => {
    const { name, value, checked } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: name === "isDefault" ? checked : value
    });
  };
  
  const handleAddressChange = (e) => {
    const { name, value, checked } = e.target;
    setAddressData({
      ...addressData,
      [name]: name === "updateShipping" ? checked : value
    });
  };
  
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <MDTypography variant="h5" fontWeight="medium">
                      Billing
                    </MDTypography>
                  </Grid>
                  
                  {/* Previous Plan */}
                  <Grid item xs={12} md={4}>
                    <Card>
                      <MDBox p={3}>
                        <MDTypography variant="h6" fontWeight="medium">
                          Previous Plan
                        </MDTypography>
                        <MDBox mt={2}>
                          <MDTypography variant="button" fontWeight="regular" color="text">
                            Type: {billingData.plan.type}
                          </MDTypography>
                        </MDBox>
                        <MDBox mt={1}>
                          <MDTypography variant="button" fontWeight="regular" color="text">
                            Price: {billingData.plan.price} {billingData.plan.billingCycle}
                          </MDTypography>
                        </MDBox>
                        <MDBox mt={1}>
                          <MDTypography variant="button" fontWeight="regular" color="text">
                            Cancelled On: {billingData.plan.expirationDate}
                          </MDTypography>
                        </MDBox>
                        <MDBox mt={2}>
                          <MDButton 
                            variant="contained" 
                            color="success" 
                            size="small"
                          >
                            Resubscribe
                          </MDButton>
                          <MDButton 
                            variant="button" 
                            fontWeight="regular" 
                            color="info"
                            sx={{ ml: 2, cursor: "pointer" }}
                          >
                            View Other Plans
                          </MDButton>
                        </MDBox>
                      </MDBox>
                    </Card>
                  </Grid>
                  
                  {/* Payment Method */}
                  <Grid item xs={12} md={4}>
                    <Card>
                      <MDBox p={3}>
                        <MDTypography variant="h6" fontWeight="medium">
                          Payment Method
                        </MDTypography>
                        <MDBox mt={2}>
                          <MDTypography variant="button" fontWeight="regular" color="text">
                            {billingData.payment.company}
                          </MDTypography>
                        </MDBox>
                        <MDBox 
                          mt={1} 
                          display="flex" 
                          alignItems="center"
                        >
                          <CreditCardIcon 
                            fontSize="small" 
                            color="primary"
                            sx={{ mr: 1 }} 
                          />
                          <MDTypography variant="button" fontWeight="regular" color="text">
                            {billingData.payment.cardNumber}
                          </MDTypography>
                        </MDBox>
                        <MDBox mt={1}>
                          <MDTypography variant="button" fontWeight="regular" color="text">
                            Expires {billingData.payment.expirationDate}
                          </MDTypography>
                        </MDBox>
                        <MDBox mt={2}>
                          <MDButton 
                            variant="contained" 
                            color="info" 
                            size="small"
                            onClick={() => setUpdatePaymentOpen(true)}
                          >
                            Update
                          </MDButton>
                        </MDBox>
                      </MDBox>
                    </Card>
                  </Grid>
                  
                  {/* Billing Address */}
                  <Grid item xs={12} md={4}>
                    <Card>
                      <MDBox p={3}>
                        <MDTypography variant="h6" fontWeight="medium">
                          Billing Address
                        </MDTypography>
                        <MDBox mt={2}>
                          <MDTypography variant="button" fontWeight="regular" color="text">
                            {billingData.address.line1}
                          </MDTypography>
                        </MDBox>
                        <MDBox mt={1}>
                          <MDTypography variant="button" fontWeight="regular" color="text">
                            {billingData.address.city}, {billingData.address.state}, {billingData.address.zip}
                          </MDTypography>
                        </MDBox>
                        <MDBox mt={1}>
                          <MDTypography variant="button" fontWeight="regular" color="text">
                            {billingData.address.country}
                          </MDTypography>
                        </MDBox>
                        <MDBox mt={2}>
                          <MDButton 
                            variant="contained" 
                            color="info" 
                            size="small"
                            onClick={() => setUpdateAddressOpen(true)}
                          >
                            Update Billing
                          </MDButton>
                        </MDBox>
                      </MDBox>
                    </Card>
                  </Grid>
                  
                  {/* Order History */}
                  <Grid item xs={12}>
                    <Card>
                      <MDBox p={3}>
                        <MDTypography variant="h6" fontWeight="medium">
                          Order History
                        </MDTypography>
                        <MDBox mt={2}>
                          <MDTypography variant="button" fontWeight="regular" color="text">
                            Below are your receipts from the last 12 months. If you have additional receipts you'd like to see, please contact us at support@hackerrank.com
                          </MDTypography>
                        </MDBox>
                        <MDBox mt={3}>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Date</TableCell>
                                  <TableCell>Plan</TableCell>
                                  <TableCell>Payment</TableCell>
                                  <TableCell>Receipt</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {orderHistory.map((order, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell>{order.plan}</TableCell>
                                    <TableCell>
                                      {order.payment && (
                                        <MDTypography variant="caption" component="div" whiteSpace="pre-line">
                                          {order.payment}
                                        </MDTypography>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {order.receipt && (
                                        <MDButton 
                                          variant="text" 
                                          color="info"
                                          iconOnly
                                        >
                                          <Icon>download</Icon>
                                        </MDButton>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </MDBox>
                      </MDBox>
                    </Card>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      
      {/* Update Payment Method Modal */}
      <Dialog
        open={updatePaymentOpen}
        onClose={() => setUpdatePaymentOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <MDBox display="flex" alignItems="center" justifyContent="space-between">
            <MDTypography variant="h6">Add payment method</MDTypography>
            <IconButton 
              onClick={() => setUpdatePaymentOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </MDBox>
        </DialogTitle>
        <DialogContent>
          <MDBox my={2}>
            <MDBox mb={2}>
              <MDTypography variant="button" fontWeight="medium">
                Card number
              </MDTypography>
              <MDInput
                fullWidth
                type="text"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handlePaymentChange}
                placeholder="1234 1234 1234 1234"
                sx={{ mt: 1 }}
              />
            </MDBox>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <MDTypography variant="button" fontWeight="medium">
                  Expiration date
                </MDTypography>
                <MDInput
                  fullWidth
                  type="text"
                  name="expiryDate"
                  value={paymentData.expiryDate}
                  onChange={handlePaymentChange}
                  placeholder="MM / YY"
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDTypography variant="button" fontWeight="medium">
                  Security code
                </MDTypography>
                <MDInput
                  fullWidth
                  type="text"
                  name="securityCode"
                  value={paymentData.securityCode}
                  onChange={handlePaymentChange}
                  placeholder="CVC"
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={2} mt={1}>
              <Grid item xs={6}>
                <MDTypography variant="button" fontWeight="medium">
                  Country
                </MDTypography>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <Select
                    name="country"
                    value={paymentData.country}
                    onChange={handlePaymentChange}
                    displayEmpty
                    sx={{padding:'12px'}}
                  >
                    <MenuItem value="United States">United States</MenuItem>
                    <MenuItem value="Canada">Canada</MenuItem>
                    <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <MDTypography variant="button" fontWeight="medium">
                  ZIP code
                </MDTypography>
                <MDInput
                  fullWidth
                  type="text"
                  name="zipCode"
                  value={paymentData.zipCode}
                  onChange={handlePaymentChange}
                  placeholder="12345"
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
            
            <MDBox mt={2}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={paymentData.isDefault}
                    onChange={handlePaymentChange}
                    name="isDefault"
                  />
                }
                label="Use as default payment method"
              />
            </MDBox>
            
            <MDBox mt={2}>
              <MDTypography variant="caption" color="text">
                By providing your card information, you allow HackerRank to charge your card for 
                future payments in accordance with their terms.
              </MDTypography>
            </MDBox>
            
            <MDBox mt={2}>
              <MDTypography variant="caption" color="text">
                You can review important information from HackerRank on their 
                <MDTypography
                  component="span"
                  variant="caption"
                  color="info"
                  fontWeight="medium"
                  sx={{ ml: 0.5, cursor: "pointer" }}
                >
                  Terms of Service
                </MDTypography>
                {" and "}
                <MDTypography
                  component="span"
                  variant="caption"
                  color="info"
                  fontWeight="medium"
                  sx={{ cursor: "pointer" }}
                >
                  Privacy Policy
                </MDTypography>
                {" pages."}
              </MDTypography>
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton
            variant="text"
            color="dark"
            onClick={() => setUpdatePaymentOpen(false)}
          >
            Go back
          </MDButton>
          <MDButton
            variant="contained"
            color="success"
          >
            Add
          </MDButton>
        </DialogActions>
      </Dialog>
      
      {/* Update Billing Address Modal */}
      <Dialog
        open={updateAddressOpen}
        onClose={() => setUpdateAddressOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <MDBox display="flex" alignItems="center" justifyContent="space-between">
            <MDTypography variant="h6">Update Billing Address</MDTypography>
            <IconButton 
              onClick={() => setUpdateAddressOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </MDBox>
        </DialogTitle>
        <DialogContent>
          <MDBox my={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <MDTypography variant="button" fontWeight="medium">
                  Address Line 1 <span style={{ color: 'red' }}>*</span>
                </MDTypography>
                <MDInput
                  fullWidth
                  type="text"
                  name="addressLine1"
                  value={addressData.addressLine1}
                  onChange={handleAddressChange}
                  placeholder="Street Address"
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <MDTypography variant="button" fontWeight="medium">
                  Address Line 2
                </MDTypography>
                <MDInput
                  fullWidth
                  type="text"
                  name="addressLine2"
                  value={addressData.addressLine2}
                  onChange={handleAddressChange}
                  placeholder="Building no, flat no, floor, etc."
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <MDTypography variant="button" fontWeight="medium">
                  Country <span style={{ color: 'red' }}>*</span>
                </MDTypography>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <Select
                    name="country"
                    value={addressData.country}
                    onChange={handleAddressChange}
                    displayEmpty
                    placeholder="Select a country"
                    sx={{padding:'12px'}}
                  >
                    <MenuItem value="United States">United States</MenuItem>
                    <MenuItem value="Canada">Canada</MenuItem>
                    <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <MDTypography variant="button" fontWeight="medium">
                  State / Region / Province <span style={{ color: 'red' }}>*</span>
                </MDTypography>
                <MDInput
                  fullWidth
                  type="text"
                  name="state"
                  value={addressData.state}
                  onChange={handleAddressChange}
                  placeholder="State / Region / Province"
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <MDTypography variant="button" fontWeight="medium">
                  City <span style={{ color: 'red' }}>*</span>
                </MDTypography>
                <MDInput
                  fullWidth
                  type="text"
                  name="city"
                  value={addressData.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDTypography variant="button" fontWeight="medium">
                  Postal Code <span style={{ color: 'red' }}>*</span>
                </MDTypography>
                <MDInput
                  fullWidth
                  type="text"
                  name="postalCode"
                  value={addressData.postalCode}
                  onChange={handleAddressChange}
                  placeholder="Postal Code"
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={addressData.updateShipping}
                      onChange={handleAddressChange}
                      name="updateShipping"
                    />
                  }
                  label="Update shipping address as well"
                />
              </Grid>
            </Grid>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton
            variant="text"
            color="dark"
            onClick={() => setUpdateAddressOpen(false)}
          >
            Cancel
          </MDButton>
          <MDButton
            variant="contained"
            color="success"
          >
            Save
          </MDButton>
        </DialogActions>
      </Dialog>
      
      <Footer />
    </DashboardLayout>
  );
}

export default Billing;