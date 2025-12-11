/* eslint-disable camelcase */
import React from 'react';
import { type MRT_ColumnDef, MRT_Cell } from 'material-react-table';
import { Tag } from '@carbon/react';
import { TestingSearchResponseType } from '../../../../../../types/consep/TestingSearchType';
import { formatDateCell } from '../../constants';

export const getTestHistoryTableColumns = (): MRT_ColumnDef<TestingSearchResponseType>[] => [
  {
    accessorKey: 'activityTypeCd',
    header: 'Type',
    enableEditing: false,
    size: 50
  },
  {
    accessorKey: 'testCategoryCd',
    header: 'Category',
    enableEditing: false,
    size: 40
  },
  {
    accessorKey: 'actualEndDtTm',
    header: 'End Date',
    enableEditing: false,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>()),
    size: 110
  },
  {
    accessorKey: 'requestItem',
    header: 'Request ID',
    enableEditing: false,
    size: 110
  },
  {
    accessorKey: 'currentTestInd',
    header: 'Curr',
    enableEditing: false,
    Cell: ({ cell }: { cell: MRT_Cell<TestingSearchResponseType> }) => {
      const value = cell.getValue();
      return value === -1 ? (
        <Tag type="teal" size="sm">
          Curr
        </Tag>
      ) : null;
    },
    size: 80
  },
  {
    accessorKey: 'germinationPct',
    header: 'Germ',
    enableEditing: false,
    size: 50
  },
  {
    accessorKey: 'testRank',
    header: 'Rnk',
    enableEditing: false,
    size: 50
  },
  {
    accessorKey: 'pv',
    header: 'PV',
    enableEditing: false,
    size: 50
  },
  {
    accessorKey: 'moisturePct',
    header: 'MC',
    enableEditing: false,
    size: 50
  },
  {
    accessorKey: 'purityPct',
    header: 'Purity',
    enableEditing: false,
    size: 50
  },
  {
    accessorKey: 'seedsPerGram',
    header: 'SPG',
    enableEditing: false,
    size: 50
  },
  {
    accessorKey: 'otherTestResult',
    header: 'Oth',
    enableEditing: false,
    size: 50
  },
  {
    accessorKey: 'acceptResultInd',
    header: 'Acc',
    enableEditing: false,
    Cell: ({ cell }: { cell: MRT_Cell<TestingSearchResponseType> }) => {
      const value = cell.getValue();
      return value === -1 ? (
        <Tag type="green" size="sm">
          Acc
        </Tag>
      ) : null;
    },
    size: 80
  },
  {
    accessorKey: 'significntStsInd',
    header: 'Sig',
    enableEditing: false,
    Cell: ({ cell }: { cell: MRT_Cell<TestingSearchResponseType> }) => {
      const value = cell.getValue();
      return value === -1 ? (
        <Tag type="purple" size="sm">
          Sig
        </Tag>
      ) : null;
    },
    size: 80
  }
];
