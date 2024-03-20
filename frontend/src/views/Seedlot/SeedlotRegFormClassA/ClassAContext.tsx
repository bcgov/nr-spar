/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';

import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import MultiOptionsObj from '../../../types/MultiOptionsObject';

import { AllStepData } from './definitions';

const ClassAContext = createContext({
  allStepData: {} as AllStepData,
  setStepData: (stepName: keyof AllStepData, stepData: any) => { },
  seedlotSpecies: EmptyMultiOptObj,
  formStep: 0,
  setStep: (delta: number) => { },
  defaultAgencyObj: EmptyMultiOptObj,
  defaultCode: '',
  agencyOptions: [] as MultiOptionsObj[],
  isFormSubmitted: false
});

export default ClassAContext;
