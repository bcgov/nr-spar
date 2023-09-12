/* eslint-disable no-console */
import React from 'react';
import {
  BrowserRouter, Routes, Route
} from 'react-router-dom';

import './custom.scss';

import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import SilentCheckSso from './components/SilentCheckSso';
import Logout from './components/Logout';
import Layout from './layout/PrivateLayout';
import Landing from './views/Landing';
import Dashboard from './views/Dashboard/dashboard';
import SeedlotDetails from './views/Seedlot/SeedlotDetails';
import SeedlotDashboard from './views/Seedlot/SeedlotDashboard';
import CreateAClass from './views/Seedlot/CreateAClass';
import SeedlotCreatedFeedback from './views/Seedlot/SeedlotCreatedFeedback';
import MySeedlots from './views/Seedlot/MySeedlots';
import SeedlotRegistrationForm from './views/Seedlot/SeedlotRegistrationForm';

/**
 * Create an app structure conaining all the routes.
 *
 * @returns {JSX.Element} instance of the app ready to use.
 */
const App: React.FC = () => {
  const { signed } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/" element={<Layout />}>
          <Route path="/silent-check-sso" element={<SilentCheckSso />} />
          <Route path="/logout" element={<Logout />} />

          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute signed={signed}>
                <Dashboard />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/seedlots"
            element={(
              <ProtectedRoute signed={signed}>
                <SeedlotDashboard />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/seedlots/register-a-class"
            element={(
              <ProtectedRoute signed={signed}>
                <CreateAClass />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/seedlots/successfully-created/:seedlot"
            element={(
              <ProtectedRoute signed={signed}>
                <SeedlotCreatedFeedback />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/seedlots/details/:seedlot"
            element={(
              <ProtectedRoute signed={signed}>
                <SeedlotDetails />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/seedlots/registration/:seedlot"
            element={(
              <ProtectedRoute signed={signed}>
                <SeedlotRegistrationForm />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/seedlots/my-seedlots"
            element={(
              <ProtectedRoute signed={signed}>
                <MySeedlots />
              </ProtectedRoute>
            )}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
