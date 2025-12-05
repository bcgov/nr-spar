import React, { useRef } from 'react';
import { Row, Column, Button } from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import GenericTable from '../../../../components/GenericTable';
import ShowHideColumnControl from './ToolbarControls/ShowHideColumnControl';
import { getTestingActivityListColumns, columnVisibilityLocalStorageKey } from './constants';
import type {
  TestingSearchResponseType,
  PaginationInfoType
} from '../../../../types/consep/TestingSearchType';

type TestListTableProp = {
  data: TestingSearchResponseType[];
  paginationInfo: PaginationInfoType;
  sorting?: { id: string; desc: boolean }[];
  onExportData: () => void;
  isLoading?: boolean;
  onPageChange?: (pageIndex: number, pageSize: number) => void;
  onSortingChange?: (sorting: { id: string; desc: boolean }[]) => void;
};

const TestListTable = ({
  data,
  isLoading = false,
  paginationInfo,
  onPageChange,
  onExportData,
  onSortingChange,
  sorting
}: TestListTableProp) => {
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  const actions = [
    {
      label: 'Results',
      type: 'tertiary',
      action: () => {}
    },
    {
      label: 'Observations',
      type: 'tertiary',
      action: () => {}
    },
    {
      label: 'Test history',
      type: 'tertiary',
      action: () => {}
    },
    {
      label: 'Add activity',
      type: 'tertiary',
      action: () => {}
    },
    {
      label: 'Create germ tray',
      type: 'tertiary',
      action: () => {}
    },
    {
      label: 'Export Data',
      icon: (
        <Icons.DocumentExport size={16} className="concep-test-search-table-toolbar-button-icon" />
      ),
      type: 'primary',
      action: () => onExportData()
    },
    {
      label: 'Filters',
      icon: <Icons.Filter size={16} className="concep-test-search-table-toolbar-button-icon" />,
      type: 'primary',
      action: () => {}
    }
  ];

  return (
    <div className="concep-test-search-table-container">
      <Row className="concep-test-search-table">
        <GenericTable
          columns={getTestingActivityListColumns()}
          data={data}
          enablePagination
          manualPagination
          pageIndex={paginationInfo.pageNumber}
          pageSize={paginationInfo.pageSize}
          rowCount={paginationInfo.totalElements}
          onPaginationChange={onPageChange}
          enableRowSelection
          enableColumnPinning
          enableSorting
          manualSorting
          sorting={sorting}
          onSortingChange={onSortingChange}
          isLoading={isLoading}
          tableBodyRef={tableBodyRef}
          hideToolbar={false}
          initialState={{
            columnVisibility: JSON.parse(
              localStorage.getItem(columnVisibilityLocalStorageKey) || '{}'
            ),
            columnPinning: {
              left: ['mrt-row-select', 'seedlotDisplay', 'requestItem']
            },
            columnSizing: { 'mrt-row-select': 30 }
          }}
          renderTopToolbarCustomActions={() => (
            <div className="concep-test-search-table-title">{`Total search result: ${paginationInfo.totalElements}`}</div>
          )}
          renderToolbarInternalActions={({ table }) => (
            <Column>
              {actions.map(({
                label, icon, action, type
              }) => (
                <Button
                  key={label}
                  onClick={action}
                  kind={type}
                  aria-label={label}
                  size="md"
                  className="concep-test-search-table-toolbar-button"
                >
                  {label}
                  {icon}
                </Button>
              ))}
              <ShowHideColumnControl
                table={table}
                columnVisibilityLocalStorageKey={columnVisibilityLocalStorageKey}
              />
            </Column>
          )}
        />
      </Row>
    </div>
  );
};

export default TestListTable;
