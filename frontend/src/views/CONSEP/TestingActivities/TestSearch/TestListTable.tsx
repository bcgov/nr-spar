import React, { useRef, useState, useMemo } from 'react';
import { type MRT_RowSelectionState, type MRT_TableInstance } from 'material-react-table';
import {
  Row, Column, Button, Modal, Tooltip
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import GenericTable from '../../../../components/GenericTable';
import ShowHideColumnControl from './ToolbarControls/ShowHideColumnControl';
import TestHistory from './ToolbarControls/TestHistory';
import AddActivity from './ToolbarControls/AddActivity';
import CreateGermTray from './ToolbarControls/CreateGermTray';
import { getTestingActivityListColumns, columnVisibilityLocalStorageKey, isFamilyLot } from './constants';

import type {
  TestingSearchResponseType,
  PaginationInfoType
} from '../../../../types/consep/TestingSearchType';

type TestListTableProp = {
  data: TestingSearchResponseType[];
  onAddActivitySuccess?: ((newActivity: TestingSearchResponseType) => void);
  paginationInfo: PaginationInfoType;
  sorting?: { id: string; desc: boolean }[];
  onExportData: () => void;
  isLoading?: boolean;
  onPageChange?: (pageIndex: number, pageSize: number) => void;
  onSortingChange?: (sorting: { id: string; desc: boolean }[]) => void;
};

const TestListTable = ({
  data,
  onAddActivitySuccess = () => {},
  isLoading = false,
  paginationInfo,
  onPageChange,
  onExportData,
  onSortingChange,
  sorting
}: TestListTableProp) => {
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [prevData, setPrevData] = useState(data);
  const [showTestHistory, setShowTestHistory] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showCreateGermTray, setShowCreateGermTray] = useState(false);

  // Reset row selection whenever new data is set
  if (prevData !== data) {
    setPrevData(data);
    setRowSelection({});
  }

  const selectedRows = useMemo(
    () => data.filter((_, index) => rowSelection[index]),
    [data, rowSelection]
  );

  const getLotHeading = (suffix: string) => {
    if (selectedRows.length !== 1) return `Seedlot: ${suffix}`;
    const lot = selectedRows[0].seedlotDisplay;
    return `${isFamilyLot(lot) ? 'Familylot' : 'Seedlot'} ${lot}: ${suffix}`;
  };

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

  const getCreateGermTrayDisabledState = () => {
    if (selectedRows.length === 0) {
      return {
        disabled: true,
        reason: 'Select one or more seedlots to create a germinator tray.'
      };
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); // set to be end of the day

    const hasInvalidRow = selectedRows.some(
      (original) => {
        const withdrawalDate = original.seedWithdrawalDate
          ? new Date(original.seedWithdrawalDate)
          : null;

        return (
          // if seedlot has not withdrawn yet, withdrawal date is after today
          (!withdrawalDate || withdrawalDate > today)
          || original.germTestInd !== -1 // if not germ test
          || original.assignedTrayInd === -1 // if already assigned to a tray
        );
      }
    );

    if (hasInvalidRow) {
      return {
        disabled: true,
        reason: 'Could not create germinator tray. Possible reasons: '
        + 'Seed has not been withdrawn, not all tests are germination tests, '
        + 'and/or a germinator tray ID is already assigned.'
      };
    }

    return { disabled: false, reason: '' };
  };

  return (
    <div className="concep-test-search-table-container">
      <Modal
        className="concep-test-history-modal"
        open={showTestHistory}
        passiveModal
        size="lg"
        modalHeading={getLotHeading('Test history')}
        onRequestClose={() => setShowTestHistory(false)}
        selectorsFloatingMenus={[
          // specify selectors for floating menus
          // that should remain accessible and on top of the modal
          '.MuiPopover-root',
          '.MuiPaper-root'
        ]}
      >
        {showTestHistory && (
          <TestHistory selectedRows={selectedRows} />
        )}
      </Modal>
      <Modal
        className="concep-add-activity-modal"
        open={showAddActivity}
        passiveModal
        size="lg"
        modalHeading={getLotHeading('Add activity')}
        onRequestClose={() => setShowAddActivity(false)}
        selectorsFloatingMenus={[
          '.MuiPopover-root',
          '.MuiPaper-root'
        ]}
      >
        {showAddActivity && (
          <AddActivity
            selectedRows={selectedRows}
            closeModal={() => setShowAddActivity(false)}
            onAddActivitySuccess={onAddActivitySuccess}
          />
        )}
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
            selectedRows={selectedRows}
            onClose={() => setShowCreateGermTray(false)}
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
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
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
            const createTrayState = getCreateGermTrayDisabledState();
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
                      disabled={
                        ((label === 'Test history' || label === 'Add activity') && !isActionButtonsEnabled)
                        || (label === 'Create germ tray' && createTrayState.disabled)
                      }
                    >
                      {label}
                      {icon}
                    </Button>
                  );

                  if (label === 'Create germ tray' && createTrayState.disabled) {
                    return (
                      <Tooltip
                        key={label}
                        label={createTrayState.reason}
                        align="right"
                        className={
                          selectedRows.length > 0 && createTrayState.disabled
                            ? 'concep-test-search-create-germ-tray-tooltip'
                            : ''
                        }
                      >
                        <span>{button}</span>
                      </Tooltip>
                    );
                  }
                  if ((label === 'Test history' || label === 'Add activity') && !isActionButtonsEnabled) {
                    return (
                      <Tooltip key={label} label={disabledReason} align="right">
                        <span>{button}</span>
                      </Tooltip>
                    );
                  }
                  return button;
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
