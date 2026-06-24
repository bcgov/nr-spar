import { describe, expect, it, vi } from 'vitest';
import type { Feature, MultiPolygon } from 'geojson';

import {
  buildMultiPolygonFeature,
  validateAoiPolygons,
  validateSingleBecZone
} from '../../../views/Seedlot/SeedlotMap/AoiToolbar/aoiValidation';
import type { AoiPolygon } from '../../../types/SparMapTypes';

const square: AoiPolygon = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [-123, 49],
      [-122, 49],
      [-122, 50],
      [-123, 50],
      [-123, 49]
    ]]
  },
  properties: {}
};

const multipolygon = buildMultiPolygonFeature([square]) as Feature<MultiPolygon>;

describe('AOI validation', () => {
  it('rejects polygons that cross more than one BEC zone with the legacy message', async () => {
    const fetchZones = vi.fn().mockResolvedValue(['IDF', 'MH']);

    const result = await validateSingleBecZone(multipolygon, fetchZones);

    expect(result.ok).toBe(false);
    expect(result.message).toBe(
      'You have drawn an invalid polygon. Geometry crosses more than one BEC Zone: IDF MH'
    );
    expect(result.becZones).toEqual(['IDF', 'MH']);
  });

  it('passes BEC validation when the AOI intersects one BEC zone', async () => {
    const fetchZones = vi.fn().mockResolvedValue(['IDF']);

    const result = await validateAoiPolygons([square], fetchZones);

    expect(result.ok).toBe(true);
    expect(result.message).toBe('Polygons Validated.');
    expect(result.becZones).toEqual(['IDF']);
  });

  it('fails closed when BEC zones cannot be checked', async () => {
    const fetchZones = vi.fn().mockRejectedValue(new Error('WFS GetFeature failed: 503'));

    const result = await validateAoiPolygons([square], fetchZones);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('Unable to validate BEC Zone');
  });
});
