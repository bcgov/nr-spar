import { FavActivityType } from '../types/FavActivityTypes';

const FavouriteActivityMap: Record<string, FavActivityType> = {
  seedlots: {
    id: -1,
    type: 'seedlots',
    image: 'SoilMoistureField',
    header: 'Seedlots',
    description: 'Register and manage your seedlots',
    link: '/seedlots',
    highlighted: false
  },
  registerAClass: {
    id: -1,
    type: 'registerAClass',
    image: 'TaskAdd',
    header: 'Create A class seedlot',
    description: 'Register a new A class seedlot',
    link: '/seedlots/register-a-class',
    highlighted: false
  },
  mySeedlots: {
    id: -1,
    type: 'mySeedlots',
    image: 'TableSplit',
    header: 'My Seedlots',
    description: 'Check and manage your own seedlots',
    link: '/seedlots/my-seedlots',
    highlighted: false
  },
  unkown: {
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
