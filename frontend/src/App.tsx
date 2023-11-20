/* eslint-disable no-console */
import React, { useContext, useEffect } from 'react';
import {
  Routes, Route, Navigate, useNavigate
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import './styles/custom.scss';
import 'react-toastify/dist/ReactToastify.css';

import { Amplify } from 'aws-amplify';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './layout/PrivateLayout';
import Landing from './views/Landing';
import Dashboard from './views/Dashboard/dashboard';
import SeedlotDetails from './views/Seedlot/SeedlotDetails';
import SeedlotDashboard from './views/Seedlot/SeedlotDashboard';
import CreateAClass from './views/Seedlot/CreateAClass';
import SeedlotCreatedFeedback from './views/Seedlot/SeedlotCreatedFeedback';
import MySeedlots from './views/Seedlot/MySeedlots';
import SeedlotRegistrationForm from './views/Seedlot/SeedlotRegistrationForm';
import FourOhFour from './views/FourOhFour';

import awsconfig from './aws-exports';
import AuthContext from './contexts/AuthContext';
import { SPAR_REDIRECT_PATH } from './shared-constants/shared-constants';

Amplify.configure(awsconfig);

/**
 * Create an app structure conaining all the routes.
 *
 * @returns {JSX.Element} instance of the app ready to use.
 */
const App: React.FC = () => {
  const { signed, isCurrentAuthUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    isCurrentAuthUser(window.location.pathname);
  }, []);

  useEffect(() => {
    if (signed) {
      const storedPath = localStorage.getItem(SPAR_REDIRECT_PATH);
      if (storedPath) {
        navigate(storedPath === '/' ? '/dashbaord' : storedPath);
        localStorage.removeItem(SPAR_REDIRECT_PATH);
      } else if (window.location.pathname === '/') {
        navigate('/dashboard');
      }
    }
  }, [signed]);

  return (
    <>
      <ToastContainer />
      <Routes>
        {
          signed ? (
            <>
              <Route path="/" element={<Layout />}>
                <Route
                  path="/dashboard"
                  element={(
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  )}
                />

                <Route
                  path="/seedlots"
                  element={(
                    <ProtectedRoute>
                      <SeedlotDashboard />
                    </ProtectedRoute>
                  )}
                />

                <Route
                  path="/seedlots/register-a-class"
                  element={(
                    <ProtectedRoute>
                      <CreateAClass />
                    </ProtectedRoute>
                  )}
                />

                <Route
                  path="/seedlots/creation-success"
                  element={(
                    <ProtectedRoute>
                      <SeedlotCreatedFeedback />
                    </ProtectedRoute>
                  )}
                />

                <Route
                  path="/seedlots/details/:seedlotNumber"
                  element={(
                    <ProtectedRoute>
                      <SeedlotDetails />
                    </ProtectedRoute>
                  )}
                />

                <Route
                  path="/seedlots/a-class-registration/:seedlotNumber"
                  element={(
                    <ProtectedRoute>
                      <SeedlotRegistrationForm />
                    </ProtectedRoute>
                  )}
                />

                <Route
                  path="/seedlots/my-seedlots"
                  element={(
                    <ProtectedRoute>
                      <MySeedlots />
                    </ProtectedRoute>
                  )}
                />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
              <Route path="/404" element={<FourOhFour />} />
            </>
          )
            : <Route path="*" element={<Landing />} />
        }
      </Routes>
    </>
  );
};

export default App;
