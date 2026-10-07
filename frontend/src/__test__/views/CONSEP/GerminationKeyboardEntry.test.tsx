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
    testCategoryCd: 'STD',
    testCompleteInd: 0,
    acceptResultInd: 0,
    germinatorEntry: '2024-10-31',
    germinatorTrayId: 7,
    requestId: 'TST20170140',
    seedlotNumber: '07080',
    vegetationState: 'SX'
  }),
  getGermCounts: () => Promise.resolve({
    riaSkey: 123,
    updateTimestamp: '2026-01-01T00:00:00',
    slots: [{ slotIndex: 1, dailyGermSkey: 1001, countDt: '2024-11-04', dayNoOfTest: 4 }]
  }),
  getTestReplicates: () => Promise.resolve([1, 2, 3, 4].map((n) => ({
    replicateNumber: n,
    totalNoSeeds: 100,
    repAcceptedInd: 1,
    tolrncOvrrdeDesc: null
  }))),
  putGermCounts: (...args: unknown[]) => putMock(...args)
}));

const trayMock = vi.fn();
vi.mock('../../../api-service/consep/germinatorTrayAPI', () => ({
  getGerminatorTrayContents: (...args: unknown[]) => trayMock(...args)
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useParams: () => ({ riaKey: '123' }),
  useNavigate: () => navigateMock
}));

const renderView = () => render(
  <BrowserRouter>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <GerminationContent />
    </QueryClientProvider>
  </BrowserRouter>
);

const altY = () => fireEvent.keyDown(document.activeElement ?? window, { key: '¥', code: 'KeyY', altKey: true });

describe('Germination keyboard entry (#2681)', () => {
  beforeEach(() => {
    putMock.mockClear();
    navigateMock.mockClear();
    trayMock.mockReset();
  });

  it('runs date, replicates and abnormals on Enter alone, from the page opening', async () => {
    renderView();
    const date2 = await screen.findByTestId('germ-date-trigger-2');
    // The next empty column has focus, but opening the page writes nothing.
    await waitFor(() => expect(date2).toHaveFocus());
    expect(date2).toHaveTextContent('--');

    fireEvent.keyDown(date2, { key: 'Enter' });
    await waitFor(() => expect(screen.getByTestId('germ-count-1-2')).toHaveFocus());
    fireEvent.change(screen.getByTestId('germ-count-1-2'), { target: { value: '1' } });
    fireEvent.keyDown(screen.getByTestId('germ-count-1-2'), { key: 'Enter' });
    await waitFor(() => expect(screen.getByTestId('germ-count-2-2')).toHaveFocus());
    fireEvent.keyDown(screen.getByTestId('germ-count-2-2'), { key: 'Enter' });
    await waitFor(() => expect(screen.getByTestId('germ-count-3-2')).toHaveFocus());
    expect(screen.getByTestId('germ-count-2-2')).toHaveValue('0');
    fireEvent.keyDown(screen.getByTestId('germ-count-3-2'), { key: 'Enter' });
    await waitFor(() => expect(screen.getByTestId('germ-count-4-2')).toHaveFocus());
    fireEvent.keyDown(screen.getByTestId('germ-count-4-2'), { key: 'Enter' });

    const re = screen.getByTestId('abnormal-1-re');
    await waitFor(() => expect(re).toHaveFocus());
    fireEvent.keyDown(re, { key: 'Enter' });
    await waitFor(() => expect(screen.getByTestId('abnormal-1-str')).toHaveFocus());
    // An abnormal passed over stays empty rather than becoming a zero.
    expect(re).toHaveValue('');
    fireEvent.keyDown(screen.getByTestId('abnormal-1-pre'), { key: 'Enter' });
    await waitFor(() => expect(screen.getByTestId('abnormal-2-re')).toHaveFocus());
  });

  it('Alt+Y saves, then opens the next test on the tray', async () => {
    trayMock.mockResolvedValue([{ riaSkey: 100 }, { riaSkey: 123 }, { riaSkey: 456 }]);
    renderView();
    await screen.findByTestId('germ-count-1-1');
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '5' } });
    altY();
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/consep/germination-test/456'));
    expect(trayMock).toHaveBeenCalledWith(7);
    // The count typed just before the jump was saved, not left to a debounce.
    expect(putMock).toHaveBeenCalled();
  });

  it('Alt+Y on the last test of the tray stays put and says so', async () => {
    trayMock.mockResolvedValue([{ riaSkey: 100 }, { riaSkey: 123 }]);
    renderView();
    await screen.findByTestId('germ-count-1-1');
    altY();
    expect(await screen.findByText('This is the last test on the tray.')).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('Alt+Y will not leave a test whose counts cannot be saved', async () => {
    trayMock.mockResolvedValue([{ riaSkey: 123 }, { riaSkey: 456 }]);
    renderView();
    await screen.findByTestId('germ-count-1-1');
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value: '999' } });
    altY();
    expect(await screen.findByText(/Fix the errors on this test/)).toBeInTheDocument();
    expect(trayMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
