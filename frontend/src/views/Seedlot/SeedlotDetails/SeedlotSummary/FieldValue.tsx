import React from 'react';
import { RadioButtonSkeleton } from '@carbon/react';
import { SeedlotDisplayType } from '../../../../types/SeedlotType';

const renderFieldValue = (
  name: keyof SeedlotDisplayType,
  isFetching: boolean,
  seedlot?: SeedlotDisplayType
) => {
  if (isFetching) {
    return <RadioButtonSkeleton />;
  }
  if (seedlot) {
    return (
      <p className="seedlot-summary-info-value">
        {seedlot[name]}
      </p>
    );
  }
  return null;
};

export default renderFieldValue;
