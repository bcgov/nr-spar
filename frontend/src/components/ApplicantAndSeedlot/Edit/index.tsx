import React, { useContext } from 'react';

import ClassAContext from '../../../views/Seedlot/SeedlotRegFormClassA/ClassAContext';
import EditAClassApplication from '../../../views/Seedlot/EditAClassApplication';

const ApplicantAndSeedlotEdit = () => {
  const {
    defaultAgencyObj, defaultCode, seedlotData, seedlotSpecies
  } = useContext(ClassAContext);

  return (
    <EditAClassApplication isReview />
  );
};

export default ApplicantAndSeedlotEdit;
