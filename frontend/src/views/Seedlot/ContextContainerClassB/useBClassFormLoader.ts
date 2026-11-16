import {
  Dispatch, SetStateAction, useEffect, useRef, useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import {
  getBClassSeedlotDraft, getBClassSeedlotFullForm, getSeedlotById
} from '../../../api-service/seedlotAPI';
import getFundingSources from '../../../api-service/fundingSourcesAPI';
import getMethodsOfPayment from '../../../api-service/methodsOfPaymentAPI';
import { RichSeedlotType, SeedlotBClassProgressPayloadType } from '../../../types/SeedlotType';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
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
  resDataToState,
  withSeedlotSpzFallback
} from './utils';
import { initialProgressConfig, stepMap } from './constants';

const isEditableStatus = (statusCode: string | undefined): boolean => (
  statusCode === 'PND' || statusCode === 'INC'
);

const isAxios404 = (error: unknown): boolean => (
  error instanceof AxiosError && error.response?.status === 404
);

export type LoadGate =
  | { kind: 'loading' }
  | { kind: 'error'; title: string; message: string }
  | { kind: 'proceed' };

type LoadGateArgs = {
  editable: boolean;
  draftSettled: boolean;
  needsFullForm: boolean;
  fullFormFetched: boolean;
  ownershipLookupsReady: boolean;
  draftError: unknown;
  fullFormError: unknown;
};

/**
 * Decides whether the form can hydrate yet, must keep loading, or failed to
 * fetch something it needs. A 404 is not a failure: it means "no draft yet".
 */
export const getLoadGate = ({
  editable,
  draftSettled,
  needsFullForm,
  fullFormFetched,
  ownershipLookupsReady,
  draftError,
  fullFormError
}: LoadGateArgs): LoadGate => {
  if ((editable && !draftSettled) || (needsFullForm && (!fullFormFetched || !ownershipLookupsReady))) {
    return { kind: 'loading' };
  }
  if (draftError && !isAxios404(draftError)) {
    return { kind: 'error', title: 'Error retrieving form draft!', message: (draftError as AxiosError).message };
  }
  if (fullFormError && !isAxios404(fullFormError)) {
    return { kind: 'error', title: 'Error retrieving seedlot data!', message: (fullFormError as AxiosError).message };
  }
  return { kind: 'proceed' };
};

export type HydrationPlan = {
  key: string;
  source: 'draft' | 'tables' | 'empty';
  stepData: BClassAllStepData;
  revCount: number;
  savedProgress?: BClassProgressIndicatorConfig;
};

type ResDataToStateArgs = Parameters<typeof resDataToState>;

type HydrationPlanArgs = {
  seedlotNumber: string | undefined;
  editable: boolean;
  isFormSubmitted: boolean;
  draftHasData: boolean;
  draftIsEmpty: boolean;
  draftNotFound: boolean;
  draftData: SeedlotBClassProgressPayloadType | undefined;
  fullFormData: ResDataToStateArgs[0] | undefined;
  fullFormUpdatedAt: number;
  defaultClientNumber: string;
  defaultLocationCode: string;
  methodsOfPayment: ResDataToStateArgs[2];
  fundingSources: ResDataToStateArgs[3];
  currentRevCount: number;
  seedlot: Parameters<typeof withSeedlotSpzFallback>[1];
};

/**
 * Picks where the form's initial state comes from: the saved tables for a
 * submitted seedlot, the draft when one has data, the tables when the draft is
 * empty, or blank steps for a new seedlot. Returns null while none applies yet.
 */
export const getHydrationPlan = (args: HydrationPlanArgs): HydrationPlan | null => {
  const {
    seedlotNumber, editable, isFormSubmitted, draftHasData, draftIsEmpty, draftNotFound,
    draftData, fullFormData, fullFormUpdatedAt, defaultClientNumber, defaultLocationCode,
    methodsOfPayment, fundingSources, currentRevCount, seedlot
  } = args;
  const savedProgress = draftData?.progressStatus as BClassProgressIndicatorConfig | undefined;
  const fromTables = (data: ResDataToStateArgs[0]) => resDataToState(
    data,
    defaultClientNumber,
    methodsOfPayment,
    fundingSources
  );

  if (isFormSubmitted && fullFormData) {
    return {
      key: `sub:${seedlotNumber}:${fullFormUpdatedAt}`,
      source: 'tables',
      stepData: fromTables(fullFormData),
      revCount: currentRevCount
    };
  }
  if (draftHasData && draftData) {
    const hydrated = hydrateFromDraftPayload(
      draftData,
      defaultClientNumber,
      defaultLocationCode,
      seedlot
    );
    return {
      key: `draft:${seedlotNumber}:${draftData.revisionCount}`,
      source: 'draft',
      stepData: hydrated.allStepData,
      revCount: hydrated.revisionCount,
      savedProgress
    };
  }
  if (editable && draftIsEmpty && fullFormData) {
    return {
      key: `pnd-empty:${seedlotNumber}:${fullFormUpdatedAt}`,
      source: 'tables',
      stepData: fromTables(fullFormData),
      revCount: currentRevCount,
      savedProgress
    };
  }
  if (editable && draftNotFound) {
    const emptySteps = applyApplicantDefaultsToSteps(
      initEmptySteps(defaultClientNumber, defaultLocationCode),
      defaultClientNumber,
      defaultLocationCode
    );
    return {
      key: `new:${seedlotNumber}:${defaultClientNumber}:${defaultLocationCode}`,
      source: 'empty',
      stepData: {
        ...emptySteps,
        collectionStep: withSeedlotSpzFallback(emptySteps.collectionStep, seedlot)
      },
      revCount: currentRevCount
    };
  }
  return null;
};

