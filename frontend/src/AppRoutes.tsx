/* eslint-disable no-nested-ternary */
import React, { useContext } from 'react';
import { useRoutes, Navigate, Outlet } from 'react-router';
import AuthContext from './contexts/AuthContext';
import ROUTES from './routes/constants';
import Landing from './views/Landing';
import LoginOrgSelection from './views/LoginOrgSelection';
import Layout from './layout/PrivateLayout';
import ServiceStatus from './views/ServiceStatus';
import FourOhFour from './views/ErrorViews/FourOhFour';
import BrowserRoutes from './routes';

const AppRoutes = () => {
  const { signed, signOut, selectedClientRoles } = useContext(AuthContext);

  const Protected = () => {
    if (!signed) {
      signOut();
      return <Navigate to={ROUTES.ROOT} replace />;
    }
    return <Outlet />;
  };

  return useRoutes([
    {
      path: ROUTES.ROOT,
      element: !signed
        ? <Landing />
        : signed && !selectedClientRoles
          ? <LoginOrgSelection />
          : <Protected />,
      children: signed && selectedClientRoles
        ? [{ element: <Layout />, children: BrowserRoutes }]
        : undefined
    },
    { path: ROUTES.SERVICE_STATUS, element: <ServiceStatus /> },
    { path: ROUTES.FOUR_OH_FOUR, element: <FourOhFour /> },
    { path: '*', element: <FourOhFour /> }
  ]);
};

export default AppRoutes;
