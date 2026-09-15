import React from 'react';
import {
  render, screen, waitFor, fireEvent
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GerminationContent from '../../../views/CONSEP/TestingActivities/GerminationContent';

vi.mock('../../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));

const putMock = vi.fn().mockResolvedValue({ updateTimestamp: '2026-01-02T00:00:00' });
vi.mock('../../../api-service/consep/germinationTestAPI', () => ({
  getGerminationTestHeader: () => Promise.resolve({
    riaSkey: 123,
    activityTypeCd: 'G10',
    testCategoryCd: 'QA',
    testCompleteInd: 0,
    acceptResultInd: 0,
    germinatorEntry: '2024-10-31',
    requestId: 'TST20170140',
    seedlotNumber: '07080',
    vegetationState: 'SX'
  }),
  // Existing germ-count row already present on load.
  getGermCounts: () => Promise.resolve({
    riaSkey: 123,
    updateTimestamp: '2026-01-01T00:00:00',
    slots: [{
      slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4, rep1NoSeedsGerm: 5
    }]
  }),
  // Four persisted replicates.
  getTestReplicates: () => Promise.resolve([
    { replicateNumber: 1, totalNoSeeds: 100, repAcceptedInd: 1, tolrncOvrrdeDesc: null },
    { replicateNumber: 2, totalNoSeeds: 100, repAcceptedInd: 1, tolrncOvrrdeDesc: null },
    { replicateNumber: 3, totalNoSeeds: 100, repAcceptedInd: 1, tolrncOvrrdeDesc: null },
    { replicateNumber: 4, totalNoSeeds: 100, repAcceptedInd: 1, tolrncOvrrdeDesc: null }
  ]),
  putGermCounts: (...args: unknown[]) => putMock(...args)
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useParams: () => ({ riaKey: '123' })
}));

const renderView = () => render(
  <BrowserRouter>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <GerminationContent />
    </QueryClientProvider>
  </BrowserRouter>
);

describe('GerminationContent hydration (no ghost autosave)', () => {
  beforeEach(() => {
    putMock.mockClear();
  });

  // Regression for C1: opening a test that already has data must not fire an
  // autosave PUT and must not surface a "saved" toast, because the user made
  // no edits. The bug was a markSaved effect keyed on [isHydrated] that
  // captured a stale (pre-hydration) autosaveData closure, leaving savedRef a
  // render behind so useAutosave saw a "change" and PUT ~800ms after load.
  it('does not PUT or toast when opening a test that already has data', async () => {
    renderView();
    await screen.findByText(/Germination test result/i);
    // Confirm the hydrated data actually rendered.
    await waitFor(() => {
      expect(screen.getByTestId('germ-count-1-1')).toHaveValue('5');
    });
    // Wait well past debounce (800ms) and maxWait (3000ms).
    await new Promise((resolve) => { setTimeout(resolve, 4000); });
    expect(putMock).not.toHaveBeenCalled();
    expect(screen.queryByText('Daily germination counts saved')).not.toBeInTheDocument();
  }, 15000);

  // Clearing the only count date used to be a local-only change: the autosave
  // gate required a dated slot, so no PUT went out and the row on the server
  // kept the date the user had just removed.
  it('persists clearing the last count date', async () => {
    renderView();
    await waitFor(() => {
      expect(screen.getByTestId('germ-count-1-1')).toHaveValue('5');
    });

    // Opening the cell that already holds a date shows the picker input.
    fireEvent.click(screen.getByTestId('germ-date-trigger-1'));
    fireEvent.change(await screen.findByTestId('germ-date-1'), { target: { value: '' } });

    await waitFor(() => {
      expect(putMock).toHaveBeenCalled();
    }, { timeout: 6000 });
    const [, payload] = putMock.mock.calls[0];
    expect(payload.days).toEqual([]);
    expect(payload.updateTimestamp).toBe('2026-01-01T00:00:00');
  }, 15000);
});
