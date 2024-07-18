import ROUTES from '../routes/constants';
import { FavActivityType } from '../types/FavActivityTypes';

const FavouriteActivityMap: Record<string, FavActivityType> = {
  seedlots: {
    id: -1,
    type: 'seedlots',
    image: 'SoilMoistureField',
    header: 'Seedlots',
    description: 'Register and manage your seedlots',
    link: ROUTES.SEEDLOTS,
    highlighted: false
  },
  registerAClass: {
    id: -1,
    type: 'registerAClass',
    image: 'TaskAdd',
    header: 'Create A-class seedlot',
    link: ROUTES.SEEDLOTS_A_CLASS_CREATION,
    highlighted: false
  },
  mySeedlots: {
    id: -1,
    type: 'mySeedlots',
    image: 'TableSplit',
    header: 'My Seedlots',
    description: 'Check and manage your own seedlots',
    link: ROUTES.MY_SEEDLOTS,
    highlighted: false
  },
  reviewSeedlots: {
    id: -1,
    type: 'reviewSeedlots',
    image: 'TableSplit',
    header: 'Review Seedlots',
    description: 'Check all seedlots that are waiting for approval',
    link: ROUTES.TSC_SEEDLOTS_TABLE,
    highlighted: false
  },
  unknown: {
    id: -1,
    type: 'default',
    image: 'Unknown',
    header: 'Unknown activity: ',
    description: 'Please remove this invalid activity',
    link: '#',
    highlighted: false
  }
};

export default FavouriteActivityMap;
