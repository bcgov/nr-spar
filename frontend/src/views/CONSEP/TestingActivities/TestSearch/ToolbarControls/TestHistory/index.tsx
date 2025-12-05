/* eslint-disable camelcase */
import React, {
  useState, useRef, useEffect, useMemo
} from 'react';
import { useMutation } from '@tanstack/react-query';
import { type MRT_TableInstance } from 'material-react-table';
import { InlineNotification } from '@carbon/react';
import { searchTestingActivities } from '../../../../../../api-service/consep/searchTestingActivitiesAPI';
import GenericTable from '../../../../../../components/GenericTable';
import { getTestHistoryTableColumns } from './constants';
import type {
  PaginatedTestingSearchResponseType,
  TestingSearchResponseType,
  PaginationInfoType
} from '../../../../../../types/consep/TestingSearchType';

const TestHistory = ({ table }: { table: MRT_TableInstance<any> }) => {
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const [searchResults, setSearchResults] = useState<TestingSearchResponseType[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfoType>({
    totalElements: 0,
    totalPages: 0,
    pageNumber: 0,
    pageSize: 10
  });
  const [alert, setAlert] = useState<{
    status: string;
    message: string;
  } | null>(null);
  const columns = useMemo(() => getTestHistoryTableColumns(), []);
  const historyData = useMemo(() => searchResults, [searchResults]);

  const searchMutation = useMutation({
    mutationFn: ({ page = 0, size = 20 }: { page?: number; size?: number }) => {
      const selectedRows = table.getSelectedRowModel()?.rows ?? [];
      const selectedSeedlots = selectedRows.map((row) => row.original.seedlotDisplay);
      return searchTestingActivities({ lotNumbers: selectedSeedlots }, page, size);
    },
    onMutate: () => {
      setAlert(null);
    },
    onSuccess: (data: PaginatedTestingSearchResponseType) => {
      setSearchResults(data.content);
      setPaginationInfo({
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        pageNumber: data.pageNumber,
        pageSize: data.pageSize
      });
    },
    onError: (error) => {
      setAlert({
        status: 'error',
        message: `Failed to get the test history: ${error.message}`
      });
    }
  });

  useEffect(() => {
    const selectedRows = table?.getSelectedRowModel()?.rows ?? [];
    const selectedSeedlots = selectedRows.map((row) => row.original.seedlotDisplay);
    if (selectedSeedlots.length > 0) {
      searchMutation.mutate({ page: 0, size: paginationInfo.pageSize });
    }
  }, []);

  const handlePageChange = (pageIndex: number, pageSize: number) => {
    searchMutation.mutate({ page: pageIndex, size: pageSize });
  };

  return (
    <div>
      {alert?.message && (
        <InlineNotification lowContrast kind={alert.status} subtitle={alert?.message} />
      )}
      <GenericTable
        columns={columns}
        data={historyData}
        enablePagination
        manualPagination
        pageIndex={paginationInfo.pageNumber}
        pageSize={paginationInfo.pageSize}
        rowCount={paginationInfo.totalElements}
        onPaginationChange={handlePageChange}
        isLoading={searchMutation.isPending}
        tableBodyRef={tableBodyRef}
      />
    </div>
  );
};

export default TestHistory;
