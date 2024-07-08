/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext } from 'react';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import {
  RichSeedlotType, SeedlotAClassSubmitType,
  SeedlotCalculationsResultsType, SeedlotProgressPayloadType, SeedlotType
} from '../../../types/SeedlotType';

import { AllStepData, AreaOfUseDataType, ProgressIndicatorConfig } from './definitions';
import { MutationStatusType } from '../../../types/QueryStatusType';
import { GenWorthValType, GeoInfoValType } from '../SeedlotReview/definitions';
import {
  InfoSectionConfigType, MeanGeomInfoSectionConfigType, PrimitiveRowItem, RowItem, StrTypeRowItem
} from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/definitions';
import InfoDisplayObj from '../../../types/InfoDisplayObj';
import { SummarySectionConfig } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/constants';
import { StringInputType } from '../../../types/FormInputType';

export type ClassAContextType = {
  seedlotData: SeedlotType | undefined,
  richSeedlotData: RichSeedlotType | undefined,
  calculatedValues: SeedlotCalculationsResultsType[],
  geoInfoVals: GeoInfoValType,
  genWorthVals: GenWorthValType,
  setGenWorthVal: (traitCode: keyof GenWorthValType, newVal: string) => void,
  setGeoInfoVals: React.Dispatch<React.SetStateAction<GeoInfoValType>>,
  setGeoInfoInputObj: (infoName: keyof GeoInfoValType, inputObj: StringInputType) => void,
  seedlotNumber: string | undefined,
  allStepData: AllStepData,
  setStepData: (stepName: keyof AllStepData, stepData: any) => void,
  seedlotSpecies: MultiOptionsObj,
  formStep: number,
  setStep: (delta: number) => void,
  defaultAgencyObj: MultiOptionsObj,
  defaultCode: string,
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
  setPopSizeAndDiversityConfig: React.Dispatch<React.SetStateAction<InfoSectionConfigType>>,
  summaryConfig: typeof SummarySectionConfig,
  setSummaryConfig: React.Dispatch<React.SetStateAction<typeof SummarySectionConfig>>,
  meanGeomInfos: MeanGeomInfoSectionConfigType,
  setMeanGeomInfos: React.Dispatch<React.SetStateAction<MeanGeomInfoSectionConfigType>>,
  areaOfUseData: AreaOfUseDataType,
  setAreaOfUseData: React.Dispatch<React.SetStateAction<AreaOfUseDataType>>,
  isCalculatingPt: boolean,
  setIsCalculatingPt: Function,
  getFormDraftQuery: UseQueryResult<SeedlotProgressPayloadType, unknown>
}

const ClassAContext = createContext<ClassAContextType>({
  seedlotData: {} as SeedlotType,
  richSeedlotData: {} as RichSeedlotType,
  calculatedValues: [],
  seedlotNumber: '',
  allStepData: {} as AllStepData,
  setStepData: (stepName: keyof AllStepData, stepData: any) => { },
  seedlotSpecies: EmptyMultiOptObj,
  formStep: 0,
  setStep: (delta: number) => { },
  defaultAgencyObj: EmptyMultiOptObj,
  defaultCode: '',
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
  setGeoInfoVals: () => { },
  setGeoInfoInputObj: () => { },
  genWorthInfoItems: {} as Record<keyof RowItem, InfoDisplayObj[]>,
  setGenWorthInfoItems: () => { },
  weightedGwInfoItems: {} as Record<keyof RowItem, InfoDisplayObj>,
  setWeightedGwInfoItems: () => { },
  popSizeAndDiversityConfig: {} as InfoSectionConfigType,
  setPopSizeAndDiversityConfig: () => { },
  summaryConfig: {} as typeof SummarySectionConfig,
  setSummaryConfig: () => { },
  meanGeomInfos: {} as MeanGeomInfoSectionConfigType,
  setMeanGeomInfos: () => { },
  areaOfUseData: {} as AreaOfUseDataType,
  setAreaOfUseData: () => { },
  isCalculatingPt: false,
  setIsCalculatingPt: () => { },
  getFormDraftQuery: {} as UseQueryResult<SeedlotProgressPayloadType, unknown>
});

export default ClassAContext;
