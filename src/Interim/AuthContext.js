import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { interimAuth } from '../components/firebase.config';  // Adjust the path if needed

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase listener to track auth state changes
    const unsubscribe = onAuthStateChanged(interimAuth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Prevent rendering until loading completes */}
    </AuthContext.Provider>
  );
};
