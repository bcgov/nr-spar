import { createContext } from 'react';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import {
  SeedlotBClassProgressPayloadType,
  RichSeedlotType,
  SeedlotBClassSubmitType,
  SeedlotType
} from '../../../types/SeedlotType';
import { MutationStatusType } from '../../../types/QueryStatusType';
import MultiOptionsObj from '../../../types/MultiOptionsObject';

import {
  BClassAllStepData,
  BClassProgressIndicatorConfig
} from './definitions';

export type ClassBContextType = {
  seedlotData: SeedlotType | undefined,
  richSeedlotData: RichSeedlotType | undefined,
  seedlotNumber: string | undefined,
  allStepData: BClassAllStepData,
  setStepData: (stepName: keyof BClassAllStepData, stepData: unknown) => void,
  formStep: number,
  setStep: (delta: number) => void,
  defaultClientNumber: string,
  defaultCode: string,
  isFormSubmitted: boolean,
  isFormIncomplete: boolean,
  isFormReady: boolean,
  handleSaveBtn: () => void,
  saveStatus: string | null,
  saveDescription: string,
  lastSaveTimestamp: string,
  allStepCompleted: boolean,
  progressStatus: BClassProgressIndicatorConfig,
  updateProgressStatus: (currentStepNum: number, prevStepNum: number) => void,
  saveProgressStatus: MutationStatusType,
  isFetchingData: boolean,
  getFormDraftQuery: UseQueryResult<SeedlotBClassProgressPayloadType, unknown>,
  submitSeedlot: UseMutationResult<
    AxiosResponse<unknown, unknown>, unknown, SeedlotBClassSubmitType, unknown
  >,
  getBClassSeedlotPayload: (
    allStepData: BClassAllStepData,
    richSeedlotData?: RichSeedlotType
  ) => SeedlotBClassSubmitType,
  fundingSourcesQuery: UseQueryResult<MultiOptionsObj[], unknown>,
  methodsOfPaymentQuery: UseQueryResult<MultiOptionsObj[], unknown>
};

const ClassBContext = createContext<ClassBContextType>({
  seedlotData: undefined,
  richSeedlotData: undefined,
  seedlotNumber: undefined,
  allStepData: {} as BClassAllStepData,
  setStepData: () => { },
  formStep: 0,
  setStep: () => { },
  defaultClientNumber: '',
  defaultCode: '',
  isFormSubmitted: false,
  isFormIncomplete: true,
  isFormReady: false,
  handleSaveBtn: () => { },
  saveStatus: null,
  saveDescription: '',
  lastSaveTimestamp: '',
  allStepCompleted: false,
  progressStatus: {} as BClassProgressIndicatorConfig,
  updateProgressStatus: () => { },
  saveProgressStatus: 'idle',
  isFetchingData: false,
  getFormDraftQuery: {} as UseQueryResult<SeedlotBClassProgressPayloadType, unknown>,
  submitSeedlot: {} as UseMutationResult<
    AxiosResponse<unknown, unknown>, unknown, SeedlotBClassSubmitType, unknown
  >,
  getBClassSeedlotPayload: () => ({} as SeedlotBClassSubmitType),
  fundingSourcesQuery: {} as UseQueryResult<MultiOptionsObj[], unknown>,
  methodsOfPaymentQuery: {} as UseQueryResult<MultiOptionsObj[], unknown>
});

export default ClassBContext;
