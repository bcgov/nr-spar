const ROUTES = {
  ALL_ROUTES: '*',
  LOGIN: '/login',
  ROOT: '/',
  DASHBOARD: '/dashboard',
  SEEDLOTS: '/seedlots',
  SEEDLOTS_A_CLASS_CREATION: '/seedlots/register-a-class',
  SEEDLOT_CREATION_SUCCESS: '/seedlots/creation-success',
  SEEDLOT_DETAILS: '/seedlots/details/:seedlotNumber',
  SEEDLOT_A_CLASS_REGISTRATION: '/seedlots/a-class-registration/:seedlotNumber',
  SEEDLOT_A_CLASS_EDIT: '/seedlots/edit-a-class-application/:seedlotNumber',
  SEEDLOT_A_CLASS_REVIEW: '/seedlots/a-class/review/:seedlotNumber',
  MY_SEEDLOTS: '/seedlots/my-seedlots',
  TSC_SEEDLOTS_TABLE: '/seedlots/tsc-admin-seedlots',
  FOUR_OH_FOUR: '/404',
  SERVICE_STATUS: '/service-status'
};

export default ROUTES;
