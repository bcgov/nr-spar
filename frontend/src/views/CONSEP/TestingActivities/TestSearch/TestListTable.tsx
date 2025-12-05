import React, { useRef, useState } from 'react';
import {
  Row, Column, Button, Modal
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import GenericTable from '../../../../components/GenericTable';
import ShowHideColumnControl from './ToolbarControls/ShowHideColumnControl';
import TestHistory from './ToolbarControls/TestHistory';
import { getTestingActivityListColumns, columnVisibilityLocalStorageKey } from './constants';
import type {
  TestingSearchResponseType,
  PaginationInfoType
} from '../../../../types/consep/TestingSearchType';

type TestListTableProp = {
  data: TestingSearchResponseType[];
  paginationInfo: PaginationInfoType;
  onExportData: () => void;
  isLoading?: boolean;
  onPageChange?: (pageIndex: number, pageSize: number) => void;
};

const TestListTable = ({
  data,
  isLoading = false,
  paginationInfo,
  onPageChange,
  onExportData
}: TestListTableProp) => {
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const tableRef = useRef<any>(null);
  const [showTestHistory, setShowTestHistory] = useState(false);
  const selectedRows = tableRef.current?.getSelectedRowModel?.().rows ?? [];
  const selectedSeedlot = selectedRows[0]?.original?.seedlotDisplay;

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
      action: () => setShowTestHistory(true)
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
      <Modal
        className="concep-test-history-modal"
        open={showTestHistory}
        passiveModal
        size="lg"
        modalHeading={
          selectedSeedlot
            ? `Seedlot ${selectedSeedlot}: Test history`
            : 'Seedlot: Test history'
        }
        onRequestClose={() => setShowTestHistory(false)}
        selectorsFloatingMenus={[
          // specify selectors for floating menus
          // that should remain accessible and on top of the modal
          '.MuiPopover-root',
          '.MuiPaper-root'
        ]}
      >
        {showTestHistory && tableRef.current && (
          <TestHistory
            table={tableRef.current}
          />
        )}
      </Modal>
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
          enableMultiRowSelection={false}
          enableColumnPinning
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
          renderToolbarInternalActions={({ table }) => {
            tableRef.current = table;
            return (
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
            );
          }}
        />
      </Row>
    </div>
  );
};

export default TestListTable;
