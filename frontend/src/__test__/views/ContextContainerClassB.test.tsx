import React, { useContext, useState } from 'react';
import {
  render, screen, fireEvent, waitFor, act
} from '@testing-library/react';
import {
  MemoryRouter, Routes, Route, useLocation
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  describe, it, expect, vi, beforeEach, afterEach
} from 'vitest';

import ContextContainerClassB from '../../views/Seedlot/ContextContainerClassB';
import ClassBContext from '../../views/Seedlot/ContextContainerClassB/context';
import SeedlotRegWizardContext from '../../contexts/SeedlotRegWizardContext';
import { initEmptySteps, initProgressBar } from '../../views/Seedlot/ContextContainerClassB/utils';
import { initialProgressConfig } from '../../views/Seedlot/ContextContainerClassB/constants';
import { putBClassSeedlot, putBClassSeedlotProgress } from '../../api-service/seedlotAPI';
import type { BClassAllStepData } from '../../views/Seedlot/ContextContainerClassB/definitions';

vi.mock('../../api-service/seedlotAPI', () => ({
  putBClassSeedlot: vi.fn(),
  putBClassSeedlotProgress: vi.fn()
}));
vi.mock('../../api-service/becCatalogueAPI', () => ({ default: vi.fn().mockResolvedValue([]) }));

const loader = {
  canPersistDraft: true,
  isFormReady: true,
  setFormDraftRevCount: vi.fn(),
  markDraftSaved: vi.fn(),
  resetEditsOnHydrate: vi.fn(),
  copyCollectorAgency: true
};

vi.mock('../../views/Seedlot/ContextContainerClassB/useBClassFormLoader', () => ({
  default: ({ formStep }: { formStep: number }) => {
    const [allStepData, setAllStepData] = useState<BClassAllStepData>(() => {
      const steps = initEmptySteps('00012797', '00');
      steps.interimStep.useCollectorAgencyInfo.value = loader.copyCollectorAgency;
      return steps;
    });
    const [progressStatus, setProgressStatus] = useState(() => initProgressBar(formStep, initialProgressConfig));
    const [draftUpdatedAt, setDraftUpdatedAt] = useState(1);
    return {
      seedlotQuery: { data: { seedlot: { sourceInBc: true, seedlotStatus: { seedlotStatusCode: 'PND' } } } },
      getFormDraftQuery: {
        isSuccess: true,
        dataUpdatedAt: draftUpdatedAt,
        refetch: () => setDraftUpdatedAt((n) => n + 1)
      },
      allStepData,
      setAllStepData,
      progressStatus,
      setProgressStatus,
      formDraftRevCount: 3,
      setFormDraftRevCount: loader.setFormDraftRevCount,
      isFormReady: loader.isFormReady,
      isFormIncomplete: true,
      isFormSubmitted: false,
      canPersistDraft: loader.canPersistDraft,
      isFetchingData: false,
      defaultClientNumber: '00012797',
      defaultLocationCode: '00',
      resetEditsOnHydrate: loader.resetEditsOnHydrate,
      markDraftSaved: loader.markDraftSaved,
      fundingSourcesQuery: {},
      methodsOfPaymentQuery: {}
    };
  }
}));

