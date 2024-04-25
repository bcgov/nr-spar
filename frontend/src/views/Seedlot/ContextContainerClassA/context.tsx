/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext } from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { SeedlotAClassSubmitType, SeedlotCalculationsResultsType, SeedlotType } from '../../../types/SeedlotType';

import { AllStepData, ProgressIndicatorConfig } from './definitions';
import { MutationStatusType } from '../../../types/QueryStatusType';
import { GenWorthValType, GeoInfoValType } from '../SeedlotReview/definitions';
import {
  InfoSectionConfigType, PrimitiveRowItem, RowItem, StrTypeRowItem
} from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/definitions';
import InfoDisplayObj from '../../../types/InfoDisplayObj';

export type ClassAContextType = {
  seedlotData: SeedlotType | undefined,
  calculatedValues: SeedlotCalculationsResultsType[],
  geoInfoVals: GeoInfoValType,
  genWorthVals: GenWorthValType,
  setGenWorthVal: (traitCode: keyof GenWorthValType, newVal: string) => void,
  setGeoInfoVal: (infoName: keyof GeoInfoValType, newVal: string) => void,
  seedlotNumber: string | undefined,
  allStepData: AllStepData,
  setStepData: (stepName: keyof AllStepData, stepData: any) => void,
  seedlotSpecies: MultiOptionsObj,
  formStep: number,
  setStep: (delta: number) => void,
  defaultAgencyObj: MultiOptionsObj,
  defaultCode: string,
  agencyOptions: MultiOptionsObj[],
  isFormSubmitted: boolean,
  isFormIncomplete: boolean,
  handleSaveBtn: () => void,
  saveStatus: string | null,
  saveDescription: string,
  lastSaveTimestamp: string,
  allStepCompleted: boolean,
  progressStatus: ProgressIndicatorConfig,
  cleanParentTables: Function,
  submitSeedlot: UseMutationResult<
    AxiosResponse<any, any>, unknown, SeedlotAClassSubmitType, unknown
  >,
  getSeedlotPayload: (
    allStepData: AllStepData,
    seedlotNumber: string | undefined
  ) => SeedlotAClassSubmitType,
  updateProgressStatus: (currentStepNum: number, prevStepNum: number) => void,
  saveProgressStatus: MutationStatusType,
  isFetchingData: boolean,
  genWorthInfoItems: Record<keyof RowItem, InfoDisplayObj[]>,
  setGenWorthInfoItems: React.Dispatch<
    React.SetStateAction<Record<keyof PrimitiveRowItem | keyof StrTypeRowItem, InfoDisplayObj[]>>
  >,
  weightedGwInfoItems: Record<keyof RowItem, InfoDisplayObj>,
  setWeightedGwInfoItems: React.Dispatch<
    React.SetStateAction<Record<keyof PrimitiveRowItem | keyof StrTypeRowItem, InfoDisplayObj>>
  >,
  popSizeAndDiversityConfig: InfoSectionConfigType,
  setPopSizeAndDiversityConfig: React.Dispatch<React.SetStateAction<InfoSectionConfigType>>
}

const ClassAContext = createContext<ClassAContextType>({
  seedlotData: {} as SeedlotType,
  calculatedValues: [],
  seedlotNumber: '',
  allStepData: {} as AllStepData,
  setStepData: (stepName: keyof AllStepData, stepData: any) => { },
  seedlotSpecies: EmptyMultiOptObj,
  formStep: 0,
  setStep: (delta: number) => { },
  defaultAgencyObj: EmptyMultiOptObj,
  defaultCode: '',
  agencyOptions: [] as MultiOptionsObj[],
  isFormSubmitted: false,
  isFormIncomplete: true,
  handleSaveBtn: () => { },
  saveStatus: null,
  saveDescription: '',
  lastSaveTimestamp: '',
  allStepCompleted: false,
  progressStatus: {} as ProgressIndicatorConfig,
  cleanParentTables: () => { },
  submitSeedlot: {} as UseMutationResult<
    AxiosResponse<any, any>, unknown, SeedlotAClassSubmitType, unknown
  >,
  getSeedlotPayload: () => ({} as SeedlotAClassSubmitType),
  updateProgressStatus: (currentStepNum: number, prevStepNum: number) => { },
  saveProgressStatus: 'idle',
  isFetchingData: false,
  geoInfoVals: {} as GeoInfoValType,
  genWorthVals: {} as GenWorthValType,
  setGenWorthVal: () => { },
  setGeoInfoVal: () => { },
  genWorthInfoItems: {} as Record<keyof RowItem, InfoDisplayObj[]>,
  setGenWorthInfoItems: () => { },
  weightedGwInfoItems: {} as Record<keyof RowItem, InfoDisplayObj>,
  setWeightedGwInfoItems: () => { },
  popSizeAndDiversityConfig: {} as InfoSectionConfigType,
  setPopSizeAndDiversityConfig: () => { }
});

export default ClassAContext;
