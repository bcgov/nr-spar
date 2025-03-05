/* eslint-disable camelcase */
import React from 'react';
import {
  type MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable
} from 'material-react-table';
import { type Theme, useTheme } from '@mui/material';

type Props<T extends Record<string, any>> = {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableFilters?: boolean;
  enableRowSelection?: boolean;
  enableRowActions?: boolean;
  renderRowActions?: (props: { row: any; table: any }) => React.ReactNode;
  onRowClick?: (row: T) => void;
  initialState?: any;
};

const GenericTable = <T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  enablePagination = true,
  enableSorting = true,
  enableFilters = true,
  enableRowSelection = false,
  enableRowActions = false,
  renderRowActions,
  onRowClick,
  initialState
}: Props<T>) => {
  const theme = useTheme<Theme>();

  const basicTable = useMaterialReactTable({
    columns,
    data,
    initialState,
    state: {
      isLoading
    },
    muiPaginationProps: {
      showRowsPerPage: true,
      shape: 'rounded'
    },
    muiTablePaperProps: {
      sx: {
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: theme.shadows[3]
      }
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => onRowClick?.(row.original),
      sx: {
        cursor: onRowClick ? 'pointer' : 'default',
        '&:hover': {
          backgroundColor: onRowClick
            ? theme.palette.action.hover
            : 'inherit'
        }
      }
    }),
    enablePagination,
    enableSorting,
    enableColumnFilters: enableFilters,
    enableRowSelection,
    enableRowActions,
    renderRowActions: renderRowActions
      ? ({ row, table }) => renderRowActions({ row, table })
      : undefined,
    localization: {
      noRecordsToDisplay: 'No data found'
    }
  });

  return <MaterialReactTable table={basicTable} />;
};

export default GenericTable;
