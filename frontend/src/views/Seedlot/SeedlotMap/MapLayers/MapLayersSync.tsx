import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type L from 'leaflet';

import type { SparMapTheme } from '../../../../types/SparMapTypes';
import { getThemeProfile } from '../../../../config/leaflet-themes';
import { BCGW_CATALOG } from '../../../../config/bcgw-catalog';
import { useSparMap } from '../../../../contexts/SparMapContext';
import { useMapLayers } from './MapLayersContext';
import {
  BASE_LAYERS,
  applySpeciesVisibility,
  buildCatalogLayer,
  buildOverlayLayer,
  catalogLayerKey,
  setLayerOpacity
} from './layerDefs';

// Base maps sit under every overlay tile layer, whatever order they are
// switched on in; overlays stack in legacy panel order above them.
const BASE_Z_INDEX = 1;
const OVERLAY_Z_INDEX_START = 10;

const setZIndex = (layer: L.Layer, zIndex: number) => {
  const { setZIndex: fn } = layer as Partial<{ setZIndex: (z: number) => unknown }>;
  if (typeof fn === 'function') fn.call(layer, zIndex);
};

/**
 * Applies the Layers panel state (`MapLayersContext`) to the Leaflet map.
 * Mounted inside `<MapContainer>`; renders nothing.
 *
 * - Builds one Leaflet layer per base map and per theme overlay, then
 *   resets the panel state to the theme's defaults (including the legacy
 *   `species=` rule that switches on that species' seed plan zone).
 * - Builds a WMS layer for each DataBC catalog layer the user adds. A
 *   newly added catalog layer is on until the user turns it off.
 * - On every state change, adds / removes layers and applies opacity.
 */
const MapLayersSync = ({ theme }: { theme: SparMapTheme }) => {
  const map = useMap();
  const { speciesCode, activeCatalogLayers } = useSparMap();
  const {
    baseLayerId, visible, opacity, resetLayers
  } = useMapLayers();

  const baseLayers = useRef(new Map<string, L.Layer>());
  const overlayLayers = useRef(new Map<string, L.Layer>());
  const catalogLayers = useRef(new Map<string, L.Layer>());

  useEffect(() => {
    const bases = baseLayers.current;
    const overlays = overlayLayers.current;
    BASE_LAYERS.forEach((def) => {
      const layer = def.build();
      setZIndex(layer, BASE_Z_INDEX);
      bases.set(def.id, layer);
    });

    const defaultsVisible: Record<string, boolean> = {};
    const defaultsOpacity: Record<string, number> = {};
    const profileOverlays = applySpeciesVisibility(getThemeProfile(theme).overlays, speciesCode);
    profileOverlays.forEach((overlay, index) => {
      try {
        const layer = buildOverlayLayer(overlay, speciesCode);
        setZIndex(layer, OVERLAY_Z_INDEX_START + index);
        overlays.set(overlay.id, layer);
        defaultsVisible[overlay.id] = overlay.visible;
        if (overlay.opacity !== undefined) defaultsOpacity[overlay.id] = overlay.opacity;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`MapLayersSync: failed to build layer for ${overlay.id}`, err);
      }
    });
    resetLayers({ visible: defaultsVisible, opacity: defaultsOpacity });

    return () => {
      [bases, overlays].forEach((layers) => {
        layers.forEach((layer) => { if (map.hasLayer(layer)) map.removeLayer(layer); });
        layers.clear();
      });
    };
  }, [map, theme, speciesCode, resetLayers]);

  useEffect(() => {
    const layers = catalogLayers.current;
    const active = new Set(activeCatalogLayers);
    layers.forEach((layer, id) => {
      if (!active.has(id)) {
        if (map.hasLayer(layer)) map.removeLayer(layer);
        layers.delete(id);
      }
    });
    activeCatalogLayers.forEach((id) => {
      if (layers.has(id)) return;
      const entry = BCGW_CATALOG.find((l) => l.id === id);
      if (!entry) return;
      const layer = buildCatalogLayer(entry);
      setZIndex(layer, OVERLAY_Z_INDEX_START + 1000);
      layers.set(id, layer);
    });
  }, [map, activeCatalogLayers]);

  useEffect(() => () => {
    catalogLayers.current.forEach((layer) => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });
    catalogLayers.current.clear();
  }, [map]);

  // Declared after the build effects so, in the same commit, it sees the
  // layers they just built (theme / species / catalog are deps for that).
  useEffect(() => {
    const apply = (layer: L.Layer, key: string, on: boolean) => {
      setLayerOpacity(layer, opacity[key] ?? 1);
      if (on && !map.hasLayer(layer)) layer.addTo(map);
      if (!on && map.hasLayer(layer)) map.removeLayer(layer);
    };
    baseLayers.current.forEach((layer, id) => apply(layer, id, id === baseLayerId));
    overlayLayers.current.forEach((layer, id) => apply(layer, id, visible[id] === true));
    catalogLayers.current.forEach((layer, id) => {
      const key = catalogLayerKey(id);
      apply(layer, key, visible[key] ?? true);
    });
  }, [map, baseLayerId, visible, opacity, theme, speciesCode, activeCatalogLayers]);

  return null;
};

export default MapLayersSync;
