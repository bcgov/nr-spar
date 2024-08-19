import React, { useContext, useEffect } from 'react';
import {
  createBrowserRouter, RouteObject, RouterProvider
} from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { ClassPrefix } from '@carbon/react';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { isAxiosError } from 'axios';

import prefix from './styles/classPrefix';
import './styles/custom.scss';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './layout/PrivateLayout';
import Landing from './views/Landing';
import awsconfig from './aws-exports';
import AuthContext from './contexts/AuthContext';
import BrowserRoutes from './routes';
import ROUTES from './routes/constants';
import FourOhFour from './views/FourOhFour';
import ProtectedRoute from './routes/ProtectedRoute';
import { ThemePreference } from './utils/ThemePreference';
import LoginOrgSelection from './views/LoginOrgSelection';
import ServiceStatus from './views/ServiceStatus';

Amplify.configure(awsconfig);

const HTTP_STATUS_TO_NOT_RETRY = [400, 401, 403, 404];
const MAX_RETRIES = 3;

const queryClient = new QueryClient(
  {
    defaultOptions: {
      queries: {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        // Do not retry on errors defined above
        retry: (failureCount, error) => {
          if (failureCount > MAX_RETRIES) {
            return false;
          }
          if (isAxiosError(error)) {
            const status = error.response?.status;
            if (status && HTTP_STATUS_TO_NOT_RETRY.includes(status)) {
              return false;
            }
          }
          return true;
        }
      }
    }
  }
);

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

  return (
    <ClassPrefix prefix={prefix}>
      <ThemePreference>
        <QueryClientProvider client={queryClient}>
          <ToastContainer />
          <RouterProvider router={getBrowserRouter()} />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemePreference>
    </ClassPrefix>
  );
};

export default App;
