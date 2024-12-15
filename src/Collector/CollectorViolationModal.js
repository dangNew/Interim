import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { collection, getDocs, query, where } from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
import { FaCheck } from "react-icons/fa"; // Import the check icon

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  max-width: 80%;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  text-align: center;
`;

const ModalImageContainer = styled.div`
  position: relative;
  margin-top: 20px;
`;

const ModalImage = styled.img`
  max-width: 50%;
  height: auto;
  border-radius: 8px;
`;

const MarkAsPaidButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  position: absolute;
  bottom: 10px;
  right: 10px;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px; /* Space between icon and text */

  &:hover {
    background: #218838;
  }
`;

const CloseButton = styled.button`
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 20px;
`;

const ViolationContainer = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 20px;
`;

const FieldContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 10px;
`;

const FieldLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const FieldLabel = styled.label`
  font-weight: bold;
  color: #333;
  text-align: left;
  margin-bottom: 5px;
`;

const FieldInput = styled.input`
  width: 100%;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  color: #555;
  &:read-only {
    background-color: #f9f9f9;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  border-radius: 4px;
  overflow: hidden;
`;

const ModalButton = styled.button`
  background: ${(props) => props.backgroundColor};
  color: ${(props) => props.color || "white"};
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  &:not(:last-child) {
    border-right: 1px solid #ddd;
  }

  &:hover {
    background: ${(props) =>
      props.backgroundColor === "#4CAF50" ? "#f1f1f1" : "#4CAF50"};
    color: ${(props) =>
      props.backgroundColor === "#4CAF50" ? "#333" : "white"};
  }
`;

const ViolationModal = ({ isOpen, onClose, vendorId }) => {
  const [violationData, setViolationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeButton, setActiveButton] = useState(null);

  useEffect(() => {
    if (isOpen && vendorId) {
      const fetchViolationData = async () => {
        try {
          const violationCollection = collection(
            rentmobileDb,
            "Market_violations"
          );
          const q = query(
            violationCollection,
            where("vendorId", "==", vendorId)
          );
          const querySnapshot = await getDocs(q);
          const data = [];

          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const violationDetails = doc.data();
              data.push({
                date: violationDetails.date
                  ? violationDetails.date.toDate().toLocaleDateString()
                  : "N/A",
                email: violationDetails.email || "N/A",
                vendorId: violationDetails.vendorId || "N/A",
                vendorName: violationDetails.vendorName || "N/A",
                image_0: violationDetails.image_0 || "N/A",
                paymentDate: violationDetails.paymentDate
                  ? violationDetails.paymentDate.toDate().toLocaleDateString()
                  : "N/A",
                penaltyMonths: violationDetails.penaltyMonths || "N/A",
                stallNo: violationDetails.stallNo || "N/A",
                status: violationDetails.status || "N/A",
                violationPayment: violationDetails.violationPayment || "N/A",
                violationType: violationDetails.violationType || "N/A",
                warning: violationDetails.warning || "N/A",
              });
            });
          } else {
            console.log(`No documents found for vendorId: ${vendorId}`);
          }

          setViolationData(data);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching violation data:", error);
          setError("Failed to fetch violation data. Please try again later.");
          setLoading(false);
        }
      };

      fetchViolationData();
    }
  }, [isOpen, vendorId]);

  if (!isOpen) return null;

  const handleContainerClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleButtonClick = (button) => {
    setActiveButton(button);
  };

  const filteredViolations =
    activeButton === "rental"
      ? violationData.filter(
          (violation) =>
            violation.warning === "1st Offense" ||
            violation.warning === "2nd Offense"
        )
      : activeButton === "final"
      ? violationData.filter(
          (violation) => violation.warning === "Final Offense"
        )
      : violationData;

  return (
    <ModalContainer onClick={handleContainerClick}>
      <ModalContent>
        <ButtonGroup>
          <ModalButton
            backgroundColor={activeButton === "rental" ? "#f1f1f1" : "#4CAF50"}
            color={activeButton === "rental" ? "#333" : "white"}
            onClick={() => handleButtonClick("rental")}
          >
            Rental Offense
          </ModalButton>
          <ModalButton
            backgroundColor={activeButton === "final" ? "#4CAF50" : "#f1f1f1"}
            color={activeButton === "final" ? "white" : "#333"}
            onClick={() => handleButtonClick("final")}
          >
            Final Offense
          </ModalButton>
        </ButtonGroup>
        <h2>Violation History</h2>
        {loading ? (
          "Loading..."
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : filteredViolations && filteredViolations.length > 0 ? (
          filteredViolations.map((violation, index) => (
            <ViolationContainer key={index}>
              <FieldContainer>
                <FieldLabelContainer>
                  <FieldLabel>Date</FieldLabel>
                  <FieldInput value={violation.date} readOnly />
                </FieldLabelContainer>
                <FieldLabelContainer>
                  <FieldLabel>Email</FieldLabel>
                  <FieldInput value={violation.email} readOnly />
                </FieldLabelContainer>
                <FieldLabelContainer>
                  <FieldLabel>Vendor ID</FieldLabel>
                  <FieldInput value={violation.vendorId} readOnly />
                </FieldLabelContainer>
              </FieldContainer>
              <FieldContainer>
                <FieldLabelContainer>
                  <FieldLabel>Vendor Name</FieldLabel>
                  <FieldInput value={violation.vendorName} readOnly />
                </FieldLabelContainer>
                <FieldLabelContainer>
                  <FieldLabel>Payment Date</FieldLabel>
                  <FieldInput value={violation.paymentDate} readOnly />
                </FieldLabelContainer>
                <FieldLabelContainer>
                  <FieldLabel>Penalty Months</FieldLabel>
                  <FieldInput value={violation.penaltyMonths} readOnly />
                </FieldLabelContainer>
              </FieldContainer>
              <FieldContainer>
                <FieldLabelContainer>
                  <FieldLabel>Stall No</FieldLabel>
                  <FieldInput value={violation.stallNo} readOnly />
                </FieldLabelContainer>
                <FieldLabelContainer>
                  <FieldLabel>Status</FieldLabel>
                  <FieldInput value={violation.status} readOnly />
                </FieldLabelContainer>
                <FieldLabelContainer>
                  <FieldLabel>Violation Payment</FieldLabel>
                  <FieldInput value={violation.violationPayment} readOnly />
                </FieldLabelContainer>
              </FieldContainer>
              <FieldContainer>
                <FieldLabelContainer>
                  <FieldLabel>Violation Type</FieldLabel>
                  <FieldInput value={violation.violationType} readOnly />
                </FieldLabelContainer>
                <FieldLabelContainer>
                  <FieldLabel>Warning</FieldLabel>
                  <FieldInput value={violation.warning} readOnly />
                </FieldLabelContainer>
              </FieldContainer>
              {violation.image_0 && (
                <ModalImageContainer>
                  <ModalImage
                    src={violation.image_0}
                    alt={`Violation ${index + 1}`}
                  />
                  {violation.warning !== "Final Offense" && (
                    <MarkAsPaidButton>
                      <FaCheck /> {/* Add the check icon here */}
                      Mark As Paid
                    </MarkAsPaidButton>
                  )}
                </ModalImageContainer>
              )}
            </ViolationContainer>
          ))
        ) : (
          "No violation data found."
        )}
        <CloseButton onClick={onClose}>Close</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
};

export default ViolationModal;
