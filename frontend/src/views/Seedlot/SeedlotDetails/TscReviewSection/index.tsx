import React from 'react';
import { Button } from '@carbon/react';
import { SearchLocate } from '@carbon/icons-react';

import DetailSection from '../../../../components/DetailSection';

const TscReviewSection = () => (
  <DetailSection title="Review and approve this seedlot">
    <Button
      kind="tertiary"
      size="md"
      className="section-btn"
      renderIcon={SearchLocate}
    >
      Review seedlot
    </Button>
  </DetailSection>
);

export default TscReviewSection;
