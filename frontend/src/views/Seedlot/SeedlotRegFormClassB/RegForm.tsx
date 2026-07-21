import React, { useContext } from 'react';

import BClassCollectionStep from '../../../components/SeedlotRegistrationSteps/BClassCollectionStep';
import OwnershipStep from '../../../components/SeedlotRegistrationSteps/OwnershipStep';
import InterimStep from '../../../components/SeedlotRegistrationSteps/InterimStep';
import ExtractionAndStorage from '../../../components/SeedlotRegistrationSteps/ExtractionAndStorageStep';

import ClassBContext from '../ContextContainerClassB/context';

const RegForm = () => {
  const { formStep } = useContext(ClassBContext);

  switch (formStep) {
    case 0:
      return <BClassCollectionStep />;
    case 1:
      return <OwnershipStep />;
    case 2:
      return <InterimStep />;
    case 3:
      return <ExtractionAndStorage />;
    default:
      return null;
  }
};

export default RegForm;
