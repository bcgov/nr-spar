import ROUTES from '../routes/constants';
import { addParamToPath } from './PathUtils';
import { MINISTRY_OF_FOREST_ID } from '../shared-constants/shared-constants';

export const getSeedlotBreadcrumbs = (
  seedlotNumber: string,
  seedlotApplicant: string,
  isTscAdmin: boolean
) => {
  const crumbsList = [];
  crumbsList.push({ name: 'Seedlots', path: ROUTES.SEEDLOTS });
  if (isTscAdmin && seedlotApplicant !== MINISTRY_OF_FOREST_ID) {
    crumbsList.push({ name: 'Review Seedlots', path: ROUTES.TSC_SEEDLOTS_TABLE });
  } else {
    crumbsList.push({ name: 'My seedlots', path: ROUTES.MY_SEEDLOTS });
  }
  crumbsList.push({
    name: `Seedlot ${seedlotNumber}`,
    path: `${addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber)}`
  });
  return crumbsList;
};
