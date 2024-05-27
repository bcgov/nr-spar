import React from 'react';
import { FlexGrid } from '@carbon/react';

import OrchardStep from '../../../SeedlotRegistrationSteps/OrchardStep';

const OrchardReviewEdit = () => (
  <FlexGrid className="sub-section-grid">
    <OrchardStep cleanParentTables={() => null} isReview />
  </FlexGrid>
);

export default OrchardReviewEdit;
