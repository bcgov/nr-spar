import html2canvas from 'html2canvas';

import type { SparMapTheme } from '../../../types/SparMapTypes';
import type { LegendOverlayData, LegendSwatch } from '../../../api-service/legendApi';

export interface PrintMapOptions {
  /** Seedlot number shown in the print header + footer. */
  seedlotNumber: string;
  /** Active map theme (retained for future theme-specific print tweaks). */
  theme: SparMapTheme;
  /**
   * The dynamic legend for what is currently on the map, read from
   * `SparMapContext.legendData`. Rendered as DOM in the print's right-hand
   * column so it scales cleanly (replacing the old WMS raster legend). When
   * empty, the legend column is dropped and the map spans the full width.
   */
  legendData?: LegendOverlayData[];
  /** Optional notes block printed in the bottom band. */
  notes?: string;
}

/**
 * Escape a string for safe inclusion in HTML text or a quoted attribute.
 * The print window is built with `document.write`, so EVERY interpolated
 * value has to come through here — including ones that look trustworthy.
 * `seedlotNumber` in particular is a URL path param and is fully
 * attacker-controlled via a crafted link.
 */
export const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (ch) => {
  switch (ch) {
    case '&': return '&amp;';
    case '<': return '&lt;';
    case '>': return '&gt;';
    case '"': return '&quot;';
    case "'": return '&#39;';
    default: return ch;
  }
});

/**
 * CSS colours are interpolated into a `style="..."` attribute below, so a
 * value containing a quote would break out of the attribute. `legendApi`
 * already constrains these at the parse boundary; this is the second half
 * of that guarantee, kept here so the template is safe on its own terms
 * rather than by trusting its caller.
 *
 * Accepts hex (`#rgb` / `#rrggbb` / `#rrggbbaa`), the CSS named colours
 * GeoServer emits, and `rgb()` / `rgba()`. Anything else falls back.
 */
const CSS_COLOR = /^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d\s.,%]+\))$/i;

export const safeCssColor = (value: string | null, fallback: string): string => (
  value !== null && CSS_COLOR.test(value) ? value : fallback
);

/**
 * Inline swatch style for one print-legend rule. Mirrors the on-screen
 * `swatchStyle` in `<LegendPanel>`: polygons are a filled, bordered square;
 * points a filled circle; lines a coloured horizontal rule. Emitted as a
 * CSS string (not a React style object) because the print window is built
 * via `document.write`.
 */
const printSwatchStyle = (swatch: LegendSwatch): string => {
  if (swatch.geometry === 'line') {
    const width = Math.max(2, Math.round(swatch.strokeWidth));
    return 'display:inline-block;width:16px;height:0;flex:0 0 auto;'
      + `border-top:${width}px solid ${safeCssColor(swatch.stroke, '#161616')};`;
  }
  const radius = swatch.geometry === 'point' ? '50%' : '2px';
  return 'display:inline-block;width:12px;height:12px;flex:0 0 auto;box-sizing:border-box;'
    + `border:1px solid ${safeCssColor(swatch.stroke, '#888888')};`
    + `background:${safeCssColor(swatch.fill, 'transparent')};border-radius:${radius};`;
};

/**
 * Render the dynamic text-based legend to an inline-styled HTML string for
 * the print window. Mirrors the on-screen `<LegendPanel>` (swatch + label
 * per rule, grouped by overlay) but emits HTML strings because the print
 * window is built via `document.write`, and uses inline styles so no
 * external stylesheet has to load before print. Labels are escaped since
 * they flow into `document.write`. Returns '' when there is nothing to show
 * so the caller can drop the legend column.
 */
export const buildPrintLegendHtml = (legendData: LegendOverlayData[]): string => (
  legendData.map((overlay) => {
    const rows = overlay.rules.map((rule) => (
      '<li class="print-legend__row">'
      + `<span class="print-legend__swatch" style="${printSwatchStyle(rule.swatch)}"></span>`
      + `<span class="print-legend__label">${escapeHtml(rule.label)}</span></li>`
    )).join('');
    return '<div class="print-legend__section">'
      + `<div class="print-legend__title">${escapeHtml(overlay.label)}</div>`
      + `<ul class="print-legend__rules">${rows}</ul></div>`;
  }).join('')
);

