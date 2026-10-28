import React from 'react';

import CreateSeedlotClass from '../CreateSeedlotClass';
import { InitialAClassSeedlotRegFormData } from '../CreateSeedlotClass/constants';

const CreateAClass = () => (
  <CreateSeedlotClass
    geneticClass="A"
    title="Create A-class seedlot"
    activity="registerAClass"
    initialFormData={InitialAClassSeedlotRegFormData}
    errorTitle="Your application could not be created."
  />
);

export default CreateAClass;
