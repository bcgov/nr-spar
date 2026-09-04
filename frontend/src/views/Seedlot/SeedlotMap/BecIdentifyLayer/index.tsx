import React, { useEffect, useMemo, useState } from 'react';
import {
  useMap, useMapEvent, GeoJSON, Popup
} from 'react-leaflet';
import type { LatLng, PathOptions } from 'leaflet';
import type { Feature, MultiPolygon, Polygon } from 'geojson';

import { useWfsGetFeature } from '../../../../hooks/useWfsGetFeature';
import { wgs84ToBcAlbers } from '../../../../legacy_translated/SPR_SPATIAL_UTILS';
import { useSparMap } from '../../../../contexts/SparMapContext';
import {
  SEEDLOT_QUERY_LAYER,
  SPZ_QUERY_LAYER,
  VEGLOT_QUERY_LAYER
} from '../../../../shared-constants/spar-map';
import type { AoiPolygon } from '../../../../types/SparMapTypes';

/**
 * Split any polygon-family feature into one `AoiPolygon` per ring set.
 * MultiPolygons become N separate AoiPolygons so each becomes its own
 * Geoman-editable layer on the map. Returns an empty array for
 * non-polygon features (seedlot/veglot points are excluded by the
 * caller, so this is defensive).
 */
const featureToAoiPolygons = (feature: Feature): AoiPolygon[] => {
  const geom = feature.geometry;
  if (!geom) return [];
  if (geom.type === 'Polygon') {
    return [{
      type: 'Feature',
      geometry: geom as Polygon,
      properties: feature.properties ?? {}
    }];
  }
  if (geom.type === 'MultiPolygon') {
    return (geom as MultiPolygon).coordinates.map((coords) => ({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: coords },
      properties: feature.properties ?? {}
    }));
  }
  return [];
};

interface BecIdentifyLayerProps {
  /** WFS typeName for the BEC layer, e.g. 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY' */
  layerTypeName: string;
}

/**
 * Shape of the BEC feature properties returned by the BC Gov WFS
 * layer. Only the fields we surface in the popup are listed — any other
 * keys are passed through untouched by the GeoJSON response.
 */
interface BecFeatureProperties {
  ZONE?: string;
  SUBZONE?: string;
  VARIANT?: string | null;
  PHASE?: string | null;
  MAP_LABEL?: string;
  BGC_LABEL?: string;
  ZONE_NAME?: string;
  SUBZONE_NAME?: string;
  VARIANT_NAME?: string;
  NATURAL_DISTURBANCE?: string;
  NATURAL_DISTURBANCE_NAME?: string;
  FEATURE_AREA_SQM?: number;
}

interface SeedlotFeatureProperties {
  SEEDLOT_NUMBER?: string;
  VEGETATION_CODE?: string;
  BEC_ZONE?: string;
  ACTIVE_IND?: string;
  COLLECTION_ELEVATION?: string;
  USE_ELEVATION?: string;
}

interface VeglotFeatureProperties {
  VEG_LOT_ID?: string;
  VEGETATION_CODE?: string;
  BEC_ZONE?: string;
  ACTIVE_IND?: string;
}

interface SpzFeatureProperties {
  SEED_PLAN_ZONE_ID?: number;
  SEED_PLAN_ZONE_CODE?: string;
  VEGETATION_CODE?: string;
  GENETIC_CLASS_CODE?: string;
}

type IdentifiedKind = 'seedlot' | 'veglot' | 'bec' | 'spz';
interface Identified {
  kind: IdentifiedKind;
  feature: Feature;
}

/**
 * Build the CQL_FILTER strings used by the identify cascade. Point
 * layers (seedlot, veglot) use a 1 km DWITHIN buffer; polygon layers
 * (BEC, SPZ) use a point-INTERSECTS. Crucially the filters do NOT
 * narrow to URL `beczone=` / `spzid=` / `seedlot=` (intentional
 * enhancement over legacy — see 2026-05-20 parity audit A2/A3).
 *
 * Exported as a pure function so the assertion that we DON'T re-add a
 * legacy `IN(...)` / `AND SEEDLOT_NUMBER =` filter can live in a fast
 * unit test instead of a full Leaflet integration test.
 */
