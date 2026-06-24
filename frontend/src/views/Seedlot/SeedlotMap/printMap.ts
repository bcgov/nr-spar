import html2canvas from 'html2canvas';

import type { SparMapTheme } from '../../../types/SparMapTypes';
import { getThemeProfile } from '../../../config/leaflet-themes';
import { buildLegendUrl } from './LegendPanel';

export interface PrintMapOptions {
  /** Seedlot number shown in the print header + footer. */
  seedlotNumber: string;
  /** Active map theme — used to look up the visible legend overlays. */
  theme: SparMapTheme;
  /** Optional notes block printed in the bottom band. */
  notes?: string;
}

/**
 * Escape a string for safe inclusion in HTML text content. Defensive
 * because overlay labels come from the layer registry which is project-
 * controlled, but better safe than sorry — the print window is
 * generated via document.write so unescaped content would be parsed.
 */
const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (ch) => {
  switch (ch) {
    case '&': return '&amp;';
    case '<': return '&lt;';
    case '>': return '&gt;';
    case '"': return '&quot;';
    case "'": return '&#39;';
    default: return ch;
  }
});

const escapeHtmlAttr = (s: string): string => escapeHtml(s);

/**
 * Templated print layout mirroring the legacy SPAR
 * `assets/print-landscape.html` structure:
 *   - 8.5 x 11 landscape page with a 1cm margin and a 2-px frame
 *   - Top band: BC Gov wordmark + map title + seedlot number + date
 *   - Left ~80%: raster map capture (html2canvas)
 *   - Right ~20%: WMS GetLegendGraphic images per visible legend-
 *     eligible overlay
 *   - Bottom band: BC Gov disclaimer + notes + scale + north arrow
 *
 * Leaflet tiles render via CSS transform stacks that browser print
 * engines can't composite reliably, so we capture the map area to a
 * canvas first (same approach the previous printMap used) and embed
 * the resulting raster as the map portion of the layout. Everything
 * around the map is vector HTML.
 */
