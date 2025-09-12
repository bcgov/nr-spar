import ROUTES from '../../../../routes/constants';
import { CrumbType } from '../../../../components/Breadcrumbs/definitions';
import { ActivitySearchRequest, ActivitySearchValidation, ValidationErrorType } from './definitions';

export const DATE_FORMAT = 'Y/m/d';

export const testSearchCrumbs: CrumbType[] = [
  {
    name: 'CONSEP',
    path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES
  },
  {
    name: 'Testing activities search',
    path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES
  }
];

export const advDateTypes: string[] = ['actual', 'revised'];

export const minStartDate = '1900-01-01';
export const maxEndDate = '9999-12-31';

export const emptyActivitySearchRequest: ActivitySearchRequest = {
  lotNumbers: [],
  testType: undefined,
  activityId: undefined,
  germinatorTrayId: undefined,
  seedWithdrawalStartDate: undefined,
  seedWithdrawalEndDate: undefined,
  includeHistoricalTests: undefined,
  germTestsOnly: undefined,
  requestId: undefined,
  requestType: undefined,
  requestYear: undefined,
  orchardId: undefined,
  testCategoryCd: undefined,
  testRank: undefined,
  species: undefined,
  actualBeginDateFrom: undefined,
  actualBeginDateTo: undefined,
  actualEndDateFrom: undefined,
  actualEndDateTo: undefined,
  revisedStartDateFrom: undefined,
  revisedStartDateTo: undefined,
  revisedEndDateFrom: undefined,
  revisedEndDateTo: undefined,
  germTrayAssignment: undefined,
  completeStatus: undefined,
  acceptanceStatus: undefined,
  seedlotClass: undefined
};

export const initialErrorValue: ValidationErrorType = {
  error: false,
  errorMessage: ''
};

export const errorMessages = {
  lotMax: 'Maximum of 5 lot numbers allowed.',
  lotMaxChar: 'Lot numbers must be at most 5 characters long',
  germTrayMax: 'IDs must be at most 5 digits long',
  reqId: 'Request ID must be at most 5 characters long',
  reqYearSize: 'Year must be a 4-digit number',
  reqYearInterval: 'Year must be between 1900 and 9999',
  orchardId: 'Orchard ID must be at most 3 characters long'
};

export const iniActSearchValidation: ActivitySearchValidation = {
  lotNumbers: initialErrorValue,
  germinatorTray: initialErrorValue,
  requestId: initialErrorValue,
  requestYear: initialErrorValue,
  orchardId: initialErrorValue
};

export const testTypesCd: string[] = [
  'BIO', 'CAL', 'CUT', 'D1',
  'FUS', 'G10', 'G11', 'G12',
  'G20', 'G30', 'G31', 'G32',
  'G34', 'G41', 'G42', 'G44',
  'G52', 'G54', 'G55', 'G56',
  'G57', 'G62', 'G64', 'GH1',
  'GPR', 'GSA', 'GSE', 'MC',
  'NGR', 'PAT', 'PUR', 'QAM',
  'SIR', 'SPG', 'TET', 'TUM',
  'W1', 'XRY'
];

export const activityIds: string[] = [
  'AWT', 'BIO', 'CAL', 'CUT',
  'D1', 'FUS', 'G10', 'G11',
  'G12', 'G20', 'G30', 'G31',
  'G32', 'G34', 'G41', 'G42',
  'G44', 'G52', 'G54', 'G55',
  'G56', 'G57', 'G62', 'G64',
  'GH1', 'GSA', 'GSE', 'MC',
  'MCC', 'MCK', 'MCM', 'MCQ',
  'MCR', 'MCW', 'MMC', 'NGR',
  'PAT', 'PUR', 'RTE', 'SAM',
  'SIR', 'SPG', 'TZ', 'W1',
  'XRY'
];

export const testActivityCd: string[] = [
  'AB', 'AEX', 'AWT', 'BIO',
  'BLN', 'BLR', 'CAL', 'CQA',
  'CSR', 'CUT', 'CWR', 'D',
  'D1', 'DB2', 'DB3', 'DRY',
  'DWD', 'DWG', 'E17', 'E32',
  'E35', 'FUS', 'G10', 'G11',
  'G12', 'G20', 'G30', 'G31',
  'G32', 'G34', 'G40', 'G41',
  'G42', 'G44', 'G50', 'G52',
  'G54', 'G55', 'G56', 'G57',
  'G60', 'G62', 'G63', 'G64',
  'G70', 'G71', 'G80', 'G90',
  'GH1', 'GSA', 'GSE', 'HRS',
  'KLL', 'KLN', 'LIN', 'LSP',
  'MC', 'MCC', 'MCK', 'MCM',
  'MCQ', 'MCR', 'MCW', 'MMC',
  'NGR', 'PAT', 'PHY', 'PLT',
  'PQA', 'PR1', 'PR4', 'PR8',
  'PRA', 'PRC', 'PRE', 'PRI',
  'PUR', 'QA', 'QM', 'QR',
  'QT', 'QU', 'RKL', 'RKN',
  'RSK', 'RTE', 'S10', 'S11',
  'S20', 'S31', 'S32', 'S34',
  'S44', 'S52', 'S55', 'S56',
  'S57', 'S64', 'SA', 'SAM',
  'SC1', 'SC2', 'SD1', 'SDB',
  'SHP', 'SIR', 'SOE', 'SPB',
  'SPG', 'SPI', 'SPL', 'SPW',
  'SRN', 'SSP', 'SSR', 'SW1',
  'TUM', 'TZ', 'UPG', 'W1',
  'WDS', 'WDU', 'WEI', 'XRY'
];

export const testCategoryCd: string[] = [
  'PUR', 'QA', 'QAK', 'QAP',
  'QAR', 'QAS', 'STD', 'TRL'
];

export const requestTypeSt: string[] = [
  'ASP', 'CSP', 'DWD', 'DWP',
  'RSP', 'RTS', 'SRQ', 'SSP',
  'TST', 'USP'
];

export const testRanks: string[] = [
  'A', 'B', 'C', 'P'
];

export const species: string[] = [
  'AC', 'ACT', 'ALNUCRI', 'ARCTUVA',
  'AT', 'BA', 'BG', 'BL',
  'BP', 'CW', 'DG', 'DR',
  'EP', 'FDC', 'FDI', 'HM',
  'HW', 'LARIDEC', 'LARIKAE', 'LD',
  'LS', 'LT', 'LW', 'PA',
  'PF', 'PINUSYL', 'PJ', 'PLC',
  'PLI', 'PW', 'PY', 'SB',
  'SS', 'SX', 'SXS', 'YC'
];
