import React, {
  useEffect, useMemo, useRef, useState
} from 'react';
import {
  useNavigate, useParams, useSearchParams, useLocation
} from 'react-router-dom';
import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { DateTime } from 'luxon';

import {
  getAClassSeedlotDraft, getAClassSeedlotFullForm, getSeedlotById,
  putAClassSeedlot, putAClassSeedlotProgress
} from '../../../api-service/seedlotAPI';
import getVegCodes from '../../../api-service/vegetationCodeAPI';
import { getForestClientByNumber } from '../../../api-service/forestClientsAPI';
import getApplicantAgenciesOptions from '../../../api-service/applicantAgenciesAPI';
import getFundingSources from '../../../api-service/fundingSourcesAPI';
import getMethodsOfPayment from '../../../api-service/methodsOfPaymentAPI';
import getGameticMethodology from '../../../api-service/gameticMethodologyAPI';
import { getOrchardByVegCode } from '../../../api-service/orchardAPI';
import {
  TEN_SECONDS, THREE_HALF_HOURS, THREE_HOURS, FIVE_SECONDS
} from '../../../config/TimeUnits';

import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { SeedlotAClassSubmitType, SeedlotCalculationsResultsType, SeedlotProgressPayloadType } from '../../../types/SeedlotType';
import { generateDefaultRows } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/utils';
import { DEFAULT_MIX_PAGE_ROWS } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/constants';
import { addParamToPath } from '../../../utils/PathUtils';
import { getMultiOptList } from '../../../utils/MultiOptionsUtils';
import ROUTES from '../../../routes/constants';

import ClassAContext from './context';
import {
  AllStepData, ProgressIndicatorConfig,
  ProgressStepStatus
} from './definitions';
import {
  initProgressBar, getSpeciesOptionByCode, validateCollectionStep, verifyCollectionStepCompleteness,
  validateOwnershipStep, verifyOwnershipStepCompleteness, validateInterimStep,
  verifyInterimStepCompleteness, validateOrchardStep, verifyOrchardStepCompleteness,
  validateExtractionStep, verifyExtractionStepCompleteness, validateParentStep,
  verifyParentStepCompleteness, checkAllStepsCompletion, getSeedlotPayload,
  initEmptySteps, resDataToState
} from './utils';
import {
  MAX_EDIT_BEFORE_SAVE,
  initialProgressConfig, smartSaveText, stepMap
} from './constants';

