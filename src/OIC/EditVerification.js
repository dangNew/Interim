import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaCheckCircle, FaRegCircle, FaClock, FaUserCircle } from 'react-icons/fa';
import { Button } from '@mui/material';
import { getDoc, doc, setDoc, Timestamp, updateDoc, getDocs, collection, addDoc } from 'firebase/firestore';
import { rentmobileDb } from '../components/firebase.config';
import SideNav from './side_nav';

// Styled components (unchanged)
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

  ${({ type, disabled }) =>
    disabled
      ? 'background-color: lightgrey;'
      : type === 'approve'
      ? 'background-color: blue;'
      : type === 'decline'
      ? 'background-color: red;'
      : 'background-color: lightgreen;'} // Yellow for send request
`;

const Status = styled.div`
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  margin-top: 5px;
  background-color: ${({ status }) =>
    status === 'accepted'
      ? 'green'
      : status === 'declined'
      ? 'red'
      : 'yellow'};
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
const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1rem;
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

    // Striped rows
    tr:nth-child(even) {
      background-color: #f2f2f2; // Light gray for even rows
    }

    tr:nth-child(odd) {
      background-color: #ffffff; // White for odd rows
    }

    .actions {
      display: flex;
      gap: 5px; /* Space between the buttons */
    }

    .action-button {
      display: flex;
      align-items: center;
      border: none;
      background: none;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #0056b3; /* Darken on hover */
      }

      .icon {
        font-size: 24px; /* Increase icon size */
        color: black;
      }
    }
  }
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

