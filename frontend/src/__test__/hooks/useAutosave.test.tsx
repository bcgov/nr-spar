import { renderHook, act } from '@testing-library/react';
import {
  describe, it, expect, vi, beforeEach, afterEach
} from 'vitest';
import useAutosave from '../../hooks/useAutosave';

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('coalesces rapid changes into a single save with the latest data', () => {
    const onSave = vi.fn();
    const { rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, delay: 800 }),
      { initialProps: { data: { v: 0 } } }
    );

    rerender({ data: { v: 1 } });
    act(() => { vi.advanceTimersByTime(400); });
    rerender({ data: { v: 2 } });
    act(() => { vi.advanceTimersByTime(400); });
    expect(onSave).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(400); });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ v: 2 }, { v: 0 });
  });

  it('forces a save at maxWait during continuous editing', () => {
    const onSave = vi.fn();
    const { rerender } = renderHook(
      ({ data }) => useAutosave({
        data, onSave, delay: 800, maxWait: 2000
      }),
      { initialProps: { data: { v: 0 } } }
    );

    for (let i = 1; i <= 5; i += 1) {
      rerender({ data: { v: i } });
      act(() => { vi.advanceTimersByTime(500); });
    }
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0]).toEqual({ v: 4 });
  });

  it('flushes pending changes on unmount', () => {
    const onSave = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ data }) => useAutosave({ data, onSave, delay: 800 }),
      { initialProps: { data: { v: 0 } } }
    );

    rerender({ data: { v: 1 } });
    act(() => { vi.advanceTimersByTime(200); });
    expect(onSave).not.toHaveBeenCalled();

    act(() => { unmount(); });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ v: 1 }, { v: 0 });
  });

  it('flushes when the page becomes hidden', () => {
    const onSave = vi.fn();
    const { rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, delay: 800 }),
      { initialProps: { data: { v: 0 } } }
    );

    rerender({ data: { v: 1 } });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden'
    });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('does not save when data is unchanged', () => {
    const onSave = vi.fn();
    const { rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, delay: 800 }),
      { initialProps: { data: { v: 0 } } }
    );

    rerender({ data: { v: 0 } });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not save while disabled', () => {
    const onSave = vi.fn();
    const { rerender } = renderHook(
      ({ data, enabled }) => useAutosave({
        data, onSave, enabled, delay: 800
      }),
      { initialProps: { data: { v: 0 }, enabled: false } }
    );

    rerender({ data: { v: 1 }, enabled: false });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onSave).not.toHaveBeenCalled();
  });
});
