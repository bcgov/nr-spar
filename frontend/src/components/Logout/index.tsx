import React, { useCallback, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Logout = () => {
  const { signOut, signed } = useContext(AuthContext);

  const goOut = useCallback(async () => {
    await signOut();
  }, []);

  if (signed) {
    goOut();
  }

  return <Navigate to="/" />;
};

export default Logout;
