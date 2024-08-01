import React from 'react';
import { FlexGrid } from '@carbon/react';

import ExtractionAndStorage from '../../../SeedlotRegistrationSteps/ExtractionAndStorageStep';

const ExtractionStorageReviewEdit = () => (
  <FlexGrid className="sub-section-grid">
    <ExtractionAndStorage
      isReview
    />
  </FlexGrid>
);

export default ExtractionStorageReviewEdit;
