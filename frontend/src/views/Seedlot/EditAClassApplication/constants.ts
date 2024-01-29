import { useParams } from 'react-router-dom';
import { addParamToPath } from '../../../utils/PathUtils';
import PathConstants from '../../../routes/pathConstants';

const { seedlotNumber } = useParams();

export const EditAClassApplicationBreadcrumbs = [
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
    path: `${addParamToPath(PathConstants.SEEDLOT_DETAILS, seedlotNumber ?? '')}`
  }
];
