import { RouteNames } from './definitions';

const PathConstants: RouteNames = {
  ALL_ROUTES: '*',
  LOGIN: '/login',
  HOME: '/',
  DASHBOARD: '/dashboard',
  SEEDLOTS: '/seedlots',
  SEEDLOTS_A_CLASS_CREATION: '/seedlots/register-a-class',
  SEEDLOT_CREATION_SUCCESS: '/seedlots/creation-success',
  SEEDLOT_DETAILS: '/seedlots/details/:seedlotNumber',
  SEEDLOT_A_CLASS_REGISTRATION: '/seedlots/a-class-registration/:seedlotNumber',
  SEEDLOT_A_CLASS_EDIT: '/seedlots/edit-a-class-application/:seedlotNumber',
  MY_SEEDLOTS: '/seedlots/my-seedlots',
  FOUR_OH_FOUR: '/404'
};

export default PathConstants;
