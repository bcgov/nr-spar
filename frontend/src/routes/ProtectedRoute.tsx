import React, { useCallback, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isCurrentAuthUser } from '../service/AuthService';

interface IProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: IProps): JSX.Element => {
  const [ signed, setSigned ] = useState<boolean>(false);

  useCallback(async () => {
    const isAuth = await isCurrentAuthUser();
    setSigned(isAuth);
  }, []);

  if (!signed) {
    const { pathname } = window.location;
    const encodedUrl = encodeURI(`/?page=${pathname}`);
    return <Navigate to={encodedUrl} replace />;
  }

  return children;
};

export default ProtectedRoute;
