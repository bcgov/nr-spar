import React from 'react';
import {
  render, screen, fireEvent, waitFor
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GerminationContent from '../../../views/CONSEP/TestingActivities/GerminationContent';

vi.mock('../../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));

const putMock = vi.fn();
const headerMock = vi.fn();
const countsMock = vi.fn();
const noCounts = () => Promise.reject(
  Object.assign(new Error('Not found'), { response: { status: 404 } })
);
vi.mock('../../../api-service/consep/germinationTestAPI', () => ({
  getGerminationTestHeader: (...args: unknown[]) => headerMock(...args),
  getGermCounts: () => countsMock(),
  getTestReplicates: () => Promise.resolve([]),
  putGermCounts: (...args: unknown[]) => putMock(...args)
}));

const baseHeader = {
  riaSkey: 123,
  activityTypeCd: 'G10',
  testCategoryCd: 'QA',
  testCompleteInd: 0,
  acceptResultInd: 0,
  germinatorEntry: '2024-10-31'
};

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useParams: () => ({ riaKey: '123' })
}));

const renderView = () => render(
  <BrowserRouter>
    <QueryClientProvider client={new QueryClient({
      defaultOptions: { mutations: { throwOnError: false }, queries: { retry: false } }
    })}
    >
      <GerminationContent />
    </QueryClientProvider>
  </BrowserRouter>
);

