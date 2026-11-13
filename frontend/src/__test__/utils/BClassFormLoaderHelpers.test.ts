import {
  describe, it, expect, vi, beforeEach
} from 'vitest';
import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';

import {
  getLoadGate,
  getHydrationPlan,
  getHydratedProgress,
  HydrationPlan
} from '../../views/Seedlot/ContextContainerClassB/useBClassFormLoader';
import * as classBUtils from '../../views/Seedlot/ContextContainerClassB/utils';
import { initialProgressConfig } from '../../views/Seedlot/ContextContainerClassB/constants';
import { BClassAllStepData } from '../../views/Seedlot/ContextContainerClassB/definitions';
import { SeedlotBClassProgressPayloadType } from '../../types/SeedlotType';

vi.mock('../../views/Seedlot/ContextContainerClassB/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof classBUtils>();
  return {
    ...actual,
    resDataToState: vi.fn(() => ({ marker: 'tables' })),
    hydrateFromDraftPayload: vi.fn(() => ({ allStepData: { marker: 'draft' }, revisionCount: 7 })),
    withSeedlotSpzFallback: vi.fn((collection) => ({ ...collection, spzFallback: true }))
  };
});

const axiosErrorWith = (status: number): AxiosError => {
  const config = { headers: new AxiosHeaders() };
  const response: AxiosResponse = {
    status, statusText: '', headers: {}, config, data: {}
  };
  return new AxiosError(`Request failed ${status}`, 'ERR', config, undefined, response);
};

const baseGate = {
  editable: true,
  draftSettled: true,
  needsFullForm: false,
  fullFormFetched: false,
  ownershipLookupsReady: true,
  draftError: null,
  fullFormError: null
};

describe('getLoadGate', () => {
  it('waits for the draft of an editable seedlot', () => {
    expect(getLoadGate({ ...baseGate, draftSettled: false })).toEqual({ kind: 'loading' });
  });

  it('waits for the full form and the ownership lookups when the full form is needed', () => {
    expect(getLoadGate({ ...baseGate, needsFullForm: true })).toEqual({ kind: 'loading' });
    expect(getLoadGate({
      ...baseGate, needsFullForm: true, fullFormFetched: true, ownershipLookupsReady: false
    })).toEqual({ kind: 'loading' });
  });

  it('treats a 404 draft as "no draft yet", not a failure', () => {
    expect(getLoadGate({ ...baseGate, draftError: axiosErrorWith(404) })).toEqual({ kind: 'proceed' });
  });

  it('reports draft and full form failures with their own titles', () => {
    expect(getLoadGate({ ...baseGate, draftError: axiosErrorWith(500) })).toEqual({
      kind: 'error', title: 'Error retrieving form draft!', message: 'Request failed 500'
    });
    expect(getLoadGate({
      ...baseGate, needsFullForm: true, fullFormFetched: true, fullFormError: axiosErrorWith(503)
    })).toEqual({
      kind: 'error', title: 'Error retrieving seedlot data!', message: 'Request failed 503'
    });
  });

  it('proceeds once everything has settled', () => {
    expect(getLoadGate({ ...baseGate, needsFullForm: true, fullFormFetched: true }))
      .toEqual({ kind: 'proceed' });
  });
});

const draftData = {
  allStepData: {},
  progressStatus: initialProgressConfig,
  revisionCount: 3
} as unknown as SeedlotBClassProgressPayloadType;

const fullFormData = {} as Parameters<typeof classBUtils.resDataToState>[0];

const basePlan = {
  seedlotNumber: '60001',
  editable: false,
  isFormSubmitted: false,
  draftHasData: false,
  draftIsEmpty: false,
  draftNotFound: false,
  draftData: undefined,
  fullFormData: undefined,
  fullFormUpdatedAt: 111,
  defaultClientNumber: '00012797',
  defaultLocationCode: '00',
  methodsOfPayment: undefined,
  fundingSources: undefined,
  currentRevCount: 2,
  seedlot: undefined
};

describe('getHydrationPlan', () => {
  beforeEach(() => vi.clearAllMocks());

  it('hydrates a submitted seedlot from the saved tables, ignoring draft progress', () => {
    const plan = getHydrationPlan({
      ...basePlan, isFormSubmitted: true, fullFormData, draftData
    });
    expect(plan).toEqual({
      key: 'sub:60001:111',
      source: 'tables',
      stepData: { marker: 'tables' },
      revCount: 2
    });
    expect(classBUtils.resDataToState).toHaveBeenCalledWith(fullFormData, '00012797', undefined, undefined);
  });

  it('hydrates from a draft that has data, keeping its progress and revision', () => {
    const plan = getHydrationPlan({
      ...basePlan, editable: true, draftHasData: true, draftData
    });
    expect(plan).toEqual({
      key: 'draft:60001:3',
      source: 'draft',
      stepData: { marker: 'draft' },
      revCount: 7,
      savedProgress: initialProgressConfig
    });
  });

  it('falls back to the tables when an editable seedlot has an empty draft', () => {
    const plan = getHydrationPlan({
      ...basePlan, editable: true, draftIsEmpty: true, draftData, fullFormData
    });
    expect(plan?.key).toBe('pnd-empty:60001:111');
    expect(plan?.source).toBe('tables');
    expect(plan?.savedProgress).toBe(initialProgressConfig);
  });

  it('starts blank steps, with the SPZ fallback, for a seedlot that has no draft', () => {
    const plan = getHydrationPlan({ ...basePlan, editable: true, draftNotFound: true });
    expect(plan?.key).toBe('new:60001:00012797:00');
    expect(plan?.source).toBe('empty');
    expect(plan?.savedProgress).toBeUndefined();
    expect((plan?.stepData.collectionStep as unknown as { spzFallback: boolean }).spzFallback)
      .toBe(true);
  });

  it('returns null while no source is available yet', () => {
    expect(getHydrationPlan(basePlan)).toBeNull();
    expect(getHydrationPlan({ ...basePlan, isFormSubmitted: true })).toBeNull();
  });
});

describe('getHydratedProgress', () => {
  const plan = (overrides: Partial<HydrationPlan>): HydrationPlan => ({
    key: 'k',
    source: 'draft',
    stepData: {} as BClassAllStepData,
    revCount: 0,
    ...overrides
  });

  it('restores saved progress and marks the current step, without mutating it', () => {
    const progress = getHydratedProgress(plan({ savedProgress: initialProgressConfig }), 1, false);
    expect(progress?.ownership.isCurrent).toBe(true);
    expect(initialProgressConfig.ownership.isCurrent).toBe(false);
  });

  it('rebuilds progress for a submitted seedlot loaded from the tables', () => {
    const progress = getHydratedProgress(plan({ source: 'tables' }), 2, true);
    expect(progress?.interim.isCurrent).toBe(true);
  });

  it('leaves progress alone otherwise', () => {
    expect(getHydratedProgress(plan({ source: 'empty' }), 0, false)).toBeNull();
    expect(getHydratedProgress(plan({ source: 'tables' }), 0, false)).toBeNull();
  });
});
