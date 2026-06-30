import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { LayerEvent, Map as LeafletMap } from 'leaflet';

import { useSparMap } from '../../../../contexts/SparMapContext';
import {
  fetchOverlayLegend,
  wgs84BoundsToBcAlbersBbox,
  type LegendOverlayData,
  type LegendRule,
  type WmsLayerRef
} from '../../../../api-service/legendApi';
import { SingleTileWmsLeafletLayer } from '../LeafletMap/SingleTileWmsLayer';
import { SeedlotPointsLeafletLayer } from '../SeedlotPointsLayer/seedlotPointsLayer';
import { colorForSpecies } from '../SeedlotPointsLayer/colors';
import { legacyLayerLabel, speciesLabel } from '../../../../config/legacy-spar-layers';
import { BCGW_CATALOG } from '../../../../config/bcgw-catalog';

// Wait for the map to settle before re-fetching — moveend fires once per
// completed pan/zoom, but a debounce coalesces rapid successive gestures.
const REFRESH_DEBOUNCE_MS = 400;

const isOpenmaps = (url: string): boolean => url.includes('openmaps.gov.bc.ca');

const CATALOG_LABEL_BY_LAYER: Record<string, string> = Object.fromEntries(
  BCGW_CATALOG.map((layer) => [layer.layerName, layer.displayName])
);

// Prefer the app's own layer label (the name shown in the layer panel) over
// GeoServer's published title, so the legend header and the panel agree.
// Falls back to the GeoServer title, then the raw layer name.
const labelForWmsLayer = (wmsLayers: string, geoserverTitle: string | null): string => {
  const firstLayer = wmsLayers.split(',')[0]?.trim() ?? wmsLayers;
  return legacyLayerLabel(wmsLayers)
    ?? CATALOG_LABEL_BY_LAYER[firstLayer]
    ?? geoserverTitle
    ?? wmsLayers;
};

/**
 * Detect whether a Leaflet layer is a DataBC WMS overlay and, if so, return
 * the bits needed to fetch its legend. Covers both the standard
 * `L.TileLayer.WMS` overlays (exposing `wmsParams` + `_url`) and the custom
 * `SingleTileWmsLeafletLayer` (which also reports whether it is currently in
 * scale range). Returns null for basemaps, AOI/marker layers, WFS points,
 * and anything not served from openmaps.
 */
const wmsRefForLayer = (layer: unknown): WmsLayerRef | null => {
  if (layer instanceof SingleTileWmsLeafletLayer) {
    const info = layer.getLegendInfo();
    if (!info.inScaleRange || !isOpenmaps(info.url)) return null;
    return { url: info.url, layers: info.layers, styles: info.styles };
  }
  const { wmsParams } = layer as { wmsParams?: { layers?: string; styles?: string } };
  // Leaflet stores the tile URL on its private `_url` field; there is no
  // public getter, so read it directly.
  // eslint-disable-next-line no-underscore-dangle
  const url = (layer as { _url?: string })._url;
  if (wmsParams?.layers && typeof url === 'string' && isOpenmaps(url)) {
    return { url, layers: wmsParams.layers, styles: wmsParams.styles };
  }
  return null;
};

