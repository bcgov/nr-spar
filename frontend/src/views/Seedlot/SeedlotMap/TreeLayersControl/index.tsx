import {
  forwardRef, useEffect, useImperativeHandle, useRef
} from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.control.layers.tree';
import 'leaflet.control.layers.tree/L.Control.Layers.Tree.css';

import type { SparMapTheme, SparMapOverlayLayer } from '../../../../types/SparMapTypes';
import { getThemeProfile } from '../../../../config/leaflet-themes';
import {
  LEGACY_PANEL_GROUPS,
  type LegacyPanelGroup
} from '../../../../config/legacy-spar-layers';
import { useSparMap } from '../../../../contexts/SparMapContext';
import { SingleTileWmsLeafletLayer } from '../LeafletMap/SingleTileWmsLayer';
import { SeedlotPointsLeafletLayer } from '../SeedlotPointsLayer/seedlotPointsLayer';
import {
  SEEDLOT_POINT_LAYER,
  VEGLOT_POINT_LAYER
} from '../../../../api-service/seedlotPointsApi';

/**
 * Grouped layers control that mirrors the legacy SPAR `cwmSparmap.jsp`
 * accordion panel. Uses the `leaflet.control.layers.tree` plugin to
 * render two-level groups with parent-checkbox-toggles-all-children and
 * collapse / expand chevrons. Replaces the flat `<LayersControl>` from
 * react-leaflet, which couldn't express the 1:N parent-child grouping
 * the legacy CWM client library shipped.
 *
 * Mounts imperatively (useMap + useEffect) because:
 * 1. react-leaflet has no JSX wrapper for the tree control.
 * 2. The legacy panel has 30+ groups containing 130+ child rows — JSX
 *    declaration would be unwieldy and slow to reconcile.
 *
 * Default-visible overlays (per the theme's `overlay.visible`) are added
 * to the map at mount; the rest are listed in the tree but unchecked.
 * Base layers from the legacy CWM 6-option chooser are recreated here
 * since they used to live in the `<LayersControl.BaseLayer>` JSX block.
 *
 * The control instance is exposed via `ref` so `CatalogLayers` (which
 * imperatively adds DataBC catalog layers) can keep using the same
 * `addOverlay(layer, name)` API the standard control supported.
 */
const WFS_POINT_LAYER_CONFIG: Record<string, {
  typeName: string;
  labelText: string;
}> = {
  active_seedlots: { typeName: SEEDLOT_POINT_LAYER, labelText: 'Seedlot' },
  expired_seedlots: { typeName: SEEDLOT_POINT_LAYER, labelText: 'Seedlot' },
  active_veglots: { typeName: VEGLOT_POINT_LAYER, labelText: 'Veg Lot' },
  expired_veglots: { typeName: VEGLOT_POINT_LAYER, labelText: 'Veg Lot' }
};

const resolveWfsPointConfig = (
  overlayId: string
): { typeName: string; labelText: string } | null => {
  // Early-return-on-match loop (acts like `break`); keep the for-of.
  // eslint-disable-next-line no-restricted-syntax
  for (const parent of Object.keys(WFS_POINT_LAYER_CONFIG)) {
    if (overlayId === parent || overlayId.startsWith(`${parent}_`)) {
      return WFS_POINT_LAYER_CONFIG[parent];
    }
  }
  return null;
};

const OPENMAPS_WMS_TILE_OPTIONS = {
  tileSize: 512,
  updateWhenIdle: true,
  updateWhenZooming: false,
  keepBuffer: 1
} as const;

/**
 * Apply the legacy `Sparmap.setLayerVisibilityBySpecies()` behavior
 * (sparmap.js:288-295) — when the URL has `species=<code>`, force the
 * matching `spz_grm_<code>` Seed Plan Zones - GRM WMS sub-layer ON at
 * mount. Returns the overlay list unchanged when no species code is
 * provided. Exported for unit testing without spinning up the map.
 */
export const applySpeciesVisibility = (
  overlays: readonly SparMapOverlayLayer[],
  speciesCode: string | null
): SparMapOverlayLayer[] => {
  if (!speciesCode) return [...overlays];
  const targetId = `spz_grm_${speciesCode}`;
  return overlays.map((o) => (
    o.id === targetId ? { ...o, visible: true } : o
  ));
};

