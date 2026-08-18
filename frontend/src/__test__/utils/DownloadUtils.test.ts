import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openBlankTab, openBlobInNewTab } from '../../utils/DownloadUtils';

describe('DownloadUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('openBlankTab opens an empty tab and drops window.opener', () => {
    const blank = { closed: false, opener: {} as Window } as Window;
    const open = vi.fn().mockReturnValue(blank);
    vi.stubGlobal('open', open);

    expect(openBlankTab()).toBe(blank);
    expect(blank.opener).toBeNull();
    expect(open).toHaveBeenCalledWith('', '_blank');
  });

  it('openBlobInNewTab navigates a prepared tab and revokes the object URL later', () => {
    const tab = { closed: false, opener: {} as Window, location: { href: '' } } as Window;
    const createObjectURL = vi.fn().mockReturnValue('blob:report');
    const revokeObjectURL = vi.fn();
    const open = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.stubGlobal('open', open);

    openBlobInNewTab(new Blob(['%PDF'], { type: 'application/pdf' }), tab);

    expect(createObjectURL).toHaveBeenCalled();
    expect(tab.opener).toBeNull();
    expect(tab.location.href).toBe('blob:report');
    expect(open).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60_000);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:report');
  });

  it('openBlobInNewTab falls back to window.open when no usable tab is provided', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:report');
    const revokeObjectURL = vi.fn();
    const open = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.stubGlobal('open', open);

    openBlobInNewTab(new Blob(['%PDF'], { type: 'application/pdf' }));

    expect(open).toHaveBeenCalledWith('blob:report', '_blank', 'noopener,noreferrer');
  });
});
