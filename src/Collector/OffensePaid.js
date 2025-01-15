import React from "react";
import styled from "styled-components";

// Replace these strings with the actual Base64 encoded strings of your images
const oslogoBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."; // Replace with actual Base64 string
const ocmlogoBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."; // Replace with actual Base64 string

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
  font-family: "Courier New", Courier, monospace;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
`;

const Logo = styled.img`
  max-width: 100px;
  height: auto;
`;

const Address = styled.div`
  text-align: center;
  margin: 10px 0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  text-align: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  align-self: flex-end;
`;

const ModalBody = styled.div`
  margin-bottom: 20px;
`;

const ReceiptItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #218838;
  }
`;

const PrintButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 10px;

  &:hover {
    background-color: #0056b3;
  }
`;

const MarkAsPaidModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedStallHolder,
}) => {
  if (!isOpen) return null;

  if (!selectedStallHolder) {
    return (
      <ModalContainer>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Loading...</ModalTitle>
          </ModalHeader>
        </ModalContent>
      </ModalContainer>
    );
  }

  const { vendorName, violationPayment, warning } = selectedStallHolder;

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=500,width=800");
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            body {
              font-family: "Courier New", Courier, monospace;
              width: 500px;
              margin: 0 auto;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .logo-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
              margin-bottom: 10px;
            }
            .logo {
              max-width: 100px;
              height: auto;
            }
            .address {
              text-align: center;
              margin: 10px 0;
              flex-grow: 1;
            }
            .modal-title {
              margin: 0;
              font-size: 1.5rem;
              text-align: center;
              margin-bottom: 20px;
            }
            .receipt-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            .receipt-item:last-child {
              border-bottom: none;
              padding-bottom: 0;
            }
            .receipt-item span {
              font-size: 1rem;
            }
            .receipt-item span:first-child {
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 0.9rem;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="logo-container">
            <img src="${oslogoBase64}" alt="OS Logo" class="logo" />
            <div class="address">
              <p>Republic of the Philippines</p>
              <p>City of Cebu</p>
            </div>
            <img src="${ocmlogoBase64}" alt="OCM Logo" class="logo" />
          </div>
          <h3 class="modal-title">Payment Receipt</h3>
          <div class="receipt-item">
            <span>Vendor Name:</span>
            <span>${vendorName}</span>
          </div>
          <div class="receipt-item">
            <span>Violation Payment:</span>
            <span>${violationPayment}</span>
          </div>
          <div class="receipt-item">
            <span>Warning:</span>
            <span>${warning}</span>
          </div>
          <div class="footer">
            <p>Thank you for your payment!</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <ModalContainer>
      <ModalContent>
        <ModalHeader>
          <LogoContainer>
            <Logo src={oslogoBase64} alt="OS Logo" />
            <Address>
              <p>Republic of the Philippines</p>
              <p>City of Cebu</p>
            </Address>
            <Logo src={ocmlogoBase64} alt="OCM Logo" />
          </LogoContainer>
          <ModalTitle>Mark as Paid</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalBody>
          <ReceiptItem>
            <span>Vendor Name:</span>
            <span>{vendorName}</span>
          </ReceiptItem>
          <ReceiptItem>
            <span>Violation Payment:</span>
            <span>{violationPayment}</span>
          </ReceiptItem>
          <ReceiptItem>
            <span>Warning:</span>
            <span>{warning}</span>
          </ReceiptItem>
        </ModalBody>
        <ModalFooter>
          <ConfirmButton onClick={onConfirm}>Confirm</ConfirmButton>
          <PrintButton onClick={handlePrint}>Print</PrintButton>
        </ModalFooter>
      </ModalContent>
    </ModalContainer>
  );
};

export default MarkAsPaidModal;
