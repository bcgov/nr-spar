import React from 'react';
import { FlexGrid } from '@carbon/react';

import OwnershipStep from '../../../SeedlotRegistrationSteps/OwnershipStep';

const OwnershipReviewEdit = () => (
  <FlexGrid className="sub-section-grid">
    <OwnershipStep isReview />
  </FlexGrid>
);

export default OwnershipReviewEdit;
