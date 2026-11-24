import html2canvas from 'html2canvas';
import {
  describe, it, expect, vi, beforeEach, afterEach
} from 'vitest';

import {
  printMap, escapeHtml, safeCssColor, buildPrintLegendHtml
} from '../../../views/Seedlot/SeedlotMap/printMap';
import type { SparMapTheme } from '../../../types/SparMapTypes';

vi.mock('html2canvas', () => ({ default: vi.fn() }));

const XSS = '<img src=x onerror=alert(1)>';

const legend = (label: string, swatch: Record<string, unknown>) => [{
  id: 'o1', label: 'Overlay', rules: [{ label, swatch }]
}];

let printedHtml = '';
let fakeWindow: { onload: (() => void) | null; print: () => void; close: () => void; location: { replace: (u: string) => void } };

const mountMap = () => {
  document.body.innerHTML = `
    <div class="leaflet-container">
      <div class="leaflet-control-layers"></div>
      <div class="leaflet-popup-content-wrapper" style="box-shadow: 1px 1px red; background: blue"></div>
    </div>
    <div class="leaflet-control-scale-line">5 km</div>`;
};

beforeEach(() => {
  vi.clearAllMocks();
  printedHtml = '';
  vi.mocked(html2canvas).mockResolvedValue({ toDataURL: () => 'data:image/png;base64,AAA' } as never);
  fakeWindow = {
    onload: null, print: vi.fn(), close: vi.fn(), location: { replace: vi.fn() }
  };
  vi.spyOn(window, 'open').mockReturnValue(fakeWindow as never);
  URL.createObjectURL = vi.fn((blob: Blob) => {
    blob.text().then((t) => { printedHtml = t; });
    return 'blob:print';
  });
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  document.body.innerHTML = '';
});

const html = async () => {
  await vi.waitFor(() => expect(printedHtml).not.toBe(''));
  return printedHtml;
};

describe('print HTML escaping', () => {
  it('escapes every HTML-significant character', () => {
    expect(escapeHtml('<a href="x">\'&\'</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });

  it('only lets plain CSS colours through', () => {
    expect(safeCssColor('#a1b2c3', '#000')).toBe('#a1b2c3');
    expect(safeCssColor('rgba(1, 2, 3, 0.5)', '#000')).toBe('rgba(1, 2, 3, 0.5)');
    expect(safeCssColor('red;background:url(evil)', '#000')).toBe('#000');
    expect(safeCssColor(null, '#000')).toBe('#000');
  });

  it('builds a legend that escapes labels and drops unsafe colours', () => {
    const out = buildPrintLegendHtml([
      ...legend(XSS, { geometry: 'polygon', fill: 'red;x:y', stroke: '#111' }),
      ...legend('Road', { geometry: 'line', stroke: '#ff0000', strokeWidth: 3 }),
      ...legend('Site', { geometry: 'point', fill: '#00ff00', stroke: null })
    ] as never);
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;img');
    expect(out).not.toContain('x:y');
    expect(out).toContain('#ff0000');
  });

  it('builds nothing for an empty legend', () => {
    expect(buildPrintLegendHtml([])).toBe('');
  });
});

describe('printMap', () => {
  it('fails clearly before the map has loaded', async () => {
    await expect(printMap({ seedlotNumber: '1', theme: {} as SparMapTheme }))
      .rejects.toThrow('The map is not ready yet');
  });

  it('captures the map and opens an escaped print page with legend, notes and scale', async () => {
    mountMap();
    await printMap({
      seedlotNumber: XSS,
      notes: 'note <b>bold</b>',
      theme: {} as SparMapTheme,
      legendData: legend('CWH', { geometry: 'polygon', fill: '#00ff00', stroke: '#111' }) as never
    });
    const page = await html();
    expect(page).not.toContain('<img src=x');
    expect(page).toContain('Seedlot &lt;img src=x onerror=alert(1)&gt;');
    expect(page).toContain('note &lt;b&gt;bold&lt;/b&gt;');
    expect(page).toContain('5 km');
    expect(page).toContain('<aside class="print-legend">');
    expect(page).toContain('src="data:image/png;base64,AAA"');
    expect(vi.mocked(html2canvas).mock.calls[0][1]).toMatchObject({ allowTaint: false, useCORS: true });
    expect(fakeWindow.location.replace).toHaveBeenCalledWith('blob:print');

    fakeWindow.onload!();
    expect(fakeWindow.print).toHaveBeenCalled();
    expect(fakeWindow.close).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:print');
  });

  it('hides controls during capture and restores them and popup styles afterwards', async () => {
    mountMap();
    const control = document.querySelector('.leaflet-control-layers') as HTMLElement;
    const popup = document.querySelector('.leaflet-popup-content-wrapper') as HTMLElement;
    vi.mocked(html2canvas).mockImplementation(async () => {
      expect(control.style.display).toBe('none');
      expect(popup.style.background).toContain('rgb(255, 255, 255)');
      return { toDataURL: () => 'data:,' } as never;
    });
    await printMap({ seedlotNumber: '1', theme: {} as SparMapTheme });
    expect(control.style.display).toBe('');
    expect(popup.style.background).toBe('blue');
    expect(await html()).not.toContain('<aside class="print-legend">');
  });

  it('restores the map even when capture fails', async () => {
    mountMap();
    vi.mocked(html2canvas).mockRejectedValue(new Error('tainted canvas'));
    await expect(printMap({ seedlotNumber: '1', theme: {} as SparMapTheme })).rejects.toThrow('tainted canvas');
    expect((document.querySelector('.leaflet-control-layers') as HTMLElement).style.display).toBe('');
  });

  it('explains a blocked pop-up', async () => {
    mountMap();
    vi.mocked(window.open).mockReturnValue(null);
    await expect(printMap({ seedlotNumber: '1', theme: {} as SparMapTheme })).rejects.toThrow('print window was blocked');
  });
});
