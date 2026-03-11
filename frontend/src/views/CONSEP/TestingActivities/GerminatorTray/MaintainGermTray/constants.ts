import React from 'react';
/* eslint-disable camelcase */
import { type MRT_ColumnDef } from 'material-react-table';
import { formatDateCell } from '../../TestSearch/constants';
import { GermTrayColumn } from './definitions';

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
        updateRow({
          ...row.original,
          germinatorId: e.target.value
        });
      }
    })
  }
];