const Consumer = () => {
  const ctx = useContext(ClassBContext);
  const wizard = useContext(SeedlotRegWizardContext);
  const collection = ctx.allStepData.collectionStep;
  const current = Object.entries(ctx.progressStatus).find(([, s]) => s.isCurrent)?.[0];
  return (
    <div>
      <span data-testid="step">{ctx.formStep}</span>
      <span data-testid="current">{current}</span>
      <span data-testid="save-status">{ctx.saveStatus ?? 'none'}</span>
      <span data-testid="save-description">{ctx.saveDescription}</span>
      <span data-testid="interim-agency">{ctx.allStepData.interimStep.agencyName.value}</span>
      <span data-testid="wizard-seedlot">{wizard.seedlotNumber}</span>
      <button type="button" onClick={() => ctx.setStep(1)}>next</button>
      <button type="button" onClick={() => ctx.setStep(-1)}>back</button>
      <button type="button" onClick={() => ctx.handleSaveBtn()}>save</button>
      <button type="button" onClick={() => ctx.getFormDraftQuery.refetch()}>reload draft</button>
      <button
        type="button"
        onClick={() => ctx.setStepData('collectionStep', {
          ...collection,
          collectorAgency: { ...collection.collectorAgency, value: '00099999' },
          locationCode: { ...collection.locationCode, value: '07' }
        })}
      >
        edit collection
      </button>
      <button
        type="button"
        onClick={() => wizard.setStepData('interimStep', ctx.allStepData.interimStep)}
      >
        wizard edit
      </button>
      <button
        type="button"
        onClick={() => ctx.submitSeedlot.mutate({} as never)}
      >
        submit
      </button>
    </div>
  );
};

let landedAt = '';
const DetailsProbe = () => {
  const location = useLocation();
  landedAt = `${location.pathname}${location.search}`;
  return <div data-testid="details" />;
};

