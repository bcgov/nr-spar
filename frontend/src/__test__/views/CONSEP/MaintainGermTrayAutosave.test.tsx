import React from 'react';
import {
  render, screen, fireEvent, waitFor, act
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MaintainGermTray from '../../../views/CONSEP/TestingActivities/GerminatorTray/MaintainGermTray';

// GenericTable is material-react-table (MUI), which jsdom cannot render: list the rows instead.
vi.mock('../../../components/GenericTable', () => ({
  default: ({ data }: { data: { germinatorTrayId: number; germinatorId?: string }[] }) => (
    <ul>
      {data.map((row) => (
        <li key={row.germinatorTrayId}>{`tray ${row.germinatorTrayId}: ${row.germinatorId ?? ''}`}</li>
      ))}
    </ul>
  )
}));
vi.mock('../../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));
vi.mock('../../../components/Breadcrumbs', () => ({ default: () => null }));

// The germinator id cell calls updateRow; capture it to stand in for typing in the cell.
type Row = { germinatorTrayId: number; activityTypeCd: string; germinatorId: string };
let updateRow: (row: Row) => void = () => {};
let deleteTray: (row: Row) => void = () => {};
vi.mock('../../../views/CONSEP/TestingActivities/GerminatorTray/MaintainGermTray/constants', () => ({
  getGermTrayColumns: (update: (row: Row) => void, onDelete: (row: Row) => void) => {
    updateRow = update;
    deleteTray = onDelete;
    return [];
  },
  getGermTrayTestsColumns: () => []
}));

const getTrays = vi.fn();
const assign = vi.fn();
const deleteTrayApi = vi.fn();
vi.mock('../../../api-service/consep/germinatorTrayAPI', () => ({
  getGerminatorTraysByIds: (ids: number[]) => getTrays(ids),
  assignGerminatorId: (id: number, germinatorId: string, revisionCount: number) => (
    assign(id, germinatorId, revisionCount)
  ),
  deleteTestFromTray: () => Promise.resolve(),
  deleteGerminatorTray: (id: number, revisionCount: number, contents: object[]) => (
    deleteTrayApi(id, revisionCount, contents)
  ),
  getGerminatorTrayContents: () => Promise.resolve([])
}));

const serverTray = (germinatorTrayId: number, germinatorId: string | null, revisionCount: number) => ({
  germinatorTrayId,
  activityTypeCd: 'G10',
  actualStartDate: '2026-11-01T00:00:00',
  dateCreated: '2026-11-01T00:00:00',
  systemTrayNo: 1,
  germinatorId,
  revisionCount
});
const row = (germinatorTrayId: number, germinatorId: string): Row => (
  { germinatorTrayId, activityTypeCd: 'G10', germinatorId }
);
const conflict = () => Promise.reject(
  Object.assign(new Error('Conflict'), { response: { status: 409, data: { message: 'Please reselect.' } } })
);

const renderPage = (url: string) => render(
  <MemoryRouter initialEntries={[url]}>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MaintainGermTray />
    </QueryClientProvider>
  </MemoryRouter>
);

// Longer than the autosave debounce (800 ms), so a save that was going to happen has.
const waitPastDebounce = () => act(() => new Promise((resolve) => { setTimeout(resolve, 1000); }));

describe('MaintainGermTray loading and auto save', () => {
  let rejectionHandler: (event: PromiseRejectionEvent) => void;
  beforeEach(() => {
    getTrays.mockReset();
    assign.mockReset();
    deleteTrayApi.mockReset();
    rejectionHandler = (event: PromiseRejectionEvent) => { event.preventDefault(); };
    window.addEventListener('unhandledrejection', rejectionHandler);
  });
  afterEach(() => {
    window.removeEventListener('unhandledrejection', rejectionHandler);
  });

  it('loads the trays named in the URL, without navigation state, and does not save them', async () => {
    getTrays.mockResolvedValue([serverTray(1311, '4', 2), serverTray(1312, null, 0)]);

    renderPage('/consep/maintain-germination-tray-screen?trayIds=1311,1312');

    expect(await screen.findByText('tray 1311: 4')).toBeInTheDocument();
    expect(screen.getByText('tray 1312:')).toBeInTheDocument();
    expect(getTrays).toHaveBeenCalledWith([1311, 1312]);

    await waitPastDebounce();
    expect(assign).not.toHaveBeenCalled();
  });

  it('shows a message and loads nothing when the URL has no tray ids', async () => {
    renderPage('/consep/maintain-germination-tray-screen');

    expect(await screen.findByText(/No germination trays to show/)).toBeInTheDocument();
    expect(getTrays).not.toHaveBeenCalled();
  });

  it('sends the revision count it read, then the one the server returned', async () => {
    getTrays.mockResolvedValue([serverTray(1311, null, 2)]);
    assign
      .mockResolvedValueOnce({ germinatorTrayId: 1311, germinatorId: '4', revisionCount: 3 })
      .mockResolvedValueOnce({ germinatorTrayId: 1311, germinatorId: '5', revisionCount: 4 });
    renderPage('/?trayIds=1311');
    await screen.findByText('tray 1311:');

    act(() => { updateRow(row(1311, '4')); });
    await waitFor(() => expect(assign).toHaveBeenCalledWith(1311, '4', 2));

    act(() => { updateRow(row(1311, '5')); });
    await waitFor(() => expect(assign).toHaveBeenCalledWith(1311, '5', 3));
    expect(screen.queryByText('Conflict detected')).not.toBeInTheDocument();
  });

  it('enters the conflict state on a stale revision count, and Reload refetches the trays', async () => {
    getTrays
      .mockResolvedValueOnce([serverTray(1311, null, 2)])
      .mockResolvedValueOnce([serverTray(1311, '7', 3)]);
    assign.mockImplementation(conflict);
    renderPage('/?trayIds=1311');
    await screen.findByText('tray 1311:');

    act(() => { updateRow(row(1311, '4')); });
    expect(await screen.findByText('Conflict detected')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reload/i }));

    expect(await screen.findByText('tray 1311: 7')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Conflict detected')).not.toBeInTheDocument());
    expect(getTrays).toHaveBeenCalledTimes(2);
    // The reloaded trays are the new baseline: nothing is saved again.
    await waitPastDebounce();
    expect(assign).toHaveBeenCalledTimes(1);
  });

  it('does not resend, or 409 on, the trays that saved before a save failed part way', async () => {
    getTrays.mockResolvedValue([serverTray(1, null, 0), serverTray(2, null, 5)]);
    assign
      .mockResolvedValueOnce({ germinatorTrayId: 1, germinatorId: '1', revisionCount: 1 })
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce({ germinatorTrayId: 2, germinatorId: '2', revisionCount: 6 });
    renderPage('/?trayIds=1,2');
    await screen.findByText('tray 2:');

    act(() => {
      updateRow(row(1, '1'));
      updateRow(row(2, '2'));
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Retry now' }));

    await waitFor(() => expect(assign).toHaveBeenCalledTimes(3));
    expect(assign.mock.calls).toEqual([[1, '1', 0], [2, '2', 5], [2, '2', 5]]);
  });

  it('deletes a tray with its latest revision count', async () => {
    getTrays.mockResolvedValue([serverTray(1311, null, 2)]);
    assign.mockResolvedValue({ germinatorTrayId: 1311, germinatorId: '4', revisionCount: 3 });
    deleteTrayApi.mockResolvedValue(undefined);
    renderPage('/?trayIds=1311');
    await screen.findByText('tray 1311:');

    act(() => { updateRow(row(1311, '4')); });
    await waitFor(() => expect(assign).toHaveBeenCalled());
    act(() => { deleteTray(row(1311, '4')); });
    fireEvent.click(screen.getByRole('button', { name: 'Delete germ tray' }));

    await waitFor(() => expect(deleteTrayApi).toHaveBeenCalledWith(1311, 3, []));
    await waitFor(() => expect(screen.queryByText(/tray 1311/)).not.toBeInTheDocument());
  });

  it('enters the conflict state when deleting a tray with a stale revision count', async () => {
    getTrays.mockResolvedValue([serverTray(1311, null, 2)]);
    deleteTrayApi.mockImplementation(conflict);
    renderPage('/?trayIds=1311');
    await screen.findByText('tray 1311:');

    act(() => { deleteTray(row(1311, '')); });
    fireEvent.click(screen.getByRole('button', { name: 'Delete germ tray' }));

    expect(await screen.findByText('Conflict detected')).toBeInTheDocument();
    expect(deleteTrayApi).toHaveBeenCalledWith(1311, 2, []);
  });
});
