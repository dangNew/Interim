import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars,FaCheckCircle, FaRegCircle, FaClock, FaUserCircle } from 'react-icons/fa';
import { getDoc, doc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { stallholderDb } from '../components/firebase.config';
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

const BackButton = styled.button`
  background-color: #ccc;
  color: black;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
`;

const HorizontalLine = styled.hr`
  border: none;
  height: 1px;
  background-color: #ccc;
  margin: 5px 0; 
`;

const VendorProfile = styled.div`
  background-color: #188423;
  color: white;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const VendorInfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const VendorImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
`;

const DetailsContainer = styled.div`
  display: flex; 
  gap: 20px; 
`;

const PersonalInfoContainer = styled.div`
  flex: 1;
  background-color: #f9f9f9; 
  border-radius: 10px; 
  padding: 20px; 
`;

const StallContainer = styled.div`
  flex: 1; 
  background-color: #f9f9f9; 
  border-radius: 10px; 
  padding: 20px; 
`;

const VendorIcon = styled(FaUserCircle)`
  font-size: 80px;
  margin-right: 20px;
`;

const VendorNameAndStatus = styled.div`
  display: flex;
  flex-direction: column;
`;

const VendorName = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-weight: bold;

  ${({ type }) =>
    type === 'approve'
      ? 'background-color: yellowgreen;'
      : type === 'decline'
      ? 'background-color: red;'
      : 'background-color: blue;'}
`;

const Status = styled.div`
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  margin-top: 5px;
`;

const VendorDetailsContainer = styled.div`
  margin-top: 20px;
`;

const VendorInfo = styled.div`
  margin-bottom: 10px;
  color: black; 
  
  strong {
    color: gray;
    font-weight: normal; 
    font-size: 14px;
  }
`;

const TimelineTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-top: 30px;
  margin-bottom: 10px;
  color: #188423;
`;

const VendorTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 30px;
  color: #188423;
`;

const StallTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 30px;
  color: #188423;
`;


const TimelineContainer = styled.div`
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
`;

const RequestItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  position: relative;
`;

const StatusIcons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 10px;
`;

const Divider = styled.div`
  height: 30px;
  width: 2px;
  background-color: gray;
`;

const RequestInfo = styled.div`
  flex-grow: 1;
`;

const RequestTimestamp = styled.p`
  font-size: 12px;
  color: grey;
`;

const UploadedImage = styled.img`
  width: 100px;
  height: auto;
  margin-top: 10px;
  border-radius: 5px;
  cursor: pointer;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;  
  border-radius: 10px;
  text-align: center;
  position: relative;
  max-height: 80vh; 
  overflow-y: auto; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
`;

const DownloadButton = styled.button`
  background-color: #28a745;  
  color: white;
  padding: 10px 20px; 
  border: none;
  border-radius: 5px; 
  cursor: pointer;
  font-size: 16px; 
  font-weight: bold;
  margin-top: 15px; 

  &:hover {
    background-color: #218838; 
    transition: background-color 0.3s; 
  }
`;

const ButtonContainer1 = styled.div`
  display: flex;
  justify-content: space-between; 
  width: 100%; 
  margin-top: 10px; 
`;


const PreviewedImage = styled.img`
  max-width: 40%; 
  height: auto; /* Maintain aspect ratio */
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const RequestInfoDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const DialogTitle = styled.h2`
  margin-bottom: 20px;
`;

const DialogInput = styled.textarea`
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-bottom: 20px;
`;

const DialogButton = styled.button`
  background-color: #188423;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
`;

const CancelButton = styled.button`
  background-color: #ccc;
  color: black;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
`;

const MessageList = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const MessageButton = styled.button`
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: #f0f0f0;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #ccc;
  }
`;
const AlertModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const AlertContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  width: 300px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const AlertTitle = styled.h2`
  margin-bottom: 20px;
  font-size: 18px;
`;

const AlertButton = styled.button`
  background-color: #188423;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
`;
const SuccessAlertModal = styled(AlertModal)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SuccessAlertContent = styled(AlertContent)`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  color: black;

  &:hover {
    background-color: white;
  }
`;

const SuccessAlertTitle = styled(AlertTitle)`
  color: black;
  font-size: 20px;
  margin-bottom: 10px;
`;

const SuccessAlertMessage = styled.div`
  color: black;
  font-size: 16px;
