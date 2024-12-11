import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { rentmobileDb } from '../components/firebase.config';

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
  padding: 40px; /* Increase padding for a larger appearance */
  border-radius: 12px; /* Slightly larger corner radius */
  max-width: 50%; /* Allow the modal to take up 50% of the viewport width */
  width: 100%;
  max-height: 90vh; /* Increase height limit to 90% of the viewport */
  overflow-y: auto; /* Enable scrolling for overflow content */
  text-align: center;
`;

const ModalImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 10px;
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

const ViolationModal = ({ isOpen, onClose, vendorId }) => {
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && vendorId) {
      const fetchImages = async () => {
        try {
          const violationCollection = collection(rentmobileDb, 'Market_violations');
          const q = query(violationCollection, where('vendorId', '==', vendorId));
          const querySnapshot = await getDocs(q);
          const urls = [];

          if (!querySnapshot.empty) {
            querySnapshot.docs.forEach((doc) => {
              const violationData = doc.data();
              // Check for multiple image fields
              for (let i = 0; ; i++) {
                const imageField = `image_${i}`;
                if (violationData[imageField]) {
                  urls.push(violationData[imageField]);
                } else {
                  break; // Stop if no more image fields are found
                }
              }
            });
          } else {
            console.log(`No documents found for vendorId: ${vendorId}`);
          }

          setImageUrls(urls);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching images:', error);
          setError('Failed to fetch images. Please try again later.');
          setLoading(false);
        }
      };

      fetchImages();
    }
  }, [isOpen, vendorId]);

  if (!isOpen) return null;

  const handleContainerClick = (e) => {
    // Close the modal only if the click happens on the container, not the content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalContainer onClick={handleContainerClick}>
      <ModalContent>
        <h2>Violation Details</h2>
        {loading ? (
          'Loading...'
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : imageUrls.length > 0 ? (
          imageUrls.map((url, index) => <ModalImage key={index} src={url} alt={`Violation ${index + 1}`} />)
        ) : (
          'No images found.'
        )}
        <CloseButton onClick={onClose}>Close</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
};

export default ViolationModal;
