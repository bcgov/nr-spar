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

// Two dated days. Day one already has abnormals on file; day two has none, so
// the screen has to tell "none recorded" from "recorded as zero".
vi.mock('../../../api-service/consep/germinationTestAPI', () => ({
  getGerminationTestHeader: () => Promise.resolve({
    riaSkey: 123,
    activityTypeCd: 'G10',
    testCategoryCd: 'STD',
    testCompleteInd: 0,
    acceptResultInd: 0,
    germinatorEntry: '2024-10-31',
    requestId: 'TST20170140',
    seedlotNumber: '07080',
    vegetationState: 'SX'
  }),
  getGermCounts: () => Promise.resolve({
    riaSkey: 123,
    updateTimestamp: '2026-01-01T00:00:00',
    slots: [
      {
        slotIndex: 1,
        dailyGermSkey: 1001,
        countDt: '2024-11-04',
        dayNoOfTest: 4,
        rep1NoSeedsGerm: 10,
        rep2NoSeedsGerm: 8,
        rep1Abnormal: { abnormalNumReverseEmbryo: 3, abnormalNumWeak: 2 },
        rep2Abnormal: { abnormalNumRotten: 1 },
        rep3Abnormal: {},
        rep4Abnormal: {}
      },
      {
        slotIndex: 2,
        dailyGermSkey: 1002,
        countDt: '2024-11-06',
        dayNoOfTest: 6,
        rep1NoSeedsGerm: 4
      }
    ]
  }),
  getTestReplicates: () => Promise.resolve([1, 2, 3, 4].map((n) => ({
    replicateNumber: n,
    totalNoSeeds: 100,
    repAcceptedInd: 1,
    tolrncOvrrdeDesc: null
  }))),
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

describe('Abnormal seedlings table (#2606)', () => {
  beforeEach(() => {
    putMock.mockClear();
  });

  // AC2: opening a screen that already has data shows the abnormal counts for a
  // count day without the user having to pick one first.
  it('shows the first dated day\'s abnormals on load', async () => {
    renderView();
    await screen.findByText(/Germination test result/i);

    expect(await screen.findByText(/Abnormal seedlings/i)).toBeInTheDocument();
    expect(screen.getByText(/2024-11-04/)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('abnormal-1-re')).toHaveValue('3');
    });
    expect(screen.getByTestId('abnormal-1-wk')).toHaveValue('2');
    expect(screen.getByTestId('abnormal-2-rot')).toHaveValue('1');
    // Rep 1: 3 reverse-embryo + 2 weak.
    expect(screen.getByTestId('abnormal-total-1')).toHaveTextContent('5');
  });

  // AC1/AC2: the abnormals belong to the count day selected in the germinants
  // table, and clicking through the days swaps what the table shows.
  it('follows the count day selected in the germinants table', async () => {
    renderView();
    await screen.findByText(/Germination test result/i);
    await waitFor(() => {
      expect(screen.getByTestId('abnormal-1-re')).toHaveValue('3');
    });

    fireEvent.focus(screen.getByTestId('germ-count-1-2'));

    await waitFor(() => {
      expect(screen.getByText(/2024-11-06/)).toBeInTheDocument();
    });
    // Day two has no abnormal row of its own, so every cell reads empty --
    // not zero, which would be a recorded count.
    expect(screen.getByTestId('abnormal-1-re')).toHaveValue('');
    expect(screen.getByTestId('abnormal-total-1')).toHaveTextContent('0');
  });

  // The backend rebuilds the whole abnormal row from what it is sent, so a
  // partial set would NULL the replicates it omits; validateAbnormalsAllOrNone
  // rejects one outright.
  it('autosaves a new abnormal count with all four replicates', async () => {
    renderView();
    await screen.findByText(/Germination test result/i);
    await waitFor(() => {
      expect(screen.getByTestId('abnormal-1-re')).toHaveValue('3');
    });

    fireEvent.change(screen.getByTestId('abnormal-3-tw'), { target: { value: '2' } });

    await waitFor(() => expect(putMock).toHaveBeenCalled(), { timeout: 5000 });
    const payload = putMock.mock.calls[0][1];
    const dayOne = payload.days.find((d: { slotIndex: number }) => d.slotIndex === 1);
    expect(dayOne.rep3Abnormal).toMatchObject({ abnormalNumTwisted: 2 });
    expect(dayOne.rep1Abnormal).toBeDefined();
    expect(dayOne.rep4Abnormal).toBeDefined();
    // Day two was never touched, so it must not carry abnormals at all.
    const dayTwo = payload.days.find((d: { slotIndex: number }) => d.slotIndex === 2);
    expect(dayTwo.rep1Abnormal).toBeUndefined();
  });

  // Every abnormal column is @Max(999) on the API, so a larger value would 400
  // the whole germ-count save rather than just this cell.
  it('refuses an abnormal count above 999', async () => {
    renderView();
    await screen.findByText(/Germination test result/i);
    await waitFor(() => {
      expect(screen.getByTestId('abnormal-1-re')).toHaveValue('3');
    });

    fireEvent.change(screen.getByTestId('abnormal-1-re'), { target: { value: '1000' } });
    expect(screen.getByTestId('abnormal-1-re')).toHaveValue('3');

    fireEvent.change(screen.getByTestId('abnormal-1-re'), { target: { value: '999' } });
    expect(screen.getByTestId('abnormal-1-re')).toHaveValue('999');
  });

  // The over-limit rule now covers both halves, matching the backend.
  it('flags a replicate whose germinated plus abnormal exceeds its seeds', async () => {
    renderView();
    await screen.findByText(/Germination test result/i);
    await waitFor(() => {
      expect(screen.getByTestId('abnormal-1-re')).toHaveValue('3');
    });

    // Rep 1 has 14 germinated across both days and 5 abnormal already on file
    // (3 reverse-embryo + 2 weak); another 90 takes the pair past 100.
    fireEvent.change(screen.getByTestId('abnormal-1-oth'), { target: { value: '90' } });

    expect(await screen.findByText(/Germinated \+ abnormal \(109\) exceeds number of seeds \(100\)/))
      .toBeInTheDocument();
  });
});
