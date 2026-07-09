import { useEffect, useRef } from 'react';

const DEFAULT_DELAY = 800;
const DEFAULT_MAX_WAIT = 3000;

export type UseAutosaveOptions<T> = {
  data: T;
  onSave: (data: T, previous: T | undefined) => void | Promise<void>;
  enabled?: boolean;
  delay?: number;
  maxWait?: number;
  isEqual?: (a: T, b: T) => boolean;
};

export type UseAutosaveResult<T> = {
  flush: () => Promise<void>;
  cancel: () => void;
  markSaved: (value: T) => void;
};

const defaultIsEqual = <T>(a: T, b: T): boolean => JSON.stringify(a) === JSON.stringify(b);

function useAutosave<T>({
  data,
  onSave,
  enabled = true,
  delay = DEFAULT_DELAY,
  maxWait = DEFAULT_MAX_WAIT,
  isEqual = defaultIsEqual
}: UseAutosaveOptions<T>): UseAutosaveResult<T> {
  // Latest values held in refs so timer callbacks and event listeners always
  // read current values without needing to re-subscribe.
  const dataRef = useRef(data);
  dataRef.current = data;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const isEqualRef = useRef(isEqual);
  isEqualRef.current = isEqual;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // Snapshot of the last value we have saved (initialised to the first value).
  const savedRef = useRef<T>(data);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const save = async () => {
    clearTimers();
    if (!enabledRef.current) {
      return;
    }
    const { current } = dataRef;
    const previous = savedRef.current;
    if (isEqualRef.current(current, previous)) {
      return;
    }
    try {
      await onSaveRef.current(current, previous);
      savedRef.current = current;
    } catch {
      // Keep the previous saved snapshot so the same data can be retried.
    }
  };

  // Schedule a debounced save whenever data changes and differs from the
  // last-saved snapshot. The maxWait timer caps how long continuous edits
  // can defer a save.
  useEffect(() => {
    if (!enabled || isEqualRef.current(data, savedRef.current)) {
      return;
    }
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(save, delay);
    if (!maxWaitTimer.current) {
      maxWaitTimer.current = setTimeout(save, maxWait);
    }
  }, [data, enabled, delay, maxWait]);

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
  };

  return { flush: save, cancel: clearTimers, markSaved };
}

export default useAutosave;
