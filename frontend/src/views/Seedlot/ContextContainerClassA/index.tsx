import React, {
  useEffect, useMemo, useRef, useState
} from 'react';
import {
  useNavigate, useParams, useSearchParams, useLocation
} from 'react-router-dom';
import {
  useMutation, useQueries, useQuery, useQueryClient
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { DateTime } from 'luxon';

import {
  getAClassSeedlotDraft, getAClassSeedlotFullForm, getSeedlotById,
  putAClassSeedlot, putAClassSeedlotProgress
} from '../../../api-service/seedlotAPI';
import getVegCodes from '../../../api-service/vegetationCodeAPI';
import { getForestClientByNumberOrAcronym } from '../../../api-service/forestClientsAPI';
import getFundingSources from '../../../api-service/fundingSourcesAPI';
import getMethodsOfPayment from '../../../api-service/methodsOfPaymentAPI';
import getGameticMethodology from '../../../api-service/gameticMethodologyAPI';
import { getOrchardByVegCode } from '../../../api-service/orchardAPI';
import {
  TEN_SECONDS, THREE_HALF_HOURS, THREE_HOURS, FIVE_SECONDS
} from '../../../config/TimeUnits';

import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { SeedlotAClassSubmitType, SeedlotCalculationsResultsType, SeedlotProgressPayloadType } from '../../../types/SeedlotType';
import { ForestClientType } from '../../../types/ForestClientTypes/ForestClientType';
import { generateDefaultRows } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/utils';
import {
  DEFAULT_MIX_PAGE_ROWS, PopSizeAndDiversityConfig, SummarySectionConfig, defaultMeanGeomConfig
} from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/constants';
import { addParamToPath } from '../../../utils/PathUtils';
import { getMultiOptList } from '../../../utils/MultiOptionsUtils';
import ROUTES from '../../../routes/constants';
import { GenWorthValType, GeoInfoValType } from '../SeedlotReview/definitions';
import { INITIAL_GEN_WORTH_VALS, INITIAL_GEO_INFO_VALS } from '../SeedlotReview/constants';
import { MeanGeomInfoSectionConfigType, RowItem } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/definitions';
import InfoDisplayObj from '../../../types/InfoDisplayObj';

import ClassAContext, { ClassAContextType } from './context';
import {
  AllStepData, AreaOfUseDataType, ClientAgenciesByCode,
  ProgressIndicatorConfig, ProgressStepStatus
} from './definitions';
import {
  initProgressBar, getSpeciesOptionByCode, validateCollectionStep, verifyCollectionStepCompleteness,
  validateOwnershipStep, verifyOwnershipStepCompleteness, validateInterimStep,
  verifyInterimStepCompleteness, validateOrchardStep, verifyOrchardStepCompleteness,
  validateExtractionStep, verifyExtractionStepCompleteness, validateParentStep,
  verifyParentStepCompleteness, checkAllStepsCompletion, getSeedlotPayload,
  initEmptySteps, resDataToState,
  fillAreaOfUseData,
  fillGeoVals
} from './utils';
import {
  MAX_EDIT_BEFORE_SAVE, initialAreaOfUseData,
  initialProgressConfig, smartSaveText, stepMap
} from './constants';

import './styles.scss';
import { StringInputType } from '../../../types/FormInputType';

type props = {
  children: React.ReactNode
}

const ContextContainerClassA = ({ children }: props) => {
  const navigate = useNavigate();
  const { seedlotNumber } = useParams();
  const [searchParams] = useSearchParams();
  const stepParam = searchParams.get('step');

  const isPageRendered = useRef(false);

  const [formStep, setFormStep] = useState<number>(
    stepParam
      ? (parseInt(stepParam, 10) - 1)
      : 0
  );
  const [
    progressStatus,
    setProgressStatus
  ] = useState<ProgressIndicatorConfig>(() => initProgressBar(formStep, initialProgressConfig));

  const [allStepCompleted, setAllStepCompleted] = useState<boolean>(false);
  const [lastSaveTimestamp, setLastSaveTimestamp] = useState<string>(() => DateTime.now().toISO());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveDescription, setSaveDescription] = useState<string>('Save changes');
  const [calculatedValues, setCalculatedValues] = useState<SeedlotCalculationsResultsType[]>([]);
  const numOfEdit = useRef(0);
  const [
    genWorthInfoItems,
    setGenWorthInfoItems
  ] = useState<Record<keyof RowItem, InfoDisplayObj[]>>(
    {} as Record<keyof RowItem, InfoDisplayObj[]>
  );
  const [
    weightedGwInfoItems,
    setWeightedGwInfoItems
  ] = useState<Record<keyof RowItem, InfoDisplayObj>>({} as Record<keyof RowItem, InfoDisplayObj>);
  const [popSizeAndDiversityConfig, setPopSizeAndDiversityConfig] = useState(
    () => structuredClone(PopSizeAndDiversityConfig)
  );
  const [summaryConfig, setSummaryConfig] = useState<typeof SummarySectionConfig>(
    () => structuredClone(SummarySectionConfig)
  );
  const [meanGeomInfos, setMeanGeomInfos] = useState<MeanGeomInfoSectionConfigType>(
    () => structuredClone(defaultMeanGeomConfig)
  );
  const [areaOfUseData, setAreaOfUseData] = useState<AreaOfUseDataType>(() => initialAreaOfUseData);

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: () => getVegCodes(),
    select: (data) => getMultiOptList(data, true, true),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const seedlotQuery = useQuery({
    queryKey: ['seedlots', seedlotNumber],
    queryFn: () => getSeedlotById(seedlotNumber ?? ''),
    onError: (err: AxiosError) => {
      if (err.response?.status === 404) {
        navigate(ROUTES.FOUR_OH_FOUR);
      }
    },
    enabled: vegCodeQuery.isFetched,
    refetchOnWindowFocus: false
  });

  /**
   * Determine if the form is incomplete or pending,
   * if true then users can save a draft of their forms,
   * otherwise the form will be populated with data directly from the seedlot table.
   */
  const isFormIncomplete = seedlotQuery.data?.seedlot.seedlotStatus.seedlotStatusCode === 'PND' || seedlotQuery.data?.seedlot.seedlotStatus.seedlotStatusCode === 'INC';

  /**
   * Determine if the form is already submitted for review,
   * if true, it is necessary to fetch all of the seedlot's data
   * and use it to fill the form
   */
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const [geoInfoVals, setGeoInfoVals] = useState<GeoInfoValType>(() => INITIAL_GEO_INFO_VALS);

  useEffect(() => {
    if (seedlotQuery.status === 'success') {
      const seedlotStatusCode = seedlotQuery.data?.seedlot.seedlotStatus.seedlotStatusCode;
      if (seedlotStatusCode !== 'PND' && seedlotStatusCode !== 'INC') {
        setIsFormSubmitted(true);
      }

      if (seedlotQuery.data) {
        fillGeoVals(setGeoInfoVals, seedlotQuery.data);
      }
    }
  }, [seedlotQuery.status]);

  const getAllSeedlotInfoQuery = useQuery({
    queryKey: ['seedlot-full-form', seedlotNumber],
    queryFn: () => getAClassSeedlotFullForm(seedlotNumber ?? ''),
    onError: (err: AxiosError) => {
      if (err.response?.status === 404) {
        navigate(ROUTES.FOUR_OH_FOUR);
      }
    },
    enabled: isFormSubmitted,
    refetchOnWindowFocus: false
  });

  // Initialize all step's state here
  const [allStepData, setAllStepData] = useState<AllStepData>(() => initEmptySteps());

  const setDefaultAgencyAndCode = (agency: MultiOptionsObj, locationCode: string) => {
    setAllStepData((prevData) => ({
      ...prevData,
      collectionStep: {
        ...prevData.collectionStep,
        collectorAgency: {
          ...prevData.collectionStep.collectorAgency,
          value: agency
        },
        locationCode: {
          ...prevData.collectionStep.locationCode,
          value: locationCode
        }
      },
      ownershipStep: prevData.ownershipStep.map((singleOwner) => ({
        ...singleOwner,
        ownerAgency: {
          ...singleOwner.ownerAgency,
          value: agency
        },
        ownerCode: {
          ...singleOwner.ownerCode,
          value: locationCode
        }
      })),
      interimStep: {
        ...prevData.interimStep,
        agencyName: {
          ...prevData.interimStep.agencyName,
          value: agency
        },
        locationCode: {
          ...prevData.interimStep.locationCode,
          value: locationCode
        }
      }
    }));
    numOfEdit.current += 1;
  };

  const [clientNumber, setClientNumber] = useState<string>('');
  const [clientNumbers, setClientNumbers] = useState<string[]>([]);

  useEffect(() => {
    if (seedlotQuery.status === 'success') {
      setClientNumber(seedlotQuery.data.seedlot.applicantClientNumber ?? '');

      // Set area of use data
      setAreaOfUseData(fillAreaOfUseData(seedlotQuery.data, areaOfUseData));
    }
  }, [seedlotQuery.status]);

  const forestClientQuery = useQuery({
    queryKey: ['forest-clients', clientNumber],
    queryFn: () => getForestClientByNumberOrAcronym(clientNumber),
    enabled: seedlotQuery.isFetched && clientNumber !== '',
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const allClientsQuery = useQueries({
    queries: clientNumbers.map((client) => ({
      queryKey: ['forest-clients', client],
      queryFn: () => getForestClientByNumberOrAcronym(client),
      enabled: getAllSeedlotInfoQuery.isFetched,
      staleTime: THREE_HOURS,
      cacheTime: THREE_HALF_HOURS
    }))
  });

  const allClientsFinished = allClientsQuery.every((client) => client.isSuccess);

  const qc = useQueryClient();

  const getAgencyObj = (): MultiOptionsObj => ({
    code: forestClientQuery.data?.clientNumber ?? '',
    description: `${forestClientQuery.data?.clientNumber} - ${forestClientQuery.data?.clientName} - ${forestClientQuery.data?.acronym}`,
    label: forestClientQuery.data?.acronym ?? ''
  });

  const getDefaultLocationCode = (): string => (seedlotQuery.data?.seedlot.applicantLocationCode ?? '');

  const updateStepStatus = (
    stepName: keyof ProgressIndicatorConfig,
    stepStatusObj: ProgressStepStatus
  ): ProgressStepStatus => {
    const stepStatus = stepStatusObj;
    if (stepName === 'collection') {
      stepStatus.isInvalid = validateCollectionStep(allStepData.collectionStep);
      if (!stepStatus.isInvalid) {
        stepStatus.isComplete = verifyCollectionStepCompleteness(allStepData.collectionStep);
      }
    }
    if (stepName === 'ownership') {
      stepStatus.isInvalid = validateOwnershipStep(allStepData.ownershipStep);
      if (!stepStatus.isInvalid) {
        stepStatus.isComplete = verifyOwnershipStepCompleteness(allStepData.ownershipStep);
      }
    }
    if (stepName === 'interim') {
      stepStatus.isInvalid = validateInterimStep(allStepData.interimStep);
      if (!stepStatus.isInvalid) {
        stepStatus.isComplete = verifyInterimStepCompleteness(allStepData.interimStep);
      }
    }
    if (stepName === 'orchard') {
      stepStatus.isInvalid = validateOrchardStep(allStepData.orchardStep);
      if (!stepStatus.isInvalid) {
        stepStatus.isComplete = verifyOrchardStepCompleteness(allStepData.orchardStep);
      }
    }
    if (stepName === 'parent') {
      stepStatus.isInvalid = validateParentStep(allStepData.parentTreeStep);
      if (!stepStatus.isInvalid) {
        stepStatus.isComplete = verifyParentStepCompleteness(allStepData.parentTreeStep);
      }
    }
    if (stepName === 'extraction') {
      stepStatus.isInvalid = validateExtractionStep(allStepData.extractionStorageStep);
      if (!stepStatus.isInvalid) {
        stepStatus.isComplete = verifyExtractionStepCompleteness(allStepData.extractionStorageStep);
      }
    }

    return stepStatus;
  };

  const setStepData = (stepName: keyof AllStepData, stepData: any) => {
    const newData = { ...allStepData };
    // This check guarantee that every change on the collectors
    // agency also changes the values on the interim agency, when
    // necessary, also reflecting the invalid values
    if (stepName === 'collectionStep'
      && allStepData.interimStep.useCollectorAgencyInfo.value
      && !isFormSubmitted) {
      newData.interimStep.agencyName.value = stepData.collectorAgency.value;
      newData.interimStep.locationCode.value = stepData.locationCode.value;
      setProgressStatus((prevStatus) => (
        {
          ...prevStatus,
          interim: updateStepStatus('interim', prevStatus.interim)
        }
      ));
    }
    newData[stepName] = stepData;
    setAllStepData(newData);
    numOfEdit.current += 1;
  };

  // This useEffect fetchs all data regarding agencies on the
  // form steps
  useEffect(() => {
    if (getAllSeedlotInfoQuery.status === 'success') {
      // Set seedlot data
      const { seedlotData } = getAllSeedlotInfoQuery.data;
      const clientNumbersArray: string[] = [];
      clientNumbersArray.push(seedlotData.seedlotFormCollectionDto.collectionClientNumber);
      clientNumbersArray.push(seedlotData.seedlotFormInterimDto.intermStrgClientNumber);
      seedlotData.seedlotFormOwnershipDtoList.forEach((owner: any) => {
        clientNumbersArray.push(owner.ownerClientNumber);
      });
      clientNumbersArray.push(seedlotData.seedlotFormExtractionDto.extractoryClientNumber);
      clientNumbersArray.push(seedlotData.seedlotFormExtractionDto.storageClientNumber);
      setClientNumbers([...new Set(clientNumbersArray)]);

      // Set calculated result
      setCalculatedValues(getAllSeedlotInfoQuery.data.calculatedValues);

      // Set progress status
      const clonedStatus = structuredClone(progressStatus);
      const stepNames = Object.keys(clonedStatus) as Array<keyof ProgressIndicatorConfig>;
      stepNames.forEach((step) => {
        clonedStatus[step].isComplete = true;
      });
      setProgressStatus(clonedStatus);
    }
  }, [getAllSeedlotInfoQuery.status]);

  const fundingSourcesQuery = useQuery({
    queryKey: ['funding-sources'],
    queryFn: getFundingSources,
    select: (data) => getMultiOptList(data),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const methodsOfPaymentQuery = useQuery({
    queryKey: ['methods-of-payment'],
    queryFn: getMethodsOfPayment,
    select: (data) => getMultiOptList(data, true, false, true, ['isDefault']),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const gameticMethodologyQuery = useQuery({
    queryKey: ['gametic-methodologies'],
    queryFn: getGameticMethodology,
    select: (data) => getMultiOptList(data, true, false, true, ['isFemaleMethodology', 'isPliSpecies']),
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  const seedlotSpecies = getSpeciesOptionByCode(
    seedlotQuery.data?.seedlot.vegetationCode,
    vegCodeQuery.data
  );

  const orchardQuery = useQuery({
    queryKey: ['orchards', seedlotSpecies.code],
    queryFn: () => getOrchardByVegCode(seedlotSpecies.code),
    enabled: seedlotQuery.status === 'success'
  });

  useEffect(() => {
    if (
      getAllSeedlotInfoQuery.status === 'success'
      && fundingSourcesQuery.status === 'success'
      && methodsOfPaymentQuery.status === 'success'
      && gameticMethodologyQuery.status === 'success'
      && orchardQuery.status === 'success'
      && allClientsFinished
      && clientNumbers.length
    ) {
      const fullFormData = getAllSeedlotInfoQuery.data.seedlotData;
      const defaultAgencyNumber = seedlotQuery.data?.seedlot.applicantClientNumber;
      let clientAgencies: ClientAgenciesByCode = {};

      clientNumbers.forEach((curNumber) => {
        const clientData: ForestClientType | undefined = qc.getQueryData(['forest-clients', curNumber]);
        if (clientData) {
          clientAgencies = Object.assign(clientAgencies, {
            [curNumber]: {
              code: clientData.clientNumber,
              description: `${clientData.clientNumber} - ${clientData.clientName} - ${clientData.acronym}`,
              label: clientData.acronym
            }
          });
        }
      });

      setAllStepData(
        resDataToState(
          fullFormData,
          defaultAgencyNumber,
          methodsOfPaymentQuery.data,
          fundingSourcesQuery.data,
          orchardQuery.data,
          gameticMethodologyQuery.data,
          clientAgencies
        )
      );
    } else if (getAllSeedlotInfoQuery.status === 'error') {
      const error = getAllSeedlotInfoQuery.error as AxiosError;
      if (error.response?.status !== 404) {
        // eslint-disable-next-line no-alert
        alert(`Error retrieving seedlot data! ${error.message}`);
        navigate(`/seedlots/details/${seedlotNumber}`);
      }
    }
  }, [
    getAllSeedlotInfoQuery.status,
    getAllSeedlotInfoQuery.isFetched,
    fundingSourcesQuery.isFetched,
    methodsOfPaymentQuery.isFetched,
    gameticMethodologyQuery.isFetched,
    orchardQuery.isFetched,
    allClientsFinished,
    clientNumbers
  ]);

  const logState = () => {
    // eslint-disable-next-line no-console
    console.log(allStepData);
  };

  /**
   * Update the progress indicator status
   */
  const updateProgressStatus = (currentStepNum: number, prevStepNum: number) => {
    const clonedStatus = structuredClone(progressStatus);
    const currentStepName = stepMap[currentStepNum];
    const prevStepName = stepMap[prevStepNum];

    // Set invalid or complete status for Collection Step
    if (currentStepName !== 'collection' && prevStepName === 'collection') {
      clonedStatus.collection = updateStepStatus('collection', clonedStatus.collection);
    }

    // Set invalid or complete status for Ownership Step
    if (currentStepName !== 'ownership' && prevStepName === 'ownership') {
      clonedStatus.ownership = updateStepStatus('ownership', clonedStatus.ownership);
    }

    // Set invalid or complete status for Interim Step
    if (currentStepName !== 'interim' && prevStepName === 'interim') {
      clonedStatus.interim = updateStepStatus('interim', clonedStatus.interim);
    }

    // Set invalid or complete status for Orchard Step
    if (currentStepName !== 'orchard' && prevStepName === 'orchard') {
      clonedStatus.orchard = updateStepStatus('orchard', clonedStatus.orchard);
    }

    // Set invalid or complete status for Parent Tree Step
    if (currentStepName !== 'parent' && prevStepName === 'parent') {
      clonedStatus.parent = updateStepStatus('parent', clonedStatus.parent);
    }

    // Set invalid or complete status for Extraction and Storage Step
    if (currentStepName !== 'extraction' && prevStepName === 'extraction') {
      clonedStatus.extraction = updateStepStatus('extraction', clonedStatus.extraction);
    }

    // Set the current step's current val to true, and everything else false
    const stepNames = Object.keys(clonedStatus) as Array<keyof ProgressIndicatorConfig>;
    stepNames.forEach((nonCurrentStepName) => {
      clonedStatus[nonCurrentStepName].isCurrent = false;
    });
    clonedStatus[currentStepName].isCurrent = true;

    setProgressStatus(clonedStatus);
  };

  const setStep = (delta: number) => {
    logState();
    const prevStep = formStep;
    const newStep = prevStep + delta;
    updateProgressStatus(newStep, prevStep);
    window.history.replaceState(null, '', `?step=${newStep + 1}`);
    setFormStep(newStep);
  };

  const cleanParentTables = () => {
    const clonedState = { ...allStepData };
    clonedState.parentTreeStep.tableRowData = {};
    clonedState.parentTreeStep.mixTabData = generateDefaultRows(DEFAULT_MIX_PAGE_ROWS);
    setAllStepData(clonedState);
    setProgressStatus((prev) => ({
      ...prev,
      parent: {
        ...prev.parent,
        isComplete: false,
        isInvalid: false
      }
    }));
    numOfEdit.current += 1;
  };

  const submitSeedlot = useMutation({
    mutationFn: (payload: SeedlotAClassSubmitType) => putAClassSeedlot(seedlotNumber ?? '', payload),
    onSuccess: () => {
      navigate({
        pathname: addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber ?? ''),
        search: '?isSubmitSuccess=true'
      });
    },
    retry: 0
  });

  useEffect(() => {
    const completionStatus = checkAllStepsCompletion(
      progressStatus,
      verifyExtractionStepCompleteness(allStepData.extractionStorageStep)
    );
    setAllStepCompleted(completionStatus);
  }, [progressStatus, allStepData.extractionStorageStep, formStep]);

  /**
   * Update each step status EXCEPT for step 6.
   */
  const updateAllStepStatus = (): ProgressIndicatorConfig => {
    const clonedStatus = structuredClone(progressStatus);
    const stepNames = Object.keys(clonedStatus) as (keyof ProgressIndicatorConfig)[];
    stepNames.forEach((stepName) => {
      // Only update the status of the extraction if it is the current step
      if (stepName !== 'extraction'
        || (stepName === 'extraction' && clonedStatus.extraction.isCurrent)
      ) {
        clonedStatus[stepName] = updateStepStatus(stepName, clonedStatus[stepName]);
      }
    });
    setProgressStatus(clonedStatus);
    return clonedStatus;
  };

  const saveProgress = useMutation({
    mutationFn: () => {
      const updatedProgressStatus = structuredClone(updateAllStepStatus());
      const keys = Object.keys(updatedProgressStatus) as (keyof ProgressIndicatorConfig)[];

      // Set each status' isCurrent to false, otherwise the property will take priority when true.
      keys.forEach((key) => {
        updatedProgressStatus[key].isCurrent = false;
      });

      return putAClassSeedlotProgress(
        seedlotNumber ?? '',
        {
          allStepData,
          progressStatus: updatedProgressStatus
        }
      );
    },
    onSuccess: () => {
      numOfEdit.current = 0;
      setLastSaveTimestamp(DateTime.now().toISO());
      setSaveStatus('finished');
      setSaveDescription(smartSaveText.success);
    },
    onError: () => {
      setSaveStatus('error');
      setSaveDescription(smartSaveText.error);
    },
    onSettled: () => {
      setTimeout(() => {
        setSaveStatus(null);
        setSaveDescription(smartSaveText.idle);
      }, FIVE_SECONDS);
    },
    retry: 0
  });

  const handleSaveBtn = () => {
    setSaveStatus('active');
    setSaveDescription(smartSaveText.loading);
    if (!saveProgress.isLoading) {
      saveProgress.mutate();
    }
  };

  const location = useLocation();

  /**
   * For save progress on page leave.
   */
  useEffect(() => () => {
    // Prevent save on first render.
    if (isPageRendered.current && isFormIncomplete) {
      saveProgress.mutate();
    }
    isPageRendered.current = true;
  }, [location]);

  /**
   * For auto save on interval.
   */
  useEffect(() => {
    if (numOfEdit.current >= MAX_EDIT_BEFORE_SAVE && isFormIncomplete) {
      if (!saveProgress.isLoading) {
        saveProgress.mutate();
      }
    }

    const interval = setInterval(() => {
      if (numOfEdit.current > 0 && !saveProgress.isLoading && isFormIncomplete) {
        saveProgress.mutate();
      }
    }, TEN_SECONDS);

    return () => clearInterval(interval);
  }, [numOfEdit.current]);

  /**
   * Fetch the seedlot form draft only if the status of the seedlot is pending or incomplete.
   */
  const getFormDraftQuery = useQuery({
    queryKey: ['seedlots', 'a-class-form-progress', seedlotNumber ?? 'unknown'],
    queryFn: () => getAClassSeedlotDraft(seedlotNumber ?? ''),
    enabled: seedlotNumber !== undefined && seedlotNumber.length > 0 && isFormIncomplete,
    refetchOnMount: true,
    select: (data) => data.data as SeedlotProgressPayloadType,
    retry: 1
  });

  useEffect(() => {
    if (getFormDraftQuery.status === 'success') {
      setAllStepData(getFormDraftQuery.data.allStepData);
      const savedStatus = getFormDraftQuery.data.progressStatus;
      const currStepName = stepMap[formStep];
      savedStatus[currStepName].isCurrent = true;

      setProgressStatus(getFormDraftQuery.data.progressStatus);
    }
    if (getFormDraftQuery.status === 'error') {
      const error = getFormDraftQuery.error as AxiosError;
      if (error.response?.status !== 404) {
        // eslint-disable-next-line no-alert
        alert(`Error retrieving form draft! ${error.message}`);
        navigate(`/seedlots/details/${seedlotNumber}`);
      } else if (forestClientQuery.isFetched) {
        // set default agency and code only if the seedlot has no draft saved,
        // meaning this is their first time opening this form
        setDefaultAgencyAndCode(getAgencyObj(), getDefaultLocationCode());
      }
    }
  }, [getFormDraftQuery.status, getFormDraftQuery.isFetchedAfterMount, forestClientQuery.status]);

  const [genWorthVals, setGenWorthVals] = useState<GenWorthValType>(() => INITIAL_GEN_WORTH_VALS);

  const fillGenWorthVals = () => {
    const keys = Object.keys(genWorthVals) as (keyof GenWorthValType)[];
    const clonedGenWorth = structuredClone(genWorthVals);

    keys.forEach((key) => {
      const found = calculatedValues.find((calcedVal) => calcedVal.traitCode.toLowerCase() === key);
      if (found) {
        clonedGenWorth[key].value = String(found.calculatedValue);
      }
    });

    setGenWorthVals(clonedGenWorth);
  };

  /**
   * Set a single gen worth val
   */
  const setGenWorthVal = (traitCode: keyof GenWorthValType, newVal: string) => {
    setGenWorthVals((prevVals) => ({
      ...prevVals,
      [traitCode]: {
        ...prevVals[traitCode],
        value: newVal
      }
    }));
  };

  /**
   * Set a single geo info val
   */
  const setGeoInfoInputObj = (infoName: keyof GeoInfoValType, inputObj: StringInputType) => {
    setGeoInfoVals((prevVals) => ({
      ...prevVals,
      [infoName]: inputObj
    }));
  };

  const [isCalculatingPt, setIsCalculatingPt] = useState<boolean>(false);

  useEffect(() => {
    if (calculatedValues.length) {
      fillGenWorthVals();
    }
  }, [calculatedValues]);

  const contextData: ClassAContextType = useMemo(
    () => (
      {
        seedlotData: seedlotQuery.data?.seedlot,
        richSeedlotData: seedlotQuery.data,
        calculatedValues,
        geoInfoVals,
        genWorthVals,
        setGeoInfoVals,
        setGeoInfoInputObj,
        setGenWorthVal,
        seedlotNumber,
        allStepData,
        setStepData,
        seedlotSpecies: getSpeciesOptionByCode(
          seedlotQuery.data?.seedlot.vegetationCode,
          vegCodeQuery.data
        ),
        formStep,
        setStep,
        defaultAgencyObj: getAgencyObj(),
        defaultCode: getDefaultLocationCode(),
        isFormSubmitted,
        isFormIncomplete,
        handleSaveBtn,
        saveStatus,
        saveDescription,
        lastSaveTimestamp,
        allStepCompleted,
        progressStatus,
        cleanParentTables,
        submitSeedlot,
        getSeedlotPayload,
        updateProgressStatus,
        saveProgressStatus: saveProgress.status,
        isFetchingData: (
          vegCodeQuery.isFetching
          || seedlotQuery.isFetching
          || getAllSeedlotInfoQuery.isFetching
          || forestClientQuery.isFetching
          || methodsOfPaymentQuery.isFetching
          || orchardQuery.isFetching
          || gameticMethodologyQuery.isFetching
          || fundingSourcesQuery.isFetching
        ),
        genWorthInfoItems,
        setGenWorthInfoItems,
        weightedGwInfoItems,
        setWeightedGwInfoItems,
        popSizeAndDiversityConfig,
        setPopSizeAndDiversityConfig,
        summaryConfig,
        setSummaryConfig,
        meanGeomInfos,
        setMeanGeomInfos,
        areaOfUseData,
        setAreaOfUseData,
        isCalculatingPt,
        setIsCalculatingPt
      }),
    [
      seedlotNumber, calculatedValues, allStepData, seedlotQuery.status,
      vegCodeQuery.status, formStep, forestClientQuery.status,
      isFormSubmitted, isFormIncomplete,
      saveStatus, saveDescription, lastSaveTimestamp, allStepCompleted,
      progressStatus, submitSeedlot, saveProgress.status, getAllSeedlotInfoQuery.status,
      methodsOfPaymentQuery.status, orchardQuery.status, gameticMethodologyQuery.status,
      fundingSourcesQuery.status, geoInfoVals, genWorthVals, genWorthInfoItems, weightedGwInfoItems,
      popSizeAndDiversityConfig, summaryConfig, meanGeomInfos, areaOfUseData
    ]
  );

  return (
    <ClassAContext.Provider value={contextData}>
      {children}
    </ClassAContext.Provider>
  );
};

export default ContextContainerClassA;
