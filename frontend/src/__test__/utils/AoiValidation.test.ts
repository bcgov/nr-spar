import area from '@turf/area';

import type { AoiPolygon } from '../../types/SparMapTypes';
import {
  buildLegacyMultiBecZoneMessage,
  buildMultiPolygonFeature,
  collectionRadiusKm,
  validateAoiPolygons,
  validatePolygons,
  validateSingleBecZone
} from '../../views/Seedlot/SeedlotMap/AoiToolbar/aoiValidation';
import { MAX_COLLECTION_RADIUS_KM } from '../../views/Seedlot/SeedlotMap/collectionAreaLimits';

const squarePolygon = (lngOffset = 0): AoiPolygon => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [-123.02 + lngOffset, 49.00],
      [-123.00 + lngOffset, 49.00],
      [-123.00 + lngOffset, 49.01],
      [-123.02 + lngOffset, 49.01],
      [-123.02 + lngOffset, 49.00]
    ]]
  }
});

/** Degenerate ring (not closed / too few positions) — fails turf booleanValid. */
const invalidPolygon = (): AoiPolygon => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [0, 0],
      [1, 0],
      [0, 0]
    ]]
  }
});

describe('aoiValidation', () => {
  describe('validatePolygons', () => {
    it('rejects an empty list', () => {
      const result = validatePolygons([]);
      expect(result.ok).toBe(false);
      expect(result.message).toMatch(/No polygons/i);
    });

    it('accepts a single valid polygon', () => {
      const result = validatePolygons([squarePolygon()]);
      expect(result.ok).toBe(true);
      expect(result.message).toMatch(/1 polygon\b/);
    });

    it('accepts multiple valid polygons', () => {
      const result = validatePolygons([squarePolygon(), squarePolygon(0.01)]);
      expect(result.ok).toBe(true);
      expect(result.message).toMatch(/2 polygons/);
    });

    it('rejects invalid geometry', () => {
      const result = validatePolygons([invalidPolygon()]);
      expect(result.ok).toBe(false);
      expect(result.message).toMatch(/invalid geometry/i);
    });

    it('rejects a polygon larger than the 8 km radius', () => {
      const huge: AoiPolygon = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-123, 49],
            [-122, 49],
            [-122, 50],
            [-123, 50],
            [-123, 49]
          ]]
        }
      };
      const result = validatePolygons([huge]);
      expect(result.ok).toBe(false);
      expect(result.message).toMatch(/8 km radius/i);
    });
  });

  describe('buildMultiPolygonFeature', () => {
    it('returns null for an empty list', () => {
      expect(buildMultiPolygonFeature([])).toBeNull();
    });

    it('wraps one polygon as a one-part MultiPolygon', () => {
      const feature = buildMultiPolygonFeature([squarePolygon()]);
      expect(feature).not.toBeNull();
      expect(feature!.geometry.type).toBe('MultiPolygon');
      expect(feature!.geometry.coordinates).toHaveLength(1);
    });

    it('keeps disjoint polygons as separate parts', () => {
      const feature = buildMultiPolygonFeature([squarePolygon(), squarePolygon(0.5)]);
      expect(feature!.geometry.coordinates).toHaveLength(2);
    });

    it('dissolves overlapping polygons so shared ground is not counted twice', () => {
      // squarePolygon(0.01) starts halfway across squarePolygon(), so the two
      // share half their ground. Concatenating would report 1.5x the real area.
      const overlapping = buildMultiPolygonFeature([squarePolygon(), squarePolygon(0.01)])!;
      expect(overlapping.geometry.coordinates).toHaveLength(1);

      const oneSquare = area(buildMultiPolygonFeature([squarePolygon()])!);
      expect(area(overlapping) / oneSquare).toBeCloseTo(1.5, 2);
    });
  });

  describe('collectionRadiusKm', () => {
    it('halves the longest diagonal, not an equal-area circle', () => {
      // 0.02 deg of longitude at 49N is ~1.46 km, 0.01 deg of latitude ~1.11 km,
      // so the corner-to-corner diagonal is ~1.84 km and the radius ~0.92 km.
      expect(collectionRadiusKm([squarePolygon()])).toBeCloseTo(0.92, 1);
    });

    it('measures across separate polygons, not just within one', () => {
      const spread = collectionRadiusKm([squarePolygon(), squarePolygon(0.5)]);
      expect(spread).toBeGreaterThan(collectionRadiusKm([squarePolygon()]) * 10);
    });

    it('returns 0 for no polygons', () => {
      expect(collectionRadiusKm([])).toBe(0);
    });

    it('is driven by the longest span even when the area is small', () => {
      // A long, thin sliver: tiny area, but it reaches far enough to break the
      // 8 km rule. An equal-area circle would have called this well under 1 km.
      const sliver: AoiPolygon = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-123.0, 49.0],
            [-122.6, 49.0],
            [-122.6, 49.0005],
            [-123.0, 49.0005],
            [-123.0, 49.0]
          ]]
        }
      };
      expect(collectionRadiusKm([sliver])).toBeGreaterThan(MAX_COLLECTION_RADIUS_KM);
      expect(validatePolygons([sliver]).ok).toBe(false);
    });
  });

  describe('validateSingleBecZone', () => {
    it('fails when more than one BEC zone intersects', async () => {
      const feature = buildMultiPolygonFeature([squarePolygon()])!;
      const result = await validateSingleBecZone(feature, async () => ['IDF', 'MH']);
      expect(result.ok).toBe(false);
      expect(result.message).toBe(buildLegacyMultiBecZoneMessage(['IDF', 'MH']));
      expect(result.becZones).toEqual(['IDF', 'MH']);
    });

    it('passes with a single zone', async () => {
      const feature = buildMultiPolygonFeature([squarePolygon()])!;
      const result = await validateSingleBecZone(feature, async () => ['IDF']);
      expect(result.ok).toBe(true);
      expect(result.becZones).toEqual(['IDF']);
    });

    it('fails soft when the BEC lookup throws', async () => {
      const feature = buildMultiPolygonFeature([squarePolygon()])!;
      const result = await validateSingleBecZone(feature, async () => {
        throw new Error('network');
      });
      expect(result.ok).toBe(false);
      expect(result.message).toMatch(/Unable to validate BEC/i);
      expect(result.becZones).toEqual([]);
    });
  });

  describe('validateAoiPolygons', () => {
    it('short-circuits on invalid geometry before calling BEC', async () => {
      const fetchBec = vi.fn(async () => ['IDF']);
      const result = await validateAoiPolygons([invalidPolygon()], fetchBec);
      expect(result.ok).toBe(false);
      expect(fetchBec).not.toHaveBeenCalled();
    });

    it('runs BEC check after geometry passes', async () => {
      const fetchBec = vi.fn(async () => ['CWH']);
      const result = await validateAoiPolygons([squarePolygon()], fetchBec);
      expect(result.ok).toBe(true);
      expect(fetchBec).toHaveBeenCalledOnce();
      expect(result.becZones).toEqual(['CWH']);
    });
  });
});
