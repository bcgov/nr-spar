/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
import React from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import { Checkbox } from '@mui/material';
import { TrashCan } from '@carbon/icons-react';
import { formatDateCell } from '../../TestSearch/constants';
import { GermTrayColumn } from './definitions';
import { GermTrayTestType } from '../../../../../types/consep/GerminatorTrayType';

// Supports both legacy (-1) and common (1) truthy indicators.
const isIndicatorChecked = (value: unknown): boolean => value === -1 || value === 1;

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

export const getGermTrayTestsColumns = (
  onDeleteRow?: (row: GermTrayTestType) => void
): MRT_ColumnDef<GermTrayTestType>[] => [
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
    enableEditing: false,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'drybackStartDate',
    header: 'Dryback',
    enableEditing: false,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
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
    enableEditing: false,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell: ({ cell }) => (
      <Checkbox
        checked={isIndicatorChecked(cell.getValue<number | null>())}
        disabled
      />
    )
  },
  {
    accessorKey: 'acceptResultInd',
    header: 'Accepted',
    enableEditing: false,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell: ({ cell }) => (
      <Checkbox
        checked={isIndicatorChecked(cell.getValue<number | null>())}
        disabled
      />
    )
  },
  {
    accessorKey: 'actions',
    header: '',
    enableSorting: false,
    enableEditing: false,
    size: 50,
    Cell: ({ row }: { row: { original: GermTrayTestType } }) => (
      <TrashCan
        size={15}
        style={{ cursor: 'pointer' }}
        onClick={() => onDeleteRow?.(row.original)}
      />
    )
  }
];
