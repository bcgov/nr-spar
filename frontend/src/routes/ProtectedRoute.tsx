import React from 'react';
import { Navigate } from 'react-router-dom';
import { GO_TO_PAGE_KEY } from '../shared-constants/shared-constants';

interface IProps {
  signed: boolean,
  children: JSX.Element;
}

const ProtectedRoute = ({ signed, children }: IProps): JSX.Element => {
  if (!signed) {
    const { pathname } = window.location;
    localStorage.setItem(GO_TO_PAGE_KEY, pathname);
    return <Navigate to={'/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
