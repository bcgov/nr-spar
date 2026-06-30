import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { useSparMap } from '../../../../contexts/SparMapContext';
import type { AoiPolygon } from '../../../../types/SparMapTypes';
import { fetchCollectionAreaBySeedlotNumber } from '../../../../api-service/collectionAreaApi';
import { validatePolygons } from '../AoiToolbar/aoiValidation';
import { LEGACY_AOI_STYLE } from './styles';

/**
 * Minimal structural type for a Geoman-tracked Leaflet layer. We only
 * touch `toGeoJSON()` (to extract the GeoJSON Feature for context state)
 * and `remove()` (to detach the layer from the map when Clear All runs).
 *
 * Keeping this a standalone interface (instead of extending Leaflet's
 * `Layer` class) sidesteps a variance mismatch: `Layer.remove()` returns
 * `this`, which conflicts with the geoman typing of `void`. `getGeomanLayers()`
 * returns `Layer[]`, so we narrow via `as unknown as GeomanLayerLike[]`
 * at the call sites.
 */
interface GeomanLayerLike {
  toGeoJSON: () => AoiPolygon;
  remove: () => void;
}

interface PmCreateEvent {
  layer: GeomanLayerLike;
}

const toGeomanLayers = (layers: unknown[]): GeomanLayerLike[] => (
  layers as unknown as GeomanLayerLike[]
);

/**
 * Wraps leaflet-geoman's drawing controls. Mounted inside a react-leaflet
 * MapContainer when the active theme has `drawingEnabled: true` (currently
 * only COLAREA). Listens for Geoman's pm:create / pm:edit / pm:remove
 * events and pushes the resulting GeoJSON into SparMapContext as a
 * multi-polygon list (mirroring the legacy `Sparmap.aoi.*` flow).
 *
 * Also registers `startDraw` / `startEdit` / `clearMapLayers` callbacks
 * on `SparMapContext` so that `<AoiToolbar>` — which renders OUTSIDE the
 * `<MapContainer>` and therefore can't call `useMap()` directly — can
 * trigger Geoman operations through the context bridge.
 *
 * Renders nothing in its own right — it's effectively a side-effect hook.
 */