const buildLeafletLayer = (
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

interface BaseLayerDef {
  name: string;
  defaultChecked?: boolean;
  build: () => L.Layer;
}

const BASE_LAYERS: readonly BaseLayerDef[] = [
  {
    name: 'BC Gov Base Map',
    defaultChecked: true,
    build: () => L.tileLayer(
      'https://maps.gov.bc.ca/arcserver/rest/services/Province/web_mercator_cache/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; <a href="https://www2.gov.bc.ca/">Government of British Columbia</a>',
        maxZoom: 17
      }
    )
  },
  {
    name: 'BC Gov Roads',
    build: () => L.tileLayer(
      'https://maps.gov.bc.ca/arcserver/rest/services/Province/roads_wm/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; <a href="https://www2.gov.bc.ca/">Government of British Columbia</a>',
        maxZoom: 17
      }
    )
  },
  {
    name: 'ESRI World Imagery (satellite)',
    build: () => L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
      }
    )
  },
  {
    name: 'ESRI World Topography',
    build: () => L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
      }
    )
  },
  {
    name: 'OpenStreetMap',
    build: () => L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    })
  }
];

type OverlayEntry = { overlay: SparMapOverlayLayer; layer: L.Layer };

const buildOverlayTreeNode = (
  group: LegacyPanelGroup,
  overlaysById: Map<string, OverlayEntry>
): L.Control.Layers.TreeObject | null => {
  const entries = group.ids
    .map((id) => overlaysById.get(id))
    .filter((entry): entry is OverlayEntry => entry !== undefined);

  if (entries.length === 0) return null;

  // Single-leaf group → flat row, no nesting
  if (entries.length === 1 && !group.consolidatedId) {
    const { overlay, layer } = entries[0];
    return { label: overlay.label, layer };
  }

  // Multi-leaf group, or group with a consolidated "all" parent. The
  // consolidated row (e.g. `active_seedlots`) gets attached to the
  // group label as the parent layer; the species children become the
  // tree children. `selectAllCheckbox` lets the user toggle every
  // child from the parent row.
  const consolidatedEntry = group.consolidatedId
    ? entries.find((e) => e.overlay.id === group.consolidatedId)
    : undefined;
  const childEntries = consolidatedEntry
    ? entries.filter((e) => e.overlay.id !== consolidatedEntry.overlay.id)
    : entries;

  return {
    label: group.label,
    selectAllCheckbox: true,
    collapsed: true,
    layer: consolidatedEntry?.layer,
    children: childEntries.map(({ overlay, layer }) => ({
      label: overlay.label,
      layer
    }))
  };
};

interface TreeLayersControlProps {
  theme: SparMapTheme;
}

/**
 * Imperatively expose the underlying `L.Control.Layers` so callers
 * (CatalogLayers) can keep using `addOverlay(layer, name)` / `removeLayer`
 * — same API the old plain `<LayersControl>` exposed via ref.
 */
