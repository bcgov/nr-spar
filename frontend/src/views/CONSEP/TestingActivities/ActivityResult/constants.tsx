/* eslint-disable camelcase */
import React from 'react';
import { MRT_ColumnDef } from 'material-react-table';
import { Checkbox } from '@mui/material';
import * as Icons from '@carbon/icons-react';
import { ReplicateKeys, ReplicateType } from '../../../../types/consep/TestingActivityType';

export const TABLE_TITLE = 'Activity results per replicate';

const alignRight = (columnClassName?: string) => ({
  muiTableHeadCellProps: {
    align: 'right' as const,
    ...(columnClassName ? { className: `col-${columnClassName}` } : {})
  },
  muiTableBodyCellProps: { align: 'right' as const }
});

const createEditableNumberColumn = (
  accessorKey: ReplicateKeys,
  header: string,
  validationMsg: string,
  updateRow: (row: ReplicateType) => void,
  validationErrors: Record<string, string | undefined>,
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>
): MRT_ColumnDef<ReplicateType> => ({
  accessorKey,
  header,
  muiEditTextFieldProps: ({ cell, row }) => {
    const value = row.original[accessorKey as keyof typeof row.original] ?? '';
    return {
      type: 'number',
      value,
      error: !!validationErrors[cell.id],
      helperText: validationErrors[cell.id],
      placeholder: undefined,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.currentTarget.value;
        const parsedValue = rawValue === '' ? NaN : parseFloat(rawValue);

        // count decimals (treat empty or integer as 0 decimals)
        const decimalCount = rawValue.includes('.') ? rawValue.split('.')[1].length : 0;

        // determine validation error
        let validationError: string | undefined;
        if (rawValue !== '' && !Number.isFinite(parsedValue)) {
          validationError = 'Invalid number';
        } else if (rawValue !== '' && (parsedValue < 0 || parsedValue > 1000)) {
          validationError = validationMsg;
        } else if (decimalCount > 3) {
          validationError = 'Cannot exceed three decimal places';
        } else {
          validationError = undefined;
        }

        setValidationErrors((prev) => ({ ...prev, [cell.id]: validationError }));

        // only call updateRow when there is no validation error
        if (!validationError) {
          updateRow({
            ...row.original,
            [accessorKey]: rawValue === '' ? undefined : parsedValue
          } as ReplicateType);
        }
      },
      inputProps: {
        inputMode: 'numeric',
        pattern: '[0-9]*'
      },
      sx: {
        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0
        },
        '& input[type=number]': {
          MozAppearance: 'textfield'
        }
      }
    };
  },
  ...alignRight(accessorKey)
});

const createEditableTextColumn = (
  accessorKey: ReplicateKeys,
  header: string,
  maxLength: number,
  validationMsg: string,
  updateRow: (row: ReplicateType) => void,
  validationErrors: Record<string, string | undefined>,
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>
): MRT_ColumnDef<ReplicateType> => ({
  accessorKey,
  header,
  muiEditTextFieldProps: ({ cell, row }) => {
    const value = row.original[accessorKey as keyof typeof row.original] ?? '';
    return {
      type: 'text',
      value,
      error: !!validationErrors[cell.id],
      helperText: validationErrors[cell.id],
      placeholder: undefined,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value;
        const validationError = newValue.length > maxLength ? validationMsg : undefined;

        setValidationErrors({ ...validationErrors, [cell.id]: validationError });

        if (!validationError) {
          updateRow({
            ...row.original,
            [accessorKey]: newValue
          } as ReplicateType);
        }
      }
    };
  },
  ...alignRight(accessorKey)
});

