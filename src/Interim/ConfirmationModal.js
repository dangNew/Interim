import React from 'react';
import styled from 'styled-components';

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

const ModalContent = styled.div`
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #dcdcdc;
  padding-bottom: 10px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #555;
  }
`;

const ModalBody = styled.div`
  margin-bottom: 20px;
`;

const ModalField = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eaeaea;
`;

const ModalLabel = styled.label`
  font-weight: 500;
  color: #555;
`;

const ModalValue = styled.span`
  font-weight: 400;
  color: #333;
`;

const CloseButtonStyled = styled.button`
  background-color: #28a745; /* Green background */
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #218838; /* Darker green on hover */
  }
`;

const ConfirmationModal = ({ isOpen, onClose, message, stallHolder }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{message}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>
          {stallHolder && (
            <>
              <ModalField>
                <ModalLabel>Stall Number:</ModalLabel>
                <ModalValue>{stallHolder.stallNumber}</ModalValue>
              </ModalField>
              <ModalField>
                <ModalLabel>Stall Holder:</ModalLabel>
                <ModalValue>{stallHolder.firstName} {stallHolder.lastName}</ModalValue>
              </ModalField>
              <ModalField>
                <ModalLabel>Unit:</ModalLabel>
                <ModalValue>{stallHolder.location}</ModalValue>
              </ModalField>
              <ModalField>
                <ModalLabel>Area (Meters):</ModalLabel>
                <ModalValue>{stallHolder.areaMeters}</ModalValue>
              </ModalField>
              <ModalField>
                <ModalLabel>Rate Per Meter:</ModalLabel>
                <ModalValue>{stallHolder.billing}</ModalValue>
              </ModalField>
              <ModalField>
                <ModalLabel>Date:</ModalLabel>
                <ModalValue>{stallHolder.date}</ModalValue>
              </ModalField>
            </>
          )}
        </ModalBody>
        <CloseButtonStyled onClick={onClose}>Close</CloseButtonStyled>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ConfirmationModal;
