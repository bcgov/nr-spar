import {
  useContext, useEffect, useRef, useState
} from 'react';
import AuthContext from '../contexts/AuthContext';

const DEFAULT_DELAY = 800;
const DEFAULT_MAX_WAIT = 3000;

export type UseAutosaveOptions<T, R = unknown> = {
  data: T;
  onSave: (data: T, previous: T | undefined) => R | Promise<R>;
  /**
   * Called after a successful save with the response and the value that was sent. Returns
   * what the server now holds (typically `sent` with the new `updateTimestamp`), which the
   * hook records as saved; the caller writes the same change into its own state.
   */
  onSaved?: (result: R, sent: T) => T;
  /**
   * Caller-side gate: `hydrated && editable && valid`. Saves are serialized by the hook,
   * so there is no need to add the caller's pending flag. The hook adds
   * `!conflict` (below) and "still signed in" (AuthContext) itself. All of them block
   * both scheduling and the pagehide/unmount flush.
   */
  enabled?: boolean;
  /** True while the page shows a 409 conflict; nothing is saved until it is cleared. */
  conflict?: boolean;
  delay?: number;
  maxWait?: number;
  isEqual?: (a: T, b: T) => boolean;
};

/** What SaveStatus shows. `savedAt` is the last successful save, kept through failures. */
export type AutosaveStatus = {
  state: 'idle' | 'saving' | 'saved' | 'failed' | 'conflict';
  savedAt?: Date;
};

export type UseAutosaveResult<T> = {
  status: AutosaveStatus;
  /** Saves now; resolves true once the latest data is saved (see `save`). */
  flush: () => Promise<boolean>;
  cancel: () => void;
  markSaved: (value: T) => void;
};

const defaultIsEqual = <T>(a: T, b: T): boolean => JSON.stringify(a) === JSON.stringify(b);

function useAutosave<T, R = unknown>({
  data,
  onSave,
  onSaved,
  enabled = true,
  conflict = false,
  delay = DEFAULT_DELAY,
  maxWait = DEFAULT_MAX_WAIT,
  isEqual = defaultIsEqual
}: UseAutosaveOptions<T, R>): UseAutosaveResult<T> {
  // After sign-out the token is gone: a pagehide/unmount flush would 401. Sign-out can
  // unmount the page in the same render, so ask the provider live at save time.
  // Outside an AuthProvider (unit tests) there is no isSignedIn: counts as signed in.
  const { isSignedIn } = useContext(AuthContext);
  const isSignedInRef = useRef(isSignedIn);
  isSignedInRef.current = isSignedIn;
  const canSave = enabled && !conflict;

  // Latest values held in refs so timer callbacks and event listeners always
  // read current values without needing to re-subscribe.
  const dataRef = useRef(data);
  dataRef.current = data;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const isEqualRef = useRef(isEqual);
  isEqualRef.current = isEqual;
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;
  const enabledRef = useRef(canSave);
  enabledRef.current = canSave;

  // Snapshot of the last value we have saved (initialised to the first value).
  const savedRef = useRef<T>(data);
  // Snapshot of the last value a save failed on. Only automatic scheduling
  // honours it, so one failure cannot become a retry loop — the scheduling
  // effect re-runs whenever `enabled` toggles, which a caller gating on its
  // mutation's pending flag does on every attempt. An explicit flush, or
  // leaving the page, still retries.
  const failedRef = useRef<T | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasFailedOn = (value: T) => (
    failedRef.current !== null && isEqualRef.current(value, failedRef.current)
  );

  const clearTimers = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (maxWaitTimer.current) {
      clearTimeout(maxWaitTimer.current);
      maxWaitTimer.current = null;
    }
  };

  // The save in flight, if any. Saves run one at a time: a later one (debounced, flushed
  // on unmount, or explicit) waits for it, then sends the newest data against the
  // snapshot it left behind, so callers need not gate on their own pending flag.
  const inFlightRef = useRef<Promise<boolean> | null>(null);
  const [status, setStatus] = useState<AutosaveStatus>({ state: 'idle' });

  // Resolves true once the latest data is saved (or nothing needed saving), false if
  // saving is gated off or the save failed.
  const save = async (): Promise<boolean> => {
    clearTimers();
    while (inFlightRef.current) {
      // eslint-disable-next-line no-await-in-loop
      await inFlightRef.current;
    }
    const { current } = dataRef;
    const previous = savedRef.current;
    if (isEqualRef.current(current, previous)) {
      return true;
    }
    if (!enabledRef.current || isSignedInRef.current?.() === false) {
      return false;
    }
    const attempt = (async () => {
      setStatus((prev) => ({ ...prev, state: 'saving' }));
      try {
        const result = await onSaveRef.current(current, previous);
        savedRef.current = onSavedRef.current ? onSavedRef.current(result, current) : current;
        failedRef.current = null;
        setStatus({ state: 'saved', savedAt: new Date() });
        return true;
      } catch {
        // Keep the previous saved snapshot so the next edit still carries this
        // data, but remember the failure so it is not retried unchanged.
        failedRef.current = current;
        setStatus((prev) => ({ ...prev, state: 'failed' }));
        return false;
      } finally {
        inFlightRef.current = null;
      }
    })();
    inFlightRef.current = attempt;
    return attempt;
  };

  // Schedule a debounced save whenever data changes and differs from the
  // last-saved snapshot. The maxWait timer caps how long continuous edits
  // can defer a save.
  useEffect(() => {
    if (!canSave || isEqualRef.current(data, savedRef.current) || hasFailedOn(data)) {
      return;
    }
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(save, delay);
    if (!maxWaitTimer.current) {
      maxWaitTimer.current = setTimeout(save, maxWait);
    }
  }, [data, canSave, delay, maxWait]);

  // Flush pending changes on page hide and on unmount.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        save();
      }
    };
    const handlePageHide = () => { save(); };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
      save();
    };
  }, []);

  const markSaved = (value: T) => {
    clearTimers();
    savedRef.current = value;
    failedRef.current = null;
  };

  // A failure stops mattering once the data is back to what is saved: the edit was
  // reverted, or Reload replaced it (markSaved). Derived, so there is nothing to reset.
  // eslint-disable-next-line react-hooks/refs
  const recovered = status.state === 'failed' && isEqual(data, savedRef.current);
  let shownStatus = status;
  if (conflict) {
    // A conflict outranks whatever the last attempt did: nothing saves until Reload.
    shownStatus = { ...status, state: 'conflict' };
  } else if (recovered) {
    shownStatus = { ...status, state: status.savedAt ? 'saved' : 'idle' };
  }

  return {
    status: shownStatus,
    flush: save,
    cancel: clearTimers,
    markSaved
  };
}

export default useAutosave;
