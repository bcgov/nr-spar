/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';

import { AllStepData } from './definitions';

const ClassAContext = createContext({
  allStepData: {} as AllStepData,
  setStepData: (stepName: keyof AllStepData, stepData: any) => { }
});

export default ClassAContext;
