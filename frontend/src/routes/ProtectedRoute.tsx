import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

interface IProps {
  children: React.JSX.Element;
}

const ProtectedRoute = ({ children }: IProps): React.JSX.Element => {
  const { signed, signOut } = useContext(AuthContext);

  if (!signed) {
    signOut();
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
