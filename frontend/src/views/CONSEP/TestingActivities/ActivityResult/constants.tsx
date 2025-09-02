/* eslint-disable camelcase */
import React from 'react';
import { MRT_ColumnDef } from 'material-react-table';
import { Checkbox } from '@mui/material';
import * as Icons from '@carbon/icons-react';
import { Tag } from '@carbon/react';
import { ReplicateKeys, ReplicateType, TestingActivityListType } from '../../../../types/consep/TestingActivityType';

export const TABLE_TITLE = 'Activity results per replicate';

const alignRight = {
  muiTableHeadCellProps: { align: 'right' as const },
  muiTableBodyCellProps: { align: 'right' as const }
};

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
  size: 120,
  muiEditTextFieldProps: ({ cell, row }) => {
    const value = row.original[accessorKey as keyof typeof row.original] ?? '';
    return {
      type: 'number',
      value,
      error: !!validationErrors[cell.id],
      helperText: validationErrors[cell.id],
      placeholder: undefined,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(event.currentTarget.value);
        const validationError = newValue < 0 || newValue > 1000 ? validationMsg : undefined;

        setValidationErrors({ ...validationErrors, [cell.id]: validationError });

        if (!validationError) {
          updateRow({
            ...row.original,
            [accessorKey]: newValue
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
  ...alignRight
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
  size: 80,
  muiEditTextFieldProps: ({ cell, row }) => {
    const value = row.original[accessorKey as keyof typeof row.original] ?? '';
    return {
      type: 'text',
      value,
      error: !!validationErrors[cell.id],
      helperText: validationErrors[cell.id],
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
  ...alignRight
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
    muiEditTextFieldProps: ({ row }: { row: { original: ReplicateType } }) => ({
      type: 'text',
      value: row.original.replicateNumber ?? ''
    }),
    ...alignRight
  },
  createEditableTextColumn(
    'containerId',
    'Container #',
    4,
    'Must be no more than 4 characters',
    updateRow,
    validationErrors,
    setValidationErrors
  ),
  createEditableNumberColumn(
    'containerWeight',
    'Container weight',
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
    enableEditing: false,
    muiEditTextFieldProps: ({ row }: { row: { original: ReplicateType } }) => ({
      type: 'text',
      value: 'dryWeight' in row.original ? row.original.dryWeight : ''
    })
  },
  {
    accessorKey: 'mcValue',
    header: 'MC value (%)',
    size: 80,
    muiEditTextFieldProps: ({ row }: { row: { original: ReplicateType } }) => ({
      type: 'text',
      value: 'mcValue' in row.original ? row.original.mcValue : ''
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
    size: 60,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    enableEditing: false
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

const alignLeft = {
  muiTableHeadCellProps: { align: 'left' as const },
  muiTableBodyCellProps: { align: 'left' as const }
};

export const getTestingActivityListColumns = (): MRT_ColumnDef<TestingActivityListType>[] => [
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
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value === -1 ? <Tag type="teal" size="sm">Curr</Tag> : null;
    }
  },
  {
    accessorKey: 'testCompleteInd',
    header: 'Com',
    size: 20,
    enableEditing: false,
    ...alignLeft,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value === -1 ? <Tag type="blue" size="sm">Com</Tag> : null;
    }
  },
  {
    accessorKey: 'acceptResultInd',
    header: 'Act',
    size: 20,
    enableEditing: false,
    ...alignLeft,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value === -1 ? <Tag type="green" size="sm">Acc</Tag> : null;
    }
  },
  {
    accessorKey: 'significntStsInd',
    header: 'Sig',
    size: 20,
    enableEditing: false,
    ...alignLeft,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value === -1 ? <Tag type="purple" size="sm">Sig</Tag> : null;
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
    Cell: () => (
      <Icons.TrashCan
        size={15}
        style={{ cursor: 'pointer' }}
        onClick={() => {}}
      />
    ),
    enableEditing: false,
    size: 5,
    ...alignLeft
  }
];
