import L from 'leaflet';

import type { SparMapOverlayLayer } from '../../../../types/SparMapTypes';
import { BC_GOV_BASEMAP } from '../../../../config/leaflet-themes/bcGovBasemap';
import { LEGACY_PANEL_GROUPS } from '../../../../config/legacy-spar-layers';
import type { BcgwLayer } from '../../../../config/bcgw-catalog';
import { SingleTileWmsLeafletLayer } from '../LeafletMap/SingleTileWmsLayer';
import { SeedlotPointsLeafletLayer } from '../SeedlotPointsLayer/seedlotPointsLayer';
import {
  SEEDLOT_POINT_LAYER,
  VEGLOT_POINT_LAYER
} from '../../../../api-service/seedlotPointsApi';

/**
 * Layer definitions shared by the Layers panel (which only needs ids and
 * labels) and `<MapLayersSync>` (which builds the Leaflet layers).
 */

const OPENMAPS_WMS_TILE_OPTIONS = {
  tileSize: 512,
  updateWhenIdle: true,
  updateWhenZooming: false,
  keepBuffer: 1
} as const;

// ── Base maps ──────────────────────────────────────────────────────

export interface BaseLayerDef {
  id: string;
  label: string;
  build: () => L.TileLayer;
}

export const BASE_LAYERS: readonly BaseLayerDef[] = [
  {
    id: BC_GOV_BASEMAP.id,
    label: BC_GOV_BASEMAP.label,
    build: () => L.tileLayer(BC_GOV_BASEMAP.urlTemplate, {
      attribution: BC_GOV_BASEMAP.attribution,
      maxZoom: BC_GOV_BASEMAP.maxZoom
    })
  },
  {
    id: 'bcgov-roads',
    label: 'BC Gov Roads',
    build: () => L.tileLayer(
      'https://maps.gov.bc.ca/arcserver/rest/services/Province/roads_wm/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; <a href="https://www2.gov.bc.ca/">Government of British Columbia</a>',
        maxZoom: 17
      }
    )
  },
  {
    id: 'esri-imagery',
    label: 'ESRI World Imagery (satellite)',
    build: () => L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
    )
  },
  {
    id: 'esri-topo',
    label: 'ESRI World Topography',
    build: () => L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
    )
  }
];

export const DEFAULT_BASE_LAYER_ID = BASE_LAYERS[0].id;

// ── Overlays ───────────────────────────────────────────────────────

const WFS_POINT_LAYER_CONFIG: Record<string, { typeName: string; labelText: string }> = {
  active_seedlots: { typeName: SEEDLOT_POINT_LAYER, labelText: 'Seedlot' },
  expired_seedlots: { typeName: SEEDLOT_POINT_LAYER, labelText: 'Seedlot' },
  active_veglots: { typeName: VEGLOT_POINT_LAYER, labelText: 'Veg Lot' },
  expired_veglots: { typeName: VEGLOT_POINT_LAYER, labelText: 'Veg Lot' }
};

const resolveWfsPointConfig = (overlayId: string) => {
  const parent = Object.keys(WFS_POINT_LAYER_CONFIG).find(
    (key) => overlayId === key || overlayId.startsWith(`${key}_`)
  );
  return parent ? WFS_POINT_LAYER_CONFIG[parent] : null;
};

/**
 * Apply the legacy `Sparmap.setLayerVisibilityBySpecies()` behavior
 * (sparmap.js:288-295) — when the URL has `species=<code>`, force the
 * matching `spz_grm_<code>` Seed Plan Zones - GRM WMS sub-layer ON.
 */
export const applySpeciesVisibility = (
  overlays: readonly SparMapOverlayLayer[],
  speciesCode: string | null
): SparMapOverlayLayer[] => {
  if (!speciesCode) return [...overlays];
  const targetId = `spz_grm_${speciesCode}`;
  return overlays.map((o) => (o.id === targetId ? { ...o, visible: true } : o));
};

