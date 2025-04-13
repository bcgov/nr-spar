/* eslint-disable camelcase */
import React from 'react';
import { MRT_ColumnDef } from 'material-react-table';
import { Checkbox } from '@mui/material';
import * as Icons from '@carbon/icons-react';
import { ReplicateType } from '../../../../types/consep/TestingActivityType';

const alignRight = {
  muiTableHeadCellProps: { align: 'right' as const },
  muiTableBodyCellProps: { align: 'right' as const }
};

const createEditableNumberColumn = (
  accessorKey: keyof ReplicateType,
  header: string,
  validationMsg: string,
  updateRow: (row: ReplicateType) => void,
  validationErrors: Record<string, string | undefined>,
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>
): MRT_ColumnDef<ReplicateType> => ({
  accessorKey,
  header,
  size: 120,
  muiEditTextFieldProps: ({ cell, row }) => ({
    type: 'number',
    error: !!validationErrors[cell.id],
    helperText: validationErrors[cell.id],
    onChange: (event) => {
      const value = parseFloat(event.currentTarget.value);
      const validationError = value < 0 || value > 1000 ? validationMsg : undefined;

      setValidationErrors({ ...validationErrors, [cell.id]: validationError });

      if (!validationError) {
        updateRow({
          ...row.original,
          [accessorKey]: value
        } as ReplicateType);
      }
    }
  }),
  ...alignRight
});

const createEditableTextColumn = (
  accessorKey: keyof ReplicateType,
  header: string,
  maxLength: number,
  validationMsg: string,
  updateRow: (row: ReplicateType) => void,
  validationErrors: Record<string, string | undefined>,
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>
): MRT_ColumnDef<ReplicateType> => ({
  accessorKey,
  header,
  size: 80,
  muiEditTextFieldProps: ({ cell, row }) => ({
    type: 'text',
    error: !!validationErrors[cell.id],
    helperText: validationErrors[cell.id],
    onChange: (event) => {
      const { value } = event.currentTarget;
      const validationError = value.length > maxLength ? validationMsg : undefined;

      setValidationErrors({ ...validationErrors, [cell.id]: validationError });

      if (!validationError) {
        updateRow({
          ...row.original,
          [accessorKey]: value
        } as ReplicateType);
      }
    }
  }),
  ...alignRight
});

export const getColumns = (
  handleClearOne: (replicateNumber: number) => void,
  updateRow: (row: ReplicateType) => void,
  validationErrors: Record<string, string | undefined>,
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>
): MRT_ColumnDef<ReplicateType>[] => [
  {
    accessorKey: 'replicateNumber',
    header: 'Replicate',
    size: 40,
    enableEditing: false,
    ...alignRight
  },
  createEditableTextColumn(
    'containerId',
    'Container #',
    4,
    'Container ID must be no more than 4 characters',
    updateRow,
    validationErrors,
    setValidationErrors
  ),
  createEditableNumberColumn(
    'containerWeight',
    'Container weight',
    'Container weight must be between 0 and 1000',
    updateRow,
    validationErrors,
    setValidationErrors
  ),
  createEditableNumberColumn(
    'freshSeed',
    'Fresh seed',
    'Fresh seed must be between 0 and 1000',
    updateRow,
    validationErrors,
    setValidationErrors
  ),
  createEditableNumberColumn(
    'containerAndDryWeight',
    'Cont + Dry seed',
    'Container + Dry weight must be between 0 and 1000',
    updateRow,
    validationErrors,
    setValidationErrors
  ),
  createEditableNumberColumn(
    'dryWeight',
    'Dry weight',
    'Dry weight must be between 0 and 1000',
    updateRow,
    validationErrors,
    setValidationErrors
  ),
  {
    accessorKey: 'mcValue',
    header: 'MC value',
    size: 80,
    ...alignRight
  },
  {
    accessorKey: 'replicateAccInd',
    header: 'Acc',
    Cell: ({ row }: { row: { original: ReplicateType } }) => (
      <Checkbox
        checked={!!row.original.replicateAccInd}
        onClick={() => {
          updateRow({
            ...row.original,
            replicateAccInd: row.original.replicateAccInd === 1 ? 0 : 1
          });
        }}
      />
    ),
    size: 40,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    enableEditing: false
  },
  {
    accessorKey: 'replicateComment',
    header: 'Comments',
    size: 300,
    muiEditTextFieldProps: ({ row }) => ({
      type: 'text',
      onChange: (event) => {
        updateRow({
          ...row.original,
          replicateComment: event.currentTarget.value
        });
      }
    })
  },
  {
    accessorKey: 'actions',
    header: '',
    Cell: ({ row }: { row: { original: ReplicateType } }) => (
      <Icons.TrashCan
        size={15}
        style={{ cursor: 'pointer' }}
        onClick={() => handleClearOne(row.original.replicateNumber)}
      />
    ),
    enableEditing: false,
    size: 40,
    ...alignRight
  }
];
