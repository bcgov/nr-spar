/* eslint-disable camelcase */
import React, { useRef, useState, useEffect } from 'react';
import { type MRT_TableInstance } from 'material-react-table';
import {
  Row, Column, Button, Modal, Tooltip
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import GenericTable from '../../../../components/GenericTable';
import ShowHideColumnControl from './ToolbarControls/ShowHideColumnControl';
import TestHistory from './ToolbarControls/TestHistory';
import AddActivity from './ToolbarControls/AddActivity';
import CreateGermTray from './ToolbarControls/CreateGermTray';
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
  const tableRef = useRef<MRT_TableInstance<TestingSearchResponseType> | null>(null);
  const [showTestHistory, setShowTestHistory] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showCreateGermTray, setShowCreateGermTray] = useState(false);

  useEffect(() => {
    // Reset row selection whenever new data is set
    tableRef.current?.resetRowSelection?.();
  }, [data]);

  // const handleCreateGermTray = (options: GermTrayOptions) => {
  //   // Handle create germ tray logic here
  // };

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
      action: () => setShowAddActivity(true)
    },
    {
      label: 'Create germ tray',
      type: 'tertiary',
      action: () => setShowCreateGermTray(true)
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
          tableRef.current?.getSelectedRowModel().rows?.length === 1
            ? `Seedlot ${
              tableRef.current.getSelectedRowModel().rows[0].original.seedlotDisplay
            }: Test history`
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
        {showTestHistory && tableRef.current && <TestHistory table={tableRef.current} />}
      </Modal>
      <Modal
        className="concep-add-activity-modal"
        open={showAddActivity}
        passiveModal
        size="lg"
        modalHeading={
          tableRef.current?.getSelectedRowModel().rows?.length === 1
            ? `Seedlot ${
              tableRef.current.getSelectedRowModel().rows[0].original.seedlotDisplay
            }: Add activity`
            : 'Seedlot: Add activity'
        }
        onRequestClose={() => setShowAddActivity(false)}
        selectorsFloatingMenus={[
          '.MuiPopover-root',
          '.MuiPaper-root'
        ]}
      >
        {showAddActivity && tableRef.current && <AddActivity table={tableRef.current} />}
      </Modal>
      <Modal
        className="concep-create-germ-tray-modal"
        open={showCreateGermTray}
        passiveModal
        size="sm"
        modalHeading="Create germination tray"
        onRequestClose={() => setShowCreateGermTray(false)}
      >
        {showCreateGermTray && (
          <CreateGermTray
            onClose={() => setShowCreateGermTray(false)}
            onSubmit={() => {}}
            isLoading={false}
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
          enableColumnPinning
          enableColumnResizing
          enableSorting
          manualSorting
          enableStickyHeader
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
          renderToolbarInternalActions={({ table }) => {
            tableRef.current = table as MRT_TableInstance<TestingSearchResponseType>;
            const selectedRows = table.getSelectedRowModel().rows;
            const isActionButtonsEnabled = selectedRows.length === 1;
            const disabledReason = selectedRows.length === 0
              ? 'Select one seedlot to view its test history or add activity.'
              : 'You can only view test history or add activity for one seedlot at a time.';

            return (
              <Column>
                {actions.map(({
                  label, icon, action, type
                }) => {
                  const button = (
                    <Button
                      key={label}
                      onClick={action}
                      kind={type}
                      aria-label={label}
                      size="md"
                      className="concep-test-search-table-toolbar-button"
                      disabled={(label === 'Test history' || label === 'Add activity') && !isActionButtonsEnabled}
                    >
                      {label}
                      {icon}
                    </Button>
                  );

                  return (label === 'Test history' || label === 'Add activity') && !isActionButtonsEnabled ? (
                    <Tooltip key={label} label={disabledReason} align="right">
                      <span>{button}</span>
                    </Tooltip>
                  ) : (
                    button
                  );
                })}
                <ShowHideColumnControl
                  table={table as MRT_TableInstance<TestingSearchResponseType>}
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
