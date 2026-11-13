import React, { useContext } from 'react';
import { FlexGrid } from '@carbon/react';

import OwnershipStep from '../../../SeedlotRegistrationSteps/OwnershipStep';
import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';

const OwnershipReviewEdit = () => {
  const { fundingSourcesQuery, methodsOfPaymentQuery } = useContext(ClassAContext);

  return (
    <FlexGrid className="sub-section-grid">
      <OwnershipStep
        isReview
        fundingSourcesQuery={fundingSourcesQuery}
        methodsOfPaymentQuery={methodsOfPaymentQuery}
      />
    </FlexGrid>
  );
};

export default OwnershipReviewEdit;
