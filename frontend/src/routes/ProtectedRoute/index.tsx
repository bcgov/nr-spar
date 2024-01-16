import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import PathConstants from '../pathConstants';

const ProtectedRoute = (): React.JSX.Element => {
  const { signed, signOut } = useContext(AuthContext);

  if (!signed) {
    signOut();
    return <Navigate to={PathConstants.ROOT} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
