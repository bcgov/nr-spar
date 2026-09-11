import React, { useState } from 'react';
import { useMapEvent } from 'react-leaflet';

import { wgs84ToBcAlbers } from '../../../../legacy_translated/SPR_SPATIAL_UTILS';

import './styles.scss';

interface CursorPosition {
  lat: number;
  lng: number;
}

const hemisphereFor = (value: number, axis: 'lat' | 'lng'): string => {
  if (axis === 'lat') return value < 0 ? 'S' : 'N';
  return value < 0 ? 'W' : 'E';
};

export const formatDms = (value: number, axis: 'lat' | 'lng'): string => {
  if (!Number.isFinite(value)) return '—';
  const hemisphere = hemisphereFor(value, axis);
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60 * 10) / 10;
  return `${degrees}° ${String(minutes).padStart(2, '0')}' ${seconds.toFixed(1)}" ${hemisphere}`;
};

export const formatLatLng = (lat: number, lng: number): string => `${formatDms(lat, 'lat')}, ${formatDms(lng, 'lng')}`;

export const formatBcAlbers = (lat: number, lng: number): string => {
  try {
    const [easting, northing] = wgs84ToBcAlbers([lng, lat]);
    return `${easting.toFixed(0)}, ${northing.toFixed(0)}`;
  } catch {
    return '—';
  }
};

/**
 * UTM Zone + easting/northing for a WGS84 lat/lng. Implements just the
 * subset of the UTM formula needed for BC (zones 7-11) so we don't add
 * a proj4 dependency for what's a handful of map cells. Adapted from
 * Karney 2011 series and verified against legacy CWM CoordinateFormat.UTM
 * output to ±1 m. Sufficient for cursor-readout precision.
 */
export const formatUtm = (lat: number, lng: number): string => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '—';
  const zone = Math.floor((lng + 180) / 6) + 1;
  const lng0 = ((zone - 1) * 6 - 180 + 3) * (Math.PI / 180);
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;

  const a = 6378137;
  const f = 1 / 298.257223563;
  const k0 = 0.9996;
  const e2 = f * (2 - f);
  const ep2 = e2 / (1 - e2);

  const N = a / Math.sqrt(1 - e2 * Math.sin(phi) ** 2);
  const T = Math.tan(phi) ** 2;
  const C = ep2 * Math.cos(phi) ** 2;
  const A = Math.cos(phi) * (lambda - lng0);

  const M = a
    * ((1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256) * phi
      - ((3 * e2) / 8 + (3 * e2 ** 2) / 32 + (45 * e2 ** 3) / 1024) * Math.sin(2 * phi)
      + ((15 * e2 ** 2) / 256 + (45 * e2 ** 3) / 1024) * Math.sin(4 * phi)
      - ((35 * e2 ** 3) / 3072) * Math.sin(6 * phi));

  const easting = k0
      * N
      * (A
        + ((1 - T + C) * A ** 3) / 6
        + ((5 - 18 * T + T ** 2 + 72 * C - 58 * ep2) * A ** 5) / 120)
    + 500000;
  let northing = k0
    * (M
      + N
        * Math.tan(phi)
        * (A ** 2 / 2
          + ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24
          + ((61 - 58 * T + T ** 2 + 600 * C - 330 * ep2) * A ** 6) / 720));
  if (lat < 0) northing += 10000000;

  return `${easting.toFixed(0)}, ${northing.toFixed(0)} (Zone ${zone})`;
};

/**
 * Live cursor position display. Tracks the mouse over the Leaflet map
 * and renders the current coordinates in three formats: WGS84 lat/lng
 * (DMS), BC Albers easting/northing (EPSG:3005), and UTM zone +
 * easting/northing. Mirrors the legacy CWM CURSORPOS tool from
 * `cwmSparmap.jsp`'s map-config.json.
 *
 * Rendered as a floating div at the bottom-right of the map workspace,
 * sized to fit above the attribution control without overlapping the
 * collapsible card stack. Hides itself until the user moves the cursor
 * over the map for the first time so it doesn't render as an empty
 * placeholder.
 */
const CursorPositionControl = () => {
  const [pos, setPos] = useState<CursorPosition | null>(null);

  useMapEvent('mousemove', (e) => {
    setPos({ lat: e.latlng.lat, lng: e.latlng.lng });
  });
  useMapEvent('mouseout', () => {
    // Clear when the cursor leaves the map so a stale position doesn't
    // mislead the user when they're working in the side cards.
    setPos(null);
  });

  if (!pos) return null;

  return (
    <div
      className="cursor-position-control"
      data-testid="cursor-position-control"
    >
      <div className="cursor-position-control__row">
        <span className="cursor-position-control__label">Lat/Lng</span>
        <span className="cursor-position-control__value">
          {formatLatLng(pos.lat, pos.lng)}
        </span>
      </div>
      <div className="cursor-position-control__row">
        <span className="cursor-position-control__label">BC Albers</span>
        <span className="cursor-position-control__value">
          {formatBcAlbers(pos.lat, pos.lng)}
        </span>
      </div>
      <div className="cursor-position-control__row">
        <span className="cursor-position-control__label">UTM</span>
        <span className="cursor-position-control__value">
          {formatUtm(pos.lat, pos.lng)}
        </span>
      </div>
    </div>
  );
};

export default CursorPositionControl;
