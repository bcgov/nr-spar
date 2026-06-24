import { describe, it, expect } from 'vitest';
import { SPAR_MAP_THEMES } from '../../types/SparMapTypes';
import { getThemeProfile } from '../../config/leaflet-themes';
import { LEGACY_SPAR_WMS_URL } from '../../config/legacy-spar-layers';

describe('theme registry', () => {
  it.each(SPAR_MAP_THEMES)('has a profile for "%s"', (theme) => {
    const profile = getThemeProfile(theme);
    expect(profile).toBeDefined();
    expect(profile.theme).toBe(theme);
  });

  it.each(SPAR_MAP_THEMES)('profile for "%s" has a basemap with URL template', (theme) => {
    const profile = getThemeProfile(theme);
    expect(profile.basemap).toBeDefined();
    expect(profile.basemap.urlTemplate).toBeTruthy();
    expect(profile.basemap.urlTemplate).toMatch(/^https?:/);
  });

  it.each(SPAR_MAP_THEMES)('profile for "%s" has a defaultExtent with 2 corners', (theme) => {
    const profile = getThemeProfile(theme);
    expect(profile.defaultExtent).toBeDefined();
    expect(Array.isArray(profile.defaultExtent)).toBe(true);
    expect((profile.defaultExtent as unknown[])).toHaveLength(2);
  });

  it('only COLAREA has drawingEnabled: true', () => {
    const drawingThemes = SPAR_MAP_THEMES.filter(
      (theme) => getThemeProfile(theme).drawingEnabled,
    );
    expect(drawingThemes).toEqual(['COLAREA']);
  });

  it('default theme has no identifyLayer', () => {
    const profile = getThemeProfile('default');
    expect(profile.identifyLayer).toBeUndefined();
  });

  it('AOUCBST and PLANTSITECBST have a BEC identify layer', () => {
    const aoucbst = getThemeProfile('AOUCBST');
    const plantsiteCbst = getThemeProfile('PLANTSITECBST');
    expect(aoucbst.identifyLayer).toBeTruthy();
    expect(plantsiteCbst.identifyLayer).toBeTruthy();
  });

  // Legacy cbst-overlay-config.json:1374-1390 has exactly one default-on
  // BEC subzone layer — `SPAR_BEC_BIOGEOCLIMATIC_250K_COLOUR_THEMED_SPG`
  // (the 250K colour fill). Earlier sessions enabled five (250K + 20K,
  // colour + outline + labels) which clutters the AOUCBST view.
  it('AOUCBST default-visible overlays match legacy: BEC 250K colour ONLY', () => {
    const profile = getThemeProfile('AOUCBST');
    const visibleIds = profile.overlays.filter((o) => o.visible).map((o) => o.id);
    expect(visibleIds).toContain('bec_subzones_250k');
    expect(visibleIds).not.toContain('bec_subzones_250k_outline');
    expect(visibleIds).not.toContain('bec_subzones_250k_labels');
    expect(visibleIds).not.toContain('bec_subzones_20k');
    expect(visibleIds).not.toContain('bec_subzones_20k_outline');
    // Active seedlots/veglots stay on (legacy parity).
    expect(visibleIds).toContain('active_seedlots');
    expect(visibleIds).toContain('active_veglots');
  });

  // Legacy zoom levels from sparmap.js — every themeXxx handler called
  // `Sparmap.cwmmap.olmap.zoomTo(<N>)` after `zoom.toExtent(extent)`.
  // The new code applies `initialZoom` only when there is no URL
  // `extent=` (which when present takes precedence via fitBounds).
  it.each([
    ['AOUCBST',         8],
    ['aoua',            8],
    ['aoub',            8],
    ['aoubplus',        8],
    ['PLANTSITECBST',   8],
    ['collection',      13],
    ['plantsiteA',      13],
    ['plantsiteAFill',  13],
    ['plantsiteB',      13],
    ['COLAREA',         13],
    ['default',         6],
  ] as const)('theme "%s" initialZoom matches legacy zoomTo(%i)', (theme, expected) => {
    expect(getThemeProfile(theme).initialZoom).toBe(expected);
  });

  it('every non-default theme has at least 1 overlay', () => {
    for (const theme of SPAR_MAP_THEMES) {
      if (theme === 'default') continue;
      const profile = getThemeProfile(theme);
      expect(profile.overlays.length).toBeGreaterThanOrEqual(1);
    }
  });

  it.each(SPAR_MAP_THEMES)(
    'profile for "%s" exposes the full legacy SPAR layer registry (>=25)',
    (theme) => {
      const profile = getThemeProfile(theme);
      expect(profile.overlays.length).toBeGreaterThanOrEqual(25);
    },
  );

  it.each(SPAR_MAP_THEMES)(
    'profile for "%s" overlays all use the openmaps WMS URL with pub: layer prefix',
    (theme) => {
      const profile = getThemeProfile(theme);
      for (const overlay of profile.overlays) {
        expect(overlay.url).toBe(LEGACY_SPAR_WMS_URL);
        expect(overlay.layers.startsWith('pub:')).toBe(true);
      }
    },
  );
});
