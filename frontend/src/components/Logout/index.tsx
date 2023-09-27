import React, { useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Logout = () => {
  const { signOut, signed } = useAuth();

  const goOut = useCallback(async () => {
    await signOut();
  }, []);

  if (signed) {
    goOut();
  }

  return <Navigate to="/" />;
};

export default Logout;
