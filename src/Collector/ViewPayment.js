import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore'; // Ensure correct Firestore imports
import { stallholderDb } from '../components/firebase.config'; // Correctly import your Firestore instance

const ViewPayment = () => {
  const { id } = useParams(); // Get the stall ID from the URL
  const [stallData, setStallData] = useState(null);

  useEffect(() => {
    const fetchStallData = async () => {
      try {
        const docRef = doc(stallholderDb, 'users', id); // Reference to the specific document in 'users' collection
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setStallData(docSnap.data()); // Update state with document data
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching stall data:", error);
      }
    };

    fetchStallData();
  }, [id]);

  return (
    <div>
      <h2>View Payment Details</h2>
      {stallData ? (
        <div>
          <p><strong>Stall Number:</strong> {stallData.stallInfo?.stallNumber}</p>
          <p><strong>First Name:</strong> {stallData.firstName}</p>
          <p><strong>Last Name:</strong> {stallData.lastName}</p>
          <p><strong>Location:</strong> {stallData.stallInfo?.location}</p>
          <p><strong>Area (Meters):</strong> {stallData.stallInfo?.stallSize}</p>
          <p><strong>Rate Per Meter:</strong> {stallData.stallInfo?.ratePerMeter}</p>
          <p><strong>Date of Registration:</strong> {new Date(stallData.dateOfRegistration.seconds * 1000).toLocaleDateString()}</p> {/* Formatting the timestamp */}
          <p><strong>Status:</strong> {stallData.stallInfo?.status}</p>
          {/* Display other payment details here */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ViewPayment;
