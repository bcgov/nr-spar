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
const COLOR_GREY_20 = '#DFDFE1';

const formatDateCell = (value: string | null) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
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

const tableCellProps = (size?: number, alignment: 'left' | 'right' | 'center' = 'right') => ({
  muiTableHeadCellProps: {
    align: alignment,
    ...(size
      ? {
        sx: {
          width: size,
          minWidth: size,
          maxWidth: size,
          // keep the header style align with the style in
          // frontend/src/components/GenericTable/index.tsx,
          // otherwise the header style inside GenericTable will be overrided
          '& .Mui-TableHeadCell-Content-Labels': {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.25rem',

            '& .Mui-TableHeadCell-Content-Wrapper': {
              order: 1
            },
            '& .MuiBadge-root': {
              order: 2
            }
          },
          padding: '0.6rem'
        }
      }
      : {})
  },
  muiTableBodyCellProps: {
    align: alignment,
    ...(size
      ? {
        sx: {
          width: size,
          minWidth: size,
          maxWidth: size,
          padding: '0.6rem',
          '&:hover': {
            outline: 'none',
            backgroundColor: COLOR_GREY_20
          }
        }
      }
      : {})
  }
});

export const getTestingActivityListColumns = (): MRT_ColumnDef<TestingSearchResponseType>[] => [
  {
    accessorKey: 'seedlotDisplay',
    header: 'Lot #',
    size: 60,
    enableEditing: false,
    ...tableCellProps(60)
  },
  {
    accessorKey: 'requestItem',
    header: 'Request ID',
    enableEditing: false,
    ...tableCellProps(130, 'left')
  },
  {
    accessorKey: 'species',
    header: 'Sp',
    enableEditing: false,
    ...tableCellProps(50, 'left')
  },
  {
    accessorKey: 'testRank',
    header: 'Rank',
    enableEditing: false,
    ...tableCellProps(60, 'left')
  },
  {
    accessorKey: 'testCategoryCd',
    header: 'Category',
    enableEditing: false,
    ...tableCellProps(90, 'left')
  },
  {
    accessorKey: 'activityId',
    header: 'Activity',
    enableEditing: false,
    ...tableCellProps(80, 'left')
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
    enableEditing: false,
    ...tableCellProps(70),
    Cell: ({ cell }) => {
      const value = cell.getValue<number | null>();
      return value != null ? `${value}%` : '';
    }
  },
  {
    accessorKey: 'pv',
    header: 'PV',
    enableEditing: false,
    ...tableCellProps(90)
  },
  {
    accessorKey: 'currentTestInd',
    header: 'Curr',
    enableEditing: false,
    ...tableCellProps(80, 'left'),
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
    ...tableCellProps(80, 'left'),
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
    enableEditing: false,
    ...tableCellProps(80, 'left'),
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
    ...tableCellProps(80, 'left'),
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
    ...tableCellProps(120, 'left'),
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'revisedEndDt',
    header: 'Sch End Date',
    enableEditing: false,
    ...tableCellProps(120, 'left'),
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'actualBeginDtTm',
    header: 'Start Date',
    enableEditing: false,
    ...tableCellProps(120, 'left'),
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'actualEndDtTm',
    header: 'End Date',
    enableEditing: false,
    ...tableCellProps(120, 'left'),
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },

  {
    accessorKey: 'riaComment',
    header: 'Comments',
    enableEditing: false,
    ...tableCellProps(800, 'left')
  },
  {
    accessorKey: 'actions',
    header: '',
    Cell: () => <Icons.TrashCan size={15} style={{ cursor: 'pointer' }} onClick={() => {}} />,
    enableEditing: false,
    size: 20,
    ...tableCellProps()
  }
];
