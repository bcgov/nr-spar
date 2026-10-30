import React from 'react';
import {
  render, screen, fireEvent, waitFor, act
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MaintainGermTray from '../../../views/CONSEP/TestingActivities/GerminatorTray/MaintainGermTray';

// GenericTable is material-react-table (MUI), which jsdom cannot render.
vi.mock('../../../components/GenericTable', () => ({ default: () => null }));
vi.mock('../../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));
vi.mock('../../../components/Breadcrumbs', () => ({ default: () => null }));

// The table cells call these handlers; capture them to stand in for a row click.
let deleteTest: (row: object) => void = () => {};
let deleteTray: (row: object) => void = () => {};
vi.mock('../../../views/CONSEP/TestingActivities/GerminatorTray/MaintainGermTray/constants', () => ({
  getGermTrayColumns: (_update: unknown, onDelete: (row: object) => void) => {
    deleteTray = onDelete;
    return [];
  },
  getGermTrayTestsColumns: (onDelete: (row: object) => void) => {
    deleteTest = onDelete;
    return [];
  }
}));

const conflict = () => Promise.reject(
  Object.assign(new Error('Conflict'), { response: { status: 409, data: { message: 'Please reselect.' } } })
);
const getContents = vi.fn(() => Promise.resolve([]));
vi.mock('../../../api-service/consep/germinatorTrayAPI', () => ({
  assignGerminatorId: () => Promise.resolve({}),
  deleteTestFromTray: () => conflict(),
  deleteGerminatorTray: () => conflict(),
  getGerminatorTrayContents: () => getContents()
}));

const tray = { germinatorTrayId: 7, activityTypeCd: 'G10' };
const test = {
  germinatorTrayId: 7, riaSkey: 1, updateTimestamp: '2026-10-01T00:00:00', requestId: 'R1', seedlotNumber: '1'
};

const renderPage = () => render(
  <MemoryRouter initialEntries={[{ pathname: '/', state: { germinatorTrays: [tray] } }]}>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MaintainGermTray />
    </QueryClientProvider>
  </MemoryRouter>
);

describe('MaintainGermTray conflict', () => {
  let rejectionHandler: (event: PromiseRejectionEvent) => void;
  beforeEach(() => {
    rejectionHandler = (event: PromiseRejectionEvent) => { event.preventDefault(); };
    window.addEventListener('unhandledrejection', rejectionHandler);
  });
  afterEach(() => {
    window.removeEventListener('unhandledrejection', rejectionHandler);
  });

  it.each([
    ['removing a test', () => deleteTest(test), 'Delete germ test'],
    ['deleting a tray', () => deleteTray(tray), 'Delete germ tray']
  ])('shows the conflict banner, not an error toast, when %s returns 409', async (_label, open, confirm) => {
    renderPage();
    act(() => { open(); });
    fireEvent.click(screen.getByRole('button', { name: confirm }));

    await waitFor(() => expect(screen.getByText('Conflict detected')).toBeInTheDocument());
    expect(screen.queryByText('Please reselect.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reload/i }));
    await waitFor(() => expect(screen.queryByText('Conflict detected')).not.toBeInTheDocument());
  });
});