const collectMapWmsLayers = (map: LeafletMap): WmsLayerRef[] => {
  const seen = new Set<string>();
  const refs: WmsLayerRef[] = [];
  map.eachLayer((layer) => {
    const ref = wmsRefForLayer(layer);
    if (!ref) return;
    const key = `${ref.url}|${ref.layers}|${ref.styles ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    refs.push(ref);
  });
  return refs;
};

// Stroke shared by every seedlot/veglot circle marker (see seedlotPointsLayer).
const POINT_SWATCH_STROKE = '#212121';

/**
 * Build the single "Species" legend section for the seedlot/veglot point
 * layers. Those markers are coloured by species (not by which point layer
 * they belong to), so the legend shows one dot per species currently
 * rendered on the map — read from each point layer's `getRenderedSpecies`.
 * Returns null when no point layer has rendered anything in view.
 */
const buildSpeciesSection = (map: LeafletMap): LegendOverlayData | null => {
  const codes = new Set<string>();
  map.eachLayer((layer) => {
    if (layer instanceof SeedlotPointsLeafletLayer) {
      layer.getRenderedSpecies().forEach((code) => codes.add(code));
    }
  });
  if (codes.size === 0) return null;
  return {
    id: '__species__',
    label: 'Species',
    rules: [...codes].sort().map((code): LegendRule => ({
      label: speciesLabel(code),
      swatch: {
        geometry: 'point',
        fill: colorForSpecies(code),
        fillOpacity: 0.85,
        stroke: POINT_SWATCH_STROKE,
        strokeWidth: 1,
        strokeOpacity: 1
      }
    }))
  };
};

/**
 * Drives the dynamic legend. Mounted inside the `<MapContainer>` so it has
 * the live map handle, it reads the WMS overlays actually rendered on the
 * map — theme defaults, layers toggled in the layer tree, and catalog
 * layers alike — fetches each one's GeoServer JSON legend trimmed to the
 * current viewport (`hideEmptyRules`), and pushes the parsed result into
 * `SparMapContext.legendData`. `<LegendPanel>` (a sibling card) renders it.
 *
 * Reading the map (rather than the static theme config) is what makes the
 * legend reflect exactly what the user sees: a layer toggled on in the
 * tree shows up, and a scale-limited layer that isn't drawing drops out.
 * Keeping the listeners here means the shared context only updates when the
 * legend actually changes (diffed below). Renders nothing itself.
 */
const LegendDataLayer = () => {
  const map = useMap();
  const { setLegendData } = useSparMap();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Serialized last-pushed legend, so we only setLegendData on real change.
  const lastKeyRef = useRef<string>('');

  useEffect(() => {
    // In tests the react-leaflet map is a stub without the full Leaflet
    // API; the real map always has these. No-op on a stub rather than crash.
    if (
      !map
      || typeof map.getBounds !== 'function'
      || typeof map.eachLayer !== 'function'
      || typeof map.on !== 'function'
    ) {
      return undefined;
    }

    const publish = (data: LegendOverlayData[]) => {
      const key = JSON.stringify(data);
      if (key !== lastKeyRef.current) {
        lastKeyRef.current = key;
        setLegendData(data);
      }
    };

    const refresh = () => {
      // Cancel any fetch still in flight from a previous view.
      abortRef.current?.abort();

      // The "Species" section is read synchronously from the point layers
      // and appended after the (async) WMS sections.
      const publishCombined = (wmsData: LegendOverlayData[]) => {
        const species = buildSpeciesSection(map);
        publish(species ? [...wmsData, species] : wmsData);
      };

      const wmsLayers = collectMapWmsLayers(map);
      if (wmsLayers.length === 0) {
        publishCombined([]);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      const bounds = map.getBounds();
      const bbox = wgs84BoundsToBcAlbersBbox(
        [bounds.getWest(), bounds.getSouth()],
        [bounds.getEast(), bounds.getNorth()]
      );

      Promise.allSettled(
        wmsLayers.map((ref) => fetchOverlayLegend(ref, bbox, controller.signal)
          .then((parsed): LegendOverlayData => ({
            id: ref.layers,
            label: labelForWmsLayer(ref.layers, parsed.title),
            rules: parsed.rules
          })))
      ).then((results) => {
        if (controller.signal.aborted) return;
        const wmsData = results
          .filter(
            (r): r is PromiseFulfilledResult<LegendOverlayData> => r.status === 'fulfilled'
          )
          .map((r) => r.value)
          // Drop overlays with no symbols in the current view so the panel
          // never shows an empty layer section.
          .filter((overlayData) => overlayData.rules.length > 0);
        publishCombined(wmsData);
      });
    };

    const debouncedRefresh = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(refresh, REFRESH_DEBOUNCE_MS);
    };

    // Only re-fetch on a layer toggle when the toggled layer is a WMS
    // overlay — AOI vertex markers and the like fire layeradd/remove too,
    // and we don't want to thrash the legend while the user is drawing.
    const onLayerChange = (event: LayerEvent) => {
      // Refresh when a WMS overlay or a seedlot/veglot point layer is
      // toggled. Plain markers (AOI vertices, individual point circles)
      // also fire these events but must not thrash the legend.
      if (wmsRefForLayer(event.layer) || event.layer instanceof SeedlotPointsLeafletLayer) {
        debouncedRefresh();
      }
    };

    // Initial fetch for the opening extent, then on every settled move/zoom
    // (re-trim to viewport), on WMS/point layer toggles, and whenever the
    // point layers re-render (their in-view species changed).
    refresh();
    map.on('moveend zoomend', debouncedRefresh);
    map.on('layeradd layerremove', onLayerChange);
    map.on('spar:pointsrendered', debouncedRefresh);

    return () => {
      map.off('moveend zoomend', debouncedRefresh);
      map.off('layeradd layerremove', onLayerChange);
      map.off('spar:pointsrendered', debouncedRefresh);
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [map, setLegendData]);

  return null;
};

export default LegendDataLayer;
