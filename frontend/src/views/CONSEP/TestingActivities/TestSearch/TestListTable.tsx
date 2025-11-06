import React, { useRef } from 'react';
import { Row, Column, Button } from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import GenericTable from '../../../../components/GenericTable';
import { getTestingActivityListColumns } from './constants';
import type {
  TestingSearchResponseType,
  PaginationInfoType
} from '../../../../types/consep/TestingSearchType';

type TestListTableProp = {
  data: TestingSearchResponseType[];
  paginationInfo: PaginationInfoType;
  isLoading?: boolean;
  onPageChange?: (pageIndex: number, pageSize: number) => void;
};

const TestListTable = ({
  data,
  isLoading = false,
  paginationInfo,
  onPageChange = () => {}
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
      label: 'Edit columns',
      icon: <Icons.Column size={16} className="concep-test-search-table-toolbar-button-icon" />,
      type: 'primary',
      action: () => {}
    },
    {
      label: 'Export Data',
      icon: (
        <Icons.DocumentExport size={16} className="concep-test-search-table-toolbar-button-icon" />
      ),
      type: 'primary',
      action: () => {}
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
      <Row className="concep-test-search-table-toolbar">
        <Column sm={2} md={3} lg={6} className="concep-test-search-table-title">
          {`Total search result: ${paginationInfo.totalElements}`}
        </Column>
        <Column
          sm={2}
          md={5}
          lg={10}
          className="concep-test-search-table-toolbar"
        >
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
        </Column>
      </Row>

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
          isLoading={isLoading}
          tableBodyRef={tableBodyRef}
        />
      </Row>
    </div>
  );
};

export default TestListTable;
