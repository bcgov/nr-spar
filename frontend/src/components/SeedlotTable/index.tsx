import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { DataTableSkeleton, Pagination } from '@carbon/react';
import { useQuery } from '@tanstack/react-query';

import EmptySection from '../EmptySection';
import AuthContext from '../../contexts/AuthContext';
import getVegCodes from '../../api-service/vegetationCodeAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../config/TimeUnits';
import { covertRawToDisplayObjArray } from '../../utils/SeedlotUtils';
import { getSeedlotToReview } from '../../api-service/tscAdminAPI';
import { getSeedlotByClientId } from '../../api-service/seedlotAPI';
import { SeedlotDisplayType, SeedlotType } from '../../types/SeedlotType';
import PaginationChangeType from '../../types/PaginationChangeType';
import { getMultiOptList } from '../../utils/MultiOptionsUtils';

import { TableText, PageSizesConfig } from './constants';
import { TableProps } from './definitions';
import SeedlotDataTable from './Table';

import './styles.scss';

const SeedlotTable = (
  {
    userId,
    isTscAdmin,
    isSortable,
    showSearch,
    showPagination,
    defaultPageSize
  }: TableProps
) => {
  const navigate = useNavigate();

  const { selectedClientRoles } = useContext(AuthContext);

  const [seedlotData, setSeedlotData] = useState<SeedlotDisplayType[]>([]);
  const [currPageNumber, setCurrPageNumber] = useState<number>(0);
  const [currPageSize, setCurrPageSize] = useState<number>(defaultPageSize ?? 10);

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: getVegCodes,
    select: (data) => getMultiOptList(data, true, true),
    staleTime: THREE_HOURS, // will not refetch for 3 hours
    cacheTime: THREE_HALF_HOURS // data is cached 3.5 hours then deleted
  });

  const convertToTableObjs = (seedlots: SeedlotType[]) => {
    if (vegCodeQuery.data) {
      const converted = covertRawToDisplayObjArray(seedlots, vegCodeQuery.data);
      setSeedlotData(converted);
    }
  };

  const queryKey = isTscAdmin
    ? ['seedlots', { pageNumber: currPageNumber, pageSize: currPageSize }]
    : ['seedlots', 'users', selectedClientRoles?.clientId, { pageNumber: currPageNumber, pageSize: currPageSize }];

  const getAllSeedlotQueryByUser = useQuery({
    queryKey,
    queryFn: () => (
      isTscAdmin
        ? getSeedlotToReview(currPageNumber, currPageSize)
        : getSeedlotByClientId(selectedClientRoles!.clientId, currPageNumber, currPageSize)
    ),
    enabled: userId.length > 0 && vegCodeQuery.isFetched,
    refetchOnMount: 'always'
  });

  useEffect(() => {
    if (
      (getAllSeedlotQueryByUser.isFetched || getAllSeedlotQueryByUser.isFetchedAfterMount)
      && getAllSeedlotQueryByUser.data
    ) {
      convertToTableObjs(getAllSeedlotQueryByUser.data.seedlots);
    }
  }, [getAllSeedlotQueryByUser.isFetched, getAllSeedlotQueryByUser.isFetchedAfterMount]);

  const handlePagination = (paginationObj: PaginationChangeType) => {
    setCurrPageNumber(paginationObj.page - 1); // index starts at 0 on java.
    setCurrPageSize(paginationObj.pageSize);
  };

  const tablePagination = () => (
    <Pagination
      className={`general-data-table-pagination ${isTscAdmin ? 'tsc-admin-background' : ''}`}
      page={currPageNumber + 1}
      pageSize={currPageSize}
      pageSizes={PageSizesConfig}
      itemsPerPageText=""
      totalItems={getAllSeedlotQueryByUser.data?.totalCount ?? 0}
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
  if (getAllSeedlotQueryByUser.isFetching || vegCodeQuery.isFetching) {
    return <DataTableSkeleton showToolbar={false} showHeader={false} />;
  }

  /**
   * If either query resulted in an error, show it.
   */
  if (vegCodeQuery.isError || getAllSeedlotQueryByUser.isError) {
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
                {getAllSeedlotQueryByUser.isError ? `Seedlot Request: ${getAllSeedlotQueryByUser.error}.` : null}
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
  if (getAllSeedlotQueryByUser.isFetched && getAllSeedlotQueryByUser.data?.seedlots.length) {
    return (
      <SeedlotDataTable
        seedlotData={seedlotData}
        navigate={navigate}
        isSortable={isSortable ?? false}
        showSearch={showSearch ?? false}
        showPagination={showPagination ?? false}
        tablePagination={tablePagination()}
        isTscAdmin={isTscAdmin}
      />
    );
  }

  /**
   * Fetched data successfully but it's empty.
   */
  if (getAllSeedlotQueryByUser.isFetched && !getAllSeedlotQueryByUser.data?.seedlots.length) {
    return (
      <div className="empty-recent-seedlots">
        <EmptySection
          pictogram={TableText.emptyPictogram}
          title={isTscAdmin ? TableText.admin.emptyTitle : TableText.emptyTitle}
          description={isTscAdmin ? TableText.admin.emptyDescription : TableText.emptyDescription}
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
