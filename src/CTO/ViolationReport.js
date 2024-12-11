import React, { useRef, useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import { FaDownload } from 'react-icons/fa';
import ctoImage from '../images/unnamed.png';
import cebuMarketImage from '../images/cebumarket.png';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { stallholderDb, stallholderStorage } from "../components/firebase.config"; // Adjust the path to your Firebase configuration

// Styled components
const DetailsContainer = styled.div`
  padding: 50px 80px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
`;

const DetailsHeader = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 26px;
  font-weight: bold;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  margin-bottom: 20px;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 20px;
  left: 20px;
`;

const DownloadButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const Logo = styled.img`
  width: 80px;
  height: 80px;
`;

const HeaderText = styled.div`
  text-align: center;
`;

const HeaderTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: bold;
`;

const TableContainer = styled.div`
  margin-top: 20px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
  font-size: 14px;
  text-align: center;
`;

const TableHeader = styled.th`
  border: 1px solid #ddd;
  padding: 8px;
  background-color: #f2f2f2;
`;

const TableData = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
`;

const LetterContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  width: 755.9px; /* 20cm converted to pixels */
  border: 1px solid #ddd;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: 'Times New Roman', Times, serif;
  margin: 0 auto; /* Center the container */
`;

const LetterHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const LetterBody = styled.div`
  margin-bottom: 20px;
`;

const LetterFooter = styled.div`
  text-align: right;
  margin-top: 20px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const SelectField = styled.select`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const SignatureImage = styled.img`
  width: 150px;
  height: auto;
  margin-top: 20px;
  background: transparent; /* Ensure the background is transparent */
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 16px;
  margin-top: 20px;
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: #888;
  font-size: 16px;
  margin-top: 30px;
`;

const ViolationReport = ({ show, onHide, violator }) => {
  const pdfRef = useRef();

  // Initialize formData state
  const [formData, setFormData] = useState({
    dateOfNotice: '',
    vendorName: '',
    stallNumber: '',
    vendorId: '', // Add vendorId to the state
    violation: '',
    violationDate: '',
    offenseType: '', // Add state for offense type
    marketName: '', // Add state for market name
    deadline: '', // Add state for deadline
  });

  const [adminData, setAdminData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    signatureUrl: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [existingNotices, setExistingNotices] = useState([]);

  // Fetch vendor location
  useEffect(() => {
    const fetchVendorLocation = async () => {
      try {
        const vendorDocRef = doc(stallholderDb, 'approvedVendors', violator.vendorID);
        const vendorDocSnap = await getDoc(vendorDocRef);

        if (vendorDocSnap.exists()) {
          const vendorData = vendorDocSnap.data();
          const marketName = vendorData.stallInfo.location;

          setFormData((prevFormData) => ({
            ...prevFormData,
            marketName,
          }));
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching vendor location:', error);
      }
    };

    if (violator) {
      fetchVendorLocation();
    }
  }, [violator]);

  // Set formData fields
  useEffect(() => {
    const fetchViolationsCount = async () => {
      try {
        const violationsQuery = query(
          collection(stallholderDb, 'Notice_Report'),
          where('vendorId', '==', violator.vendorID),
          where('status', '==', 'Overdue')
        );
        const violationsSnapshot = await getDocs(violationsQuery);

        // Calculate the deadline
        const currentDate = new Date();
        const deadline = new Date(currentDate);
        deadline.setDate(currentDate.getDate() + 7);
        const formattedDeadline = deadline.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        setFormData((prevFormData) => ({
          ...prevFormData,
          dateOfNotice: new Date().toLocaleDateString(),
          vendorName: violator.name,
          stallNumber: violator.stallNumber,
          vendorId: violator.vendorID, // Set vendorId
          violation: violator.status,
          violationDate: violator.date,
          offenseType: '', // Initialize offense type
          deadline: formattedDeadline, // Set deadline
        }));

        setLoading(false); // Stop loading
      } catch (error) {
        console.error('Error fetching violations count:', error);
        setLoading(false); // Stop loading
      }
    };

    if (violator) {
      fetchViolationsCount();
    }
  }, [violator]);

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const storedUserData = JSON.parse(localStorage.getItem('userData'));
        if (storedUserData && storedUserData.email) {
          const adminQuery = query(collection(stallholderDb, 'admin_users'), where('email', '==', storedUserData.email));
          const adminSnapshot = await getDocs(adminQuery);

          if (!adminSnapshot.empty) {
            adminSnapshot.forEach((doc) => {
              const data = doc.data();
              setAdminData({
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName,
                signatureUrl: data.Signature,
              });
            });
          }
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, []);

  // Fetch existing notices
  useEffect(() => {
    const fetchExistingNotices = async () => {
      try {
        const noticesQuery = query(
          collection(stallholderDb, 'Notice_Report'),
          where('vendorId', '==', violator.vendorID)
        );
        const noticesSnapshot = await getDocs(noticesQuery);
        const notices = noticesSnapshot.docs.map((doc) => doc.data());
        setExistingNotices(notices);
      } catch (error) {
        console.error('Error fetching existing notices:', error);
      }
    };

    if (violator) {
      fetchExistingNotices();
    }
  }, [violator]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Calculate totals
  const totalDailyStallRental = violator ? violator.dailyStallRental || 0 : 0;
  const totalGarbageFee = violator ? violator.garbageFee || 0 : 0;
  const totalSurcharge = violator ? violator.surcharge || 0 : 0;
  const totalAmount = violator ? violator.total || 0 : 0;
  const totalInterestRate = violator ? violator.interestRate.toFixed(2) || '0' : '0';
  const totalAmountIntRate = violator ? violator.amountIntRate.toFixed(2) || 0 : 0;
  const totalAmountDue = violator ? violator.amountDue.toFixed(2) || 0 : 0;

  const sendToFirestore = async () => {
    try {
      const input = pdfRef.current;
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');

      // Upload image to Firebase Storage
      const storageRef = ref(stallholderStorage, `violation_reports/${formData.vendorId}_${new Date().getTime()}.png`);
      await uploadString(storageRef, imgData, 'data_url');
      const imageUrl = await getDownloadURL(storageRef);

      const reportData = {
        dateOfNotice: formData.dateOfNotice,
        vendorName: formData.vendorName,
        stallNumber: formData.stallNumber,
        vendorId: formData.vendorId, // Include vendorId in the report data
        violation: formData.violation,
        violationDate: formData.violationDate,
        offenseType: formData.offenseType,
        totalDailyStallRental,
        totalGarbageFee,
        totalSurcharge,
        totalAmount,
        totalInterestRate,
        totalAmountIntRate,
        totalAmountDue,
        image: imageUrl, // Save the image URL
        reportSent: true, // Mark the report as sent
      };

      await addDoc(collection(stallholderDb, 'Notice_Report'), reportData);

      // Update the violator data in Firestore to mark the report as sent
      const violatorDocRef = doc(stallholderDb, 'stall_payment', violator.id);
      await updateDoc(violatorDocRef, { reportSent: true, offenseType: formData.offenseType });

      alert('Report sent successfully!');
      setErrorMessage(''); // Clear the error message
    } catch (error) {
      console.error('Error sending report to Firestore:', error);
      alert('Error sending report. Please try again.');
    }
  };

  const isOffenseTypeSent = (offenseType) => {
    return existingNotices.some((notice) => notice.offenseType === offenseType);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Violation Notice Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? <LoadingMessage>Loading... <Spinner animation="border" /></LoadingMessage> : (
          <>
            {/* {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>} */}
            <SelectField
              name="offenseType"
              value={formData.offenseType}
              onChange={handleInputChange}
              disabled={isOffenseTypeSent(formData.offenseType)}
            >
              <option value="">Select Offense Type</option>
              <option value="First Offense" disabled={isOffenseTypeSent('First Offense')}>First Offense</option>
              <option value="Second Offense" disabled={isOffenseTypeSent('Second Offense')}>Second Offense</option>
              <option value="Final Offense" disabled={isOffenseTypeSent('Final Offense')}>Final Offense</option>
            </SelectField>
            <LetterContainer ref={pdfRef}>
              <LetterHeader>
                <HeaderContainer>
                  <Logo src={ctoImage} alt="CTO Logo" style={{ marginRight: '30px' }} />
                  <HeaderText>
                    <HeaderTitle>Republic of the Philippines</HeaderTitle>
                    <HeaderTitle>City of Cebu</HeaderTitle>
                    <HeaderTitle>OFFICE OF THE CITY ADMINISTRATION</HeaderTitle>
                    <HeaderTitle>CITY TREASURER'S OFFICE</HeaderTitle>
                  </HeaderText>
                  <Logo src={cebuMarketImage} alt="Cebu Market Logo" style={{ marginLeft: '30px' }} />
                </HeaderContainer>
              </LetterHeader>

              <DetailsHeader>Violation Notice Report</DetailsHeader>

              <LetterBody>
                <p>
                  <strong>Date of Notice:</strong> {formData.dateOfNotice || '[Date of Notice]'}
                </p>
                <p>
                  <strong>Vendor ID:</strong> {formData.vendorId || '[Vendor ID]'} {/* Display vendorId */}
                </p>
                <p>
                  <strong>Vendor Name:</strong> {formData.vendorName || '[Vendor Name]'}
                </p>
                <p>
                  <strong>Stall Number:</strong> {formData.stallNumber || '[Stall Number]'}
                </p>
                <p>
                  <strong>Violation:</strong> {formData.violation || '[Violation Details]'}
                </p>
                <p>
                  <strong>Date of Violation:</strong> {formData.violationDate || '[Date of Violation]'}
                </p>
                <p>
                  <strong>Offense Type:</strong> {formData.offenseType || '[Offense Type]'}
                </p>
                <p>
                  <strong>Subject:</strong> {formData.offenseType === 'First Offense' ? 'Notice of First Offense - Unpaid Rental Dues' : 'Notice of Violation'}
                </p>
                <p>
                  We hope this letter finds you well. We are writing to remind you that your rental payment for your Stall Number {formData.stallNumber || '[Stall/Unit Number]'}, located at {formData.marketName || '[Market Name]'}, is overdue. As per our records, the payment due for the period of {formData.violationDate || '[Specify Period]'} has not been received, and this constitutes a {formData.offenseType.toLowerCase()} under the terms of your rental agreement.
                </p>
                <p>
                  Please be informed that timely payment of your rental dues is essential for the continued operation of your stall in the market. To avoid any further penalties or the suspension of your selling privileges, we kindly request that you settle the outstanding amount of ₱{totalAmountDue} on or before {formData.deadline || '[Deadline]'}.
                </p>
                <p>
                  Failure to comply with this notice may result in additional actions, including:
                </p>
                <ul>
                  <li>Suspension of your selling rights.</li>
                  <li>Potential termination of your rental agreement.</li>
                </ul>
                <p>
                  We strongly urge you to prioritize the settlement of this matter to ensure uninterrupted operations. If you have already made the payment or have concerns regarding this notice, please provide proof of payment or visit our office during business hours.
                </p>
                <p>
                  Thank you for your prompt attention to this matter. We appreciate your cooperation and look forward to resolving this issue amicably.
                </p>
                {violator && (
                  <TableContainer>
                    <Table>
                      <thead>
                        <tr>
                          <TableHeader>Status</TableHeader>
                          <TableHeader>Daily Stall Rental</TableHeader>
                          <TableHeader>Garbage Fee</TableHeader>
                          <TableHeader>Surcharge</TableHeader>
                          <TableHeader>Total</TableHeader>
                          <TableHeader>Interest Rate</TableHeader>
                          <TableHeader>Amount Int. Rate</TableHeader>
                          <TableHeader>Amount Due</TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <TableData>{violator.status}</TableData>
                          <TableData>₱{totalDailyStallRental}</TableData>
                          <TableData>₱{totalGarbageFee}</TableData>
                          <TableData>₱{totalSurcharge}</TableData>
                          <TableData>₱{totalAmount}</TableData>
                          <TableData>{totalInterestRate}%</TableData>
                          <TableData>₱{totalAmountIntRate}</TableData>
                          <TableData>₱{totalAmountDue}</TableData>
                        </tr>
                      </tbody>
                    </Table>
                  </TableContainer>
                )}
              </LetterBody>
              <LetterFooter>
                <p>Sincerely yours,</p>
                {adminData.signatureUrl && <SignatureImage src={adminData.signatureUrl} alt="Signature" />}
                <p>{adminData.firstName} {adminData.middleName} {adminData.lastName}</p>
              </LetterFooter>
            </LetterContainer>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <DownloadButton onClick={sendToFirestore} disabled={isOffenseTypeSent(formData.offenseType)}>
          <FaDownload style={{ marginRight: '8px' }} /> Send
        </DownloadButton>
      </Modal.Footer>
    </Modal>
  );
};

export default ViolationReport;