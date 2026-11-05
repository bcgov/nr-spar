import React, {
  useState, useRef, useEffect, useMemo
} from 'react';
import { useMutation } from '@tanstack/react-query';
import { InlineNotification } from '@carbon/react';
import { searchTestingActivities } from '../../../../../../api-service/consep/searchTestingActivitiesAPI';
import GenericTable from '../../../../../../components/GenericTable';
import { getTestHistoryTableColumns } from './constants';
import type {
  PaginatedTestingSearchResponseType,
  TestingSearchResponseType,
  PaginationInfoType
} from '../../../../../../types/consep/TestingSearchType';

type TestHistoryProps = {
  selectedRows: TestingSearchResponseType[];
};

const TestHistory = ({ selectedRows }: TestHistoryProps) => {
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const [searchResults, setSearchResults] = useState<TestingSearchResponseType[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfoType>({
    totalElements: 0,
    totalPages: 0,
    pageNumber: 0,
    pageSize: 10
  });
  const [alert, setAlert] = useState<{
    status: 'error' | 'info' | 'success' | 'warning';
    message: string;
  } | null>(null);
  const columns = useMemo(() => getTestHistoryTableColumns(), []);

  const {
    mutate: fetchHistory,
    isPending
  } = useMutation({
    mutationFn: ({ page = 0, size = 10 }: { page?: number; size?: number }) => searchTestingActivities(
      { lotNumbers: selectedRows.map((row) => row.seedlotDisplay) },
      'actualEndDtTm',
      'asc',
      false,
      size,
      page
    ),
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
    fetchHistory({ page: 0, size: paginationInfo.pageSize });
  }, [fetchHistory, paginationInfo.pageSize]);

  const handlePageChange = (pageIndex: number, pageSize: number) => {
    fetchHistory({ page: pageIndex, size: pageSize });
  };

  return (
    <div>
      {alert?.message && (
        <InlineNotification
          lowContrast
          kind={alert.status}
          subtitle={alert?.message}
          style={{ marginBottom: '0.8rem' }}
        />
      )}
      <GenericTable
        columns={columns}
        data={searchResults}
        enablePagination
        manualPagination
        pageIndex={paginationInfo.pageNumber}
        pageSize={paginationInfo.pageSize}
        rowCount={paginationInfo.totalElements}
        onPaginationChange={handlePageChange}
        isLoading={isPending}
        tableBodyRef={tableBodyRef}
      />
    </div>
  );
};

export default TestHistory;
