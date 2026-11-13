import booleanValid from '@turf/boolean-valid';
import distance from '@turf/distance';
import { featureCollection, point } from '@turf/helpers';
import union from '@turf/union';
import type {
  Feature, MultiPolygon, Polygon, Position
} from 'geojson';

import { fetchBecZonesIntersecting } from '../../../../api-service/becZonesApi';
import type { AoiPolygon } from '../../../../types/SparMapTypes';
import {
  MAX_COLLECTION_RADIUS_KM,
  MAX_COLLECTION_VERTICES
} from '../collectionAreaLimits';

export interface ValidationResult {
  ok: boolean;
  message: string;
}

export interface BecValidationResult extends ValidationResult {
  becZones: string[];
}

export type FetchBecZones = (
  feature: Feature<MultiPolygon>
) => Promise<string[]>;

export const buildLegacyMultiBecZoneMessage = (becZones: string[]) => `You have drawn an invalid polygon. Geometry crosses more than one BEC Zone: ${becZones.join(' ')}`;

export const collectionVertexCount = (aois: AoiPolygon[]): number => (
  aois.reduce(
    (sum, aoi) => sum + aoi.geometry.coordinates.reduce(
      (ringSum, ring) => ringSum + ring.length,
      0
    ),
    0
  )
);

/** Every vertex across all polygons and rings, as `[lng, lat]`. */
const allVertices = (aois: AoiPolygon[]): Position[] => (
  aois.flatMap((aoi) => aoi.geometry.coordinates.flat())
);

/**
 * Longest straight-line distance between any two vertices, in kilometres —
 * an edge, a diagonal, or the span between two separate polygons, whichever
 * is greatest.
 *
 * The winning pair is found with a planar approximation (longitude scaled by
 * cos(latitude)) so the O(n²) scan stays cheap at the 2000-vertex cap
 */
export const longestChordKm = (coords: Position[]): number => {
  if (coords.length < 2) {
    return 0;
  }
  const meanLat = coords.reduce((sum, [, lat]) => sum + lat, 0) / coords.length;
  const lngScale = Math.cos((meanLat * Math.PI) / 180);

  let bestFrom = coords[0];
  let bestTo = coords[1];
  let bestSq = -1;
  for (let i = 0; i < coords.length; i += 1) {
    for (let j = i + 1; j < coords.length; j += 1) {
      const dx = (coords[i][0] - coords[j][0]) * lngScale;
      const dy = coords[i][1] - coords[j][1];
      const sq = (dx * dx) + (dy * dy);
      if (sq > bestSq) {
        bestSq = sq;
        bestFrom = coords[i];
        bestTo = coords[j];
      }
    }
  }
  return distance(point(bestFrom), point(bestTo), { units: 'kilometers' });
};

/**
 * Radius of the collection area: half its longest chord.
 *
 * This is the business definition — take the longest measurement across the
 * area, whether that falls along an edge or corner to corner, and halve it.
 */
export const collectionRadiusKm = (aois: AoiPolygon[]): number => (
  longestChordKm(allVertices(aois)) / 2
);

/** Same measure for a geometry that has already been combined. */
export const featureRadiusKm = (feature: Feature<MultiPolygon>): number => (
  longestChordKm(feature.geometry.coordinates.flat(2) as Position[]) / 2
);

/** Wrap coordinates as a `Feature<MultiPolygon>` with empty properties. */
const multiPolygonFeature = (coordinates: Position[][][]): Feature<MultiPolygon> => ({
  type: 'Feature',
  geometry: { type: 'MultiPolygon', coordinates },
  properties: {}
});

/**
 * Combine the user's AOIs into a single MultiPolygon GeoJSON Feature
 * suitable for the backend save endpoint.
 *
 * Overlapping polygons are dissolved rather than concatenated. Concatenating
 * leaves the shared region present in two parts, which `@turf/area` and
 * PostGIS `ST_Area(g::geography)` both count twice — inflating the reported
 * area and the derived radius — and produces a MultiPolygon that is invalid
 * under OGC rules, since parts may not have overlapping interiors. Legacy did
 * the same dissolve server-side in `processMultiPoly`.
 *
 * Returns `null` when the input list is empty so call-sites can gate submit
 * affordances on the presence of drawn polygons. A single polygon is wrapped
 * in a 1-element MultiPolygon so the backend always receives the same
 * geometry type (matches the Phase 1 Jackson binding which accepts Polygon OR
 * MultiPolygon but persists to a MultiPolygon column).
 */
