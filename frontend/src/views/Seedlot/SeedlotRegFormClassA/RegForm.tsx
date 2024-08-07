import React, { useContext } from 'react';

import CollectionStep from '../../../components/SeedlotRegistrationSteps/CollectionStep';
import OwnershipStep from '../../../components/SeedlotRegistrationSteps/OwnershipStep';
import InterimStep from '../../../components/SeedlotRegistrationSteps/InterimStep';
import OrchardStep from '../../../components/SeedlotRegistrationSteps/OrchardStep';
import ParentTreeStep from '../../../components/SeedlotRegistrationSteps/ParentTreeStep';
import ExtractionAndStorage from '../../../components/SeedlotRegistrationSteps/ExtractionAndStorageStep';

import ClassAContext from '../ContextContainerClassA/context';
import { RegFormProps } from '../ContextContainerClassA/definitions';

const RegForm = (
  {
    cleanParentTables
  }: RegFormProps
) => {
  const { formStep } = useContext(ClassAContext);

  switch (formStep) {
    // Collection
    case 0:
      return (
        <CollectionStep />
      );
    // Ownership
    case 1:
      return (
        <OwnershipStep />
      );
    // Interim Storage
    case 2:
      return (
        <InterimStep />
      );
    // Orchard
    case 3:
      return (
        <OrchardStep cleanParentTables={cleanParentTables} />
      );
    // Parent Tree and SMP
    case 4:
      return (
        <ParentTreeStep />
      );
    // Extraction and Storage
    case 5:
      return (
        <ExtractionAndStorage />
      );
    default:
      return null;
  }
};

export default RegForm;
