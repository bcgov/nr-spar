import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import {
  getBClassSeedlotDraft, getBClassSeedlotFullForm, getSeedlotById
} from '../../../api-service/seedlotAPI';
import getFundingSources from '../../../api-service/fundingSourcesAPI';
import getMethodsOfPayment from '../../../api-service/methodsOfPaymentAPI';
import { RichSeedlotType, SeedlotBClassProgressPayloadType } from '../../../types/SeedlotType';
import { THREE_HALF_HOURS, THREE_HOURS } from '../../../config/TimeUnits';
import { getMultiOptList } from '../../../utils/MultiOptionsUtils';
import ROUTES from '../../../routes/constants';
import {
  BClassAllStepData,
  BClassProgressIndicatorConfig,
  FormLoadState
} from './definitions';
import {
  applyApplicantDefaultsToSteps,
  hydrateFromDraftPayload,
  initEmptySteps,
  initProgressBar,
  isDraftAllStepDataEmpty,
  resDataToState
} from './utils';
import { initialProgressConfig, stepMap } from './constants';

const isEditableStatus = (statusCode: string | undefined): boolean => (
  statusCode === 'PND' || statusCode === 'INC'
);

const isAxios404 = (error: unknown): boolean => (
  error instanceof AxiosError && error.response?.status === 404
);

type UseBClassFormLoaderArgs = {
  seedlotNumber: string | undefined;
  formStep: number;
};

type UseBClassFormLoaderResult = {
  seedlotQuery: ReturnType<typeof useQuery<RichSeedlotType>>;
  getFormDraftQuery: ReturnType<typeof useQuery<SeedlotBClassProgressPayloadType>>;
  allStepData: BClassAllStepData;
  setAllStepData: Dispatch<SetStateAction<BClassAllStepData>>;
  progressStatus: BClassProgressIndicatorConfig;
  setProgressStatus: Dispatch<SetStateAction<BClassProgressIndicatorConfig>>;
  formDraftRevCount: number;
  setFormDraftRevCount: Dispatch<SetStateAction<number>>;
  loadState: FormLoadState;
  isFormReady: boolean;
  isFormIncomplete: boolean;
  isFormSubmitted: boolean;
  canPersistDraft: boolean;
  isFetchingData: boolean;
  defaultClientNumber: string;
  defaultLocationCode: string;
  resetEditsOnHydrate: () => void;
};

