/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
import React from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import { Checkbox } from '@mui/material';
import { Button } from '@carbon/react';
import { TrashCan } from '@carbon/icons-react';
import { formatDateCell } from '../../TestSearch/constants';
import { GermTrayColumn } from './definitions';
import { GermTrayTestType } from '../../../../../types/consep/GerminatorTrayType';

// Supports both legacy (-1) and common (1) truthy indicators.
const isIndicatorChecked = (value: unknown): boolean => value === -1 || value === 1;

export const getGermTrayColumns = (
  updateRow: (row: GermTrayColumn) => void,
  onDeleteTray?: (row: GermTrayColumn) => void
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
  },
  {
    accessorKey: 'actions',
    header: '',
    enableSorting: false,
    enableEditing: false,
    size: 50,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell: ({ row }: { row: { original: GermTrayColumn } }) => (
      <Button
        kind="ghost"
        size="sm"
        aria-label="Delete tray"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onDeleteTray?.(row.original);
        }}
      >
        <TrashCan size={15} />
      </Button>
    )
  }
];

export const getGermTrayTestsColumns = (
  onDeleteRow?: (row: GermTrayTestType) => void
): MRT_ColumnDef<GermTrayTestType>[] => [
  {
    accessorKey: 'seedlotNumber',
    header: 'Lot #',
    enableEditing: false,
    size: 80
  },
  {
    accessorKey: 'requestId',
    header: 'Request ID',
    enableEditing: false,
    size: 120
  },
  {
    accessorKey: 'warmStratStartDate',
    header: 'Warm strat date',
    enableEditing: false,
    size: 110,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'drybackStartDate',
    header: 'Dryback',
    enableEditing: false,
    size: 90,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'stratStartDate',
    header: 'Cold strat start',
    enableEditing: false,
    size: 110,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'germinatorEntry',
    header: 'Germinator Entry',
    enableEditing: false,
    size: 120,
    Cell: ({ cell }) => formatDateCell(cell.getValue<string | null>())
  },
  {
    accessorKey: 'testCompleteInd',
    header: 'Complete',
    enableEditing: false,
    size: 80,
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
    size: 80,
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
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell: ({ row }: { row: { original: GermTrayTestType } }) => (
      <Button
        kind="ghost"
        size="sm"
        aria-label="Remove from tray"
        disabled={row.original.riaSkey == null || row.original.updateTimestamp == null}
        onClick={() => onDeleteRow?.(row.original)}
      >
        <TrashCan size={15} />
      </Button>
    )
  }
];
