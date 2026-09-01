import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

import { useSparMap } from '../../../../contexts/SparMapContext';
import { fetchBecZoneByMapLabel } from '../../../../api-service/becZonesApi';
import { BEC_WMS_URL, buildBecHighlightWmsOptions } from './wmsParams';

/**
 * Imperatively renders 1-2 CQL-filtered BEC WMS overlays on top of the
 * map for `AOUCBST` / `PLANTSITECBST` themes. Suitable codes use the
 * default DataBC BEC styling; not-suitable codes (passed through the
 * legacy `_` suffix on `beczone=`) render in purple via inline SLD.
 *
 * Mirrors the imperative pattern of `CatalogLayers` — `useMap()` plus
 * a `useEffect` that diffs current vs desired layers each render.
 *
 * Also registers the `zoomToBecZone` bridge callback so the AOUCBST
 * side panel can fetch a BEC polygon by MAP_LABEL and fit-bounds to it
 * (legacy `Sparmap.showBECFeatureInfoOnMapByBecCode` flow).
 */
const BecHighlightLayer = () => {
  const map = useMap();
  const {
    becZoneCodes, becNotSuit, becZoneShape, setBecZones, _setMapControls
  } = useSparMap();
  const layersRef = useRef<L.TileLayer.WMS[]>([]);

  // Register the zoomToBecZone bridge for the BEC zone side panel.
  useEffect(() => {
    _setMapControls({
      zoomToBecZone: async (mapLabel: string) => {
        const feature = await fetchBecZoneByMapLabel(mapLabel);
        if (!feature) return;
        const layer = L.geoJSON(feature);
        const bounds = layer.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds.pad(0.1));
        // Repaint the highlight overlay to show ONLY this zone in
        // single-zone-mode (mapLabel shape). Future row clicks replace
        // the highlight rather than stacking; the panel's selected-row
        // styling reflects the same intent.
        setBecZones([mapLabel], [], 'mapLabel');
      }
    });
    return () => { _setMapControls({ zoomToBecZone: null }); };
  }, [map, _setMapControls, setBecZones]);

  useEffect(() => {
    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];

    const notSuitSet = new Set(becNotSuit);
    const suitable = becZoneCodes.filter((c) => !notSuitSet.has(c));
    const notSuitable = becZoneCodes.filter((c) => notSuitSet.has(c));

    if (suitable.length) {
      const layer = L.tileLayer.wms(
        BEC_WMS_URL,
        buildBecHighlightWmsOptions(suitable, becZoneShape, false)
      );
      layer.addTo(map);
      layersRef.current.push(layer);
    }
    if (notSuitable.length) {
      const layer = L.tileLayer.wms(
        BEC_WMS_URL,
        buildBecHighlightWmsOptions(notSuitable, becZoneShape, true)
      );
      layer.addTo(map);
      layersRef.current.push(layer);
    }

    return () => {
      layersRef.current.forEach((layer) => map.removeLayer(layer));
      layersRef.current = [];
    };
  }, [map, becZoneCodes, becNotSuit, becZoneShape]);

  return <div data-testid="bec-highlight-layer-marker" style={{ display: 'none' }} />;
};

export default BecHighlightLayer;
