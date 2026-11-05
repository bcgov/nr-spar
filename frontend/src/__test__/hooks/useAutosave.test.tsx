import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  describe, it, expect, vi, beforeEach, afterEach
} from 'vitest';
import useAutosave from '../../hooks/useAutosave';
import AuthContext, { AuthContextData } from '../../contexts/AuthContext';

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

  it('does not re-save a value that was externally marked as saved', () => {
    const onSave = vi.fn();
    const { result, rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, delay: 800 }),
      { initialProps: { data: { v: 0 } } }
    );

    rerender({ data: { v: 1 } });
    act(() => { result.current.markSaved({ v: 1 }); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onSave).not.toHaveBeenCalled();

    rerender({ data: { v: 2 } });
    act(() => { vi.advanceTimersByTime(800); });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ v: 2 }, { v: 1 });
  });

  it('does not retry a failed save on its own', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'));
    const { rerender } = renderHook(
      ({ data, enabled }) => useAutosave({
        data, onSave, enabled, delay: 800
      }),
      { initialProps: { data: { v: 0 }, enabled: true } }
    );

    rerender({ data: { v: 1 }, enabled: true });
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(onSave).toHaveBeenCalledTimes(1);

    // A caller gating on its mutation's pending flag toggles `enabled` around
    // every attempt, which re-runs the scheduling effect. That must not turn a
    // single failure into an endless retry loop.
    rerender({ data: { v: 1 }, enabled: false });
    rerender({ data: { v: 1 }, enabled: true });
    await act(async () => { vi.advanceTimersByTime(5000); });
    expect(onSave).toHaveBeenCalledTimes(1);

    // A fresh edit is a new value, so it saves again.
    rerender({ data: { v: 2 }, enabled: true });
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(onSave).toHaveBeenCalledTimes(2);
  });

  it('retries a value after a failed save', async () => {
    const onSave = vi.fn()
      .mockRejectedValueOnce(new Error('Save failed'))
      .mockResolvedValueOnce(undefined);
    const { result, rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, delay: 800 }),
      { initialProps: { data: { v: 0 } } }
    );

    rerender({ data: { v: 1 } });
    await act(async () => { await result.current.flush(); });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenLastCalledWith({ v: 1 }, { v: 0 });

    await act(async () => { await result.current.flush(); });
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenLastCalledWith({ v: 1 }, { v: 0 });
  });

  it('records what onSaved derives from the response as saved', async () => {
    const onSave = vi.fn().mockResolvedValue({ ts: 't2' });
    const onSaved = vi.fn((result: { ts: string }, sent: { v: number; ts: string }) => (
      { ...sent, ts: result.ts }
    ));
    const { rerender } = renderHook(
      ({ data }) => useAutosave({
        data, onSave, onSaved, delay: 800
      }),
      { initialProps: { data: { v: 0, ts: 't1' } } }
    );

    rerender({ data: { v: 1, ts: 't1' } });
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(onSaved).toHaveBeenCalledWith({ ts: 't2' }, { v: 1, ts: 't1' });

    // The caller writes the new timestamp into its state: nothing left to save.
    rerender({ data: { v: 1, ts: 't2' } });
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(onSave).toHaveBeenCalledTimes(1);

    // The next edit goes out against the written-back value.
    rerender({ data: { v: 2, ts: 't2' } });
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(onSave).toHaveBeenLastCalledWith({ v: 2, ts: 't2' }, { v: 1, ts: 't2' });
  });

  it('neither schedules nor flushes while in conflict', () => {
    const onSave = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ data, conflict }) => useAutosave({
        data, onSave, conflict, delay: 800
      }),
      { initialProps: { data: { v: 0 }, conflict: true } }
    );

    rerender({ data: { v: 1 }, conflict: true });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { window.dispatchEvent(new Event('pagehide')); });
    act(() => { unmount(); });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not flush on unmount after sign-out, even when the page never re-renders', () => {
    // Sign-out swaps the router in the same render that flips `signed`, so the page
    // unmounts with its last (signed-in) props; only the provider's live check knows.
    const onSave = vi.fn();
    let live = true;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={{ signed: true, isSignedIn: () => live } as AuthContextData}>
        {children}
      </AuthContext.Provider>
    );
    const { rerender, unmount } = renderHook(
      ({ data }) => useAutosave({ data, onSave, delay: 800 }),
      { initialProps: { data: { v: 0 } }, wrapper }
    );

    rerender({ data: { v: 1 } });
    live = false;
    act(() => { unmount(); });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('flush reports whether the latest data is saved', async () => {
    const onSave = vi.fn()
      .mockRejectedValueOnce(new Error('Save failed'))
      .mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ data, enabled }) => useAutosave({
        data, onSave, enabled, delay: 800
      }),
      { initialProps: { data: { v: 0 }, enabled: true } }
    );

    await act(async () => { expect(await result.current.flush()).toBe(true); });
    expect(onSave).not.toHaveBeenCalled();

    rerender({ data: { v: 1 }, enabled: false });
    await act(async () => { expect(await result.current.flush()).toBe(false); });

    rerender({ data: { v: 1 }, enabled: true });
    await act(async () => { expect(await result.current.flush()).toBe(false); });
    await act(async () => { expect(await result.current.flush()).toBe(true); });
  });

  it('runs one save at a time and sends a queued edit against the written-back value', async () => {
    let finishFirst: (v: { ts: string }) => void = () => {};
    const onSave = vi.fn()
      .mockImplementationOnce(() => new Promise((r) => { finishFirst = r; }))
      .mockResolvedValue({ ts: 't3' });
    const onSaved = (res: { ts: string }, sent: { v: number; ts: string }) => ({ ...sent, ts: res.ts });
    const { result, rerender, unmount } = renderHook(
      ({ data }) => useAutosave({
        data, onSave, onSaved, delay: 800
      }),
      { initialProps: { data: { v: 0, ts: 't1' } } }
    );

    rerender({ data: { v: 1, ts: 't1' } });
    let first: Promise<boolean> = Promise.resolve(false);
    act(() => { first = result.current.flush(); });

    // Edited while the first save is in flight, then the page is left.
    rerender({ data: { v: 2, ts: 't1' } });
    act(() => { unmount(); });
    expect(onSave).toHaveBeenCalledTimes(1);

    await act(async () => { finishFirst({ ts: 't2' }); await first; });
    await act(async () => { await Promise.resolve(); });
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenLastCalledWith({ v: 2, ts: 't1' }, { v: 1, ts: 't2' });
  });

  it('reports saving, saved and failed, with conflict taking precedence', async () => {
    let finish: () => void = () => {};
    const onSave = vi.fn()
      .mockImplementationOnce(() => new Promise<void>((r) => { finish = r; }))
      .mockRejectedValueOnce(new Error('Save failed'));
    const { result, rerender } = renderHook(
      ({ data, conflict }) => useAutosave({
        data, onSave, conflict, delay: 800
      }),
      { initialProps: { data: { v: 0 }, conflict: false } }
    );
    expect(result.current.status.state).toBe('idle');

    rerender({ data: { v: 1 }, conflict: false });
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(result.current.status.state).toBe('saving');
    await act(async () => { finish(); });
    expect(result.current.status.state).toBe('saved');
    const { savedAt } = result.current.status;
    expect(savedAt).toBeInstanceOf(Date);

    rerender({ data: { v: 2 }, conflict: false });
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(result.current.status).toEqual({ state: 'failed', savedAt });

    rerender({ data: { v: 2 }, conflict: true });
    expect(result.current.status.state).toBe('conflict');
  });

  it('stops reporting a failure once the data is back to what is saved', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'));
    const { result, rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, delay: 800 }),
      { initialProps: { data: { v: 0 } } }
    );

    rerender({ data: { v: 1 } });
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(result.current.status.state).toBe('failed');

    // Reverted to the saved value.
    rerender({ data: { v: 0 } });
    expect(result.current.status.state).toBe('idle');

    rerender({ data: { v: 2 } });
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(result.current.status.state).toBe('failed');

    // Replaced by server data, as Reload does.
    act(() => { result.current.markSaved({ v: 9 }); });
    rerender({ data: { v: 9 } });
    expect(result.current.status.state).toBe('idle');
  });
});
