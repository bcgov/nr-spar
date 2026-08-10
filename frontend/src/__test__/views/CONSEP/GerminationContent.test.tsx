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
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <GerminationContent />
    </QueryClientProvider>
  </BrowserRouter>
);

describe('GerminationContent', () => {
  beforeEach(() => {
    putMock.mockClear();
  });

  it('renders title and header card from the header API', async () => {
    renderView();
    await screen.findByText(/Germination test result/i);
    expect(await screen.findByText('TST20170140')).toBeInTheDocument();
    expect(screen.getByText('07080')).toBeInTheDocument();
  });

  it('defaults # seeds to 50 for QA category (AC4)', async () => {
    renderView();
    await screen.findByText(/Germination test result/i);
    await waitFor(() => {
      expect(screen.getByTestId('germ-seeds-1')).toHaveValue(50);
    });
  });

  it('autosaves via PUT once a count date and count exist', async () => {
    renderView();
    await screen.findByText(/Germination test result/i);
    fireEvent.change(screen.getByTestId('germ-date-1'), { target: { value: '2024-11-04' } });
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '5' } });
    await waitFor(() => expect(putMock).toHaveBeenCalled(), { timeout: 5000 });
    const payload = putMock.mock.calls[0][1];
    expect(payload.days[0]).toMatchObject({ slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4 });
    expect(payload.replicates).toHaveLength(4);
  });

  // Extended timeout: this test includes a real 4s wait (on top of the
  // findByText/waitFor calls above it) to prove no autosave PUT fires while
  // blocked, which exceeds vitest's default 5000ms per-test timeout.
  //
  // Deviation from brief: the brief's first count value was '60'. The
  // shared header mock above sets testCategoryCd: 'QA', which per AC4 (and
  // Task 4's getDefaultSeeds) defaults totalNoSeeds to 50 for every
  // replicate. 60 already exceeds 50, so checkOverLimit flags it and blocks
  // the very first autosave -- the putMock.toHaveBeenCalled() wait below
  // would never resolve. Using '5' (consistent with the sibling autosave
  // test) keeps rep-1 within the 50-seed QA limit so the first save can
  // succeed, while '999' still clearly exceeds the limit for the block
  // assertion that follows.
  // C3: clearing a rep's "# seeds" must surface a validation error (so the
  // row is flagged) and block autosave, because the payload would otherwise
  // miss totalNoSeeds and the backend @NotNull would 400 the whole request.
  it('shows an error and blocks autosave when # seeds is cleared', async () => {
    renderView();
    await screen.findByText(/Germination test result/i);
    fireEvent.change(screen.getByTestId('germ-date-1'), { target: { value: '2024-11-04' } });
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '5' } });
    await waitFor(() => expect(putMock).toHaveBeenCalled(), { timeout: 5000 });
    putMock.mockClear();
    // Clear rep 1's number of seeds.
    fireEvent.change(screen.getByTestId('germ-seeds-1'), { target: { value: '' } });
    expect(await screen.findByText('Number of seeds is required')).toBeInTheDocument();
    await new Promise((resolve) => { setTimeout(resolve, 4000); });
    expect(putMock).not.toHaveBeenCalled();
  }, 15000);

  it('blocks autosave while a rep is over limit (AC3)', async () => {
    renderView();
    await screen.findByText(/Germination test result/i);
    fireEvent.change(screen.getByTestId('germ-date-1'), { target: { value: '2024-11-04' } });
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '5' } });
    await waitFor(() => expect(putMock).toHaveBeenCalled(), { timeout: 5000 });
    putMock.mockClear();
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '999' } });
    expect(await screen.findByText(/exceeds number of seeds/i)).toBeInTheDocument();
    await new Promise((resolve) => { setTimeout(resolve, 4000); });
    expect(putMock).not.toHaveBeenCalled();
  }, 15000);
});
