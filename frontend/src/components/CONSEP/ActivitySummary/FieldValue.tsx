import React from 'react';
import { RadioButtonSkeleton } from '@carbon/react';
import { ActivitySummaryType } from '../../../types/ActivitySummaryType';

const renderFieldValue = (
  name: keyof ActivitySummaryType,
  isFetching: boolean,
  seedlot?: ActivitySummaryType
) => {
  if (isFetching) {
    return <RadioButtonSkeleton />;
  }
  if (seedlot) {
    return (
      <p className="activity-summary-info-value">
        {seedlot[name]}
      </p>
    );
  }
  return null;
};

export default renderFieldValue;
