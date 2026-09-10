import booleanValid from '@turf/boolean-valid';
import distance from '@turf/distance';
import { point } from '@turf/helpers';
import type { Feature, MultiPolygon } from 'geojson';

import { fetchBecZonesIntersecting } from '../../../../api-service/becZonesApi';
import type { AoiPolygon } from '../../../../types/SparMapTypes';
import {
  MAX_COLLECTION_EXTENT_KM,
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

/**
 * Client-side validation for the multi-polygon AOI. Replaces the legacy
 * server-side `Spr01SeedlotRegAction.validatePolygons` flow which checked
 * topology via JTS `isValid()` in `processMultiPoly`.
 *
 * Each polygon must be topologically valid (no self-intersection, no
 * duplicate vertices, closed ring). If any single polygon is invalid the
 * whole list is rejected and the user is asked to redraw.
 *
 * Note: per the legacy JSP contract, overlapping polygons are allowed —
 * the server unioned them together in `processMultiPoly`. Since turf's
 * MultiPolygon GeoJSON form is what the backend ultimately persists, we
 * leave the union to the save layer (`buildMultiPolygonFeature`) and just
 * verify each input ring individually here.
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
  const vertexCount = collectionVertexCount(aois);
  if (vertexCount > MAX_COLLECTION_VERTICES) {
    return {
      ok: false,
      message:
        `Polygons have too many vertices (${vertexCount}). `
        + `Maximum is ${MAX_COLLECTION_VERTICES}. Simplify and try again.`
    };
  }
  const extentKm = collectionExtentKm(aois);
  if (extentKm > MAX_COLLECTION_EXTENT_KM) {
    return {
      ok: false,
      message:
        `Collection area cannot span more than ${MAX_COLLECTION_RADIUS_KM} km radius. `
        + 'Shrink the polygon and try again.'
    };
  }
  return {
    ok: true,
    message: `Validated ${aois.length} polygon${aois.length === 1 ? '' : 's'}.`
  };
};

export const collectionVertexCount = (aois: AoiPolygon[]): number => (
  aois.reduce(
    (sum, aoi) => sum + aoi.geometry.coordinates.reduce(
      (ringSum, ring) => ringSum + ring.length,
      0
    ),
    0
  )
);

/** Longest geodesic side of the combined envelope, in kilometres. */
export const collectionExtentKm = (aois: AoiPolygon[]): number => {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  aois.forEach((aoi) => {
    aoi.geometry.coordinates.forEach((ring) => {
      ring.forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng);
        minLat = Math.min(minLat, lat);
        maxLng = Math.max(maxLng, lng);
        maxLat = Math.max(maxLat, lat);
      });
    });
  });
  if (!Number.isFinite(minLng)) {
    return 0;
  }
  const units = { units: 'kilometers' as const };
  const south = distance(point([minLng, minLat]), point([maxLng, minLat]), units);
  const north = distance(point([minLng, maxLat]), point([maxLng, maxLat]), units);
  const height = distance(point([minLng, minLat]), point([minLng, maxLat]), units);
  return Math.max(south, north, height);
};

/**
 * Combine the user's AOIs into a single MultiPolygon GeoJSON Feature
 * suitable for the backend save endpoint.
 *
 * Returns `null` when the input list is empty so call-sites can gate
 * submit affordances on the presence of drawn polygons. When there is a
 * single polygon, it is wrapped in a 1-element MultiPolygon so the
 * backend always receives the same geometry type (matches the Phase 1
 * Jackson binding which accepts Polygon OR MultiPolygon but persists to
 * a MultiPolygon column).
 */
export const buildMultiPolygonFeature = (
  aois: AoiPolygon[]
): Feature<MultiPolygon> | null => {
  if (aois.length === 0) return null;
  return {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: aois.map((a) => a.geometry.coordinates)
    },
    properties: {}
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
