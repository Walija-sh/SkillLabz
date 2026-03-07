import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  // Grab the authentication status from your Redux store
  const { status } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!status) {
    // If not logged in, send them to login. 
    // We pass the 'location' in state so you can redirect them back 
    // to where they originally wanted to go after they successfully log in!
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If they are logged in, render the requested component
  return children;
}