export const useBClassFormLoader = ({
  seedlotNumber,
  formStep
}: UseBClassFormLoaderArgs): UseBClassFormLoaderResult => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hydrationKeyRef = useRef<string | null>(null);

  const [allStepData, setAllStepData] = useState<BClassAllStepData>(() => initEmptySteps());
  const [progressStatus, setProgressStatus] = useState<BClassProgressIndicatorConfig>(
    () => initProgressBar(formStep, initialProgressConfig)
  );
  const [formDraftRevCount, setFormDraftRevCount] = useState<number>(0);
  const [loadState, setLoadState] = useState<FormLoadState>({ status: 'loading' });

  const seedlotQuery = useQuery({
    queryKey: ['seedlots', seedlotNumber],
    queryFn: () => getSeedlotById(seedlotNumber ?? ''),
    refetchOnWindowFocus: false
  });

  const seedlotStatusCode = seedlotQuery.data?.seedlot.seedlotStatus.seedlotStatusCode;
  const seedlotReady = seedlotQuery.isSuccess;
  const editable = seedlotReady && isEditableStatus(seedlotStatusCode);
  const isFormIncomplete = editable;
  const isFormSubmitted = seedlotReady && !editable;

  const defaultClientNumber = seedlotQuery.data?.seedlot.applicantClientNumber ?? '';
  const defaultLocationCode = seedlotQuery.data?.seedlot.applicantLocationCode ?? '';

  const getFormDraftQuery = useQuery({
    queryKey: ['seedlots', 'b-class-form-progress', seedlotNumber ?? 'unknown'],
    queryFn: () => getBClassSeedlotDraft(seedlotNumber ?? ''),
    enabled: Boolean(seedlotNumber) && editable,
    refetchOnMount: true,
    select: (data) => data.data as SeedlotBClassProgressPayloadType
  });

  const draftSettled = getFormDraftQuery.isSuccess || (
    getFormDraftQuery.isError && isAxios404(getFormDraftQuery.error)
  );
  const draftHasData = getFormDraftQuery.isSuccess
    && !isDraftAllStepDataEmpty(getFormDraftQuery.data.allStepData as Record<string, unknown>);
  const draftIsEmpty = getFormDraftQuery.isSuccess
    && isDraftAllStepDataEmpty(getFormDraftQuery.data.allStepData as Record<string, unknown>);
  const draftNotFound = getFormDraftQuery.isError && isAxios404(getFormDraftQuery.error);

  const needsFullForm = seedlotReady && (
    isFormSubmitted
    || (editable && draftIsEmpty)
  );

  const fullFormQuery = useQuery({
    queryKey: ['seedlot-b-class-full-form', seedlotNumber],
    queryFn: () => getBClassSeedlotFullForm(seedlotNumber ?? ''),
    enabled: needsFullForm,
    refetchOnWindowFocus: false
  });

  const fundingSourcesQuery = useQuery({
    queryKey: ['funding-sources'],
    queryFn: getFundingSources,
    select: (data) => getMultiOptList(data),
    enabled: needsFullForm,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const methodsOfPaymentQuery = useQuery({
    queryKey: ['methods-of-payment'],
    queryFn: getMethodsOfPayment,
    select: (data) => getMultiOptList(data, true, false, true, ['isDefault']),
    enabled: needsFullForm,
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS
  });

  const ownershipLookupsReady = !needsFullForm
    || (fundingSourcesQuery.isSuccess && methodsOfPaymentQuery.isSuccess);

  useEffect(() => {
    hydrationKeyRef.current = null;
  }, [seedlotStatusCode]);

  useEffect(() => {
    if (seedlotQuery.error instanceof AxiosError && seedlotQuery.error.response?.status === 404) {
      navigate(ROUTES.FOUR_OH_FOUR);
    }
  }, [seedlotQuery.error, navigate]);

  useEffect(() => {
    if (isFormSubmitted && seedlotReady) {
      queryClient.removeQueries({ queryKey: ['seedlots', 'b-class-form-progress', seedlotNumber] });
    }
  }, [isFormSubmitted, seedlotReady, queryClient, seedlotNumber]);

  useEffect(() => {
    if (!seedlotReady) {
      hydrationKeyRef.current = null;
      setLoadState({ status: 'loading' });
      return;
    }

    if (editable && !draftSettled) {
      setLoadState({ status: 'loading' });
      return;
    }

    if (needsFullForm && !fullFormQuery.isFetched) {
      setLoadState({ status: 'loading' });
      return;
    }

    if (needsFullForm && !ownershipLookupsReady) {
      setLoadState({ status: 'loading' });
      return;
    }

    if (getFormDraftQuery.isError && !isAxios404(getFormDraftQuery.error)) {
      const error = getFormDraftQuery.error as AxiosError;
      // eslint-disable-next-line no-alert
      alert(`Error retrieving form draft! ${error.message}`);
      navigate(`/seedlots/details/${seedlotNumber}`);
      setLoadState({ status: 'error', message: error.message });
      return;
    }

    if (fullFormQuery.isError && !isAxios404(fullFormQuery.error)) {
      const error = fullFormQuery.error as AxiosError;
      // eslint-disable-next-line no-alert
      alert(`Error retrieving seedlot data! ${error.message}`);
      navigate(`/seedlots/details/${seedlotNumber}`);
      setLoadState({ status: 'error', message: error.message });
      return;
    }

    let hydrationKey: string;
    let source: 'draft' | 'tables' | 'empty';
    let nextStepData: BClassAllStepData;
    let nextRevCount = formDraftRevCount;
    let savedProgress = getFormDraftQuery.data?.progressStatus as BClassProgressIndicatorConfig | undefined;

    if (isFormSubmitted && fullFormQuery.isSuccess) {
      hydrationKey = `sub:${seedlotNumber}:${fullFormQuery.dataUpdatedAt}`;
      source = 'tables';
      nextStepData = resDataToState(
        fullFormQuery.data,
        defaultClientNumber,
        methodsOfPaymentQuery.data,
        fundingSourcesQuery.data
      );
      savedProgress = undefined;
    } else if (draftHasData && getFormDraftQuery.data) {
      hydrationKey = `draft:${seedlotNumber}:${getFormDraftQuery.data.revisionCount}`;
      source = 'draft';
      const hydrated = hydrateFromDraftPayload(
        getFormDraftQuery.data,
        defaultClientNumber,
        defaultLocationCode
      );
      nextStepData = hydrated.allStepData;
      nextRevCount = hydrated.revisionCount;
    } else if (editable && draftIsEmpty && fullFormQuery.isSuccess) {
      hydrationKey = `pnd-empty:${seedlotNumber}:${fullFormQuery.dataUpdatedAt}`;
      source = 'tables';
      nextStepData = resDataToState(
        fullFormQuery.data,
        defaultClientNumber,
        methodsOfPaymentQuery.data,
        fundingSourcesQuery.data
      );
    } else if (editable && draftNotFound) {
      hydrationKey = `new:${seedlotNumber}:${defaultClientNumber}:${defaultLocationCode}`;
      source = 'empty';
      nextStepData = applyApplicantDefaultsToSteps(
        initEmptySteps(defaultClientNumber, defaultLocationCode),
        defaultClientNumber,
        defaultLocationCode
      );
      savedProgress = undefined;
    } else if (needsFullForm && fullFormQuery.isFetching) {
      setLoadState({ status: 'loading' });
      return;
    } else {
      setLoadState({ status: 'loading' });
      return;
    }

    if (hydrationKeyRef.current === hydrationKey) {
      return;
    }
    hydrationKeyRef.current = hydrationKey;

    setAllStepData(nextStepData);
    setFormDraftRevCount(nextRevCount);

    const currStepName = stepMap[formStep];
    if (savedProgress) {
      const clonedStatus = structuredClone(savedProgress);
      if (clonedStatus[currStepName]) {
        clonedStatus[currStepName].isCurrent = true;
      }
      setProgressStatus(clonedStatus);
    } else if (source === 'tables' && isFormSubmitted) {
      setProgressStatus(initProgressBar(formStep, initialProgressConfig));
    }

    setLoadState({ status: 'ready', source, editable });
  }, [
    seedlotReady,
    editable,
    isFormSubmitted,
    draftSettled,
    draftHasData,
    draftIsEmpty,
    draftNotFound,
    needsFullForm,
    getFormDraftQuery.isSuccess,
    getFormDraftQuery.isError,
    getFormDraftQuery.data,
    getFormDraftQuery.error,
    fullFormQuery.isSuccess,
    fullFormQuery.isError,
    fullFormQuery.isFetching,
    fullFormQuery.isFetched,
    fullFormQuery.data,
    fullFormQuery.dataUpdatedAt,
    fundingSourcesQuery.isSuccess,
    fundingSourcesQuery.data,
    methodsOfPaymentQuery.isSuccess,
    methodsOfPaymentQuery.data,
    ownershipLookupsReady,
    defaultClientNumber,
    defaultLocationCode,
    seedlotNumber,
    formStep,
    navigate
  ]);

  const isFormReady = loadState.status === 'ready';
  const canPersistDraft = loadState.status === 'ready' && editable;

  const isFetchingData = seedlotQuery.isFetching
    || (editable && getFormDraftQuery.isFetching)
    || (needsFullForm && fullFormQuery.isFetching)
    || (needsFullForm && fundingSourcesQuery.isFetching)
    || (needsFullForm && methodsOfPaymentQuery.isFetching);

  const resetEditsOnHydrate = () => {
    hydrationKeyRef.current = null;
  };

  return {
    seedlotQuery,
    getFormDraftQuery,
    allStepData,
    setAllStepData,
    progressStatus,
    setProgressStatus,
    formDraftRevCount,
    setFormDraftRevCount,
    loadState,
    isFormReady,
    isFormIncomplete,
    isFormSubmitted,
    canPersistDraft,
    isFetchingData,
    defaultClientNumber,
    defaultLocationCode,
    resetEditsOnHydrate
  };
};

export default useBClassFormLoader;
