import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const ProtectedRoute = (): React.JSX.Element => {
  const { signed, signOut } = useContext(AuthContext);

  if (!signed) {
    signOut();
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
