/* eslint-disable camelcase */
import React from 'react';
import { type MRT_ColumnDef, MRT_Cell } from 'material-react-table';
import * as Icons from '@carbon/icons-react';
import { Tag } from '@carbon/react';
import ROUTES from '../../../../routes/constants';
import { CrumbType } from '../../../../components/Breadcrumbs/definitions';
import { TestingSearchResponseType } from '../../../../types/consep/TestingSearchType';
import { ActivitySearchValidation, ValidationErrorType } from './definitions';

export const SAFE_MARGIN = 16;

export const DATE_FORMAT = 'Y/m/d';
export const minStartDate = '1900-01-01';
export const maxEndDate = '9999-12-31';

const formatDateCell = (value: string | null) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const month = monthNames[date.getMonth()];

  const year = date.getFullYear().toString().slice(-2);

  return `${day} ${month} ${year}`;
};

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

export const initialErrorValue: ValidationErrorType = {
  error: false,
  errorMessage: ''
};

export const errorMessages = {
  lotMax: 'Maximum of 5 lot numbers allowed.',
  lotMaxChar: '5 character max',
  familyLotMaxChar: '13 character max',
  germTrayMax: '5 digits max',
  reqId: '5 character max',
  reqYearSize: 'Year must be a 4-digit number',
  reqYearInterval: 'Year must be between 1900 and 9999',
  orchardId: '3 character max'
};

export const iniActSearchValidation: ActivitySearchValidation = {
  lotNumbers: initialErrorValue,
  germinatorTray: initialErrorValue,
  requestId: initialErrorValue,
  requestYear: initialErrorValue,
  orchardId: initialErrorValue
};

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

const alignRight = {
  muiTableHeadCellProps: { align: 'right' as const },
  muiTableBodyCellProps: { align: 'right' as const }
};

const alignLeft = {
  muiTableHeadCellProps: { align: 'left' as const },
  muiTableBodyCellProps: { align: 'left' as const }
};

export const getTestingActivityListColumns = (): MRT_ColumnDef<TestingSearchResponseType>[] => [
  {
    accessorKey: 'seedlotDisplay',
    header: 'Lot #',
    size: 50,
    enableEditing: false,
    ...alignRight
  },
  {
    accessorKey: 'requestItem',
    header: 'Request ID',
    size: 100,
    enableEditing: false,
    ...alignLeft
  },
  {
    accessorKey: 'species',
    header: 'Sp',
    size: 30,
    enableEditing: false,
    ...alignLeft
  },
  {
    accessorKey: 'testRank',
    header: 'Rank',
    size: 30,
    enableEditing: false,
    ...alignLeft
  },
  {
    accessorKey: 'testCategoryCd',
    header: 'Category',
    size: 30,
    enableEditing: false,
    ...alignLeft
  },
  {
    accessorKey: 'activityId',
    header: 'Activity',
    size: 30,
    enableEditing: false,
    ...alignLeft
  },
  {
    header: 'Result',
    accessorFn: (row) => {
      switch (row.testCategoryCd) {
        case 'Germ':
          return row.germinationPct;
        case 'MC':
          return row.moisturePct;
        case 'SPG':
          return row.seedsPerGram;
        case 'PUR':
          return row.purityPct;
        default:
          return null;
      }
    },
    size: 30,
    enableEditing: false,
    ...alignRight,
    Cell: ({ cell }) => {
      const value = cell.getValue<number | null>();
      return value != null ? `${value}%` : '';
    }
  },
  {
    accessorKey: 'pv',
    header: 'PV',
    size: 50,
    enableEditing: false,
    ...alignRight
  },
  {
    accessorKey: 'currentTestInd',
    header: 'Curr',
    size: 20,
    enableEditing: false,
    ...alignLeft,
    Cell: ({ cell }: { cell: MRT_Cell<TestingSearchResponseType> }) => {
      const value = cell.getValue();
      return value === -1 ? (
        <Tag type="teal" size="sm">
          Curr
        </Tag>
      ) : null;
    }
  },
  {
    accessorKey: 'testCompleteInd',
    header: 'Com',
    size: 20,
    enableEditing: false,
    ...alignLeft,
    Cell: ({ cell }: { cell: MRT_Cell<TestingSearchResponseType> }) => {
      const value = cell.getValue();
      return value === -1 ? (
        <Tag type="blue" size="sm">
          Com
        </Tag>
      ) : null;
    }
  },
  {
    accessorKey: 'acceptResultInd',
    header: 'Act',
    size: 20,
    enableEditing: false,
    ...alignLeft,
    Cell: ({ cell }: { cell: MRT_Cell<TestingSearchResponseType> }) => {
      const value = cell.getValue();
      return value === -1 ? (
        <Tag type="green" size="sm">
          Acc
        </Tag>
      ) : null;
    }
  },
  {
    accessorKey: 'significntStsInd',
    header: 'Sig',
    size: 20,
    enableEditing: false,
    ...alignLeft,
    Cell: ({ cell }: { cell: MRT_Cell<TestingSearchResponseType> }) => {
      const value = cell.getValue();
      return value === -1 ? (
        <Tag type="purple" size="sm">
          Sig
        </Tag>
      ) : null;
    }
  },
  {
    accessorKey: 'seedWithdrawalDate',
    header: 'Wdrwl Date',
    size: 100,
    enableEditing: false,
    ...alignLeft,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'revisedEndDt',
    header: 'Sch End Date',
    size: 100,
    enableEditing: false,
    ...alignLeft,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'actualBeginDtTm',
    header: 'Start Date',
    size: 100,
    enableEditing: false,
    ...alignLeft,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'actualEndDtTm',
    header: 'End Date',
    size: 100,
    enableEditing: false,
    ...alignLeft,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },

  {
    accessorKey: 'riaComment',
    header: 'Comments',
    enableEditing: false,
    ...alignLeft
  },
  {
    accessorKey: 'actions',
    header: '',
    Cell: () => <Icons.TrashCan size={15} style={{ cursor: 'pointer' }} onClick={() => {}} />,
    enableEditing: false,
    size: 20,
    ...alignLeft
  }
];
