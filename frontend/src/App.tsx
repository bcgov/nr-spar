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
import SeedlotDashboard from './views/SeedlotDashboard';
import SeedlotCreatedFeedback from './views/SeedlotCreatedFeedback';

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
            path="/seedlot"
            element={(
              <ProtectedRoute signed={signed}>
                <SeedlotDashboard />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/seedlot/successfully-created"
            element={(
              <ProtectedRoute signed={signed}>
                <SeedlotCreatedFeedback />
              </ProtectedRoute>
            )}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
