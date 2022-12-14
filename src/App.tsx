/* eslint-disable no-console */
import React from 'react';
import {
  BrowserRouter, Routes, Route
} from 'react-router-dom';

import './custom.scss';

import Form from './views/Form';
import Table from './views/Table';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import SilentCheckSso from './components/SilentCheckSso';
import Logout from './components/Logout';
import Layout from './layout/PublicLayout';
import Dashboard from './views/Dashboard/dashboard';
import NewLanding from './views/NewLanding';

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
        <Route path="/" element={<NewLanding />} />
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
            path="/form"
            element={(
              <ProtectedRoute signed={signed}>
                <Form />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/table"
            element={(
              <ProtectedRoute signed={signed}>
                <Table />
              </ProtectedRoute>
            )}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
