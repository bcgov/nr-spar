import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

import { useSparMap } from '../../../../contexts/SparMapContext';
import { BEC_WMS_URL } from '../BecHighlightLayer/wmsParams';
import { buildSpzHighlightWmsOptions } from './wmsParams';

/**
 * Imperatively renders a CQL-filtered WMS overlay that paints the
 * SPZ polygons matching the URL `spzid=` CSV in translucent blue.
 *
 * Shape mirrors `<BecHighlightLayer>` and `<PointHighlightLayer>`:
 * `useMap()` for the live map handle, a `useEffect` that diffs current
 * vs desired state, and a `useRef` to remember the active layer for
 * cleanup. Theme-agnostic — mounted unconditionally by `<LeafletMap>`
 * and self-gates by checking `spzIds.length`.
 */
const SpzHighlightLayer = () => {
  const map = useMap();
  const { spzIds } = useSparMap();
  const layerRef = useRef<L.TileLayer.WMS | null>(null);

  useEffect(() => {
    // Tear down the previous layer first so changes to `spzIds` swap
    // rather than stack overlays.
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (spzIds.length > 0) {
      const opts = buildSpzHighlightWmsOptions(spzIds);
      const layer = L.tileLayer.wms(BEC_WMS_URL, opts);
      layer.addTo(map);
      layerRef.current = layer;
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, spzIds]);

  return <div data-testid="spz-highlight-layer-marker" style={{ display: 'none' }} />;
};

export default SpzHighlightLayer;
