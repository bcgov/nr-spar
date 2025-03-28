/* eslint-disable camelcase */
import React from 'react';
import { MRT_ColumnDef } from 'material-react-table';
import { Checkbox } from '@mui/material';
import * as Icons from '@carbon/icons-react';

type DataType = {
  replicate: number;
  containerNumber: number;
  containerWeight: number;
  freshSeed: number;
  contDrySeed: number;
  dryWeight: number;
  mcValue: number;
  acc: boolean;
  comments: string;
};

const alignRight = {
  muiTableHeadCellProps: { align: 'right' as 'right' },
  muiTableBodyCellProps: { align: 'right' as 'right' }
};

export const columns: MRT_ColumnDef<DataType>[] = [
  {
    accessorKey: 'replicate', header: 'Replicate', size: 40, enableEditing: false, ...alignRight
  },
  {
    accessorKey: 'containerNumber', header: 'Container #', size: 80, ...alignRight
  },
  {
    accessorKey: 'containerWeight', header: 'Container weight', size: 120, ...alignRight
  },
  {
    accessorKey: 'freshSeed', header: 'Fresh seed', size: 100, ...alignRight
  },
  {
    accessorKey: 'contDrySeed', header: 'Cont + Dry seed', size: 120, ...alignRight
  },
  {
    accessorKey: 'dryWeight', header: 'Dry weight', size: 100, ...alignRight
  },
  {
    accessorKey: 'mcValue', header: 'MC value', size: 80, ...alignRight
  },
  {
    accessorKey: 'acc',
    header: 'Acc',
    Cell: ({ row }: { row: { original: DataType } }) => <Checkbox checked={row.original.acc} />,
    size: 40,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    enableEditing: false
  },
  {
    accessorKey: 'comments',
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

export const data: DataType[] = [
  {
    replicate: 1, containerNumber: 99, containerWeight: 9.999, freshSeed: 9.999, contDrySeed: 9.999, dryWeight: 9.999, mcValue: 6.7, acc: false, comments: ''
  },
  {
    replicate: 2, containerNumber: 89, containerWeight: 9.999, freshSeed: 9.999, contDrySeed: 9.999, dryWeight: 9.999, mcValue: 6.7, acc: false, comments: 'test comment'
  },
  {
    replicate: 3, containerNumber: 79, containerWeight: 9.999, freshSeed: 9.999, contDrySeed: 9.999, dryWeight: 9.999, mcValue: 8.9, acc: false, comments: ''
  },
  {
    replicate: 4, containerNumber: 69, containerWeight: 9.999, freshSeed: 9.999, contDrySeed: 9.999, dryWeight: 9.999, mcValue: 8.9, acc: false, comments: ''
  },
  {
    replicate: 5, containerNumber: 59, containerWeight: 9.999, freshSeed: 9.999, contDrySeed: 9.999, dryWeight: 9.999, mcValue: 8.9, acc: false, comments: 'test comment'
  },
  {
    replicate: 6, containerNumber: 49, containerWeight: 9.999, freshSeed: 9.999, contDrySeed: 9.999, dryWeight: 9.999, mcValue: 8.9, acc: false, comments: ''
  },
  {
    replicate: 7, containerNumber: 39, containerWeight: 9.999, freshSeed: 9.999, contDrySeed: 9.999, dryWeight: 9.999, mcValue: 8.9, acc: false, comments: ''
  },
  {
    replicate: 8, containerNumber: 29, containerWeight: 9.999, freshSeed: 9.999, contDrySeed: 9.999, dryWeight: 9.999, mcValue: 8.9, acc: false, comments: ''
  }
];
