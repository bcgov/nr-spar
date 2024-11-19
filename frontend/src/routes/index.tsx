import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

import ROUTES from './constants';
import { getStoredPath } from '../utils/PathUtils';

import Dashboard from '../views/Dashboard/dashboard';
import SeedlotDashboard from '../views/Seedlot/SeedlotDashboard';
import TableTesting from '../views/TableTesting';
import CreateAClass from '../views/Seedlot/CreateAClass';
import EditAClassApplication from '../views/Seedlot/EditAClassApplication';
import MySeedlots from '../views/Seedlot/MySeedlots';
import SeedlotCreatedFeedback from '../views/Seedlot/SeedlotCreatedFeedback';
import SeedlotDetails from '../views/Seedlot/SeedlotDetails';
import SeedlotReview from '../views/Seedlot/SeedlotReview';
import SeedlotRegFormClassA from '../views/Seedlot/SeedlotRegFormClassA';
import ReviewSeedlots from '../views/Seedlot/ReviewSeedlots';
import FourOhThree from '../views/ErrorViews/FourOhThree';

const BrowserRoutes: Array<RouteObject> = [
  // Ensures that root paths get redirected to
  // dashboard, when user is logged in
  {
    path: ROUTES.ROOT,
    element: (
      <Navigate to={getStoredPath()} replace />
    )
  },
  // Same for the login path
  {
    path: ROUTES.LOGIN,
    element: (
      <Navigate to={ROUTES.DASHBOARD} replace />
    )
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <Dashboard />
    )
  },
  {
    path: ROUTES.SEEDLOTS,
    element: (
      <SeedlotDashboard />
    )
  },
  {
    path: ROUTES.TABLE_TESTING,
    element: (
      <TableTesting />
    )
  },
  {
    path: ROUTES.SEEDLOTS_A_CLASS_CREATION,
    element: (
      <CreateAClass />
    )
  },
  {
    path: ROUTES.SEEDLOT_CREATION_SUCCESS,
    element: (
      <SeedlotCreatedFeedback />
    )
  },
  {
    path: ROUTES.SEEDLOT_DETAILS,
    element: (
      <SeedlotDetails />
    )
  },
  {
    path: ROUTES.SEEDLOT_A_CLASS_REGISTRATION,
    element: (
      <SeedlotRegFormClassA />
    )
  },
  {
    path: ROUTES.SEEDLOT_A_CLASS_EDIT,
    element: (
      <EditAClassApplication />
    )
  },
  {
    path: ROUTES.MY_SEEDLOTS,
    element: (
      <MySeedlots />
    )
  },
  {
    path: ROUTES.SEEDLOT_A_CLASS_REVIEW,
    element: (
      <SeedlotReview />
    )
  },
  {
    path: ROUTES.TSC_SEEDLOTS_TABLE,
    element: (
      <ReviewSeedlots />
    )
  },
  {
    path: ROUTES.FOUR_OH_THREE,
    element: (
      <FourOhThree />
    )
  }
];

export default BrowserRoutes;
