import React, { useEffect, useState } from 'react';
import { isCurrentAuthUser } from '../service/AuthService';
import { Navigate } from 'react-router-dom';

interface IProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: IProps): JSX.Element => {
  const [ signed, setSigned ] = useState<boolean>(false);

  const getEncodedUri = () :string => {
    const { pathname } = window.location;
    return encodeURI(`/?page=${pathname}`);
  };

  useEffect(() => {
    const isAuthFn = async () => {
      const isAuth = await isCurrentAuthUser();
      console.log(`ProtectedRoute - useEffect: isAuth=${isAuth}`);
      setSigned(isAuth);
    };

    isAuthFn();
  }, [signed]);

  return (
    signed ? children : <Navigate to={"/"} />
  );
};

export default ProtectedRoute;
