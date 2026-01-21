/* eslint-disable camelcase */
import React, { useRef, useMemo } from 'react';
import { type MRT_TableInstance } from 'material-react-table';
import GenericTable from '../../../../../../components/GenericTable';
import { getAddActivityTableColumns } from './constants';
import type { TestingSearchResponseType } from '../../../../../../types/consep/TestingSearchType';

const AddActivity = ({
  table
}: {
  table: MRT_TableInstance<TestingSearchResponseType>;
}) => {
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const columns = useMemo(() => getAddActivityTableColumns(), []);

  return (
    <div>
      <GenericTable
        columns={columns}
        data={
          table.getSelectedRowModel()?.rows.map((item) => item.original) ?? []
        }
        tableBodyRef={tableBodyRef}
      />
    </div>
  );
};

export default AddActivity;
