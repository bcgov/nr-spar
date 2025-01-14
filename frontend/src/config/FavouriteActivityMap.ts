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
  actualGerminationCount: {
    id: -1,
    type: 'actualGerminationCount',
    image: 'TableSplit',
    header: 'Actual Germination Count',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  calculateCropAverage: {
    id: -1,
    type: 'calculateCropAverage',
    image: 'TableSplit',
    header: 'Calculate Crop Average',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Administrative'
  },
  cancelledRequestsReport: {
    id: -1,
    type: 'cancelledRequestsReport',
    image: 'TableSplit',
    header: 'Cancelled Requests Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  coneAndSeedProcessingReport: {
    id: -1,
    type: 'coneAndSeedProcessingReport',
    image: 'TableSplit',
    header: 'Cone and Seed Processing Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Processing'
  },
  coneAndSeedShipmentReceipt: {
    id: -1,
    type: 'coneAndSeedShipmentReceipt',
    image: 'TableSplit',
    header: 'Cone and Seed Shipment Receipt',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  createGerminationTray: {
    id: -1,
    type: 'createGerminationTray',
    image: 'TableSplit',
    header: 'Create Germination Tray',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  cspRequest: {
    id: -1,
    type: 'cspRequest',
    image: 'TableSplit',
    header: 'CSP Request',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Processing'
  },
  doNotStartList: {
    id: -1,
    type: 'doNotStartList',
    image: 'TableSplit',
    header: 'Do Not Start List',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  familyLot: {
    id: -1,
    type: 'familyLot',
    image: 'TableSplit',
    header: 'Family Lot',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  familyLotSummaryReport: {
    id: -1,
    type: 'familyLotSummaryReport',
    image: 'TableSplit',
    header: 'Family Lot Summary Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  germinationSpeciesAverage: {
    id: -1,
    type: 'germinationSpeciesAverage',
    image: 'TableSplit',
    header: 'Germination Species Average',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  germCountPredictions: {
    id: -1,
    type: 'germCountPredictions',
    image: 'TableSplit',
    header: 'Germ Count Predictions',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  identifyAvailableLongTermLocation: {
    id: -1,
    type: 'identifyAvailableLongTermLocation',
    image: 'TableSplit',
    header: 'Identify Available Long-Term Location',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  inHouseInventory: {
    id: -1,
    type: 'inHouseInventory',
    image: 'TableSplit',
    header: 'In-House Inventory',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  inventoryLocationReport: {
    id: -1,
    type: 'inventoryLocationReport',
    image: 'TableSplit',
    header: 'Inventory Location Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  kilnPrograms: {
    id: -1,
    type: 'kilnPrograms',
    image: 'TableSplit',
    header: 'Kiln Programs',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Administrative'
  },
  maintainClientLocation: {
    id: -1,
    type: 'maintainClientLocation',
    image: 'TableSplit',
    header: 'Maintain Client Location',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Administrative'
  },
  maintainGerminationTrayScreen: {
    id: -1,
    type: 'maintainGerminationTrayScreen',
    image: 'TableSplit',
    header: 'Maintain Germination Tray Screen',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  maintainLocalContacts: {
    id: -1,
    type: 'maintainLocalContacts',
    image: 'TableSplit',
    header: 'Maintain Local Contacts',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Administrative'
  },
  maintainStandardActivities: {
    id: -1,
    type: 'maintainStandardActivities',
    image: 'TableSplit',
    header: 'Maintain Standard Activities',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Administrative'
  },
  maintainStatHolidays: {
    id: -1,
    type: 'maintainStatHolidays',
    image: 'TableSplit',
    header: 'Maintain Stat Holidays',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  maintainWorkPlans: {
    id: -1,
    type: 'maintainWorkPlans',
    image: 'TableSplit',
    header: 'Maintain Work Plans',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Administrative'
  },
  manualMoistureContent: {
    id: -1,
    type: 'manualMoistureContent',
    image: 'TableSplit',
    header: 'Manual Moisture Content',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  processingActivities: {
    id: -1,
    type: 'processingActivities',
    image: 'TableSplit',
    header: 'Processing Activities',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Processing'
  },
  recordStockCountResults: {
    id: -1,
    type: 'recordStockCountResults',
    image: 'TableSplit',
    header: 'Record Stock Count Results',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  requestChangesReport: {
    id: -1,
    type: 'requestChangesReport',
    image: 'TableSplit',
    header: 'Request Changes Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  returnedSeed: {
    id: -1,
    type: 'returnedSeed',
    image: 'TableSplit',
    header: 'Returned Seed',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  reviewPendingRequest: {
    id: -1,
    type: 'reviewPendingRequest',
    image: 'TableSplit',
    header: 'Review Pending Request',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  scheduleOrReviseRequestItemActivity: {
    id: -1,
    type: 'scheduleOrReviseRequestItemActivity',
    image: 'TableSplit',
    header: 'Schedule or Revise Request Item Activity',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  seedAndFamilyLotReport: {
    id: -1,
    type: 'seedAndFamilyLotReport',
    image: 'TableSplit',
    header: 'Seed and Family Lot Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  seedSaleOrTransferActivitiesScreen: {
    id: -1,
    type: 'seedSaleOrTransferActivitiesScreen',
    image: 'TableSplit',
    header: 'Seed Sale or Transfer Activities Screen',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  seedlotCharacteristics: {
    id: -1,
    type: 'seedlotCharacteristics',
    image: 'TableSplit',
    header: 'Seedlot Characteristics',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  seedlotLocationHistoryReport: {
    id: -1,
    type: 'seedlotLocationHistoryReport',
    image: 'TableSplit',
    header: 'Seedlot Location History Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  seedlotObservationHistory: {
    id: -1,
    type: 'seedlotObservationHistory',
    image: 'TableSplit',
    header: 'Seedlot Observation History',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  seedlotOrRequestItemInventoryLocation: {
    id: -1,
    type: 'seedlotOrRequestItemInventoryLocation',
    image: 'TableSplit',
    header: 'Seedlot or Request Item Inventory Location',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  seedlotOwner: {
    id: -1,
    type: 'seedlotOwner',
    image: 'TableSplit',
    header: 'Seedlot Owner',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  seedlotTestHistoryReport: {
    id: -1,
    type: 'seedlotTestHistoryReport',
    image: 'TableSplit',
    header: 'Seedlot Test History Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  stockCountStatusReport: {
    id: -1,
    type: 'stockCountStatusReport',
    image: 'TableSplit',
    header: 'Stock Count Status Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  testingActivitiesList: {
    id: -1,
    type: 'testingActivitiesList',
    image: 'TableSplit',
    header: 'Testing Activities List',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  testingActivitiesSummaryReport: {
    id: -1,
    type: 'testingActivitiesSummaryReport',
    image: 'TableSplit',
    header: 'Testing Activities Summary Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  testingRequestsReport: {
    id: -1,
    type: 'testingRequestsReport',
    image: 'TableSplit',
    header: 'Testing Requests Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  waybills: {
    id: -1,
    type: 'waybills',
    image: 'TableSplit',
    header: 'Waybills',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  withdrawalDate: {
    id: -1,
    type: 'withdrawalDate',
    image: 'TableSplit',
    header: 'Withdrawal Date',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  withdrawalRequest: {
    id: -1,
    type: 'withdrawalRequest',
    image: 'TableSplit',
    header: 'Withdrawal Request',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  withdrawalRequestDetailsReport: {
    id: -1,
    type: 'withdrawalRequestDetailsReport',
    image: 'TableSplit',
    header: 'Withdrawal Request Details Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  withdrawalRequestReport: {
    id: -1,
    type: 'withdrawalRequestReport',
    image: 'TableSplit',
    header: 'Withdrawal Request Report',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  withdrawalResults: {
    id: -1,
    type: 'withdrawalResults',
    image: 'TableSplit',
    header: 'Withdrawal Results',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  withdrawalResultObservations: {
    id: -1,
    type: 'withdrawalResultObservations',
    image: 'TableSplit',
    header: 'Withdrawal Result Observations',
    link: ROUTES.CONSEP_FAVOURITE_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  }
};

export default FavouriteActivityMap;
