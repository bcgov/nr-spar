import React from 'react';
import { FlexGrid } from '@carbon/react';

import CollectionStep from '../../../SeedlotRegistrationSteps/CollectionStep';

const CollectionReviewEdit = () => (
  <FlexGrid className="sub-section-grid">
    <CollectionStep isReview />
  </FlexGrid>
);

export default CollectionReviewEdit;
