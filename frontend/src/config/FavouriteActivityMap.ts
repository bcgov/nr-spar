import ROUTES from '../routes/constants';
import { FavActivityType } from '../types/FavActivityTypes';

const FavouriteActivityMap: Record<string, FavActivityType> = {
  seedlots: {
    id: -1,
    type: 'seedlots',
    image: 'SoilMoistureField',
    header: 'Seedlots',
    link: ROUTES.SEEDLOTS,
    highlighted: false,
    isConsep: false
  },
  registerAClass: {
    id: -1,
    type: 'registerAClass',
    image: 'TaskAdd',
    header: 'Create A-class seedlot',
    link: ROUTES.SEEDLOTS_A_CLASS_CREATION,
    highlighted: false,
    isConsep: false
  },
  mySeedlots: {
    id: -1,
    type: 'mySeedlots',
    image: 'TableSplit',
    header: 'My Seedlots',
    link: ROUTES.MY_SEEDLOTS,
    highlighted: false,
    isConsep: false
  },
  reviewSeedlots: {
    id: -1,
    type: 'reviewSeedlots',
    image: 'TableSplit',
    header: 'Review Seedlots',
    link: ROUTES.TSC_SEEDLOTS_TABLE,
    highlighted: false,
    isConsep: false
  },
  unknown: {
    id: -1,
    type: 'default',
    image: 'Unknown',
    header: 'Unknown activity: ',
    link: '#',
    highlighted: false,
    isConsep: false
  },
  testingActivities: {
    id: -1,
    type: 'testingActivities',
    image: 'TableSplit',
    header: 'Testing Activities',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true
  },
  maintainGerminationTray: {
    id: -1,
    type: 'maintainGerminationTray',
    image: 'TableSplit',
    header: 'Maintain Germination Tray',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true
  },
  withdrawalDate: {
    id: -1,
    type: 'withdrawalDate',
    image: 'TableSplit',
    header: 'Withdrawal Date',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true
  },
  testingRequestsReport: {
    id: -1,
    type: 'testingRequestsReport',
    image: 'TableSplit',
    header: 'Testing Requests Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true
  },
  reviewPendingRequests: {
    id: -1,
    type: 'reviewPendingRequests',
    image: 'TableSplit',
    header: 'Review Pending Requests',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true
  },
  germCountPredictions: {
    id: -1,
    type: 'germCountPredictions',
    image: 'TableSplit',
    header: 'Germ Count Predictions',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true
  }
};

export default FavouriteActivityMap;
