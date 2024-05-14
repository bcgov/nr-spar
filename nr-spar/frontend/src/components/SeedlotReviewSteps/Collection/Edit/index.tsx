import React from 'react';
import { FlexGrid } from '@carbon/react';

import CollectionStep from '../../../SeedlotRegistrationSteps/CollectionStep';
import Divider from '../../../Divider';
import GeoInfo from '../GeoInfo';
import GenWorth from '../GenWorth';

const CollectionReviewEdit = () => (
  <FlexGrid className="sub-section-grid">
    <CollectionStep isReview />

    <Divider />

    <GeoInfo />

    <Divider />

    <GenWorth />

  </FlexGrid>
);

export default CollectionReviewEdit;
