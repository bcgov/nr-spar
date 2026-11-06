import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

import { useSparMap } from '../../../../contexts/SparMapContext';
import { BEC_WMS_URL } from '../BecHighlightLayer/wmsParams';
import { buildPointHighlightWmsOptions } from './wmsParams';

/**
 * Imperatively renders a single CQL-filtered WMS overlay that paints
 * either the seedlot or veglot point in red, depending on which URL
 * param is set in `SparMapContext`. The provider enforces mutual
 * exclusivity (seedlot wins) so this component only ever renders one
 * layer at a time.
 *
 * Shape mirrors `<BecHighlightLayer>` — `useMap()` for the live map
 * handle, a `useEffect` that diffs current vs desired state, and a
 * `useRef` to remember the active layer for cleanup. Theme-agnostic;
 * mounted unconditionally by `<LeafletMap>` and self-gates by checking
 * the context state.
 */
const PointHighlightLayer = () => {
  const map = useMap();
  const { seedlotNumber, veglotNumber } = useSparMap();
  const layerRef = useRef<L.TileLayer.WMS | null>(null);

  useEffect(() => {
    // Tear down the previous layer first — when the URL flips from
    // seedlot to veglot we want to swap, not stack.
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    // Provider enforces mutual exclusivity, but check both for clarity
    // and to make this component robust against future regressions.
    if (seedlotNumber) {
      const opts = buildPointHighlightWmsOptions('seedlot', seedlotNumber);
      const layer = L.tileLayer.wms(BEC_WMS_URL, opts);
      layer.addTo(map);
      layerRef.current = layer;
    } else if (veglotNumber) {
      const opts = buildPointHighlightWmsOptions('veglot', veglotNumber);
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
  }, [map, seedlotNumber, veglotNumber]);

  return <div data-testid="point-highlight-layer-marker" style={{ display: 'none' }} />;
};

export default PointHighlightLayer;
