import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rentmobileDb, rentmobileAuth } from '../components/firebase.config';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Button, CircularProgress, Typography, Grid, Card, CardContent, TextField, Box, FormHelperText, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Autocomplete } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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

const StyledTextField = styled(TextField)`
  margin-bottom: 1rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ModalButton = styled.button`
  background-color: #188423;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background-color: #145c17;
  }
`;

const centralVisayasData = {
  region: 'Central Visayas',
  provinces: {
    Cebu: {
      cities: [
        'Alcantara', 
    'Alcoy', 
    'Alegria', 
    'Argao', 
    'Asturias', 
    'Badian', 
    'Balamban', 
    'Bantayan', 
    'Barili', 
    'Bogo City',
    'Boljoon', 
    'Borbon', 
    'Carcar City', 
    'Catmon', 
    'Cebu City',
    'Consolacion', 
    'Cordova', 
    'Danao City', 
    'Dalaguete', 
    'Dumanjug', 
    'Ginatilan', 
    'Lapu-Lapu City',
    'Liloan', 
    'Madridejos', 
    'Malabuyoc', 
    'Mandaue City',
    'Medellin', 
    'Minglanilla', 
    'Moalboal', 
    'Naga City',
    'Oslob', 
    'Pilar', 
    'Pinamungajan',
    'Poro', 
    'San Fernando',
    'San Francisco (Pacijan Island)', 
    'San Remigio',
    'Santa Fe (Bantayan Island)', 
    'Santander',
    'Sibonga',
    'Sogod',
    'Tabogon',
    'Tabuelan',
    'Talisay City',
    'Toledo City',
      ],
      barangays: [
        // Add barangays for each city here
        // Example for Cebu City
        'Apas', 'Banilad', 'Basak San Nicolas', 'Basak Pardo', 'Busay', 'Capitol Site', 'Carreta', 'Guadalupe', 'Lahug', 'Mabolo', 'Mambaling', 'Pardo', 'Punta Princesa', 'Sambag I', 'Sambag II', 'Talamban', 'Tejero',
        // Add more barangays for other cities
      ],
    },
    Bohol: {
      cities: [
        'Tagbilaran City',
      ],
      barangays: [
        // Add barangays for each city here
      ],
    },
    NegrosOriental: {
      cities: [
        'Dumaguete City',
        'Bais City',
        'Tanjay City',
        'Bayawan City',
        'Guihulngan City',
        'Canlaon City',
      ],
      barangays: [
        // Add barangays for each city here
      ],
    },
    Siquijor: {
      cities: [
        // No cities in Siquijor
      ],
      barangays: [
        // Add barangays for each city here
      ],
    },
  },
};

const EditStall = () => {
  const { id } = useParams();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [stall, setStall] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const [newVendor, setNewVendor] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    barangay: '',
    city: '',
    billingCycle: '',
    dateOfRegistration: new Date().toISOString(),
    section: '', // Add section field
  });

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loadingVendor, setLoadingVendor] = useState(false);
  const [billingCycles, setBillingCycles] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [sectionOptions, setSectionOptions] = useState([]);

  useEffect(() => {
    const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
    if (loggedInUserData) {
      setLoggedInUser(loggedInUserData);
    }

    const fetchStall = async () => {
      try {
        const stallRef = doc(rentmobileDb, 'Stall', id);
        const stallSnap = await getDoc(stallRef);

        if (stallSnap.exists()) {
          const stallData = stallSnap.data();
          setStall(stallData);

          if (stallData.status === 'Occupied') {
            const vendorQuery = query(
              collection(rentmobileDb, 'approvedVendors'),
              where('stallId', '==', id)
            );
            const vendorSnapshot = await getDocs(vendorQuery);
            if (!vendorSnapshot.empty) {
              setVendor(vendorSnapshot.docs[0].data());
            }
          }

          // Fetch ratePerMeter from billingconfig
          const billingConfigQuery = query(
            collection(rentmobileDb, 'billingconfig'),
            where('title', '==', 'RateperMeter')
          );
          const billingConfigSnapshot = await getDocs(billingConfigQuery);
          if (!billingConfigSnapshot.empty) {
            const ratePerMeterData = billingConfigSnapshot.docs[0].data();
            setStall((prevStall) => ({
              ...prevStall,
              ratePerMeter: `${ratePerMeterData.type1}${ratePerMeterData.value1}`,
            }));
          }
        } else {
          console.error('No stall found');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching stall:', error);
        setLoading(false);
      }
    };

    fetchStall();
  }, [id]);

  useEffect(() => {
    if (stall) {
      const getSectionOptions = () => {
        if (stall.location === 'Unit 1') {
          return ['Fish', 'Meats (pork and beef)', 'Chicken', 'Karenderya', 'Ice'];
        } else if (stall.location === 'Unit 2') {
          return ['Grocery', 'Vegetables', 'Dry Goods', 'Karenderya', 'Frozen Goods', 'Fruits', 'Flowers'];
        } else if (stall.location === 'Unit 3') {
          return ['Fruit', 'Vegetables', 'Karenderya', 'Storage'];
        }
        return [];
      };

      setSectionOptions(getSectionOptions());
    }
  }, [stall]);

  const handleSave = async () => {
    try {
      const stallRef = doc(rentmobileDb, 'Stall', id);
      await updateDoc(stallRef, {
        ratePerMeter: stall.ratePerMeter,
        stallSize: stall.stallSize
      });
      console.log('Stall updated successfully');
    } catch (error) {
      console.error('Error updating stall:', error);
    }
  };

  const calculateDailyPayment = () => {
    if (stall) {
      const ratePerMeter = parseFloat(stall.ratePerMeter?.replace('₱', '') || '0') || 0;
      const stallSize = parseFloat(stall.stallSize) || 0;
      return (ratePerMeter * stallSize).toFixed(2);
    }
    return '0.00';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchBillingCycles = async () => {
    try {
      const billingCyclesCollection = collection(rentmobileDb, 'billingconfig');
      const billingCyclesSnapshot = await getDocs(billingCyclesCollection);
      const cycles = [];

      billingCyclesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.title.toLowerCase() === 'billing cycle') {
          for (let i = 1; i <= 3; i++) {
            const label = data[`label${i}`];
            if (label) {
              cycles.push(label);
            }
          }
        }
      });

      setBillingCycles(cycles);
    } catch (error) {
      console.error('Error fetching billing cycles:', error);
    }
  };

  useEffect(() => {
    fetchBillingCycles();
  }, []);

  const handleAddVendor = async () => {
    setError('');
    setLoadingVendor(true);

    if (newVendor.password !== newVendor.confirmPassword) {
      setError('Passwords do not match');
      setLoadingVendor(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(rentmobileAuth, newVendor.email, newVendor.password);
      const user = userCredential.user;

      const stallInfo = {
        location: stall?.location || '',
        ratePerMeter: stall?.ratePerMeter || '',
        stallNumber: stall?.stallNumber || '',
        stallSize: stall?.stallSize || '',
        status: stall?.status || 'Occupied',
      };

      await setDoc(doc(rentmobileDb, 'Vendorusers', user.uid), {
        firstName: newVendor.firstName,
        middleName: newVendor.middleName,
        lastName: newVendor.lastName,
        email: newVendor.email,
        contactNumber: `+63${newVendor.contactNumber}`, // Store with +63
        barangay: newVendor.barangay,
        city: selectedCity, // Store selected city
        province: selectedProvince, // Add selected province
        region: selectedRegion, // Add selected region
        billingCycle: newVendor.billingCycle,
        dateOfRegistration: new Date(),
        stallId: id,
        stallInfo,
        status: 'pending',
        section: newVendor.section, // Store the selected section
      });

      // Update the stall status to "Unavailable"
      await updateDoc(doc(rentmobileDb, 'Stall', id), {
        status: 'Unavailable',
      });

      setIsSuccessModalOpen(true);

      setNewVendor({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        contactNumber: '',
        barangay: '',
        city: '',
        province: '', // Reset province
        region: '', // Reset region
        billingCycle: '',
        dateOfRegistration: new Date().toISOString(),
        section: '', // Reset section
      });

      setSelectedRegion('');
      setSelectedProvince('');
      setSelectedCity('');
      setSelectedBarangay('');

    } catch (error) {
      console.error('Error adding vendor:', error);
      setError(`An error occurred while adding the vendor: ${error.message}`);
    } finally {
      setLoadingVendor(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!stall) {
    return <Typography>No stall data found</Typography>;
  }

  return (
    <Container>
      <SideNav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} />
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>

      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <h1>Add Vendor</h1>
          <Button onClick={() => navigate(-1)} sx={{ color: 'white' }}>
            Back
          </Button>
        </AppBar>

        <FormContainer>
          <Grid container spacing={4}>
            {/* Left Side: Add Vendor Information */}
            <Grid item xs={12} md={6}>
              <Box component="form" noValidate sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {/* Personal Information */}
                  <Grid item xs={12}>
                    <SectionHeader>Personal Details</SectionHeader>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="First Name"
                      value={newVendor.firstName}
                      fullWidth
                      variant="outlined"
                      onChange={(e) => setNewVendor({ ...newVendor, firstName: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Middle Name"
                      value={newVendor.middleName}
                      fullWidth
                      variant="outlined"
                      onChange={(e) => setNewVendor({ ...newVendor, middleName: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Last Name"
                      value={newVendor.lastName}
                      fullWidth
                      variant="outlined"
                      onChange={(e) => setNewVendor({ ...newVendor, lastName: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Email"
                      type="email"
                      value={newVendor.email}
                      fullWidth
                      variant="outlined"
                      onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Contact Number"
                      value={newVendor.contactNumber}
                      fullWidth
                      variant="outlined"
                      onChange={(e) => {
                        const input = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                        const numericValue = input.startsWith('63') ? input.slice(2) : input; // Remove '63' if already added
                        const formattedValue = numericValue.slice(0, 10); // Limit to 10 digits
                        setNewVendor({ ...newVendor, contactNumber: formattedValue });
                      }}
                      InputProps={{
                        startAdornment: <Typography sx={{ marginRight: 1 }}>+63</Typography>,
                      }}
                      inputProps={{
                        pattern: "[0-9]*", // Allow only numeric input
                        maxLength: 10, // Limit input to 10 digits for the contact number
                      }}
                    />
                  </Grid>

                  {/* Password Information */}
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={newVendor.password}
                      fullWidth
                      variant="outlined"
                      onChange={(e) => setNewVendor({ ...newVendor, password: e.target.value })}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={newVendor.confirmPassword}
                      fullWidth
                      variant="outlined"
                      onChange={(e) => setNewVendor({ ...newVendor, confirmPassword: e.target.value })}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Address Information */}
                  <Grid item xs={12}>
                    <SectionHeader>Address Information</SectionHeader>
                  </Grid>
                  <Grid container spacing={2}>
                    {/* Region */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Region</InputLabel>
                        <Select
                          value={selectedRegion}
                          onChange={(e) => {
                            setSelectedRegion(e.target.value);
                            setSelectedProvince('');
                            setSelectedCity('');
                            setSelectedBarangay('');
                          }}
                          label="Region"
                        >
                          <MenuItem value="Central Visayas">Central Visayas</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Province */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Province</InputLabel>
                        <Select
                          value={selectedProvince}
                          onChange={(e) => {
                            setSelectedProvince(e.target.value);
                            setSelectedCity('');
                            setSelectedBarangay('');
                          }}
                          label="Province"
                          disabled={!selectedRegion}
                        >
                          {selectedRegion &&
                            Object.keys(centralVisayasData.provinces).map((province) => (
                              <MenuItem key={province} value={province}>
                                {province}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* City */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>City</InputLabel>
                        <Select
                          value={selectedCity}
                          onChange={(e) => {
                            setSelectedCity(e.target.value);
                            setSelectedBarangay('');
                          }}
                          label="City"
                          disabled={!selectedProvince}
                        >
                          {selectedProvince &&
                            centralVisayasData.provinces[selectedProvince].cities.map((city) => (
                              <MenuItem key={city} value={city}>
                                {city}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Barangay */}
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        label="Barangay"
                        value={newVendor.barangay}
                        fullWidth
                        variant="outlined"
                        onChange={(e) => setNewVendor({ ...newVendor, barangay: e.target.value })}
                      />
                    </Grid>
                  </Grid>

                  {/* Other Details */}
                  <Grid item xs={12}>
                    <Autocomplete
                      options={billingCycles}
                      value={newVendor.billingCycle}
                      onChange={(event, newValue) => setNewVendor({ ...newVendor, billingCycle: newValue })}
                      renderInput={(params) => <TextField {...params} label="Billing Cycle" variant="outlined" fullWidth />}
                    />
                  </Grid>

                  {/* Section Dropdown */}
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Section</InputLabel>
                      <Select
                        value={newVendor.section}
                        onChange={(e) => setNewVendor({ ...newVendor, section: e.target.value })}
                        label="Section"
                      >
                        {sectionOptions.map((section) => (
                          <MenuItem key={section} value={section}>
                            {section}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button variant="contained" color="success" onClick={handleAddVendor} fullWidth>
                      Add Vendor
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Right Side: Stall Info */}
            <Grid item xs={12} md={6}>
              <StyledCard status={stall.status}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Stall {stall.stallNumber} -{' '}
                    <GreenText status={stall.status}>{stall.status}</GreenText>
                  </Typography>
                  <InfoTypography>
                    <strong>Location:</strong> {stall.location || 'N/A'}
                  </InfoTypography>
                  <InfoTypography>
                    <strong>Size:</strong> {stall.stallSize || 'N/A'}
                  </InfoTypography>
                  <InfoTypography>
                    <strong>Rate per Meter:</strong> {stall.ratePerMeter || 'N/A'}
                  </InfoTypography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', marginTop: 2 }}>
                    <strong>Daily Payment:</strong> ₱{calculateDailyPayment()}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </FormContainer>
      </MainContent>

      {isSuccessModalOpen && (
        <ModalOverlay>
          <ModalContainer>
            <Typography variant="h6" gutterBottom>
              Vendor Added Successfully!
            </Typography>
            <ModalButton onClick={() => setIsSuccessModalOpen(false)}>
              OK
            </ModalButton>
          </ModalContainer>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default EditStall;