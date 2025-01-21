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
    header: 'Actual germination count',
    link: ROUTES.ACTUAL_GERMINATION_COUNT,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  calculateCropAverage: {
    id: -1,
    type: 'calculateCropAverage',
    image: 'TableSplit',
    header: 'Calculate crop average',
    link: ROUTES.CALCULATE_CROP_AVERAGE,
    highlighted: false,
    isConsep: true,
    department: 'Administrative'
  },
  cancelledRequestsReport: {
    id: -1,
    type: 'cancelledRequestsReport',
    image: 'TableSplit',
    header: 'Cancelled requests report',
    link: ROUTES.CANCELLED_REQUESTS_REPORT,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  coneAndSeedProcessingReport: {
    id: -1,
    type: 'coneAndSeedProcessingReport',
    image: 'TableSplit',
    header: 'Cone and seed processing report',
    link: ROUTES.CONE_AND_SEED_PROCESSING_REPORT,
    highlighted: false,
    isConsep: true,
    department: 'Processing'
  },
  coneAndSeedShipmentReceipt: {
    id: -1,
    type: 'coneAndSeedShipmentReceipt',
    image: 'TableSplit',
    header: 'Cone and seed shipment receipt',
    link: ROUTES.CONE_AND_SEED_SHIPMENT_RECEIPT,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  createGerminationTray: {
    id: -1,
    type: 'createGerminationTray',
    image: 'TableSplit',
    header: 'Create germination tray',
    link: ROUTES.CREATE_GERMINATION_TRAY,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  cspRequest: {
    id: -1,
    type: 'cspRequest',
    image: 'TableSplit',
    header: 'CSP request',
    link: ROUTES.CSP_REQUEST,
    highlighted: false,
    isConsep: true,
    department: 'Processing'
  },
  doNotStartList: {
    id: -1,
    type: 'doNotStartList',
    image: 'TableSplit',
    header: 'Do not start list',
    link: ROUTES.DO_NOT_START_LIST,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  familyLot: {
    id: -1,
    type: 'familyLot',
    image: 'TableSplit',
    header: 'Family lot',
    link: ROUTES.FAMILY_LOT,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  familyLotSummaryReport: {
    id: -1,
    type: 'familyLotSummaryReport',
    image: 'TableSplit',
    header: 'Family lot summary report',
    link: ROUTES.FAMILY_LOT_SUMMARY_REPORT,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  germinationSpeciesAverage: {
    id: -1,
    type: 'germinationSpeciesAverage',
    image: 'TableSplit',
    header: 'Germination species average',
    link: ROUTES.GERMINATION_SPECIES_AVERAGE,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  germCountPredictions: {
    id: -1,
    type: 'germCountPredictions',
    image: 'TableSplit',
    header: 'Germ count predictions',
    link: ROUTES.GERM_COUNT_PREDICTIONS,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  identifyAvailableLongTermLocation: {
    id: -1,
    type: 'identifyAvailableLongTermLocation',
    image: 'TableSplit',
    header: 'Identify available long-term location',
    link: ROUTES.IDENTIFY_AVAILABLE_LONG_TERM_LOCATION,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  inHouseInventory: {
    id: -1,
    type: 'inHouseInventory',
    image: 'TableSplit',
    header: 'In-house inventory',
    link: ROUTES.IN_HOUSE_INVENTORY,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  inventoryLocationReport: {
    id: -1,
    type: 'inventoryLocationReport',
    image: 'TableSplit',
    header: 'Inventory location report',
    link: ROUTES.INVENTORY_LOCATION_REPORT,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  kilnPrograms: {
    id: -1,
    type: 'kilnPrograms',
    image: 'TableSplit',
    header: 'Kiln programs',
    link: ROUTES.KILN_PROGRAMS,
    highlighted: false,
    isConsep: true,
    department: 'Administrative'
  },
  maintainClientLocation: {
    id: -1,
    type: 'maintainClientLocation',
    image: 'TableSplit',
    header: 'Maintain client location',
    link: ROUTES.MAINTAIN_CLIENT_LOCATION,
    highlighted: false,
    isConsep: true,
    department: 'Administrative'
  },
  maintainGerminationTrayScreen: {
    id: -1,
    type: 'maintainGerminationTrayScreen',
    image: 'TableSplit',
    header: 'Maintain germination tray screen',
    link: ROUTES.MAINTAIN_GERMINATION_TRAY_SCREEN,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  maintainLocalContacts: {
    id: -1,
    type: 'maintainLocalContacts',
    image: 'TableSplit',
    header: 'Maintain local contacts',
    link: ROUTES.MAINTAIN_LOCAL_CONTACTS,
    highlighted: false,
    isConsep: true,
    department: 'Administrative'
  },
  maintainStandardActivities: {
    id: -1,
    type: 'maintainStandardActivities',
    image: 'TableSplit',
    header: 'Maintain standard activities',
    link: ROUTES.MAINTAIN_STANDARD_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Administrative'
  },
  maintainStatHolidays: {
    id: -1,
    type: 'maintainStatHolidays',
    image: 'TableSplit',
    header: 'Maintain stat holidays',
    link: ROUTES.MAINTAIN_STAT_HOLIDAYS,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  maintainWorkPlans: {
    id: -1,
    type: 'maintainWorkPlans',
    image: 'TableSplit',
    header: 'Maintain work plans',
    link: ROUTES.MAINTAIN_WORK_PLANS,
    highlighted: false,
    isConsep: true,
    department: 'Administrative'
  },
  manualMoistureContent: {
    id: -1,
    type: 'manualMoistureContent',
    image: 'TableSplit',
    header: 'Manual moisture content',
    link: ROUTES.MANUAL_MOISTURE_CONTENT,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  processingActivities: {
    id: -1,
    type: 'processingActivities',
    image: 'TableSplit',
    header: 'Processing activities',
    link: ROUTES.PROCESSING_ACTIVITIES,
    highlighted: false,
    isConsep: true,
    department: 'Processing'
  },
  recordStockCountResults: {
    id: -1,
    type: 'recordStockCountResults',
    image: 'TableSplit',
    header: 'Record stock count results',
    link: ROUTES.RECORD_STOCK_COUNT_RESULTS,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  requestChangesReport: {
    id: -1,
    type: 'requestChangesReport',
    image: 'TableSplit',
    header: 'Request changes report',
    link: ROUTES.REQUEST_CHANGES_REPORT,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  returnedSeed: {
    id: -1,
    type: 'returnedSeed',
    image: 'TableSplit',
    header: 'Returned seed',
    link: ROUTES.RETURNED_SEED,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  reviewPendingRequest: {
    id: -1,
    type: 'reviewPendingRequest',
    image: 'TableSplit',
    header: 'Review pending request',
    link: ROUTES.REVIEW_PENDING_REQUEST,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  scheduleOrReviseRequestItemActivity: {
    id: -1,
    type: 'scheduleOrReviseRequestItemActivity',
    image: 'TableSplit',
    header: 'Schedule or revise request item activity',
    link: ROUTES.SCHEDULE_OR_REVISE_REQUEST_ITEM_ACTIVITY,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  seedAndFamilyLotReport: {
    id: -1,
    type: 'seedAndFamilyLotReport',
    image: 'TableSplit',
    header: 'Seed and family lot report',
    link: ROUTES.SEED_AND_FAMILY_LOT_REPORT,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  seedSaleOrTransferActivitiesScreen: {
    id: -1,
    type: 'seedSaleOrTransferActivitiesScreen',
    image: 'TableSplit',
    header: 'Seed sale or transfer activities screen',
    link: ROUTES.SEED_SALE_OR_TRANSFER_ACTIVITIES_SCREEN,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  seedlotCharacteristics: {
    id: -1,
    type: 'seedlotCharacteristics',
    image: 'TableSplit',
    header: 'Seedlot characteristics',
    link: ROUTES.SEEDLOT_CHARACTERISTICS,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  seedlotLocationHistoryReport: {
    id: -1,
    type: 'seedlotLocationHistoryReport',
    image: 'TableSplit',
    header: 'Seedlot location history report',
    link: ROUTES.SEEDLOT_LOCATION_HISTORY_REPORT,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  seedlotObservationHistory: {
    id: -1,
    type: 'seedlotObservationHistory',
    image: 'TableSplit',
    header: 'Seedlot observation history',
    link: ROUTES.SEEDLOT_OBSERVATION_HISTORY,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  seedlotOrRequestItemInventoryLocation: {
    id: -1,
    type: 'seedlotOrRequestItemInventoryLocation',
    image: 'TableSplit',
    header: 'Seedlot or request item inventory location',
    link: ROUTES.SEEDLOT_OR_REQUEST_ITEM_INVENTORY_LOCATION,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  seedlotOwner: {
    id: -1,
    type: 'seedlotOwner',
    image: 'TableSplit',
    header: 'Seedlot owner',
    link: ROUTES.SEEDLOT_OWNER,
    highlighted: false,
    isConsep: true,
    department: 'Seed and family lot'
  },
  seedlotTestHistoryReport: {
    id: -1,
    type: 'seedlotTestHistoryReport',
    image: 'TableSplit',
    header: 'Seedlot test history report',
    link: ROUTES.SEEDLOT_TEST_HISTORY_REPORT,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  stockCountStatusReport: {
    id: -1,
    type: 'stockCountStatusReport',
    image: 'TableSplit',
    header: 'Stock count status report',
    link: ROUTES.STOCK_COUNT_STATUS_REPORT,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  testingActivitiesList: {
    id: -1,
    type: 'testingActivitiesList',
    image: 'TableSplit',
    header: 'Testing activities list',
    link: ROUTES.TESTING_ACTIVITIES_LIST,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  testingActivitiesSummaryReport: {
    id: -1,
    type: 'testingActivitiesSummaryReport',
    image: 'TableSplit',
    header: 'Testing activities summary report',
    link: ROUTES.TESTING_ACTIVITIES_SUMMARY_REPORT,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  testingRequestsReport: {
    id: -1,
    type: 'testingRequestsReport',
    image: 'TableSplit',
    header: 'Testing requests report',
    link: ROUTES.TESTING_REQUESTS_REPORT,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  waybills: {
    id: -1,
    type: 'waybills',
    image: 'TableSplit',
    header: 'Waybills',
    link: ROUTES.WAYBILLS,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  withdrawalDate: {
    id: -1,
    type: 'withdrawalDate',
    image: 'TableSplit',
    header: 'Withdrawal date',
    link: ROUTES.WITHDRAWAL_DATE,
    highlighted: false,
    isConsep: true,
    department: 'Testing'
  },
  withdrawalRequest: {
    id: -1,
    type: 'withdrawalRequest',
    image: 'TableSplit',
    header: 'Withdrawal request',
    link: ROUTES.WITHDRAWAL_REQUEST,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  withdrawalRequestDetailsReport: {
    id: -1,
    type: 'withdrawalRequestDetailsReport',
    image: 'TableSplit',
    header: 'Withdrawal request details report',
    link: ROUTES.WITHDRAWAL_REQUEST_DETAILS_REPORT,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  withdrawalRequestReport: {
    id: -1,
    type: 'withdrawalRequestReport',
    image: 'TableSplit',
    header: 'Withdrawal request report',
    link: ROUTES.WITHDRAWAL_REQUEST_REPORT,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  withdrawalResults: {
    id: -1,
    type: 'withdrawalResults',
    image: 'TableSplit',
    header: 'Withdrawal results',
    link: ROUTES.WITHDRAWAL_RESULTS,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  },
  withdrawalResultObservations: {
    id: -1,
    type: 'withdrawalResultObservations',
    image: 'TableSplit',
    header: 'Withdrawal result observations',
    link: ROUTES.WITHDRAWAL_RESULT_OBSERVATIONS,
    highlighted: false,
    isConsep: true,
    department: 'Withdrawal'
  }
};

export default FavouriteActivityMap;
