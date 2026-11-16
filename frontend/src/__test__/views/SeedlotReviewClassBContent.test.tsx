import React from 'react';
import {
  render, screen, fireEvent, waitFor, within
} from '@testing-library/react';
import { createMemoryRouter, RouterProvider, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  describe, it, expect, vi, beforeEach
} from 'vitest';

import ReviewContent from '../../views/Seedlot/SeedlotReviewClassB/ReviewContent';
import ClassBContext, { ClassBContextType } from '../../views/Seedlot/ContextContainerClassB/context';
import AuthContext from '../../contexts/AuthContext';
import { putBClassSeedlot } from '../../api-service/seedlotAPI';
import { updateSeedlotStatus } from '../../api-service/tscAdminAPI';
import { validateBClassReviewForm, buildBClassReviewPayload } from '../../views/Seedlot/SeedlotReviewClassB/utils';

const { stub } = vi.hoisted(() => ({
  stub: (name: string) => ({ default: () => <div data-testid={`stub-${name}`} /> })
}));

vi.mock('../../api-service/seedlotAPI', () => ({ putBClassSeedlot: vi.fn() }));
vi.mock('../../api-service/tscAdminAPI', () => ({ updateSeedlotStatus: vi.fn() }));
vi.mock('../../api-service/becCatalogueAPI', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));
vi.mock('../../views/Seedlot/SeedlotReviewClassB/utils', () => ({
  validateBClassReviewForm: vi.fn(),
  buildBClassReviewPayload: vi.fn(() => ({ built: true }))
}));
vi.mock('../../components/Breadcrumbs', () => stub('breadcrumbs'));
vi.mock('../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));
vi.mock('../../views/Seedlot/SeedlotReviewClassB/read/ApplicantAndSeedlotRead', () => stub('applicant-read'));
vi.mock('../../views/Seedlot/SeedlotReviewClassB/read/CollectionRead', () => stub('collection-read'));
vi.mock('../../views/Seedlot/SeedlotReviewClassB/read/InterimRead', () => stub('interim-read'));
vi.mock('../../views/Seedlot/SeedlotReviewClassB/read/ExtractionStorageRead', () => stub('extraction-read'));
vi.mock('../../views/Seedlot/SeedlotReviewClassB/read/AreaOfUseRead', () => stub('area-of-use-read'));
vi.mock('../../components/SeedlotReviewSteps/Ownership/Read', () => stub('ownership-read'));
vi.mock('../../components/SeedlotRegistrationSteps/BClassCollectionStep', () => stub('collection-edit'));
vi.mock('../../components/SeedlotRegistrationSteps/OwnershipStep', () => stub('ownership-edit'));
vi.mock('../../components/SeedlotRegistrationSteps/InterimStep', () => stub('interim-edit'));
vi.mock('../../components/SeedlotRegistrationSteps/ExtractionAndStorageStep', () => stub('extraction-edit'));

const contextFor = (statusCode: string) => ({
  seedlotNumber: '60001',
  seedlotData: {
    applicantClientNumber: '00012797',
    sourceInBc: true,
    seedlotStatus: { seedlotStatusCode: statusCode, description: statusCode === 'APP' ? 'Approved' : 'Submitted' }
  },
  richSeedlotData: { seedlot: {} },
  allStepData: { ownershipStep: [] },
  isFetchingData: false,
  isFormReady: true,
  fundingSourcesQuery: { isError: false },
  methodsOfPaymentQuery: { isError: false }
}) as unknown as ClassBContextType;

let landedAt = '';

const renderReview = ({ status = 'SUB', isTscAdmin = true } = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const Probe = () => {
    landedAt = `${window.location.pathname}`;
    return <div data-testid="elsewhere" />;
  };
  const router = createMemoryRouter([
    {
      path: '/seedlots/b-class-review/:seedlotNumber',
      element: (
        <AuthContext.Provider value={{ isTscAdmin } as never}>
          <ClassBContext.Provider value={contextFor(status)}>
            <ReviewContent />
            <Link to="/somewhere-else">leave page</Link>
          </ClassBContext.Provider>
        </AuthContext.Provider>
      )
    },
    { path: '/seedlots/details/:seedlotNumber', element: <Probe /> },
    { path: '/somewhere-else', element: <Probe /> }
  ], { initialEntries: ['/seedlots/b-class-review/60001'] });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
};

// Carbon keeps closed modals in the DOM, so page buttons are looked up outside them.
const page = () => within(document.querySelector('.seedlot-review-grid') as HTMLElement);
const actionRow = () => within(document.querySelector('.action-button-row') as HTMLElement);
const click = (name: string | RegExp) => {
  const inRow = actionRow().queryByRole('button', { name });
  fireEvent.click(inRow ?? page().getByRole('button', { name }));
};
const visibleModal = () => document.querySelector('.is-visible') as HTMLElement;
const clickInModal = (name: string | RegExp) => {
  const modal = visibleModal();
  const button = Array.from(modal.querySelectorAll('button')).find((b) => (
    typeof name === 'string' ? b.textContent === name : name.test(b.textContent ?? '')
  ));
  fireEvent.click(button!);
};

beforeEach(() => {
  vi.clearAllMocks();
  landedAt = '';
  vi.mocked(validateBClassReviewForm).mockReturnValue(true);
  vi.mocked(putBClassSeedlot).mockResolvedValue({} as never);
  vi.mocked(updateSeedlotStatus).mockResolvedValue({} as never);
});

describe('ReviewContent access', () => {
  it('sends a pending seedlot back to its details page', async () => {
    const router = renderReview({ status: 'PND' });
    await waitFor(() => expect(router.state.location.pathname).toBe('/seedlots/details/60001'));
  });

  it('shows a read-only review without TSC actions to a non-admin', () => {
    renderReview({ isTscAdmin: false });
    expect(screen.getByText('Review Seedlot 60001')).toBeInTheDocument();
    expect(page().queryByRole('button', { name: 'Edit seedlot' })).not.toBeInTheDocument();
    expect(actionRow().queryByRole('button', { name: 'Approve seedlot' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-area-of-use-read')).not.toBeInTheDocument();
  });

  it('marks an approved seedlot and hides the approve actions', () => {
    renderReview({ status: 'APP' });
    expect(screen.getByText('Seedlot approved:')).toBeInTheDocument();
    expect(actionRow().queryByRole('button', { name: 'Send back to pending' })).not.toBeInTheDocument();
    expect(page().getByRole('button', { name: 'Edit seedlot' })).toBeInTheDocument();
  });
});

describe('ReviewContent status changes', () => {
  it('approves a submitted seedlot after confirmation', async () => {
    const router = renderReview();
    click('Approve seedlot');
    clickInModal('Approve seedlot');
    await waitFor(() => expect(router.state.location.search).toBe('?statusOnSave=APP'));
    expect(updateSeedlotStatus).toHaveBeenCalledWith('60001', 'APP');
    expect(putBClassSeedlot).not.toHaveBeenCalled();
  });

  it('sends a seedlot back to pending after confirmation, or not when cancelled', async () => {
    renderReview();
    click('Send back to pending');
    clickInModal('Cancel');
    expect(updateSeedlotStatus).not.toHaveBeenCalled();
    click('Send back to pending');
    clickInModal('Send back to pending');
    await waitFor(() => expect(updateSeedlotStatus).toHaveBeenCalledWith('60001', 'PND'));
  });

  it('warns when the status update fails', async () => {
    vi.mocked(updateSeedlotStatus).mockRejectedValue(Object.assign(new Error('boom'), { code: 'ERR' }));
    renderReview();
    click('Approve seedlot');
    clickInModal('Approve seedlot');
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});

describe('ReviewContent editing', () => {
  it('switches to edit mode and saves valid edits', async () => {
    renderReview();
    click('Edit seedlot');
    expect(screen.getByTestId('stub-collection-edit')).toBeInTheDocument();
    click('Save edit');
    await waitFor(() => expect(putBClassSeedlot).toHaveBeenCalledWith('60001', { built: true }));
    await waitFor(() => expect(screen.getByTestId('stub-collection-read')).toBeInTheDocument());
    expect(updateSeedlotStatus).not.toHaveBeenCalled();
    expect(buildBClassReviewPayload).toHaveBeenCalled();
  });

  it('keeps an approved seedlot approved after saving edits', async () => {
    renderReview({ status: 'APP' });
    click('Edit seedlot');
    click('Save edit');
    await waitFor(() => expect(updateSeedlotStatus).toHaveBeenCalledWith('60001', 'APP'));
  });

  it('refuses to save an invalid form', () => {
    vi.mocked(validateBClassReviewForm).mockReturnValue(false);
    renderReview();
    click('Edit seedlot');
    click('Save edit');
    expect(toast.error).toHaveBeenCalled();
    expect(putBClassSeedlot).not.toHaveBeenCalled();
  });

  it('warns when saving edits fails', async () => {
    vi.mocked(putBClassSeedlot).mockRejectedValue(Object.assign(new Error('boom'), { code: 'ERR' }));
    renderReview();
    click('Edit seedlot');
    click('Save edit');
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it('saves edits before approving when approving from edit mode', async () => {
    renderReview();
    click('Edit seedlot');
    click('Approve seedlot');
    clickInModal('Approve seedlot');
    await waitFor(() => expect(updateSeedlotStatus).toHaveBeenCalledWith('60001', 'APP'));
    expect(putBClassSeedlot).toHaveBeenCalled();
  });
});

describe('ReviewContent leaving', () => {
  it('goes back to the details page from read mode', async () => {
    const router = renderReview();
    click('Back');
    await waitFor(() => expect(router.state.location.pathname).toBe('/seedlots/details/60001'));
  });

  it('asks before discarding edits', async () => {
    renderReview();
    click('Edit seedlot');
    click('Back to review');
    clickInModal('Discard changes');
    await waitFor(() => expect(screen.getByTestId('stub-collection-read')).toBeInTheDocument());
    expect(putBClassSeedlot).not.toHaveBeenCalled();
  });

  it('blocks navigation with unsaved edits, then saves and continues', async () => {
    const router = renderReview();
    click('Edit seedlot');
    fireEvent.click(screen.getByText('leave page'));
    await waitFor(() => expect(visibleModal()).toHaveTextContent('Any changes you made will be discarded'));
    expect(router.state.location.pathname).toBe('/seedlots/b-class-review/60001');
    clickInModal('Save changes');
    await waitFor(() => expect(router.state.location.pathname).toBe('/somewhere-else'));
    expect(putBClassSeedlot).toHaveBeenCalled();
  });

  it('blocks navigation with unsaved edits, then discards and continues', async () => {
    const router = renderReview();
    click('Edit seedlot');
    fireEvent.click(screen.getByText('leave page'));
    await waitFor(() => expect(visibleModal()).toHaveTextContent('Any changes you made will be discarded'));
    clickInModal('Discard changes');
    await waitFor(() => expect(router.state.location.pathname).toBe('/somewhere-else'));
  });

  it('stays on the page when the leave prompt is closed', async () => {
    const router = renderReview();
    click('Edit seedlot');
    fireEvent.click(screen.getByText('leave page'));
    await waitFor(() => expect(visibleModal()).toBeTruthy());
    fireEvent.click(visibleModal().querySelector('.cds--modal-close')!);
    await waitFor(() => expect(router.state.location.pathname).toBe('/seedlots/b-class-review/60001'));
    expect(landedAt).toBe('');
  });
});
