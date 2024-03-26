import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import ROUTES from '../constants';

const ProtectedRoute = (): React.JSX.Element => {
  const { signed, signOut } = useContext(AuthContext);

  if (!signed) {
    signOut();
    return <Navigate to={ROUTES.ROOT} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