const ModalOverlay = styled.div`
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

const ModalContainer = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ModalButton = styled.button`
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
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');

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
        const vendorRef = doc(rentmobileDb, 'Vendorusers', vendorId);
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

    const vendorRef = doc(rentmobileDb, 'Vendorusers', vendorId);
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
      // Reference to the vendor's document in 'Vendorusers' collection
      const vendorRef = doc(rentmobileDb, 'Vendorusers', vendorId);
  
      // Update the vendor's status and stall info status
      await updateDoc(vendorRef, {
        status: 'accepted',
        'stallInfo.status': 'Occupied'
      });
  
      // Fetch vendor data to access the associated stall ID
      const vendorSnapshot = await getDoc(vendorRef);
      const vendorData = vendorSnapshot.data();
      const stallId = vendorData.stallId;
  
      // Reference to the vendor's stall document in 'Stall' collection
      const stallDocRef = doc(rentmobileDb, 'Stall', stallId);
  
      // Update the stall status to 'Occupied'
      await updateDoc(stallDocRef, { status: 'Occupied' });
  
      // Log the approved vendor to a new 'approvedVendors' collection
      await setDoc(doc(rentmobileDb, 'approvedVendors', vendorId), {
        ...vendorData,
        approvedBy: loggedInUser.email,
        approvedAt: new Date()
      });
  
      // Update the vendor lists to remove the approved vendor from pending list
      setVendors(vendors.filter(vendor => vendor.id !== vendorId));
      setFilteredVendors(filteredVendors.filter(vendor => vendor.id !== vendorId));
  
      // Fetch billing configuration
      const billingConfigSnapshot = await getDocs(collection(rentmobileDb, 'billingconfig'));
      const billingConfig = billingConfigSnapshot.docs.reduce((acc, doc) => {
        acc[doc.data().title] = doc.data();
        return acc;
      }, {});
  
      // Calculate the due date and start date based on the current date and billing cycle
      const approvedAtDate = new Date();
      const billingCycle = vendorData.billingCycle;
      let dueDate, startDate;
  
      // Set the start date to the next day after the approvedAt date
      startDate = new Date(approvedAtDate);
      startDate.setDate(approvedAtDate.getDate() + 1);
      startDate.setHours(0, 0, 0, 0);
  
      if (billingCycle === 'Daily') {
        dueDate = new Date(startDate);
        dueDate.setHours(23, 59, 59, 999);
      } else if (billingCycle === 'Weekly') {
        dueDate = new Date(startDate);
        dueDate.setDate(startDate.getDate() + ((1 + 7 - startDate.getDay()) % 7));
        dueDate.setHours(23, 59, 59, 999);
      } else if (billingCycle === 'Monthly') {
        const nextMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 7);
        dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 7);
        dueDate.setHours(23, 59, 59, 999);
      }
  
      // Calculate the number of days
      const noOfDays = Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24));
  
      // Calculate the daily payment
      const ratePerMeter = billingConfig['RateperMeter'].value1;
      const stallSize = vendorData.stallInfo.stallSize;
      const dailyPayment = ratePerMeter * stallSize;
  
      // Calculate the amount
      const amount = dailyPayment * noOfDays;
  
      // Calculate the garbage fee
      const garbageFee = billingConfig['Garbage Fee'].value1 * noOfDays;
  
      // Calculate the total
      let total = amount + garbageFee;
  
      // Initialize penalty, surcharge, interestRate, and amountIntRate
      let penalty = 0;
      let surcharge = 0;
      let interestRate = 0;
      let amountIntRate = 0;
  
      // Calculate the penalty if the vendor status is overdue
      if (vendorData.status === 'Overdue') {
        const penaltyPercentage = billingConfig['Penalty'][`value${billingCycle === 'Daily' ? 3 : billingCycle === 'Weekly' ? 2 : 1}`];
        penalty = penaltyPercentage;
        surcharge = (amount + garbageFee) * (penaltyPercentage / 100);
        total += surcharge;
      }
  
      // Calculate the interest rate if the payment is overdue
      if (vendorData.status === 'Overdue') {
        interestRate = billingConfig['Interest Rate'][`value${billingCycle === 'Daily' ? 3 : billingCycle === 'Weekly' ? 2 : 1}`] / 100;
        amountIntRate = total * interestRate;
        total += amountIntRate;
      }
  
      // Store the current payment in the stall_payment collection with an auto ID
      const paymentDocRef = await addDoc(collection(rentmobileDb, 'stall_payment'), {
        vendorId,
        firstName: vendorData.firstName,
        middleName: vendorData.middleName,
        lastName: vendorData.lastName,
        status: 'Pending',
        currentDate: new Date(),
        startDate,
        dueDate,
        noOfDays,
        dailyPayment,
        amount,
        garbageFee,
        penalty,
        surcharge,
        total,
        interestRate,
        amountIntRate,
        billingCycle // Store the billing cycle
      });
  
      setIsSuccessModal(true);
      setSuccessMessage('Vendor approved successfully!');
  
      // Update the vendor status in the state
      setVendor((prevVendor) => ({
        ...prevVendor,
        status: 'accepted',
      }));
  
    } catch (error) {
      console.error('Error approving vendor:', error);
    }
  };
  

  // handleDecline function
  const handleDecline = async () => {
    try {
      const vendorRef = doc(rentmobileDb, 'Vendorusers', vendorId);

      await updateDoc(vendorRef, { status: 'declined' });

      const vendorSnapshot = await getDoc(vendorRef);
      const vendorData = vendorSnapshot.data();

      // Check if the declinedVendors collection exists, if not, create it
      const declinedVendorsCollection = collection(rentmobileDb, 'declinedVendors');
      const declinedVendorsSnapshot = await getDocs(declinedVendorsCollection);
      if (declinedVendorsSnapshot.empty) {
        await setDoc(doc(rentmobileDb, 'declinedVendors', vendorId), {
          ...vendorData,
          reason: selectedDeclineReason || declineReason,
          declinedBy: loggedInUser.email,
          declinedAt: new Date(),
        });
      } else {
        await setDoc(doc(rentmobileDb, 'declinedVendors', vendorId), {
          ...vendorData,
          reason: selectedDeclineReason || declineReason,
          declinedBy: loggedInUser.email,
          declinedAt: new Date(),
        });
      }

      // Update the stall status to 'Available'
      const stallId = vendorData.stallId;
      const stallDocRef = doc(rentmobileDb, 'Stall', stallId);
      await updateDoc(stallDocRef, { status: 'Available' });

      setVendors(vendors.filter((vendor) => vendor.id !== vendorId));
      setFilteredVendors(filteredVendors.filter((vendor) => vendor.id !== vendorId));

      setDeclineReason('');
      setSelectedDeclineReason('');
      setShowDeclineModal(false);

      setIsSuccessModal(true);
      setSuccessMessage('Vendor declined successfully!');

      // Update the vendor status in the state
      setVendor((prevVendor) => ({
        ...prevVendor,
        status: 'declined',
      }));

    } catch (error) {
      console.error('Error declining vendor:', error);
    }
  };

  const handleAction = (action) => {
    if (action === 'approve') {
      setActionType('approve');
      setShowModal(true);
    } else if (action === 'decline') {
      setActionType('decline');
      setShowDeclineModal(true);
    } else if (action === 'request') {
      handleRequestInfoOpen(); // Open the request dialog
    }
    // Close modal logic, if needed
  };

  const declineReasons = [
    'Document requested not uploaded',
    'Uploaded fake ID',
    'Incomplete application',
    'Incorrect information provided',
    'Application does not meet criteria',
    'Fake Information'
  ];

  return (
    <DashboardContainer>
      <SideNav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} />
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>
      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <div>Edit Vendor Verification</div>
          <Button onClick={() => navigate(-1)} sx={{ color: 'white' }}>
            Back
          </Button>
        </AppBar>

        <FormContainer>
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
                      <Status status={vendor.status}>{vendor.status}</Status>
                    </VendorNameAndStatus>
                  </VendorInfoContainer>

                  <ButtonContainer>
                    <ActionButton type="approve" onClick={() => handleAction('approve')} disabled={vendor.status === 'accepted'}>
                      Approve
                    </ActionButton>
                    <ActionButton type="decline" onClick={() => handleAction('decline')} disabled={vendor.status === 'accepted'}>
                      Decline
                    </ActionButton>
                    <ActionButton type="request" onClick={() => handleAction('request')} disabled={vendor.status === 'accepted'}>
                      Send Request
                    </ActionButton>
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
        </FormContainer>

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

        {showModal && (
          <ModalOverlay>
            <ModalContainer>
              <h2>{actionType === 'approve' ? 'Approve Vendor' : 'Decline Vendor'}</h2>
              <p>Are you sure you want to {actionType} this vendor?</p>
              <ModalButton onClick={() => {
                if (actionType === 'approve') {
                  handleApprove(vendorId);
                }
                setShowModal(false);
              }}>
                Confirm
              </ModalButton>
              <CancelButton onClick={() => setShowModal(false)} style={{ marginLeft: '10px' }}>
                Cancel
              </CancelButton>
            </ModalContainer>
          </ModalOverlay>
        )}

        {showDeclineModal && (
          <ModalOverlay>
            <ModalContainer>
              <h2>Decline Vendor</h2>
              <p>Select a reason for declining:</p>
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
              <CancelButton onClick={() => setShowDeclineModal(false)}>
                Cancel
              </CancelButton>
            </ModalContainer>
          </ModalOverlay>
        )}

        {isSuccessModal && (
          <ModalOverlay>
            <ModalContainer>
              <h2>{successMessage}</h2>
              <ModalButton onClick={() => setIsSuccessModal(false)}>
                OK
              </ModalButton>
            </ModalContainer>
          </ModalOverlay>
        )}

      </MainContent>
    </DashboardContainer>
  );
};

export default EditVerification;