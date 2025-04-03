/* eslint-disable camelcase */
import React from 'react';
import { MRT_ColumnDef } from 'material-react-table';
import { Checkbox } from '@mui/material';
import * as Icons from '@carbon/icons-react';
import { ReplicateType } from '../../../../types/consep/TestingActivityType';

const alignRight = {
  muiTableHeadCellProps: { align: 'right' as 'right' },
  muiTableBodyCellProps: { align: 'right' as 'right' }
};

export const columns: MRT_ColumnDef<ReplicateType>[] = [
  {
    accessorKey: 'replicateNumber',
    header: 'Replicate',
    size: 40,
    enableEditing: false,
    ...alignRight
  },
  {
    accessorKey: 'containerId',
    header: 'Container #',
    size: 80,
    ...alignRight
  },
  {
    accessorKey: 'containerWeight',
    header: 'Container weight',
    size: 120,
    ...alignRight
  },
  {
    accessorKey: 'freshSeed',
    header: 'Fresh seed',
    size: 100,
    ...alignRight
  },
  {
    accessorKey: 'containerAndDryWeight',
    header: 'Cont + Dry seed',
    size: 120,
    ...alignRight
  },
  {
    accessorKey: 'dryWeight',
    header: 'Dry weight',
    size: 100,
    ...alignRight
  },
  {
    accessorKey: 'mcValue',
    header: 'MC value',
    size: 80,
    ...alignRight
  },
  {
    accessorKey: 'replicateAccInd',
    header: 'Acc',
    Cell:
      ({ row }: { row: { original: ReplicateType } }) => (
        <Checkbox checked={!!row.original.replicateAccInd} />
      ),
    size: 40,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    enableEditing: false
  },
  {
    accessorKey: 'replicateComment',
    header: 'Comments',
    size: 300
  },
  {
    accessorKey: 'actions',
    header: '',
    Cell: () => <Icons.TrashCan size={15} />,
    enableEditing: false,
    size: 40,
    ...alignRight
  }
];
