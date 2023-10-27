import React, { useState } from 'react';

import { Row, Column, DataTableSkeleton } from '@carbon/react';
import { useQuery } from '@tanstack/react-query';
import { DateTime as luxon } from 'luxon';

import SeedlotTable from '../SeedlotTable';
import EmptySection from '../EmptySection';
import Subtitle from '../Subtitle';
import { SeedlotType, SeedlotRowType } from '../../types/SeedlotType';
import { useAuth } from '../../contexts/AuthContext';
import { getSeedlotByUser } from '../../api-service/seedlotAPI';
import { MONTH_DAY_YEAR } from '../../config/DateFormat';

import recentSeedlotsText from './constants';

import './styles.scss';

const RecentSeedlots = () => {
  const auth = useAuth();

  const userId = auth.user?.userId ?? '';

  const [seedlotData, setSeedlotData] = useState<SeedlotRowType[]>([]);

  const convertToTableObjs = (seedlots: SeedlotType[]) => {
    const converted: SeedlotRowType[] = [];

    seedlots.forEach((seedlot) => {
      converted.push({
        seedlotNumber: seedlot.id,
        seedlotClass: seedlot.geneticClass.geneticClassCode,
        seedlotSpecies: seedlot.vegetationCode,
        seedlotStatus: seedlot.seedlotStatus.description,
        createdAt: luxon.fromISO(seedlot.auditInformation.entryTimestamp).toFormat(MONTH_DAY_YEAR),
        lastUpdatedAt: luxon.fromISO(seedlot.auditInformation.updateTimestamp)
          .toFormat(MONTH_DAY_YEAR),
        approvedAt: seedlot.seedlotStatus.seedlotStatusCode === 'APP'
          ? luxon.fromISO(seedlot.seedlotStatus.updateTimestamp).toFormat(MONTH_DAY_YEAR)
          : '--'
      });
    });

    setSeedlotData(converted);
  };

  const getAllSeedlotQuery = useQuery({
    queryKey: ['seedlots', userId],
    queryFn: () => getSeedlotByUser(userId),
    onSuccess: (seedlots: SeedlotType[]) => convertToTableObjs(seedlots),
    enabled: userId.length > 0,
    refetchOnMount: true
  });

  const renderTable = () => {
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
