/* eslint-disable camelcase */
import React from 'react';
import { type MRT_ColumnDef, MRT_Cell } from 'material-react-table';
import { Tag } from '@carbon/react';
import ROUTES from '../../../../routes/constants';
import { CrumbType } from '../../../../components/Breadcrumbs/definitions';
import { TestingSearchResponseType } from '../../../../types/consep/TestingSearchType';
import { ActivitySearchValidation, ValidationErrorType } from './definitions';

export const SAFE_MARGIN = 16;
export const DATE_FORMAT = 'Y/m/d';
export const dateField = {
  placeholderText: 'yyyy/mm/dd',
  helperText: 'year/month/day',
  get minStartDate() {
    const today = new Date();
    return new Date(today.getFullYear() - 300, today.getMonth(), today.getDate());
  },
  get maxEndDate() {
    const today = new Date();
    return new Date(today.getFullYear() + 300, today.getMonth(), today.getDate());
  },
  get todayString() {
    const today = new Date();
    return today.toLocaleDateString('en-CA');
  }
};

export const formatDateCell = (value: string | null) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const toSelectedItemString = (v?: string | null) => (v ?? null);
export const isFamilyLot = (lot: string) => lot.toUpperCase().startsWith('F');

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
  lotMaxChar: '5 character max for seedlot numbers',
  familyLotMaxChar: '13 character max for family lot numbers',
  germTrayMax: '5 digits max',
  reqId: '5 character max',
  reqYearSize: 'Year must be a 4-digit number',
  reqYearInterval: 'Year must be between 1900 and 9999',
  orchardId: '3 character max'
};

export const iniActSearchValidation: ActivitySearchValidation = {
  lotNumbers: Array.from({ length: 5 }, () => ({ ...initialErrorValue })),
  germinatorTray: initialErrorValue,
  requestId: initialErrorValue,
  requestYear: initialErrorValue,
  orchardId: initialErrorValue
};

export const testRanks: string[] = [
  'A', 'B', 'C', 'P'
];

const getResultValue = (
  row: TestingSearchResponseType,
  defaultValue: string | number | null = null
) => {
  if (row.activityId && row.activityId.startsWith('M')) {
    return row.moisturePct;
  }
  switch (row.activityId) {
    case 'Germ':
      return row.germinationPct;
    case 'SPG':
      return row.seedsPerGram;
    case 'PUR':
      return row.purityPct;
    default:
      return defaultValue;
  }
};

const tableCellProps = (alignment: 'left' | 'right' | 'center' = 'right') => ({
  muiTableHeadCellProps: {
    align: alignment
  },
  muiTableBodyCellProps: {
    align: alignment
  }
});

export const getTestingActivityListColumns = (): MRT_ColumnDef<TestingSearchResponseType>[] => [
  {
    accessorKey: 'seedlotDisplay',
    header: 'Lot #',
    enableEditing: false,
    size: 80,
    ...tableCellProps('left')
  },
  {
    accessorKey: 'requestItem',
    header: 'Request ID',
    enableEditing: false,
    size: 120,
    ...tableCellProps('left')
  },
  {
    accessorKey: 'species',
    header: 'Sp',
    enableEditing: false,
    size: 90,
    ...tableCellProps('left')
  },
  {
    accessorKey: 'testRank',
    header: 'Rnk',
    enableEditing: false,
    size: 70,
    ...tableCellProps('left')
  },
  {
    accessorKey: 'testCategoryCd',
    header: 'Cat',
    enableEditing: false,
    size: 70,
    ...tableCellProps('left')
  },
  {
    accessorKey: 'activityId',
    header: 'Act',
    enableEditing: false,
    size: 70,
    ...tableCellProps('left')
  },
  {
    header: 'Result',
    accessorFn: (row) => getResultValue(row),
    enableEditing: false,
    size: 90,
    ...tableCellProps()
  },
  {
    accessorKey: 'pv',
    header: 'PV',
    enableEditing: false,
    size: 70,
    ...tableCellProps()
  },
  {
    accessorKey: 'currentTestInd',
    header: 'Curr',
    enableEditing: false,
    size: 70,
    ...tableCellProps('left'),
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
    enableEditing: false,
    size: 75,
    ...tableCellProps('left'),
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
    header: 'Acc',
    enableEditing: false,
    size: 70,
    ...tableCellProps('left'),
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
    enableEditing: false,
    size: 70,
    ...tableCellProps('left'),
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
    enableEditing: false,
    size: 120,
    ...tableCellProps('left'),
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'revisedEndDt',
    header: 'Sch End Date',
    enableEditing: false,
    size: 135,
    ...tableCellProps('left'),
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'actualBeginDtTm',
    header: 'Start Date',
    enableEditing: false,
    size: 110,
    ...tableCellProps('left'),
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'actualEndDtTm',
    header: 'End Date',
    enableEditing: false,
    size: 105,
    ...tableCellProps('left'),
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },

  {
    accessorKey: 'riaComment',
    header: 'Comments',
    enableEditing: false,
    size: 1200,
    ...tableCellProps('left')
  }
];

export const formatExportData = {
  seedlotDisplay: {
    header: 'Lot #',
    value: (row: TestingSearchResponseType) => row.seedlotDisplay
  },
  requestItem: {
    header: 'Request ID',
    value: (row: TestingSearchResponseType) => row.requestItem
  },
  species: {
    header: 'Sp',
    value: (row: TestingSearchResponseType) => row.species
  },
  testRank: {
    header: 'Rank',
    value: (row: TestingSearchResponseType) => row.testRank
  },
  testCategoryCd: {
    header: 'Category',
    value: (row: TestingSearchResponseType) => row.testCategoryCd
  },
  activityId: {
    header: 'Activity',
    value: (row: TestingSearchResponseType) => row.activityId
  },
  Result: {
    header: 'Result',
    value: (row: TestingSearchResponseType) => getResultValue(row, '')
  },
  pv: {
    header: 'PV',
    value: (row: TestingSearchResponseType) => row.pv
  },
  currentTestInd: {
    header: 'Curr',
    value: (row: TestingSearchResponseType) => (row.currentTestInd === 0 ? '' : 'Curr')
  },
  testCompleteInd: {
    header: 'Com',
    value: (row: TestingSearchResponseType) => (row.testCompleteInd === 0 ? '' : 'Com')
  },
  acceptResultInd: {
    header: 'Act',
    value: (row: TestingSearchResponseType) => (row.acceptResultInd === 0 ? '' : 'Act')
  },
  significntStsInd: {
    header: 'Sig',
    value: (row: TestingSearchResponseType) => (row.significntStsInd === 0 ? '' : 'Sig')
  },
  seedWithdrawalDate: {
    header: 'Wdrwl Date',
    value: (row: TestingSearchResponseType) => formatDateCell(row.seedWithdrawalDate)
  },
  revisedEndDt: {
    header: 'Sch End Date',
    value: (row: TestingSearchResponseType) => formatDateCell(row.revisedEndDt)
  },
  actualBeginDtTm: {
    header: 'Start Date',
    value: (row: TestingSearchResponseType) => formatDateCell(row.actualBeginDtTm)
  },
  actualEndDtTm: {
    header: 'End Date',
    value: (row: TestingSearchResponseType) => formatDateCell(row.actualEndDtTm)
  },
  riaComment: {
    header: 'Comments',
    value: (row: TestingSearchResponseType) => row.riaComment || ''
  }
};

export const columnVisibilityLocalStorageKey = 'test-activity-table-columns-visibility';
