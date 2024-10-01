// ConfirmationModal.js
import React from 'react';
import './ConfirmationModal.css'; // Import CSS if you have any styles

const ConfirmationModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>User Created</h2>
                <p>Your user has been created successfully!</p>
                <button onClick={onClose}>Okay</button>
            </div>
        </div>
    );
};

export default ConfirmationModal;
