// src/Interim/ViewStallholder.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { stallholderDb } from '../components/firebase.config';

// Styles as a CSS object
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    maxWidth: '700px',
    width: '100%',
    transition: 'transform 0.3s, box-shadow 0.3s',
    textAlign: 'left',
  },
  title: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '20px',
    fontWeight: '600',
  },
  name: {
    fontSize: '28px',
    color: '#28a745', // Green color for the name
    marginBottom: '30px',
    fontWeight: '600',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)', // Slight shadow for highlight
  },
  info: {
    fontSize: '18px',
    color: '#666',
    lineHeight: '1.6',
    margin: '10px 0',
    padding: '10px 0',
    borderTop: '3px solid #28a745', // Thicker green border for info section
  },
  strong: {
    color: '#333',
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    fontSize: '24px',
    color: '#888',
  },
  error: {
    textAlign: 'center',
    fontSize: '24px',
    color: '#dc3545',
  },
  divider: {
    margin: '20px 0',
    height: '1px',
    backgroundColor: '#e9ecef',
  },
  greenBackground: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)', // Light green background for emphasis
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
  },
};

const ViewStallholder = () => {
  const { id } = useParams(); // Get the stallholder ID from the URL
  const [stallholder, setStallholder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStallholder = async () => {
      try {
        const stallholderDoc = doc(stallholderDb, 'users', id); // Reference to the stallholder document
        const docSnap = await getDoc(stallholderDoc);

        if (docSnap.exists()) {
          setStallholder(docSnap.data());
        } else {
          setError('No such stallholder found!');
        }
      } catch (err) {
        setError('Error fetching stallholder data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStallholder();
  }, [id]);

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Stallholder Details</h1>
        <h2 style={styles.name}>{`${stallholder.firstName} ${stallholder.lastName}`}</h2>
        <div style={styles.greenBackground}>
          <div style={styles.info}>
            <p><strong style={styles.strong}>Stall Number:</strong> {stallholder.stallInfo?.stallNumber}</p>
            <div style={styles.divider}></div>
            <p><strong style={styles.strong}>Location:</strong> {stallholder.stallInfo?.location}</p>
            <p><strong style={styles.strong}>Size:</strong> {stallholder.stallInfo?.stallSize} meters</p>
            <p><strong style={styles.strong}>Rate Per Meter:</strong> ${stallholder.stallInfo?.ratePerMeter}</p>
            <p><strong style={styles.strong}>Date Registered:</strong> {stallholder.dateOfRegistration?.toDate().toLocaleDateString()}</p>
            {/* Add more fields as necessary */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStallholder;