export const getMccColumns = (
  disableEditing: boolean,
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
    ...alignRight('replicateNumber'),
    muiEditTextFieldProps: ({ row }: { row: { original: ReplicateType } }) => ({
      type: 'text',
      value: row.original.replicateNumber ?? ''
    })
  },
  createEditableTextColumn(
    'containerId',
    'Cont #',
    4,
    'Must be no more than 4 characters',
    updateRow,
    validationErrors,
    setValidationErrors
  ),
  createEditableNumberColumn(
    'containerWeight',
    'Cont wt',
    'Must be between 0 and 1000',
    updateRow,
    validationErrors,
    setValidationErrors
  ),
  createEditableNumberColumn(
    'freshSeed',
    'Fresh seed',
    'Must be between 0 and 1000',
    updateRow,
    validationErrors,
    setValidationErrors
  ),
  createEditableNumberColumn(
    'containerAndDryWeight',
    'Cont + Dry seed',
    'Must be between 0 and 1000',
    updateRow,
    validationErrors,
    setValidationErrors
  ),
  {
    accessorKey: 'dryWeight',
    header: 'Dry weight',
    size: 60,
    enableEditing: false,
    muiEditTextFieldProps: ({ row }: { row: { original: ReplicateType } }) => ({
      type: 'text',
      value: 'dryWeight' in row.original ? row.original.dryWeight : ''
    }),
    ...alignRight('dryWeight')
  },
  {
    accessorKey: 'mcValue',
    header: 'MC value (%)',
    size: 40,
    muiEditTextFieldProps: ({ row }: { row: { original: ReplicateType } }) => ({
      type: 'text',
      value: 'mcValue' in row.original ? row.original.mcValue : ''
    }),
    enableEditing: false,
    ...alignRight('mcValue')
  },
  {
    accessorKey: 'replicateAccInd',
    header: 'Acc',
    Cell: ({ row }: { row: { original: ReplicateType } }) => (
      <Checkbox
        checked={!!row.original.replicateAccInd}
        disabled={disableEditing}
        onClick={() => {
          updateRow({
            ...row.original,
            replicateAccInd: row.original.replicateAccInd === 1 ? 0 : 1
          });
        }}
      />
    ),
    size: 60,
    enableEditing: false,
    ...alignRight('replicateAccInd')
  },
  {
    accessorKey: 'replicateComment',
    header: 'Comments',
    size: 300,
    muiEditTextFieldProps: ({ row }: { row: { original: ReplicateType } }) => ({
      type: 'text',
      value: 'replicateComment' in row.original ? row.original.replicateComment : '',
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        updateRow({
          ...row.original,
          replicateComment: event.currentTarget.value
        });
      }
    }),
    ...alignRight('replicateComment')
  },
  {
    accessorKey: 'actions',
    header: '',
    enableSorting: false,
    Cell: ({ row }: { row: { original: ReplicateType } }) => (
      <Icons.TrashCan
        size={15}
        style={{ cursor: 'pointer' }}
        onClick={() => handleClearOne(row.original.replicateNumber)}
      />
    ),
    enableEditing: false,
    size: 60,
    ...alignRight
  }
];

export const getPurityColumns = (
  disableEditing: boolean,
  hideActions: boolean,
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
  createEditableNumberColumn(
    'pureSeedWeight',
    'Pure seed weight (g)',
    'Pure Seed Weight must be greater than or equal to 0 and less than 1,000',
    updateRow,
    validationErrors,
    setValidationErrors
  ),
  createEditableNumberColumn(
    'inertMttrWeight',
    'Inert matter weight (g)',
    'Inert Matter Weight must be greater than or equal to 0 and less than 1,000',
    updateRow,
    validationErrors,
    setValidationErrors
  ),
  createEditableNumberColumn(
    'otherSeedWeight',
    'Other seed weight (g)',
    'Other Seed Weight must be greater than or equal to 0 and less than 1,000',
    updateRow,
    validationErrors,
    setValidationErrors
  ),
  {
    accessorKey: 'purityValue',
    header: 'Purity',
    size: 80,
    muiEditTextFieldProps: ({ row }: { row: { original: ReplicateType } }) => ({
      type: 'text',
      value: 'purityValue' in row.original ? row.original.purityValue : ''
    }),
    enableEditing: false,
    ...alignRight
  },
  {
    accessorKey: 'replicateAccInd',
    header: 'Acc',
    Cell: ({ row }: { row: { original: ReplicateType } }) => (
      <Checkbox
        checked={!!row.original.replicateAccInd}
        disabled={disableEditing}
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
    accessorKey: 'overrideReason',
    header: 'Comments',
    size: 300,
    muiEditTextFieldProps: ({ row }: { row: { original: ReplicateType } }) => ({
      type: 'text',
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        updateRow({
          ...row.original,
          replicateComment: event.currentTarget.value
        });
      }
    })
  },

  // Conditionally add the actions column
  !hideActions && {
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
].filter(Boolean) as MRT_ColumnDef<ReplicateType>[];
