import type { Feature, MultiPolygon } from 'geojson';

export interface MeanLatLng {
  lat: number;
  lng: number;
}

/** Mean of every vertex across all polygons/rings — the area's mean lat/long. */
export const meanLatLng = (feature: Feature<MultiPolygon>): MeanLatLng | null => {
  const coords = feature.geometry.coordinates.flat(2) as Array<[number, number]>;
  if (coords.length === 0) {
    return null;
  }
  const [sumLng, sumLat] = coords.reduce(
    ([accLng, accLat], [lng, lat]) => [accLng + lng, accLat + lat],
    [0, 0]
  );
  return { lat: sumLat / coords.length, lng: sumLng / coords.length };
};

/** Format mean lat/long as decimal degrees, e.g. "48.5540, -123.4560". */
export const formatLatLng = (m: MeanLatLng): string => `${m.lat.toFixed(4)}, ${m.lng.toFixed(4)}`;

/** Format an elevation band as e.g. "310–540 m" (en dash, rounded). */
export const formatElevationRange = (minM: number, maxM: number): string =>
  `${Math.round(minM)}–${Math.round(maxM)} m`;
