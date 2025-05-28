/* eslint-disable camelcase */
import React from 'react';
import {
  type MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable
} from 'material-react-table';

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
  isCompacted?: boolean;
  renderRowActions?: (props: { row: any; table: any }) => React.ReactNode;
  onRowClick?: (row: T) => void;
  initialState?: any;
};

const COLOR_GREY_20 = '#DFDFE1';
const WHITE = '#ffffff';
const COLOR_GREY_10 = '#F3F3F5';

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
  isCompacted = false,
  renderRowActions,
  onRowClick,
  initialState
}: Props<T>) => {
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
        overflow: 'hidden',
        borderRadius: 0,
        boxShadow: 'none',
        width: '100%',
        '& > .MuiBox-root': {
          display: 'none'
        }
      }
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => onRowClick?.(row.original),
      sx: {
        cursor: onRowClick ? 'pointer' : 'default',
        backgroundColor: row.index % 2 === 0 ? COLOR_GREY_10 : WHITE
      }
    }),
    muiTableBodyCellProps: {
      sx: {
        ...isCompacted && {
          paddingTop: 0,
          paddingBottom: 0
        },
        '&:hover': {
          outline: 'none',
          backgroundColor: COLOR_GREY_20
        }
      }
    },
    muiTableHeadRowProps: {
      sx: {
        backgroundColor: COLOR_GREY_20
      }
    },
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
    createDisplayMode: 'row',
    editDisplayMode: 'table',
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
