import React, { useEffect, useState } from 'react';
import { FaBars } from 'react-icons/fa';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { stallholderDb, interimAuth, interimDb } from '../components/firebase.config';
import SideNav from './side_nav';

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '70px')};
  padding-left: 40px;
  background-color: #fff;
  padding: 2rem;
  width: 100%;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 50px;
  background-color: #188423;
  color: white;
  font-size: 22px;
  font-weight: bold;
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

const VendorDetailsContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
`;

const FieldGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const SaveButton = styled.button`
  background-color: #188423;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
`;

const BackButton = styled.button`
  background-color: #ccc;
  color: black;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
`;

const ImagePreview = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-top: 10px;
`;

const PlaceholderAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: green;
`;

const TimelineContainer = styled.div`
  margin-top: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  background-color: #f9f9f9;
`;

const TimelineItem = styled.div`
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 300px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ModalButton = styled.button`
  background-color: #188423;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
`;

const EditVendors = () => {
  const { Id } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [vendor, setVendor] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchVendorData = async () => {
      const vendorDoc = await getDoc(doc(stallholderDb, 'approvedVendors', Id));
      if (vendorDoc.exists()) {
        setVendor(vendorDoc.data());
      } else {
        console.log('No such vendor!');
      }
    };

    fetchVendorData();
  }, [Id]);

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const user = interimAuth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(interimDb, 'users', user.uid));
        if (userDoc.exists()) {
          setLoggedInUser(userDoc.data());
        }
      }
    };

    fetchLoggedInUser();
  }, []);

  const handleSave = async () => {
    try {
      // Update the vendor document in Firestore
      await updateDoc(doc(stallholderDb, 'approvedVendors', Id), vendor);
      setSuccessMessage('Vendor details updated successfully!');
      setShowModal(true); // Show the modal on success
    } catch (error) {
      console.error('Error updating vendor:', error);
      setSuccessMessage('Error updating vendor details. Please try again.');
      setShowModal(true); // Show the modal on error
    }
  };

  const handleModalClose = () => {
    setShowModal(false); // Close the modal
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <DashboardContainer>
      <SideNav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} />
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>
      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <div>Edit Vendor Details</div>
          <BackButton onClick={handleBack}>Back</BackButton> {/* Back Button */}
        </AppBar>
        {vendor && (
          <VendorDetailsContainer>
            <FieldGroup>
              <Label>Profile Image</Label>
              {vendor.profileImageUrls && vendor.profileImageUrls.length > 0 ? (
                <ImagePreview
                  src={vendor.profileImageUrls[0]} // Profile image URL
                  alt="Profile"
                />
              ) : (
                <PlaceholderAvatar>
                  <span role="img" aria-label="user">👤</span>
                </PlaceholderAvatar>
              )}
            </FieldGroup>
            <FieldGroup>
              <Label>Email</Label>
              <Input type="email" value={vendor.email} onChange={(e) => setVendor({ ...vendor, email: e.target.value })} />
            </FieldGroup>
            <FieldGroup>
              <Label>First Name</Label>
              <Input type="text" value={vendor.firstName} onChange={(e) => setVendor({ ...vendor, firstName: e.target.value })} />
            </FieldGroup>
            <FieldGroup>
              <Label>Middle Name</Label>
              <Input type="text" value={vendor.middleName} onChange={(e) => setVendor({ ...vendor, middleName: e.target.value })} />
            </FieldGroup>
            <FieldGroup>
              <Label>Last Name</Label>
              <Input type="text" value={vendor.lastName} onChange={(e) => setVendor({ ...vendor, lastName: e.target.value })} />
            </FieldGroup>
            <FieldGroup>
              <Label>Contact Number</Label>
              <Input type="text" value={vendor.contactNumber} onChange={(e) => setVendor({ ...vendor, contactNumber: e.target.value })} />
            </FieldGroup>
            <FieldGroup>
              <Label>Barangay</Label>
              <Input type="text" value={vendor.barangay} onChange={(e) => setVendor({ ...vendor, barangay: e.target.value })} />
            </FieldGroup>
            <FieldGroup>
              <Label>City</Label>
              <Input type="text" value={vendor.city} onChange={(e) => setVendor({ ...vendor, city: e.target.value })} />
            </FieldGroup>
            <FieldGroup>
              <Label>Stall Location</Label>
              <Input type="text" value={vendor.stallInfo.location} onChange={(e) => setVendor({ ...vendor, stallInfo: { ...vendor.stallInfo, location: e.target.value } })} />
            </FieldGroup>
            <FieldGroup>
              <Label>Stall Number</Label>
              <Input type="text" value={vendor.stallInfo.stallNumber} onChange={(e) => setVendor({ ...vendor, stallInfo: { ...vendor.stallInfo, stallNumber: e.target.value } })} />
            </FieldGroup>
            <FieldGroup>
              <Label>Rate Per Meter</Label>
              <Input type="text" value={vendor.stallInfo.ratePerMeter} onChange={(e) => setVendor({ ...vendor, stallInfo: { ...vendor.stallInfo, ratePerMeter: e.target.value } })} />
            </FieldGroup>
            <FieldGroup>
              <Label>Stall Size</Label>
              <Input type="text" value={vendor.stallInfo.stallSize} onChange={(e) => setVendor({ ...vendor, stallInfo: { ...vendor.stallInfo, stallSize: e.target.value } })} />
            </FieldGroup>
            <ButtonGroup>
              <SaveButton onClick={handleSave}>Save Changes</SaveButton>
            </ButtonGroup>
          </VendorDetailsContainer>
        )}
        {/* Timeline Section */}
        {vendor && vendor.timeline && vendor.timeline.length > 0 ? (
          <TimelineContainer>
            <h3>Timeline</h3>
            {vendor.timeline.map((item, index) => (
              <TimelineItem key={index}>
                <p><strong>Status:</strong> {item.status}</p>
                <p><strong>Message:</strong> {item.message}</p>
                <p><strong>Email:</strong> {item.email}</p>
                <p><strong>Timestamp:</strong> {item.timestamp.toDate().toLocaleString()}</p>
                {item.uploadedImageUrl && (
                  <ImagePreview src={item.uploadedImageUrl} alt={`Timeline upload ${index + 1}`} />
                )}
              </TimelineItem>
            ))}
          </TimelineContainer>
        ) : (
          <TimelineContainer>
            <h3>Timeline</h3>
            <p>No timeline data available.</p>
          </TimelineContainer>
        )}
      </MainContent>

      {/* Modal for Success Message */}
      {showModal && (
        <ModalOverlay>
          <ModalContainer>
            <h3>Success!</h3>
            <p>{successMessage}</p>
            <ModalButton onClick={handleModalClose}>Close</ModalButton>
          </ModalContainer>
        </ModalOverlay>
      )}
    </DashboardContainer>
  );
};

export default EditVendors;
