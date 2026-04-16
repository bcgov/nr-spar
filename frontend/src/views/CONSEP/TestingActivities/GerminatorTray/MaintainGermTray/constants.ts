import React from 'react';
/* eslint-disable camelcase */
import { type MRT_ColumnDef } from 'material-react-table';
import { formatDateCell } from '../../TestSearch/constants';
import { GermTrayColumn } from './definitions';
import { GermTrayTestType } from '../../../../../types/consep/GerminatorTrayType';

export const getGermTrayColumns = (
  updateRow: (row: GermTrayColumn) => void
): MRT_ColumnDef<GermTrayColumn>[] => [
  {
    accessorKey: 'germinatorTrayId',
    header: 'Germ tray',
    enableEditing: false
  },
  {
    accessorKey: 'actualStartDate',
    header: 'Soak start date',
    enableEditing: false,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'activityTypeCd',
    header: 'Test Type',
    enableEditing: false
  },
  {
    accessorKey: 'germinatorId',
    header: 'Germinator Id',
    muiEditTextFieldProps: ({ row }) => ({
      value: row.original.germinatorId ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.trim(); // keep blank if user deletes
        updateRow({
          ...row.original,
          germinatorId: newValue
        });
      }
    })
  }
];

export const getGermTrayTestsColumns = (): MRT_ColumnDef<GermTrayTestType>[] => [
  {
    accessorKey: 'seedlotNumber',
    header: 'Lot #',
    enableEditing: false
  },
  {
    accessorKey: 'requestId',
    header: 'Request ID',
    enableEditing: false
  },
  {
    accessorKey: 'warmStratStartDate',
    header: 'Warm strat date',
    enableEditing: false
  },
  {
    accessorKey: 'drybackStartDate',
    header: 'Dryback',
    enableEditing: false
  },
  {
    accessorKey: 'stratStartDate',
    header: 'Cold strat start',
    enableEditing: false,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'germinatorEntry',
    header: 'Germinator Entry',
    enableEditing: false,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'testCompleteInd',
    header: 'Complete',
    enableEditing: false
  },
  {
    accessorKey: 'acceptResultInd',
    header: 'Accepted',
    enableEditing: false
  }
];
