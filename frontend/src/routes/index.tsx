import React from 'react';
import { Navigate } from 'react-router-dom';

import { RoutesType } from './definitions';
import PathConstants from './pathConstants';
import { getStoredPath } from '../utils/PathUtils';

import Dashboard from '../views/Dashboard/dashboard';
import SeedlotDashboard from '../views/Seedlot/SeedlotDashboard';
import CreateAClass from '../views/Seedlot/CreateAClass';
import EditAClassApplication from '../views/Seedlot/EditAClassApplication';
import MySeedlots from '../views/Seedlot/MySeedlots';
import SeedlotCreatedFeedback from '../views/Seedlot/SeedlotCreatedFeedback';
import SeedlotDetails from '../views/Seedlot/SeedlotDetails';
import SeedlotRegistrationForm from '../views/Seedlot/SeedlotRegistrationForm';

const routes: Array<RoutesType> = [
  // Ensures that root paths get redirected to
  // dashboard, when user is logged in
  {
    path: PathConstants.ROOT,
    element: (
      <Navigate to={getStoredPath()} replace />
    )
  },
  // Same for the login path
  {
    path: PathConstants.LOGIN,
    element: (
      <Navigate to={PathConstants.DASHBOARD} replace />
    )
  },
  {
    path: PathConstants.DASHBOARD,
    element: (
      <Dashboard />
    )
  },
  {
    path: PathConstants.SEEDLOTS,
    element: (
      <SeedlotDashboard />
    )
  },
  {
    path: PathConstants.SEEDLOTS_A_CLASS_CREATION,
    element: (
      <CreateAClass />
    )
  },
  {
    path: PathConstants.SEEDLOT_CREATION_SUCCESS,
    element: (
      <SeedlotCreatedFeedback />
    )
  },
  {
    path: PathConstants.SEEDLOT_DETAILS,
    element: (
      <SeedlotDetails />
    )
  },
  {
    path: PathConstants.SEEDLOT_A_CLASS_REGISTRATION,
    element: (
      <SeedlotRegistrationForm />
    )
  },
  {
    path: PathConstants.SEEDLOT_A_CLASS_EDIT,
    element: (
      <EditAClassApplication />
    )
  },
  {
    path: PathConstants.MY_SEEDLOTS,
    element: (
      <MySeedlots />
    )
  }
];

export default routes;
