import React, { useContext, useEffect } from 'react';
import {
  BrowserRouter
} from 'react-router';
import { Amplify } from 'aws-amplify';
import { ClassPrefix } from '@carbon/react';
import { ToastContainer } from 'react-toastify';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import awsconfig from './aws-exports';

import prefix from './styles/classPrefix';
import './styles/custom.scss';
import 'react-toastify/dist/ReactToastify.css';
import { NavigateProvider } from './contexts/NavigationContext';
import AuthContext from './contexts/AuthContext';
import { ThemePreference } from './utils/ThemePreference';
import CustomQueryProvider from './components/CustomQueryProvider';
import AppRoutes from './AppRoutes';

Amplify.configure(awsconfig);

/**
 * Create an app structure containing all the routes.
 *
 * @returns {JSX.Element} instance of the app ready to use.
 */
const App: React.FC = () => {
  const { isCurrentAuthUser } = useContext(AuthContext);

  useEffect(() => {
    isCurrentAuthUser(window.location.pathname);
  }, []);

  return (
    <ClassPrefix prefix={prefix}>
      <ThemePreference>
        <NavigateProvider onRedirect={() => {
          // go to 403 page
          window.location.href = '/403';
        }}
        >
          <CustomQueryProvider>
            <ToastContainer />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
          </CustomQueryProvider>
        </NavigateProvider>
      </ThemePreference>
    </ClassPrefix>
  );
};

export default App;
