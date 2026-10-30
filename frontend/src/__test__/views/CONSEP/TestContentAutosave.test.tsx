import React from 'react';
import {
  render, screen, fireEvent, waitFor, act
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BrowserRouter as PlainRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MoistureContent from '../../../views/CONSEP/TestingActivities/MoistureContent';
import PurityContent from '../../../views/CONSEP/TestingActivities/PurityContent';

// ActivityResult uses material-react-table (MUI), which jsdom cannot render. The stub
// exposes a button that edits a replicate the way the real table does.
vi.mock('../../../views/CONSEP/TestingActivities/ActivityResult', () => ({
  default: ({ updateReplicates }: { updateReplicates: (list: object[]) => void }) => (
    <button
      type="button"
      onClick={() => updateReplicates([{ riaKey: 123, replicateNumber: 1, replicateAccInd: 0 }])}
    >
      edit replicate
    </button>
  )
}));

// PageTitle makes a real network call for favourite-activities — stub it out.
vi.mock('../../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));

// Breadcrumbs mixes the react-router ESM and CJS bundles in jsdom — stub it out.
vi.mock('../../../components/Breadcrumbs', () => ({
  default: () => <nav data-testid="breadcrumbs-mock" />
}));

vi.mock('../../../api-service/consep/testCodesAPI', () => ({
  getCodesByActivity: () => Promise.resolve([])
}));

const autosaveMock = vi.fn();
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
        replicatesList: [{ riaKey: 123, replicateNumber: 1, replicateAccInd: 1 }],
        debrisList: []
      });
    }
    if (fn === 'autosave') {
      return autosaveMock(params);
    }
    return Promise.resolve({});
  }
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useParams: () => ({ riaKey: '123' })
}));
vi.mock('react-router', async (orig) => ({
  ...(await orig<typeof import('react-router')>()),
  useParams: () => ({ riaKey: '123' })
}));

// Longer than the 800 ms debounce: anything that would save has saved by then.
const AFTER_DEBOUNCE = 1200;
const wait = (ms: number) => act(() => new Promise((r) => { setTimeout(r, ms); }));

const conflictError = () => Object.assign(new Error('Conflict'), { response: { status: 409 } });
const saved = (updateTimestamp: string) => Promise.resolve({ data: { updateTimestamp } });

