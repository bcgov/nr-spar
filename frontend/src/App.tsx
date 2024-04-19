import React, { useContext, useEffect } from 'react';
import {
  createBrowserRouter, RouterProvider
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
import LoginRoleSelection from './views/LoginRoleSelection';

Amplify.configure(awsconfig);

/**
 * Create an app structure containing all the routes.
 *
 * @returns {JSX.Element} instance of the app ready to use.
 */
const App: React.FC = () => {
  const HTTP_STATUS_TO_NOT_RETRY = [400, 401, 403, 404];
  const MAX_RETRIES = 3;

  const { signed, isCurrentAuthUser, selectedClientRoles } = useContext(AuthContext);

  useEffect(() => {
    isCurrentAuthUser(window.location.pathname);
  }, []);

  const roleSelectionRouter = createBrowserRouter([
    {
      path: ROUTES.ALL_ROUTES,
      element: <LoginRoleSelection />
    }
  ]);

  const signedRouter = createBrowserRouter([
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
  ]);

  const notSignedRouter = createBrowserRouter([
    {
      path: ROUTES.ALL_ROUTES,
      element: <Landing />
    }
  ]);

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
            if (
              isAxiosError(error)
              && HTTP_STATUS_TO_NOT_RETRY.includes(error.response?.status ?? 0)
            ) {
              return false;
            }
            return true;
          }
        }
      }
    }
  );

  const getBrowserRouter = () => {
    if (selectedClientRoles) {
      return signedRouter;
    }
    if (!signed) {
      return notSignedRouter;
    }
    return roleSelectionRouter;
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
