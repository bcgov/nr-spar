import React, { useRef } from 'react';
import { Row, Column, Button } from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import GenericTable from '../../../../components/GenericTable';
import { getTestingActivityListColumns } from './constants';
import { data } from './data';

const TestListTable = () => {
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const deleteRow = () => {};

  const actions = [
    {
      label: 'Results',
      type: 'tertiary',
      action: () => {},
    },
    {
      label: 'Observations',
      type: 'tertiary',
      action: () => {},
    },
    {
      label: 'Test history',
      type: 'tertiary',
      action: () => {},
    },
    {
      label: 'Add activity',
      type: 'tertiary',
      action: () => {},
    },
    {
      label: 'Create germ tray',
      type: 'tertiary',
      action: () => {},
    },
    {
      label: 'Edit columns',
      icon: (
        <Icons.Column
          size={16}
          className='test-list-table-toolbar-button-icon'
        />
      ),
      type: 'primary',
      action: () => {},
    },
    {
      label: 'Export Data',
      icon: (
        <Icons.DocumentExport
          size={16}
          className='test-list-table-toolbar-button-icon'
        />
      ),
      type: 'primary',
      action: () => {},
    },
    {
      label: 'Filters',
      icon: (
        <Icons.Filter
          size={16}
          className='test-list-table-toolbar-button-icon'
        />
      ),
      type: 'primary',
      action: () => {},
    },
  ];

  return (
    <div className='test-list-table-container'>
      <Row className='test-list-table-toolbar'>
        <Column
          sm={6}
          md={6}
          lg={6}
          style={{ padding: '0.813rem 0.75rem 0.813rem 1.5rem' }}
        >
          Total search result
        </Column>
        <Column
          sm={10}
          md={10}
          lg={10}
          style={{
            paddingRight: '0rem',
            display: 'flex',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          {actions.map(({ label, icon, action, type }) => (
            <Button
              key={label}
              onClick={action}
              kind={type}
              aria-label={label}
              size='md'
              className='test-list-table-toolbar-button'
              style={{}}
            >
              {label}
              {icon}
            </Button>
          ))}
        </Column>
      </Row>

      <Row className='test-list-table'>
        <GenericTable
          columns={getTestingActivityListColumns()}
          data={data}
          enablePagination
          enableRowSelection
          // isLoading={isLoading}
          // isCompacted
          // enableSorting
          tableBodyRef={tableBodyRef}
        />
      </Row>
    </div>
  );
};

export default TestListTable;