export const buildOverlayLayer = (
  overlay: SparMapOverlayLayer,
  speciesCode: string | null
): L.Layer => {
  if (overlay.renderMode === 'wfs-points') {
    const cfg = resolveWfsPointConfig(overlay.id);
    if (!cfg) throw new Error(`No WFS point config for overlay ${overlay.id}`);
    return new SeedlotPointsLeafletLayer({
      typeName: cfg.typeName,
      activeOnly: overlay.wfsActiveOnly ?? null,
      labelText: cfg.labelText,
      maxScale: overlay.maxScale,
      speciesCode: overlay.wfsSpeciesCode ?? speciesCode
    });
  }
  if (overlay.singleTile) {
    return new SingleTileWmsLeafletLayer({
      url: overlay.url,
      layers: overlay.layers,
      styles: overlay.styles,
      format: 'image/png',
      transparent: true,
      opacity: overlay.opacity,
      minScale: overlay.minScale,
      maxScale: overlay.maxScale
    });
  }
  return L.tileLayer.wms(overlay.url, {
    layers: overlay.layers,
    ...(overlay.styles ? { styles: overlay.styles } : {}),
    format: 'image/png',
    transparent: true,
    opacity: overlay.opacity,
    minZoom: overlay.minZoom,
    maxZoom: overlay.maxZoom,
    ...OPENMAPS_WMS_TILE_OPTIONS
  });
};

// ── User (DataBC catalog) layers ───────────────────────────────────

/** Layer-state key for a catalog layer, kept apart from overlay ids. */
export const catalogLayerKey = (catalogId: string) => `catalog:${catalogId}`;

export const buildCatalogLayer = (entry: BcgwLayer): L.TileLayer.WMS => L.tileLayer.wms(
  entry.wmsUrl,
  {
    layers: entry.layerName,
    format: entry.format,
    transparent: entry.transparent,
    ...OPENMAPS_WMS_TILE_OPTIONS
  }
);

// ── Opacity ────────────────────────────────────────────────────────

interface OpacityAdjustable {
  setOpacity: (opacity: number) => unknown;
}

/** Set a layer's opacity (0–1) if the layer type supports it. */
export const setLayerOpacity = (layer: L.Layer, opacity: number): void => {
  const { setOpacity } = layer as Partial<OpacityAdjustable>;
  if (typeof setOpacity === 'function') setOpacity.call(layer, opacity);
};

// ── Panel tree ─────────────────────────────────────────────────────

export interface LayerRow {
  id: string;
  label: string;
}

/**
 * One top-level row in the Layers panel, mirroring the legacy SPAR
 * accordion:
 * - `layer` set, no `children`: a plain layer row.
 * - `children` set, no `layer`: a group whose checkbox toggles every child.
 * - both set: a group whose own checkbox drives a consolidated "all
 *   species" layer, with the per-species layers as children.
 */
export interface LayerGroup {
  label: string;
  layer?: LayerRow;
  children?: LayerRow[];
}

/**
 * Build the Layers panel tree for a theme's overlays, in legacy panel
 * order. Groups with no overlay in this theme are dropped.
 */
export const buildLayerGroups = (overlays: readonly SparMapOverlayLayer[]): LayerGroup[] => {
  const byId = new Map(overlays.map((o) => [o.id, o]));
  return LEGACY_PANEL_GROUPS.flatMap((group): LayerGroup[] => {
    const rows = group.ids
      .map((id) => byId.get(id))
      .filter((o): o is SparMapOverlayLayer => o !== undefined)
      .map((o) => ({ id: o.id, label: o.label }));
    if (rows.length === 0) return [];
    if (rows.length === 1 && !group.consolidatedId) {
      return [{ label: rows[0].label, layer: rows[0] }];
    }
    const consolidated = group.consolidatedId
      ? rows.find((r) => r.id === group.consolidatedId)
      : undefined;
    return [{
      label: group.label,
      layer: consolidated,
      children: consolidated ? rows.filter((r) => r !== consolidated) : rows
    }];
  });
};

/**
 * Every layer id in a group: its own layer (if any) and all children.
 * A group checkbox, and the "All" checkbox, turn all of these on or off
 * together, the same way for every group (as the legacy tree did).
 */
export const groupLayerIds = (group: LayerGroup): string[] => [
  ...(group.layer ? [group.layer.id] : []),
  ...(group.children ?? []).map((c) => c.id)
];
