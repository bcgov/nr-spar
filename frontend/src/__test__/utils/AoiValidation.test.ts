import type { AoiPolygon } from '../../types/SparMapTypes';
import {
  buildLegacyMultiBecZoneMessage,
  buildMultiPolygonFeature,
  validateAoiPolygons,
  validatePolygons,
  validateSingleBecZone
} from '../../views/Seedlot/SeedlotMap/AoiToolbar/aoiValidation';

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

    it('combines multiple polygons into one MultiPolygon', () => {
      const feature = buildMultiPolygonFeature([squarePolygon(), squarePolygon(0.01)]);
      expect(feature!.geometry.coordinates).toHaveLength(2);
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
