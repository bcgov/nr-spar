import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

import { useSparMap } from '../../../../contexts/SparMapContext';

/**
 * Pick a sensible grid interval (in decimal degrees) for the current
 * Leaflet zoom level. Zoom 0-3 → 30°, 4-5 → 10°, 6-7 → 5°, 8 → 2°,
 * 9-10 → 1°, 11-12 → 0.5°, 13+ → 0.1°.
 *
 * Mirrors the CWM `Leaflet.Graticule` plugin's auto-stepping behaviour
 * loosely — keep the grid density readable without saturating the map
 * with lines.
 */
const intervalForZoom = (zoom: number): number => {
  if (zoom <= 3) return 30;
  if (zoom <= 5) return 10;
  if (zoom <= 7) return 5;
  if (zoom <= 8) return 2;
  if (zoom <= 10) return 1;
  if (zoom <= 12) return 0.5;
  return 0.1;
};

const round = (v: number, step: number): number => Math.floor(v / step) * step;

const hemisphereFor = (value: number, axis: 'lat' | 'lng'): string => {
  if (axis === 'lat') return value < 0 ? 'S' : 'N';
  return value < 0 ? 'W' : 'E';
};

const formatLabel = (value: number, axis: 'lat' | 'lng'): string => {
  const hemisphere = hemisphereFor(value, axis);
  return `${Math.abs(value).toFixed(0)}° ${hemisphere}`;
};

/**
 * Lat/lng graticule overlay. Mirrors the legacy CWM GRATICULE tool from
 * `cwmSparmap.jsp` map-config.json — a togglable grid of horizontal and
 * vertical lines at sensible degree intervals, with axis labels at the
 * top/left edges.
 *
 * Self-managed L.LayerGroup added to the map directly (not registered
 * with Geoman or LayersControl) so it never interferes with the AOI
 * draw/edit flow or the layer panel state. Recomputed on every
 * `moveend`/`zoomend` so the grid stays visible as the user pans/zooms.
 *
 * Visibility is driven by `graticuleVisible` in `SparMapContext` — the
 * AOI toolbar GRATICULE button flips that flag.
 */
const GraticuleLayer = () => {
  const map = useMap();
  const { graticuleVisible } = useSparMap();
  const groupRef = useRef<L.LayerGroup>(L.layerGroup());

  useEffect(() => {
    const group = groupRef.current;
    if (!map) return undefined;

    const redraw = () => {
      group.clearLayers();
      if (!graticuleVisible) return;

      const bounds = map.getBounds();
      const zoom = map.getZoom();
      const step = intervalForZoom(zoom);

      const south = round(bounds.getSouth(), step) - step;
      const north = round(bounds.getNorth(), step) + step;
      const west = round(bounds.getWest(), step) - step;
      const east = round(bounds.getEast(), step) + step;

      const lineStyle: L.PolylineOptions = {
        color: '#444444',
        weight: 1,
        opacity: 0.85,
        dashArray: '4 4',
        interactive: false,
        // Force SVG rendering so the lines are visible on top of the
        // basemap regardless of the MapContainer's `preferCanvas`
        // setting. With canvas, faint thin lines blend into terrain
        // tiles and the grid is effectively invisible. SVG honors the
        // dashArray + opacity cleanly.
        renderer: L.svg()
      };

      // Horizontal lines (constant latitude)
      for (let lat = south; lat <= north; lat += step) {
        const line = L.polyline(
          [
            [lat, west],
            [lat, east]
          ],
          lineStyle
        );
        line.bindTooltip(formatLabel(lat, 'lat'), {
          permanent: true,
          direction: 'right',
          offset: [0, 0],
          className: 'spar-graticule-label'
        });
        group.addLayer(line);
      }

      // Vertical lines (constant longitude)
      for (let lng = west; lng <= east; lng += step) {
        const line = L.polyline(
          [
            [south, lng],
            [north, lng]
          ],
          lineStyle
        );
        line.bindTooltip(formatLabel(lng, 'lng'), {
          permanent: true,
          direction: 'top',
          offset: [0, 0],
          className: 'spar-graticule-label'
        });
        group.addLayer(line);
      }
    };

    if (graticuleVisible) {
      group.addTo(map);
      redraw();
      map.on('moveend zoomend', redraw);
    }

    return () => {
      map.off('moveend zoomend', redraw);
      group.clearLayers();
      map.removeLayer(group);
    };
  }, [map, graticuleVisible]);

  return null;
};

export default GraticuleLayer;