describe('GerminationContent optimistic-lock conflict', () => {
  let rejectionHandler: (event: PromiseRejectionEvent) => void;

  beforeEach(() => {
    putMock.mockReset();
    headerMock.mockReset();
    headerMock.mockResolvedValue({ ...baseHeader });
    countsMock.mockReset();
    countsMock.mockImplementation(noCounts);
    // TanStack Query's mutate() applies .catch(noop) but the rejected Promise
    // from the mutationFn may still surface as an "unhandledRejection" for a
    // microtask before the catch is registered. Suppress it here.
    rejectionHandler = (event: PromiseRejectionEvent) => { event.preventDefault(); };
    window.addEventListener('unhandledrejection', rejectionHandler);
  });

  afterEach(() => {
    window.removeEventListener('unhandledrejection', rejectionHandler);
  });

  /**
   * Arriving at an empty count-date column fills today's date; arriving again,
   * now that it holds one, opens the calendar. Setting a specific date is
   * therefore two arrivals.
   */
  const setCountDate = (slotIndex: number, value: string) => {
    fireEvent.click(screen.getByTestId(`germ-date-trigger-${slotIndex}`));
    if (!screen.queryByTestId(`germ-date-${slotIndex}`)) {
      fireEvent.click(screen.getByTestId(`germ-date-trigger-${slotIndex}`));
    }
    fireEvent.change(screen.getByTestId(`germ-date-${slotIndex}`), { target: { value } });
  };

  it('shows the conflict banner on 409 and stops further autosaves', async () => {
    const conflictError = Object.assign(new Error('Conflict'), { response: { status: 409 } });
    putMock.mockRejectedValue(conflictError);
    renderView();

    await screen.findByText(/Germination test result/i);
    setCountDate(1, '2024-11-04');
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '5' } });

    await waitFor(
      () => expect(screen.getByText('Conflict detected')).toBeInTheDocument(),
      { timeout: 5000 }
    );

    putMock.mockClear();
    // Edit after the conflict: fireEvent.change fires React onChange even on
    // disabled inputs in jsdom, so this edit lands in component state despite
    // every input being disabled while conflicted (isEditable is false). The
    // assertion therefore proves useAutosave's `enabled` gate -- isEditable
    // folds in isConflict -- is what blocks the PUT, not DOM disabled state.
    // (Uses germ-count-1-1 instead of the brief's germ-count-2-1 -- both are
    // slot-1 inputs, rep 1 vs rep 2; either exercises the same gate.)
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '6' } });
    await new Promise((resolve) => { setTimeout(resolve, 4000); });
    expect(putMock).not.toHaveBeenCalled();
  }, 15000);

  // Regression for I5: the conflict reload must refetch the HEADER too, not
  // just germ-counts + replicates. germinatorEntry (day-calc anchor) and
  // testCompleteInd (the isEditable gate) live on the header, so a stale
  // header would leave the screen editable/miscalculating after reload.
  // Assertion: header refetch returns testCompleteInd:1 and the inputs become
  // disabled after Reload. (Also proves getGerminationTestHeader ran twice.)
  it('refetches the header on conflict reload and applies the fresh testCompleteInd', async () => {
    const conflictError = Object.assign(new Error('Conflict'), { response: { status: 409 } });
    putMock.mockRejectedValue(conflictError);
    // Initial load: editable. Reload: test now complete -> read-only.
    headerMock
      .mockResolvedValueOnce({ ...baseHeader, testCompleteInd: 0 })
      .mockResolvedValue({ ...baseHeader, testCompleteInd: 1 });
    renderView();

    await screen.findByText(/Germination test result/i);
    expect(screen.getByTestId('germ-date-trigger-1')).not.toBeDisabled();

    setCountDate(1, '2024-11-04');
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '5' } });

    await waitFor(
      () => expect(screen.getByText('Conflict detected')).toBeInTheDocument(),
      { timeout: 5000 }
    );

    fireEvent.click(screen.getByText('Reload'));

    // The refetched header (testCompleteInd:1) must reapply and disable inputs.
    await waitFor(() => expect(screen.getByTestId('germ-date-trigger-1')).toBeDisabled());
    // Header endpoint hit at least twice: initial mount + conflict reload.
    expect(headerMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  }, 15000);

  // #2841: legacy CONSEP, and updateGerminationTest itself, store "completed" as -1.
  // A dated count record is on file, so without the read-only gate the edit below
  // would save: it is that gate, not the "nothing dated yet" rule, that stops it.
  it.each([
    ['completed (-1)', { testCompleteInd: -1, acceptResultInd: 0 }],
    ['accepted only (-1)', { testCompleteInd: 0, acceptResultInd: -1 }],
    ['completed and accepted (-1)', { testCompleteInd: -1, acceptResultInd: -1 }]
  ])('treats a %s test as read-only and does not save it', async (_label, flags) => {
    headerMock.mockResolvedValue({ ...baseHeader, ...flags });
    countsMock.mockResolvedValue({
      riaSkey: 123,
      slots: [{ slotIndex: 1, countDt: '2024-11-04', rep1NoSeedsGerm: 1 }],
      updateTimestamp: '2026-01-01T00:00:00'
    });
    renderView();

    await screen.findByText(/Germination test result/i);
    expect(screen.queryByText('Completed') !== null).toBe(!!flags.testCompleteInd);
    expect(screen.queryByText('Accepted') !== null).toBe(!!flags.acceptResultInd);
    expect(screen.getByTestId('germ-date-trigger-1')).toBeDisabled();

    // jsdom still fires onChange on a disabled input, so this proves the save gate.
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '5' } });
    await new Promise((resolve) => { setTimeout(resolve, 1200); });
    expect(putMock).not.toHaveBeenCalled();
  });

  it('saves the same edit on an open test (control for the read-only cases)', async () => {
    putMock.mockResolvedValue({ updateTimestamp: '2026-01-02T00:00:00' });
    countsMock.mockResolvedValue({
      riaSkey: 123,
      slots: [{ slotIndex: 1, countDt: '2024-11-04', rep1NoSeedsGerm: 1 }],
      updateTimestamp: '2026-01-01T00:00:00'
    });
    renderView();

    await screen.findByText(/Germination test result/i);
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '5' } });
    await waitFor(() => expect(putMock).toHaveBeenCalledTimes(1), { timeout: 3000 });
  });

  // #2841: an edit made while a PUT is in flight used to be dropped on leaving the page.
  it('sends an edit made during an in-flight save after it, with the new timestamp', async () => {
    let finishFirst: (value: unknown) => void = () => {};
    putMock
      .mockImplementationOnce(() => new Promise((resolve) => { finishFirst = resolve; }))
      .mockResolvedValue({ updateTimestamp: '2026-01-03T00:00:00' });
    const { unmount } = renderView();

    await screen.findByText(/Germination test result/i);
    setCountDate(1, '2024-11-04');
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '5' } });
    await waitFor(() => expect(putMock).toHaveBeenCalledTimes(1), { timeout: 3000 });

    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '6' } });
    unmount();
    finishFirst({ updateTimestamp: '2026-01-02T00:00:00' });

    await waitFor(() => expect(putMock).toHaveBeenCalledTimes(2));
    const payload = putMock.mock.calls[1][1];
    expect(payload.updateTimestamp).toBe('2026-01-02T00:00:00');
    expect(payload.days[0].rep1NoSeedsGerm).toBe(6);
  }, 10000);

  // #2841 review: on a test with no count record yet, clearing the only date while the
  // PUT that creates the record is in flight, then leaving, must still send the clear.
  it('sends a date cleared during the first save after it, once the record exists', async () => {
    let finishFirst: (value: unknown) => void = () => {};
    putMock
      .mockImplementationOnce(() => new Promise((resolve) => { finishFirst = resolve; }))
      .mockResolvedValue({ updateTimestamp: '2026-01-03T00:00:00' });
    const { unmount } = renderView();

    await screen.findByText(/Germination test result/i);
    setCountDate(1, '2024-11-04');
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '5' } });
    await waitFor(() => expect(putMock).toHaveBeenCalledTimes(1), { timeout: 3000 });

    fireEvent.change(screen.getByTestId('germ-date-1'), { target: { value: '' } });
    unmount();
    finishFirst({ updateTimestamp: '2026-01-02T00:00:00' });

    await waitFor(() => expect(putMock).toHaveBeenCalledTimes(2));
    const payload = putMock.mock.calls[1][1];
    expect(payload.updateTimestamp).toBe('2026-01-02T00:00:00');
    expect(payload.days).toEqual([]);
  }, 10000);
});
