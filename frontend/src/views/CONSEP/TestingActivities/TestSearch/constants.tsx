/* eslint-disable camelcase */
import React from 'react';
import { type MRT_ColumnDef, MRT_Cell } from 'material-react-table';
import * as Icons from '@carbon/icons-react';
import { Tag } from '@carbon/react';
import ROUTES from '../../../../routes/constants';
import { CrumbType } from '../../../../components/Breadcrumbs/definitions';
import { TestingSearchResponseType } from '../../../../types/consep/TestingSearchResponseType';

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

export const testCategoryCodes: string[] = ['PUR', 'QA', 'QAK', 'QAP', 'QAR', 'QAS', 'STD', 'TRL'];

export const testActivityCodes: string[] = [
  'AB',
  'AEX',
  'AWT',
  'BIO',
  'BLN',
  'BLR',
  'CAL',
  'CQA',
  'CSR',
  'CUT',
  'CWR',
  'D',
  'D1',
  'DB2',
  'DB3',
  'DRY',
  'DWD',
  'DWG',
  'E17',
  'E32',
  'E35',
  'FUS',
  'G10',
  'G11',
  'G12',
  'G20',
  'G30',
  'G31',
  'G32',
  'G34',
  'G40',
  'G41',
  'G42',
  'G44',
  'G50',
  'G52',
  'G54',
  'G55',
  'G56',
  'G57',
  'G60',
  'G62',
  'G63',
  'G64',
  'G70',
  'G71',
  'G80',
  'G90',
  'GH1',
  'GSA',
  'GSE',
  'HRS',
  'KLL',
  'KLN',
  'LIN',
  'LSP',
  'MC',
  'MCC',
  'MCK',
  'MCM',
  'MCQ',
  'MCR',
  'MCW',
  'MMC',
  'NGR',
  'PAT',
  'PHY',
  'PLT',
  'PQA',
  'PR1',
  'PR4',
  'PR8',
  'PRA',
  'PRC',
  'PRE',
  'PRI',
  'PUR',
  'QA',
  'QM',
  'QR',
  'QT',
  'QU',
  'RKL',
  'RKN',
  'RSK',
  'RTE',
  'S10',
  'S11',
  'S20',
  'S31',
  'S32',
  'S34',
  'S44',
  'S52',
  'S55',
  'S56',
  'S57',
  'S64',
  'SA',
  'SAM',
  'SC1',
  'SC2',
  'SD1',
  'SDB',
  'SHP',
  'SIR',
  'SOE',
  'SPB',
  'SPG',
  'SPI',
  'SPL',
  'SPW',
  'SRN',
  'SSP',
  'SSR',
  'SW1',
  'TUM',
  'TZ',
  'UPG',
  'W1',
  'WDS',
  'WDU',
  'WEI',
  'XRY'
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
    size: 13,
    enableEditing: false,
    ...alignRight
  },
  {
    accessorKey: 'requestItem',
    header: 'Request ID',
    size: 12,
    enableEditing: false,
    ...alignLeft
  },
  {
    accessorKey: 'species',
    header: 'Sp',
    size: 8,
    enableEditing: false,
    ...alignLeft
  },
  {
    accessorKey: 'testRank',
    header: 'Rank',
    size: 1,
    enableEditing: false,
    ...alignLeft
  },
  {
    accessorKey: 'testCategoryCd',
    header: 'Category',
    size: 3,
    enableEditing: false,
    ...alignLeft
  },
  {
    accessorKey: 'activityId',
    header: 'Activity',
    size: 3,
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
    size: 13,
    enableEditing: false,
    ...alignRight
  },
  {
    accessorKey: 'pv',
    header: 'PV',
    size: 82,
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
    size: 10,
    enableEditing: false,
    ...alignLeft
  },
  {
    accessorKey: 'revisedEndDt',
    header: 'Sch End Date',
    size: 10,
    enableEditing: false,
    ...alignLeft
  },
  {
    accessorKey: 'actualBeginDtTm',
    header: 'Start Date',
    size: 10,
    enableEditing: false,
    ...alignLeft
  },
  {
    accessorKey: 'actualEndDtTm',
    header: 'End Date',
    size: 19,
    enableEditing: false,
    ...alignLeft
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
    size: 5,
    ...alignLeft
  }
];
