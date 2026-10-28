import React from 'react';
import {
  fireEvent, render, screen, waitFor
} from '@testing-library/react';
import {
  MemoryRouter, Route, Routes, useLocation
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AClassFormProgress from '../../views/Seedlot/SeedlotDetails/FormProgress/AClassFormProgress';
import BClassFormProgress from '../../views/Seedlot/SeedlotDetails/FormProgress/BClassFormProgress';
import {
  getAClassSeedlotProgressStatus,
  getBClassSeedlotProgressStatus
} from '../../api-service/seedlotAPI';
import { initialProgressConfig as aClassInitialProgress } from '../../views/Seedlot/ContextContainerClassA/constants';
import { initialProgressConfig as bClassInitialProgress } from '../../views/Seedlot/ContextContainerClassB/constants';
import { QueryStatusType } from '../../types/QueryStatusType';
import { SeedlotStatusCode } from '../../types/SeedlotType';

vi.mock('../../api-service/seedlotAPI', () => ({
  getAClassSeedlotProgressStatus: vi.fn(),
  getBClassSeedlotProgressStatus: vi.fn()
}));

type FormProgressComponent = typeof AClassFormProgress | typeof BClassFormProgress;

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

const renderProgress = (
  Component: FormProgressComponent,
  seedlotStatusCode: SeedlotStatusCode | undefined,
  getSeedlotQueryStatus: QueryStatusType = 'success'
) => render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter initialEntries={['/details']}>
      <Routes>
        <Route
          path="/details"
          element={(
            <Component
              seedlotNumber="63001"
              seedlotStatusCode={seedlotStatusCode}
              getSeedlotQueryStatus={getSeedlotQueryStatus}
            />
          )}
        />
        <Route path="*" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>
);

describe.each([
  {
    name: 'AClassFormProgress',
    Component: AClassFormProgress as FormProgressComponent,
    fetchProgress: vi.mocked(getAClassSeedlotProgressStatus),
    progress: aClassInitialProgress,
    firstStep: 'Collection',
    registrationPath: '/seedlots/a-class-registration/63001'
  },
  {
    name: 'BClassFormProgress',
    Component: BClassFormProgress as FormProgressComponent,
    fetchProgress: vi.mocked(getBClassSeedlotProgressStatus),
    progress: bClassInitialProgress,
    firstStep: 'Collection information',
    registrationPath: '/seedlots/b-class-registration/63001'
  }
])('$name', ({
  Component, fetchProgress, progress, firstStep, registrationPath
}) => {
  beforeEach(() => {
    fetchProgress.mockReset();
  });

  it('loads saved progress for a pending seedlot and links to the form', async () => {
    fetchProgress.mockResolvedValue({ data: progress } as never);
    renderProgress(Component, 'PND');

    expect(await screen.findByText(firstStep)).toBeInTheDocument();
    expect(fetchProgress).toHaveBeenCalledWith('63001');

    fireEvent.click(screen.getByRole('button', { name: /Edit seedlot form/i }));
    expect(screen.getByTestId('location')).toHaveTextContent(registrationPath);
  });

  it('navigates to the clicked step', async () => {
    fetchProgress.mockResolvedValue({ data: progress } as never);
    renderProgress(Component, 'INC');

    fireEvent.click(await screen.findByText('Ownership'));
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(`${registrationPath}?step=2`);
    });
  });

  it('shows the view button and skips the fetch once submitted', () => {
    renderProgress(Component, 'SUB');

    expect(screen.getByRole('button', { name: /View your seedlot/i })).toBeInTheDocument();
    expect(screen.getByText(firstStep)).toBeInTheDocument();
    expect(fetchProgress).not.toHaveBeenCalled();
  });

  it('shows a skeleton while the seedlot is loading', () => {
    const { container } = renderProgress(Component, undefined, 'pending');

    expect(container.querySelector('.cds--progress.cds--skeleton, .bx--progress.bx--skeleton, [class*="skeleton"]'))
      .not.toBeNull();
    expect(screen.getByRole('button', { name: /Edit seedlot form/i })).toBeDisabled();
  });

  it('falls back to the initial progress when none is saved yet', async () => {
    fetchProgress.mockRejectedValue({ response: { status: 404 }, message: 'Not found' });
    renderProgress(Component, 'PND');

    expect(await screen.findByText(firstStep)).toBeInTheDocument();
    expect(screen.queryByText('Network errors...')).not.toBeInTheDocument();
  });

  it('shows a network error when the progress request fails', async () => {
    fetchProgress.mockRejectedValue({ response: { status: 500 }, message: 'Server exploded' });
    renderProgress(Component, 'PND');

    expect(await screen.findByText('Network errors...')).toBeInTheDocument();
    expect(screen.getByText('Server exploded')).toBeInTheDocument();
  });
});
