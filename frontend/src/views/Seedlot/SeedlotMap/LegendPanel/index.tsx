import React, { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  Tile,
  InlineNotification
} from '@carbon/react';

import { getThemeProfile } from '../../../../config/leaflet-themes';
import type {
  SparMapTheme,
  SparMapOverlayLayer
} from '../../../../types/SparMapTypes';

interface LegendPanelProps {
  theme: SparMapTheme;
}

/**
 * Build a WMS `GetLegendGraphic` URL for a single overlay. Uses the
 * first layer name in the comma-separated `overlay.layers` list because
 * most WMS servers (GeoServer, QGIS Server, MapServer) return a legend
 * per layer name rather than a composite legend for a grouped layer
 * request. If the overlay ships multiple layer names we keep the first
 * one as the representative legend; the identify flow already handles
 * the full comma-list via GetFeatureInfo.
 *
 * Exported for unit testing — the URL composition is the full contract
 * of the legend fetch, so we want a direct assertion without mounting
 * the component.
 */
export const buildLegendUrl = (overlay: SparMapOverlayLayer): string => {
  const layerName = (overlay.layers ?? '').split(',')[0]?.trim() ?? '';
  const params = new URLSearchParams({
    service: 'WMS',
    version: '1.3.0',
    request: 'GetLegendGraphic',
    layer: layerName,
    format: 'image/png',
    transparent: 'true'
  });
  if (overlay.styles) {
    params.set('style', overlay.styles.split(',')[0]?.trim() ?? overlay.styles);
  }
  const separator = overlay.url.includes('?') ? '&' : '?';
  return `${overlay.url}${separator}${params.toString()}`;
};

/**
 * LEGEND panel — Carbon Accordion listing the WMS legend graphic for
 * each visible overlay in the active theme profile. Replicates the
 * legacy SPAR cwmSparmap.jsp LEGEND panel which shipped as a static
 * HTML block per theme; the React port reads the overlay list out of
 * the theme profile and fetches legend graphics on demand.
 *
 * Only overlays flagged `legendEligible` and currently `visible` are
 * rendered. When the active theme has no eligible overlays (e.g. the
 * `default` theme which has an empty overlay list), the panel renders
 * an empty-state Tile so the layout doesn't collapse.
 *
 * Graceful degradation — if a legend image fails to load (WMS server
 * down, network error, unsupported layer name), the row swaps the
 * broken `<img>` for a Carbon InlineNotification so the rest of the
 * panel keeps working.
 */
const LegendPanel = ({ theme }: LegendPanelProps) => {
  const profile = getThemeProfile(theme);
  const legendLayers = profile.overlays.filter(
    (overlay) => overlay.visible && overlay.legendEligible
  );

  // Track which overlay IDs have failed to load — used to swap the
  // `<img>` for a fallback notification. A Set keeps membership checks
  // O(1) and avoids re-rendering the whole list on each failure.
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  const markFailed = (id: string) => {
    setFailedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  if (legendLayers.length === 0) {
    return (
      <div className="legend-panel" data-testid="legend-panel">
        <Tile data-testid="legend-panel-empty">
          No legend available for this theme.
        </Tile>
      </div>
    );
  }

  return (
    <div className="legend-panel" data-testid="legend-panel">
      <Accordion>
        {legendLayers.map((overlay) => {
          const legendUrl = buildLegendUrl(overlay);
          const hasFailed = failedIds.has(overlay.id);
          return (
            <AccordionItem
              title={overlay.label}
              key={overlay.id}
              open
              data-testid={`legend-panel-item-${overlay.id}`}
            >
              {hasFailed ? (
                <InlineNotification
                  kind="warning"
                  title={`Legend unavailable for ${overlay.label}`}
                  subtitle="The WMS server did not return a legend graphic for this layer."
                  lowContrast
                  hideCloseButton
                  data-testid={`legend-panel-fallback-${overlay.id}`}
                />
              ) : (
                <img
                  className="legend-panel__image"
                  src={legendUrl}
                  alt={`Legend for ${overlay.label}`}
                  loading="lazy"
                  onError={() => markFailed(overlay.id)}
                  data-testid={`legend-panel-image-${overlay.id}`}
                />
              )}
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default LegendPanel;
