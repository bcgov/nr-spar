import React, { useState } from 'react';

import { Row, Column, DataTableSkeleton } from '@carbon/react';
import { useQuery } from '@tanstack/react-query';

import SeedlotTable from '../../../../components/SeedlotTable';
import EmptySection from '../../../../components/EmptySection';
import Subtitle from '../../../../components/Subtitle';
import { SeedlotType, SeedlotDisplayType } from '../../../../types/SeedlotType';
import { useAuth } from '../../../../contexts/AuthContext';
import { getSeedlotByUser } from '../../../../api-service/seedlotAPI';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';
import getVegCodes from '../../../../api-service/vegetationCodeAPI';
import { covertRawToDisplayObjArray } from '../../../../utils/SeedlotUtils';

import recentSeedlotsText from './constants';

import './styles.scss';

const RecentSeedlots = () => {
  const auth = useAuth();

  const userId = auth.user?.userId ?? '';

  const [seedlotData, setSeedlotData] = useState<SeedlotDisplayType[]>([]);

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
    queryKey: ['seedlots', 'users', userId],
    queryFn: () => getSeedlotByUser(userId),
    onSuccess: (seedlots: SeedlotType[]) => convertToTableObjs(seedlots),
    enabled: userId.length > 0 && vegCodeQuery.isFetched,
    refetchOnMount: true
  });

  const renderTable = () => {
    if (getAllSeedlotQuery.isError || vegCodeQuery.isError) {
      return (
        <div className="empty-recent-seedlots">
          <EmptySection
            icon={recentSeedlotsText.errorIcon}
            title={recentSeedlotsText.errorTitle}
            description={
              (
                <>
                  {`${recentSeedlotsText.errorDescription}.`}
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

    if (getAllSeedlotQuery.isSuccess && seedlotData.length > 0) {
      return (
        <SeedlotTable seedlots={seedlotData} />
      );
    }

    return (
      <div className="empty-recent-seedlots">
        <EmptySection
          pictogram={recentSeedlotsText.emptyPictogram}
          title={recentSeedlotsText.emptyTitle}
          description={recentSeedlotsText.emptyDescription}
        />
      </div>
    );
  };

  return (
    <Row className="recent-seedlots">
      <Column sm={4} className="recent-seedlots-title">
        <h2>{recentSeedlotsText.tableTitle}</h2>
        <Subtitle text={recentSeedlotsText.tableSubtitle} className="recent-seedlots-subtitle" />
      </Column>
      <Column sm={4} className="recent-seedlots-table">
        {
          getAllSeedlotQuery.isFetching
            ? <DataTableSkeleton showToolbar={false} />
            : renderTable()
        }
      </Column>
    </Row>
  );
};

export default RecentSeedlots;
