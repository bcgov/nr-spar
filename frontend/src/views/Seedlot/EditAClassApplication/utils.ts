import ROUTES from '../../../routes/constants';
import { addParamToPath } from '../../../utils/PathUtils';

export const getBreadcrumbs = (seedlotNumber: string) => [
  {
    name: 'Seedlots',
    path: ROUTES.SEEDLOTS
  },
  {
    name: 'My seedlots',
    path: ROUTES.MY_SEEDLOTS
  },
  {
    name: `Seedlot ${seedlotNumber}`,
    path: `${addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber)}`
  }
];
