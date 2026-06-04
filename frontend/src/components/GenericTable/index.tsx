/* eslint-disable camelcase */
import React, { useMemo } from 'react';
import {
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_TableInstance,
  MaterialReactTable,
  useMaterialReactTable
} from 'material-react-table';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useThemePreference } from '../../utils/ThemePreference';

type Props<T extends Record<string, any>> = {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  enablePagination?: boolean;
  manualPagination?: boolean;
  rowCount?: number;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  pageIndex?: number;
  pageSize?: number;
  enableSorting?: boolean;
  manualSorting?: boolean;
  sorting?: { id: string; desc: boolean }[];
  onSortingChange?: (sorting: { id: string; desc: boolean }[]) => void;
  enableFilters?: boolean;
  enableHiding?: boolean;
  enableRowSelection?: boolean;
  enableRowActions?: boolean;
  enableColumnFilters?: boolean;
  enableGlobalFilter?: boolean;
  enableDensityToggle?: boolean;
  enableFullScreenToggle?: boolean;
  enableColumnActions?: boolean;
  enableColumnPinning?: boolean;
  enableColumnResizing?: boolean;
  enableEditing?: boolean;
  enableStickyHeader?: boolean;
  isCompacted?: boolean;
  renderRowActions?: (props: { row: any; table: any }) => React.ReactNode;
  onRowClick?: (row: T) => void;
  initialState?: any;
  tableBodyRef?: React.RefObject<HTMLTableSectionElement>;
  renderToolbarInternalActions?: (props: { table: MRT_TableInstance<any> }) => React.ReactNode;
  renderTopToolbarCustomActions?: (props: { table: MRT_TableInstance<any> }) => React.ReactNode;
  hideToolbar?: boolean;
  renderBottomToolbarCustomActions?: (props: { table: MRT_TableInstance<any> }) => React.ReactNode;
};

const GenericTable = <T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  enablePagination = false,
  manualPagination = false,
  rowCount = data.length,
  onPaginationChange,
  pageIndex = 0,
  pageSize = 20,
  enableHiding = false,
  enableSorting = false,
  manualSorting = false,
  sorting = [],
  onSortingChange,
  enableFilters = false,
  enableRowSelection = false,
  enableRowActions = false,
  enableColumnFilters = false,
  enableGlobalFilter = false,
  enableDensityToggle = false,
  enableFullScreenToggle = false,
  enableColumnActions = false,
  enableColumnPinning = false,
  enableColumnResizing = false,
  enableEditing = true,
  enableStickyHeader = false,
  isCompacted = false,
  renderRowActions,
  onRowClick,
  initialState,
  tableBodyRef,
  renderToolbarInternalActions,
  renderTopToolbarCustomActions,
  renderBottomToolbarCustomActions,
  hideToolbar = true
}: Props<T>) => {
  const { theme: carbonTheme } = useThemePreference();
  const isDark = carbonTheme === 'g100';

  const colors = useMemo(() => ({
    rowEven: isDark ? '#262626' : '#F3F3F5',
    rowOdd: isDark ? '#1f1f1f' : '#ffffff',
    header: isDark ? '#393939' : '#DFDFE1',
    hover: isDark ? '#525252' : '#DFDFE1',
    tableBg: isDark ? '#161616' : '#ffffff',
    menuBg: isDark ? '#262626' : '#ffffff',
    pinnedRowBg: isDark ? '#262626' : '#f4f4f4',
    selectedRowBg: isDark ? '#393939' : '#e5e5e5'
  }), [isDark]);

  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light'
    },
    components: {
      MuiInputBase: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem'
          },
          input: {
            padding: 0
          }
        }
      }
    }
  }), [isDark]);

  const basicTable = useMaterialReactTable({
    columns,
    data,
    initialState,
    state: {
      isLoading,
      ...(manualPagination ? { pagination: { pageIndex, pageSize } } : {}),
      ...(manualSorting && sorting ? { sorting } : {})
    },
    enablePagination,
    manualPagination,
    rowCount,
    ...(manualPagination
      ? {
        onPaginationChange: (
          updaterOrValue: MRT_PaginationState | ((old: MRT_PaginationState) => MRT_PaginationState)
        ) => {
          const newPagination: MRT_PaginationState = typeof updaterOrValue === 'function'
            ? updaterOrValue(basicTable.getState().pagination)
            : updaterOrValue;

          onPaginationChange?.(newPagination.pageIndex, newPagination.pageSize);
        }
      } : {}),
    muiPaginationProps: {
      showRowsPerPage: true,
      shape: 'rounded'
    },
    mrtTheme: {
      baseBackgroundColor: colors.tableBg,
      menuBackgroundColor: colors.menuBg,
      pinnedRowBackgroundColor: colors.pinnedRowBg,
      selectedRowBackgroundColor: colors.selectedRowBg
    },
    muiTablePaperProps: {
      sx: {
        overflow: 'hidden',
        borderRadius: 0,
        boxShadow: 'none',
        width: '100%',
        backgroundColor: colors.tableBg,
        ...(enablePagination
          ? {
            // only hide the top toolbar when pagination is enabled
            '& > .MuiBox-root:first-of-type': {
              display: hideToolbar ? 'none' : 'flex'
            }
          }
          : {
            // hide both top toolbar and bottom pagination to remove extra white spaces
            '& > .MuiBox-root': {
              display: 'none'
            }
          })
      }
    },
    muiTableBodyProps: {
      ref: tableBodyRef
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => onRowClick?.(row.original),
      sx: {
        cursor: onRowClick ? 'pointer' : 'default',
        backgroundColor: row.index % 2 === 0 ? colors.rowEven : colors.rowOdd
      }
    }),
    muiTableBodyCellProps: {
      sx: {
        ...(isCompacted
          ? {
            paddingTop: 0,
            paddingBottom: 0
          }
          : {
            paddingTop: '0.6rem',
            paddingBottom: '0.6rem'
          }),
        '&:hover': {
          outline: 'none',
          backgroundColor: colors.hover
        }
      }
    },
    muiTableHeadRowProps: {
      sx: {
        backgroundColor: colors.header
      }
    },
    muiTableHeadCellProps: {
      sx: {
        '& .Mui-TableHeadCell-Content-Labels': {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.25rem',

          '& .Mui-TableHeadCell-Content-Wrapper': {
            order: 1
          },
          '& .MuiBadge-root': {
            order: 2
          }
        }
      }
    },
    enableSorting,
    manualSorting,
    ...(manualSorting && onSortingChange ? {
      onSortingChange: (updaterOrValue) => {
        const newSorting = typeof updaterOrValue === 'function'
          ? updaterOrValue(basicTable.getState().sorting)
          : updaterOrValue;
        onSortingChange?.(newSorting);
      }
    } : {}),
    enableFilters,
    enableHiding,
    enableColumnFilters,
    enableRowSelection,
    enableRowActions,
    enableGlobalFilter,
    enableDensityToggle,
    enableFullScreenToggle,
    enableColumnActions,
    enableColumnPinning,
    enableColumnResizing,
    enableEditing,
    enableStickyHeader,
    createDisplayMode: 'row',
    editDisplayMode: 'table',
    renderRowActions: renderRowActions
      ? ({ row, table }) => renderRowActions({ row, table })
      : undefined,
    localization: {
      noRecordsToDisplay: 'No data found'
    },
    renderToolbarInternalActions,
    renderTopToolbarCustomActions,
    renderBottomToolbarCustomActions
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <MaterialReactTable table={basicTable} />
    </ThemeProvider>
  );
};

export default GenericTable;
