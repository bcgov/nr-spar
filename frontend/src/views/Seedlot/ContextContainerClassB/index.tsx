import React, {
  useCallback, useEffect, useMemo, useRef, useState
} from 'react';
import {
  useNavigate, useParams, useSearchParams, useLocation
} from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { DateTime } from 'luxon';

import {
  putBClassSeedlot, putBClassSeedlotProgress
} from '../../../api-service/seedlotAPI';
import getBecCatalogue from '../../../api-service/becCatalogueAPI';
import {
  TEN_SECONDS, FIVE_SECONDS, THREE_HOURS, THREE_HALF_HOURS
} from '../../../config/TimeUnits';
import { SeedlotBClassSubmitType } from '../../../types/SeedlotType';
import ROUTES from '../../../routes/constants';
import { addParamToPath } from '../../../utils/PathUtils';
import SeedlotRegWizardContext, { SeedlotRegWizardStepData } from '../../../contexts/SeedlotRegWizardContext';

import ClassBContext, { ClassBContextType } from './context';
import {
  BClassAllStepData, BClassProgressIndicatorConfig
} from './definitions';
import {
  checkAllStepsCompletion,
  getBClassSeedlotPayload,
  updateStepStatus
} from './utils';
import {
  MAX_EDIT_BEFORE_SAVE,
  smartSaveText,
  stepMap
} from './constants';
import {
  verifyExtractionStepCompleteness
} from '../ContextContainerClassA/utils';
import useBClassFormLoader from './useBClassFormLoader';

import './styles.scss';

type props = {
  children: React.ReactNode
};