`;

const CloseSuccessAlertButton = styled.button`
  background-color: #188423;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 15px;

  &:hover {
    background-color: #218838;
  }
`; 

const EditVerification = () => {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false); 
  const [isSuccessAlertOpen, setIsSuccessAlertOpen] = useState(false);
  const [filteredVendors, setFilteredVendors] = useState([]); // Filtered vendors
  const [vendors, setVendors] = useState([]); // Vendors list
  const [declineReason, setDeclineReason] = useState('');
  const [selectedDeclineReason, setSelectedDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
    if (loggedInUserData) {
      setLoggedInUser(loggedInUserData);
    }
  
    const fetchVendorDetails = async () => {
      try {
        const vendorRef = doc(stallholderDb, 'users', vendorId);
        const vendorDoc = await getDoc(vendorRef);
        if (vendorDoc.exists()) {
          const vendorData = { id: vendorDoc.id, ...vendorDoc.data() };
          setVendor(vendorData);
          // Check if the vendor has a timeline and set it
          if (vendorData.timeline) {
            setLoggedInUser((prev) => ({ ...prev, timeline: vendorData.timeline }));
          }
        } else {
          console.log('No such vendor!');
        }
      } catch (error) {
        console.error('Error fetching vendor details:', error);
      }
    };
  
    fetchVendorDetails();
  }, [vendorId]);
  

  const handleBack = () => {
    navigate(-1);
  };

  const handleUploadImageClick = (imageUrl) => {
    setImagePreview(imageUrl); // Set the image URL for preview
  };

  const closeModal = () => {
    setImagePreview(null); // Close the modal
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = imagePreview; // The image URL to download
    link.download = 'downloaded-image.jpg'; // Name of the downloaded file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRequestInfoOpen = () => setIsDialogOpen(true);
  const handleRequestInfoClose = () => setIsDialogOpen(false);
  
    // Predefined messages
    const messageTemplates = [
      'Upload Government ID',
      'Submit Business Registration',
    ];

    const handleSelectMessage = (message) => {
      setRequestMessage(message);
    };

    const handleRequestSubmit = async () => {
      const wordCount = requestMessage.trim().split(/\s+/).length;
      if (wordCount > 150) {
        alert('Request message exceeds 150 words. Please shorten your message.');
        return;
      }
    
      const currentUser = JSON.parse(localStorage.getItem('userData'));
      const requestCount = vendor.timeline
        ? vendor.timeline.filter(item => item.isSubmitted1 || item.isSubmitted2 || item.isSubmitted3).length + 1
        : 1;
    
      const requestInfo = {
        [`isSubmitted${requestCount}`]: false,
        message: requestMessage,
        status: 'requested',
        timestamp: Timestamp.now(),
        email: currentUser.email,
        uploadedImageUrl: '',
      };
    
      const vendorRef = doc(stallholderDb, 'users', vendorId);
      await setDoc(vendorRef, {
        timeline: [...(vendor.timeline || []), requestInfo],
      }, { merge: true });
    
      setRequestMessage('');
      setIsDialogOpen(false);
      setIsSuccessAlertOpen(true); 

      const updatedTimeline = [...(vendor.timeline || []), requestInfo];
      setVendor({ ...vendor, timeline: updatedTimeline });
    };
    

  const handleSubmit = () => {
    // Check the latest request status
    if (vendor && vendor.timeline && vendor.timeline.length > 0) {
      const latestRequest = vendor.timeline[vendor.timeline.length - 1];

      if (latestRequest.status === 'requested' && !latestRequest[`isSubmitted${vendor.timeline.length}`]) {
        setIsAlertOpen(true); // Show the alert dialog
        return;
      }
      
      if (latestRequest.status === 'requested sent' && latestRequest[`isSubmitted${vendor.timeline.length}`]) {
        handleRequestSubmit(); // Call the function to handle the submission
      }
    } else {
      handleRequestSubmit(); // Proceed if no requests exist yet
    }
  };
  const handleCloseSuccessAlert = () => {
    setIsSuccessAlertOpen(false);
  };
  
  const handleApprove = async (vendorId) => {
    try {
      const vendorRef = doc(stallholderDb, 'users', vendorId);
      await updateDoc(vendorRef, {
        status: 'accepted',
        'stallInfo.status': 'Occupied',
      });
  
      const vendorSnapshot = await getDoc(vendorRef);
      const vendorData = vendorSnapshot.data();
  
      await setDoc(doc(stallholderDb, 'approvedVendors', vendorId), {
        ...vendorData,
        approvedBy: loggedInUser.email,
        approvedAt: new Date(),
      });
  
      setVendors(vendors.filter((vendor) => vendor.id !== vendorId));
      setFilteredVendors(filteredVendors.filter((vendor) => vendor.id !== vendorId));
  
      setIsSuccessModal(true); // Open success modal
      setSuccessMessage('Vendor approved successfully!');
    } catch (error) {
      console.error('Error approving vendor:', error);
    }
  };
  

  // handleDecline function
  const handleDecline = async () => {
    try {
      const vendorRef = doc(stallholderDb, 'users', vendorId);

      await updateDoc(vendorRef, { status: 'declined' });

      const vendorSnapshot = await getDoc(vendorRef);
      const vendorData = vendorSnapshot.data();

      await setDoc(doc(stallholderDb, 'declinedVendors', vendorId), {
        ...vendorData,
        reason: selectedDeclineReason || declineReason,
        declinedBy: loggedInUser.email,
        declinedAt: new Date(),
      });

      setVendors(vendors.filter((vendor) => vendor.id !== vendorId));
      setFilteredVendors(filteredVendors.filter((vendor) => vendor.id !== vendorId));

      setDeclineReason('');
      setSelectedDeclineReason('');
      setShowDeclineModal(false);

      setIsSuccessModal(true);
      setSuccessMessage('Vendor declined successfully!');
    } catch (error) {
      console.error('Error declining vendor:', error);
    }
  };

  const handleAction = (action) => {
    if (action === 'approve') {
      handleApprove(vendorId);
    } else if (action === 'decline') {
      handleDecline();
    }
    // Close modal logic, if needed
  };
  

  return (
    <DashboardContainer>
      <SideNav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} />
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>
      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <div>Edit Vendor Verification</div>
          <BackButton onClick={handleBack}>Back</BackButton>
        </AppBar>

        <VendorDetailsContainer>
          {vendor ? (
            <>
              <VendorProfile>
                <VendorInfoContainer>
                  {vendor.profileImageUrls?.[0] ? (
                    <VendorImage
                    src={vendor.profileImageUrls[0]}
                    alt="Profile"
                    onClick={() => handleUploadImageClick(vendor.profileImageUrls[0])} // Click to preview
                  />
                  ) : (
                    <VendorIcon />
                  )}
                  <VendorNameAndStatus>
                    <VendorName>
                      {vendor.firstName} {vendor.middleName} {vendor.lastName}
                    </VendorName>
                    <Status>{vendor.status}</Status>
                  </VendorNameAndStatus>
                </VendorInfoContainer>

                <ButtonContainer>
                <ActionButton onClick={() => handleAction('approve')}>APPROVE</ActionButton>
                <ActionButton onClick={() => handleAction('decline')}>DECLINE</ActionButton>
                  <ActionButton onClick={handleRequestInfoOpen}>SEND REQUEST</ActionButton>
                </ButtonContainer>
              </VendorProfile>

              <HorizontalLine />

              <DetailsContainer>
                <PersonalInfoContainer>
                  <VendorTitle>Personal Information</VendorTitle>
                  <VendorInfo><strong>Full Name:</strong> {vendor.firstName} {vendor.middleName} {vendor.lastName}</VendorInfo>
                  <VendorInfo><strong>Email:</strong> {vendor.email}</VendorInfo>
                  <VendorInfo><strong>Contact Number:</strong> {vendor.contactNumber}</VendorInfo>
                  <VendorInfo><strong>Billing Cycle:</strong> {vendor.billingCycle}</VendorInfo>
                  <VendorInfo><strong>Date of Registration:</strong> {new Date(vendor.dateOfRegistration).toLocaleDateString()}</VendorInfo>
                </PersonalInfoContainer>

                <StallContainer>
                  <StallTitle>Stall Information</StallTitle>
                  <VendorInfo><strong>Stall Number:</strong> {vendor.stallInfo?.stallNumber}</VendorInfo>
                  <VendorInfo><strong>Stall Size:</strong> {vendor.stallInfo?.stallSize}</VendorInfo>
                  <VendorInfo><strong>Location:</strong> {vendor.stallInfo?.location}</VendorInfo>
                </StallContainer>
              </DetailsContainer>

              <HorizontalLine />

              <TimelineTitle>Timeline</TimelineTitle>
              <TimelineContainer>
                {vendor.timeline && vendor.timeline.map((timelineItem, index) => (
                  <RequestItem key={index}>
                    <StatusIcons>
                      {timelineItem.status === 'requested' || timelineItem.status === 'requested sent' ? (
                        <FaCheckCircle color="green" />
                      ) : (
                        <FaRegCircle color="gray" />
                      )}
                      <Divider />
                      {timelineItem.status === 'requested sent' ? (
                        <FaCheckCircle color="green" />
                      ) : (
                        <FaRegCircle color="gray" />
                      )}
                    </StatusIcons>
                    <RequestInfo>
                      <h4>Request {index + 1}</h4>
                      <p>Request Message: {timelineItem.message}</p>
                      {timelineItem.isSubmitted1 && timelineItem.uploadFile?.length > 0 && (
                        <UploadedImage
                          src={timelineItem.uploadFile[0]}
                          alt={`Uploaded Request ${index + 1}`}
                          onClick={() => handleUploadImageClick(timelineItem.uploadFile[0])}
                        />
                      )}
                      <RequestTimestamp>
                      <FaClock style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                      {new Date(timelineItem.timestamp.seconds * 1000).toLocaleString()}
                    </RequestTimestamp>
                    </RequestInfo>
                  </RequestItem>
                ))}
              </TimelineContainer>

            </>
          ) : (
            <div>Loading vendor details...</div>
          )}
        </VendorDetailsContainer>
        {imagePreview && (
        <Modal>
        <ModalContent>
          <PreviewedImage src={imagePreview} alt="Preview" />
          <ButtonContainer1>
            <CloseButton onClick={closeModal}>✖</CloseButton>
            <DownloadButton onClick={handleDownloadImage}>Download Image</DownloadButton>
          </ButtonContainer1>
        </ModalContent>
      </Modal>
      )}

          {/* Request Info Dialog */}
          {isDialogOpen && (
          <RequestInfoDialog>
            <DialogContent>
              <DialogTitle>Send Request Info</DialogTitle>

              {/* Predefined Message Templates */}
              <MessageList>
                {messageTemplates.map((template, index) => (
                  <MessageButton key={index} onClick={() => handleSelectMessage(template)}>
                    {template}
                  </MessageButton>
                ))}
              </MessageList>

              {/* Text Area for Custom Input */}
              <DialogInput
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows="5"
                placeholder="Enter your request message (max 150 words)"
              />

              <div>
                <CancelButton onClick={handleRequestInfoClose}>Cancel</CancelButton>
                <DialogButton onClick={handleSubmit}>Submit Request</DialogButton>
              </div>
            </DialogContent>
          </RequestInfoDialog>
        )}

        {/* Alert Modal */}
        {isAlertOpen && (
          <AlertModal>
            <AlertContent>
              <AlertTitle>Alert</AlertTitle>
              <p>There is a pending request. Cannot proceed sending the request.</p>
              <AlertButton onClick={() => setIsAlertOpen(false)}>Close</AlertButton>
            </AlertContent>
          </AlertModal>
        )}
        {/* Success Alert Modal */}
        {isSuccessAlertOpen && (
          <SuccessAlertModal>
            <SuccessAlertContent>
              <SuccessAlertTitle>Success!</SuccessAlertTitle>
              <SuccessAlertMessage>Your request has been successfully submitted.</SuccessAlertMessage>
              <CloseSuccessAlertButton onClick={handleCloseSuccessAlert}>Close</CloseSuccessAlertButton>
            </SuccessAlertContent>
          </SuccessAlertModal>
        )}

        {isSuccessModal && (
          <SuccessAlertModal>
            <SuccessAlertContent>
              <SuccessAlertTitle>Success!</SuccessAlertTitle>
              <SuccessAlertMessage>{successMessage}</SuccessAlertMessage>
              <CloseSuccessAlertButton onClick={() => setIsSuccessModal(false)}>Close</CloseSuccessAlertButton>
            </SuccessAlertContent>
          </SuccessAlertModal>
        )}


      </MainContent>
    </DashboardContainer>
  );
};

export default EditVerification;
