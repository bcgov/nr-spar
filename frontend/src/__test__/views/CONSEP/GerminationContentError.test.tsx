import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GerminationContent from '../../../views/CONSEP/TestingActivities/GerminationContent';

vi.mock('../../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));

const headerMock = vi.fn();
vi.mock('../../../api-service/consep/germinationTestAPI', () => ({
  getGerminationTestHeader: (...args: unknown[]) => headerMock(...args),
  getGermCounts: () => Promise.reject(
    Object.assign(new Error('Not found'), { response: { status: 404 } })
  ),
  getTestReplicates: () => Promise.resolve([]),
  putGermCounts: vi.fn()
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

describe('GerminationContent header failure', () => {
  beforeEach(() => {
    headerMock.mockReset();
    navigateMock.mockReset();
  });

  // Everything below the breadcrumbs is gated on the header having loaded, so
  // a header failure that is not a 404 used to leave nothing but breadcrumbs
  // on screen — indistinguishable from a page that never finished loading.
  it('surfaces an error when the header request fails with a 500', async () => {
    headerMock.mockRejectedValue(
      Object.assign(new Error('Server error'), { response: { status: 500 } })
    );
    renderView();
    expect(
      await screen.findByText('Could not load this germination test')
    ).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  // A 404 means the test does not exist, which is the 404 page's job; showing
  // the inline error as well would double up on the message.
  it('redirects instead of showing the error when the test does not exist', async () => {
    headerMock.mockRejectedValue(
      Object.assign(new Error('Not found'), { response: { status: 404 } })
    );
    renderView();
    await vi.waitFor(() => expect(navigateMock).toHaveBeenCalled());
    expect(
      screen.queryByText('Could not load this germination test')
    ).not.toBeInTheDocument();
  });
});
