import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rentmobileDb } from '../components/firebase.config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Button, CircularProgress, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import SideNav from './side_nav';
import { FaBars } from 'react-icons/fa';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '70px')};
  padding: 2rem;
  background-color: #fff;
  width: 100%;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #188423;
  color: white;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  font-size: 18px;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
  margin-bottom: 50px;
`;

const ToggleButton = styled.div`
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'none' : 'block')};
  position: absolute;
  top: 5px;
  left: 15px;
  font-size: 1.8rem;
  color: #333;
  cursor: pointer;
  z-index: 200;
`;

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1.5rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    th, td {
      padding: 15px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
    }

    th {
      background-color: #e9ecef;
    }

    tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    tr:nth-child(odd) {
      background-color: #ffffff;
    }

    .actions {
      display: flex;
      gap: 5px;
    }

    .action-button {
      display: flex;
      align-items: center;
      border: none;
      background: none;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #0056b3;
      }

      .icon {
        font-size: 24px;
        color: black;
      }
    }
  }
`;

const StyledCard = styled(Card)`
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background-color: #ffffff;
  padding: 16px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 250px;
  border-left: 6px solid ${({ status }) => (status === 'Available' ? '#4caf50' : '#f44336')};
  justify-content: space-between;
`;

const GreenText = styled.span`
  color: ${({ status }) => (status === 'Available' ? '#4caf50' : '#f44336')};
`;

const InfoTypography = styled(Typography)`
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
`;

const SectionHeader = styled(Typography)`
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  border-bottom: 2px solid #ddd;
  padding-bottom: 0.5rem;
`;

const ViewVendor = () => {
  const { id } = useParams();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
    if (loggedInUserData) {
      setLoggedInUser(loggedInUserData);
    }

    const fetchVendor = async () => {
      try {
        const vendorRef = doc(rentmobileDb, 'declinedVendors', id);
        const vendorSnap = await getDoc(vendorRef);

        if (vendorSnap.exists()) {
          const vendorData = vendorSnap.data();
          setVendor(vendorData);
        } else {
          console.error('No vendor found');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching vendor:', error);
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!vendor) {
    return <Typography>No vendor data found</Typography>;
  }

  return (
    <Container>
      <SideNav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} />
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>

      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <h1>View Vendor</h1>
          <Button onClick={() => navigate(-1)} sx={{ color: 'white' }}>
            Back
          </Button>
        </AppBar>

        <FormContainer>
          <Grid container spacing={4}>
            {/* Left Side: Vendor Information */}
            <Grid item xs={12} md={6}>
              <Box component="form" noValidate sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {/* Personal Information */}
                  <Grid item xs={12}>
                    <SectionHeader>Vendor Details</SectionHeader>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoTypography>
                      <strong>First Name:</strong> {vendor.firstName || 'N/A'}
                    </InfoTypography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoTypography>
                      <strong>Middle Name:</strong> {vendor.middleName || 'N/A'}
                    </InfoTypography>
                  </Grid>
                  <Grid item xs={12}>
                    <InfoTypography>
                      <strong>Last Name:</strong> {vendor.lastName || 'N/A'}
                    </InfoTypography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoTypography>
                      <strong>Email:</strong> {vendor.email || 'N/A'}
                    </InfoTypography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoTypography>
                      <strong>Contact Number:</strong> {vendor.contactNumber || 'N/A'}
                    </InfoTypography>
                  </Grid>

                  {/* Address Information */}
                  <Grid item xs={12}>
                    <SectionHeader>Address Information</SectionHeader>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoTypography>
                      <strong>Barangay:</strong> {vendor.barangay || 'N/A'}
                    </InfoTypography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoTypography>
                      <strong>City:</strong> {vendor.city || 'N/A'}
                    </InfoTypography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoTypography>
                      <strong>Billing Cycle:</strong> {vendor.billingCycle || 'N/A'}
                    </InfoTypography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Right Side: Stall Info */}
            <Grid item xs={12} md={6}>
              <StyledCard status={vendor.status}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Stall {vendor.stallInfo?.stallNumber} -{' '}
                    <GreenText status={vendor.status}>{vendor.status}</GreenText>
                  </Typography>
                  <InfoTypography>
                    <strong>Location:</strong> {vendor.stallInfo?.location || 'N/A'}
                  </InfoTypography>
                  <InfoTypography>
                    <strong>Size:</strong> {vendor.stallInfo?.stallSize || 'N/A'}
                  </InfoTypography>
                  <InfoTypography>
                    <strong>Rate per Meter:</strong> {vendor.stallInfo?.ratePerMeter || 'N/A'}
                  </InfoTypography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', marginTop: 2 }}>
                    <strong>Daily Payment:</strong> ₱{vendor.stallInfo?.dailyPayment || 'N/A'}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </FormContainer>
      </MainContent>
    </Container>
  );
};

export default ViewVendor;