import React from 'react';
import { RadioButtonSkeleton } from '@carbon/react';
import { ActivitySummaryType } from '../../../types/ActivitySummaryType';

const renderFieldValue = (
  name: keyof ActivitySummaryType,
  isFetching: boolean,
  items?: ActivitySummaryType
) => {
  if (isFetching) {
    return <RadioButtonSkeleton />;
  }
  if (items) {
    return (
      <p className="activity-summary-info-value">
        {items[name]}
      </p>
    );
  }
  return null;
};

export default renderFieldValue;
