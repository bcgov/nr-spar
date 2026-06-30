import React, { type CSSProperties } from 'react';
import { Accordion, AccordionItem, Tile } from '@carbon/react';

import { useSparMap } from '../../../../contexts/SparMapContext';
import type { LegendSwatch } from '../../../../api-service/legendApi';

/**
 * Inline style for one legend swatch, derived from a style rule's
 * symbolizer. Polygons render as a filled, bordered square; points as a
 * filled circle; lines as a colored horizontal rule. Exported so the
 * mapping from swatch → CSS can be unit-tested without mounting the panel.
 */
export const swatchStyle = (swatch: LegendSwatch): CSSProperties => {
  if (swatch.geometry === 'line') {
    return {
      width: 16,
      height: 0,
      flex: '0 0 auto',
      borderTop: `${Math.max(2, Math.round(swatch.strokeWidth))}px solid ${swatch.stroke ?? '#161616'}`
    };
  }
  return {
    width: 16,
    height: 16,
    flex: '0 0 auto',
    boxSizing: 'border-box',
    border: `1px solid ${swatch.stroke ?? '#888888'}`,
    backgroundColor: swatch.fill ?? 'transparent',
    borderRadius: swatch.geometry === 'point' ? '50%' : 2
  };
};

/**
 * LEGEND panel — the dynamic, text-based legend. Renders one accordion
 * section per overlay currently visible in the map view, each listing the
 * style rules (color swatch + label) that have features in the current
 * extent. The data is produced by `<LegendDataLayer>` from GeoServer's JSON
 * legend (trimmed to the viewport via `hideEmptyRules`) and read here from
 * `SparMapContext.legendData`.
 *
 * Replaces the legacy raster `GetLegendGraphic` `<img>` legend, which
 * couldn't scale, printed poorly, and showed a layer's full symbology
 * regardless of what was actually on the map. When nothing is in view the
 * panel shows an empty-state Tile so the layout doesn't collapse.
 */
const LegendPanel = () => {
  const { legendData } = useSparMap();

  if (legendData.length === 0) {
    return (
      <div className="legend-panel" data-testid="legend-panel">
        <Tile data-testid="legend-panel-empty">
          No legend symbols in the current view.
        </Tile>
      </div>
    );
  }

  return (
    <div className="legend-panel" data-testid="legend-panel">
      <Accordion>
        {legendData.map((overlay) => (
          <AccordionItem
            title={overlay.label}
            key={overlay.id}
            open
            data-testid={`legend-panel-item-${overlay.id}`}
          >
            <ul className="legend-panel__rules">
              {overlay.rules.map((rule, index) => (
                <li
                  className="legend-panel__row"
                  // Rule labels can repeat (e.g. multiple "Other"); the index
                  // disambiguates and the list is static for a given render.
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${overlay.id}-${index}-${rule.label}`}
                  data-testid={`legend-panel-row-${overlay.id}`}
                >
                  <span
                    className="legend-panel__swatch"
                    style={swatchStyle(rule.swatch)}
                    aria-hidden="true"
                  />
                  <span className="legend-panel__label">{rule.label}</span>
                </li>
              ))}
            </ul>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default LegendPanel;
