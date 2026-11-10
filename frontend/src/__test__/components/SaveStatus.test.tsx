import React from 'react';
import {
  render, screen, fireEvent, act
} from '@testing-library/react';
import SaveStatus from '../../components/CONSEP/SaveStatus';

const renderStatus = (status: React.ComponentProps<typeof SaveStatus>['status']) => {
  const onRetry = vi.fn();
  const onReload = vi.fn();
  const utils = render(<SaveStatus status={status} onRetry={onRetry} onReload={onReload} />);
  return { ...utils, onRetry, onReload };
};

describe('SaveStatus', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows nothing before the first save', () => {
    const { container } = renderStatus({ state: 'idle' });
    expect(container).toBeEmptyDOMElement();
  });

  it('shows Saving…', () => {
    renderStatus({ state: 'saving' });
    expect(screen.getByText('Saving…')).toBeInTheDocument();
  });

  it('shows how long ago it saved, and keeps it current', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-02T10:00:00'));
    renderStatus({ state: 'saved', savedAt: new Date('2026-11-02T10:00:00') });
    expect(screen.getByText('Saved just now')).toBeInTheDocument();

    vi.setSystemTime(new Date('2026-11-02T10:03:10'));
    act(() => { vi.advanceTimersByTime(30000); });
    expect(screen.getByText('Saved 3 min ago')).toBeInTheDocument();
  });

  it('shows Not saved with a retry', () => {
    const { onRetry } = renderStatus({ state: 'failed' });
    expect(screen.getByText(/Not saved/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry now' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows Conflict detected with a reload', () => {
    const { onReload } = renderStatus({ state: 'conflict' });
    expect(screen.getByText('Conflict detected')).toBeInTheDocument();
    expect(screen.getByText(/unsaved changes will be lost/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });
});
