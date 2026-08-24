import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GerminationContent from '../../../views/CONSEP/TestingActivities/GerminationContent';

vi.mock('../../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));

let currentRia = '123';

const countsByRia: Record<string, number> = { 123: 7, 456: 3 };

vi.mock('../../../api-service/consep/germinationTestAPI', () => ({
  getGerminationTestHeader: (riaKey: string) => Promise.resolve({
    riaSkey: Number(riaKey),
    activityTypeCd: `G-${riaKey}`,
    testCategoryCd: 'QA',
    testCompleteInd: 0,
    acceptResultInd: 0,
    germinatorEntry: '2024-10-31'
  }),
  getGermCounts: (riaKey: string) => Promise.resolve({
    riaSkey: Number(riaKey),
    updateTimestamp: `2026-01-0${riaKey === '123' ? 1 : 2}T00:00:00`,
    slots: [{
      slotIndex: 1,
      countDt: '2024-11-04',
      dayNoOfTest: 4,
      rep1NoSeedsGerm: countsByRia[riaKey]
    }]
  }),
  getTestReplicates: () => Promise.resolve([
    { replicateNumber: 1, totalNoSeeds: 50, repAcceptedInd: 1 }
  ]),
  putGermCounts: vi.fn()
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useParams: () => ({ riaKey: currentRia })
}));

const renderView = () => render(
  <BrowserRouter>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <GerminationContent />
    </QueryClientProvider>
  </BrowserRouter>
);

describe('GerminationContent riaKey switch', () => {
  it('drops the previous test\'s table instead of leaving it editable', async () => {
    currentRia = '123';
    const { rerender } = renderView();

    await waitFor(() => {
      expect(screen.getByTestId('germ-count-1-1')).toHaveValue(7);
    });

    // Navigating to another germination test reuses the same route element.
    // Without a remount, 123's slots stay on screen -- and editable -- while
    // 456's queries load, so an edit would autosave 123's snapshot onto 456.
    currentRia = '456';
    rerender(
      <BrowserRouter>
        <QueryClientProvider
          client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
        >
          <GerminationContent />
        </QueryClientProvider>
      </BrowserRouter>
    );

    expect(screen.queryByDisplayValue('7')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('germ-count-1-1')).toHaveValue(3);
    });
  });
});