const AoiDrawLayer = () => {
  const map = useMap();
  const {
    addAoi,
    clearAois,
    setAois,
    _setMapControls,
    setLiveAoiValidation
  } = useSparMap();
  const { seedlotNumber } = useParams<{ seedlotNumber: string }>();
  // Guard against re-running the pre-fetch on every re-render. A ref
  // (not state) keeps the flag stable without retriggering effects.
  const preloadedRef = useRef(false);

  useEffect(() => {
    if (!map || !map.pm) {
      // In tests the react-leaflet mock may return a stub map without pm.
      // Nothing to do — the real map always has pm after geoman imports.
      return undefined;
    }

    // The legacy SPAR UI drove draw / edit / clear entirely from the
    // aoi_panel buttons, so we hide Geoman's built-in topright controls
    // and expose the operations through the toolbar instead. Keeping
    // `editMode: false` / `removalMode: false` here means users can still
    // edit via `map.pm.enableGlobalEditMode()` but don't see Geoman's
    // default button strip competing with our Carbon toolbar.
    map.pm.addControls({
      position: 'topright',
      drawPolygon: false,
      drawMarker: false,
      drawPolyline: false,
      drawCircle: false,
      drawRectangle: false,
      drawCircleMarker: false,
      drawText: false,
      editMode: false,
      removalMode: false,
      cutPolygon: false,
      rotateMode: false
    });

    // Style Geoman draw + edit operations with the legacy red/gray AOI
    // colors. `setGlobalOptions` applies the path options to any future
    // draw or edit session; imported polygons get the same style via
    // the explicit `L.polygon(..., LEGACY_AOI_STYLE)` constructor below
    // so the two paths stay visually identical.
    map.pm.setGlobalOptions({
      pathOptions: LEGACY_AOI_STYLE,
      templineStyle: { color: LEGACY_AOI_STYLE.color },
      hintlineStyle: { color: LEGACY_AOI_STYLE.color, dashArray: [5, 5] },
      // Vertex editing in global edit mode: dragging a vertex moves it,
      // and right-clicking a vertex removes it. Set explicitly rather than
      // relying on Geoman's default so vertex-removal stays deterministic
      // across geoman-free versions. Dragging the faint mid-edge markers
      // adds a new vertex (Geoman default, no option needed).
      removeVertexOn: 'contextmenu'
    });

    // Run live topology validation against the current Geoman layer
    // set and push the result into context. Mirrors the legacy SPAR
    // `addPoint` flow which POST'd to the backend after every vertex
    // add to confirm the in-progress polygon was still valid. We use
    // the existing `validatePolygons` (turf booleanValid) so the rule
    // matches the on-demand Validate button.
    const refreshLiveValidation = (polys: AoiPolygon[]) => {
      if (polys.length === 0) {
        setLiveAoiValidation(null);
        return;
      }
      const result = validatePolygons(polys);
      setLiveAoiValidation(result);
    };

    // On pm:edit we rebuild the full AOI array from the map's Geoman
    // layers. This avoids having to track a layer → index mapping and
    // keeps context state authoritative: whatever is on the map IS the
    // AOI list. Works for drag, vertex add, and vertex delete alike.
    const rebuildFromMap = (): AoiPolygon[] => {
      const rawLayers = (map.pm?.getGeomanLayers?.() ?? []) as unknown[];
      const layers = toGeomanLayers(rawLayers);
      return layers
        .map((layer) => {
          try {
            return layer.toGeoJSON();
          } catch {
            return null;
          }
        })
        .filter(
          (g): g is AoiPolygon => g !== null && g?.geometry?.type === 'Polygon'
        );
    };

    const handleCreate = (e: PmCreateEvent) => {
      addAoi(e.layer.toGeoJSON());
      // Defer the validation read until after addAoi commits so we see
      // the new polygon in the rebuild.
      queueMicrotask(() => refreshLiveValidation(rebuildFromMap()));
    };

    const handleEdit = () => {
      const rebuilt = rebuildFromMap();
      setAois(rebuilt);
      refreshLiveValidation(rebuilt);
    };

    const handleRemove = () => {
      const rebuilt = rebuildFromMap();
      if (rebuilt.length === 0) {
        clearAois();
      } else {
        setAois(rebuilt);
      }
      refreshLiveValidation(rebuilt);
    };

    map.on('pm:create', handleCreate);
    map.on('pm:edit', handleEdit);
    map.on('pm:remove', handleRemove);

    // Register the map control bridge so AoiToolbar can drive Geoman.
    _setMapControls({
      cancelAoiMode: () => {
        map.pm?.disableDraw?.();
        map.pm?.disableGlobalEditMode?.();
        map.pm?.disableGlobalRemovalMode?.();
      },
      startDraw: () => {
        map.pm?.disableGlobalEditMode?.();
        map.pm?.disableGlobalRemovalMode?.();
        if (map.pm?.enableDraw) {
          map.pm.enableDraw('Polygon');
        }
      },
      startEdit: () => {
        map.pm?.disableDraw?.();
        map.pm?.disableGlobalRemovalMode?.();
        if (map.pm?.enableGlobalEditMode) {
          map.pm.enableGlobalEditMode();
        }
      },
      // Delete a single polygon: enable Geoman global removal mode so the
      // next polygon the user clicks on the map is deleted. Geoman fires
      // pm:remove, which `handleRemove` uses to rebuild the AOI list from
      // the remaining layers. Mutually exclusive with draw + edit.
      startRemovalMode: () => {
        map.pm?.disableDraw?.();
        map.pm?.disableGlobalEditMode?.();
        if (map.pm?.enableGlobalRemovalMode) {
          map.pm.enableGlobalRemovalMode();
        }
      },
      clearMapLayers: () => {
        const rawLayers = (map.pm?.getGeomanLayers?.() ?? []) as unknown[];
        const layers = toGeomanLayers(rawLayers);
        layers.forEach((layer) => {
          try {
            layer.remove();
          } catch {
            // Ignore — layer may already be detached.
          }
        });
      },
      // Clear Last — pop the most recently drawn/imported Geoman layer
      // from the map. Geoman's pm:remove handler (handleRemove above)
      // will rebuild context state from the remaining layers, so we
      // don't also touch context here.
      removeLastMapLayer: () => {
        const rawLayers = (map.pm?.getGeomanLayers?.() ?? []) as unknown[];
        const layers = toGeomanLayers(rawLayers);
        if (layers.length === 0) return;
        const last = layers[layers.length - 1];
        try {
          last.remove();
        } catch {
          // Ignore — layer may already be detached.
        }
        // Direct .remove() calls don't always fire Geoman's pm:remove
        // event, so sync context state explicitly from the post-removal
        // layer list to be safe.
        setAois(rebuildFromMap());
      },
      startDrawRectangle: () => {
        map.pm?.disableGlobalEditMode?.();
        if (map.pm?.enableDraw) {
          map.pm.enableDraw('Rectangle');
        }
      },
      startDrawCircle: () => {
        map.pm?.disableGlobalEditMode?.();
        if (map.pm?.enableDraw) {
          map.pm.enableDraw('Circle');
        }
      },
      startDrawLine: () => {
        map.pm?.disableGlobalEditMode?.();
        if (map.pm?.enableDraw) {
          map.pm.enableDraw('Line');
        }
      },
      // Fit the map to the union bounds of every Geoman layer currently
      // on the map. Mirrors the legacy CWM AOI_ZOOM tool. Walks via
      // `getGeomanLayers()` instead of context state because the toolbar
      // gates on `aois.length` already, and a fresh map.pm read avoids a
      // stale-reference path if context is mid-update.
      zoomToAois: () => {
        const rawLayers = (map.pm?.getGeomanLayers?.() ?? []) as unknown[];
        const leafletLayers = rawLayers.filter(
          (l): l is L.Layer => l !== null && typeof l === 'object' && 'getBounds' in (l as object)
        ) as Array<L.Layer & { getBounds: () => L.LatLngBounds }>;
        if (leafletLayers.length === 0) return;
        const group = L.featureGroup(leafletLayers);
        try {
          map.fitBounds(group.getBounds().pad(0.1));
        } catch {
          // getBounds() can throw for empty/degenerate geometries; let
          // the map stay at its current extent rather than crash.
        }
      },
      // Phase 3: imported polygons must appear on the map as
      // Geoman-editable layers so they survive the handleEdit rebuild
      // (which discards anything `getGeomanLayers()` doesn't return).
      // We build L.Polygon instances directly from the GeoJSON coords
      // because L.geoJSON wraps features in a parent layer that doesn't
      // always register with Geoman cleanly; a bare L.Polygon added to
      // the map is picked up by `map.pm.getGeomanLayers()` out of the
      // box in geoman-free v2.
      addImportedLayersToMap: (polygons: AoiPolygon[]) => {
        if (polygons.length === 0) return;

        const createdLayers: L.Polygon[] = [];
        polygons.forEach((poly) => {
          try {
            // GeoJSON coords are [lng, lat]; Leaflet expects [lat, lng].
            // A Polygon has outer ring + optional holes; map each ring
            // and hand the array of arrays to L.polygon().
            const latlngs = poly.geometry.coordinates.map(
              (ring) => ring.map(([lng, lat]) => L.latLng(lat, lng))
            );
            const leafletPoly = L.polygon(latlngs, LEGACY_AOI_STYLE);
            leafletPoly.addTo(map);
            createdLayers.push(leafletPoly);
          } catch {
            // Skip polygons with bad coordinate shapes; the warning
            // is already surfaced by importShape.ts.
          }
        });

        // Sync context state with the freshly-rebuilt layer list so
        // Validate / Submit / Clear All all see the imported polygons
        // alongside anything drawn manually. This mirrors what
        // handleEdit does after a Geoman edit event.
        setAois(rebuildFromMap());

        // Fit bounds to the new layers so the user isn't left staring
        // at the previous extent after importing shapes from a
        // different region.
        if (createdLayers.length > 0) {
          const group = L.featureGroup(createdLayers);
          try {
            map.fitBounds(group.getBounds().pad(0.1));
          } catch {
            // getBounds() can throw for empty/degenerate inputs; the
            // map will stay at its previous extent which is fine.
          }
        }
      }
    });

    // Pre-load the saved collection-area polygon (if any) for the current
    // seedlot. Mirrors the legacy SPAR `themeColArea` behavior which
    // fetched `SEED_SEEDLOT_COLLECTION_SVW` filtered by SEEDLOT_NUMBER
    // and added the result to the AOI list on map open. The ref-gated
    // single-shot guard avoids re-fetching on every effect re-run.
    if (!preloadedRef.current && seedlotNumber) {
      preloadedRef.current = true;
      let cancelled = false;
      fetchCollectionAreaBySeedlotNumber(seedlotNumber)
        .then((polygons) => {
          if (cancelled) return;
          if (polygons.length === 0) return;
          // Defensive: only pre-load when the map is still empty. If
          // the user has already started drawing, don't clobber their
          // in-progress work with the stored polygon.
          const existing = (map.pm?.getGeomanLayers?.() ?? []) as unknown[];
          if (existing.length > 0) return;
          // Reuse the imported-polygon path so the existing geometry
          // becomes Geoman-editable and joins the `aois` list.
          // Held for a future-extension window-bridge hook (late-arriving controls).
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const ctlBridge = (window as unknown as {
            __aoiBridgeAddImported?: (p: AoiPolygon[]) => void;
          });
          // Inline the imported-layer addition rather than calling
          // through context (which would create a setState-during-effect
          // loop with `addImportedLayersToMap`). The block mirrors the
          // `addImportedLayersToMap` callback body below.
          const createdLayers: L.Polygon[] = [];
          polygons.forEach((poly) => {
            try {
              const latlngs = poly.geometry.coordinates.map(
                (ring) => ring.map(([lng, lat]) => L.latLng(lat, lng))
              );
              const leafletPoly = L.polygon(latlngs, LEGACY_AOI_STYLE);
              leafletPoly.addTo(map);
              createdLayers.push(leafletPoly);
            } catch {
              // Skip degenerate polygons rather than crash the preload.
            }
          });
          setAois(rebuildFromMap());
          if (createdLayers.length > 0) {
            try {
              map.fitBounds(L.featureGroup(createdLayers).getBounds().pad(0.1));
            } catch {
              // getBounds() can throw on degenerate inputs; leave the
              // map at its current extent.
            }
          }
        })
        .catch(() => {
          // Fail silent. The map is still fully usable; the user just
          // has to redraw from scratch if their saved polygon couldn't
          // be fetched. A surfaced error here would be more disruptive
          // than the silent fallback the legacy CWM also had.
        });
      // Cleanup just sets cancelled so the late .then() can no-op.
      // We don't unsubscribe the fetch itself.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-underscore-dangle
      const _cancel = () => { cancelled = true; };
    }

    return () => {
      map.off('pm:create', handleCreate);
      map.off('pm:edit', handleEdit);
      map.off('pm:remove', handleRemove);
      if (map.pm) {
        map.pm.removeControls();
      }
      // Reset the context bridge so a stale reference doesn't outlive us.
      _setMapControls({
        startDraw: () => {},
        startEdit: () => {},
        startRemovalMode: () => {},
        clearMapLayers: () => {},
        cancelAoiMode: null,
        addImportedLayersToMap: () => {},
        removeLastMapLayer: null,
        startDrawRectangle: null,
        startDrawCircle: null,
        startDrawLine: null,
        zoomToAois: null
      });
    };
  }, [
    map,
    addAoi,
    clearAois,
    setAois,
    _setMapControls,
    seedlotNumber,
    setLiveAoiValidation
  ]);

  return null;
};

export default AoiDrawLayer;