// PurityContent imports useNavigate from 'react-router', MoistureContent from
// 'react-router-dom'; each needs the Router from the same bundle.
describe.each([
  ['MoistureContent', MoistureContent, BrowserRouter],
  ['PurityContent', PurityContent, PlainRouter]
])('%s auto save', (_name, Page, Router) => {
  let rejectionHandler: (event: PromiseRejectionEvent) => void;

  const renderPage = async () => {
    render(
      <Router>
        <QueryClientProvider
          client={new QueryClient({
            defaultOptions: { mutations: { throwOnError: false }, queries: { retry: false } }
          })}
        >
          <Page />
        </QueryClientProvider>
      </Router>
    );
    await screen.findAllByText(/64132/);
    return {
      comments: await screen.findByLabelText(/Comments/i),
      startDate: screen.getByLabelText(/Start date/i)
    };
  };

  beforeEach(() => {
    autosaveMock.mockReset();
    autosaveMock.mockImplementation(() => saved('2025-02-01T00:00:00'));
    // mutateAsync rejections are handled by useAutosave, but may surface for a
    // microtask as "unhandledrejection" first.
    rejectionHandler = (event: PromiseRejectionEvent) => { event.preventDefault(); };
    window.addEventListener('unhandledrejection', rejectionHandler);
  });

  afterEach(() => {
    window.removeEventListener('unhandledrejection', rejectionHandler);
  });

  it('does not PUT on hydration', async () => {
    await renderPage();
    await wait(AFTER_DEBOUNCE);
    expect(autosaveMock).not.toHaveBeenCalled();
  });

  it('sends a comment edit and a replicate edit in the same window as one PUT', async () => {
    const { comments } = await renderPage();
    fireEvent.change(comments, { target: { value: 'c' } });
    fireEvent.change(comments, { target: { value: 'co' } });
    fireEvent.change(comments, { target: { value: 'com' } });
    fireEvent.click(screen.getByRole('button', { name: 'edit replicate' }));

    await wait(AFTER_DEBOUNCE);
    expect(autosaveMock).toHaveBeenCalledTimes(1);
    const { riaKey, payload } = autosaveMock.mock.calls[0][0];
    expect(riaKey).toBe('123');
    expect(payload.activity).toMatchObject({
      riaComment: 'com', updateTimestamp: '2025-01-18T16:00:00'
    });
    expect(payload.replicates).toEqual([{ riaKey: 123, replicateNumber: 1, replicateAccInd: 0 }]);
    expect(screen.queryByText(/updated successfully/i)).not.toBeInTheDocument();
  });

  it('never saves or throws while a date is half typed', async () => {
    const { startDate } = await renderPage();
    // Pause past the debounce after each keystroke, and stay inside the end date, so
    // neither coalescing nor the date-range check can hide a save.
    // eslint-disable-next-line no-restricted-syntax
    for (const value of ['2', '20', '2025/1']) {
      fireEvent.change(startDate, { target: { value } });
      // eslint-disable-next-line no-await-in-loop
      await wait(AFTER_DEBOUNCE);
    }
    expect(autosaveMock).not.toHaveBeenCalled();
  });

  it('saves a fully typed date once', async () => {
    const { startDate } = await renderPage();
    fireEvent.change(startDate, { target: { value: '2025/01/10' } });
    fireEvent.blur(startDate);
    await wait(AFTER_DEBOUNCE);
    expect(autosaveMock).toHaveBeenCalledTimes(1);
    // The picked day is a Vancouver day whatever the browser's zone (CI runs in UTC).
    expect(autosaveMock.mock.calls[0][0].payload.activity.actualBeginDateTime)
      .toBe('2025-01-10T08:00:00.000Z');
    expect(startDate).toHaveValue('2025/01/10');
  });

  it('flags a start date after the end date and does not save it', async () => {
    // Same order as the Cypress scenario: end date first, then a start date after it.
    const { startDate } = await renderPage();
    const endDate = screen.getByLabelText(/End date/i);
    act(() => { (endDate as any)._flatpickr.setDate('2025/01/10', true, 'Y/m/d'); });
    await wait(AFTER_DEBOUNCE);
    expect(autosaveMock).toHaveBeenCalledTimes(1);

    act(() => { (startDate as any)._flatpickr.setDate('2025/01/15', true, 'Y/m/d'); });
    expect(await screen.findAllByText('Please enter a valid date')).toHaveLength(2);
    await wait(AFTER_DEBOUNCE);
    expect(autosaveMock).toHaveBeenCalledTimes(1);
  });

  it('saves a cleared date as null', async () => {
    const { startDate } = await renderPage();
    fireEvent.change(startDate, { target: { value: '' } });
    fireEvent.blur(startDate);
    await wait(AFTER_DEBOUNCE);
    expect(autosaveMock).toHaveBeenCalledTimes(1);
    // undefined is dropped from the JSON body, which the backend reads as null.
    expect(autosaveMock.mock.calls[0][0].payload.activity.actualBeginDateTime).toBeUndefined();
  });

  it('sends the written-back timestamp with an edit made while a save was in flight', async () => {
    let resolveFirst: (v: unknown) => void = () => {};
    autosaveMock
      .mockImplementationOnce(() => new Promise((r) => { resolveFirst = r; }))
      .mockImplementation(() => saved('2025-02-02T00:00:00'));
    const { comments } = await renderPage();

    fireEvent.change(comments, { target: { value: 'edit one' } });
    await wait(AFTER_DEBOUNCE);
    fireEvent.change(comments, { target: { value: 'edit two' } });
    await act(async () => { resolveFirst({ data: { updateTimestamp: '2025-02-01T00:00:00' } }); });
    await wait(AFTER_DEBOUNCE);

    expect(autosaveMock).toHaveBeenCalledTimes(2);
    expect(autosaveMock.mock.calls[1][0].payload.activity).toMatchObject({
      riaComment: 'edit two', updateTimestamp: '2025-02-01T00:00:00'
    });
    expect(screen.queryByText('Conflict detected')).not.toBeInTheDocument();
  });

  it('enters conflict on 409, stops saving, and Reload clears it', async () => {
    autosaveMock.mockImplementation(() => Promise.reject(conflictError()));
    const { comments } = await renderPage();

    fireEvent.change(comments, { target: { value: 'edit one' } });
    await waitFor(
      () => expect(screen.getByText('Conflict detected')).toBeInTheDocument(),
      { timeout: 3000 }
    );

    autosaveMock.mockClear();
    fireEvent.change(comments, { target: { value: 'edit two' } });
    fireEvent.click(screen.getByRole('button', { name: 'edit replicate' }));
    await wait(AFTER_DEBOUNCE);
    expect(autosaveMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Reload/i }));
    await waitFor(() => expect(screen.queryByText('Conflict detected')).not.toBeInTheDocument());
  });
});