export const buildIdentifyCqlFilters = (
  albersCoords: [number, number] | null
): { pointCql: string; polygonCql: string } => {
  if (!albersCoords) return { pointCql: '', polygonCql: '' };
  const [x, y] = albersCoords;
  return {
    pointCql: `DWITHIN(GEOMETRY, POINT(${x} ${y}), 1000, meters)`,
    polygonCql: `INTERSECTS(GEOMETRY, POINT(${x} ${y}))`
  };
};

/**
 * Format a BEC area in km² with one decimal. Returns an empty string
 * when the underlying value is null/undefined so the popup row can be
 * skipped entirely.
 */
const formatArea = (areaSqm?: number): string => {
  if (typeof areaSqm !== 'number' || Number.isNaN(areaSqm)) return '';
  const km2 = areaSqm / 1_000_000;
  return `${km2.toLocaleString(undefined, { maximumFractionDigits: 1 })} km²`;
};

/**
 * Leaflet path style for the highlighted identify geometry, keyed by the
 * identified feature kind. Point layers (seedlot/veglot) get a red
 * outline, SPZ a blue fill, and BEC (default) a blue outline.
 */
const highlightStyleFor = (kind: IdentifiedKind): PathOptions => {
  if (kind === 'seedlot' || kind === 'veglot') {
    return { color: '#ff0000', weight: 2, fillOpacity: 0.5 };
  }
  if (kind === 'spz') {
    return {
      color: '#0000ff', weight: 2, fillColor: '#c4e2ff', fillOpacity: 0.3
    };
  }
  return { color: '#0066cc', weight: 2, fillOpacity: 0.2 };
};

interface PopupContent {
  title: string;
  rows: Array<{ label: string; value: string }>;
}

const buildPopup = (identified: Identified): PopupContent => {
  const props = identified.feature.properties ?? {};
  switch (identified.kind) {
    case 'seedlot': {
      const p = props as SeedlotFeatureProperties;
      const rows: Array<{ label: string; value: string }> = [];
      if (p.SEEDLOT_NUMBER) rows.push({ label: 'Seedlot', value: String(p.SEEDLOT_NUMBER) });
      if (p.VEGETATION_CODE) rows.push({ label: 'Species', value: p.VEGETATION_CODE });
      if (p.BEC_ZONE) rows.push({ label: 'BEC', value: p.BEC_ZONE });
      if (p.ACTIVE_IND) rows.push({ label: 'Status', value: p.ACTIVE_IND === 'YES' ? 'Active' : 'Expired' });
      if (p.COLLECTION_ELEVATION) rows.push({ label: 'Collection elev', value: p.COLLECTION_ELEVATION });
      if (p.USE_ELEVATION) rows.push({ label: 'Use elev', value: p.USE_ELEVATION });
      return { title: `Seedlot ${p.SEEDLOT_NUMBER ?? ''}`.trim(), rows };
    }
    case 'veglot': {
      const p = props as VeglotFeatureProperties;
      const rows: Array<{ label: string; value: string }> = [];
      if (p.VEG_LOT_ID) rows.push({ label: 'Veg Lot', value: String(p.VEG_LOT_ID) });
      if (p.VEGETATION_CODE) rows.push({ label: 'Species', value: p.VEGETATION_CODE });
      if (p.BEC_ZONE) rows.push({ label: 'BEC', value: p.BEC_ZONE });
      if (p.ACTIVE_IND) rows.push({ label: 'Status', value: p.ACTIVE_IND === 'YES' ? 'Active' : 'Expired' });
      return { title: `Veg Lot ${p.VEG_LOT_ID ?? ''}`.trim(), rows };
    }
    case 'spz': {
      const p = props as SpzFeatureProperties;
      const rows: Array<{ label: string; value: string }> = [];
      if (p.SEED_PLAN_ZONE_CODE) rows.push({ label: 'Code', value: p.SEED_PLAN_ZONE_CODE });
      if (p.SEED_PLAN_ZONE_ID) rows.push({ label: 'ID', value: String(p.SEED_PLAN_ZONE_ID) });
      if (p.VEGETATION_CODE) rows.push({ label: 'Species', value: p.VEGETATION_CODE });
      if (p.GENETIC_CLASS_CODE) rows.push({ label: 'Class', value: p.GENETIC_CLASS_CODE });
      return { title: 'Seed Plan Zone', rows };
    }
    case 'bec':
    default: {
      const p = props as BecFeatureProperties;
      const rows: Array<{ label: string; value: string }> = [];
      if (p.MAP_LABEL) rows.push({ label: 'Label', value: p.MAP_LABEL });
      if (p.BGC_LABEL) rows.push({ label: 'BGC label', value: p.BGC_LABEL });
      if (p.ZONE) rows.push({ label: 'Zone', value: p.ZONE });
      if (p.SUBZONE) rows.push({ label: 'Subzone', value: p.SUBZONE });
      if (p.VARIANT) rows.push({ label: 'Variant', value: String(p.VARIANT) });
      if (p.SUBZONE_NAME) rows.push({ label: 'Subzone name', value: p.SUBZONE_NAME });
      if (p.VARIANT_NAME) rows.push({ label: 'Variant name', value: p.VARIANT_NAME });
      if (p.NATURAL_DISTURBANCE_NAME) {
        rows.push({ label: 'Natural disturbance', value: p.NATURAL_DISTURBANCE_NAME });
      }
      const area = formatArea(p.FEATURE_AREA_SQM);
      if (area) rows.push({ label: 'Area', value: area });
      return { title: p.ZONE_NAME ?? 'BEC Zone', rows };
    }
  }
};