import './styles.scss';

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

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: () => getVegCodes(true),
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
  const isFormIncomplete = seedlotQuery.data?.seedlotStatus.seedlotStatusCode === 'PND' || seedlotQuery.data?.seedlotStatus.seedlotStatusCode === 'INC';

  /**
   * Determine if the form is already submitted for review,
   * if true, it is necessary to fetch all of the seedlot's data
   * and use it to fill the form
   */
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (seedlotQuery.data?.seedlotStatus.seedlotStatusCode === 'SUB') {
      setIsFormSubmitted(true);
    }
  }, [seedlotQuery.isFetched]);

  const getAllSeeedlotInfoQuery = useQuery({
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
    setClientNumber(seedlotQuery.data?.applicantClientNumber ?? '');
  }, [seedlotQuery.isFetched]);

  const forestClientQuery = useQuery({
    queryKey: ['forest-clients', clientNumber],
    queryFn: () => getForestClientByNumber(clientNumber),
    enabled: seedlotQuery.isFetched && clientNumber !== '',
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  useQueries({
    queries: clientNumbers.map((client) => ({
      queryKey: ['forest-clients', client],
      queryFn: () => getForestClientByNumber(client),
      enabled: getAllSeeedlotInfoQuery.isFetched,
      staleTime: THREE_HOURS,
      cacheTime: THREE_HALF_HOURS
    }))
  });

  const getAgencyObj = (): MultiOptionsObj => ({
    code: forestClientQuery.data?.clientNumber ?? '',
    description: forestClientQuery.data?.clientName ?? '',
    label: `${forestClientQuery.data?.clientNumber} - ${forestClientQuery.data?.clientName} - ${forestClientQuery.data?.acronym}`
  });

  const getDefaultLocationCode = (): string => (seedlotQuery.data?.applicantLocationCode ?? '');

  const applicantAgencyQuery = useQuery({
    queryKey: ['applicant-agencies'],
    queryFn: getApplicantAgenciesOptions
  });

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
    if (getAllSeeedlotInfoQuery.status === 'success') {
      // Set seedlot data
      const { seedlotData } = getAllSeeedlotInfoQuery.data;
      const clientNumbersArray: string[] = [];
      clientNumbersArray.push(seedlotData.seedlotFormCollectionDto.collectionClientNumber);
      clientNumbersArray.push(seedlotData.seedlotFormInterimDto.intermStrgClientNumber);
      seedlotData.seedlotFormOwnershipDtoList.forEach((owner: any) => {
        clientNumbersArray.push(owner.ownerClientNumber);
      });
      clientNumbersArray.push(seedlotData.seedlotFormExtractionDto.extractoryClientNumber);
      clientNumbersArray.push(seedlotData.seedlotFormExtractionDto.storageClientNumber);
      setClientNumbers(clientNumbersArray);

      // Set calculated result
      setCalculatedValues(getAllSeeedlotInfoQuery.data.calculatedValues);

      // Set progress status
      const clonedStatus = structuredClone(progressStatus);
      const stepNames = Object.keys(clonedStatus) as Array<keyof ProgressIndicatorConfig>;
      stepNames.forEach((step) => {
        clonedStatus[step].isComplete = true;
      });
      setProgressStatus(clonedStatus);
    }
  }, [getAllSeeedlotInfoQuery.status]);

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
    seedlotQuery.data?.vegetationCode,
    vegCodeQuery.data
  );

  const orchardQuery = useQuery({
    queryKey: ['orchards', seedlotSpecies.code],
    queryFn: () => getOrchardByVegCode(seedlotSpecies.code),
    enabled: seedlotQuery.status === 'success'
  });

  useEffect(() => {
    if (getAllSeeedlotInfoQuery.status === 'success'
      && fundingSourcesQuery.status === 'success'
      && methodsOfPaymentQuery.status === 'success'
      && gameticMethodologyQuery.status === 'success'
      && orchardQuery.status === 'success') {
      const fullFormData = getAllSeeedlotInfoQuery.data.seedlotData;
      const defaultAgencyNumber = seedlotQuery.data?.applicantClientNumber;
      setAllStepData(
        resDataToState(
          fullFormData,
          defaultAgencyNumber,
          methodsOfPaymentQuery.data,
          fundingSourcesQuery.data,
          orchardQuery.data,
          gameticMethodologyQuery.data
        )
      );
    } else if (getAllSeeedlotInfoQuery.status === 'error') {
      const error = getAllSeeedlotInfoQuery.error as AxiosError;
      if (error.response?.status !== 404) {
        // eslint-disable-next-line no-alert
        alert(`Error retrieving seedlot data! ${error.message}`);
        navigate(`/seedlots/details/${seedlotNumber}`);
      }
    }
  }, [
    getAllSeeedlotInfoQuery.status,
    getAllSeeedlotInfoQuery.isFetched,
    fundingSourcesQuery.isFetched,
    methodsOfPaymentQuery.isFetched,
    gameticMethodologyQuery.isFetched,
    orchardQuery.isFetched
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

  const contextData = useMemo(
    () => (
      {
        seedlotData: seedlotQuery.data,
        calculatedValues,
        seedlotNumber,
        allStepData,
        setStepData,
        seedlotSpecies: getSpeciesOptionByCode(
          seedlotQuery.data?.vegetationCode,
          vegCodeQuery.data
        ),
        formStep,
        setStep,
        defaultAgencyObj: getAgencyObj(),
        defaultCode: getDefaultLocationCode(),
        agencyOptions: applicantAgencyQuery.data ?? [],
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
          || getAllSeeedlotInfoQuery.isFetching
          || forestClientQuery.isFetching
          || methodsOfPaymentQuery.isFetching
          || orchardQuery.isFetching
          || gameticMethodologyQuery.isFetching
          || fundingSourcesQuery.isFetching
        )
      }),
    [
      seedlotNumber, calculatedValues, allStepData, seedlotQuery.status,
      vegCodeQuery.status, formStep, forestClientQuery.status,
      applicantAgencyQuery.status, isFormSubmitted, isFormIncomplete,
      saveStatus, saveDescription, lastSaveTimestamp, allStepCompleted,
      progressStatus, submitSeedlot, saveProgress.status, getAllSeeedlotInfoQuery.status,
      methodsOfPaymentQuery.status, orchardQuery.status, gameticMethodologyQuery.status,
      fundingSourcesQuery.status
    ]
  );

  return (
    <ClassAContext.Provider value={contextData}>
      {children}
    </ClassAContext.Provider>
  );
};

export default ContextContainerClassA;
