import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin');

  // If they have the key, show the page. If not, kick them to login.
  return isAdmin === 'true' ? children : <Navigate to="/login" />;
};

export default PrivateRoute;