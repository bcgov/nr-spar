import type { Feature, MultiPolygon } from 'geojson';

export interface MeanLatLng {
  lat: number;
  lng: number;
}

/**
 * Vertices used for the mean, excluding each ring's closing duplicate.
 * GeoJSON rings repeat the first point as the last; counting it would
 * drag the mean toward whichever corner happens to start the ring.
 */
const uniqueRingVertices = (feature: Feature<MultiPolygon>): Array<[number, number]> => {
  const out: Array<[number, number]> = [];
  feature.geometry.coordinates.forEach((polygon) => {
    polygon.forEach((ring) => {
      if (ring.length === 0) {
        return;
      }
      const last = ring.length - 1;
      const closed = ring.length > 1
        && ring[0][0] === ring[last][0]
        && ring[0][1] === ring[last][1];
      const verts = (closed ? ring.slice(0, last) : ring) as Array<[number, number]>;
      out.push(...verts);
    });
  });
  return out;
};

/** Mean of every unique vertex across all polygons/rings — the area's mean lat/long. */
export const meanLatLng = (feature: Feature<MultiPolygon>): MeanLatLng | null => {
  const coords = uniqueRingVertices(feature);
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
export const formatElevationRange = (minM: number, maxM: number): string => `${Math.round(minM)}–${Math.round(maxM)} m`;