/**
 * Templated print layout mirroring the legacy SPAR
 * `assets/print-landscape.html` structure:
 *   - 8.5 x 11 landscape page with a 1cm margin and a 2-px frame
 *   - Top band: BC Gov wordmark + map title + seedlot number + date
 *   - Map area: raster map capture (html2canvas) + right-side legend column
 *   - Bottom band: BC Gov disclaimer + notes + scale + north arrow
 *
 * The right-side legend column renders the dynamic text-based legend as DOM
 * (swatch + label per rule, via `buildPrintLegendHtml`), which loads
 * instantly and scales cleanly — unlike the old WMS `GetLegendGraphic`
 * rasters, which scaled unreliably in the print window. When no legend
 * symbols are in view the column is dropped and the map spans full width.
 *
 * Leaflet tiles render via CSS transform stacks that browser print
 * engines can't composite reliably, so we capture the map area to a
 * canvas first (same approach the previous printMap used) and embed
 * the resulting raster as the map portion of the layout. Everything
 * around the map is vector HTML.
 */
export const printMap = async (options: PrintMapOptions): Promise<void> => {
  const { seedlotNumber, notes, legendData } = options;
  const mapEl = document.querySelector('.leaflet-container') as HTMLElement | null;
  if (!mapEl) {
    throw new Error('The map is not ready yet. Wait for it to finish loading, then try again.');
  }

  // Escape once, up front. `seedlotNumber` is a URL path param, so every
  // interpolation of it below is attacker-reachable via a crafted link.
  const safeSeedlot = escapeHtml(seedlotNumber);

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

  let dataUrl: string;
  try {
    const canvas = await html2canvas(mapEl, {
      useCORS: true,
      // MUST stay false. With `allowTaint: true`, html2canvas draws
      // cross-origin tiles that failed the CORS fetch, which taints the
      // canvas and makes `toDataURL` below throw a SecurityError — the
      // whole print then fails silently. Leaving it false means a tile
      // server that doesn't send Access-Control-Allow-Origin (GeoServer
      // at openmaps.gov.bc.ca does not, by default) is simply omitted
      // from the capture and the rest of the map still prints.
      allowTaint: false,
      logging: false,
      scale: 1,
      width: mapEl.clientWidth,
      height: mapEl.clientHeight,
      scrollX: 0,
      scrollY: -window.scrollY
    });
    dataUrl = canvas.toDataURL('image/png');
  } finally {
    // Restore the hidden chrome even when the capture throws — otherwise
    // the layers control and Geoman toolbar stay `display: none` for the
    // rest of the session.
    hidden.forEach((el) => el.style.removeProperty('display'));
    savedStyles.forEach((saved) => {
      const { el, shadow, bg } = saved;
      el.style.boxShadow = shadow;
      el.style.background = bg;
    });
  }

  // Capture the scale text from Leaflet's bottom-left scale control so
  // the print includes the same "100 km / 50 mi" indication the
  // operator was looking at when they hit print.
  const scaleControl = document.querySelector('.leaflet-control-scale-line');
  const scaleText = scaleControl ? scaleControl.textContent : '';

  // Dynamic text-based legend for whatever is currently on the map. Empty
  // string when nothing is in view, which drops the legend column below.
  const legendHtml = buildPrintLegendHtml(legendData ?? []);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('The print window was blocked. Allow pop-ups for this site and try again.');
  }
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
  <title>SPAR Seed Map - ${safeSeedlot}</title>
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
    .print-body { display: grid; grid-template-columns: ${legendHtml ? '1fr 210px' : '1fr'}; gap: 0.75rem; min-height: 0; }
    .print-map { border: 1px solid #161616; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .print-map img { width: 100%; height: 100%; object-fit: contain; }
    .print-legend { border: 1px solid #888; border-radius: 2px; padding: 0.35rem 0.45rem; overflow: hidden; font-size: 0.6rem; }
    .print-legend__heading { font-weight: 700; font-size: 0.8rem; color: #003366; margin-bottom: 0.3rem; padding-bottom: 0.15rem; border-bottom: 1px solid #ccc; }
    .print-legend__section { margin-bottom: 0.4rem; break-inside: avoid; }
    .print-legend__title { font-weight: 600; font-size: 0.65rem; margin-bottom: 0.15rem; }
    .print-legend__rules { list-style: none; }
    .print-legend__row { display: flex; align-items: center; gap: 0.3rem; margin: 0.12rem 0; }
    .print-legend__label { line-height: 1.25; word-break: break-word; }
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
      <span class="print-header__seedlot">Seedlot ${safeSeedlot}</span>
      <span class="print-header__date">${dateStr}</span>
    </div>
    <div class="print-body">
      <div class="print-map">
        <img src="${dataUrl}" alt="Map snapshot for seedlot ${safeSeedlot}" />
      </div>
      ${legendHtml ? `<aside class="print-legend"><div class="print-legend__heading">Legend</div>${legendHtml}</aside>` : ''}
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
};
