import React, { useContext, useEffect } from 'react';
import {
  createBrowserRouter, RouteObject, RouterProvider
} from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { ClassPrefix } from '@carbon/react';
import { ToastContainer } from 'react-toastify';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import awsconfig from './aws-exports';

import prefix from './styles/classPrefix';
import './styles/custom.scss';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './layout/PrivateLayout';
import Landing from './views/Landing';
import FourOhFour from './views/ErrorViews/FourOhFour';
import LoginOrgSelection from './views/LoginOrgSelection';
import ServiceStatus from './views/ServiceStatus';
import { NavigateProvider } from './contexts/NavigationContext';
import AuthContext from './contexts/AuthContext';
import BrowserRoutes from './routes';
import ROUTES from './routes/constants';
import ProtectedRoute from './routes/ProtectedRoute';
import { ThemePreference } from './utils/ThemePreference';
import CustomQueryProvider from './components/CustomQueryProvider';

Amplify.configure(awsconfig);

/**
 * Create an app structure containing all the routes.
 *
 * @returns {JSX.Element} instance of the app ready to use.
 */
const App: React.FC = () => {
  const { signed, isCurrentAuthUser, selectedClientRoles } = useContext(AuthContext);

  useEffect(() => {
    isCurrentAuthUser(window.location.pathname);
  }, []);

  const roleSelectionRoutes: RouteObject[] = [
    {
      path: ROUTES.ALL_ROUTES,
      element: <LoginOrgSelection />
    }
  ];

  const signedRoutes: RouteObject[] = [
    {
      path: ROUTES.ROOT,
      element: <ProtectedRoute />,
      children: [
        {
          element: <Layout />,
          children: BrowserRoutes
        }
      ]
    },
    {
      path: ROUTES.ALL_ROUTES,
      element: <FourOhFour />
    }
  ];

  const notSignedRoutes: RouteObject[] = [
    {
      path: ROUTES.ALL_ROUTES,
      element: <Landing />
    }
  ];

  const sharedRoutes: RouteObject[] = [
    {
      path: ROUTES.SERVICE_STATUS,
      element: <ServiceStatus />
    }
  ];

  const selectBrowserRoutes = () => {
    if (!signed) {
      return notSignedRoutes;
    }
    if (selectedClientRoles) {
      return signedRoutes;
    }
    return roleSelectionRoutes;
  };

  const getBrowserRouter = () => {
    const selectedRoutes = selectBrowserRoutes();
    selectedRoutes.push(...sharedRoutes);
    return createBrowserRouter(selectedRoutes);
  };

  const browserRouter = getBrowserRouter();

  const handleRedirectTo403 = () => {
    browserRouter.navigate('/403');
  };

  return (
    <ClassPrefix prefix={prefix}>
      <ThemePreference>
        <NavigateProvider onRedirect={handleRedirectTo403}>
          <CustomQueryProvider>
            <ToastContainer />
            <RouterProvider router={browserRouter} />
            <ReactQueryDevtools initialIsOpen={false} />
          </CustomQueryProvider>
        </NavigateProvider>
      </ThemePreference>
    </ClassPrefix>
  );
};

export default App;
