import React, { useMemo } from 'react';
import { ActivitySummaryType } from '../../../types/consep/TestingActivityType';
import SummaryGrid, { type SummaryColumn } from '../SummaryGrid';
import './styles.scss';

interface ActivitySummaryProps {
  item?: ActivitySummaryType;
  isFetching: boolean;
}

const ActivitySummary = ({ item, isFetching }: ActivitySummaryProps) => {
  const columns = useMemo<SummaryColumn<ActivitySummaryType>[]>(() => ([
    {
      key: 'activity',
      label: 'Activity',
      renderValue: (data) => data?.activity ?? '',
      emphasize: true
    },
    {
      key: 'lot',
      label: 'Lot number',
      renderValue: (data) => (
        !data?.seedlotNumber || data.seedlotNumber === '00000'
          ? data?.familyLotNumber ?? ''
          : data.seedlotNumber
      )
    },
    {
      key: 'requestId',
      label: 'Request ID',
      renderValue: (data) => data?.requestId ?? ''
    },
    {
      key: 'species',
      label: 'Species',
      renderValue: (data) => data?.speciesAndClass ?? ''
    },
    {
      key: 'testResult',
      label: 'Test result',
      renderValue: (data) => (
        data?.testResult ? Number(data.testResult).toFixed(1) : ''
      ),
      emphasize: true
    }
  ]), []);

  return (
    <SummaryGrid
      item={item}
      isFetching={isFetching}
      columns={columns}
    />
  );
};

export default ActivitySummary;
