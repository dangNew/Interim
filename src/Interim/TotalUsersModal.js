import React from 'react';
import styled from 'styled-components';

const ModalBackdrop = styled.div`
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
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 1000px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 80vh;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-bottom: 30px;

  th, td {
    padding: 15px;
    text-align: left;
    border-right: 2px solid #dee2e6; /* Divider between columns */
    border-bottom: 2px solid #dee2e6;
  }

  th {
    background-color: #e9ecef;
  }

  th:first-child, td:first-child {
    border-left: 2px solid #dee2e6; /* Add left border to the first column */
  }

  tr:nth-child(even) {
    background-color: #f2f2f2; /* Light gray for even rows */
  }

  tr:nth-child(odd) {
    background-color: #ffffff; /* White for odd rows */
  }

  td:last-child {
    border-right: none; /* Remove right border for the last column */
  }
`;

const CloseButton = styled.button`
  padding: 12px 25px;
  background-color: #ff3b3f;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  border-radius: 6px;
  margin-top: 20px;
  width: 100%;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e32f2f;
  }
`;

const TotalUsersModal = ({ users, onClose }) => {
  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>All Users</h2>
        <Table>
          <thead>
            <tr>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Location</th>
              <th>Middle Name</th>
              <th>Address</th>
              <th>Contact Number</th>
              <th>Position</th>
             
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={index}>
                  <td>{user.email}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.location}</td>
                  <td>{user.middleName}</td>
                  <td>{user.address}</td>
                  <td>{user.contactNum}</td>
                  <td>{user.position}</td>
                 
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '15px', color: '#777' }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default TotalUsersModal;
