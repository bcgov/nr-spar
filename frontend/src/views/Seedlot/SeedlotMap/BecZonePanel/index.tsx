import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { useSparMap } from '../../../../contexts/SparMapContext';

/**
 * Right-side panel listing the BEC zones associated with the current
 * seedlot's area of use (AOUCBST / PLANTSITECBST themes). Mirrors the
 * legacy `aoucbst_panel` from `cwmSparmap.jsp:366-376` and the
 * `createBecTable` + `showBECFeatureInfoOnMapByBecCode` flow in
 * `sparmap.js:176-242, 130-174`:
 *
 *   1. Shows the "CBST Area of Use Tool" header and explanatory text.
 *   2. Displays the seedlot or veglot number from the URL params.
 *   3. Lists each BEC zone code; codes in `becNotSuit` render with a
 *      trailing `*` and the panel surfaces the "(*) Species may not be
 *      suitable in this BEC unit" hint.
 *   4. Each row is clickable — clicking calls `zoomToBecZone(code)`
 *      which fetches the polygon, paints the highlight, and fits the
 *      map bounds to the zone (registered by `<BecHighlightLayer>`).
 *      The clicked row gets a yellow `--selected` background to match
 *      the legacy table's `#f4f400` row-selection behavior.
 *
 * Mounted from `<SeedlotMap>` as a SIDE panel (outside `<LeafletMap>`)
 * for the AOUCBST and PLANTSITECBST themes. Reads state from
 * `SparMapContext` only — performs no fetching of its own; the WFS
 * lookup lives in `becZonesApi.fetchBecZoneByMapLabel` driven by the
 * bridge callback.
 */
const BecZonePanel = () => {
  const { becZoneCodes, becNotSuit, zoomToBecZone } = useSparMap();
  const { seedlotNumber } = useParams<{ seedlotNumber: string }>();
  const [searchParams] = useSearchParams();
  const veglotNumber = searchParams.get('veglot');
  // The URL `seedlot=` highlight param wins over the path param for the
  // display label — legacy `showSeedlotNumberOnPanel` (cwmSparmap.jsp:
  // 163-169) read from `Sparmap.seedlot` which was the URL param.
  const displaySeedlot = searchParams.get('seedlot') ?? seedlotNumber ?? null;
  const [selected, setSelected] = useState<string | null>(null);

  const handleRowClick = (code: string) => {
    setSelected(code);
    zoomToBecZone?.(code);
  };

  return (
    <div
      className="bec-zone-panel bec-zone-panel--side"
      data-testid="bec-zone-panel"
      role="region"
      aria-label="BEC Zone list"
    >
      <h2 className="bec-zone-panel__title">CBST Area of Use Tool</h2>
      <p className="bec-zone-panel__subtitle">
        List of Biogeoclimatic Zone/Subzone/Variants where the Seedlot or
        Vegetative Lot can be planted
      </p>
      {becNotSuit.length > 0 && (
        <p className="bec-zone-panel__hint" data-testid="bec-zone-panel-hint">
          (*) Species may not be suitable in this BEC unit
        </p>
      )}
      {displaySeedlot && !veglotNumber && (
        <p className="bec-zone-panel__lot" data-testid="bec-zone-panel-lot">
          <strong>Seedlot Number:</strong>
          {' '}
          {displaySeedlot}
        </p>
      )}
      {veglotNumber && (
        <p className="bec-zone-panel__lot" data-testid="bec-zone-panel-lot">
          <strong>Veglot Number:</strong>
          {' '}
          {veglotNumber}
        </p>
      )}
      <table className="bec-zone-panel__table">
        <thead>
          <tr><th>BEC Zone</th></tr>
        </thead>
        <tbody>
          {becZoneCodes.map((code) => {
            const display = becNotSuit.includes(code) ? `${code}*` : code;
            const isSelected = selected === code;
            const className = `bec-zone-panel__row${isSelected ? ' bec-zone-panel__row--selected' : ''}`;
            return (
              <tr
                key={code}
                className={className}
                onClick={() => handleRowClick(code)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleRowClick(code);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                data-testid={`bec-zone-row-${code}`}
              >
                <td>{display}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BecZonePanel;
