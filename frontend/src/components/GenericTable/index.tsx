/* eslint-disable camelcase */
import React from 'react';
import {
  type MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable
} from 'material-react-table';
import { type Theme, useTheme } from '@mui/material';

import './style.scss';

type Props<T extends Record<string, any>> = {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableFilters?: boolean;
  enableHiding?: boolean;
  enableRowSelection?: boolean;
  enableRowActions?: boolean;
  enableColumnFilters?: boolean;
  enableGlobalFilter?: boolean;
  enableDensityToggle?: boolean;
  enableFullScreenToggle?: boolean;
  enableColumnActions?: boolean;
  enableEditing?: boolean;
  renderRowActions?: (props: { row: any; table: any }) => React.ReactNode;
  onRowClick?: (row: T) => void;
  initialState?: any;
};

const GenericTable = <T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  enablePagination = false,
  enableHiding = false,
  enableSorting = false,
  enableFilters = false,
  enableRowSelection = false,
  enableRowActions = false,
  enableColumnFilters = false,
  enableGlobalFilter = false,
  enableDensityToggle = false,
  enableFullScreenToggle = false,
  enableColumnActions = false,
  enableEditing = true,
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
        backgroundColor: row.index % 2 === 0 ? '#F3F3F5' : '#ffffff'
      }
    }),
    enablePagination,
    enableSorting,
    enableFilters,
    enableHiding,
    enableColumnFilters,
    enableRowSelection,
    enableRowActions,
    enableGlobalFilter,
    enableDensityToggle,
    enableFullScreenToggle,
    enableColumnActions,
    enableEditing,
    editDisplayMode: 'cell',
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
