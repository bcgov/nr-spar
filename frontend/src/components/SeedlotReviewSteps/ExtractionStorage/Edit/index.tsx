import React from 'react';
import { FlexGrid } from '@carbon/react';

import ExtractionAndStorage from '../../../SeedlotRegistrationSteps/ExtractionAndStorageStep';
import { tscAgencyObj, tscLocationCode } from '../../../../views/Seedlot/ContextContainerClassA/constants';

const ExtractionStorageReviewEdit = () => (
  <FlexGrid className="sub-section-grid">
    <ExtractionAndStorage
      defaultAgency={tscAgencyObj}
      defaultCode={tscLocationCode}
      isReview
    />
  </FlexGrid>
);

export default ExtractionStorageReviewEdit;
