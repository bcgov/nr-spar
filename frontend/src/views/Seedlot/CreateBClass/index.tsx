import React from 'react';

import CreateSeedlotClass from '../CreateSeedlotClass';
import { InitialBClassSeedlotRegFormData } from '../CreateSeedlotClass/constants';

const CreateBClass = () => (
  <CreateSeedlotClass
    geneticClass="B"
    title="Create B class seedlot"
    subtitle="Register a seedlot which has been collected from a natural stand."
    activity="registerBClass"
    initialFormData={InitialBClassSeedlotRegFormData}
    errorTitle="Your seedlot could not be created."
  />
);

export default CreateBClass;
