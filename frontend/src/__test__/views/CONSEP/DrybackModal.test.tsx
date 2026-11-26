import React from 'react';
import {
  render, screen, fireEvent, waitFor
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DrybackModal from '../../../views/CONSEP/TestingActivities/GerminationContent/DrybackModal';

const getMock = vi.fn();
const putMock = vi.fn();
vi.mock('../../../api-service/consep/drybackAPI', () => ({
  getDryback: (...args: unknown[]) => getMock(...args),
  putDryback: (...args: unknown[]) => putMock(...args)
}));

const record = {
  riaSkey: 7,
  requestId: 'TST20170140',
  itemId: 'A',
  actualBeginDateTime: '2025-05-10T08:30:00',
  actualEndDateTime: null,
  dryWeight: 17.812,
  imbibedWeight: 26.438,
  drybackWeight: 25.08,
  drybackMoist: null,
  storageMc: 7.6,
  updateTimestamp: '2025-05-12T16:00:00'
};

const renderModal = (onClose = vi.fn()) => {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <DrybackModal
        riaKey="7"
        summary={{ activity: 'G64', lot: '07080U', species: 'SX' }}
        stratStartDt="2025-04-01"
        onClose={onClose}
      />
    </QueryClientProvider>
  );
  return onClose;
};

const valueOf = (id: string) => (document.getElementById(id) as HTMLInputElement).value;

describe('DrybackModal', () => {
  beforeEach(() => {
    getMock.mockReset().mockResolvedValue({ ...record });
    putMock.mockReset().mockImplementation((_key, body) => Promise.resolve({
      ...record, ...body, updateTimestamp: '2025-05-12T17:00:00'
    }));
  });

  it('shows the record with live calculations and saves nothing on open', async () => {
    renderModal();
    await waitFor(() => expect(valueOf('dryback-odwt')).toBe('16.458'));
    expect(screen.getByText('Request ID: TST20170140')).toBeInTheDocument();
    expect(valueOf('dryback-imbibedMoist')).toBe('37.7');
    expect(valueOf('dryback-targetThirtyMoist')).toBe('23.512');
    expect(valueOf('dryback-targetThirtyFiveMoist')).toBe('25.320');
    // Dryback M.C. only fills on Calculate.
    expect(valueOf('dryback-drybackMoist')).toBe('');

    fireEvent.click(screen.getByText('Close', { selector: 'button' }));
    await waitFor(() => expect(putMock).not.toHaveBeenCalled());
  });

  it('fills Dryback M.C. on Calculate and saves it with the read timestamp before closing', async () => {
    const onClose = renderModal();
    await waitFor(() => expect(valueOf('dryback-odwt')).toBe('16.458'));

    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(valueOf('dryback-drybackMoist')).toBe('34.4');
    fireEvent.click(screen.getByText('Close', { selector: 'button' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(putMock).toHaveBeenCalledTimes(1);
    expect(putMock).toHaveBeenCalledWith('7', expect.objectContaining({
      drybackMoist: 34.4,
      // Dates are defaulted only on a record with none yet.
      actualBeginDateTime: '2025-05-10T08:30:00',
      actualEndDateTime: null,
      updateTimestamp: '2025-05-12T16:00:00'
    }));
  });

  it('does not save an invalid value', async () => {
    const onClose = renderModal();
    await waitFor(() => expect(valueOf('dryback-odwt')).toBe('16.458'));

    fireEvent.change(document.getElementById('dryback-drybackTime')!, { target: { value: '1000' } });
    expect(screen.getByText('Enter a whole number from 0 to 999')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close', { selector: 'button' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(putMock).not.toHaveBeenCalled();
  });
});
