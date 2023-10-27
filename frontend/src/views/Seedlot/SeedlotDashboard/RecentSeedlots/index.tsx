import React, { useState } from 'react';

import { Row, Column, DataTableSkeleton } from '@carbon/react';
import { useQuery } from '@tanstack/react-query';
import { DateTime as luxon } from 'luxon';

import SeedlotTable from '../../../../components/SeedlotTable';
import EmptySection from '../../../../components/EmptySection';
import Subtitle from '../../../../components/Subtitle';
import { SeedlotType, SeedlotRowType } from '../../../../types/SeedlotType';
import { useAuth } from '../../../../contexts/AuthContext';
import { getSeedlotByUser } from '../../../../api-service/seedlotAPI';
import { MONTH_DAY_YEAR } from '../../../../config/DateFormat';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../../config/TimeUnits';
import getVegCodes from '../../../../api-service/vegetationCodeAPI';
import VegCode from '../../../../types/VegetationCodeType';

import recentSeedlotsText from './constants';

import './styles.scss';

const RecentSeedlots = () => {
  const auth = useAuth();

  const userId = auth.user?.userId ?? '';

  const [seedlotData, setSeedlotData] = useState<SeedlotRowType[]>([]);

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes-raw'],
    queryFn: () => getVegCodes(true, true),
    staleTime: THREE_HOURS, // will not refetch for 3 hours
    cacheTime: THREE_HALF_HOURS // data is cached 3.5 hours then deleted
  });

  const getSpeciesNameByCode = (code: string): string => {
    const vegCodeData: VegCode[] = vegCodeQuery.data;
    const filtered = vegCodeData.filter((veg) => veg.code === code);
    if (filtered.length) {
      const capped = filtered[0].description.charAt(0).toUpperCase()
        + filtered[0].description.slice(1);
      return `${code} - ${capped}`;
    }
    return code;
  };

  const convertToTableObjs = (seedlots: SeedlotType[]) => {
    const converted: SeedlotRowType[] = [];

    seedlots.forEach((seedlot) => {
      converted.push({
        seedlotNumber: seedlot.id,
        seedlotClass: `${seedlot.geneticClass.geneticClassCode}-class`,
        seedlotSpecies: getSpeciesNameByCode(seedlot.vegetationCode),
        seedlotStatus: seedlot.seedlotStatus.description,
        createdAt: luxon.fromISO(seedlot.auditInformation.entryTimestamp).toFormat(MONTH_DAY_YEAR),
        lastUpdatedAt: luxon.fromISO(seedlot.auditInformation.updateTimestamp)
          .toFormat(MONTH_DAY_YEAR),
        approvedAt: seedlot.seedlotStatus.seedlotStatusCode === 'APP'
          ? luxon.fromISO(seedlot.seedlotStatus.updateTimestamp).toFormat(MONTH_DAY_YEAR)
          : '--'
      });
    });

    // Show most recently updated first
    converted.sort((a, b) => {
      if (luxon.fromFormat(a.lastUpdatedAt, MONTH_DAY_YEAR)
        < luxon.fromFormat(b.lastUpdatedAt, MONTH_DAY_YEAR)) {
        return 1;
      }
      if (luxon.fromFormat(a.lastUpdatedAt, MONTH_DAY_YEAR)
        > luxon.fromFormat(b.lastUpdatedAt, MONTH_DAY_YEAR)) {
        return -1;
      }
      return 0;
    });

    setSeedlotData(converted);
  };

  const getAllSeedlotQuery = useQuery({
    queryKey: ['seedlots', userId],
    queryFn: () => getSeedlotByUser(userId),
    onSuccess: (seedlots: SeedlotType[]) => convertToTableObjs(seedlots),
    enabled: userId.length > 0 && vegCodeQuery.isFetched,
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
