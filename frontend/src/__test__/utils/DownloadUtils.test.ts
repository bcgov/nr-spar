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

  it('openBlankTab returns null when the browser blocks the popup', () => {
    vi.stubGlobal('open', vi.fn().mockReturnValue(null));
    expect(openBlankTab()).toBeNull();
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

  it('openBlobInNewTab downloads via an anchor when no usable tab is provided', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:report');
    const revokeObjectURL = vi.fn();
    const open = vi.fn();
    const click = vi.fn();
    const remove = vi.fn();
    const anchor = {
      href: '',
      download: '',
      rel: '',
      click,
      remove
    } as unknown as HTMLAnchorElement;
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    const appendChild = vi.spyOn(document.body, 'appendChild').mockReturnValue(anchor);
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.stubGlobal('open', open);

    openBlobInNewTab(
      new Blob(['%PDF'], { type: 'application/pdf' }),
      null,
      'SPRR001-53001.pdf'
    );

    expect(open).not.toHaveBeenCalled();
    expect(createElement).toHaveBeenCalledWith('a');
    expect(anchor.href).toBe('blob:report');
    expect(anchor.download).toBe('SPRR001-53001.pdf');
    expect(appendChild).toHaveBeenCalledWith(anchor);
    expect(click).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
  });

  it('openBlobInNewTab downloads when the prepared tab was already closed', () => {
    const closedTab = { closed: true, opener: {} as Window, location: { href: '' } } as Window;
    const createObjectURL = vi.fn().mockReturnValue('blob:report');
    const revokeObjectURL = vi.fn();
    const open = vi.fn();
    const click = vi.fn();
    const remove = vi.fn();
    const anchor = {
      href: '',
      download: '',
      rel: '',
      click,
      remove
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(document.body, 'appendChild').mockReturnValue(anchor);
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.stubGlobal('open', open);

    openBlobInNewTab(new Blob(['%PDF'], { type: 'application/pdf' }), closedTab);

    expect(open).not.toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
  });
});
