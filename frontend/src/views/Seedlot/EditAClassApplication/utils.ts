import PathConstants from '../../../routes/pathConstants';
import { addParamToPath } from '../../../utils/PathUtils';

export const getBreadcrumbs = (seedlotNumber: string) => [
  {
    name: 'Seedlots',
    path: `${PathConstants.SEEDLOTS}`
  },
  {
    name: 'My seedlots',
    path: `${PathConstants.MY_SEEDLOTS}`
  },
  {
    name: `Seedlot ${seedlotNumber}`,
    path: `${addParamToPath(PathConstants.SEEDLOT_DETAILS, seedlotNumber)}`
  }
];
