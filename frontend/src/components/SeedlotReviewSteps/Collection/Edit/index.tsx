import React from 'react';
import { FlexGrid } from '@carbon/react';

import CollectionStep from '../../../SeedlotRegistrationSteps/CollectionStep';
import Divider from '../../../Divider';
import GeoInfo from '../GeoInfo';

const CollectionReviewEdit = () => (
  <FlexGrid className="sub-section-grid">
    <CollectionStep isReview />

    <Divider />

    <GeoInfo />
  </FlexGrid>
);

export default CollectionReviewEdit;
