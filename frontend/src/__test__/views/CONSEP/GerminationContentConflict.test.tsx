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
vi.mock('../../../api-service/consep/germinationTestAPI', () => ({
  getGerminationTestHeader: () => Promise.resolve({
    riaSkey: 123,
    activityTypeCd: 'G10',
    testCategoryCd: 'QA',
    testCompleteInd: 0,
    acceptResultInd: 0,
    germinatorEntry: '2024-10-31'
  }),
  getGermCounts: () => Promise.reject(
    Object.assign(new Error('Not found'), { response: { status: 404 } })
  ),
  getTestReplicates: () => Promise.resolve([]),
  putGermCounts: (...args: unknown[]) => putMock(...args)
}));

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
    // TanStack Query's mutate() applies .catch(noop) but the rejected Promise
    // from the mutationFn may still surface as an "unhandledRejection" for a
    // microtask before the catch is registered. Suppress it here.
    rejectionHandler = (event: PromiseRejectionEvent) => { event.preventDefault(); };
    window.addEventListener('unhandledrejection', rejectionHandler);
  });

  afterEach(() => {
    window.removeEventListener('unhandledrejection', rejectionHandler);
  });

  it('shows the conflict banner on 409 and stops further autosaves', async () => {
    const conflictError = Object.assign(new Error('Conflict'), { response: { status: 409 } });
    putMock.mockRejectedValue(conflictError);
    renderView();

    await screen.findByText(/Germination test result/i);
    fireEvent.change(screen.getByTestId('germ-date-1'), { target: { value: '2024-11-04' } });
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
});