const renderContainer = (query = '') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/seedlots/b-class-registration/60001${query}`]}>
        <Routes>
          <Route
            path="/seedlots/b-class-registration/:seedlotNumber"
            element={<ContextContainerClassB><Consumer /></ContextContainerClassB>}
          />
          <Route path="/seedlots/details/:seedlotNumber" element={<DetailsProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const conflictError = () => new AxiosError('Conflict', 'ERR_BAD_REQUEST', { headers: new AxiosHeaders() }, undefined, {
  status: 409, statusText: '', headers: {}, config: { headers: new AxiosHeaders() }, data: { status: 409 }
});

const text = (id: string) => screen.getByTestId(id).textContent;

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(loader, { canPersistDraft: true, isFormReady: true, copyCollectorAgency: true });
  vi.mocked(putBClassSeedlotProgress).mockResolvedValue({ revisionCount: 4 } as never);
  vi.mocked(putBClassSeedlot).mockResolvedValue({} as never);
  landedAt = '';
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ContextContainerClassB steps', () => {
  it('opens at the step in the URL, clamped to the four steps', () => {
    const { unmount } = renderContainer('?step=3');
    expect(text('step')).toBe('2');
    unmount();
    renderContainer('?step=9');
    expect(text('step')).toBe('3');
  });

  it('starts at the first step for a missing or bad step', () => {
    renderContainer('?step=abc');
    expect(text('step')).toBe('0');
    expect(text('wizard-seedlot')).toBe('60001');
  });

  it('moves between steps, marking the current one in the progress bar and the URL', () => {
    const replace = vi.spyOn(window.history, 'replaceState');
    renderContainer();
    fireEvent.click(screen.getByText('next'));
    expect(text('step')).toBe('1');
    expect(text('current')).toBe('ownership');
    expect(replace).toHaveBeenLastCalledWith(null, '', '?step=2');
    fireEvent.click(screen.getByText('next'));
    fireEvent.click(screen.getByText('next'));
    expect(text('current')).toBe('extraction');
    fireEvent.click(screen.getByText('back'));
    expect(text('current')).toBe('interim');
  });
});

describe('ContextContainerClassB step data', () => {
  it('copies the collector agency into the interim step when that box is ticked', () => {
    renderContainer();
    fireEvent.click(screen.getByText('edit collection'));
    expect(text('interim-agency')).toBe('00099999');
  });

  it('leaves the interim agency alone when the box is not ticked', () => {
    loader.copyCollectorAgency = false;
    renderContainer();
    const before = text('interim-agency');
    fireEvent.click(screen.getByText('edit collection'));
    expect(text('interim-agency')).toBe(before);
  });
});

describe('ContextContainerClassB saving', () => {
  it('saves the draft on request, sending progress with no current step', async () => {
    renderContainer();
    fireEvent.click(screen.getByText('save'));
    expect(text('save-description')).toBe('Saving...');
    await waitFor(() => expect(text('save-status')).toBe('finished'));
    expect(text('save-description')).toBe('Changes saved!');
    const [seedlot, payload] = vi.mocked(putBClassSeedlotProgress).mock.calls[0];
    expect(seedlot).toBe('60001');
    expect(payload.revisionCount).toBe(3);
    expect(Object.values(payload.progressStatus).every((s) => !s.isCurrent)).toBe(true);
    expect(loader.setFormDraftRevCount).toHaveBeenCalledWith(4);
    expect(loader.markDraftSaved).toHaveBeenCalledWith(4);
  });

  it('stops saving after a revision conflict', async () => {
    vi.mocked(putBClassSeedlotProgress).mockRejectedValue(conflictError());
    renderContainer();
    fireEvent.click(screen.getByText('save'));
    await waitFor(() => expect(text('save-status')).toBe('conflict'));
    fireEvent.click(screen.getByText('save'));
    expect(putBClassSeedlotProgress).toHaveBeenCalledTimes(1);
  });

  it('can save again once the draft is reloaded after a conflict', async () => {
    vi.mocked(putBClassSeedlotProgress).mockRejectedValueOnce(conflictError());
    renderContainer();
    fireEvent.click(screen.getByText('save'));
    await waitFor(() => expect(text('save-status')).toBe('conflict'));

    fireEvent.click(screen.getByText('reload draft'));
    expect(text('save-status')).toBe('none');
    expect(text('save-description')).toBe('Save changes');

    fireEvent.click(screen.getByText('save'));
    await waitFor(() => expect(text('save-status')).toBe('finished'));
    expect(putBClassSeedlotProgress).toHaveBeenCalledTimes(2);
  });

  it('reports any other save failure', async () => {
    vi.mocked(putBClassSeedlotProgress).mockRejectedValue(new Error('network down'));
    renderContainer();
    fireEvent.click(screen.getByText('save'));
    await waitFor(() => expect(text('save-status')).toBe('error'));
    expect(text('save-description')).toBe('Save changes failed');
  });

  it('does not save a draft the loader says cannot be saved', () => {
    loader.canPersistDraft = false;
    renderContainer();
    fireEvent.click(screen.getByText('save'));
    expect(putBClassSeedlotProgress).not.toHaveBeenCalled();
  });

  it('autosaves edits every ten seconds, then clears the saved message', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderContainer();
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(putBClassSeedlotProgress).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('wizard edit'));
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(putBClassSeedlotProgress).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(text('save-status')).toBe('finished'));
    await act(async () => { await vi.advanceTimersByTimeAsync(5_000); });
    expect(text('save-status')).toBe('none');
  });

  it('saves straight away after five edits', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderContainer();
    fireEvent.click(screen.getByText('save'));
    await waitFor(() => expect(text('save-status')).toBe('finished'));
    for (let i = 0; i < 5; i += 1) fireEvent.click(screen.getByText('edit collection'));
    // The saved message clears after 5s, re-running the effect that checks
    // the edit count; five edits trigger a save without waiting 10s.
    await act(async () => { await vi.advanceTimersByTimeAsync(5_100); });
    await waitFor(() => expect(putBClassSeedlotProgress).toHaveBeenCalledTimes(2));
  });

  it('saves the draft when leaving the form', async () => {
    const { unmount } = renderContainer();
    unmount();
    await waitFor(() => expect(putBClassSeedlotProgress).toHaveBeenCalledTimes(1));
  });
});

describe('ContextContainerClassB submit', () => {
  it('submits and opens the seedlot details with a success flag', async () => {
    renderContainer();
    fireEvent.click(screen.getByText('submit'));
    await waitFor(() => expect(screen.getByTestId('details')).toBeInTheDocument());
    expect(putBClassSeedlot).toHaveBeenCalledWith('60001', {});
    expect(loader.resetEditsOnHydrate).toHaveBeenCalled();
    expect(landedAt).toBe('/seedlots/details/60001?isSubmitSuccess=true');
  });
});
