import React from 'react';
import { FlexGrid } from '@carbon/react';

import InterimStep from '../../../SeedlotRegistrationSteps/InterimStep';

const InterimReviewEdit = () => (
  <FlexGrid className="sub-section-grid">
    <InterimStep isReview />
  </FlexGrid>
);

export default InterimReviewEdit;