const ContextContainerClassB = ({ children }: props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { seedlotNumber } = useParams();
  const [searchParams] = useSearchParams();
  const stepParam = searchParams.get('step');

  const [formStep, setFormStep] = useState<number>(() => {
    const parsed = stepParam ? Number.parseInt(stepParam, 10) : NaN;
    const stepIndex = Number.isFinite(parsed) ? parsed - 1 : 0;
    return Math.min(3, Math.max(0, stepIndex));
  });

  const {
    seedlotQuery,
    getFormDraftQuery,
    allStepData,
    setAllStepData,
    progressStatus,
    setProgressStatus,
    formDraftRevCount,
    setFormDraftRevCount,
    isFormReady,
    isFormIncomplete,
    isFormSubmitted,
    canPersistDraft,
    isFetchingData,
    defaultClientNumber,
    defaultLocationCode,
    resetEditsOnHydrate
  } = useBClassFormLoader({ seedlotNumber, formStep });

  const becCatalogueQuery = useQuery({
    queryKey: ['bec-catalogue'],
    queryFn: getBecCatalogue,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const becCatalogue = becCatalogueQuery.data;

  const [allStepCompleted, setAllStepCompleted] = useState<boolean>(false);
  const [lastSaveTimestamp, setLastSaveTimestamp] = useState<string>(() => DateTime.now().toISO());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveDescription, setSaveDescription] = useState<string>('Save changes');
  const numOfEdit = useRef(0);

  const setStepData = (stepName: keyof BClassAllStepData, stepData: unknown) => {
    setAllStepData((prevData) => {
      const newData = {
        ...prevData,
        [stepName]: stepData
      } as BClassAllStepData;

      if (stepName === 'collectionStep'
          && prevData.interimStep.useCollectorAgencyInfo.value) {
        const collectionData = stepData as BClassAllStepData['collectionStep'];
        newData.interimStep = {
          ...newData.interimStep,
          agencyName: {
            ...newData.interimStep.agencyName,
            value: collectionData.collectorAgency.value
          },
          locationCode: {
            ...newData.interimStep.locationCode,
            value: collectionData.locationCode.value
          }
        };
        setProgressStatus((prevStatus) => ({
          ...prevStatus,
          interim: updateStepStatus('interim', prevStatus.interim, newData, becCatalogue)
        }));
      }

      return newData;
    });
    numOfEdit.current += 1;
  };

  const updateProgressStatus = (currentStepNum: number, prevStepNum: number) => {
    const clonedStatus = structuredClone(progressStatus);
    const currentStepName = stepMap[currentStepNum];
    const prevStepName = stepMap[prevStepNum];

    if (currentStepName !== 'collection' && prevStepName === 'collection') {
      clonedStatus.collection = updateStepStatus('collection', clonedStatus.collection, allStepData, becCatalogue);
    }
    if (currentStepName !== 'ownership' && prevStepName === 'ownership') {
      clonedStatus.ownership = updateStepStatus('ownership', clonedStatus.ownership, allStepData, becCatalogue);
    }
    if (currentStepName !== 'interim' && prevStepName === 'interim') {
      clonedStatus.interim = updateStepStatus('interim', clonedStatus.interim, allStepData, becCatalogue);
    }
    if (currentStepName !== 'extraction' && prevStepName === 'extraction') {
      clonedStatus.extraction = updateStepStatus('extraction', clonedStatus.extraction, allStepData, becCatalogue);
    }

    (Object.keys(clonedStatus) as Array<keyof BClassProgressIndicatorConfig>).forEach((stepName) => {
      clonedStatus[stepName].isCurrent = false;
    });
    clonedStatus[currentStepName].isCurrent = true;

    setProgressStatus(clonedStatus);
  };

  const setStep = (delta: number) => {
    const prevStep = formStep;
    const newStep = prevStep + delta;
    updateProgressStatus(newStep, prevStep);
    window.history.replaceState(null, '', `?step=${newStep + 1}`);
    setFormStep(newStep);
  };

  const updateAllStepStatus = (): BClassProgressIndicatorConfig => {
    const clonedStatus = structuredClone(progressStatus);
    (Object.keys(clonedStatus) as Array<keyof BClassProgressIndicatorConfig>).forEach((stepName) => {
      if (stepName !== 'extraction'
        || (stepName === 'extraction' && clonedStatus.extraction.isCurrent)) {
        clonedStatus[stepName] = updateStepStatus(stepName, clonedStatus[stepName], allStepData, becCatalogue);
      }
    });
    setProgressStatus(clonedStatus);
    return clonedStatus;
  };

  const saveProgress = useMutation({
    mutationFn: () => {
      const updatedProgressStatus = structuredClone(updateAllStepStatus());
      (Object.keys(updatedProgressStatus) as Array<keyof BClassProgressIndicatorConfig>).forEach((key) => {
        updatedProgressStatus[key].isCurrent = false;
      });

      return putBClassSeedlotProgress(
        seedlotNumber ?? '',
        {
          allStepData,
          progressStatus: updatedProgressStatus,
          revisionCount: formDraftRevCount
        }
      );
    },
    onSuccess: (data) => {
      setFormDraftRevCount(data.revisionCount);
      numOfEdit.current = 0;
      setLastSaveTimestamp(DateTime.now().toISO());
      setSaveStatus('finished');
      setSaveDescription(smartSaveText.success);
    },
    onError: (error: unknown) => {
      if (isAxiosError(error) && error.response?.data.status === 409) {
        setSaveStatus('conflict');
        setSaveDescription(smartSaveText.idle);
      } else {
        setSaveStatus('error');
        setSaveDescription(smartSaveText.error);
      }
    },
    onSettled: (res, error) => {
      if (
        res
        || (isAxiosError(error) && error.response?.data.status !== 409)
      ) {
        setTimeout(() => {
          setSaveStatus(null);
          setSaveDescription(smartSaveText.idle);
        }, FIVE_SECONDS);
      }
    },
    retry: 0
  });

  const persistDraft = useCallback((options?: { showLoading?: boolean }) => {
    if (!canPersistDraft || saveProgress.isPending || saveStatus === 'conflict') {
      return;
    }
    if (options?.showLoading) {
      setSaveStatus('active');
      setSaveDescription(smartSaveText.loading);
    }
    saveProgress.mutate();
  }, [canPersistDraft, saveProgress, saveStatus]);

  const persistDraftRef = useRef(persistDraft);
  persistDraftRef.current = persistDraft;

  const handleSaveBtn = () => {
    persistDraft({ showLoading: true });
  };

  const location = useLocation();

  useEffect(() => () => {
    persistDraftRef.current();
  }, [location]);

  useEffect(() => {
    if (numOfEdit.current >= MAX_EDIT_BEFORE_SAVE) {
      persistDraftRef.current();
    }

    const interval = setInterval(() => {
      if (numOfEdit.current > 0) {
        persistDraftRef.current();
      }
    }, TEN_SECONDS);

    return () => clearInterval(interval);
  }, [saveStatus, isFormReady]);

  useEffect(() => {
    if (isFormReady) {
      numOfEdit.current = 0;
    }
  }, [isFormReady, seedlotNumber, seedlotQuery.data?.seedlot.seedlotStatus.seedlotStatusCode]);

  useEffect(() => {
    const completionStatus = checkAllStepsCompletion(
      progressStatus,
      allStepData,
      verifyExtractionStepCompleteness(allStepData.extractionStorageStep),
      becCatalogue
    );
    setAllStepCompleted(completionStatus);
  }, [progressStatus, allStepData, formStep, becCatalogue]);

  const submitSeedlot = useMutation({
    mutationFn: (payload: SeedlotBClassSubmitType) => putBClassSeedlot(seedlotNumber ?? '', payload),
    onSuccess: async () => {
      resetEditsOnHydrate();
      await queryClient.invalidateQueries({ queryKey: ['seedlots', seedlotNumber] });
      queryClient.removeQueries({ queryKey: ['seedlots', 'b-class-form-progress', seedlotNumber] });
      await queryClient.invalidateQueries({ queryKey: ['seedlot-b-class-full-form', seedlotNumber] });
      navigate({
        pathname: addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber ?? ''),
        search: '?isSubmitSuccess=true'
      });
    },
    retry: 0
  });

  const contextData: ClassBContextType = useMemo(
    () => ({
      seedlotData: seedlotQuery.data?.seedlot,
      richSeedlotData: seedlotQuery.data,
      seedlotNumber,
      allStepData,
      setStepData,
      formStep,
      setStep,
      defaultClientNumber,
      defaultCode: defaultLocationCode,
      isFormSubmitted,
      isFormIncomplete,
      isFormReady,
      handleSaveBtn,
      saveStatus,
      saveDescription,
      lastSaveTimestamp,
      allStepCompleted,
      progressStatus,
      updateProgressStatus,
      saveProgressStatus: saveProgress.status,
      isFetchingData,
      getFormDraftQuery,
      submitSeedlot,
      getBClassSeedlotPayload
    }),
    [
      seedlotNumber,
      allStepData,
      seedlotQuery.status,
      seedlotQuery.data,
      formStep,
      isFormSubmitted,
      isFormIncomplete,
      isFormReady,
      saveStatus,
      saveDescription,
      lastSaveTimestamp,
      allStepCompleted,
      progressStatus,
      saveProgress.status,
      isFetchingData,
      defaultClientNumber,
      defaultLocationCode,
      getFormDraftQuery,
      submitSeedlot.status
    ]
  );

  const wizardContextValue = useMemo(
    () => ({
      allStepData: {
        collectionStep: allStepData.collectionStep,
        ownershipStep: allStepData.ownershipStep,
        interimStep: allStepData.interimStep,
        extractionStorageStep: allStepData.extractionStorageStep
      } as SeedlotRegWizardStepData,
      setStepData: (stepName: keyof SeedlotRegWizardStepData, stepData: unknown) => {
        setStepData(stepName as keyof BClassAllStepData, stepData);
      },
      defaultClientNumber,
      defaultCode: defaultLocationCode,
      isFormSubmitted,
      seedlotNumber
    }),
    [
      allStepData,
      isFormSubmitted,
      seedlotNumber,
      defaultClientNumber,
      defaultLocationCode
    ]
  );

  return (
    <ClassBContext.Provider value={contextData}>
      <SeedlotRegWizardContext.Provider value={wizardContextValue}>
        {children}
      </SeedlotRegWizardContext.Provider>
    </ClassBContext.Provider>
  );
};

export default ContextContainerClassB;