export const buildMultiPolygonFeature = (
  aois: AoiPolygon[]
): Feature<MultiPolygon> | null => {
  if (aois.length === 0) return null;
  if (aois.length === 1) {
    return multiPolygonFeature([aois[0].geometry.coordinates]);
  }

  // union() can return null, and throws on some near-coincident edges. Falling
  // back to concatenation keeps submit working; the area is then overstated for
  // overlaps, which beats blocking the user entirely.
  let dissolved: Feature<Polygon | MultiPolygon> | null = null;
  try {
    dissolved = union(featureCollection(aois));
  } catch {
    dissolved = null;
  }
  if (!dissolved) {
    return multiPolygonFeature(aois.map((a) => a.geometry.coordinates));
  }
  if (dissolved.geometry.type === 'Polygon') {
    return multiPolygonFeature([dissolved.geometry.coordinates]);
  }
  return multiPolygonFeature(dissolved.geometry.coordinates);
};

/**
 * Client-side validation for the multi-polygon AOI. Replaces the legacy
 * server-side `Spr01SeedlotRegAction.validatePolygons` flow which checked
 * topology via JTS `isValid()` in `processMultiPoly`.
 *
 * Each polygon must be topologically valid (no self-intersection, no
 * duplicate vertices, closed ring). If any single polygon is invalid the
 * whole list is rejected and the user is asked to redraw.
 *
 * Per the legacy JSP contract overlapping polygons are allowed, and
 * `buildMultiPolygonFeature` dissolves the overlap so shared ground is not
 * measured twice. Vertex count and radius are therefore checked on the
 * dissolved geometry — union can add vertices where edges cross, so checking
 * the raw input would validate a different shape than the one we store.
 */
export const validatePolygons = (aois: AoiPolygon[]): ValidationResult => {
  if (aois.length === 0) {
    return {
      ok: false,
      message: 'No polygons to validate. Draw at least one polygon first.'
    };
  }
  if (aois.some((aoi) => !booleanValid(aoi))) {
    return {
      ok: false,
      message:
        'One or more polygons have invalid geometry (self-intersecting or degenerate). Edit or redraw the affected polygon.'
    };
  }
  // Measure what we will actually store, not the raw input.
  const combined = buildMultiPolygonFeature(aois);
  if (!combined) {
    return {
      ok: false,
      message: 'Could not combine the drawn polygons. Edit or redraw them and try again.'
    };
  }
  const vertexCount = combined.geometry.coordinates.flat(2).length;
  if (vertexCount > MAX_COLLECTION_VERTICES) {
    return {
      ok: false,
      message:
        `Polygons have too many vertices (${vertexCount}). `
        + `Maximum is ${MAX_COLLECTION_VERTICES}. Simplify and try again.`
    };
  }
  const radiusKm = featureRadiusKm(combined);
  if (radiusKm > MAX_COLLECTION_RADIUS_KM) {
    return {
      ok: false,
      message:
        `Collection area cannot span more than ${MAX_COLLECTION_RADIUS_KM} km radius `
        + `(this one is ${radiusKm.toFixed(1)} km). Shrink the polygon and try again.`
    };
  }
  return {
    ok: true,
    message: `Validated ${aois.length} polygon${aois.length === 1 ? '' : 's'}.`
  };
};

/**
 * Legacy SPAR rejected collection polygons when the geometry intersected
 * more than one BEC zone. The Struts action built the message by joining
 * zone codes with spaces:
 *
 * "You have drawn an invalid polygon. Geometry crosses more than one BEC Zone: IDF MH"
 *
 * Keep that user-facing text intact so the Leaflet rewrite matches the
 * original behavior.
 */
export const validateSingleBecZone = async (
  feature: Feature<MultiPolygon>,
  fetchBecZones: FetchBecZones = fetchBecZonesIntersecting
): Promise<BecValidationResult> => {
  let becZones: string[];
  try {
    becZones = await fetchBecZones(feature);
  } catch {
    return {
      ok: false,
      message:
        'Unable to validate BEC Zone for the polygon. Try again before submitting.',
      becZones: []
    };
  }

  if (becZones.length > 1) {
    return {
      ok: false,
      message: buildLegacyMultiBecZoneMessage(becZones),
      becZones
    };
  }

  return {
    ok: true,
    message: 'Polygons Validated.',
    becZones
  };
};

/**
 * Full Validate button flow: local geometry validation first, then the
 * legacy single-BEC-zone rule against the combined multipolygon.
 */
export const validateAoiPolygons = async (
  aois: AoiPolygon[],
  fetchBecZones: FetchBecZones = fetchBecZonesIntersecting
): Promise<BecValidationResult> => {
  const polygonResult = validatePolygons(aois);
  if (!polygonResult.ok) {
    return {
      ...polygonResult,
      becZones: []
    };
  }

  const feature = buildMultiPolygonFeature(aois);
  if (!feature) {
    return {
      ok: false,
      message: 'No polygons to validate. Draw at least one polygon first.',
      becZones: []
    };
  }

  return validateSingleBecZone(feature, fetchBecZones);
};

export const assertSingleBecZone = async (
  feature: Feature<MultiPolygon>,
  fetchBecZones: FetchBecZones = fetchBecZonesIntersecting
): Promise<string[]> => {
  const result = await validateSingleBecZone(feature, fetchBecZones);
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.becZones;
};
