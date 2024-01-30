import { useParams } from 'react-router-dom';
import PathConstants from '../../../routes/pathConstants';
import { addParamToPath } from '../../../utils/PathUtils';

export const EditAClassApplicationBreadcrumbs = () => {
  const { seedlotNumber } = useParams();
  const breadcrumbData = [
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
  return breadcrumbData;
};
