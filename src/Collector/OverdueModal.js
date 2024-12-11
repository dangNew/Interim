import React from "react";
import styled from "styled-components";

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-family: "Courier New", Courier, monospace;
`;

const ReceiptHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: bold;
    text-transform: uppercase;
  }
`;

const ReceiptBody = styled.div`
  margin: 15px 0;
`;

const FieldContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 12px;

  &:not(:last-child) {
    border-bottom: 1px dashed #ccc;
  }
`;

const FieldLabel = styled.div`
  font-weight: bold;
`;

const FieldValue = styled.div`
  text-align: right;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
  }

  button:first-child {
    background-color: #4caf50;
    color: white;
  }

  button:last-child {
    background-color: #f44336;
    color: white;
  }
`;

const OverdueModal = ({ isOpen, onClose, overduePayments }) => {
  if (!isOpen) return null;

  const totalAmount = overduePayments.reduce((sum, payment) => sum + (payment.totalAmountDue || 0), 0);

  return (
    <ModalContainer>
      <ModalContent>
        <ReceiptHeader>
          <h3>Overdue Payment</h3>
          <p></p>
        </ReceiptHeader>
        <ReceiptBody>
          {overduePayments.map((payment, index) => (
            <div key={index}>
              <FieldContainer>
                <FieldLabel>Date:</FieldLabel>
                <FieldValue>{payment.dueDate ? payment.dueDate.toDate().toLocaleDateString() : 'N/A'}</FieldValue>
              </FieldContainer>
              <FieldContainer>
                <FieldLabel>Amount:</FieldLabel>
                <FieldValue>₱{payment.totalAmountDue}</FieldValue>
              </FieldContainer>
              <hr />
            </div>
          ))}
          <FieldContainer>
            <FieldLabel>Total Amount:</FieldLabel>
            <FieldValue>₱{totalAmount.toFixed(2)}</FieldValue>
          </FieldContainer>
        </ReceiptBody>
        <ActionButtons>
          <button onClick={onClose}>No</button>
          <button onClick={() => {
            // Handle the confirmation logic here
            onClose();
          }}>Yes</button>
        </ActionButtons>
      </ModalContent>
    </ModalContainer>
  );
};

export default OverdueModal;