/**
 * The progress indicator state to show after hydrating, or null to leave the
 * current one untouched.
 */
export const getHydratedProgress = (
  plan: HydrationPlan,
  formStep: number,
  isFormSubmitted: boolean
): BClassProgressIndicatorConfig | null => {
  if (plan.savedProgress) {
    const clonedStatus = structuredClone(plan.savedProgress);
    const currStepName = stepMap[formStep];
    if (clonedStatus[currStepName]) {
      clonedStatus[currStepName].isCurrent = true;
    }
    return clonedStatus;
  }
  if (plan.source === 'tables' && isFormSubmitted) {
    return initProgressBar(formStep, initialProgressConfig);
  }
  return null;
};

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
  markDraftSaved: (revisionCount: number) => void;
  fundingSourcesQuery: UseQueryResult<MultiOptionsObj[], unknown>;
  methodsOfPaymentQuery: UseQueryResult<MultiOptionsObj[], unknown>;
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
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS,
    retry: false
  });

  const methodsOfPaymentQuery = useQuery({
    queryKey: ['methods-of-payment'],
    queryFn: getMethodsOfPayment,
    select: (data) => getMultiOptList(data, true, false, true, ['isDefault']),
    staleTime: THREE_HOURS,
    gcTime: THREE_HALF_HOURS,
    retry: false
  });

  // Settled (success or error) so a failed lookup does not leave the form
  // stuck loading; OwnershipStep already surfaces fetch errors on the dropdowns.
  const ownershipLookupsReady = !needsFullForm
    || (fundingSourcesQuery.isFetched && methodsOfPaymentQuery.isFetched);

  useEffect(() => {
    hydrationKeyRef.current = null;
  }, [seedlotStatusCode]);

  useEffect(() => {
    if (seedlotQuery.error instanceof AxiosError && seedlotQuery.error.response?.status === 404) {
      void navigate(ROUTES.FOUR_OH_FOUR);
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

    const gate = getLoadGate({
      editable,
      draftSettled,
      needsFullForm,
      fullFormFetched: fullFormQuery.isFetched,
      ownershipLookupsReady,
      draftError: getFormDraftQuery.isError ? getFormDraftQuery.error : null,
      fullFormError: fullFormQuery.isError ? fullFormQuery.error : null
    });

    if (gate.kind === 'error') {
      // eslint-disable-next-line no-alert
      alert(`${gate.title} ${gate.message}`);
      void navigate(`/seedlots/details/${seedlotNumber}`);
      setLoadState({ status: 'error', message: gate.message });
      return;
    }

    const plan = gate.kind === 'proceed'
      ? getHydrationPlan({
        seedlotNumber,
        editable,
        isFormSubmitted,
        draftHasData,
        draftIsEmpty,
        draftNotFound,
        draftData: getFormDraftQuery.data,
        fullFormData: fullFormQuery.isSuccess ? fullFormQuery.data : undefined,
        fullFormUpdatedAt: fullFormQuery.dataUpdatedAt,
        defaultClientNumber,
        defaultLocationCode,
        methodsOfPayment: methodsOfPaymentQuery.data,
        fundingSources: fundingSourcesQuery.data,
        currentRevCount: formDraftRevCount,
        seedlot: seedlotQuery.data?.seedlot
      })
      : null;

    if (!plan) {
      setLoadState({ status: 'loading' });
      return;
    }

    if (hydrationKeyRef.current === plan.key) {
      return;
    }
    hydrationKeyRef.current = plan.key;

    setAllStepData(plan.stepData);
    setFormDraftRevCount(plan.revCount);

    const nextProgress = getHydratedProgress(plan, formStep, isFormSubmitted);
    if (nextProgress) {
      setProgressStatus(nextProgress);
    }

    setLoadState({ status: 'ready', source: plan.source, editable });
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
    fullFormQuery.error,
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
    seedlotQuery.data,
    seedlotNumber,
    formStep,
    navigate
  ]);

  const isFormReady = loadState.status === 'ready';
  const canPersistDraft = loadState.status === 'ready' && editable;

  const isFetchingData = seedlotQuery.isFetching
    || (editable && getFormDraftQuery.isFetching)
    || (needsFullForm && fullFormQuery.isFetching)
    || fundingSourcesQuery.isFetching
    || methodsOfPaymentQuery.isFetching;

  const resetEditsOnHydrate = () => {
    hydrationKeyRef.current = null;
  };

  // A draft this form just saved is already in state; don't re-hydrate from it.
  const markDraftSaved = (revisionCount: number) => {
    hydrationKeyRef.current = `draft:${seedlotNumber}:${revisionCount}`;
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
    resetEditsOnHydrate,
    markDraftSaved,
    fundingSourcesQuery,
    methodsOfPaymentQuery
  };
};

export default useBClassFormLoader;
