import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DataTableSkeleton, Pagination } from '@carbon/react';
import { useQuery } from '@tanstack/react-query';

import EmptySection from '../EmptySection';
import getVegCodes from '../../api-service/vegetationCodeAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';
import { covertRawToDisplayObjArray } from '../../utils/SeedlotUtils';
import { getSeedlotByUser } from '../../api-service/seedlotAPI';
import { SeedlotDisplayType, SeedlotType } from '../../types/SeedlotType';
import PaginationChangeType from '../../types/PaginationChangeType';

import { TableText, PageSizesConfig } from './constants';
import { TableProps } from './definitions';
import SeedlotDataTable from './Table';

import './styles.scss';

const SeedlotTable = (
  {
    userId,
    isSortable,
    showSearch,
    showPagination,
    defaultPageSize
  }: TableProps
) => {
  const navigate = useNavigate();

  const [seedlotData, setSeedlotData] = useState<SeedlotDisplayType[]>([]);
  const [currPageNumber, setCurrPageNumber] = useState<number>(0);
  const [currPageSize, setCurrPageSize] = useState<number>(defaultPageSize ?? 10);

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: () => getVegCodes(true),
    staleTime: THREE_HOURS, // will not refetch for 3 hours
    cacheTime: THREE_HALF_HOURS // data is cached 3.5 hours then deleted
  });

  const convertToTableObjs = (seedlots: SeedlotType[]) => {
    if (vegCodeQuery.data) {
      const converted = covertRawToDisplayObjArray(seedlots, vegCodeQuery.data);
      setSeedlotData(converted);
    }
  };

  const getAllSeedlotQuery = useQuery({
    queryKey: ['seedlots', 'users', userId, { pageNumber: currPageNumber, pageSize: currPageSize }],
    queryFn: () => getSeedlotByUser(userId, currPageNumber, currPageSize),
    enabled: userId.length > 0 && vegCodeQuery.isFetched,
    refetchOnMount: 'always'
  });

  useEffect(() => {
    if (
      (getAllSeedlotQuery.isFetched || getAllSeedlotQuery.isFetchedAfterMount)
      && getAllSeedlotQuery.data
    ) {
      convertToTableObjs(getAllSeedlotQuery.data.seedlots);
    }
  }, [getAllSeedlotQuery.isFetched, getAllSeedlotQuery.isFetchedAfterMount]);

  const handlePagination = (paginationObj: PaginationChangeType) => {
    setCurrPageNumber(paginationObj.page - 1); // index starts at 0 on java.
    setCurrPageSize(paginationObj.pageSize);
  };

  const tablePagination = () => (
    <Pagination
      className="seedlot-data-table-pagination"
      page={currPageNumber + 1}
      pageSize={currPageSize}
      pageSizes={PageSizesConfig}
      itemsPerPageText=""
      totalItems={getAllSeedlotQuery.data?.totalCount ?? 0}
      onChange={
        (paginationObj: PaginationChangeType) => {
          handlePagination(paginationObj);
        }
      }
    />
  );
  /**
   * Show skeleton while fetching.
   */
  if (getAllSeedlotQuery.isFetching || vegCodeQuery.isFetching) {
    return <DataTableSkeleton showToolbar={false} />;
  }

  /**
   * If either query resulted in an error, show it.
   */
  if (vegCodeQuery.isError || getAllSeedlotQuery.isError) {
    return (
      <div className="empty-recent-seedlots">
        <EmptySection
          icon={TableText.errorIcon}
          title={TableText.errorTitle}
          description={
            (
              <>
                {`${TableText.errorDescription}.`}
                <br />
                {getAllSeedlotQuery.isError ? `Seedlot Request: ${getAllSeedlotQuery.error}.` : null}
                <br />
                {vegCodeQuery.isError ? `VegCode Request: ${vegCodeQuery.error}` : null}
              </>
            )
          }
        />
      </div>
    );
  }

  /**
   * Display fetched data
   */
  if (getAllSeedlotQuery.isFetched && getAllSeedlotQuery.data?.seedlots.length) {
    return (
      <SeedlotDataTable
        seedlotData={seedlotData}
        navigate={navigate}
        isSortable={isSortable ?? false}
        showSearch={showSearch ?? false}
        showPagination={showPagination ?? false}
        tablePagination={tablePagination()}
      />
    );
  }

  /**
   * Fetched data successfully but it's empty.
   */
  if (getAllSeedlotQuery.isFetched && !getAllSeedlotQuery.data?.seedlots.length) {
    return (
      <div className="empty-recent-seedlots">
        <EmptySection
          pictogram={TableText.emptyPictogram}
          title={TableText.emptyTitle}
          description={TableText.emptyDescription}
        />
      </div>
    );
  }

  /**
   * Default case handler
   */
  return (
    <div className="empty-recent-seedlots">
      <EmptySection
        icon={TableText.unknownIcon}
        title={TableText.unknownTitle}
        description={TableText.errorDescription}
      />
    </div>
  );
};

export default SeedlotTable;
