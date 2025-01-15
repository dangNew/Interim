import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ element }) => {
  const { currentUser } = useAuth();
  console.log("Current user in ProtectedRoute:", currentUser); // Check if currentUser is populated

  return currentUser ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