/**
 * Click-to-identify layer for BEC biogeoclimatic zones. Only reacts to
 * clicks when `identifyActive` is true in SparMapContext — the user has
 * to explicitly enable the Identify tool from the AOI toolbar before
 * clicks fire a WFS GetFeature request. This matches the legacy SPAR
 * behaviour where Identify was a dedicated mode rather than an always-on
 * click handler.
 *
 * When active, the map cursor changes to `help` and a formatted popup
 * shows the zone / subzone / variant / natural disturbance + area for
 * the clicked BEC polygon.
 */
const BecIdentifyLayer = ({ layerTypeName }: BecIdentifyLayerProps) => {
  const map = useMap();
  const {
    identifyActive,
    addImportedLayersToMap,
    cancelAoiMode
  } = useSparMap();
  const [clickedPoint, setClickedPoint] = useState<LatLng | null>(null);
  // Drawing is "enabled" only on themes where AoiDrawLayer mounted —
  // that registers `cancelAoiMode`. Use it as a proxy to decide whether
  // to show the "Copy as AOI" button in the identify popup.
  const drawingEnabled = cancelAoiMode !== null;

  // Toggle the `identify-active` class on the Leaflet container so CSS
  // can change the cursor to `help` when the user is in identify mode.
  // Also clear any stale popup when the user exits identify mode.
  useEffect(() => {
    const container = map.getContainer();
    if (identifyActive) {
      container.classList.add('identify-active');
    } else {
      container.classList.remove('identify-active');
      setClickedPoint(null);
    }
    return () => {
      container.classList.remove('identify-active');
    };
  }, [map, identifyActive]);

  useMapEvent('click', (e) => {
    // Swallow every click unless the user has activated Identify mode
    // via the toolbar. This fixes the bug where clicking anywhere on
    // the map (e.g., while drawing a polygon) would fire a WFS request.
    if (!identifyActive) return;
    setClickedPoint(e.latlng);
  });

  const albersCoords = useMemo(
    () => (clickedPoint
      ? wgs84ToBcAlbers([clickedPoint.lng, clickedPoint.lat])
      : null),
    [clickedPoint]
  );

  // Cascade: seedlot (DWithin 1km) → veglot (DWithin 1km) → BEC
  // (INTERSECTS point) → SPZ (INTERSECTS point). Mirrors the legacy
  // `Sparmap.showLotFeatureInfoOnMap` sequence which prioritised the
  // user's "what's at this point" intent on point layers before
  // polygon layers. All four fire in parallel via react-query (cheap
  // because each is a single WFS GetFeature) and the selection logic
  // below picks the first non-empty in priority order.
  //
  // ENHANCED-OVER-LEGACY (intentional, see 2026-05-20 parity audit
  // A2/A3): legacy filtered identify queries to the URL's `beczone=` /
  // `spzid=` / `seedlot=` params (sparmap.js:95, 181-184, 237-240)
  // so identify only ever returned features specifically scoped to
  // this seedlot. We drop those filters here so the user can identify
  // any feature at the click point — a richer "what's here?" model.
  // The lack of `MAP_LABEL IN` / `SEED_PLAN_ZONE_ID IN` /
  // `SEEDLOT_NUMBER =` is asserted by `BecIdentifyLayer.test.tsx`'s
  // `buildIdentifyCqlFilters` tests so a future refactor cannot
  // silently re-introduce the legacy behavior.
  const enabled = Boolean(clickedPoint) && identifyActive && !!albersCoords;
  const filters = buildIdentifyCqlFilters(albersCoords);

  const seedlotQ = useWfsGetFeature({
    layer: SEEDLOT_QUERY_LAYER, cqlFilter: filters.pointCql, enabled
  });
  const veglotQ = useWfsGetFeature({
    layer: VEGLOT_QUERY_LAYER, cqlFilter: filters.pointCql, enabled
  });
  const becQ = useWfsGetFeature({ layer: layerTypeName, cqlFilter: filters.polygonCql, enabled });
  const spzQ = useWfsGetFeature({ layer: SPZ_QUERY_LAYER, cqlFilter: filters.polygonCql, enabled });

  const identified: Identified | null = useMemo(() => {
    if (seedlotQ.data?.features?.length) {
      return { kind: 'seedlot', feature: seedlotQ.data.features[0] };
    }
    if (veglotQ.data?.features?.length) {
      return { kind: 'veglot', feature: veglotQ.data.features[0] };
    }
    if (becQ.data?.features?.length) {
      return { kind: 'bec', feature: becQ.data.features[0] };
    }
    if (spzQ.data?.features?.length) {
      return { kind: 'spz', feature: spzQ.data.features[0] };
    }
    return null;
  }, [seedlotQ.data, veglotQ.data, becQ.data, spzQ.data]);

  if (!identifyActive || !clickedPoint || !identified) {
    return null;
  }

  const popup = buildPopup(identified);
  const highlightStyle = highlightStyleFor(identified.kind);

  // "Copy as AOI" is only meaningful for polygon features on drawing-
  // enabled themes (i.e. COLAREA). Seedlot / veglot are points — no
  // useful geometry to copy as an AOI.
  const canCopyToAoi = drawingEnabled
    && (identified.kind === 'bec' || identified.kind === 'spz');
  const handleCopyToAoi = () => {
    const polys = featureToAoiPolygons(identified.feature);
    if (polys.length === 0) return;
    addImportedLayersToMap(polys);
    // Close the popup after copying so the user can immediately see the
    // new AOI layer they just added.
    setClickedPoint(null);
  };

  return (
    <>
      <GeoJSON
        key={`${clickedPoint.lat},${clickedPoint.lng},${identified.kind}`}
        data={{ type: 'FeatureCollection', features: [identified.feature] } as Parameters<typeof GeoJSON>[0]['data']}
        style={highlightStyle}
      />
      <Popup
        position={clickedPoint}
        maxWidth={320}
        minWidth={240}
        className="bec-identify-popup-wrapper"
      >
        <div data-testid="bec-identify-popup" className="bec-identify-popup">
          <h4 className="bec-identify-popup__title">{popup.title}</h4>
          <dl className="bec-identify-popup__list">
            {popup.rows.map(({ label, value }) => (
              <div key={label} className="bec-identify-popup__row">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {canCopyToAoi && (
            <button
              type="button"
              className="bec-identify-popup__copy-btn"
              onClick={handleCopyToAoi}
              data-testid="bec-identify-copy-to-aoi"
            >
              Copy as AOI
            </button>
          )}
        </div>
      </Popup>
    </>
  );
};

export default BecIdentifyLayer;
