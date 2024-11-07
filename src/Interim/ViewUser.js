import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { interimDb } from '../components/firebase.config';

const ViewUser = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(interimDb, 'users', userId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return <p style={styles.loading}>Loading user details...</p>;
  }

  if (error) {
    return <p style={styles.errorMessage}>{error}</p>;
  }

  return (
    <div style={styles.viewUserContainer}>
      {userData ? (
        <div style={styles.userDetails}>
          <div style={styles.userCard}>
            <h1 style={styles.userName}>{`${userData.firstName} ${userData.lastName}`}</h1>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Position:</strong> {userData.position}</p>
          </div>
        </div>
      ) : (
        <p style={styles.noData}>No user data available</p>
      )}
    </div>
  );
};

const styles = {
  viewUserContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '30px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  userName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: '20px',
  },
  userDetails: {
    textAlign: 'center',
  },
  loading: {
    fontSize: '18px',
    color: '#ff6347',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: '18px',
    color: '#ff6347',
    textAlign: 'center',
  },
  noData: {
    fontSize: '18px',
    color: '#ff6347',
    textAlign: 'center',
  },
};

export default ViewUser;
