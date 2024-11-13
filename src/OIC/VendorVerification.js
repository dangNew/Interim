import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaSearch } from 'react-icons/fa';
import { collection, getDocs, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { interimDb, stallholderDb } from '../components/firebase.config';
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

const VendorListContainer = styled.div`
  margin-top: 20px;
`;

const VendorItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  background-color: #fff;
`;

const VendorInfo = styled.div`
  flex: 1;
  cursor: pointer; 
  color: black; 
  text-decoration: none; 
`;

const ActionButton = styled.button`
  background-color: ${({ action }) => (action === 'approve' ? '#4CAF50' : '#F44336')};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px; 
  margin-bottom: 20px;
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 20px;
  width: 900px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
  font-size: 16px;
  color: #333;
`;

const FilterButton = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  background-color: #188423;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #145c17;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 200px;

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;

    li {
      padding: 10px;
      cursor: pointer;

      &:hover {
        background-color: #f0f0f0;
      }
    }
  }
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
  z-index: 200;
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

const CancelButton = styled(ModalButton)`
  background-color: red; 
  margin-left: 10px; 

  &:hover {
    background-color: gray;
  }
`;

const declineReasons = [
  'Document requested not uploaded',
  'Uploaded fake ID',
  'Incomplete application',
  'Incorrect information provided',
  'Application does not meet criteria',
  'Fake Information'
];

const VendorVerification = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [unitNames, setUnitNames] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentVendorId, setCurrentVendorId] = useState(null);
  const [actionType, setActionType] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [selectedDeclineReason, setSelectedDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
    if (loggedInUserData) {
      setLoggedInUser(loggedInUserData);
    }
      const fetchPendingVendors = async () => {
        try {
          const querySnapshot = await getDocs(collection(stallholderDb, 'users'));
          const allVendors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Filter out vendors with an occupied stall status
          const pendingVendors = allVendors.filter(vendor => 
            vendor.status?.toLowerCase() === 'pending' && vendor.stallInfo?.status !== 'Occupied'
          );
          
          setVendors(pendingVendors);
          setFilteredVendors(pendingVendors);
        } catch (error) {
          console.error('Error fetching pending vendors:', error);
        }
      };
    
      // Other useEffect code remains unchanged
    }, []);
    
    useEffect(() => {
      let updatedVendors = vendors;
    
      if (searchQuery) {
        updatedVendors = updatedVendors.filter(vendor =>
          `${vendor.firstName} ${vendor.middleName} ${vendor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    
      if (selectedLocation !== 'All Locations') {
        updatedVendors = updatedVendors.filter(vendor =>
          vendor.stallInfo?.location?.toLowerCase() === selectedLocation.toLowerCase()
        );
      }
    
      // Filter out vendors with an occupied stall status here as well
      updatedVendors = updatedVendors.filter(vendor => vendor.stallInfo?.status !== 'Occupied');
    
      setFilteredVendors(updatedVendors);
    }, [searchQuery, selectedLocation, vendors]);
    

  const handleApprove = async (vendorId) => {
    try {
      // Get a reference to the vendor document
      const vendorRef = doc(stallholderDb, 'users', vendorId);
      
      // Update vendor status and stall status
      await updateDoc(vendorRef, {
        status: 'accepted',
        'stallInfo.status': 'Occupied' // Update stall status to Occupied
      });
  
      // Fetch the updated vendor data
      const vendorSnapshot = await getDoc(vendorRef);
      const vendorData = vendorSnapshot.data(); 
  
      // Transfer vendor data to approvedVendors collection
      await setDoc(doc(stallholderDb, 'approvedVendors', vendorId), {
        ...vendorData,
        approvedBy: loggedInUser.email, // Log the email of the user who approved
        approvedAt: new Date() // Optional: add a timestamp for when the approval happened
      });
  
      // Remove vendor from the current list after approval
      setVendors(vendors.filter(vendor => vendor.id !== vendorId));
      setFilteredVendors(filteredVendors.filter(vendor => vendor.id !== vendorId));
  
      // Show success message
      setIsSuccessModal(true);
      setSuccessMessage('Vendor approved successfully!');
    } catch (error) {
      console.error('Error approving vendor:', error);
    }
  };
  

  const handleDecline = async () => {
    try {
      // Get a reference to the vendor document
      const vendorRef = doc(stallholderDb, 'users', currentVendorId);
  
      // Update the vendor's status to 'declined'
      await updateDoc(vendorRef, { status: 'declined' });
  
      // Fetch the vendor's current data
      const vendorSnapshot = await getDoc(vendorRef);
      const vendorData = vendorSnapshot.data();
  
      // Transfer the vendor's data to the 'declinedVendors' collection
      await setDoc(doc(stallholderDb, 'declinedVendors', currentVendorId), {
        ...vendorData,
        reason: selectedDeclineReason || declineReason, // Use the selected decline reason or the optional textarea input
        declinedBy: loggedInUser.email, // Store the email of the user who declined the vendor
        declinedAt: new Date() // Store the timestamp when the vendor was declined
      });
  
      // Remove the declined vendor from the current list in the UI
      setVendors(vendors.filter(vendor => vendor.id !== currentVendorId));
      setFilteredVendors(filteredVendors.filter(vendor => vendor.id !== currentVendorId));
  
      // Clear the decline reason input
      setDeclineReason('');
      setSelectedDeclineReason('');
      setShowDeclineModal(false);
  
      // Show a success message to the user
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error declining vendor:', error);
    }
  };
  
  
  const handleAction = (action) => {
    if (action === 'approve') {
        handleApprove(currentVendorId);
    } else if (action === 'decline') {
        handleDecline();
    }
    setShowModal(false);

    // Only set success message for decline action
    if (action === 'decline') {
        setIsSuccessModal(true);
        setSuccessMessage('Declined vendor successfully!');
    }
};

      

  return (
    <DashboardContainer>
      <SideNav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} />
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>
      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <div>Vendor Verification</div>
        </AppBar>

        <FilterContainer>
          <SearchBarContainer>
            <FaSearch />
            <SearchInput
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBarContainer>
          <FilterButton>
            <DropdownButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {selectedLocation}
            </DropdownButton>
            {isDropdownOpen && (
              <DropdownMenu>
                <ul>
                  <li onClick={() => { setSelectedLocation('All Locations'); setIsDropdownOpen(false); }}>All Locations</li>
                  {unitNames.map(unit => (
                    <li key={unit} onClick={() => { setSelectedLocation(unit); setIsDropdownOpen(false); }}>{unit}</li>
                  ))}
                </ul>
              </DropdownMenu>
            )}
          </FilterButton>
        </FilterContainer>

        <VendorListContainer>
          {filteredVendors.map(vendor => (
            <VendorItem key={vendor.id}>
              <VendorInfo
                onClick={() => navigate(`/edit-verification/${vendor.id}`)} // Navigate to EditVerification
              >
                {vendor.firstName} {vendor.middleName} {vendor.lastName}
              </VendorInfo>
              <div>
                <ActionButton
                  action="approve"
                  onClick={() => {
                    setCurrentVendorId(vendor.id);
                    setActionType('approve');
                    setShowModal(true);
                  }}
                >
                  Approve
                </ActionButton>
                <ActionButton
                  action="decline"
                  onClick={() => {
                    setCurrentVendorId(vendor.id);
                    setActionType('decline');
                    setShowDeclineModal(true);
                  }}
                >
                  Decline
                </ActionButton>
              </div>
            </VendorItem>
          ))}
        </VendorListContainer>

        {/* Confirmation Modal */}
        {showModal && (
          <ModalOverlay>
            <ModalContainer>
              <h3>{actionType === 'approve' ? 'Approve Vendor' : 'Decline Vendor'}</h3>
              <p>Are you sure you want to {actionType} this vendor?</p>
              <ModalButton onClick={() => handleAction(actionType)}>Confirm</ModalButton>
              <CancelButton onClick={() => setShowModal(false)}>Cancel</CancelButton>
            </ModalContainer>
          </ModalOverlay>
        )}

        {/* Decline Reason Modal */}
        {showDeclineModal && (
          <ModalOverlay>
            <ModalContainer>
              <h3>Decline Vendor</h3>
              <p>Please select a reason for declining:</p>
              <select 
                value={selectedDeclineReason} 
                onChange={(e) => setSelectedDeclineReason(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' }}
              >
                <option value="">Select a reason</option>
                {declineReasons.map((reason, index) => (
                  <option key={index} value={reason}>{reason}</option>
                ))}
              </select>
              <textarea 
                rows="4" 
                value={declineReason} 
                onChange={(e) => {
                  if (e.target.value.split(/\s+/).length <= 100) {
                    setDeclineReason(e.target.value);
                  }
                }} 
                placeholder="Optional: Enter additional reason here (max 100 words)"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <ModalButton onClick={handleDecline} disabled={!selectedDeclineReason && !declineReason}>
                Confirm Decline
              </ModalButton>
              <CancelButton onClick={() => setShowDeclineModal(false)}>Cancel</CancelButton>
            </ModalContainer>
          </ModalOverlay>
        )}

        {/* Success Modal */}
        {isSuccessModal && (
          <ModalOverlay>
            <ModalContainer>
              <h3>{successMessage}</h3>
              <ModalButton onClick={() => setIsSuccessModal(false)}>Close</ModalButton>
            </ModalContainer>
          </ModalOverlay>
        )}

        {/* Success Dialog */}
        {showSuccessDialog && (
        <ModalOverlay>
            <ModalContainer>
            <h3>Successfully Declined a Vendor</h3>
            <ModalButton onClick={() => setShowSuccessDialog(false)}>Close</ModalButton>
            </ModalContainer>
        </ModalOverlay>
        )}

      </MainContent>
    </DashboardContainer>
  );
};

export default VendorVerification;