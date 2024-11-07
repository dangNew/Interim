// C:\Users\danic\OneDrive\Capstone\caps\src\Interim\SuccessfulSpace.js

import React, { useState } from 'react';

// Modal component to display success message
const ModalSuccess = ({ message, onClose }) => {
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <p>{message}</p>
        <button onClick={onClose} style={modalStyles.button}>OK</button>
      </div>
    </div>
  );
};

// Styles for the modal
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
  },
  button: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

const SuccessfulSpace = () => {
  const [showModal, setShowModal] = useState(false);

  // Function to save space and show modal instead of alert
  const saveSpace = () => {
    // Remove alert and use modal instead
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => setShowModal(false);

  return (
    <div>
      <h1>My Application</h1>
      <button onClick={saveSpace}>Save Space</button>

      {/* Render the ModalSuccess component when showModal is true */}
      {showModal && (
        <ModalSuccess
          message="Space saved successfully!"
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default SuccessfulSpace;
