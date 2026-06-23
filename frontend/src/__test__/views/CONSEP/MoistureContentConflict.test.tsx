import React from 'react';
import {
  render, screen, fireEvent, waitFor, act
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MoistureContent from '../../../views/CONSEP/TestingActivities/MoistureContent';

// ActivityResult uses material-react-table (MUI) which calls mediaQueryList.addEventListener,
// not supported in jsdom. Mock it out — it's not under test here.
vi.mock('../../../views/CONSEP/TestingActivities/ActivityResult', () => ({
  default: () => <div data-testid="activity-result-mock" />
}));

// PageTitle makes a real network call for favourite-activities — stub it out.
vi.mock('../../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));

const updateMock = vi.fn();
vi.mock('../../../api-service/consep/testingActivitiesAPI', () => ({
  default: (_t: string, fn: string, params: any) => {
    if (fn === 'getDataByRiaKey') {
      return Promise.resolve({
        standardActivityType: 'MCC',
        testCategoryCode: 'STD',
        riaComment: '',
        actualBeginDateTime: '2025-01-05T08:00:00',
        actualEndDateTime: '2025-01-18T16:00:00',
        updateTimestamp: '2025-01-18T16:00:00',
        seedlotNumber: '64132',
        replicatesList: []
      });
    }
    if (fn === 'updateActivityRecord') {
      return updateMock(params);
    }
    return Promise.resolve({});
  }
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useParams: () => ({ riaKey: '123' })
}));

const makeClient = () => new QueryClient({
  defaultOptions: {
    mutations: { throwOnError: false },
    queries: { retry: false }
  }
});

const renderView = () => render(
  <BrowserRouter>
    <QueryClientProvider client={makeClient()}>
      <MoistureContent />
    </QueryClientProvider>
  </BrowserRouter>
);

describe('MoistureContent optimistic-lock conflict', () => {
  let rejectionHandler: (event: PromiseRejectionEvent) => void;

  beforeEach(() => {
    updateMock.mockReset();
    // TanStack Query's mutate() applies .catch(noop) but the rejected Promise
    // from the mutationFn may still surface as an "unhandledRejection" for a
    // microtask before the catch is registered. Suppress it here.
    rejectionHandler = (event: PromiseRejectionEvent) => { event.preventDefault(); };
    window.addEventListener('unhandledrejection', rejectionHandler);
  });

  afterEach(() => {
    window.removeEventListener('unhandledrejection', rejectionHandler);
  });

  it('shows the conflict banner when an update returns 409', async () => {
    const conflictError = Object.assign(new Error('Conflict'), { response: { status: 409 } });
    updateMock.mockRejectedValue(conflictError);
    renderView();

    // Wait for data to load - use the actual title "Moisture content cones for lot 64132"
    await screen.findByText(/Moisture content cones for lot/i);

    const comments = await screen.findByLabelText(/Comments/i);
    await act(async () => {
      fireEvent.change(comments, { target: { value: 'edit one' } });
    });

    await waitFor(() => expect(screen.getByText('Conflict detected')).toBeInTheDocument());

    updateMock.mockClear();
    await act(async () => {
      fireEvent.change(comments, { target: { value: 'edit two' } });
    });
    await waitFor(() => expect(updateMock).not.toHaveBeenCalled());
  });
});