const TreeLayersControl = forwardRef<L.Control.Layers, TreeLayersControlProps>(
  ({ theme }, ref) => {
    const map = useMap();
    const { speciesCode } = useSparMap();
    const controlRef = useRef<L.Control.Layers | null>(null);

    useImperativeHandle(ref, () => controlRef.current as L.Control.Layers, []);

    useEffect(() => {
      const profile = getThemeProfile(theme);

      // Build base layers + add the default-checked one to the map
      const baseEntries = BASE_LAYERS.map((def) => ({
        name: def.name,
        layer: def.build(),
        defaultChecked: def.defaultChecked ?? false
      }));
      const defaultBase = baseEntries.find((e) => e.defaultChecked) ?? baseEntries[0];
      defaultBase.layer.addTo(map);

      // Legacy sparmap.js:288-295 (`setLayerVisibilityBySpecies`) — when
      // the URL has `species=FDC`, force the matching `spz_grm_<species>`
      // WMS layer ON at mount. See `applySpeciesVisibility` (exported and
      // unit-tested in TreeLayersControl.test.tsx).
      const profileOverlays = applySpeciesVisibility(profile.overlays, speciesCode);

      // Build overlay layers (one Leaflet layer per registry entry)
      const overlaysById = new Map<string, { overlay: SparMapOverlayLayer; layer: L.Layer }>();
      profileOverlays.forEach((overlay) => {
        try {
          const layer = buildLeafletLayer(overlay, speciesCode);
          overlaysById.set(overlay.id, { overlay, layer });
        } catch (err) {
          // Skip overlays we can't build (e.g. unknown renderMode); log once
          // eslint-disable-next-line no-console
          console.warn(`TreeLayersControl: failed to build layer for ${overlay.id}`, err);
        }
      });

      // Mount default-visible overlays
      overlaysById.forEach(({ overlay, layer }) => {
        if (overlay.visible) layer.addTo(map);
      });

      // The plugin's `L.control.layers.tree(baseTree, overlayTree, ...)`
      // expects a SINGLE root TreeObject for each tree, not an array.
      // Wrap our base + overlay lists in an unlabelled root node whose
      // `children` are the real entries the user sees in the panel.
      const baseTree: L.Control.Layers.TreeObject = {
        label: '',
        children: baseEntries.map((e) => ({ label: e.name, layer: e.layer }))
      };
      const overlayTree: L.Control.Layers.TreeObject = {
        label: '',
        children: LEGACY_PANEL_GROUPS
          .map((group) => buildOverlayTreeNode(group, overlaysById))
          .filter((node): node is L.Control.Layers.TreeObject => node !== null)
      };

      const control = L.control.layers.tree(baseTree, overlayTree, {
        position: 'topright',
        // Panel collapsed by default behind the stacked-paper icon.
        // Leaflet's default `collapsed: true` binds mouseenter/mouseleave
        // on the container so the panel opens on hover; we override
        // that below to require a click instead, matching the sibling
        // Legend icon and the legacy CWM behaviour.
        collapsed: true,
        namedToggle: false,
        selectorBack: false,
        closedSymbol: '▸',
        openedSymbol: '▾'
      }).addTo(map);
      controlRef.current = control;

      // Replace hover-to-expand with click-to-toggle. Leaflet's
      // `L.Control.Layers._initLayout()` attaches mouseenter/mouseleave
      // on the container when `collapsed: true`; strip those and wire a
      // click handler on the toggle link instead. Without `fn`,
      // `L.DomEvent.off(el, eventName)` removes ALL listeners for that
      // event — exactly what we need to wipe Leaflet's defaults.
      const container = control.getContainer();
      const toggle = container?.querySelector(
        '.leaflet-control-layers-toggle'
      ) as HTMLAnchorElement | null;
      if (container && toggle) {
        // Make the panel click-to-toggle instead of hover-to-expand
        // (matches the sibling Legend icon + legacy CWM behaviour).
        // Leaflet's `_initLayout` attaches TWO sets of listeners:
        // 1. On the container: `mouseenter: _expandSafely, mouseleave: collapse`
        // 2. On the toggle link: `click: preventDefault + _expandSafely`,
        //    `keydown: Enter → _expandSafely`
        // Wipe BOTH with the single-argument `off()` (which clears all
        // listeners on the element by deleting `obj[eventsKey]`), then
        // add our own click handler on the link. The `map.on('click',
        // collapse)` map-level dismiss listener stays — clicking the
        // map outside the control still closes it.
        L.DomEvent.off(container);
        L.DomEvent.off(toggle);
        L.DomEvent.on(toggle, 'click', (event) => {
          L.DomEvent.preventDefault(event);
          L.DomEvent.stopPropagation(event);
          if (container.classList.contains('leaflet-control-layers-expanded')) {
            control.collapse();
          } else {
            control.expand();
          }
        });
      }

      return () => {
        control.remove();
        controlRef.current = null;
        overlaysById.forEach(({ layer }) => {
          if (map.hasLayer(layer)) map.removeLayer(layer);
        });
        baseEntries.forEach((e) => {
          if (map.hasLayer(e.layer)) map.removeLayer(e.layer);
        });
      };
    }, [map, theme, speciesCode]);

    return null;
  }
);

TreeLayersControl.displayName = 'TreeLayersControl';

export default TreeLayersControl;