export const printMap = async (options: PrintMapOptions): Promise<void> => {
  const { seedlotNumber, theme, notes } = options;
  const mapEl = document.querySelector('.leaflet-container') as HTMLElement | null;
  if (!mapEl) return;
  try {
    // Temporarily hide toolbar chrome that shouldn't appear in print.
    const hideSelectors = '.leaflet-control-layers, .leaflet-pm-toolbar';
    const hidden: HTMLElement[] = [];
    mapEl.querySelectorAll(hideSelectors).forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style.display !== 'none') {
        hidden.push(htmlEl);
        htmlEl.style.setProperty('display', 'none', 'important');
      }
    });

    const popups = mapEl.querySelectorAll(
      '.leaflet-popup-content-wrapper, .leaflet-popup-tip'
    );
    const savedStyles: { el: HTMLElement; shadow: string; bg: string }[] = [];
    popups.forEach((el) => {
      const htmlEl = el as HTMLElement;
      savedStyles.push({
        el: htmlEl,
        shadow: htmlEl.style.boxShadow,
        bg: htmlEl.style.background
      });
      htmlEl.style.boxShadow = 'none';
      htmlEl.style.background = '#ffffff';
    });

    const canvas = await html2canvas(mapEl, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: 1,
      width: mapEl.clientWidth,
      height: mapEl.clientHeight,
      scrollX: 0,
      scrollY: -window.scrollY
    });

    hidden.forEach((el) => el.style.removeProperty('display'));
    savedStyles.forEach((saved) => {
      const { el, shadow, bg } = saved;
      el.style.boxShadow = shadow;
      el.style.background = bg;
    });

    const dataUrl = canvas.toDataURL('image/png');

    // Capture the scale text from Leaflet's bottom-left scale control so
    // the print includes the same "100 km / 50 mi" indication the
    // operator was looking at when they hit print.
    const scaleControl = document.querySelector('.leaflet-control-scale-line');
    const scaleText = scaleControl ? scaleControl.textContent : '';

    // Collect WMS GetLegendGraphic URLs for visible legend-eligible
    // overlays in the active theme. Mirrors the legacy print template's
    // right-side legend column.
    const profile = getThemeProfile(theme);
    const legends = profile.overlays
      .filter((o) => o.visible && o.legendEligible)
      .map((o) => ({ label: o.label, url: buildLegendUrl(o) }));

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const dateStr = new Date().toLocaleDateString();
    const disclaimer = (
      'This map is a user-generated static output from the SPAR '
      + 'Seed Map application and is for general reference only. Data '
      + 'layers may not be accurate, current, or otherwise reliable. '
      + 'NOT TO BE USED FOR NAVIGATION.'
    );

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>SPAR Seed Map - ${seedlotNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: landscape; margin: 1cm; }
    body { font-family: 'BC Sans', 'Noto Sans', sans-serif; color: #161616; }
    .print-frame { display: grid; grid-template-rows: auto 1fr auto; height: 100vh; gap: 0.5rem; }
    .print-header {
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      gap: 1rem;
      align-items: baseline;
      padding: 0.5rem 0;
      border-bottom: 2px solid #003366;
    }
    .print-header__wordmark { font-weight: 700; font-size: 1rem; color: #003366; }
    .print-header__title { font-size: 1.25rem; font-weight: 600; }
    .print-header__seedlot { font-size: 0.9rem; color: #333; }
    .print-header__date { font-size: 0.75rem; color: #666; }
    .print-body { display: grid; grid-template-columns: 1fr 220px; gap: 0.75rem; min-height: 0; }
    .print-map { border: 1px solid #161616; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .print-map img { width: 100%; height: 100%; object-fit: contain; }
    .print-legend { border: 1px solid #161616; padding: 0.5rem; overflow-y: auto; }
    .print-legend h3 { font-size: 0.8rem; font-weight: 600; margin-bottom: 0.5rem; border-bottom: 1px solid #888; padding-bottom: 0.25rem; }
    .print-legend__item { margin-bottom: 0.5rem; }
    .print-legend__label { font-size: 0.65rem; font-weight: 600; margin-bottom: 0.125rem; color: #444; }
    .print-legend__img { max-width: 100%; height: auto; }
    .print-footer {
      display: grid;
      grid-template-columns: 3fr 2fr 1fr auto;
      gap: 0.75rem;
      padding: 0.375rem 0;
      border-top: 1px solid #888;
      font-size: 0.625rem;
    }
    .print-footer__disclaimer { font-style: italic; }
    .print-footer__notes { white-space: pre-wrap; }
    .print-footer__scale { text-align: right; line-height: 1.4; }
    .print-footer__scale strong { display: block; font-size: 0.7rem; }
    .print-footer__compass {
      width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid #161616;
      display: grid; place-items: center; font-weight: 700; font-size: 0.625rem;
    }
  </style>
</head>
<body>
  <div class="print-frame">
    <div class="print-header">
      <span class="print-header__wordmark">Government of British Columbia</span>
      <span class="print-header__title">SPAR Seed Map</span>
      <span class="print-header__seedlot">Seedlot ${seedlotNumber}</span>
      <span class="print-header__date">${dateStr}</span>
    </div>
    <div class="print-body">
      <div class="print-map">
        <img src="${dataUrl}" alt="Map snapshot for seedlot ${seedlotNumber}" />
      </div>
      <div class="print-legend">
        <h3>Legend</h3>
        ${legends.length === 0
    ? '<div class="print-legend__item"><span class="print-legend__label">No legend-eligible overlays visible.</span></div>'
    : legends.map((l) => `
            <div class="print-legend__item">
              <div class="print-legend__label">${escapeHtml(l.label)}</div>
              <img class="print-legend__img" src="${escapeHtmlAttr(l.url)}" alt="${escapeHtml(l.label)} legend" />
            </div>
          `).join('')}
      </div>
    </div>
    <div class="print-footer">
      <div class="print-footer__disclaimer">${disclaimer}</div>
      <div class="print-footer__notes">${escapeHtml(notes ?? '')}</div>
      <div class="print-footer__scale">
        <strong>Scale</strong>
        ${escapeHtml(scaleText ?? '')}
      </div>
      <div class="print-footer__compass" title="North">N</div>
    </div>
  </div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Map print capture failed', err);
  }
};
