import { renderHook, act } from '@testing-library/react';
import { useActivityConflict } from '../../../views/CONSEP/TestingActivities/hooks/useActivityConflict';

describe('useActivityConflict', () => {
  it('starts not in conflict, then marks and clears', () => {
    const { result } = renderHook(() => useActivityConflict());
    expect(result.current.isConflict).toBe(false);

    act(() => result.current.markConflict());
    expect(result.current.isConflict).toBe(true);

    act(() => result.current.clearConflict());
    expect(result.current.isConflict).toBe(false);
  });
});
